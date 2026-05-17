import React from 'react'
import { notFound } from 'next/navigation'
import { PRODUCTS } from '@/lib/products'
import { ShopDetails } from '@/components/ShopDetails'
import { ProductTabs } from '@/components/ProductTabs'
import { YouMayLike } from '@/components/YouMayLike'
import { Footer } from '@/components/Footer'

interface ProductPageProps {
  params: Promise<{ id: string }>
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params
  const productId = parseInt(id, 10)

  // Find the product matching the id
  const product = PRODUCTS.find((p) => p.id === productId)

  if (!product) {
    notFound()
  }

  return (
    <div className="bg-white min-h-screen flex flex-col">
      {/* Product Details Section */}
      <div className="flex-1">
        <ShopDetails product={product} />
        <ProductTabs product={product} />
        <YouMayLike currentProduct={product} />
      </div>

      {/* Footer */}
      <Footer />
    </div>
  )
}

// Generate static params for optimal Turbopack/Next.js page speeds
export async function generateStaticParams() {
  return PRODUCTS.map((product) => ({
    id: product.id.toString(),
  }))
}
