import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number | undefined | null, currency = 'USDC') {
  if (amount == null || isNaN(amount)) return `0.00 ${currency}`
  return `${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`
}

export function formatUSD(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount)
}

export function shortenAddress(address: string, chars = 4) {
  if (!address) return ''
  return `${address.slice(0, chars)}...${address.slice(-chars)}`
}

export function generateInviteToken() {
  const array = new Uint8Array(32)
  if (typeof crypto !== 'undefined') {
    crypto.getRandomValues(array)
  }
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('')
}

export function getNextPayDate(frequency: string): string {
  const now = new Date()
  switch (frequency) {
    case 'weekly':
      now.setDate(now.getDate() + 7)
      break
    case 'monthly':
      now.setMonth(now.getMonth() + 1)
      now.setDate(1)
      break
    case 'hourly':
      now.setDate(now.getDate() + 1)
      break
    default:
      now.setDate(now.getDate() + 30)
  }
  return now.toISOString()
}

export function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function formatDateTime(dateString: string) {
  return new Date(dateString).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function getPayPeriod(frequency: string): { start: string; end: string } {
  const now = new Date()
  const start = new Date(now)
  const end = new Date(now)

  switch (frequency) {
    case 'weekly':
      start.setDate(now.getDate() - 7)
      break
    case 'monthly':
      start.setDate(1)
      end.setMonth(now.getMonth() + 1)
      end.setDate(0)
      break
    default:
      start.setDate(now.getDate() - 1)
  }

  return { start: start.toISOString(), end: end.toISOString() }
}

export function generatePayslipId() {
  return `FP-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`
}

export const COUNTRIES = [
  'United States', 'United Kingdom', 'Canada', 'Australia', 'Germany',
  'France', 'Netherlands', 'Nigeria', 'Kenya', 'South Africa', 'India',
  'Philippines', 'Brazil', 'Mexico', 'Argentina', 'UAE', 'Singapore',
  'Japan', 'South Korea', 'Remote / Other'
]

export const PAY_FREQUENCIES = [
  { value: 'hourly', label: 'Hourly' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'one_time', label: 'One-time / Freelance' },
]
