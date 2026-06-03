import { NextRequest, NextResponse } from 'next/server'
import { updateCustomerProfile } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, name, phone, address } = body

    if (!email || !name || !phone || !address) {
      return NextResponse.json({ success: false, message: 'All fields (name, email, phone, address) are required.' }, { status: 400 })
    }

    const result = await updateCustomerProfile(email, { name, phone, address })
    if (!result.success) {
      return NextResponse.json({ success: false, message: result.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, message: result.message, customer: result.customer })
  } catch (error) {
    console.error("API Auth Update Error:", error)
    return NextResponse.json({ success: false, message: 'Internal server error.' }, { status: 500 })
  }
}
