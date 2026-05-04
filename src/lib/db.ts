import { createClient } from '@supabase/supabase-js'
import type { Database } from './supabase'

type Employer = Database['public']['Tables']['employers']['Row']
type Employee = Database['public']['Tables']['employees']['Row']
type PayrollRecord = Database['public']['Tables']['payroll_records']['Row']
type PayrollSchedule = Database['public']['Tables']['payroll_schedules']['Row']

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Row = Record<string, any>

function svc() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Supabase env vars missing')
  return createClient(url, key, { auth: { persistSession: false } })
}

export const db = {
  // ── Employers ──────────────────────────────────────────────────────────────

  async getEmployer(id: string): Promise<Employer | null> {
    const { data } = await svc().from('employers').select('*').eq('id', id).single()
    return (data as Employer | null)
  },

  async getEmployerByEmail(email: string): Promise<Employer | null> {
    const { data } = await svc().from('employers').select('*').eq('email', email.toLowerCase()).single()
    return (data as Employer | null)
  },

  async getEmployerByWallet(wallet: string): Promise<Employer | null> {
    const { data } = await svc().from('employers').select('*').eq('wallet_address', wallet).single()
    return (data as Employer | null)
  },

  async createEmployer(data: Omit<Employer, 'id' | 'created_at' | 'updated_at'>): Promise<Employer> {
    const { data: row, error } = await svc().from('employers').insert(data as Row).select().single()
    if (error) throw error
    return row as Employer
  },

  async updateEmployer(id: string, updates: Partial<Omit<Employer, 'id' | 'created_at'>>): Promise<void> {
    const { error } = await svc().from('employers').update(updates as Row).eq('id', id)
    if (error) throw error
  },

  async updateEmployerBalance(id: string, balance: number): Promise<void> {
    const { error } = await svc().from('employers').update({ treasury_balance: balance }).eq('id', id)
    if (error) throw error
  },

  // ── Employees ──────────────────────────────────────────────────────────────

  async getEmployees(employerId: string): Promise<Employee[]> {
    const { data } = await svc().from('employees').select('*').eq('employer_id', employerId)
    return (data as Employee[]) ?? []
  },

  async getEmployee(id: string): Promise<Employee | null> {
    const { data } = await svc().from('employees').select('*').eq('id', id).single()
    return (data as Employee | null)
  },

  async getEmployeeByEmail(email: string): Promise<Employee | null> {
    const { data } = await svc().from('employees').select('*').eq('email', email.toLowerCase()).single()
    return (data as Employee | null)
  },

  async getEmployeeByInviteToken(token: string): Promise<Employee | null> {
    const { data } = await svc().from('employees').select('*').eq('invite_token', token).single()
    return (data as Employee | null)
  },

  async getEmployeeByWallet(wallet: string): Promise<Employee | null> {
    const { data } = await svc().from('employees').select('*').eq('wallet_address', wallet).single()
    return (data as Employee | null)
  },

  async createEmployee(data: Omit<Employee, 'id' | 'created_at' | 'updated_at'>): Promise<Employee> {
    const { data: row, error } = await svc().from('employees').insert(data as Row).select().single()
    if (error) throw error
    return row as Employee
  },

  async updateEmployee(id: string, updates: Partial<Omit<Employee, 'id' | 'created_at'>>): Promise<Employee> {
    const { data, error } = await svc().from('employees').update(updates as Row).eq('id', id).select().single()
    if (error) throw error
    return data as Employee
  },

  async deleteEmployee(id: string): Promise<void> {
    const { error } = await svc().from('employees').delete().eq('id', id)
    if (error) throw error
  },

  // ── Payroll Records ────────────────────────────────────────────────────────

  async getPayrollRecords(employerId: string): Promise<PayrollRecord[]> {
    const { data } = await svc().from('payroll_records').select('*').eq('employer_id', employerId)
    return (data as PayrollRecord[]) ?? []
  },

  async getEmployeePayroll(employeeId: string): Promise<PayrollRecord[]> {
    const { data } = await svc().from('payroll_records').select('*').eq('employee_id', employeeId)
    return (data as PayrollRecord[]) ?? []
  },

  async createPayrollRecord(data: Omit<PayrollRecord, 'id' | 'created_at'>): Promise<PayrollRecord> {
    const { data: row, error } = await svc().from('payroll_records').insert(data as Row).select().single()
    if (error) throw error
    return row as PayrollRecord
  },

  async updatePayrollRecord(id: string, updates: Partial<Omit<PayrollRecord, 'id' | 'created_at'>>): Promise<PayrollRecord> {
    const { data, error } = await svc().from('payroll_records').update(updates as Row).eq('id', id).select().single()
    if (error) throw error
    return data as PayrollRecord
  },

  // ── Payroll Schedules ──────────────────────────────────────────────────────

  async getSchedules(employerId: string): Promise<PayrollSchedule[]> {
    const { data } = await svc().from('payroll_schedules').select('*').eq('employer_id', employerId)
    return (data as PayrollSchedule[]) ?? []
  },

  async getAllActiveSchedulesDue(): Promise<PayrollSchedule[]> {
    const { data } = await svc()
      .from('payroll_schedules')
      .select('*')
      .eq('active', true)
      .lte('next_run_at', new Date().toISOString())
    return (data as PayrollSchedule[]) ?? []
  },

  async createSchedule(data: Omit<PayrollSchedule, 'id' | 'created_at' | 'updated_at'>): Promise<PayrollSchedule> {
    const { data: row, error } = await svc().from('payroll_schedules').insert(data as Row).select().single()
    if (error) throw error
    return row as PayrollSchedule
  },

  async updateSchedule(id: string, updates: Partial<Omit<PayrollSchedule, 'id' | 'created_at'>>): Promise<void> {
    const { error } = await svc().from('payroll_schedules').update(updates as Row).eq('id', id)
    if (error) throw error
  },

  async deleteSchedule(id: string): Promise<void> {
    const { error } = await svc().from('payroll_schedules').delete().eq('id', id)
    if (error) throw error
  },
}
