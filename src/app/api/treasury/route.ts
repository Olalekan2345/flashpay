import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { getUSDCBalance } from '@/lib/solana'

function getSalaryFromToken(token: string): number {
  try {
    return JSON.parse(Buffer.from(token, 'base64').toString('utf-8')).amount || 0
  } catch { return 0 }
}

export async function GET() {
  try {
    const session = await getSession()
    if (!session || session.role !== 'employer') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const employer = await db.getEmployerByEmail(session.email)
    if (!employer) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const employees = await db.getEmployees(employer.id)
    const activeEmployees = employees.filter(e => e.status === 'active')
    const nextPayoutTotal = activeEmployees.reduce((sum, e) => sum + getSalaryFromToken(e.salary_token), 0)

    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const records = await db.getPayrollRecords(employer.id)
    const totalPaidThisMonth = records
      .filter(r => r.status === 'completed' && r.paid_at && new Date(r.paid_at) >= monthStart)
      .reduce((sum, r) => sum + r.amount, 0)

    const onChainBalance = employer.wallet_address
      ? await getUSDCBalance(employer.wallet_address)
      : 0

    return NextResponse.json({
      balance: onChainBalance,
      total_paid_this_month: totalPaidThisMonth,
      next_payout_total: nextPayoutTotal,
      active_employees: activeEmployees.length,
      pending_payments: 0,
      transactions: records
        .filter(r => r.status === 'completed')
        .sort((a, b) => new Date(b.paid_at ?? 0).getTime() - new Date(a.paid_at ?? 0).getTime())
        .slice(0, 20),
    })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to load treasury' }, { status: 500 })
  }
}

export async function POST(_req: NextRequest) {
  return NextResponse.json(
    { error: 'Treasury is your connected wallet. Fund it via the Circle devnet faucet.' },
    { status: 400 }
  )
}
