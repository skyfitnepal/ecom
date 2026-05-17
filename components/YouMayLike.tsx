'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Eye, Heart, X, Minus, Plus, Star, CheckCircle2, Maximize2, Image as ImageIcon } from 'lucide-react'
import { PRODUCTS, Product } from '@/lib/products'

interface YouMayLikeProps {
  currentProduct: Product
}

export const YouMayLike: React.FC<YouMayLikeProps> = ({ currentProduct }) => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [quantity, setQuantity] = useState(1)

  // Get related products: same category first, then fill up to 4 with other categories
  const getRelatedProducts = () => {
    const sameCategory = PRODUCTS.filter(
      (p) => p.id !== currentProduct.id && p.category === currentProduct.category
    )
    if (sameCategory.length >= 4) {
      return sameCategory.slice(0, 4)
    }

    const otherCategories = PRODUCTS.filter(
      (p) => p.id !== currentProduct.id && p.category !== currentProduct.category
    )
    return [...sameCategory, ...otherCategories].slice(0, 4)
  }

  const relatedList = getRelatedProducts()

  const openQuickView = (e: React.MouseEvent, product: Product) => {
    e.preventDefault()
    e.stopPropagation()
    setSelectedProduct(product)
    setQuantity(1)
  }

  return (
    <section className="bg-white py-16 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 lg:px-6">
        
        {/* Section Header */}
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-2xl font-black text-[#0c1222]">You May Also Like</h2>
          <Link 
            href="/" 
            className="px-6 py-2.5 rounded-full border border-gray-100 text-xs font-black uppercase tracking-wider text-gray-500 hover:bg-[#3b5cf6] hover:text-white hover:border-[#3b5cf6] transition-all"
          >
            Explore More
          </Link>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 xl:gap-8">
          {relatedList.map((product) => (
            <Link 
              href={`/product/${product.id}`} 
              key={product.id} 
              className="group cursor-pointer block"
            >
              {/* Card Image Wrapper */}
              <div className="relative aspect-square rounded-3xl bg-[#f8f9fa] overflow-hidden mb-4 flex items-center justify-center border border-gray-50 transition-all duration-500 group-hover:bg-white group-hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.08)]">
                
                {/* Image Placeholder Icon */}
                <div className="flex flex-col items-center justify-center opacity-20 group-hover:opacity-40 transition-opacity">
                  <ImageIcon size={64} strokeWidth={1} className="text-gray-600" />
                </div>

                {/* Hover Action controls */}
                <div className="absolute inset-0 flex items-end justify-center pb-8 gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-4 group-hover:translate-y-0">
                  <button 
                    onClick={(e) => openQuickView(e, product)}
                    className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-700 hover:bg-[#3b5cf6] hover:text-white hover:scale-105 active:scale-95 transition-all"
                  >
                    <Eye size={18} />
                  </button>
                  <button 
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                    }}
                    className="h-10 px-6 rounded-full bg-[#3b5cf6] text-white text-xs font-black uppercase tracking-wider shadow-lg shadow-blue-500/10 hover:bg-blue-700 hover:scale-105 active:scale-95 transition-all"
                  >
                    Add to cart
                  </button>
                  <button 
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                    }}
                    className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-700 hover:bg-red-500 hover:text-white hover:scale-105 active:scale-95 transition-all"
                  >
                    <Heart size={18} />
                  </button>
                </div>
              </div>

              {/* Product Info Block */}
              <div className="px-2">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">
                  {product.category}
                </span>
                <h3 className="text-sm font-bold text-gray-700 mb-2 line-clamp-1 group-hover:text-[#3b5cf6] transition-colors">
                  {product.name}
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-base font-black text-[#0c1222]">Rs.{product.price}</span>
                  {product.oldPrice && (
                    <span className="text-xs font-bold text-gray-400 line-through">Rs.{product.oldPrice}</span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>

      </div>

      {/* Quick View Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#0c1222]/40 backdrop-blur-sm" onClick={() => setSelectedProduct(null)}></div>
          
          <div className="bg-white rounded-[32px] w-full max-w-4xl relative overflow-hidden shadow-2xl z-10 animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setSelectedProduct(null)}
              className="absolute top-6 right-6 w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:text-gray-800 transition-colors z-20"
            >
              <X size={20} />
            </button>

            <div className="flex flex-col md:flex-row">
              {/* Product Images Area */}
              <div className="md:w-1/2 p-8 flex gap-4 bg-[#f8f9fa]">
                <div className="flex flex-col gap-3">
                  {selectedProduct.images.map((img, i) => (
                    <div key={i} className={`w-16 h-16 rounded-xl border-2 ${i === 0 ? 'border-[#3b5cf6]' : 'border-gray-100 bg-white'} p-2 flex items-center justify-center`}>
                      <ImageIcon size={24} className="text-gray-300" />
                    </div>
                  ))}
                </div>
                <div className="flex-1 bg-white rounded-3xl border border-gray-100 relative flex items-center justify-center p-12">
                  <ImageIcon size={120} strokeWidth={1} className="text-gray-200" />
                  <button className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-400">
                    <Maximize2 size={16} />
                  </button>
                </div>
              </div>

              {/* Product Info Column */}
              <div className="md:w-1/2 p-8 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">{selectedProduct.category}</span>
                  <h3 className="text-2xl font-black text-[#0c1222] mb-3">{selectedProduct.name}</h3>
                  
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex gap-0.5 text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={14} fill={i < selectedProduct.rating ? "currentColor" : "none"} className={i < selectedProduct.rating ? "text-yellow-400" : "text-gray-200"} />
                      ))}
                    </div>
                    <span className="text-xs font-semibold text-gray-400">({selectedProduct.reviewsCount} reviews)</span>
                  </div>

                  <p className="text-sm font-semibold text-gray-500 mb-6 leading-relaxed">
                    {selectedProduct.desc}
                  </p>

                  <div className="flex items-baseline gap-3 mb-6">
                    <span className="text-2xl font-black text-[#0c1222]">Rs.{selectedProduct.price}</span>
                    {selectedProduct.oldPrice && (
                      <span className="text-sm font-bold text-gray-400 line-through">Rs.{selectedProduct.oldPrice}</span>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center border border-gray-100 rounded-full p-1 bg-[#f8f9fa]">
                      <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-black"><Minus size={14} /></button>
                      <span className="w-8 text-center font-bold text-sm">{quantity}</span>
                      <button onClick={() => setQuantity(quantity + 1)} className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-black"><Plus size={14} /></button>
                    </div>

                    <button className="flex-1 h-12 rounded-full bg-[#3b5cf6] text-white text-xs font-black uppercase tracking-wider shadow-lg shadow-blue-500/10 hover:bg-blue-700 transition-all">
                      Add to cart
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-2 text-[#22c55e] text-xs font-bold">
                    <CheckCircle2 size={16} />
                    <span>In Stock & Ready to Ship</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
