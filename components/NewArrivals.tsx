'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Eye, Heart, X, Minus, Plus, Star, CheckCircle2, Maximize2, Image as ImageIcon } from 'lucide-react'
import { PRODUCTS, Product } from '@/lib/products'
import { getProductUrl } from '@/lib/utils'

interface NewArrivalsProps {
  initialProducts?: Product[]
}

export const NewArrivals: React.FC<NewArrivalsProps> = ({ initialProducts }) => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [quantity, setQuantity] = useState(1)

  const openQuickView = (e: React.MouseEvent, product: Product) => {
    e.preventDefault()
    e.stopPropagation()
    setSelectedProduct(product)
    setQuantity(1)
  }

  const closeQuickView = () => {
    setSelectedProduct(null)
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

  const productsList = initialProducts && initialProducts.length > 0 ? initialProducts : PRODUCTS

  return (
    <section className="max-w-7xl mx-auto px-4 lg:px-6 py-8 sm:py-12">
      <div className="flex items-center justify-between mb-6 sm:mb-8">
        <h2 className="text-xl sm:text-2xl font-bold text-[#0c1222]">New Arrivals</h2>
        <Link 
          href="/shop" 
          className="px-5 py-1.5 sm:px-6 sm:py-2 rounded-full border border-gray-100 text-xs sm:text-sm font-semibold hover:bg-[#128a88] hover:text-white hover:border-[#128a88] transition-all"
        >
          View All
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-3 sm:gap-x-6 gap-y-8 sm:gap-y-10">
        {productsList.map((product) => (
          <Link 
            href={getProductUrl(product)} 
            key={product.id} 
            className="group cursor-pointer block"
          >
            {/* Image Container */}
            <div className="relative aspect-square rounded-2xl bg-[#f3f4f6] overflow-hidden mb-3 flex items-center justify-center transition-all duration-300 group-hover:bg-white group-hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)]">
              
              {/* Image Representation */}
              <div className="w-full h-full flex items-center justify-center transition-all duration-300 group-hover:scale-105">
                {product.images[0] && product.images[0].startsWith('http') ? (
                  <img 
                    src={product.images[0]} 
                    alt={product.name} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="opacity-20 group-hover:opacity-40 transition-opacity">
                    <ImageIcon className="text-gray-600 w-12 h-12 sm:w-16 sm:h-16" strokeWidth={1} />
                  </div>
                )}
              </div>

              {/* Mobile / Tablet Quick-Access Actions (Always visible on touch screens below lg) */}
              <div className="absolute top-2 right-2 z-20 flex flex-col gap-1.5 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-300">
                <button 
                  onClick={(e) => handleAddToWishlist(e, product)}
                  className="w-8 h-8 rounded-full bg-white/95 text-gray-600 hover:text-red-500 flex items-center justify-center shadow-sm backdrop-blur-sm transition-all focus:outline-none"
                  aria-label="Add to Wishlist"
                >
                  <Heart size={14} />
                </button>
                <button 
                  onClick={(e) => openQuickView(e, product)}
                  className="w-8 h-8 rounded-full bg-white/95 text-gray-600 hover:text-[#3b5cf6] flex items-center justify-center shadow-sm backdrop-blur-sm transition-all focus:outline-none"
                  aria-label="Quick View"
                >
                  <Eye size={14} />
                </button>
              </div>

              <div className="absolute bottom-2 right-2 z-20 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-300">
                <button 
                  onClick={(e) => handleAddToCart(e, product, 1)}
                  className="w-8 h-8 rounded-full bg-[#3b5cf6] text-white hover:bg-blue-700 flex items-center justify-center shadow-md transition-all focus:outline-none"
                  aria-label="Add to Cart"
                >
                  <Plus size={16} />
                </button>
              </div>

              {/* Desktop Hover Actions Overlay (Visible only on desktop hovering) */}
              <div className="hidden lg:flex absolute inset-0 bg-black/5 flex items-end justify-center pb-8 gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-4 group-hover:translate-y-0">
                <button 
                  onClick={(e) => openQuickView(e, product)}
                  className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-700 hover:bg-[#3b5cf6] hover:text-white transition-all focus:outline-none"
                  title="Quick View"
                >
                  <Eye size={18} />
                </button>
                <button 
                  onClick={(e) => handleAddToCart(e, product, 1)}
                  className="h-10 px-6 rounded-full bg-[#3b5cf6] text-white text-sm font-bold shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all focus:outline-none"
                >
                  Add to cart
                </button>
                <button 
                  onClick={(e) => handleAddToWishlist(e, product)}
                  className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-700 hover:bg-red-500 hover:text-white transition-all focus:outline-none"
                  title="Add to Wishlist"
                >
                  <Heart size={18} />
                </button>
              </div>
            </div>

            {/* Product Details */}
            <div className="px-1">
              <h3 className="text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2 line-clamp-1 group-hover:text-[#128a88] transition-colors">
                {product.name}
              </h3>
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <span className="text-sm sm:text-lg font-black text-[#1a1a1a]">Rs.{product.price}</span>
                <span className="text-[10px] sm:text-xs font-bold text-gray-500 line-through">Rs.{product.oldPrice}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick View Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-[#0c1222]/60 backdrop-blur-sm"
            onClick={closeQuickView}
          ></div>

          {/* Modal Content */}
          <div className="relative bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row animate-in fade-in zoom-in duration-300 max-h-[90vh] overflow-y-auto">
            {/* Close Button */}
            <button 
              onClick={closeQuickView}
              className="absolute top-4 right-4 z-50 w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:text-[#1a1a1a] transition-colors shadow-sm focus:outline-none"
            >
              <X size={20} />
            </button>

            {/* Product Images Area */}
            <div className="w-full md:w-1/2 p-4 sm:p-8 flex flex-shrink-0 justify-center">
              {/* Main Image */}
              <div className="w-full bg-[#f8f9fa] rounded-2xl sm:rounded-3xl relative flex items-center justify-center p-6 sm:p-12 aspect-square">
                {selectedProduct.images[0] && selectedProduct.images[0].startsWith('http') ? (
                  <img src={selectedProduct.images[0]} className="w-full h-full object-contain rounded-xl sm:rounded-2xl" alt={selectedProduct.name} />
                ) : (
                  <ImageIcon size={80} strokeWidth={1} className="text-gray-200" />
                )}
              </div>
            </div>

            {/* Product Info Area */}
            <div className="w-full md:w-1/2 p-6 sm:p-8 md:pl-0 flex flex-col justify-center">
              <div className="mb-4 sm:mb-6">
                {selectedProduct.oldPrice ? (
                  <span className="px-3 py-1 bg-[#22c55e] text-white text-[10px] font-black rounded-full uppercase tracking-wider">
                    Sale {Math.round((1 - selectedProduct.price / selectedProduct.oldPrice) * 100)}% OFF
                  </span>
                ) : null}
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-[#1a1a1a] mb-2 sm:mb-4">{selectedProduct.name}</h2>

              <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                <div className="flex text-yellow-400">
                  {(() => {
                    const rating = Math.min(5, Math.max(0, Math.round(selectedProduct.rating || 0)));
                    return (
                      <>
                        {[...Array(rating)].map((_, i) => <Star key={i} size={16} fill="currentColor" className="text-yellow-400" />)}
                        {[...Array(5 - rating)].map((_, i) => <Star key={i} size={16} className="text-gray-200" />)}
                      </>
                    );
                  })()}
                </div>
                <span className="text-xs font-bold text-gray-400">{selectedProduct.reviewsCount} customer reviews</span>
                <div className="flex items-center gap-1.5 text-[#22c55e]">
                  <CheckCircle2 size={16} />
                  <span className="text-xs font-bold">{selectedProduct.inStock ? 'In Stock' : 'Out of Stock'}</span>
                </div>
              </div>

              <p className="text-gray-500 text-sm leading-relaxed mb-6 sm:mb-8">
                {selectedProduct.desc}
              </p>

              <div className="flex flex-row items-center justify-between sm:justify-start sm:gap-12 gap-6 mb-6 sm:mb-8">
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1 sm:mb-2">Price</p>
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs sm:text-sm font-bold text-gray-300 line-through">Rs.{selectedProduct.oldPrice}</span>
                    <span className="text-xl sm:text-2xl font-black text-[#1a1a1a]">Rs.{selectedProduct.price}</span>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1 sm:mb-2">Quantity</p>
                  <div className="flex items-center border border-gray-100 rounded-full p-1 bg-[#f8f9fa]">
                    <button 
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-[#1a1a1a] focus:outline-none"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="w-8 text-center text-sm font-bold">{quantity}</span>
                    <button 
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-[#1a1a1a] focus:outline-none"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 mt-2 sm:mt-4">
                <button 
                  onClick={(e) => handleAddToCart(e, selectedProduct, quantity)}
                  className="w-full sm:flex-1 h-12 rounded-full bg-[#3b5cf6] text-white font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 focus:outline-none"
                >
                  Add to Cart
                </button>
                <button 
                  onClick={(e) => handleAddToWishlist(e, selectedProduct)}
                  className="w-full sm:flex-1 h-12 rounded-full bg-[#0c1222] text-white font-bold hover:bg-black transition-all flex items-center justify-center gap-2 focus:outline-none"
                >
                  <Heart size={18} />
                  Add to Wishlist
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
