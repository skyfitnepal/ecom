import { NextRequest, NextResponse } from 'next/server'
import { createOrder, getCustomerOrders } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    if (!email) {
      return NextResponse.json({ success: false, message: 'Email query parameter is required.' }, { status: 400 })
    }

    const orders = await getCustomerOrders(email)
    return NextResponse.json({ success: true, orders })
  } catch (error) {
    console.error("API Orders GET Error:", error)
    return NextResponse.json({ success: false, message: 'Internal server error.' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { customer, items, paymentMethod, notes, subtotal, discount, shippingFee, total } = body

    if (!customer || !customer.name || !customer.email || !customer.phone || !customer.address) {
      return NextResponse.json({ success: false, message: 'Customer delivery details are incomplete.' }, { status: 400 })
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ success: false, message: 'Your cart is empty.' }, { status: 400 })
    }

    const result = await createOrder({
      customer,
      items,
      paymentMethod,
      notes,
      subtotal,
      discount,
      shippingFee,
      total
    })

    if (!result.success) {
      return NextResponse.json({ success: false, message: result.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: result.message, orderId: result.orderId })
  } catch (error) {
    console.error("API Orders Create Error:", error)
    return NextResponse.json({ success: false, message: 'Internal server error.' }, { status: 500 })
  }
}
