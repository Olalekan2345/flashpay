import { Header } from '@/components/dashboard/Header'
import { getSession } from '@/lib/auth'
import { ArciumStatusBanner } from '@/components/dashboard/ArciumBadge'
import { Shield, User, Building2 } from 'lucide-react'

export default async function SettingsPage() {
  const session = await getSession()
  if (!session) return null

  return (
    <div className="fade-in">
      <Header title="Settings" subtitle="Account and workspace configuration" />
      <div className="p-6 space-y-6">
        <ArciumStatusBanner />

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl border border-white/8 bg-[#141414] p-6">
            <div className="flex items-center gap-2 mb-4">
              <User className="h-4 w-4 text-[#999999]" />
              <h2 className="text-sm font-semibold text-white">Account</h2>
            </div>
            <div className="space-y-3">
              {[
                { label: 'Name', value: session.name },
                { label: 'Email', value: session.email },
                { label: 'Role', value: 'Employer' },
              ].map(({ label, value }, i) => (
                <div key={i} className="flex justify-between py-2 border-b border-white/5">
                  <span className="text-sm text-[#999999]">{label}</span>
                  <span className="text-sm text-white">{value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-white/8 bg-[#141414] p-6">
            <div className="flex items-center gap-2 mb-4">
              <Building2 className="h-4 w-4 text-[#999999]" />
              <h2 className="text-sm font-semibold text-white">Company</h2>
            </div>
            <div className="space-y-3">
              {[
                { label: 'Company', value: session.company_name || '—' },
                { label: 'Plan', value: 'Growth' },
                { label: 'Network', value: 'Solana Devnet' },
              ].map(({ label, value }, i) => (
                <div key={i} className="flex justify-between py-2 border-b border-white/5">
                  <span className="text-sm text-[#999999]">{label}</span>
                  <span className="text-sm text-white">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-[#6c44fc]/20 bg-[#6c44fc]/6 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="h-4 w-4 text-[#6c44fc]" />
            <h2 className="text-sm font-semibold text-white">Privacy &amp; Security</h2>
          </div>
          <div className="space-y-3 text-sm text-[#999999]">
            {[
              'All salary data encrypted via Arcium MPC before storage',
              'Zero-knowledge proofs generated for every payment',
              'Access-controlled decryption — only authorized parties can view salary',
              'No plaintext salary amounts in any database or blockchain transaction',
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-[#6c44fc]" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
