import type { Metadata } from 'next'
import { Space_Grotesk } from 'next/font/google'
import { Toaster } from 'sonner'
import { SolanaProvider } from '@/components/wallet/SolanaProvider'
import { ThemeProvider } from '@/components/providers/ThemeProvider'
import './globals.css'

const spaceGrotesk = Space_Grotesk({ variable: '--font-space-grotesk', subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'FlashPay Private — Confidential Global Payroll on Solana',
  description:
    'Run confidential global payroll in seconds. Pay remote teams, agencies, and DAOs with Solana USDC while keeping salary data private via Arcium confidential compute.',
  keywords: 'payroll, Solana, USDC, confidential compute, Arcium, remote work, global payroll',
  openGraph: {
    title: 'FlashPay Private',
    description: 'Confidential Global Payroll Infrastructure on Solana',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} h-full`} suppressHydrationWarning>
      <body className="h-full bg-black antialiased">
        <ThemeProvider>
          <SolanaProvider>
            {children}
          </SolanaProvider>
          <Toaster
            theme="dark"
            position="top-right"
            toastOptions={{
              style: {
                background: '#141414',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#ffffff',
                fontFamily: 'Space Grotesk, system-ui, sans-serif',
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  )
}
