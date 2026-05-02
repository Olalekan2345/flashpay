export type UserRole = 'employer' | 'employee'

export type PayFrequency = 'hourly' | 'weekly' | 'monthly' | 'one_time'

export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed'

export type EmployeeStatus = 'active' | 'inactive' | 'pending_onboarding'

export interface Employer {
  id: string
  name: string
  email: string
  company_name: string
  company_logo?: string
  wallet_address?: string
  treasury_balance: number
  created_at: string
}

export interface Employee {
  id: string
  employer_id: string
  full_name: string
  email: string
  country: string
  job_role: string
  wallet_address?: string
  pay_frequency: PayFrequency
  salary_encrypted: string // Arcium-encrypted salary
  salary_token?: string    // Decryption token (employer only)
  status: EmployeeStatus
  invite_token?: string
  invite_expires_at?: string
  next_pay_date?: string
  created_at: string
  // Resolved fields (only visible to authorized parties)
  salary_amount?: number
}

export interface PayrollRecord {
  id: string
  employer_id: string
  employee_id: string
  employee_name: string
  employee_role: string
  amount: number
  currency: 'USDC'
  tx_signature?: string
  status: PaymentStatus
  pay_period_start: string
  pay_period_end: string
  paid_at?: string
  payslip_url?: string
  arcium_proof?: string
  created_at: string
}

export interface Treasury {
  balance: number
  total_paid_this_month: number
  next_payout_total: number
  active_employees: number
  pending_payments: number
}

export interface PayslipData {
  id: string
  employer_name: string
  employer_company: string
  employee_name: string
  employee_role: string
  employee_country: string
  pay_period_start: string
  pay_period_end: string
  gross_amount: number
  net_amount: number
  currency: 'USDC'
  tx_signature: string
  paid_at: string
  arcium_proof: string
}

export interface ArciumEncrypted {
  ciphertext: string
  nonce: string
  proof: string
  timestamp: number
  access_policy: {
    employer_id: string
    employee_id: string
  }
}

export interface InviteToken {
  token: string
  employer_id: string
  employee_id: string
  email: string
  expires_at: string
}

export interface DashboardStats {
  treasury_balance: number
  total_employees: number
  total_paid_this_month: number
  next_payout_total: number
  recent_payments: PayrollRecord[]
}
