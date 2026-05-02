'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Zap, Shield, CheckCircle2, Wallet, ArrowRight, Building2, User, Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArciumBadge } from '@/components/dashboard/ArciumBadge'
import { toast } from 'sonner'
import Link from 'next/link'

interface InviteData {
  employee: {
    id: string
    full_name: string
    email: string
    job_role: string
    country: string
    pay_frequency: string
    status: string
  }
  employer: { company_name: string }
}

export default function InvitePage() {
  const { token } = useParams()
  const router = useRouter()
  const [data, setData] = useState<InviteData | null>(null)
  const [loading, setLoading] = useState(true)
  const [step, setStep] = useState<'welcome' | 'wallet' | 'done'>('welcome')
  const [walletAddress, setWalletAddress] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetch(`/api/invite?token=${token}`)
      .then(r => r.json())
      .then(d => {
        if (d.error) throw new Error(d.error)
        setData(d)
      })
      .catch(err => toast.error(err.message || 'Invalid invite'))
      .finally(() => setLoading(false))
  }, [token])

  const handleComplete = async () => {
    setSubmitting(true)
    try {
      const res = await fetch('/api/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, wallet_address: walletAddress }),
      })
      const d = await res.json()
      if (!res.ok) throw new Error(d.error)
      setStep('done')
      setTimeout(() => router.push('/employee'), 2000)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to complete onboarding')
    } finally { setSubmitting(false) }
  }

  const generateEmbeddedWallet = () => {
    const chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'
    let addr = ''
    for (let i = 0; i < 44; i++) addr += chars[Math.floor(Math.random() * chars.length)]
    setWalletAddress(addr)
    toast.success('Embedded wallet generated!')
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-[#6c44fc] border-t-transparent" />
          <p className="mt-3 text-sm text-[#999999]">Validating invite…</p>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black px-4">
        <div className="text-center max-w-sm">
          <div className="mb-4 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 border border-red-500/25">
              <Shield className="h-8 w-8 text-red-400" />
            </div>
          </div>
          <h1 className="text-xl font-bold text-white mb-2">Invalid Invite</h1>
          <p className="text-sm text-[#999999] mb-6">This invite link is invalid or has expired. Please contact your employer for a new link.</p>
          <Link href="/" className="text-[#6c44fc] hover:text-[#7c54ff] text-sm">← Back to home</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4 py-12">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/4 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-[#6c44fc]/8 blur-3xl" />
      </div>

      <div className="relative w-full max-w-lg">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#6c44fc] shadow-[0_0_20px_rgba(108,68,252,0.4)]">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">FlashPay <span className="text-[#6c44fc]">Private</span></span>
          </div>
        </div>

        {step === 'welcome' && (
          <div className="rounded-2xl border border-white/10 bg-[#0e0e0e] p-8 shadow-2xl fade-in">
            <div className="text-center mb-6">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#6c44fc] shadow-[0_0_24px_rgba(108,68,252,0.3)]">
                <User className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white">You&apos;re invited!</h1>
              <p className="mt-2 text-sm text-[#999999]">
                <span className="text-[#6c44fc] font-semibold">{data.employer?.company_name}</span> has added you to their confidential payroll.
              </p>
            </div>

            <div className="rounded-xl border border-white/8 bg-white/4 p-5 space-y-3 mb-6">
              {[
                { icon: User, label: 'Name', value: data.employee.full_name },
                { icon: Building2, label: 'Role', value: data.employee.job_role },
                { icon: Globe, label: 'Country', value: data.employee.country },
                { icon: Zap, label: 'Pay Frequency', value: data.employee.pay_frequency },
              ].map(({ icon: Icon, label, value }, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[#999999]">
                    <Icon className="h-3.5 w-3.5" />
                    <span className="text-sm">{label}</span>
                  </div>
                  <span className="text-sm font-medium text-white capitalize">{value}</span>
                </div>
              ))}
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#999999]">Salary</span>
                <ArciumBadge size="sm" />
              </div>
            </div>

            <div className="space-y-3 text-sm text-[#999999] mb-6">
              {[
                'Your salary is encrypted and stored privately via Arcium MPC',
                'Only you and your employer can see your compensation',
                'Payments arrive in your Solana wallet in seconds',
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#95ffdd] shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>

            <Button className="w-full" size="lg" onClick={() => setStep('wallet')}>
              Accept &amp; Set Up Wallet <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        )}

        {step === 'wallet' && (
          <div className="rounded-2xl border border-white/10 bg-[#0e0e0e] p-8 shadow-2xl fade-in">
            <h2 className="text-xl font-bold text-white mb-2">Connect Your Wallet</h2>
            <p className="text-sm text-[#999999] mb-6">
              Your salary payments will be sent to this Solana wallet address.
              You can add it now or skip and update it later.
            </p>

            <div className="space-y-4">
              <Input
                label="Solana Wallet Address"
                placeholder="Enter your Phantom wallet address"
                value={walletAddress}
                onChange={e => setWalletAddress(e.target.value)}
              />

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/8" />
                </div>
                <div className="relative flex justify-center text-xs text-[#666666]">
                  <span className="bg-[#0e0e0e] px-3">or</span>
                </div>
              </div>

              <button
                onClick={generateEmbeddedWallet}
                className="w-full rounded-xl border border-[#6c44fc]/25 bg-[#6c44fc]/8 py-3 text-sm font-medium text-[#6c44fc] hover:bg-[#6c44fc]/15 transition-colors"
              >
                <Wallet className="inline h-4 w-4 mr-2" />
                Generate Embedded Wallet (no crypto knowledge needed)
              </button>

              {walletAddress && (
                <div className="rounded-lg bg-[#95ffdd]/5 border border-[#95ffdd]/20 px-4 py-3">
                  <p className="text-xs text-[#95ffdd] font-mono break-all">{walletAddress}</p>
                </div>
              )}
            </div>

            <div className="mt-6 flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => handleComplete()}>
                Skip for now
              </Button>
              <Button className="flex-1" onClick={handleComplete} loading={submitting} disabled={!walletAddress}>
                Complete Setup <CheckCircle2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {step === 'done' && (
          <div className="rounded-2xl border border-white/10 bg-[#0e0e0e] p-8 shadow-2xl text-center fade-in">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#95ffdd]/10 border border-[#95ffdd]/25">
              <CheckCircle2 className="h-8 w-8 text-[#95ffdd]" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">You&apos;re all set!</h2>
            <p className="text-sm text-[#999999] mb-4">
              Welcome to {data.employer?.company_name}. Redirecting to your dashboard…
            </p>
            <div className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-[#6c44fc] border-t-transparent" />
          </div>
        )}

        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-[#666666]">
          <Shield className="h-3.5 w-3.5 text-[#6c44fc]" />
          Protected by Arcium Confidential Compute
        </div>
      </div>
    </div>
  )
}
