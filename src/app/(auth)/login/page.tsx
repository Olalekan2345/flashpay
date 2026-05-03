'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useWallet } from '@solana/wallet-adapter-react'
import { useWalletModal } from '@solana/wallet-adapter-react-ui'
import { Zap, Shield, ArrowRight, Wallet, CheckCircle2, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

export default function LoginPage() {
  const { publicKey, connected, signMessage } = useWallet()
  const { setVisible } = useWalletModal()
  const [step, setStep] = useState<'connect' | 'profile' | 'signing'>('connect')
  const [companyName, setCompanyName] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [isNewUser, setIsNewUser] = useState(false)

  useEffect(() => {
    if (!connected || !publicKey) return
    checkOrLogin()
  }, [connected, publicKey])

  const checkOrLogin = async () => {
    if (!publicKey) return
    setLoading(true)
    try {
      const res = await fetch('/api/auth/wallet-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallet_address: publicKey.toBase58() }),
      })
      const data = await res.json()
      if (data.exists) {
        await walletSignIn(false)
      } else {
        setIsNewUser(true)
        setStep('profile')
      }
    } catch {
      toast.error('Failed to check wallet. Try again.')
    } finally {
      setLoading(false)
    }
  }

  const walletSignIn = async (isNew: boolean) => {
    if (!publicKey || !signMessage) return
    setStep('signing')
    setLoading(true)
    try {
      const message = new TextEncoder().encode(
        `Sign in to FlashPay Private\nWallet: ${publicKey.toBase58()}\nTimestamp: ${Date.now()}`
      )
      const signature = await signMessage(message)
      const signatureHex = Buffer.from(signature).toString('hex')
      const messageHex = Buffer.from(message).toString('hex')

      const res = await fetch('/api/auth/wallet-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wallet_address: publicKey.toBase58(),
          signature: signatureHex,
          message: messageHex,
          full_name: isNew ? fullName : undefined,
          company_name: isNew ? companyName : undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Sign in failed')
      toast.success(isNew ? 'Account created! Welcome.' : 'Welcome back!')
      window.location.href = '/dashboard'
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Sign in failed'
      if (msg.includes('rejected') || msg.includes('cancelled') || msg.includes('User rejected')) {
        toast.error('Signature cancelled.')
      } else {
        toast.error(msg)
      }
      setStep(connected ? 'profile' : 'connect')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-black px-4">
      {/* Background glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/4 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-[#6c44fc]/8 blur-3xl" />
        <div className="absolute right-1/4 bottom-1/4 h-[400px] w-[400px] rounded-full bg-[#5de2da]/5 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl overflow-hidden shadow-[0_0_20px_rgba(108,68,252,0.4)]">
              <img src="/logo.png" alt="FlashPay" className="h-9 w-9 object-cover" />
            </div>
            <span className="text-xl font-bold text-white">FlashPay <span className="text-[#6c44fc]">Private</span></span>
          </Link>
          <p className="mt-3 text-sm text-[#999999]">Confidential Global Payroll on Solana</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#0e0e0e] p-8 shadow-2xl">

          {/* Step: Connect wallet */}
          {step === 'connect' && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#6c44fc]/15 border border-[#6c44fc]/25">
                  <Wallet className="h-7 w-7 text-[#6c44fc]" />
                </div>
                <h2 className="text-xl font-bold text-white">Connect Your Wallet</h2>
                <p className="mt-2 text-sm text-[#999999]">
                  Use Phantom wallet to sign in or create your employer account.
                  No password needed.
                </p>
              </div>

              <div className="space-y-2.5">
                {[
                  'Non-custodial — you control your keys',
                  'One-click sign-in with cryptographic proof',
                  'Treasury powered by your Solana wallet',
                ].map((f, i) => (
                  <div key={i} className="flex items-center gap-2.5 text-sm text-[#999999]">
                    <CheckCircle2 className="h-4 w-4 text-[#95ffdd] shrink-0" />
                    {f}
                  </div>
                ))}
              </div>

              <Button
                className="w-full"
                size="lg"
                variant="premium"
                onClick={() => setVisible(true)}
                loading={loading}
              >
                <Wallet className="h-5 w-5" />
                Connect Phantom Wallet
              </Button>

              <p className="text-center text-xs text-[#666666]">
                Don&apos;t have Phantom?{' '}
                <a
                  href="https://phantom.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#6c44fc] hover:text-[#7c54ff] inline-flex items-center gap-1"
                >
                  Download it free <ExternalLink className="h-3 w-3" />
                </a>
              </p>
            </div>
          )}

          {/* Step: New user profile */}
          {step === 'profile' && (
            <div className="space-y-5">
              <div>
                <div className="mb-1 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#95ffdd]" />
                  <span className="text-xs text-[#95ffdd] font-medium">Wallet connected</span>
                </div>
                <p className="text-xs font-mono text-[#666666] truncate">{publicKey?.toBase58()}</p>
              </div>

              <div>
                <h2 className="text-lg font-bold text-white">Complete Your Profile</h2>
                <p className="text-sm text-[#999999] mt-1">Just two fields to create your employer account.</p>
              </div>

              <Input
                label="Your Full Name"
                placeholder="Alex Rivera"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
              />
              <Input
                label="Company / Organization Name"
                placeholder="Nexus Labs Inc."
                value={companyName}
                onChange={e => setCompanyName(e.target.value)}
              />

              <Button
                className="w-full"
                size="lg"
                loading={loading}
                disabled={!fullName.trim() || !companyName.trim()}
                onClick={() => walletSignIn(true)}
              >
                Sign &amp; Create Account <ArrowRight className="h-4 w-4" />
              </Button>
              <p className="text-center text-xs text-[#666666]">
                You&apos;ll sign a message in Phantom to verify wallet ownership.
              </p>
            </div>
          )}

          {/* Step: Awaiting signature */}
          {step === 'signing' && (
            <div className="space-y-5 text-center py-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border-4 border-[#6c44fc]/20">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-t-[#6c44fc] border-r-transparent border-b-[#6c44fc]/20 border-l-transparent" />
              </div>
              <div>
                <p className="text-base font-semibold text-white">Check Phantom</p>
                <p className="text-sm text-[#999999] mt-1">Approve the signature request in your wallet to continue.</p>
              </div>
              <div className="rounded-lg bg-[#6c44fc]/8 border border-[#6c44fc]/20 p-3 text-xs text-[#999999]">
                This signature proves you own the wallet. It does not send any funds.
              </div>
            </div>
          )}
        </div>

        {/* Bottom badges */}
        <div className="mt-6 flex items-center justify-center gap-4 text-xs text-[#666666]">
          <span className="flex items-center gap-1">
            <Shield className="h-3.5 w-3.5 text-[#6c44fc]" />
            Arcium Confidential Compute
          </span>
          <span className="flex items-center gap-1">
            <Zap className="h-3.5 w-3.5 text-[#5de2da]" />
            Solana Devnet
          </span>
        </div>
      </div>
    </div>
  )
}
