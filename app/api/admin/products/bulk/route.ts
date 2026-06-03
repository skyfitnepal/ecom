import { NextRequest, NextResponse } from 'next/server'
import mongoose from 'mongoose'
import { connectToDatabase } from '@/lib/db'

function verifyAdminToken(request: NextRequest): boolean {
  const token = request.headers.get('authorization') || request.nextUrl.searchParams.get('token')
  return token === 'Bearer skyfit_admin_secret_token_2026' || token === 'skyfit_admin_secret_token_2026'
}

export async function POST(request: NextRequest) {
  if (!verifyAdminToken(request)) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
  }

  try {
    await connectToDatabase()
    const db = mongoose.connection.db
    if (!db) throw new Error("Database connection not established")

    const body = await request.json()
    const { products } = body

    if (!Array.isArray(products) || products.length === 0) {
      return NextResponse.json({ success: false, message: 'No products provided for import' }, { status: 400 })
    }

    const processedProducts = []

    for (const prodData of products) {
      // 1. Resolve Category
      const catName = (prodData.category_name || prodData.category || 'Fitness').trim()
      let catDoc = await db.collection('categories').findOne({ name: { $regex: new RegExp(`^${catName}$`, 'i') } })
      
      if (!catDoc) {
        // Create new category if it doesn't exist
        const slug = catName.toLowerCase().trim().replace(/\s+/g, '-')
        const insertResult = await db.collection('categories').insertOne({
          name: catName,
          slug: slug,
          ancestors: [],
          created_at: new Date(),
          updated_at: new Date()
        })
        catDoc = {
          _id: insertResult.insertedId,
          name: catName,
          slug: slug,
          ancestors: []
        }
      }

      const category_slug = catDoc.slug
      const category_ancestors = catDoc.ancestors || []
      const category_id = catDoc._id

      // 2. Parse arrays (from comma separated strings or arrays)
      const parseCommaStringOrArray = (input: any) => {
        if (!input) return null
        if (Array.isArray(input)) return input.map(x => String(x).trim()).filter(Boolean)
        return String(input).split(',').map(x => x.trim()).filter(Boolean)
      }

      const colors = parseCommaStringOrArray(prodData.colors || prodData['colors (comma separated)']) || ['Black', 'Grey']
      const sizes = parseCommaStringOrArray(prodData.sizes || prodData['sizes (comma separated)']) || ['S', 'M', 'L', 'XL']
      
      const rawImages = parseCommaStringOrArray(prodData.images || prodData['images (comma separated urls)']) || []
      const images = rawImages.map((img: string) => ({
        src: img,
        alt: prodData.name || ''
      }))

      if (images.length === 0) {
        images.push({ src: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd', alt: prodData.name || '' })
      }

      // 3. Format product document
      const price = Number(prodData.price) || 0
      const sale_price = prodData.sale_price ? Number(prodData.sale_price) : null
      const stock = Number(prodData.stock) !== undefined && !isNaN(Number(prodData.stock)) ? Number(prodData.stock) : 10

      const newProd = {
        sku: prodData.sku || 'SKU-' + Math.floor(100000 + Math.random() * 900000),
        name: prodData.name || 'Unnamed Product',
        price: price,
        sale_price: sale_price,
        description: prodData.description || '',
        rating: {
          average: 4.5,
          count: 10
        },
        stock: stock,
        availability: stock > 0 ? 'In Stock' : 'Out of Stock',
        images: images,
        colors: colors,
        sizes: sizes,
        category_name: catName,
        category_slug: category_slug,
        category_id: category_id,
        category_ancestors: category_ancestors,
        has_variants: !!prodData.has_variants || (colors.length > 0 || sizes.length > 0),
        variant_options: ['Colors', 'Sizes'],
        variants: [], // Empty or default can be customized later
        seo_title: prodData.seo_title || prodData['seo title'] || '',
        seo_description: prodData.seo_description || prodData['seo description'] || '',
        seo_keywords: prodData.seo_keywords || prodData['seo keywords'] || '',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      }

      processedProducts.push(newProd)
    }

    // 4. Batch insert into database
    const result = await db.collection('products').insertMany(processedProducts)

    return NextResponse.json({
      success: true,
      message: `${result.insertedCount} products imported successfully!`,
      count: result.insertedCount
    })
  } catch (error: any) {
    console.error("Error bulk importing products:", error)
    return NextResponse.json({ success: false, message: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
