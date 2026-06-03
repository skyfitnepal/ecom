import { NextRequest, NextResponse } from 'next/server'
import mongoose from 'mongoose'
import { connectToDatabase } from '@/lib/db'

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

    const categories = await db.collection('categories')
      .find({})
      .toArray()

    const formatted = categories.map(c => ({
      ...c,
      _id: c._id.toString()
    }))

    return NextResponse.json({ success: true, categories: formatted })
  } catch (error: any) {
    console.error("Error fetching categories:", error)
    return NextResponse.json({ success: false, message: error.message || 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  if (!verifyAdminToken(request)) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { name, slug, imageUrl, parentId } = body
    if (!name || !slug) {
      return NextResponse.json({ success: false, message: 'Name and slug are required' }, { status: 400 })
    }

    await connectToDatabase()
    const db = mongoose.connection.db
    if (!db) throw new Error("Database connection not established")

    // Check if category with this slug already exists
    const existing = await db.collection('categories').findOne({ slug })
    if (existing) {
      return NextResponse.json({ success: false, message: 'A category with this slug already exists' }, { status: 400 })
    }

    let computedLevel = 1
    let ancestors: any[] = []
    if (parentId) {
      const parentCat = await db.collection('categories').findOne({ _id: parentId as any })
      if (parentCat) {
        computedLevel = (parentCat.level || 1) + 1
        ancestors = [
          ...(parentCat.ancestors || []),
          {
            _id: parentCat._id,
            name: parentCat.name,
            slug: parentCat.slug
          }
        ]
      }
    }

    // Generate custom code pattern or fallback timestamp string for _id
    const generatedId = parentId ? `${parentId}-${Math.floor(10 + Math.random() * 90)}` : `CAT-${Math.floor(10 + Math.random() * 90)}`

    const newCat = {
      _id: generatedId,
      name,
      slug: slug.toLowerCase().trim().replace(/\s+/g, '-'),
      image: {
        src: imageUrl || '',
        alt: name
      },
      parent_id: parentId || null,
      level: computedLevel,
      ancestors,
      is_active: true,
      is_leaf: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    await db.collection('categories').insertOne(newCat as any)

    // Mark parent as is_leaf = false if it was true
    if (parentId) {
      await db.collection('categories').updateOne({ _id: parentId as any }, { $set: { is_leaf: false } })
    }

    return NextResponse.json({
      success: true,
      message: 'Category created successfully!',
      categoryId: generatedId
    })
  } catch (error: any) {
    console.error("Error creating category:", error)
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
      return NextResponse.json({ success: false, message: 'Category ID is required' }, { status: 400 })
    }

    const body = await request.json()
    const { name, slug, imageUrl, parentId } = body
    if (!name || !slug) {
      return NextResponse.json({ success: false, message: 'Name and slug are required' }, { status: 400 })
    }

    await connectToDatabase()
    const db = mongoose.connection.db
    if (!db) throw new Error("Database connection not established")

    let computedLevel = 1
    let ancestors: any[] = []
    if (parentId) {
      const parentCat = await db.collection('categories').findOne({ _id: parentId })
      if (parentCat) {
        computedLevel = (parentCat.level || 1) + 1
        ancestors = [
          ...(parentCat.ancestors || []),
          {
            _id: parentCat._id,
            name: parentCat.name,
            slug: parentCat.slug
          }
        ]
      }
    }

    const updateFields: any = {
      name,
      slug: slug.toLowerCase().trim().replace(/\s+/g, '-'),
      'image.src': imageUrl || '',
      'image.alt': name,
      parent_id: parentId || null,
      level: computedLevel,
      ancestors,
      updated_at: new Date().toISOString()
    }

    const result = await db.collection('categories').updateOne(
      { _id: id as any },
      { $set: updateFields }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ success: false, message: 'Category not found' }, { status: 404 })
    }

    // Update parent leaf stats
    if (parentId) {
      await db.collection('categories').updateOne({ _id: parentId as any }, { $set: { is_leaf: false } })
    }

    return NextResponse.json({ success: true, message: 'Category updated successfully!' })
  } catch (error: any) {
    console.error("Error updating category:", error)
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
      return NextResponse.json({ success: false, message: 'Category ID is required' }, { status: 400 })
    }

    await connectToDatabase()
    const db = mongoose.connection.db
    if (!db) throw new Error("Database connection not established")

    // Set parent_id to null for its subcategories
    await db.collection('categories').updateMany({ parent_id: id }, { $set: { parent_id: null, level: 1, ancestors: [] } })

    const result = await db.collection('categories').deleteOne({ _id: id as any })

    if (result.deletedCount === 0) {
      return NextResponse.json({ success: false, message: 'Category not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: 'Category deleted successfully!' })
  } catch (error: any) {
    console.error("Error deleting category:", error)
    return NextResponse.json({ success: false, message: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
