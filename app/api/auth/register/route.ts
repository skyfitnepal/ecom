import { NextRequest, NextResponse } from 'next/server'
import { registerCustomer } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, phone, address, password } = body

    if (!name || !email || !phone || !address || !password) {
      return NextResponse.json({ success: false, message: 'All fields are required.' }, { status: 400 })
    }

    const result = await registerCustomer({ name, email, phone, address, password })
    if (!result.success) {
      return NextResponse.json({ success: false, message: result.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, message: result.message, customer: result.customer })
  } catch (error) {
    console.error("API Auth Register Error:", error)
    return NextResponse.json({ success: false, message: 'Internal server error.' }, { status: 550 })
  }
}
