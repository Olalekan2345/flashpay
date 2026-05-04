'use client'
import { useState, useEffect } from 'react'
import { Header } from '@/components/dashboard/Header'
import { ArciumStatusBanner } from '@/components/dashboard/ArciumBadge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Shield, User, Building2, Pencil, X, Check } from 'lucide-react'
import { toast } from 'sonner'

interface Profile {
  name: string
  email: string
  company_name: string
}

export default function SettingsPage() {
  const [profile, setProfile] = useState<Profile>({ name: '', email: '', company_name: '' })
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState<Profile>({ name: '', email: '', company_name: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch('/api/me')
      .then(r => r.json())
      .then(d => {
        const p = { name: d.name || '', email: d.email || '', company_name: d.company_name || '' }
        setProfile(p)
        setForm(p)
      })
      .catch(() => {})
  }, [])

  const startEdit = () => {
    setForm({ ...profile })
    setEditing(true)
  }

  const cancelEdit = () => {
    setForm({ ...profile })
    setEditing(false)
  }

  const saveProfile = async () => {
    if (!form.name.trim() || !form.email.trim() || !form.company_name.trim()) {
      toast.error('All fields are required')
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/auth/update-profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setProfile({ ...form })
      setEditing(false)
      toast.success('Profile updated successfully')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fade-in">
      <Header title="Settings" subtitle="Account and workspace configuration" />
      <div className="p-6 space-y-6">
        <ArciumStatusBanner />

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Account card */}
          <div className="rounded-xl border border-white/8 bg-[#141414] p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-[#999999]" />
                <h2 className="text-sm font-semibold text-white">Account</h2>
              </div>
              {!editing ? (
                <button
                  onClick={startEdit}
                  className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-[#6c44fc] border border-[#6c44fc]/20 bg-[#6c44fc]/8 hover:bg-[#6c44fc]/15 transition-colors"
                >
                  <Pencil className="h-3 w-3" /> Edit
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={cancelEdit}
                    className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs text-[#666666] hover:text-white hover:bg-white/5 transition-colors"
                  >
                    <X className="h-3 w-3" /> Cancel
                  </button>
                  <Button size="sm" onClick={saveProfile} loading={saving}>
                    <Check className="h-3 w-3" /> Save
                  </Button>
                </div>
              )}
            </div>

            {editing ? (
              <div className="space-y-4">
                <Input
                  label="Full Name"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                />
                <Input
                  label="Email Address"
                  type="email"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                />
                <Input
                  label="Company Name"
                  value={form.company_name}
                  onChange={e => setForm(f => ({ ...f, company_name: e.target.value }))}
                />
              </div>
            ) : (
              <div className="space-y-3">
                {[
                  { label: 'Name', value: profile.name },
                  { label: 'Email', value: profile.email },
                  { label: 'Company', value: profile.company_name },
                  { label: 'Role', value: 'Employer' },
                ].map(({ label, value }, i) => (
                  <div key={i} className="flex justify-between py-2 border-b border-white/5">
                    <span className="text-sm text-[#999999]">{label}</span>
                    <span className="text-sm text-white truncate max-w-[200px]">{value || '—'}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Company info card */}
          <div className="rounded-xl border border-white/8 bg-[#141414] p-6">
            <div className="flex items-center gap-2 mb-4">
              <Building2 className="h-4 w-4 text-[#999999]" />
              <h2 className="text-sm font-semibold text-white">Workspace</h2>
            </div>
            <div className="space-y-3">
              {[
                { label: 'Plan', value: 'Growth' },
                { label: 'Network', value: 'Solana Devnet' },
                { label: 'Cipher', value: 'RescueCipher (F_p)' },
                { label: 'Key Exchange', value: 'X25519 ECDH' },
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
