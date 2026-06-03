import { NextRequest, NextResponse } from 'next/server'
import { authenticateCustomer } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json({ success: false, message: 'Email and password are required.' }, { status: 400 })
    }

    const result = await authenticateCustomer(email, password)
    if (!result.success) {
      return NextResponse.json({ success: false, message: result.message }, { status: 400 })
    }

    // Return successfully authenticated customer profile info
    return NextResponse.json({ success: true, message: result.message, customer: result.customer })
  } catch (error) {
    console.error("API Auth Login Error:", error)
    return NextResponse.json({ success: false, message: 'Internal server error.' }, { status: 550 })
  }
}
