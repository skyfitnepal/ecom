import { NextRequest, NextResponse } from 'next/server'
import { getAllOrders, updateOrderStatus } from '@/lib/db'

function verifyAdminToken(request: NextRequest): boolean {
  const token = request.headers.get('authorization') || request.nextUrl.searchParams.get('token')
  return token === 'Bearer skyfit_admin_secret_token_2026' || token === 'skyfit_admin_secret_token_2026'
}

export async function GET(request: NextRequest) {
  if (!verifyAdminToken(request)) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
  }

  try {
    const orders = await getAllOrders()
    return NextResponse.json({ success: true, orders })
  } catch (error: any) {
    console.error("Error fetching orders:", error)
    return NextResponse.json({ success: false, message: error.message || 'Internal Server Error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  if (!verifyAdminToken(request)) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { orderId, status } = body
    if (!orderId || !status) {
      return NextResponse.json({ success: false, message: 'orderId and status are required' }, { status: 400 })
    }

    const result = await updateOrderStatus(orderId, status)
    if (result.success) {
      return NextResponse.json(result)
    } else {
      return NextResponse.json(result, { status: 400 })
    }
  } catch (error: any) {
    console.error("Error updating order status:", error)
    return NextResponse.json({ success: false, message: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
