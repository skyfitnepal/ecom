import React from 'react'
import Link from 'next/link'
import { getPopularProducts } from '@/lib/db'
import { getProductUrl } from '@/lib/utils'
import { Footer } from '@/components/Footer'
import { Image as ImageIcon, Star, ChevronRight, Grid, Sparkles } from 'lucide-react'

export default async function PopularPage() {
  const products = await getPopularProducts(12)

  return (
    <div className="bg-white min-h-screen flex flex-col">
      {/* Popular Header Banner */}
      <div className="bg-gray-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-10 sm:py-12">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 mb-4">
            <Link href="/" className="hover:text-[#1a1a1a] transition-colors">Home</Link>
            <ChevronRight size={12} className="text-gray-300" />
            <span className="text-[#128a88] font-bold">Popular Products</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white border border-gray-100 shadow-sm flex items-center justify-center p-2.5 flex-shrink-0">
              <img 
                src="/faviconskyfit.png" 
                alt="SkyFit Logo" 
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-xs font-black uppercase tracking-wider text-[#128a88] bg-[#128a88]/10 px-2 py-0.5 rounded-md flex items-center gap-1">
                  <Sparkles size={10} />
                  Trending
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0c1222]">
                Most Popular Gear
              </h1>
              <p className="text-sm text-gray-500 mt-1 max-w-xl">
                Our customer favorites and top-rated fitness products based on verified reviews.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Control Bar & Results Listing */}
      <div className="flex-1 bg-white py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 lg:px-6">
          
          <div className="flex items-center justify-between border-b border-gray-100 pb-5 mb-8 text-sm">
            <div className="flex items-center gap-2 text-gray-500 font-medium">
              <Grid size={16} className="text-gray-400" />
              <span>Showing <strong className="text-gray-900 font-bold">{products.length}</strong> top products</span>
            </div>
            <div className="text-xs font-semibold text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
              Best Sellers
            </div>
          </div>

          {products.length === 0 ? (
            <div className="text-center py-20 bg-gray-50 rounded-2xl border border-gray-100">
              <h3 className="text-base font-bold text-gray-800 mb-1">No products found</h3>
              <p className="text-sm text-gray-400 max-w-xs mx-auto">
                No popular items are available right now.
              </p>
              <Link
                href="/"
                className="mt-6 inline-flex h-9 px-5 items-center justify-center rounded-full bg-[#1a1a1a] text-white text-xs font-semibold hover:bg-gray-800 transition-all"
              >
                Back to Shop
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 sm:gap-x-6 gap-y-10">
              {products.map((product) => (
                <Link 
                  href={getProductUrl(product)} 
                  key={product.id} 
                  className="group cursor-pointer block"
                >
                  {/* Image Container */}
                  <div className="relative aspect-square rounded-2xl bg-gray-50 border border-gray-100 overflow-hidden mb-4 flex items-center justify-center transition-all duration-300 group-hover:border-gray-200 group-hover:shadow-[0_12px_24px_-10px_rgba(0,0,0,0.06)]">
                    <div className="w-full h-full flex items-center justify-center p-4 transition-all duration-300 group-hover:scale-105">
                      {product.images[0] && product.images[0].startsWith('http') ? (
                        <img 
                          src={product.images[0]} 
                          alt={product.name} 
                          className="w-full h-full object-contain rounded-xl"
                        />
                      ) : (
                        <div className="opacity-20 group-hover:opacity-40 transition-opacity">
                          <ImageIcon className="text-gray-400 w-14 h-14" strokeWidth={1} />
                        </div>
                      )}
                    </div>
                    
                    {product.oldPrice && (
                      <div className="absolute top-3 left-3 bg-[#e11d48] text-white text-[9px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
                        Sale
                      </div>
                    )}
                  </div>

                  {/* Details Block */}
                  <div className="px-1">
                    <span className="text-[10px] font-bold text-[#128a88] uppercase tracking-wider block mb-1">
                      {product.category}
                    </span>
                    <h3 className="text-xs sm:text-sm font-bold text-gray-800 mb-1.5 line-clamp-1 group-hover:text-[#128a88] transition-colors">
                      {product.name}
                    </h3>
                    
                    {/* Rating stars */}
                    <div className="flex items-center gap-1 mb-2">
                      <div className="flex text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            size={11} 
                            fill={i < Math.round(product.rating || 4.5) ? "currentColor" : "none"} 
                            className={i < Math.round(product.rating || 4.5) ? "text-yellow-400" : "text-gray-200"} 
                          />
                        ))}
                      </div>
                      <span className="text-[10px] font-semibold text-gray-400">({product.reviewsCount})</span>
                    </div>

                    <div className="flex flex-wrap items-baseline gap-2">
                      <span className="text-sm sm:text-base font-black text-[#0c1222]">Rs.{product.price.toLocaleString()}</span>
                      {product.oldPrice && (
                        <span className="text-[10px] sm:text-xs font-bold text-gray-400 line-through">Rs.{product.oldPrice.toLocaleString()}</span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  )
}
