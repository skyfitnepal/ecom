import React from 'react'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getProductById } from '@/lib/db'
import { ShopDetails } from '@/components/ShopDetails'
import { ProductTabs } from '@/components/ProductTabs'
import { YouMayLike } from '@/components/YouMayLike'
import { Footer } from '@/components/Footer'
import { extractProductId } from '@/lib/utils'

interface ProductPageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { id } = await params
  const actualId = extractProductId(id)
  const product = await getProductById(actualId)
  if (!product) return {}

  return {
    title: product.seo_title || `${product.name} | SkyFit`,
    description: product.seo_description || product.desc || `Shop ${product.name} at SkyFit.`,
    keywords: product.seo_keywords || `${product.name}, fitness gear, skyfit`,
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params
  const actualId = extractProductId(id)

  // Find the product matching the id from the database
  const product = await getProductById(actualId)


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

