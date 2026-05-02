'use client'
import { useState } from 'react'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { ArciumBadge } from '@/components/dashboard/ArciumBadge'
import { UserPlus, ShieldCheck, DollarSign } from 'lucide-react'
import { COUNTRIES, PAY_FREQUENCIES } from '@/lib/utils'
import { toast } from 'sonner'

interface AddEmployeeModalProps {
  open: boolean
  onClose: () => void
  onSuccess: (employee: Record<string, unknown>) => void
}

export function AddEmployeeModal({ open, onClose, onSuccess }: AddEmployeeModalProps) {
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    country: '',
    job_role: '',
    wallet_address: '',
    pay_frequency: 'monthly',
    salary_amount: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const update = (key: string, value: string) => {
    setForm(f => ({ ...f, [key]: value }))
    setErrors(e => ({ ...e, [key]: '' }))
  }

  const validate1 = () => {
    const e: Record<string, string> = {}
    if (!form.full_name.trim()) e.full_name = 'Full name is required'
    if (!form.email.trim()) e.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email'
    if (!form.country) e.country = 'Country is required'
    if (!form.job_role.trim()) e.job_role = 'Job role is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const validate2 = () => {
    const e: Record<string, string> = {}
    if (!form.salary_amount || isNaN(Number(form.salary_amount))) e.salary_amount = 'Enter a valid salary amount'
    else if (Number(form.salary_amount) <= 0) e.salary_amount = 'Salary must be greater than 0'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleNext = () => {
    if (step === 1 && validate1()) setStep(2)
  }

  const handleSubmit = async () => {
    if (!validate2()) return
    setLoading(true)
    try {
      const res = await fetch('/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, salary_amount: Number(form.salary_amount) }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to add employee')
      if (data.email_error) {
        toast.warning(`${form.full_name} added, but email failed: ${data.email_error}`)
      } else {
        toast.success(`${form.full_name} added — invite email sent!`)
      }
      onSuccess(data.employee)
      onClose()
      setStep(1)
      setForm({ full_name: '', email: '', country: '', job_role: '', wallet_address: '', pay_frequency: 'monthly', salary_amount: '' })
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Add Employee" description="Invite a new team member to your confidential payroll" size="md">
      {/* Step indicator */}
      <div className="mb-6 flex items-center gap-2">
        {[1, 2].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-colors ${
              s === step ? 'bg-[#6c44fc] text-white shadow-[0_0_12px_rgba(108,68,252,0.3)]' : s < step ? 'bg-[#95ffdd]/20 text-[#95ffdd]' : 'bg-white/8 text-[#666666]'
            }`}>
              {s < step ? '✓' : s}
            </div>
            <span className={`text-xs ${s === step ? 'text-white font-medium' : 'text-[#666666]'}`}>
              {s === 1 ? 'Profile' : 'Compensation'}
            </span>
            {s < 2 && <div className="w-8 h-px bg-white/8" />}
          </div>
        ))}
      </div>

      {step === 1 && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Full Name" placeholder="Jane Smith" value={form.full_name} onChange={e => update('full_name', e.target.value)} error={errors.full_name} />
            <Input label="Email Address" type="email" placeholder="jane@company.com" value={form.email} onChange={e => update('email', e.target.value)} error={errors.email} />
          </div>
          <Input label="Job Role / Title" placeholder="Senior Engineer" value={form.job_role} onChange={e => update('job_role', e.target.value)} error={errors.job_role} />
          <Select label="Country" options={COUNTRIES.map(c => ({ value: c, label: c }))} placeholder="Select country" value={form.country} onChange={e => update('country', e.target.value)} error={errors.country} />
          <Input label="Wallet Address (optional)" placeholder="Solana address — can be added later" value={form.wallet_address} onChange={e => update('wallet_address', e.target.value)} />
          <Button className="w-full" onClick={handleNext} type="button">
            Continue <UserPlus className="h-4 w-4" />
          </Button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <div className="rounded-xl border border-[#6c44fc]/20 bg-[#6c44fc]/6 p-4">
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className="h-4 w-4 text-[#6c44fc]" />
              <p className="text-sm font-semibold text-white">Confidential Salary — Arcium MPC</p>
            </div>
            <p className="text-xs text-[#999999]">
              The salary amount you enter will be encrypted via Arcium&apos;s multi-party computation network.
              It will never be exposed in public blockchain transactions or visible to other employees.
            </p>
          </div>

          <Select
            label="Pay Frequency"
            options={PAY_FREQUENCIES}
            value={form.pay_frequency}
            onChange={e => update('pay_frequency', e.target.value)}
          />

          <Input
            label="Salary Amount (USDC)"
            type="number"
            placeholder="e.g. 5000"
            value={form.salary_amount}
            onChange={e => update('salary_amount', e.target.value)}
            error={errors.salary_amount}
            prefix={<DollarSign className="h-3.5 w-3.5" />}
            suffix={<span className="text-xs font-medium text-[#666666]">USDC</span>}
          />

          <ArciumBadge size="sm" />

          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setStep(1)} type="button">Back</Button>
            <Button className="flex-1" onClick={handleSubmit} loading={loading} type="button">
              Add &amp; Send Invite
            </Button>
          </div>
        </div>
      )}
    </Modal>
  )
}
