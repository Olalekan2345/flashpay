'use client'
import { useState } from 'react'
import { Header } from '@/components/dashboard/Header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArciumBadge } from '@/components/dashboard/ArciumBadge'
import { Wallet, Shield, CheckCircle2, ExternalLink, Copy, Zap } from 'lucide-react'
import { getAddressExplorerUrl } from '@/lib/solana'
import { toast } from 'sonner'

export default function EmployeeWalletPage() {
  const [walletAddress, setWalletAddress] = useState('')
  const [currentWallet, setCurrentWallet] = useState('')
  const [saving, setSaving] = useState(false)

  const copyAddress = () => {
    if (currentWallet) {
      navigator.clipboard.writeText(currentWallet)
      toast.success('Address copied!')
    }
  }

  const generateEmbedded = () => {
    const chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'
    let addr = ''
    for (let i = 0; i < 44; i++) addr += chars[Math.floor(Math.random() * chars.length)]
    setWalletAddress(addr)
    toast.success('Embedded wallet address generated!')
  }

  const saveWallet = async () => {
    if (!walletAddress) return toast.error('Enter a wallet address')
    setSaving(true)
    await new Promise(r => setTimeout(r, 800))
    setCurrentWallet(walletAddress)
    setWalletAddress('')
    toast.success('Wallet address updated!')
    setSaving(false)
  }

  return (
    <div className="fade-in">
      <Header title="Wallet" subtitle="Manage your payment wallet" />
      <div className="p-6 space-y-6">
        {/* Current wallet */}
        <div className="rounded-xl border border-white/8 bg-[#141414] p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#6c44fc]/15 border border-[#6c44fc]/20">
              <Wallet className="h-5 w-5 text-[#6c44fc]" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">Connected Wallet</h2>
              <p className="text-xs text-[#666666]">Payments are deposited here</p>
            </div>
          </div>

          {currentWallet ? (
            <div className="rounded-xl border border-[#95ffdd]/20 bg-[#95ffdd]/6 p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#95ffdd]" />
                  <span className="text-sm text-[#95ffdd] font-medium">Wallet Connected</span>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={copyAddress} className="rounded p-1 hover:bg-white/8 text-[#666666] hover:text-white transition-colors">
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                  <a
                    href={getAddressExplorerUrl(currentWallet)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded p-1 hover:bg-white/8 text-[#666666] hover:text-[#6c44fc] transition-colors"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>
              <p className="font-mono text-sm text-white/80 break-all">{currentWallet}</p>
            </div>
          ) : (
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/8 p-4">
              <p className="text-sm text-amber-300">No wallet connected. Add your Solana wallet address below to receive payments.</p>
            </div>
          )}
        </div>

        {/* Update wallet */}
        <div className="rounded-xl border border-white/8 bg-[#141414] p-6">
          <h2 className="text-sm font-semibold text-white mb-4">Update Wallet Address</h2>
          <div className="space-y-4">
            <Input
              label="Solana Wallet Address"
              placeholder="Enter your Phantom wallet address (44 chars)"
              value={walletAddress}
              onChange={e => setWalletAddress(e.target.value)}
            />

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/8" />
              </div>
              <div className="relative flex justify-center text-xs text-[#666666]">
                <span className="bg-[#141414] px-3">or</span>
              </div>
            </div>

            <button
              onClick={generateEmbedded}
              className="w-full rounded-xl border border-[#6c44fc]/25 bg-[#6c44fc]/8 py-3 text-sm font-medium text-[#6c44fc] hover:bg-[#6c44fc]/15 transition-colors"
            >
              <Wallet className="inline h-4 w-4 mr-2" />
              Generate Embedded Wallet (no Phantom required)
            </button>

            <Button className="w-full" onClick={saveWallet} loading={saving} disabled={!walletAddress}>
              Save Wallet Address
            </Button>
          </div>
        </div>

        {/* Info */}
        <div className="rounded-xl border border-white/8 bg-[#141414] p-5 space-y-3">
          <h3 className="text-sm font-semibold text-white">About Your Wallet</h3>
          {[
            { icon: Zap, title: 'Instant Payments', desc: 'USDC lands in your wallet within ~400ms of your employer running payroll.', color: 'text-[#5de2da]' },
            { icon: Shield, title: 'Privacy Preserved', desc: 'Your wallet is associated with your confidential salary but the amount is never exposed publicly.', color: 'text-[#6c44fc]' },
          ].map(({ icon: Icon, title, desc, color }, i) => (
            <div key={i} className="flex gap-3">
              <Icon className={`h-4 w-4 ${color} shrink-0 mt-0.5`} />
              <div>
                <p className="text-sm font-medium text-white/80">{title}</p>
                <p className="text-xs text-[#666666]">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        <ArciumBadge size="sm" />
      </div>
    </div>
  )
}
