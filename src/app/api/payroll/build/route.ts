import { NextRequest, NextResponse } from 'next/server'
import { PublicKey, Transaction } from '@solana/web3.js'
import { connection } from '@/lib/solana'
import {
  createTransferInstruction,
  createAssociatedTokenAccountIdempotentInstruction,
  getAssociatedTokenAddressSync,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from '@solana/spl-token'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { USDC_MINT, USDC_DECIMALS, isValidSolanaAddress } from '@/lib/solana'

function getSalaryFromToken(token: string): number {
  try {
    return JSON.parse(Buffer.from(token, 'base64').toString('utf-8')).amount || 0
  } catch { return 0 }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'employer') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const employer = await db.getEmployerByEmail(session.email)
    if (!employer?.wallet_address) {
      return NextResponse.json({ error: 'Employer wallet not connected' }, { status: 404 })
    }

    const { mode, employee_id } = await req.json()

    let targets = (await db.getEmployees(employer.id)).filter(e => e.status === 'active')
    if (mode === 'single' && employee_id) {
      targets = targets.filter(e => e.id === employee_id)
    }

    const payable = targets.filter(e => e.wallet_address && isValidSolanaAddress(e.wallet_address))
    const skipped = targets.filter(e => !e.wallet_address || !isValidSolanaAddress(e.wallet_address))

    if (payable.length === 0) {
      return NextResponse.json({
        error: 'No employees with valid wallet addresses. Employees must complete onboarding first.',
      }, { status: 400 })
    }

    const employerPubkey = new PublicKey(employer.wallet_address)
    const employerATA = getAssociatedTokenAddressSync(USDC_MINT, employerPubkey)

    const tx = new Transaction()
    const amounts: Record<string, number> = {}

    for (const emp of payable) {
      const salary = getSalaryFromToken(emp.salary_token)
      if (!salary) continue

      const employeePubkey = new PublicKey(emp.wallet_address!)
      const employeeATA = getAssociatedTokenAddressSync(USDC_MINT, employeePubkey)

      tx.add(
        createAssociatedTokenAccountIdempotentInstruction(
          employerPubkey,
          employeeATA,
          employeePubkey,
          USDC_MINT,
          TOKEN_PROGRAM_ID,
          ASSOCIATED_TOKEN_PROGRAM_ID,
        )
      )

      tx.add(
        createTransferInstruction(
          employerATA,
          employeeATA,
          employerPubkey,
          BigInt(Math.round(salary * Math.pow(10, USDC_DECIMALS))),
          [],
          TOKEN_PROGRAM_ID,
        )
      )

      amounts[emp.id] = salary
    }

    if (tx.instructions.length === 0) {
      return NextResponse.json({ error: 'Nothing to pay' }, { status: 400 })
    }

    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('finalized')
    tx.recentBlockhash = blockhash
    tx.feePayer = employerPubkey

    const serialized = tx.serialize({ requireAllSignatures: false, verifySignatures: false })

    return NextResponse.json({
      transaction: serialized.toString('base64'),
      amounts,
      employee_ids: Object.keys(amounts),
      skipped: skipped.map(e => e.full_name),
      total: Object.values(amounts).reduce((s, a) => s + a, 0),
      blockhash,
      lastValidBlockHeight,
    })
  } catch (err) {
    console.error('Payroll build error:', err)
    return NextResponse.json({ error: 'Failed to build transaction' }, { status: 500 })
  }
}
