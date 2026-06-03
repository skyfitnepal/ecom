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

  // Initialize option selection state for variants
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {}
    if (product.has_variants && product.variant_options) {
      product.variant_options.forEach(opt => {
        const vals = Array.from(new Set(
          (product.variants || [])
            .map(v => v.options?.[opt])
            .filter(Boolean)
        ))
        initial[opt] = (vals[0] as string) || ''
      })
    }
    return initial
  })

  // Find selected variant object
  const getSelectedVariant = () => {
    if (!product.has_variants || !product.variants || product.variants.length === 0) return null
    return product.variants.find(v => {
      return Object.entries(selectedOptions).every(([key, val]) => v.options?.[key] === val)
    }) || null
  }

  const activeVariant = getSelectedVariant()

  const currentPrice = activeVariant 
    ? (activeVariant.sale_price ? activeVariant.sale_price : activeVariant.price)
    : product.price

  const originalPrice = activeVariant
    ? (activeVariant.sale_price ? activeVariant.price : null)
    : product.oldPrice

  const discountPercent = originalPrice
    ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
    : 0

  const activeInStock = activeVariant
    ? (activeVariant.stock > 0 && activeVariant.is_active !== false)
    : product.inStock

  const handleAddToCart = (e: React.MouseEvent, qty: number = 1) => {
    e.preventDefault()
    e.stopPropagation()
    const user = localStorage.getItem('skyfit_user')
    if (!user) {
      window.dispatchEvent(new Event('open-auth-modal'))
      return
    }

    const colorVal = selectedColor || selectedOptions['color'] || null
    const sizeVal = selectedSize || selectedOptions['size'] || selectedOptions['Size'] || null
    const compositeId = `${product.id}-${colorVal || 'none'}-${sizeVal || 'none'}`

    const cartProduct = {
      ...product,
      price: currentPrice,
      oldPrice: originalPrice,
      id: compositeId,
      productId: product.id,
      selectedColor: colorVal,
      selectedSize: sizeVal,
      selectedOptions: product.has_variants ? selectedOptions : null
    }
    
    try {
      const cart = JSON.parse(localStorage.getItem('skyfit_cart') || '[]')
      const existingIdx = cart.findIndex((item: any) => item.id === cartProduct.id)
      if (existingIdx > -1) {
        cart[existingIdx].qty += qty
      } else {
        cart.push({ ...cartProduct, qty })
      }
      localStorage.setItem('skyfit_cart', JSON.stringify(cart))
      window.dispatchEvent(new Event('sync-cart-wishlist'))
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: `"${product.name}" added to cart successfully!` } }))
    } catch (err) {
      console.error(err)
    }
  }

  const handleAddToWishlist = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const user = localStorage.getItem('skyfit_user')
    if (!user) {
      window.dispatchEvent(new Event('open-auth-modal'))
      return
    }

    try {
      const wishlist = JSON.parse(localStorage.getItem('skyfit_wishlist') || '[]')
      const existingIdx = wishlist.findIndex((item: any) => item.id === product.id)
      if (existingIdx === -1) {
        wishlist.push(product)
        localStorage.setItem('skyfit_wishlist', JSON.stringify(wishlist))
        window.dispatchEvent(new Event('sync-cart-wishlist'))
        
        // Save to DB in background
        try {
          const loggedUser = JSON.parse(user)
          if (loggedUser && loggedUser.email) {
            fetch('/api/wishlist', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email: loggedUser.email, productId: product.id })
            }).catch(err => console.error("Wishlist DB Sync Error:", err))
          }
        } catch (uerr) {
          console.error("User parse error during wishlist save:", uerr)
        }

        window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: `"${product.name}" added to wishlist successfully!` } }))
      } else {
        window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: `"${product.name}" is already in your wishlist!` } }))
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const user = localStorage.getItem('skyfit_user')
    if (!user) {
      window.dispatchEvent(new Event('open-auth-modal'))
      return
    }
    
    handleAddToCart(e, quantity)
    window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: "Proceeding to checkout with your item!" } }))
  }

  return (
    <div className="bg-white min-h-screen pb-20 sm:pb-0">
      {/* Page Header / Breadcrumbs Section */}
      <div className="border-b border-gray-100 bg-[#f8f9fa] py-6 sm:py-8">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-xl sm:text-2xl font-black text-[#0c1222]">Shop Details</h1>
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
            <Link href="/" className="hover:text-[#3b5cf6] transition-colors">Home</Link>
            <span>/</span>
            <span className="text-[#3b5cf6]">Shop Details</span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 lg:px-6 py-8 sm:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 xl:gap-16 items-start">
          
          {/* Left Side: Images */}
          <div className="flex flex-col gap-4 sm:gap-6">
            
            {/* Big Main Image Container */}
            <div className="relative aspect-square sm:aspect-[4/3] rounded-2xl sm:rounded-[32px] bg-gradient-to-br from-[#f8f9fa] to-[#f1f3f5] border border-gray-100/80 flex items-center justify-center p-6 sm:p-12 group select-none shadow-inner overflow-hidden">
              
              {/* Decorative background grid pattern for premium feel */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000003_1px,transparent_1px),linear-gradient(to_bottom,#00000003_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

              {/* Image content representation */}
              <div className="flex flex-col items-center justify-center transition-transform duration-500 group-hover:scale-105 w-full h-full z-10">
                {product.images[activeImageIndex] && product.images[activeImageIndex].startsWith('http') ? (
                  <img 
                    src={product.images[activeImageIndex]} 
                    alt={product.name} 
                    className="w-full h-full object-contain rounded-xl sm:rounded-[24px]"
                  />
                ) : (
                  <ImageIcon size={120} strokeWidth={1} className="text-gray-300 w-24 h-24 sm:w-32 sm:h-32" />
                )}
              </div>

              {/* Maximize Icon (Top Right) */}
              <button className="absolute top-4 right-4 sm:top-6 sm:right-6 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/90 backdrop-blur-sm shadow-md flex items-center justify-center text-gray-400 hover:text-[#0c1222] hover:scale-105 hover:bg-white transition-all z-20">
                <Maximize2 size={18} />
              </button>

              {/* Discount Badge */}
              {discountPercent > 0 && (
                <div className="absolute top-4 left-4 sm:top-6 sm:left-6 px-3.5 py-1.5 bg-[#3b5cf6] text-white text-[10px] sm:text-xs font-black rounded-full uppercase tracking-widest shadow-lg shadow-blue-500/20 z-20 animate-pulse">
                  {discountPercent}% OFF
                </div>
              )}
            </div>

            {/* Thumbnail Selectors */}
            {product.images.length > 1 && (
              <div className="flex flex-wrap gap-2.5 sm:gap-4">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImageIndex(i)}
                    className={`w-16 h-14 sm:w-24 sm:h-20 rounded-xl sm:rounded-2xl border-2 p-1 flex items-center justify-center transition-all bg-[#f8f9fa] ${
                      activeImageIndex === i 
                        ? 'border-[#3b5cf6] shadow-md shadow-blue-500/5 bg-white scale-105' 
                        : 'border-transparent hover:border-gray-200'
                    }`}
                  >
                    {img && img.startsWith('http') ? (
                      <img 
                        src={img} 
                        alt={`${product.name} thumbnail ${i}`} 
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <ImageIcon size={28} className="text-gray-300 w-6 h-6 sm:w-7 sm:h-7" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Side: Product Details info */}
          <div className="flex flex-col justify-center lg:py-2">
            
            {/* Title */}
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#0c1222] leading-tight mb-3">
              {product.name}
            </h2>

            {/* Ratings & Stock */}
            <div className="flex flex-wrap items-center gap-x-4 sm:gap-x-6 gap-y-3 mb-6 border-b border-gray-100 pb-6">
              <div className="flex items-center gap-1 bg-yellow-50/50 px-2 py-1 rounded-lg border border-yellow-100/50">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    size={14} 
                    fill={i < product.rating ? "#facc15" : "none"} 
                    className={i < product.rating ? "text-yellow-400" : "text-gray-200"} 
                  />
                ))}
              </div>
              <span className="text-xs sm:text-sm font-semibold text-gray-500">
                ({product.reviewsCount} customer reviews)
              </span>
              
              <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                activeInStock 
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/50' 
                  : 'bg-rose-50 text-rose-700 border border-rose-200/50'
              }`}>
                <CheckCircle2 size={14} className={activeInStock ? "text-emerald-600" : "text-rose-600"} />
                <span>{activeInStock ? 'In Stock' : 'Out of Stock'}</span>
              </div>
            </div>

            {/* Price Details */}
            <div className="mb-6 bg-[#f8f9fa] rounded-2xl p-4 sm:p-5 border border-gray-100/80 flex items-center justify-between flex-wrap gap-4">
              <div>
                <span className="text-[10px] sm:text-xs font-black text-gray-400 uppercase tracking-widest block mb-1">Price</span>
                <div className="flex items-baseline gap-2.5">
                  <span className="text-2xl sm:text-3xl font-black text-[#0c1222]">
                    Rs. {currentPrice.toLocaleString()}
                  </span>
                  {originalPrice && (
                    <span className="text-sm sm:text-base font-bold text-gray-400 line-through">
                      Rs. {originalPrice.toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
              {discountPercent > 0 && (
                <div className="bg-rose-50 text-rose-700 px-3 py-1.5 rounded-xl text-xs font-black border border-rose-100/80 shadow-sm">
                  Save {discountPercent}%
                </div>
              )}
            </div>

            {/* Color Swatches */}
            {product.colors && product.colors.length > 0 && (
              <div className="mb-6 pb-6 border-b border-gray-100">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
                  <span className="text-xs sm:text-sm font-black text-gray-700 min-w-[60px] uppercase tracking-wider">Color:</span>
                  <div className="flex flex-wrap gap-3">
                    {product.colors.map((color) => {
                      const isSelected = selectedColor === color
                      const colorMap: Record<string, string> = {
                        black: '#1a1a1a',
                        white: '#ffffff',
                        gray: '#e5e7eb',
                        grey: '#e5e7eb',
                        red: '#ef4444',
                        blue: '#3b82f6',
                        yellow: '#facc15',
                        green: '#22c55e',
                        orange: '#f97316',
                        pink: '#ec4899',
                        purple: '#8b5cf6'
                      }
                      const resolvedBg = colorMap[color.toLowerCase()] || color
                      const isLightColor = ['white', 'yellow', 'gray', 'grey', '#ffffff', '#e5e7eb', '#facc15'].includes(color.toLowerCase())
                      
                      return (
                        <button
                          key={color}
                          onClick={() => setSelectedColor(color)}
                          style={{ backgroundColor: resolvedBg }}
                          className={`w-9 h-9 rounded-full border-2 flex items-center justify-center transition-all ${
                            isSelected 
                              ? 'border-[#0c1222] ring-4 ring-offset-2 ring-gray-100 scale-105' 
                              : 'border-gray-200 hover:scale-110'
                          }`}
                          title={color}
                        >
                          {isSelected && (
                            <span className={`text-[10px] font-black ${
                              isLightColor ? 'text-[#0c1222]' : 'text-white'
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

            {/* Variant Options Matrix Display */}
            {product.has_variants && product.variant_options && product.variant_options.length > 0 ? (
              <div className="space-y-6 mb-8 pb-8 border-b border-gray-100">
                {product.variant_options.map((opt) => {
                  const values = Array.from(new Set(
                    (product.variants || [])
                      .map(v => v.options?.[opt])
                      .filter(Boolean)
                  )) as string[]

                  return (
                    <div key={opt} className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
                      <span className="text-xs sm:text-sm font-black text-gray-700 min-w-[60px] uppercase tracking-wider">{opt}:</span>
                      <div className="flex flex-wrap gap-2.5">
                        {values.map((val) => {
                          const isSelected = selectedOptions[opt] === val
                          return (
                            <button
                              key={val}
                              type="button"
                              onClick={() => setSelectedOptions(prev => ({ ...prev, [opt]: val }))}
                              className={`min-w-[54px] px-4 py-2.5 text-xs font-black rounded-xl border transition-all ${
                                isSelected
                                  ? 'bg-[#0c1222] border-[#0c1222] text-white shadow-md scale-105'
                                  : 'bg-[#f8f9fa] border-gray-200/60 text-gray-700 hover:border-gray-300'
                              }`}
                            >
                              {val}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              /* Fallback to standard sizes rendering */
              product.sizes && product.sizes.length > 0 && (
                <div className="mb-8 pb-8 border-b border-gray-100">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
                    <span className="text-xs sm:text-sm font-black text-gray-700 min-w-[60px] uppercase tracking-wider">Size:</span>
                    <div className="flex flex-wrap gap-2.5">
                      {product.sizes.map((size) => {
                        const isSelected = selectedSize === size
                        return (
                          <button
                            key={size}
                            onClick={() => setSelectedSize(size)}
                            className={`min-w-[54px] px-4 py-2.5 text-xs font-black rounded-xl border transition-all ${
                              isSelected
                                ? 'bg-[#0c1222] border-[#0c1222] text-white shadow-md'
                                : 'bg-[#f8f9fa] border-gray-200/60 text-gray-700 hover:border-gray-300'
                            }`}
                          >
                            {size}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )
            )}

            {/* Quantity & Buy Buttons Row */}
            <div className="flex flex-col sm:flex-row gap-4 w-full">
              {/* Quantity & Wishlist inside one line for mobile */}
              <div className="flex items-center justify-between gap-4 w-full sm:w-auto">
                <div className="flex items-center border border-gray-200 rounded-full p-1 bg-[#f8f9fa] shrink-0 shadow-sm">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 rounded-full flex items-center justify-center text-gray-400 hover:text-[#0c1222] hover:bg-white hover:shadow-sm transition-all"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="w-8 text-center font-black text-[#0c1222] text-sm">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 rounded-full flex items-center justify-center text-gray-400 hover:text-[#0c1222] hover:bg-white hover:shadow-sm transition-all"
                  >
                    <Plus size={16} />
                  </button>
                </div>

                {/* Wishlist Button (mobile-only, visible next to quantity selector) */}
                <button 
                  onClick={handleAddToWishlist}
                  className="sm:hidden w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50/20 transition-all active:scale-[0.95] shrink-0 bg-white shadow-sm"
                >
                  <Heart size={18} />
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-1 gap-3">
                <button 
                  onClick={(e) => handleAddToCart(e, quantity)}
                  className="flex-1 h-12 sm:h-14 rounded-full bg-[#3b5cf6] text-white font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/10 active:scale-[0.98] text-sm sm:text-base"
                >
                  Add to Cart
                </button>
                <button 
                  onClick={handleBuyNow}
                  className="flex-1 h-12 sm:h-14 rounded-full bg-[#0c1222] text-white font-bold hover:bg-black transition-all shadow-lg shadow-black/10 active:scale-[0.98] text-sm sm:text-base"
                >
                  Buy Now
                </button>
              </div>

              {/* Wishlist Button (desktop-only) */}
              <button 
                onClick={handleAddToWishlist}
                className="hidden sm:flex w-14 h-14 rounded-full border border-gray-200 items-center justify-center text-gray-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50/20 transition-all active:scale-[0.95] shrink-0 bg-white shadow-sm"
              >
                <Heart size={20} />
              </button>
            </div>

          </div>

        </div>
      </main>

      {/* Sticky Bottom Actions Bar (Mobile Only) */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-gray-100 px-4 py-3.5 shadow-[0_-10px_30px_rgba(0,0,0,0.08)] flex items-center justify-between gap-4">
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Total Price</span>
          <span className="text-lg font-black text-[#0c1222]">
            Rs. {(currentPrice * quantity).toLocaleString()}
          </span>
        </div>
        
        <div className="flex gap-2 flex-1 max-w-[260px]">
          <button 
            onClick={(e) => handleAddToCart(e, quantity)}
            className="flex-1 h-12 rounded-full bg-[#0c1222] text-white text-[11px] font-black uppercase tracking-wider hover:bg-black transition-all active:scale-[0.98] whitespace-nowrap"
          >
            Add to Cart
          </button>
          <button 
            onClick={handleBuyNow}
            className="flex-1 h-12 rounded-full bg-[#3b5cf6] text-white text-[11px] font-black uppercase tracking-wider hover:bg-blue-700 transition-all active:scale-[0.98] shadow-lg shadow-blue-500/10 whitespace-nowrap"
          >
            Buy Now
          </button>
        </div>
      </div>
    </div>
  )
}
