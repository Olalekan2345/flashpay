import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const origin = req.nextUrl.origin
  const response = NextResponse.redirect(new URL('/', origin))
  response.cookies.delete('flashpay_session')
  return response
}

export async function GET(req: NextRequest) {
  const origin = req.nextUrl.origin
  const response = NextResponse.redirect(new URL('/', origin))
  response.cookies.delete('flashpay_session')
  return response
}
