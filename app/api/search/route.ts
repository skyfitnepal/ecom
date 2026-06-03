import { NextRequest, NextResponse } from 'next/server'
import { searchProducts } from '@/lib/db'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q') || ''

  try {
    const products = await searchProducts(query, 8)
    return NextResponse.json({ success: true, products })
  } catch (error) {
    console.error("API Search Error:", error)
    return NextResponse.json({ success: false, products: [] }, { status: 500 })
  }
}
