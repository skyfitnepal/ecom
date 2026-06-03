'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Eye, Heart, X, Minus, Plus, Star, CheckCircle2, Maximize2, Image as ImageIcon } from 'lucide-react'
import { PRODUCTS, Product } from '@/lib/products'
import { getProductUrl } from '@/lib/utils'

interface YouMayLikeProps {
  currentProduct: Product
  relatedProducts?: Product[]
}

export const YouMayLike: React.FC<YouMayLikeProps> = ({ currentProduct, relatedProducts }) => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [quantity, setQuantity] = useState(1)

  // Get related products: same category first, then fill up to 4 with other categories
  const getRelatedProducts = () => {
    if (relatedProducts && relatedProducts.length > 0) {
      return relatedProducts
    }
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

  const handleAddToCart = (e: React.MouseEvent, product: Product, qty: number = 1) => {
    e.preventDefault()
    e.stopPropagation()
    const user = localStorage.getItem('skyfit_user')
    if (!user) {
      window.dispatchEvent(new Event('open-auth-modal'))
      return
    }
    
    const defaultColor = product.colors?.[0] || null
    const defaultSize = product.sizes?.[0] || null
    const compositeId = `${product.id}-${defaultColor || 'none'}-${defaultSize || 'none'}`

    const cartProduct = {
      ...product,
      id: compositeId,
      productId: product.id,
      selectedColor: defaultColor,
      selectedSize: defaultSize
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

  const handleAddToWishlist = (e: React.MouseEvent, product: Product) => {
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

  return (
    <section className="bg-white py-10 sm:py-16 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 lg:px-6">
        
        {/* Section Header */}
        <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-4 mb-8 sm:mb-10">
          <h2 className="text-xl sm:text-2xl font-black text-[#0c1222]">You May Also Like</h2>
          <Link 
            href="/" 
            className="px-5 py-2 sm:px-6 sm:py-2.5 w-fit rounded-full border border-gray-100 text-xs font-black uppercase tracking-wider text-gray-500 hover:bg-[#3b5cf6] hover:text-white hover:border-[#3b5cf6] transition-all"
          >
            Explore More
          </Link>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 xl:gap-8">
          {relatedList.map((product) => (
            <Link 
              href={getProductUrl(product)} 
              key={product.id} 
              className="group cursor-pointer block"
            >
              {/* Card Image Wrapper */}
              <div className="relative aspect-square rounded-2xl sm:rounded-3xl bg-[#f8f9fa] overflow-hidden mb-3 sm:mb-4 flex items-center justify-center border border-gray-55 transition-all duration-500 group-hover:bg-white group-hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.08)]">
                
                {/* Image Placeholder or Actual Image */}
                <div className="w-full h-full flex items-center justify-center transition-all duration-500 group-hover:scale-105">
                  {product.images[0] && product.images[0].startsWith('http') ? (
                    <img 
                      src={product.images[0]} 
                      alt={product.name} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="opacity-20 group-hover:opacity-40 transition-opacity">
                      <ImageIcon size={64} strokeWidth={1} className="text-gray-600 w-12 h-12 sm:w-16 sm:h-16" />
                    </div>
                  )}
                </div>

                {/* Mobile / Tablet Quick-Access Actions (Always visible on touch screens below lg) */}
                <div className="absolute top-2 right-2 z-20 flex flex-col gap-1.5 sm:top-3 sm:right-3 lg:hidden">
                  <button 
                    onClick={(e) => handleAddToWishlist(e, product)}
                    className="w-8 h-8 rounded-full bg-white/95 text-gray-500 hover:text-red-500 flex items-center justify-center shadow-sm backdrop-blur-sm transition-all focus:outline-none"
                    aria-label="Add to Wishlist"
                  >
                    <Heart size={14} />
                  </button>
                  <button 
                    onClick={(e) => openQuickView(e, product)}
                    className="w-8 h-8 rounded-full bg-white/95 text-gray-500 hover:text-[#3b5cf6] flex items-center justify-center shadow-sm backdrop-blur-sm transition-all focus:outline-none"
                    aria-label="Quick View"
                  >
                    <Eye size={14} />
                  </button>
                </div>

                <div className="absolute bottom-2 right-2 z-20 lg:hidden">
                  <button 
                    onClick={(e) => handleAddToCart(e, product, 1)}
                    className="w-8 h-8 rounded-full bg-[#3b5cf6] text-white hover:bg-blue-700 flex items-center justify-center shadow-md transition-all focus:outline-none"
                    aria-label="Add to Cart"
                  >
                    <Plus size={16} />
                  </button>
                </div>

                {/* Desktop Hover Action controls (Hidden on touch screens) */}
                <div className="hidden lg:flex absolute inset-0 bg-black/5 flex items-end justify-center pb-8 gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-4 group-hover:translate-y-0 z-20">
                  <button 
                    onClick={(e) => openQuickView(e, product)}
                    className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-700 hover:bg-[#3b5cf6] hover:text-white hover:scale-105 active:scale-95 transition-all focus:outline-none"
                  >
                    <Eye size={18} />
                  </button>
                  <button 
                    onClick={(e) => handleAddToCart(e, product, 1)}
                    className="h-10 px-6 rounded-full bg-[#3b5cf6] text-white text-xs font-black uppercase tracking-wider shadow-lg shadow-blue-500/10 hover:bg-blue-700 hover:scale-105 active:scale-95 transition-all focus:outline-none"
                  >
                    Add to cart
                  </button>
                  <button 
                    onClick={(e) => handleAddToWishlist(e, product)}
                    className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-700 hover:bg-red-500 hover:text-white hover:scale-105 active:scale-95 transition-all focus:outline-none"
                  >
                    <Heart size={18} />
                  </button>
                </div>
              </div>

              {/* Product Info Block */}
              <div className="px-1 sm:px-2">
                <span className="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">
                  {product.category}
                </span>
                <h3 className="text-xs sm:text-sm font-bold text-gray-700 mb-1.5 sm:mb-2 line-clamp-1 group-hover:text-[#3b5cf6] transition-colors">
                  {product.name}
                </h3>
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                  <span className="text-sm sm:text-base font-black text-[#0c1222]">Rs.{product.price.toLocaleString()}</span>
                  {product.oldPrice && (
                    <span className="text-[10px] sm:text-xs font-bold text-gray-400 line-through">Rs.{product.oldPrice.toLocaleString()}</span>
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
          
          <div className="bg-white rounded-3xl sm:rounded-[32px] w-full max-w-4xl relative overflow-hidden shadow-2xl z-10 animate-in zoom-in-95 duration-200 max-h-[90vh] md:max-h-none overflow-y-auto md:overflow-visible">
            <button 
              onClick={() => setSelectedProduct(null)}
              className="absolute top-4 right-4 sm:top-6 sm:right-6 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:text-gray-800 transition-colors z-20 shadow-sm"
            >
              <X size={18} />
            </button>

            <div className="flex flex-col md:flex-row">
              {/* Product Images Area */}
              <div className="w-full md:w-1/2 p-4 sm:p-8 flex bg-[#f8f9fa] flex-shrink-0 justify-center">
                <div className="w-full bg-white rounded-2xl sm:rounded-3xl border border-gray-100 relative flex items-center justify-center p-6 sm:p-12 aspect-square">
                  {selectedProduct.images[0] && selectedProduct.images[0].startsWith('http') ? (
                    <img src={selectedProduct.images[0]} className="w-full h-full object-contain rounded-xl sm:rounded-[24px]" alt={selectedProduct.name} />
                  ) : (
                    <ImageIcon size={120} strokeWidth={1} className="text-gray-200 w-24 h-24 sm:w-32 sm:h-32" />
                  )}
                </div>
              </div>

              {/* Product Info Column */}
              <div className="w-full md:w-1/2 p-6 sm:p-8 flex flex-col justify-between gap-4">
                <div>
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1.5">{selectedProduct.category}</span>
                  <h3 className="text-xl sm:text-2xl font-black text-[#0c1222] mb-2">{selectedProduct.name}</h3>
                  
                  <div className="flex items-center gap-3 sm:gap-4 mb-4">
                    <div className="flex gap-0.5 text-yellow-400 bg-yellow-50/50 px-2 py-0.5 rounded border border-yellow-100/50">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={12} fill={i < selectedProduct.rating ? "currentColor" : "none"} className={i < selectedProduct.rating ? "text-yellow-400" : "text-gray-200"} />
                      ))}
                    </div>
                    <span className="text-xs font-bold text-gray-400">({selectedProduct.reviewsCount} reviews)</span>
                  </div>

                  <p className="text-sm font-semibold text-gray-500 mb-4 sm:mb-6 leading-relaxed">
                    {selectedProduct.desc}
                  </p>

                  <div className="flex items-baseline gap-3 mb-2">
                    <span className="text-2xl font-black text-[#0c1222]">Rs.{selectedProduct.price.toLocaleString()}</span>
                    {selectedProduct.oldPrice && (
                      <span className="text-sm font-bold text-gray-400 line-through">Rs.{selectedProduct.oldPrice.toLocaleString()}</span>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center border border-gray-100 rounded-full p-1 bg-[#f8f9fa]">
                      <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-black focus:outline-none"><Minus size={14} /></button>
                      <span className="w-8 text-center font-bold text-sm">{quantity}</span>
                      <button onClick={() => setQuantity(quantity + 1)} className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-black focus:outline-none"><Plus size={14} /></button>
                    </div>

                    <button 
                      onClick={(e) => handleAddToCart(e, selectedProduct, quantity)}
                      className="flex-1 min-w-[120px] h-12 rounded-full bg-[#3b5cf6] text-white text-xs font-black uppercase tracking-wider shadow-lg shadow-blue-500/10 hover:bg-blue-700 transition-all focus:outline-none active:scale-[0.98]"
                    >
                      Add to cart
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-2 text-[#22c55e] text-xs font-bold bg-emerald-50/50 border border-emerald-100/50 px-3 py-1.5 rounded-xl w-fit">
                    <CheckCircle2 size={15} />
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
