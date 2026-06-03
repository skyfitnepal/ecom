import { NextRequest, NextResponse } from 'next/server'
import mongoose from 'mongoose'
import { connectToDatabase, createProduct, updateProduct, deleteProduct } from '@/lib/db'

// Simple helper to verify if the request has the admin token
function verifyAdminToken(request: NextRequest): boolean {
  const token = request.headers.get('authorization') || request.nextUrl.searchParams.get('token')
  return token === 'Bearer skyfit_admin_secret_token_2026' || token === 'skyfit_admin_secret_token_2026'
}

export async function GET(request: NextRequest) {
  if (!verifyAdminToken(request)) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
  }

  try {
    await connectToDatabase()
    const db = mongoose.connection.db
    if (!db) throw new Error("Database connection not established")

    const rawProducts = await db.collection('products')
      .find({})
      .sort({ created_at: -1 })
      .toArray()

    const products = rawProducts.map(p => ({
      ...p,
      _id: p._id.toString(),
      images: Array.isArray(p.images)
        ? p.images.map((img: any) => typeof img === 'string' ? img : (img.src || ''))
        : (p.thumbnail ? [p.thumbnail] : [])
    }))

    return NextResponse.json({ success: true, products })
  } catch (error: any) {
    console.error("Error fetching admin products:", error)
    return NextResponse.json({ success: false, message: error.message || 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  if (!verifyAdminToken(request)) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const result = await createProduct(body)
    if (result.success) {
      return NextResponse.json(result)
    } else {
      return NextResponse.json(result, { status: 400 })
    }
  } catch (error: any) {
    console.error("Error creating product:", error)
    return NextResponse.json({ success: false, message: error.message || 'Internal Server Error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  if (!verifyAdminToken(request)) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) {
      return NextResponse.json({ success: false, message: 'Product ID/SKU is required' }, { status: 400 })
    }

    const body = await request.json()
    const result = await updateProduct(id, body)
    if (result.success) {
      return NextResponse.json(result)
    } else {
      return NextResponse.json(result, { status: 400 })
    }
  } catch (error: any) {
    console.error("Error updating product:", error)
    return NextResponse.json({ success: false, message: error.message || 'Internal Server Error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  if (!verifyAdminToken(request)) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) {
      return NextResponse.json({ success: false, message: 'Product ID/SKU is required' }, { status: 400 })
    }

    const result = await deleteProduct(id)
    if (result.success) {
      return NextResponse.json(result)
    } else {
      return NextResponse.json(result, { status: 400 })
    }
  } catch (error: any) {
    console.error("Error deleting product:", error)
    return NextResponse.json({ success: false, message: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
