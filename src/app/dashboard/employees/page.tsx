'use client'
import { useState, useEffect } from 'react'
import { Header } from '@/components/dashboard/Header'
import { AddEmployeeModal } from '@/components/payroll/AddEmployeeModal'
import { ConfidentialSalaryBadge } from '@/components/dashboard/ArciumBadge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import {
  UserPlus, Search, Mail, Copy, Send, Users, CheckCircle2, Clock,
  Pencil, Trash2, X, Shield,
} from 'lucide-react'
import { formatDate, shortenAddress } from '@/lib/utils'

interface Employee {
  id: string
  full_name: string
  email: string
  country: string
  job_role: string
  wallet_address: string
  pay_frequency: string
  status: string
  invite_token: string
  next_pay_date: string
  created_at: string
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [addOpen, setAddOpen] = useState(false)
  const [search, setSearch] = useState('')

  const [editEmp, setEditEmp] = useState<Employee | null>(null)
  const [editSalary, setEditSalary] = useState('')
  const [editRole, setEditRole] = useState('')
  const [editFreq, setEditFreq] = useState('')
  const [editSaving, setEditSaving] = useState(false)

  const [deleteEmp, setDeleteEmp] = useState<Employee | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => { fetchEmployees() }, [])

  const fetchEmployees = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/employees')
      const data = await res.json()
      setEmployees(data.employees || [])
    } catch {
      toast.error('Failed to load employees')
    } finally {
      setLoading(false)
    }
  }

  const copyInviteLink = (token: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/invite/${token}`)
    toast.success('Invite link copied!')
  }

  const resendInvite = async (empId: string) => {
    toast.promise(
      fetch(`/api/employees/${empId}/invite`, { method: 'POST' }).then(r => r.json()),
      { loading: 'Sending invite…', success: 'Invite sent!', error: 'Failed to send' }
    )
  }

  const openEdit = (emp: Employee) => {
    setEditEmp(emp)
    setEditSalary('')
    setEditRole(emp.job_role)
    setEditFreq(emp.pay_frequency)
  }

  const saveEdit = async () => {
    if (!editEmp) return
    setEditSaving(true)
    try {
      const body: Record<string, unknown> = {
        job_role: editRole,
        pay_frequency: editFreq,
      }
      if (editSalary.trim()) {
        const amt = parseFloat(editSalary)
        if (isNaN(amt) || amt <= 0) { toast.error('Enter a valid salary amount'); return }
        body.salary_amount = amt
      }
      const res = await fetch(`/api/employees/${editEmp.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setEmployees(prev => prev.map(e => e.id === editEmp.id ? { ...e, ...data.employee } : e))
      toast.success('Employee updated')
      setEditEmp(null)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Update failed')
    } finally {
      setEditSaving(false)
    }
  }

  const confirmDelete = async () => {
    if (!deleteEmp) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/employees/${deleteEmp.id}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setEmployees(prev => prev.filter(e => e.id !== deleteEmp.id))
      toast.success(`${deleteEmp.full_name} removed`)
      setDeleteEmp(null)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Delete failed')
    } finally {
      setDeleting(false)
    }
  }

  const filtered = employees.filter(
    e => e.full_name.toLowerCase().includes(search.toLowerCase()) ||
         e.email.toLowerCase().includes(search.toLowerCase()) ||
         e.job_role.toLowerCase().includes(search.toLowerCase())
  )

  const active = employees.filter(e => e.status === 'active').length
  const pending = employees.filter(e => e.status === 'pending_onboarding').length

  return (
    <div className="fade-in">
      <Header title="Employees" subtitle="Manage your global team" />
      <div className="p-6 space-y-6">

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total', value: employees.length, icon: Users, color: 'text-white', bg: 'bg-white/5 border-white/8' },
            { label: 'Active', value: active, icon: CheckCircle2, color: 'text-[#95ffdd]', bg: 'bg-[#95ffdd]/8 border-[#95ffdd]/20' },
            { label: 'Pending Onboarding', value: pending, icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/8 border-amber-500/20' },
          ].map(({ label, value, icon: Icon, color, bg }, i) => (
            <div key={i} className={`rounded-xl border ${bg} p-4 flex items-center gap-4`}>
              <Icon className={`h-5 w-5 ${color}`} />
              <div>
                <p className={`text-xl font-bold ${color}`}>{value}</p>
                <p className="text-xs text-[#666666]">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#666666]" />
            <input
              className="w-full rounded-lg border border-white/10 bg-[#141414] pl-9 pr-3 py-2 text-sm text-white placeholder:text-[#666666] focus:outline-none focus:ring-2 focus:ring-[#6c44fc]/50 focus:border-[#6c44fc]/40"
              placeholder="Search employees…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <Button onClick={() => setAddOpen(true)}>
            <UserPlus className="h-4 w-4" /> Add Employee
          </Button>
        </div>

        {/* Table */}
        <div className="rounded-xl border border-white/8 bg-[#141414] overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-[#666666] text-sm">Loading employees…</div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Users className="h-10 w-10 text-[#333333]" />
              <p className="text-[#666666] text-sm">{search ? 'No employees match your search' : 'No employees yet — add your first team member'}</p>
              {!search && <Button size="sm" onClick={() => setAddOpen(true)}><UserPlus className="h-3.5 w-3.5" />Add Employee</Button>}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/8">
                    <th className="px-6 py-3.5 text-left text-xs font-medium text-[#666666] uppercase tracking-wider">Employee</th>
                    <th className="px-6 py-3.5 text-left text-xs font-medium text-[#666666] uppercase tracking-wider">Role &amp; Location</th>
                    <th className="px-6 py-3.5 text-left text-xs font-medium text-[#666666] uppercase tracking-wider">Salary</th>
                    <th className="px-6 py-3.5 text-left text-xs font-medium text-[#666666] uppercase tracking-wider">Wallet</th>
                    <th className="px-6 py-3.5 text-left text-xs font-medium text-[#666666] uppercase tracking-wider">Next Pay</th>
                    <th className="px-6 py-3.5 text-left text-xs font-medium text-[#666666] uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3.5 text-right text-xs font-medium text-[#666666] uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/4">
                  {filtered.map(emp => (
                    <tr key={emp.id} className="hover:bg-white/2 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#6c44fc] text-xs font-bold text-white">
                            {emp.full_name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-white">{emp.full_name}</p>
                            <p className="text-xs text-[#666666] flex items-center gap-1">
                              <Mail className="h-3 w-3" />{emp.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-white/80">{emp.job_role}</p>
                        <p className="text-xs text-[#666666]">{emp.country}</p>
                      </td>
                      <td className="px-6 py-4">
                        <ConfidentialSalaryBadge />
                        <p className="mt-1 text-xs text-[#666666] capitalize">{emp.pay_frequency}</p>
                      </td>
                      <td className="px-6 py-4">
                        {emp.wallet_address ? (
                          <span className="font-mono text-xs text-[#999999]">{shortenAddress(emp.wallet_address)}</span>
                        ) : (
                          <span className="text-xs text-amber-400">Not connected</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-[#999999]">
                        {emp.next_pay_date ? formatDate(emp.next_pay_date) : '—'}
                      </td>
                      <td className="px-6 py-4">
                        {emp.status === 'active' ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-[#95ffdd]/10 border border-[#95ffdd]/20 px-2.5 py-1 text-xs text-[#95ffdd] font-medium">
                            <div className="h-1.5 w-1.5 rounded-full bg-[#95ffdd]" />Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 text-xs text-amber-400 font-medium">
                            <div className="h-1.5 w-1.5 rounded-full bg-amber-400" />Onboarding
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => copyInviteLink(emp.invite_token)}
                            className="rounded-lg p-1.5 text-[#666666] hover:bg-white/8 hover:text-white transition-colors"
                            title="Copy invite link"
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => resendInvite(emp.id)}
                            className="rounded-lg p-1.5 text-[#666666] hover:bg-white/8 hover:text-white transition-colors"
                            title="Resend invite email"
                          >
                            <Send className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => openEdit(emp)}
                            className="rounded-lg p-1.5 text-[#666666] hover:bg-[#6c44fc]/15 hover:text-[#6c44fc] transition-colors"
                            title="Edit employee"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setDeleteEmp(emp)}
                            className="rounded-lg p-1.5 text-[#666666] hover:bg-red-500/15 hover:text-red-400 transition-colors"
                            title="Remove employee"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <AddEmployeeModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSuccess={(emp) => setEmployees(prev => [emp as unknown as Employee, ...prev])}
      />

      {/* Edit Modal */}
      {editEmp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#141414] p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-bold text-white">Edit Employee</h2>
                <p className="text-xs text-[#666666] mt-0.5">{editEmp.full_name}</p>
              </div>
              <button onClick={() => setEditEmp(null)} className="rounded-lg p-1.5 text-[#666666] hover:bg-white/8 hover:text-white transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4">
              <Input
                label="Job Role"
                value={editRole}
                onChange={e => setEditRole(e.target.value)}
                placeholder="e.g. Senior Engineer"
              />

              <div>
                <label className="block text-xs font-medium text-white/70 mb-1.5">Pay Frequency</label>
                <select
                  value={editFreq}
                  onChange={e => setEditFreq(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-[#141414] px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#6c44fc]/50"
                >
                  <option value="monthly">Monthly</option>
                  <option value="weekly">Weekly</option>
                  <option value="biweekly">Bi-weekly</option>
                </select>
              </div>

              <div>
                <Input
                  label="New Salary (USDC)"
                  type="number"
                  value={editSalary}
                  onChange={e => setEditSalary(e.target.value)}
                  placeholder="Leave blank to keep current salary"
                />
                <p className="mt-1 flex items-center gap-1 text-xs text-[#666666]">
                  <Shield className="h-3 w-3 text-[#6c44fc]" />
                  New amount will be re-encrypted by Arcium MPC
                </p>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setEditEmp(null)}>Cancel</Button>
              <Button className="flex-1" onClick={saveEdit} loading={editSaving}>Save Changes</Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteEmp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
          <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#141414] p-6 shadow-2xl">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 border border-red-500/25">
              <Trash2 className="h-6 w-6 text-red-400" />
            </div>
            <h2 className="text-lg font-bold text-white mb-1">Remove Employee?</h2>
            <p className="text-sm text-[#999999] mb-1">
              <span className="text-white font-medium">{deleteEmp.full_name}</span> will be permanently removed from your payroll.
            </p>
            <p className="text-xs text-[#666666] mb-6">
              Their wallet will be free to register as an employer after removal.
            </p>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setDeleteEmp(null)}>Cancel</Button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="flex-1 rounded-lg bg-red-600 hover:bg-red-500 disabled:opacity-40 px-4 py-2 text-sm font-semibold text-white transition-colors"
              >
                {deleting ? 'Removing…' : 'Remove Employee'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
