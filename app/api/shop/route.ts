import { NextRequest, NextResponse } from 'next/server'
import { getMostSoldProducts, getMostWishlistedProducts, getAllProducts } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limitParam = searchParams.get('limit')
    const limit = limitParam ? parseInt(limitParam, 10) : 4

    const [mostSold, mostWishlisted, allProducts] = await Promise.all([
      getMostSoldProducts(limit),
      getMostWishlistedProducts(limit),
      getAllProducts()
    ])

    return NextResponse.json({
      success: true,
      mostSold,
      mostWishlisted,
      allProducts
    })
  } catch (error) {
    console.error("API Shop GET Error:", error)
    return NextResponse.json({ success: false, message: 'Internal server error.' }, { status: 500 })
  }
}
