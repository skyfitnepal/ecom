'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Star, CheckCircle2, Minus, Plus, Heart, Maximize2, Image as ImageIcon } from 'lucide-react'
import { Product } from '@/lib/products'

interface ShopDetailsProps {
  product: Product
}

export const ShopDetails: React.FC<ShopDetailsProps> = ({ product }) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [selectedColor, setSelectedColor] = useState(product.colors[0] || '')
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0] || '')
  const [quantity, setQuantity] = useState(1)

  // Calculate discount percentage
  const discountPercent = product.oldPrice 
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100) 
    : 0

  return (
    <div className="bg-white min-h-screen">
      {/* Page Header / Breadcrumbs Section */}
      <div className="border-b border-gray-100 bg-[#f8f9fa] py-8">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-2xl font-black text-[#0c1222]">Shop Details</h1>
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
            <Link href="/" className="hover:text-[#3b5cf6] transition-colors">Home</Link>
            <span>/</span>
            <span className="text-[#3b5cf6]">Shop Details</span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 lg:px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-16 items-start">
          
          {/* Left Side: Images */}
          <div className="flex flex-col gap-6">
            
            {/* Big Main Image Container */}
            <div className="relative aspect-[4/3] rounded-[32px] bg-[#f8f9fa] border border-gray-100 flex items-center justify-center p-12 group select-none">
              
              {/* Image content representation (ImageIcon instead of emoji) */}
              <div className="flex flex-col items-center justify-center transition-transform duration-500 group-hover:scale-105 text-gray-300">
                <ImageIcon size={120} strokeWidth={1} />
              </div>

              {/* Maximize Icon (Top Right) */}
              <button className="absolute top-6 right-6 w-12 h-12 rounded-full bg-white shadow-md flex items-center justify-center text-gray-400 hover:text-[#0c1222] hover:scale-105 transition-all">
                <Maximize2 size={20} />
              </button>

              {/* Discount Badge */}
              {discountPercent > 0 && (
                <div className="absolute top-6 left-6 px-4 py-1.5 bg-[#3b5cf6] text-white text-xs font-black rounded-full uppercase tracking-wider shadow-lg shadow-blue-500/10">
                  {discountPercent}% OFF
                </div>
              )}
            </div>

            {/* Thumbnail Selectors */}
            {product.images.length > 1 && (
              <div className="flex gap-4">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImageIndex(i)}
                    className={`w-24 h-20 rounded-2xl border-2 p-2 flex items-center justify-center transition-all bg-[#f8f9fa] ${
                      activeImageIndex === i 
                        ? 'border-[#3b5cf6] shadow-md shadow-blue-500/5 bg-white' 
                        : 'border-transparent hover:border-gray-200'
                    }`}
                  >
                    <ImageIcon size={28} className="text-gray-300" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Side: Product Details info */}
          <div className="flex flex-col justify-center lg:py-4">
            
            {/* Title */}
            <h2 className="text-3xl lg:text-4xl font-black text-[#0c1222] leading-tight mb-4">
              {product.name}
            </h2>

            {/* Ratings & Stock */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mb-6 border-b border-gray-100 pb-6">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    size={16} 
                    fill={i < product.rating ? "#facc15" : "none"} 
                    className={i < product.rating ? "text-yellow-400" : "text-gray-200"} 
                  />
                ))}
              </div>
              <span className="text-sm font-semibold text-gray-500">
                ( {product.reviewsCount} customer reviews )
              </span>
              
              <div className="flex items-center gap-2 text-[#22c55e]">
                <CheckCircle2 size={18} />
                <span className="text-sm font-bold">{product.inStock ? 'In Stock' : 'Out of Stock'}</span>
              </div>
            </div>

            {/* Price Details */}
            <div className="mb-8">
              <div className="flex items-baseline gap-4">
                <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">Price:</span>
                {product.oldPrice && (
                  <span className="text-lg font-bold text-gray-400 line-through">Rs.{product.oldPrice}</span>
                )}
                <span className="text-3xl font-black text-[#0c1222]">
                  Rs.{product.price}
                </span>
              </div>
            </div>

            {/* Color Swatches */}
            {product.colors && product.colors.length > 0 && (
              <div className="mb-6 pb-6 border-b border-gray-100">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-bold text-gray-700">Color:</span>
                  <div className="flex gap-3">
                    {product.colors.map((color) => {
                      const isSelected = selectedColor === color
                      return (
                        <button
                          key={color}
                          onClick={() => setSelectedColor(color)}
                          style={{ backgroundColor: color }}
                          className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                            isSelected 
                              ? 'border-[#0c1222] ring-2 ring-offset-2 ring-gray-100 hover:scale-105' 
                              : 'border-transparent hover:scale-110'
                          }`}
                          title={color}
                        >
                          {isSelected && (
                            <span className={`text-[10px] font-black ${
                              color === '#e5e7eb' ? 'text-[#0c1222]' : 'text-white'
                            }`}>
                              ✓
                            </span>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Size Options */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="mb-8 pb-8 border-b border-gray-100">
                <div className="flex items-center gap-6">
                  <span className="text-sm font-bold text-gray-700">Size:</span>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((size) => {
                      const isSelected = selectedSize === size
                      return (
                        <button
                          key={size}
                          onClick={() => setSelectedSize(size)}
                          className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all ${
                            isSelected
                              ? 'bg-[#0c1222] border-[#0c1222] text-white shadow-md'
                              : 'bg-[#f8f9fa] border-transparent text-gray-700 hover:border-gray-300'
                          }`}
                        >
                          {size}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Quantity & Buy Buttons Row */}
            <div className="flex flex-wrap items-center gap-4">
              
              {/* Quantity selector */}
              <div className="flex items-center border border-gray-200 rounded-full p-1.5 bg-[#f8f9fa] shrink-0">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 rounded-full flex items-center justify-center text-gray-400 hover:text-[#0c1222] transition-colors"
                >
                  <Minus size={18} />
                </button>
                <span className="w-10 text-center font-bold text-[#0c1222]">{quantity}</span>
                <button 
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 rounded-full flex items-center justify-center text-gray-400 hover:text-[#0c1222] transition-colors"
                >
                  <Plus size={18} />
                </button>
              </div>

              {/* Purchase Now */}
              <button className="flex-1 min-w-[160px] h-14 rounded-full bg-[#3b5cf6] text-white font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/10 active:scale-[0.98]">
                Purchase Now
              </button>

              {/* Add to Cart */}
              <button className="flex-1 min-w-[160px] h-14 rounded-full bg-[#0c1222] text-white font-bold hover:bg-black transition-all shadow-lg shadow-black/10 active:scale-[0.98]">
                Add to Cart
              </button>

              {/* Wishlist Button */}
              <button className="w-14 h-14 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50/20 transition-all active:scale-[0.95] shrink-0">
                <Heart size={20} />
              </button>

            </div>

          </div>

        </div>
      </main>
    </div>
  )
}
