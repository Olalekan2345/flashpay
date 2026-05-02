'use client'
import { useWallet } from '@solana/wallet-adapter-react'
import { useWalletModal } from '@solana/wallet-adapter-react-ui'
import { Wallet, LogOut, ChevronDown } from 'lucide-react'
import { shortenAddress } from '@/lib/utils'
import { useState } from 'react'

interface ConnectWalletButtonProps {
  className?: string
  variant?: 'default' | 'compact'
}

export function ConnectWalletButton({ className = '', variant = 'default' }: ConnectWalletButtonProps) {
  const { publicKey, disconnect, connected } = useWallet()
  const { setVisible } = useWalletModal()
  const [menuOpen, setMenuOpen] = useState(false)

  if (connected && publicKey) {
    return (
      <div className="relative">
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className={`flex items-center gap-2 rounded-lg border border-[#95ffdd]/25 bg-[#95ffdd]/8 px-3 py-2 text-sm font-medium text-[#95ffdd] hover:bg-[#95ffdd]/12 transition-colors ${className}`}
        >
          <div className="h-2 w-2 rounded-full bg-[#95ffdd] animate-pulse" />
          {variant === 'compact'
            ? shortenAddress(publicKey.toBase58(), 3)
            : `${shortenAddress(publicKey.toBase58())} · Devnet`
          }
          <ChevronDown className="h-3.5 w-3.5" />
        </button>

        {menuOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
            <div className="absolute right-0 z-20 mt-2 w-48 rounded-xl border border-white/10 bg-[#141414] shadow-xl">
              <button
                onClick={() => { navigator.clipboard.writeText(publicKey.toBase58()); setMenuOpen(false) }}
                className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-white/80 hover:bg-white/5 rounded-t-xl transition-colors"
              >
                <Wallet className="h-4 w-4" />
                Copy address
              </button>
              <a
                href={`https://explorer.solana.com/address/${publicKey.toBase58()}?cluster=devnet`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-white/80 hover:bg-white/5 transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                <Wallet className="h-4 w-4" />
                View on Explorer
              </a>
              <button
                onClick={() => { disconnect(); setMenuOpen(false) }}
                className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 rounded-b-xl transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Disconnect
              </button>
            </div>
          </>
        )}
      </div>
    )
  }

  return (
    <button
      onClick={() => setVisible(true)}
      className={`flex items-center gap-2 rounded-lg border border-[#6c44fc]/30 bg-[#6c44fc]/10 px-3 py-2 text-sm font-medium text-[#6c44fc] hover:bg-[#6c44fc]/15 transition-colors ${className}`}
    >
      <Wallet className="h-4 w-4" />
      Connect Wallet
    </button>
  )
}
