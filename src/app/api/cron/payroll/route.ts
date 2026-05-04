import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { db } from '@/lib/db'
import { arciumVerifyPaymentProof } from '@/lib/arcium'
import { simulateUSDCTransfer, getUSDCBalance } from '@/lib/solana'
import { getPayPeriod } from '@/lib/utils'
import { sendAutoPayrollEmail } from '@/lib/email'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

function getSalaryFromToken(token: string): number {
  try {
    return JSON.parse(Buffer.from(token, 'base64').toString('utf-8')).amount || 0
  } catch { return 0 }
}

function computeNextRunAt(frequency: string, payDay: number): string {
  const now = new Date()
  const next = new Date(now)

  if (frequency === 'monthly') {
    next.setMonth(next.getMonth() + 1)
    next.setDate(payDay)
    next.setHours(9, 0, 0, 0)
  } else if (frequency === 'biweekly') {
    next.setDate(next.getDate() + 14)
    next.setHours(9, 0, 0, 0)
  } else {
    next.setDate(next.getDate() + 7)
    next.setHours(9, 0, 0, 0)
  }

  return next.toISOString()
}

export async function GET(req: NextRequest) {
  // Verify cron secret so only Vercel can call this
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const schedules = await db.getAllActiveSchedulesDue()

  if (schedules.length === 0) {
    return NextResponse.json({ message: 'No schedules due', ran: 0 })
  }

  const results = []

  for (const schedule of schedules) {
    try {
      const employer = await db.getEmployer(schedule.employer_id)
      if (!employer) continue

      const employees = (await db.getEmployees(employer.id)).filter(e => e.status === 'active')
      const totalPayout = employees.reduce((sum, e) => sum + getSalaryFromToken(e.salary_token), 0)

      const realBalance = employer.wallet_address
        ? await getUSDCBalance(employer.wallet_address)
        : employer.treasury_balance

      let shouldRun = true
      let aiReason = 'Scheduled payroll approved — all conditions met.'

      // AI agent decision
      if (schedule.ai_enabled && process.env.ANTHROPIC_API_KEY) {
        const message = await anthropic.messages.create({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 256,
          messages: [{
            role: 'user',
            content: `You are a payroll AI agent for FlashPay. Decide whether to run payroll now.

Company: ${employer.company_name}
Schedule: ${schedule.name} (${schedule.frequency})
Active employees: ${employees.length}
Total payout needed: $${totalPayout.toFixed(2)} USDC
Treasury balance: $${realBalance.toFixed(2)} USDC
Employees with wallets: ${employees.filter(e => e.wallet_address).length}/${employees.length}

Respond with JSON only: { "run": true/false, "reason": "one sentence explanation" }
Only block payroll if: balance is insufficient, no active employees, or 0 employees have wallets.`,
          }],
        })

        try {
          const text = message.content[0].type === 'text' ? message.content[0].text : ''
          const parsed = JSON.parse(text.replace(/```json\n?|\n?```/g, '').trim())
          shouldRun = parsed.run
          aiReason = parsed.reason
        } catch {
          // AI parse failed — default to running if conditions are met
          shouldRun = totalPayout > 0 && realBalance >= totalPayout && employees.length > 0
        }
      } else {
        shouldRun = totalPayout > 0 && realBalance >= totalPayout && employees.length > 0
        if (!shouldRun) {
          aiReason = realBalance < totalPayout
            ? `Insufficient balance. Need $${totalPayout.toFixed(2)}, have $${realBalance.toFixed(2)}.`
            : 'No active employees to pay.'
        }
      }

      const nextRunAt = computeNextRunAt(schedule.frequency, schedule.pay_day)

      if (!shouldRun) {
        await db.updateSchedule(schedule.id, {
          next_run_at: nextRunAt,
          last_run_at: new Date().toISOString(),
          last_run_status: 'skipped',
          last_ai_reason: aiReason,
        })
        results.push({ schedule: schedule.name, status: 'skipped', reason: aiReason })
        continue
      }

      // Execute payroll
      const paidAt = new Date().toISOString()
      const { start: periodStart, end: periodEnd } = getPayPeriod('monthly')
      let employeesPaid = 0

      for (const emp of employees) {
        const salaryAmount = getSalaryFromToken(emp.salary_token)
        if (!salaryAmount) continue

        const txResult = await simulateUSDCTransfer({
          fromAddress: employer.wallet_address || 'treasury_wallet',
          toAddress: emp.wallet_address || 'pending_wallet',
          amount: salaryAmount,
          memo: `FlashPay auto-payroll — ${schedule.name}`,
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

        employeesPaid++
      }

      await db.updateEmployerBalance(employer.id, realBalance - totalPayout)
      await db.updateSchedule(schedule.id, {
        next_run_at: nextRunAt,
        last_run_at: paidAt,
        last_run_status: 'success',
        last_ai_reason: aiReason,
      })

      // Send summary email to employer
      if (employer.email && !employer.email.includes('@wallet.flashpay')) {
        sendAutoPayrollEmail({
          employerName: employer.name,
          employerEmail: employer.email,
          companyName: employer.company_name,
          employeesPaid,
          totalAmount: totalPayout,
          aiReason,
          scheduleName: schedule.name,
          nextRunAt,
        }).catch(err => console.error('Auto payroll email failed:', err))
      }

      results.push({ schedule: schedule.name, status: 'success', employees_paid: employeesPaid, total: totalPayout })
    } catch (err) {
      console.error(`Cron payroll error for schedule ${schedule.id}:`, err)
      await db.updateSchedule(schedule.id, {
        last_run_status: 'error',
        last_ai_reason: err instanceof Error ? err.message : 'Unknown error',
      }).catch(() => {})
      results.push({ schedule: schedule.name, status: 'error' })
    }
  }

  return NextResponse.json({ ran: results.length, results })
}
