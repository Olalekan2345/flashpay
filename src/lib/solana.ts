import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js'
import { getAssociatedTokenAddressSync, getAccount } from '@solana/spl-token'

export const SOLANA_NETWORK = 'devnet'
export const SOLANA_ENDPOINT = 'https://api.devnet.solana.com'

// Devnet USDC mint address
export const USDC_MINT = new PublicKey('4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU')
export const USDC_DECIMALS = 6

export const connection = new Connection(SOLANA_ENDPOINT, 'confirmed')

export function lamportsToSol(lamports: number): number {
  return lamports / LAMPORTS_PER_SOL
}

export function solToLamports(sol: number): number {
  return Math.round(sol * LAMPORTS_PER_SOL)
}

export function usdcToRaw(usdc: number): number {
  return Math.round(usdc * Math.pow(10, USDC_DECIMALS))
}

export function rawToUsdc(raw: number): number {
  return raw / Math.pow(10, USDC_DECIMALS)
}

export function isValidSolanaAddress(address: string): boolean {
  try {
    new PublicKey(address)
    return true
  } catch {
    return false
  }
}

export async function getUSDCBalance(walletAddress: string): Promise<number> {
  try {
    const pubkey = new PublicKey(walletAddress)
    const ata = getAssociatedTokenAddressSync(USDC_MINT, pubkey)
    const account = await getAccount(connection, ata)
    return Number(account.amount) / Math.pow(10, USDC_DECIMALS)
  } catch {
    return 0
  }
}

export async function getSolBalance(address: string): Promise<number> {
  try {
    const pubkey = new PublicKey(address)
    const balance = await connection.getBalance(pubkey)
    return lamportsToSol(balance)
  } catch {
    return 0
  }
}

export async function getRecentBlockhash(): Promise<string> {
  const { blockhash } = await connection.getLatestBlockhash('confirmed')
  return blockhash
}

/**
 * Simulate a USDC payment on Solana devnet.
 * In production: uses SPL token transfer via @solana/spl-token.
 * Returns a mock transaction signature for demo purposes.
 */
export async function simulateUSDCTransfer(params: {
  fromAddress: string
  toAddress: string
  amount: number
  memo?: string
}): Promise<{ signature: string; slot: number; confirmations: number }> {
  // Simulate network latency (Solana ~400ms finality)
  await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 400))

  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
  let signature = ''
  for (let i = 0; i < 88; i++) {
    signature += chars[Math.floor(Math.random() * chars.length)]
  }

  const slot = 280000000 + Math.floor(Math.random() * 1000000)

  return {
    signature,
    slot,
    confirmations: 32,
  }
}

export function getExplorerUrl(signature: string): string {
  return `https://explorer.solana.com/tx/${signature}?cluster=devnet`
}

export function getAddressExplorerUrl(address: string): string {
  return `https://explorer.solana.com/address/${address}?cluster=devnet`
}

export const SOLANA_STATS = {
  avgConfirmationMs: 400,
  tps: 65000,
  avgFeeCents: 0.00025,
  networkName: 'Solana Devnet',
}
