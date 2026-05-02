import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { arciumVerifyPaymentProof } from '@/lib/arcium'
import { simulateUSDCTransfer } from '@/lib/solana'
import { getPayPeriod } from '@/lib/utils'

function getSalaryFromToken(token: string): number {
  try {
    return JSON.parse(Buffer.from(token, 'base64').toString('utf-8')).amount || 0
  } catch { return 0 }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'employer') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const employer = await db.getEmployerByEmail(session.email)
    if (!employer) return NextResponse.json({ error: 'Employer not found' }, { status: 404 })

    const { mode, employee_id } = await req.json()

    let targetEmployees = (await db.getEmployees(employer.id)).filter(e => e.status === 'active')

    if (mode === 'single' && employee_id) {
      targetEmployees = targetEmployees.filter(e => e.id === employee_id)
    }

    if (targetEmployees.length === 0) {
      return NextResponse.json({ error: 'No active employees to pay' }, { status: 400 })
    }

    const totalPayout = targetEmployees.reduce((sum, emp) => sum + getSalaryFromToken(emp.salary_token), 0)

    if (employer.treasury_balance < totalPayout) {
      return NextResponse.json({
        error: `Insufficient treasury balance. Need ${totalPayout.toFixed(2)} USDC, have ${employer.treasury_balance.toFixed(2)} USDC.`
      }, { status: 400 })
    }

    const signatures: string[] = []
    const paidAt = new Date().toISOString()
    const { start: periodStart, end: periodEnd } = getPayPeriod('monthly')

    for (const emp of targetEmployees) {
      const salaryAmount = getSalaryFromToken(emp.salary_token)
      if (!salaryAmount) continue

      const txResult = await simulateUSDCTransfer({
        fromAddress: employer.wallet_address || 'treasury_wallet',
        toAddress: emp.wallet_address || 'pending_wallet',
        amount: salaryAmount,
        memo: `FlashPay payroll — confidential`,
      })

      const proof = arciumVerifyPaymentProof(txResult.signature, emp.id, salaryAmount)
      signatures.push(txResult.signature)

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
    }

    await db.updateEmployerBalance(employer.id, employer.treasury_balance - totalPayout)

    return NextResponse.json({
      success: true,
      signatures,
      total: totalPayout,
      employees_paid: targetEmployees.length,
      paid_at: paidAt,
    })
  } catch (err) {
    console.error('Payroll run error:', err)
    return NextResponse.json({ error: 'Payroll run failed' }, { status: 500 })
  }
}
