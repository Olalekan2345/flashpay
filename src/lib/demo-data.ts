/**
 * Demo data store — replaces Supabase in demo mode.
 * In production: all reads/writes go to Supabase.
 */

import { getNextPayDate, generateInviteToken } from './utils'

export interface DemoEmployer {
  id: string
  name: string
  email: string
  password_hash: string
  company_name: string
  wallet_address: string
  treasury_balance: number
  created_at: string
}

export interface DemoEmployee {
  id: string
  employer_id: string
  full_name: string
  email: string
  country: string
  job_role: string
  wallet_address: string
  pay_frequency: string
  salary_encrypted: string
  salary_token: string
  status: string
  invite_token: string
  next_pay_date: string
  created_at: string
}

export interface DemoPayrollRecord {
  id: string
  employer_id: string
  employee_id: string
  employee_name: string
  employee_role: string
  amount: number
  currency: string
  tx_signature: string
  status: string
  pay_period_start: string
  pay_period_end: string
  paid_at: string
  arcium_proof: string
}

export const DEMO_EMPLOYERS: DemoEmployer[] = []
export const DEMO_EMPLOYEES: DemoEmployee[] = []
export const DEMO_PAYROLL_RECORDS: DemoPayrollRecord[] = []

// Use globalThis to survive HMR reloads in dev mode
declare global {
  // eslint-disable-next-line no-var
  var __fp_employers: DemoEmployer[] | undefined
  // eslint-disable-next-line no-var
  var __fp_employees: DemoEmployee[] | undefined
  // eslint-disable-next-line no-var
  var __fp_payroll: DemoPayrollRecord[] | undefined
}

if (!globalThis.__fp_employers) globalThis.__fp_employers = [...DEMO_EMPLOYERS]
if (!globalThis.__fp_employees) globalThis.__fp_employees = [...DEMO_EMPLOYEES]
if (!globalThis.__fp_payroll)   globalThis.__fp_payroll   = [...DEMO_PAYROLL_RECORDS]

const employers    = globalThis.__fp_employers
const employees    = globalThis.__fp_employees
const payrollRecords = globalThis.__fp_payroll

export const store = {
  getEmployer: (id: string) => employers.find(e => e.id === id),
  getEmployerByEmail: (email: string) => employers.find(e => e.email.toLowerCase() === email.toLowerCase()),
  getEmployerByWallet: (wallet: string) => employers.find(e => e.wallet_address === wallet),
  createEmployer: (data: Omit<DemoEmployer, 'id' | 'created_at'>) => {
    const employer = { ...data, id: 'emp_' + Date.now(), created_at: new Date().toISOString() }
    employers.push(employer)
    return employer
  },
  updateEmployerBalance: (id: string, balance: number) => {
    const employer = employers.find(e => e.id === id)
    if (employer) employer.treasury_balance = balance
  },

  getEmployees: (employerId: string) => employees.filter(e => e.employer_id === employerId),
  getEmployee: (id: string) => employees.find(e => e.id === id),
  getEmployeeByEmail: (email: string) => employees.find(e => e.email === email),
  getEmployeeByInviteToken: (token: string) => employees.find(e => e.invite_token === token),
  createEmployee: (data: Omit<DemoEmployee, 'id' | 'created_at'>) => {
    const employee = { ...data, id: 'worker_' + Date.now(), created_at: new Date().toISOString() }
    employees.push(employee)
    return employee
  },
  updateEmployee: (id: string, updates: Partial<DemoEmployee>) => {
    const idx = employees.findIndex(e => e.id === id)
    if (idx !== -1) employees[idx] = { ...employees[idx], ...updates }
    return employees[idx]
  },
  deleteEmployee: (id: string) => {
    const idx = employees.findIndex(e => e.id === id)
    if (idx !== -1) employees.splice(idx, 1)
    return idx !== -1
  },
  getEmployeeByWallet: (wallet: string) => employees.find(e => e.wallet_address === wallet),

  getPayrollRecords: (employerId: string) => payrollRecords.filter(r => r.employer_id === employerId),
  getEmployeePayroll: (employeeId: string) => payrollRecords.filter(r => r.employee_id === employeeId),
  createPayrollRecord: (data: Omit<DemoPayrollRecord, 'id'>) => {
    const record = { ...data, id: 'pay_' + Date.now() }
    payrollRecords.push(record)
    return record
  },
  updatePayrollRecord: (id: string, updates: Partial<DemoPayrollRecord>) => {
    const idx = payrollRecords.findIndex(r => r.id === id)
    if (idx !== -1) payrollRecords[idx] = { ...payrollRecords[idx], ...updates }
    return payrollRecords[idx]
  },
}
