'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { ShoppingBag, Heart, Eye, ArrowRight, Star, Loader, Percent, Flame, Sparkles, Filter, ChevronDown, CheckCircle2, X, Plus, Minus, Image as ImageIcon } from 'lucide-react'
import { Product } from '@/lib/products'
import { getProductUrl } from '@/lib/utils'
import { Footer } from '@/components/Footer'

export default function ShopPage() {
  const [mostSold, setMostSold] = useState<Product[]>([])
  const [mostWishlisted, setMostWishlisted] = useState<Product[]>([])
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  // Quick View Modal
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [quantity, setQuantity] = useState(1)

  // Filter States
  const [activeCategory, setActiveCategory] = useState('All')
  const [sortBy, setSortBy] = useState('featured') // featured, price-low, price-high, rating

  useEffect(() => {
    async function fetchShopData() {
      try {
        const res = await fetch('/api/shop')
        const data = await res.json()
        if (data.success) {
          setMostSold(data.mostSold || [])
          setMostWishlisted(data.mostWishlisted || [])
          setAllProducts(data.allProducts || [])
          setFilteredProducts(data.allProducts || [])
        }
      } catch (err) {
        console.error("Failed to load shop page data:", err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchShopData()
  }, [])

  // Filter & Sort Logic
  useEffect(() => {
    let result = [...allProducts]

    // Category Filter
    if (activeCategory !== 'All') {
      result = result.filter(p => p.category.toLowerCase() === activeCategory.toLowerCase())
    }

    // Sorting
    if (sortBy === 'price-low') {
      result.sort((a, b) => a.price - b.price)
    } else if (sortBy === 'price-high') {
      result.sort((a, b) => b.price - a.price)
    } else if (sortBy === 'rating') {
      result.sort((a, b) => b.rating - a.rating)
    }

    setFilteredProducts(result)
  }, [activeCategory, sortBy, allProducts])

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

  const openQuickView = (e: React.MouseEvent, product: Product) => {
    e.preventDefault()
    e.stopPropagation()
    setSelectedProduct(product)
    setQuantity(1)
  }

  const uniqueCategories = ['All', ...Array.from(new Set(allProducts.map(p => p.category)))]

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex flex-col justify-between">
        <div className="flex-1 flex flex-col items-center justify-center py-32">
          <Loader size={36} className="animate-spin text-[#128a88] mb-4" />
          <p className="text-sm font-bold text-gray-500">Loading catalog items...</p>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="bg-white min-h-screen flex flex-col justify-between">
      <div>
        {/* Shop Page Banner */}
        <div className="bg-gray-50 border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 lg:px-6 py-6">
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-400">
              <Link href="/" className="hover:text-[#1a1a1a] transition-colors">Home</Link>
              <span>/</span>
              <span className="text-[#128a88] font-bold">Shop</span>
            </div>
          </div>
        </div>

        {/* Dynamic Metrics Section (Game Changer) */}
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-12 space-y-16">
          
          {/* Section 1: Most Sold Products */}
          {mostSold.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-6 sm:mb-8 border-b border-gray-100 pb-3">
                <Flame size={20} className="text-amber-500" fill="currentColor" />
                <h2 className="text-lg sm:text-xl font-black text-gray-900 uppercase tracking-wide">
                  Best Sellers
                </h2>
                <span className="text-[10px] bg-amber-50 text-amber-600 border border-amber-250 font-bold px-2 py-0.5 rounded-full uppercase ml-2 animate-pulse">
                  Top Sold
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 xl:gap-8">
                {mostSold.slice(0, 4).map((product) => (
                  <Link 
                    href={getProductUrl(product)} 
                    key={`sold-${product.id}`} 
                    className="group cursor-pointer block bg-[#f8f9fa] rounded-3xl p-3 sm:p-4 border border-gray-55 transition-all duration-300 hover:bg-white hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.06)]"
                  >
                    <div className="relative aspect-square rounded-2xl bg-white overflow-hidden mb-3.5 flex items-center justify-center border border-gray-100">
                      {product.images[0] ? (
                        <img 
                          src={product.images[0]} 
                          alt={product.name} 
                          className="w-full h-full object-contain p-2 transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <ImageIcon className="text-gray-300 w-12 h-12" />
                      )}

                      {/* Action Overlays */}
                      <div className="absolute top-2.5 right-2.5 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <button 
                          onClick={(e) => handleAddToWishlist(e, product)}
                          className="w-8 h-8 rounded-xl bg-white text-gray-600 hover:text-rose-500 flex items-center justify-center shadow-sm border border-gray-100 transition-colors"
                        >
                          <Heart size={14} />
                        </button>
                        <button 
                          onClick={(e) => openQuickView(e, product)}
                          className="w-8 h-8 rounded-xl bg-white text-gray-600 hover:text-[#128a88] flex items-center justify-center shadow-sm border border-gray-100 transition-colors"
                        >
                          <Eye size={14} />
                        </button>
                      </div>
                    </div>
                    
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none block mb-1.5">{product.category}</span>
                    <h3 className="text-xs sm:text-sm font-extrabold text-gray-800 line-clamp-1 group-hover:text-[#128a88] transition-colors">{product.name}</h3>
                    
                    <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-gray-100/60">
                      <p className="text-xs sm:text-sm font-black text-gray-900">Rs.{product.price.toLocaleString()}</p>
                      <button 
                        onClick={(e) => handleAddToCart(e, product)}
                        className="p-2 bg-white hover:bg-[#128a88] text-gray-600 hover:text-white border border-gray-200 rounded-xl transition-all shadow-sm"
                      >
                        <ShoppingBag size={14} />
                      </button>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Section 2: Most Wishlisted Products */}
          {mostWishlisted.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-6 sm:mb-8 border-b border-gray-100 pb-3">
                <Sparkles size={20} className="text-[#128a88]" fill="currentColor" />
                <h2 className="text-lg sm:text-xl font-black text-gray-900 uppercase tracking-wide">
                  Customer Favorites
                </h2>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 xl:gap-8">
                {mostWishlisted.slice(0, 4).map((product) => (
                  <Link 
                    href={getProductUrl(product)} 
                    key={`saved-${product.id}`} 
                    className="group cursor-pointer block bg-[#f8f9fa] rounded-3xl p-3 sm:p-4 border border-gray-55 transition-all duration-300 hover:bg-white hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.06)]"
                  >
                    <div className="relative aspect-square rounded-2xl bg-white overflow-hidden mb-3.5 flex items-center justify-center border border-gray-100">
                      {product.images[0] ? (
                        <img 
                          src={product.images[0]} 
                          alt={product.name} 
                          className="w-full h-full object-contain p-2 transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <ImageIcon className="text-gray-300 w-12 h-12" />
                      )}

                      {/* Action Overlays */}
                      <div className="absolute top-2.5 right-2.5 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <button 
                          onClick={(e) => handleAddToWishlist(e, product)}
                          className="w-8 h-8 rounded-xl bg-white text-gray-600 hover:text-rose-500 flex items-center justify-center shadow-sm border border-gray-100 transition-colors"
                        >
                          <Heart size={14} />
                        </button>
                        <button 
                          onClick={(e) => openQuickView(e, product)}
                          className="w-8 h-8 rounded-xl bg-white text-gray-600 hover:text-[#128a88] flex items-center justify-center shadow-sm border border-gray-100 transition-colors"
                        >
                          <Eye size={14} />
                        </button>
                      </div>
                    </div>
                    
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none block mb-1.5">{product.category}</span>
                    <h3 className="text-xs sm:text-sm font-extrabold text-gray-800 line-clamp-1 group-hover:text-[#128a88] transition-colors">{product.name}</h3>
                    
                    <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-gray-100/60">
                      <p className="text-xs sm:text-sm font-black text-gray-900">Rs.{product.price.toLocaleString()}</p>
                      <button 
                        onClick={(e) => handleAddToCart(e, product)}
                        className="p-2 bg-white hover:bg-[#128a88] text-gray-600 hover:text-white border border-gray-200 rounded-xl transition-all shadow-sm"
                      >
                        <ShoppingBag size={14} />
                      </button>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Quick View Modal Overlay */}
      {selectedProduct && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSelectedProduct(null)}></div>
          <div className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden z-10 animate-in zoom-in-95 duration-200 flex flex-col md:flex-row max-h-[90vh]">
            <button 
              onClick={() => setSelectedProduct(null)} 
              className="absolute top-4 right-4 z-50 w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:text-gray-800 border border-gray-100"
            >
              <X size={16} />
            </button>

            <div className="md:w-1/2 bg-[#f8f9fa] flex items-center justify-center p-8 border-b md:border-b-0 md:border-r border-gray-100">
              {selectedProduct.images[0] ? (
                <img src={selectedProduct.images[0]} alt="" className="max-h-[300px] object-contain" />
              ) : (
                <ImageIcon className="text-gray-300 w-16 h-16" />
              )}
            </div>

            <div className="md:w-1/2 p-6 sm:p-8 overflow-y-auto flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-black text-[#128a88] uppercase tracking-widest">{selectedProduct.category}</span>
                <h3 className="text-lg font-black text-gray-900 mt-1 mb-2 leading-tight">{selectedProduct.name}</h3>
                
                <div className="flex items-center gap-1.5 mb-4">
                  <div className="flex text-amber-400">
                    <Star size={12} fill="currentColor" stroke="none" />
                  </div>
                  <span className="text-xs font-bold text-gray-800">{selectedProduct.rating}</span>
                </div>

                <p className="text-lg font-black text-[#128a88] mb-4">Rs.{selectedProduct.price.toLocaleString()}</p>
                <p className="text-xs text-gray-500 leading-relaxed mb-6">{selectedProduct.desc}</p>
              </div>

              <div>
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-xs font-bold text-gray-400 uppercase">Quantity</span>
                  <div className="flex items-center border border-gray-200 rounded-xl p-0.5 bg-gray-50">
                    <button 
                      onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                      className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-black"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-8 text-center text-sm font-bold text-gray-800">{quantity}</span>
                    <button 
                      onClick={() => setQuantity(prev => prev + 1)}
                      className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-black"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  <button 
                    onClick={(e) => {
                      handleAddToCart(e, selectedProduct, quantity)
                      setSelectedProduct(null)
                    }}
                    className="h-11 bg-[#1a1a1a] hover:bg-[#128a88] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2"
                  >
                    <ShoppingBag size={14} />
                    <span>Add to Cart</span>
                  </button>
                  <button 
                    onClick={(e) => {
                      handleAddToWishlist(e, selectedProduct)
                      setSelectedProduct(null)
                    }}
                    className="h-11 bg-white hover:bg-gray-50 text-gray-700 text-xs font-bold uppercase tracking-wider rounded-xl border border-gray-200 transition-all flex items-center justify-center gap-2"
                  >
                    <Heart size={14} />
                    <span>Add Wishlist</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}
