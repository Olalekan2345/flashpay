'use client'
import { useState } from 'react'
import { useWallet, useConnection } from '@solana/wallet-adapter-react'
import { Transaction } from '@solana/web3.js'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { ArciumBadge } from '@/components/dashboard/ArciumBadge'
import { Zap, Shield, CheckCircle2, ExternalLink, Users, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { formatCurrency } from '@/lib/utils'
import { getExplorerUrl } from '@/lib/solana'

interface PayrollRunModalProps {
  open: boolean
  onClose: () => void
  mode: 'single' | 'bulk'
  employee?: { id: string; full_name: string; job_role: string }
  employeeCount?: number
  onSuccess?: () => void
}

type RunStep = 'confirm' | 'building' | 'signing' | 'confirming' | 'done' | 'error'

export function PayrollRunModal({
  open, onClose, mode, employee, employeeCount = 0, onSuccess
}: PayrollRunModalProps) {
  const { sendTransaction, publicKey } = useWallet()
  const { connection } = useConnection()

  const [step, setStep] = useState<RunStep>('confirm')
  const [signature, setSignature] = useState<string | null>(null)
  const [total, setTotal] = useState(0)
  const [skipped, setSkipped] = useState<string[]>([])
  const [errorMsg, setErrorMsg] = useState('')

  const reset = () => {
    setStep('confirm')
    setSignature(null)
    setTotal(0)
    setSkipped([])
    setErrorMsg('')
  }

  const handleClose = () => { reset(); onClose() }

  const handleRun = async () => {
    if (!publicKey || !sendTransaction) {
      toast.error('Wallet not connected')
      return
    }

    try {
      setStep('building')
      const buildRes = await fetch('/api/payroll/build', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          mode === 'single' && employee
            ? { mode: 'single', employee_id: employee.id }
            : { mode: 'bulk' }
        ),
      })
      const buildData = await buildRes.json()
      if (!buildRes.ok) throw new Error(buildData.error || 'Failed to build transaction')

      setTotal(buildData.total)
      setSkipped(buildData.skipped || [])

      setStep('signing')
      const txBytes = Buffer.from(buildData.transaction, 'base64')
      const tx = Transaction.from(txBytes)

      const sig = await sendTransaction(tx, connection)
      setSignature(sig)

      setStep('confirming')
      await connection.confirmTransaction({
        signature: sig,
        blockhash: buildData.blockhash,
        lastValidBlockHeight: buildData.lastValidBlockHeight,
      }, 'confirmed')

      await fetch('/api/payroll/record', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ signature: sig, amounts: buildData.amounts }),
      })

      setStep('done')
      onSuccess?.()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Payroll failed'
      if (msg.includes('rejected') || msg.includes('cancelled') || msg.includes('User rejected')) {
        toast.error('Transaction cancelled in Phantom')
        reset()
        return
      }
      setErrorMsg(msg)
      setStep('error')
    }
  }

  const statusLabel = {
    building: 'Building transaction…',
    signing: 'Waiting for Phantom signature…',
    confirming: 'Confirming on Solana…',
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      size="md"
      title={
        step === 'done' ? 'Payroll Sent!'
        : step === 'error' ? 'Transaction Failed'
        : mode === 'bulk' ? 'Run Bulk Payroll'
        : `Pay ${employee?.full_name}`
      }
    >
      {step === 'confirm' && (
        <div className="space-y-5">
          <div className="rounded-xl border border-white/10 bg-white/4 p-4 space-y-3">
            {mode === 'bulk' ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-white/70">
                  <Users className="h-4 w-4 text-[#999999]" />
                  <span className="text-sm">Active employees</span>
                </div>
                <span className="text-sm font-semibold text-white">{employeeCount} workers</span>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#999999]">Employee</span>
                  <span className="text-sm font-semibold text-white">{employee?.full_name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#999999]">Amount</span>
                  <span className="text-sm font-bold text-[#6c44fc]">Confidential (Arcium)</span>
                </div>
              </>
            )}
          </div>

          <div className="rounded-xl border border-[#6c44fc]/20 bg-[#6c44fc]/6 p-3 space-y-1.5">
            <div className="flex items-center gap-2">
              <Shield className="h-3.5 w-3.5 text-[#6c44fc]" />
              <span className="text-xs font-semibold text-white">Real on-chain USDC transfer</span>
            </div>
            <p className="text-xs text-[#999999]">
              Phantom will ask you to sign a Solana transaction. USDC will be sent directly from
              your wallet to each employee's wallet on devnet.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-[#666666] bg-white/4 rounded-lg p-3">
            <Zap className="h-3.5 w-3.5 text-[#5de2da] shrink-0" />
            Settles on Solana in ~400ms · Fee: &lt;$0.001 per transfer
          </div>

          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={handleClose}>Cancel</Button>
            <Button variant="success" className="flex-1" onClick={handleRun}>
              <Zap className="h-4 w-4" />
              {mode === 'bulk' ? `Pay ${employeeCount} Employees` : 'Send Payment'}
            </Button>
          </div>
        </div>
      )}

      {(step === 'building' || step === 'signing' || step === 'confirming') && (
        <div className="space-y-6 text-center py-4">
          <div className="flex justify-center">
            <div className="relative flex h-20 w-20 items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-[#6c44fc]/15" />
              <div className="absolute inset-0 rounded-full border-4 border-t-[#6c44fc] animate-spin"
                style={{ borderRightColor: 'transparent', borderBottomColor: 'transparent', borderLeftColor: 'transparent' }} />
              <Zap className="h-7 w-7 text-[#6c44fc]" />
            </div>
          </div>
          <div>
            <p className="text-base font-semibold text-white">
              {statusLabel[step as keyof typeof statusLabel]}
            </p>
            {step === 'signing' && (
              <p className="text-xs text-[#666666] mt-1">Check your Phantom wallet popup</p>
            )}
          </div>
          <div className="text-xs text-[#666666] flex items-center justify-center gap-1.5">
            <Shield className="h-3 w-3 text-[#6c44fc]" />
            Protected by Arcium Confidential Compute
          </div>
        </div>
      )}

      {step === 'done' && signature && (
        <div className="space-y-5">
          <div className="flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#95ffdd]/10 border border-[#95ffdd]/25">
              <CheckCircle2 className="h-8 w-8 text-[#95ffdd]" />
            </div>
          </div>

          <div className="text-center">
            <p className="text-xl font-bold text-white">{formatCurrency(total)} Sent</p>
            <p className="text-sm text-[#999999] mt-1">Confirmed on Solana devnet</p>
          </div>

          {skipped.length > 0 && (
            <div className="rounded-lg border border-amber-500/20 bg-amber-500/8 p-3">
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
                <span className="text-xs font-semibold text-amber-300">Skipped ({skipped.length})</span>
              </div>
              <p className="text-xs text-[#999999]">{skipped.join(', ')} — no valid wallet address</p>
            </div>
          )}

          <div className="rounded-xl border border-white/10 bg-white/4 p-4">
            <p className="text-xs text-[#666666] mb-2">Transaction</p>
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-[#999999] truncate max-w-[220px]">{signature.slice(0, 24)}…</span>
              <a
                href={getExplorerUrl(signature)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-[#6c44fc] hover:text-[#7c54ff] shrink-0 ml-2"
              >
                <ExternalLink className="h-3 w-3" /> Solscan
              </a>
            </div>
          </div>

          <ArciumBadge size="sm" />
          <Button className="w-full" onClick={handleClose}>Done</Button>
        </div>
      )}

      {step === 'error' && (
        <div className="space-y-5 text-center py-4">
          <div className="flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 border border-red-500/25">
              <AlertTriangle className="h-8 w-8 text-red-400" />
            </div>
          </div>
          <div>
            <p className="text-base font-semibold text-white">Transaction Failed</p>
            <p className="text-sm text-[#999999] mt-1 break-words">{errorMsg}</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={handleClose}>Close</Button>
            <Button className="flex-1" onClick={() => { setStep('confirm'); setErrorMsg('') }}>Try Again</Button>
          </div>
        </div>
      )}
    </Modal>
  )
}
