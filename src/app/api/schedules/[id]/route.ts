import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session || session.role !== 'employer') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const updates = await req.json()
  await db.updateSchedule(id, updates)
  return NextResponse.json({ success: true })
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session || session.role !== 'employer') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  await db.deleteSchedule(id)
  return NextResponse.json({ success: true })
}
