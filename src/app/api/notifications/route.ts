import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { formatDistanceToNow } from 'date-fns'

export interface AppNotification {
  id: string
  title: string
  msg: string
  time: string
  dot: string
  type: 'payment_sent' | 'payment_received' | 'employee_added' | 'employee_activated' | 'system'
}

export async function GET() {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ notifications: [] })

    const notifications: AppNotification[] = []

    if (session.role === 'employer') {
      const employer = await db.getEmployerByEmail(session.email)
      if (!employer) return NextResponse.json({ notifications: [] })

      // Recent payroll runs (last 10)
      const records = await db.getPayrollRecords(employer.id)
      const recentPayments = records
        .filter(r => r.status === 'completed' && r.paid_at)
        .sort((a, b) => new Date(b.paid_at!).getTime() - new Date(a.paid_at!).getTime())
        .slice(0, 5)

      for (const r of recentPayments) {
        notifications.push({
          id: `pay_${r.id}`,
          title: `Payroll sent — ${r.employee_name}`,
          msg: `$${r.amount.toFixed(2)} USDC paid to ${r.employee_role}`,
          time: formatDistanceToNow(new Date(r.paid_at!), { addSuffix: true }),
          dot: 'bg-[#95ffdd]',
          type: 'payment_sent',
        })
      }

      // Recently added employees (last 5)
      const employees = await db.getEmployees(employer.id)
      const recentEmployees = [...employees]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 3)

      for (const emp of recentEmployees) {
        if (emp.status === 'active') {
          notifications.push({
            id: `emp_active_${emp.id}`,
            title: `${emp.full_name} joined`,
            msg: `${emp.job_role} completed onboarding and connected their wallet`,
            time: formatDistanceToNow(new Date(emp.created_at), { addSuffix: true }),
            dot: 'bg-[#6c44fc]',
            type: 'employee_activated',
          })
        } else {
          notifications.push({
            id: `emp_added_${emp.id}`,
            title: `${emp.full_name} invited`,
            msg: `${emp.job_role} — invite sent, awaiting onboarding`,
            time: formatDistanceToNow(new Date(emp.created_at), { addSuffix: true }),
            dot: 'bg-[#5de2da]',
            type: 'employee_added',
          })
        }
      }
    } else {
      // Employee notifications
      const employee = await db.getEmployeeByEmail(session.email)
      if (!employee) return NextResponse.json({ notifications: [] })

      const payments = await db.getEmployeePayroll(employee.id)
      const recentPayments = payments
        .filter(r => r.status === 'completed' && r.paid_at)
        .sort((a, b) => new Date(b.paid_at!).getTime() - new Date(a.paid_at!).getTime())
        .slice(0, 8)

      for (const r of recentPayments) {
        notifications.push({
          id: `pay_${r.id}`,
          title: 'Salary received',
          msg: `$${r.amount.toFixed(2)} USDC landed in your wallet`,
          time: formatDistanceToNow(new Date(r.paid_at!), { addSuffix: true }),
          dot: 'bg-[#95ffdd]',
          type: 'payment_received',
        })
      }

      // Wallet not connected nudge
      if (!employee.wallet_address) {
        notifications.push({
          id: 'wallet_missing',
          title: 'Connect your wallet',
          msg: 'Add a Solana wallet to receive salary payments',
          time: 'Action needed',
          dot: 'bg-amber-400',
          type: 'system',
        })
      }
    }

    // Sort by recency — system messages go last
    const sorted = notifications.sort((a, b) => {
      if (a.type === 'system') return 1
      if (b.type === 'system') return -1
      return 0
    })

    return NextResponse.json({ notifications: sorted.slice(0, 8) })
  } catch (err) {
    console.error('Notifications error:', err)
    return NextResponse.json({ notifications: [] })
  }
}
