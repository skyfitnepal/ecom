import { NextRequest, NextResponse } from 'next/server'
import { getAllUsers } from '@/lib/db'

function verifyAdminToken(request: NextRequest): boolean {
  const token = request.headers.get('authorization') || request.nextUrl.searchParams.get('token')
  return token === 'Bearer skyfit_admin_secret_token_2026' || token === 'skyfit_admin_secret_token_2026'
}

export async function GET(request: NextRequest) {
  if (!verifyAdminToken(request)) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
  }

  try {
    const users = await getAllUsers()
    return NextResponse.json({ success: true, users })
  } catch (error: any) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ success: false, message: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
