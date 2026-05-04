import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { db } from '@/lib/db'
import { arciumVerifyPaymentProof } from '@/lib/arcium'
import { simulateUSDCTransfer, getUSDCBalance } from '@/lib/solana'
import { getPayPeriod, getNextPayDate } from '@/lib/utils'
import { sendAutoPayrollEmail } from '@/lib/email'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

function getSalaryFromToken(token: string): number {
  try {
    return JSON.parse(Buffer.from(token, 'base64').toString('utf-8')).amount || 0
  } catch { return 0 }
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const today = new Date()
  today.setHours(23, 59, 59, 999)

  // Get all active schedules (one per employer = auto-payroll on/off)
  const schedules = await db.getAllActiveSchedulesDue()
  if (schedules.length === 0) {
    return NextResponse.json({ message: 'No active auto-payroll employers', ran: 0 })
  }

  const results = []

  for (const schedule of schedules) {
    try {
      const employer = await db.getEmployer(schedule.employer_id)
      if (!employer) continue

      // Find employees whose next_pay_date is today or overdue
      const allEmployees = await db.getEmployees(employer.id)
      const dueEmployees = allEmployees.filter(e =>
        e.status === 'active' &&
        e.next_pay_date &&
        new Date(e.next_pay_date) <= today
      )

      if (dueEmployees.length === 0) {
        await db.updateSchedule(schedule.id, {
          last_run_at: new Date().toISOString(),
          last_run_status: 'skipped',
          last_ai_reason: 'No employees are due for payment today.',
        })
        results.push({ employer: employer.company_name, status: 'skipped', reason: 'No employees due' })
        continue
      }

      const totalPayout = dueEmployees.reduce((sum, e) => sum + getSalaryFromToken(e.salary_token), 0)
      const realBalance = employer.wallet_address
        ? await getUSDCBalance(employer.wallet_address)
        : employer.treasury_balance

      // Build employee summary for AI
      const employeeSummary = dueEmployees.map(e =>
        `${e.full_name} (${e.job_role}, ${e.pay_frequency}, $${getSalaryFromToken(e.salary_token).toFixed(2)} USDC, next_pay_date: ${e.next_pay_date})`
      ).join('\n')

      let shouldRun = true
      let aiReason = 'All conditions met — payroll approved.'

      if (schedule.ai_enabled && process.env.ANTHROPIC_API_KEY) {
        const message = await anthropic.messages.create({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 256,
          messages: [{
            role: 'user',
            content: `You are a payroll AI agent for FlashPay. Decide whether to run payroll now.

Company: ${employer.company_name}
Treasury balance: $${realBalance.toFixed(2)} USDC
Total payout needed: $${totalPayout.toFixed(2)} USDC
Employees due for payment:
${employeeSummary}

Respond with JSON only: { "run": true/false, "reason": "one sentence explanation" }
Only block payroll if balance is insufficient or no employees have wallets connected.`,
          }],
        })

        try {
          const text = message.content[0].type === 'text' ? message.content[0].text : ''
          const parsed = JSON.parse(text.replace(/```json\n?|\n?```/g, '').trim())
          shouldRun = parsed.run
          aiReason = parsed.reason
        } catch {
          shouldRun = realBalance >= totalPayout
        }
      } else {
        shouldRun = realBalance >= totalPayout
        if (!shouldRun) {
          aiReason = `Insufficient balance. Need $${totalPayout.toFixed(2)}, have $${realBalance.toFixed(2)}.`
        }
      }

      if (!shouldRun) {
        await db.updateSchedule(schedule.id, {
          last_run_at: new Date().toISOString(),
          last_run_status: 'skipped',
          last_ai_reason: aiReason,
        })
        results.push({ employer: employer.company_name, status: 'skipped', reason: aiReason })
        continue
      }

      // Execute payroll for each due employee
      const paidAt = new Date().toISOString()
      const { start: periodStart, end: periodEnd } = getPayPeriod('monthly')
      let employeesPaid = 0

      for (const emp of dueEmployees) {
        const salaryAmount = getSalaryFromToken(emp.salary_token)
        if (!salaryAmount) continue

        const txResult = await simulateUSDCTransfer({
          fromAddress: employer.wallet_address || 'treasury_wallet',
          toAddress: emp.wallet_address || 'pending_wallet',
          amount: salaryAmount,
          memo: `FlashPay auto-payroll (${emp.pay_frequency})`,
        })

        const proof = arciumVerifyPaymentProof(txResult.signature, emp.id, salaryAmount)

        await db.createPayrollRecord({
          employer_id: employer.id,
          employee_id: emp.id,
          employee_name: emp.full_name,
          employee_role: emp.job_role,
          amount: salaryAmount,
          currency: 'USDC',
          tx_signature: txResult.signature,
          status: 'completed',
          pay_period_start: periodStart,
          pay_period_end: periodEnd,
          paid_at: paidAt,
          payslip_data: null,
          arcium_proof: proof.proof,
        })

        // Update employee's next_pay_date based on their own frequency
        await db.updateEmployee(emp.id, {
          next_pay_date: getNextPayDate(emp.pay_frequency),
        })

        employeesPaid++
      }

      await db.updateEmployerBalance(employer.id, realBalance - totalPayout)
      await db.updateSchedule(schedule.id, {
        last_run_at: paidAt,
        last_run_status: 'success',
        last_ai_reason: aiReason,
      })

      if (employer.email && !employer.email.includes('@wallet.flashpay')) {
        sendAutoPayrollEmail({
          employerName: employer.name,
          employerEmail: employer.email,
          companyName: employer.company_name,
          employeesPaid,
          totalAmount: totalPayout,
          aiReason,
          scheduleName: 'Auto Payroll',
          nextRunAt: new Date(Date.now() + 86400000).toISOString(),
        }).catch(err => console.error('Auto payroll email failed:', err))
      }

      results.push({ employer: employer.company_name, status: 'success', employees_paid: employeesPaid, total: totalPayout })
    } catch (err) {
      console.error(`Cron error for schedule ${schedule.id}:`, err)
      await db.updateSchedule(schedule.id, {
        last_run_status: 'error',
        last_ai_reason: err instanceof Error ? err.message : 'Unknown error',
      }).catch(() => {})
      results.push({ status: 'error' })
    }
  }

  return NextResponse.json({ ran: results.length, results })
}
