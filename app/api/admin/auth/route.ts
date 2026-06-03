import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, password } = body

    if (username === 'pratik' && password === 'Nepal@123') {
      // Return a basic token for verification.
      return NextResponse.json({ 
        success: true, 
        token: 'skyfit_admin_secret_token_2026', 
        message: 'Authentication successful' 
      })
    }

    return NextResponse.json({ success: false, message: 'Invalid credentials' }, { status: 401 })
  } catch (error) {
    console.error("Admin Login Error:", error)
    return NextResponse.json({ success: false, message: 'An error occurred during authentication' }, { status: 500 })
  }
}
