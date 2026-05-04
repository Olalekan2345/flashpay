import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      employers: {
        Row: {
          id: string
          name: string
          email: string
          password_hash: string
          company_name: string
          company_logo: string | null
          wallet_address: string | null
          treasury_balance: number
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['employers']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['employers']['Insert']>
      }
      employees: {
        Row: {
          id: string
          employer_id: string
          full_name: string
          email: string
          country: string
          job_role: string
          wallet_address: string | null
          pay_frequency: string
          salary_encrypted: string
          salary_token: string
          status: string
          invite_token: string | null
          invite_expires_at: string | null
          next_pay_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['employees']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['employees']['Insert']>
      }
      payroll_records: {
        Row: {
          id: string
          employer_id: string
          employee_id: string
          employee_name: string
          employee_role: string
          amount: number
          currency: string
          tx_signature: string | null
          status: string
          pay_period_start: string
          pay_period_end: string
          paid_at: string | null
          payslip_data: string | null
          arcium_proof: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['payroll_records']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['payroll_records']['Insert']>
      }
      payroll_schedules: {
        Row: {
          id: string
          employer_id: string
          name: string
          frequency: 'weekly' | 'biweekly' | 'monthly'
          pay_day: number
          active: boolean
          ai_enabled: boolean
          next_run_at: string
          last_run_at: string | null
          last_run_status: string | null
          last_ai_reason: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['payroll_schedules']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['payroll_schedules']['Insert']>
      }
      treasury_transactions: {
        Row: {
          id: string
          employer_id: string
          type: 'deposit' | 'withdrawal' | 'payment'
          amount: number
          tx_signature: string | null
          description: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['treasury_transactions']['Row'], 'id' | 'created_at'>
        Update: never
      }
    }
  }
}
