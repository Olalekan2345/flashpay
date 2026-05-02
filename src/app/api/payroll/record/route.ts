import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { arciumVerifyPaymentProof } from '@/lib/arcium'
import { getPayPeriod } from '@/lib/utils'

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'employer') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const employer = await db.getEmployerByEmail(session.email)
    if (!employer) return NextResponse.json({ error: 'Employer not found' }, { status: 404 })

    const { signature, amounts } = await req.json()

    if (!signature || !amounts || typeof amounts !== 'object') {
      return NextResponse.json({ error: 'signature and amounts required' }, { status: 400 })
    }

    const paidAt = new Date().toISOString()
    const { start: periodStart, end: periodEnd } = getPayPeriod('monthly')

    for (const [empId, amount] of Object.entries(amounts)) {
      const emp = await db.getEmployee(empId)
      if (!emp) continue

      const proof = arciumVerifyPaymentProof(signature, empId, amount as number)

      await db.createPayrollRecord({
        employer_id: employer.id,
        employee_id: empId,
        employee_name: emp.full_name,
        employee_role: emp.job_role,
        amount: amount as number,
        currency: 'USDC',
        tx_signature: signature,
        status: 'completed',
        pay_period_start: periodStart,
        pay_period_end: periodEnd,
        paid_at: paidAt,
        payslip_data: null,
        arcium_proof: proof.proof,
      })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Payroll record error:', err)
    return NextResponse.json({ error: 'Failed to record payroll' }, { status: 500 })
  }
}
