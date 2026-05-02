import { Sidebar } from '@/components/dashboard/Sidebar'
import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  if (!session || session.role !== 'employer') {
    redirect('/login')
  }

  const initials = session.name
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className="flex h-screen overflow-hidden bg-black">
      <Sidebar companyName={session.company_name || session.name} userInitials={initials} />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
