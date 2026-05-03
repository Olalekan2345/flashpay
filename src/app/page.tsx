import Link from 'next/link'
import {
  Zap, Shield, Globe, Users, BarChart3, CheckCircle2,
  ArrowRight, Lock, DollarSign, Clock
} from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-white/8 bg-black/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg overflow-hidden shadow-[0_0_16px_rgba(108,68,252,0.4)]">
              <img src="/logo.png" alt="FlashPay" className="h-8 w-8 object-cover" />
            </div>
            <span className="text-lg font-bold">
              FlashPay <span className="text-[#6c44fc]">Private</span>
            </span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm text-[#999999]">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">How it works</a>
            <a href="#privacy" className="hover:text-white transition-colors">Privacy</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-[#999999] hover:text-white transition-colors">Sign in</Link>
            <Link href="/login" className="rounded-lg bg-[#6c44fc] px-4 py-2 text-sm font-semibold text-white hover:bg-[#7c54ff] shadow-[0_0_16px_rgba(108,68,252,0.3)] transition-all">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden px-6 pb-24 pt-20">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-1/2 top-0 h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/4 rounded-full bg-[#6c44fc]/10 blur-3xl" />
          <div className="absolute right-1/4 top-1/3 h-[400px] w-[400px] rounded-full bg-[#5de2da]/6 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-7xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#6c44fc]/30 bg-[#6c44fc]/10 px-4 py-1.5 text-sm">
            <div className="h-1.5 w-1.5 rounded-full bg-[#6c44fc] animate-pulse" />
            <span className="text-white/80 font-medium">Powered by Arcium Confidential Compute + Solana</span>
          </div>
          <h1 className="mx-auto max-w-4xl text-5xl font-bold leading-tight tracking-tight md:text-7xl">
            Global Payroll.{' '}
            <span className="gradient-text">Instant Settlement.</span>
            <br />Complete Privacy.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-[#999999] leading-relaxed">
            FlashPay Private lets you pay remote teams, agencies, and DAOs globally in USDC —
            while keeping salary data fully confidential through Arcium&apos;s multi-party computation network.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link href="/login" className="group flex items-center gap-2 rounded-xl bg-[#6c44fc] px-8 py-4 text-base font-semibold text-white hover:bg-[#7c54ff] shadow-[0_0_32px_rgba(108,68,252,0.35)] transition-all duration-200 active:scale-[0.98]">
              Connect Wallet &amp; Get Started
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link href="/dashboard" className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-8 py-4 text-base font-semibold text-white/80 hover:bg-white/8 hover:text-white transition-all duration-200">
              View Dashboard
            </Link>
          </div>
          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-[#666666]">
            {['No crypto knowledge required', 'Pay 190+ countries', '<$0.001 per transaction', 'Salary data never exposed'].map((t, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-[#95ffdd]" />{t}
              </div>
            ))}
          </div>
        </div>

        {/* Dashboard preview */}
        <div className="relative mx-auto mt-16 max-w-5xl">
          <div className="rounded-2xl border border-white/10 bg-[#0e0e0e] p-1 shadow-2xl">
            <div className="rounded-xl bg-[#141414] p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-xs text-[#666666] uppercase tracking-wider">Treasury Balance</p>
                  <p className="text-3xl font-bold text-white mt-1">$87,420.50 <span className="text-lg text-[#999999]">USDC</span></p>
                </div>
                <div className="flex items-center gap-1.5 rounded-full bg-[#95ffdd]/10 border border-[#95ffdd]/25 px-3 py-1">
                  <div className="h-1.5 w-1.5 rounded-full bg-[#95ffdd] animate-pulse" />
                  <span className="text-xs text-[#95ffdd] font-medium">5 Active Employees</span>
                </div>
              </div>
              <div className="space-y-2">
                {[
                  { name: 'Priya Sharma', role: 'Senior Frontend Engineer', flag: '🇮🇳', next: 'Jun 1' },
                  { name: 'James Okonkwo', role: 'Blockchain Engineer', flag: '🇳🇬', next: 'Jun 1' },
                  { name: 'Sofia Mendez', role: 'Product Designer', flag: '🇲🇽', next: 'May 8' },
                ].map((emp, i) => (
                  <div key={i} className="flex items-center justify-between rounded-lg bg-[#1a1a1a] px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#6c44fc] text-xs font-bold text-white">
                        {emp.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">{emp.name}</p>
                        <p className="text-xs text-[#666666]">{emp.role} {emp.flag}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="hidden sm:flex items-center gap-1 rounded-full border border-[#6c44fc]/30 bg-[#6c44fc]/10 px-2 py-0.5">
                        <Lock className="h-2.5 w-2.5 text-[#6c44fc]" />
                        <span className="text-xs text-white/70 font-medium">Confidential</span>
                      </div>
                      <span className="text-xs text-[#666666]">Next: {emp.next}</span>
                      <div className="flex items-center gap-1 rounded-full bg-[#95ffdd]/10 border border-[#95ffdd]/25 px-2 py-0.5">
                        <div className="h-1.5 w-1.5 rounded-full bg-[#95ffdd]" />
                        <span className="text-xs text-[#95ffdd] font-medium">Active</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="absolute -bottom-8 left-1/2 h-32 w-3/4 -translate-x-1/2 rounded-full bg-[#6c44fc]/10 blur-3xl" />
        </div>
      </section>

      {/* Stats bar */}
      <section className="border-y border-white/8 bg-[#0e0e0e]/50">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {[
              { value: '~400ms', label: 'Settlement Time', icon: Zap, color: 'text-[#5de2da]' },
              { value: '$0.00025', label: 'Avg Fee', icon: DollarSign, color: 'text-[#95ffdd]' },
              { value: '100%', label: 'Salary Privacy', icon: Shield, color: 'text-[#6c44fc]' },
              { value: '190+', label: 'Countries', icon: Globe, color: 'text-white' },
            ].map(({ value, label, icon: Icon, color }, i) => (
              <div key={i} className="text-center">
                <Icon className={`mx-auto mb-2 h-5 w-5 ${color}`} />
                <p className={`text-2xl font-bold ${color}`}>{value}</p>
                <p className="text-sm text-[#666666] mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-[#6c44fc] uppercase tracking-wider mb-3">Product Features</p>
            <h2 className="text-4xl font-bold text-white">Everything you need to run<br />global payroll with confidence</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: Shield, color: 'text-[#6c44fc]', bg: 'bg-[#6c44fc]/10 border-[#6c44fc]/20', title: 'Confidential Salaries', desc: "Arcium's MPC network encrypts all salary data. Individual compensation is never exposed in blockchain transactions or visible to other employees." },
              { icon: Zap, color: 'text-[#5de2da]', bg: 'bg-[#5de2da]/10 border-[#5de2da]/20', title: 'Instant Global Payments', desc: "Solana's 400ms finality means your team gets paid almost instantly, anywhere in the world, for a fraction of a cent." },
              { icon: Users, color: 'text-white/80', bg: 'bg-white/5 border-white/10', title: 'Walletless Onboarding', desc: "Employees don't need crypto knowledge. They click an invite link, connect Phantom or generate an embedded wallet." },
              { icon: BarChart3, color: 'text-[#6c44fc]', bg: 'bg-[#6c44fc]/10 border-[#6c44fc]/20', title: 'Private Analytics', desc: 'Track payouts, treasury health, and employee costs — computed privately through Arcium without exposing individual salaries.' },
              { icon: Clock, color: 'text-[#95ffdd]', bg: 'bg-[#95ffdd]/10 border-[#95ffdd]/20', title: 'Automated Scheduling', desc: 'Set weekly, monthly, or one-time payroll runs. FlashPay handles recurring payments automatically on your schedule.' },
              { icon: Globe, color: 'text-[#5de2da]', bg: 'bg-[#5de2da]/10 border-[#5de2da]/20', title: 'USDC Everywhere', desc: 'All payments in USDC — a dollar-pegged stablecoin. No FX exposure, no bank delays. Instant, stable global payments.' },
            ].map(({ icon: Icon, color, bg, title, desc }, i) => (
              <div key={i} className="rounded-xl border border-white/8 bg-[#0e0e0e] p-6 hover:border-white/15 hover:bg-[#141414] transition-all duration-200">
                <div className={`mb-4 flex h-10 w-10 items-center justify-center rounded-xl border ${bg}`}>
                  <Icon className={`h-5 w-5 ${color}`} />
                </div>
                <h3 className="mb-2 text-base font-semibold text-white">{title}</h3>
                <p className="text-sm text-[#999999] leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Privacy */}
      <section id="privacy" className="px-6 py-24 bg-[#0e0e0e]/40">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-16 lg:grid-cols-2 items-center">
            <div>
              <p className="text-sm font-semibold text-[#6c44fc] uppercase tracking-wider mb-3">Arcium Integration</p>
              <h2 className="text-4xl font-bold text-white mb-6">Confidential payroll,<br />not just encrypted storage</h2>
              <p className="text-[#999999] leading-relaxed mb-8">
                Traditional on-chain payroll exposes everything: who gets paid, how much, and when.
                FlashPay Private uses Arcium&apos;s Multi-Party Execution Environment (MXE) to keep
                all salary data confidential at every step.
              </p>
              <div className="space-y-4">
                {[
                  { title: 'MPC Encryption', desc: "Salary amounts are split across Arcium's node network. No single party can reconstruct the value." },
                  { title: 'Private Computation', desc: 'Payroll totals are computed over encrypted values. The sum is revealed; individual amounts are not.' },
                  { title: 'Access-Controlled Decryption', desc: 'Only the employer and the specific employee can decrypt their own salary record, verified cryptographically.' },
                  { title: 'Zero-Knowledge Proofs', desc: 'Payments are proven correct without revealing the amount — verified on Solana with cryptographic certainty.' },
                ].map(({ title, desc }, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#6c44fc]/20">
                      <CheckCircle2 className="h-3 w-3 text-[#6c44fc]" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{title}</p>
                      <p className="text-sm text-[#999999]">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-[#6c44fc]/20 bg-[#6c44fc]/5 p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#6c44fc]/20">
                  <Shield className="h-5 w-5 text-[#6c44fc]" />
                </div>
                <div>
                  <p className="font-semibold text-white">Arcium MXE Network</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <div className="h-1.5 w-1.5 rounded-full bg-[#95ffdd] animate-pulse" />
                    <p className="text-xs text-[#95ffdd]">Operational</p>
                  </div>
                </div>
              </div>
              <div className="space-y-3 font-mono text-xs">
                {[
                  { label: 'Encryption', value: 'AES-256-GCM + MPC', color: 'text-[#6c44fc]' },
                  { label: 'Access Policy', value: 'Employer + Employee', color: 'text-[#5de2da]' },
                  { label: 'On-chain proof', value: 'ZK-SNARK verified', color: 'text-[#95ffdd]' },
                  { label: 'Salary visibility', value: '🔒 CONFIDENTIAL', color: 'text-white/50' },
                  { label: 'Payment amount', value: '🔒 PRIVATE', color: 'text-white/50' },
                  { label: 'Aggregate total', value: '✓ Employer only', color: 'text-[#95ffdd]' },
                ].map(({ label, value, color }, i) => (
                  <div key={i} className="flex justify-between rounded-lg bg-black/40 px-3 py-2">
                    <span className="text-[#666666]">{label}</span>
                    <span className={color}>{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white">From setup to payday in minutes</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-4">
            {[
              { step: '01', title: 'Connect & Fund', desc: 'Connect your Phantom wallet and deposit USDC into your payroll treasury.' },
              { step: '02', title: 'Add Employees', desc: 'Add workers with their salary amount — encrypted via Arcium MPC immediately.' },
              { step: '03', title: 'Invite & Onboard', desc: 'Send invite links. Employees join without needing crypto knowledge.' },
              { step: '04', title: 'Run Payroll', desc: 'Pay one or all employees instantly. Solana settles in ~400ms worldwide.' },
            ].map(({ step, title, desc }, i) => (
              <div key={i}>
                <div className="text-5xl font-bold text-white/10 mb-4">{step}</div>
                <h3 className="text-base font-semibold text-white mb-2">{title}</h3>
                <p className="text-sm text-[#999999]">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-3xl text-center">
          <div className="rounded-2xl border border-[#6c44fc]/20 bg-gradient-to-br from-[#6c44fc]/12 to-[#5de2da]/6 p-12">
            <h2 className="text-4xl font-bold text-white mb-4">Ready to run confidential global payroll?</h2>
            <p className="text-[#999999] mb-8">Join the future of payroll. Instant. Private. Global.</p>
            <Link href="/login" className="inline-flex items-center gap-2 rounded-xl bg-[#6c44fc] px-8 py-4 text-base font-semibold text-white hover:bg-[#7c54ff] shadow-[0_0_32px_rgba(108,68,252,0.35)] transition-all">
              Connect Wallet &amp; Start <ArrowRight className="h-4 w-4" />
            </Link>
            <p className="mt-4 text-xs text-[#666666]">Requires Phantom wallet on Solana Devnet</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/8 px-6 py-8">
        <div className="mx-auto max-w-7xl flex flex-col items-center gap-4 md:flex-row md:justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded overflow-hidden">
              <img src="/logo.png" alt="FlashPay" className="h-6 w-6 object-cover" />
            </div>
            <span className="text-sm font-semibold text-[#999999]">FlashPay Private</span>
          </div>
          <p className="text-xs text-[#444444]">Built on Solana · Privacy by Arcium · © 2026 FlashPay Private Inc.</p>
          <div className="flex gap-4 text-xs text-[#444444]">
            <a href="#" className="hover:text-[#999999]">Privacy</a>
            <a href="#" className="hover:text-[#999999]">Terms</a>
            <a href="#" className="hover:text-[#999999]">Docs</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
