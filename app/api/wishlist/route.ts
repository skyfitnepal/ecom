import { NextRequest, NextResponse } from 'next/server'
import { saveWishlistItem, removeWishlistItem, getCustomerWishlist } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    if (!email) {
      return NextResponse.json({ success: false, message: 'Email query param is required.' }, { status: 400 })
    }

    const items = await getCustomerWishlist(email)
    return NextResponse.json({ success: true, wishlist: items })
  } catch (error) {
    console.error("API Wishlist GET Error:", error)
    return NextResponse.json({ success: false, message: 'Internal server error.' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, productId } = body

    if (!email || !productId) {
      return NextResponse.json({ success: false, message: 'Email and productId are required.' }, { status: 400 })
    }

    const result = await saveWishlistItem(email, productId)
    if (!result.success) {
      return NextResponse.json({ success: false, message: result.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: result.message })
  } catch (error) {
    console.error("API Wishlist POST Error:", error)
    return NextResponse.json({ success: false, message: 'Internal server error.' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, productId } = body

    if (!email || !productId) {
      return NextResponse.json({ success: false, message: 'Email and productId are required.' }, { status: 400 })
    }

    const result = await removeWishlistItem(email, productId)
    if (!result.success) {
      return NextResponse.json({ success: false, message: result.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: result.message })
  } catch (error) {
    console.error("API Wishlist DELETE Error:", error)
    return NextResponse.json({ success: false, message: 'Internal server error.' }, { status: 500 })
  }
}
