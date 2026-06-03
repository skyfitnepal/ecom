'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Search, User, Heart, ShoppingBag, Menu, Phone, X, ChevronRight, Loader, Mail, MapPin, Lock, ArrowRight, CheckCircle2, ShieldCheck, Eye, EyeOff, Plus, Minus, Trash2, Sparkles } from 'lucide-react'
import { getProductUrl } from '@/lib/utils'
import { PRODUCTS } from '@/lib/products'

export const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  // Search States
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [activeSearchSource, setActiveSearchSource] = useState<'desktop' | 'mobile-bar' | 'mobile-drawer' | null>(null)

  // Auth Modal States
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [authTab, setAuthTab] = useState<'login' | 'signup'>('login')
  const [showPassword, setShowPassword] = useState(false)
  const [isAuthLoading, setIsAuthLoading] = useState(false)
  const [isAuthSuccess, setIsAuthSuccess] = useState(false)
  const [authSuccessMsg, setAuthSuccessMsg] = useState('')
  const [authError, setAuthError] = useState('')
  const [loginData, setLoginData] = useState({ email: '', password: '' })
  const [signupData, setSignupData] = useState({ name: '', email: '', phone: '', address: '', password: '', confirmPassword: '' })

  // Session State
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false)

  // Cart & Wishlist counters & items
  const [cartCount, setCartCount] = useState(0)
  const [wishlistCount, setWishlistCount] = useState(0)
  const [cartItems, setCartItems] = useState<any[]>([])
  const [wishlistItems, setWishlistItems] = useState<any[]>([])

  // Drawer States
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isWishlistOpen, setIsWishlistOpen] = useState(false)

  // Custom Toast States
  const [toastMessage, setToastMessage] = useState('')
  const [showToast, setShowToast] = useState(false)

  const desktopSearchRef = useRef<HTMLDivElement>(null)
  const mobileBarSearchRef = useRef<HTMLDivElement>(null)
  const mobileDrawerSearchRef = useRef<HTMLDivElement>(null)
  const userDropdownRef = useRef<HTMLDivElement>(null)

  const syncCounts = () => {
    try {
      const cart = JSON.parse(localStorage.getItem('skyfit_cart') || '[]')
      const wishlist = JSON.parse(localStorage.getItem('skyfit_wishlist') || '[]')
      setCartCount(cart.length)
      setWishlistCount(wishlist.length)
      setCartItems(cart)
      setWishlistItems(wishlist)
    } catch (err) {
      console.error(err)
    }
  }

  // Initialize and load session from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('skyfit_user')
    if (storedUser) {
      try {
        const userObj = JSON.parse(storedUser)
        setCurrentUser(userObj)
        
        // Sync wishlist from DB
        if (userObj.email) {
          fetch(`/api/wishlist?email=${encodeURIComponent(userObj.email)}`)
            .then(res => res.json())
            .then(data => {
              if (data.success && Array.isArray(data.wishlist)) {
                const localWishlist = JSON.parse(localStorage.getItem('skyfit_wishlist') || '[]')
                const dbProducts = data.wishlist
                  .map((id: string) => PRODUCTS.find((p: any) => p.id === id))
                  .filter(Boolean)
                
                const merged = [...localWishlist]
                dbProducts.forEach((prod: any) => {
                  if (!merged.some(item => item.id === prod.id)) {
                    merged.push(prod)
                  }
                })
                
                localStorage.setItem('skyfit_wishlist', JSON.stringify(merged))
                syncCounts()
              }
            })
            .catch(err => console.error("Wishlist DB sync error:", err))
        }
      } catch (err) {
        console.error("Error reading user from localStorage:", err)
      }
    }
    syncCounts()

    const handleOpenAuth = () => {
      setAuthError('')
      setIsAuthModalOpen(true)
    }

    const handleShowToast = (e: any) => {
      setToastMessage(e.detail?.message || '')
      setShowToast(true)
    }

    window.addEventListener('sync-cart-wishlist', syncCounts)
    window.addEventListener('open-auth-modal', handleOpenAuth)
    window.addEventListener('show-toast', handleShowToast)
    
    return () => {
      window.removeEventListener('sync-cart-wishlist', syncCounts)
      window.removeEventListener('open-auth-modal', handleOpenAuth)
      window.removeEventListener('show-toast', handleShowToast)
    }
  }, [])

  // Auto-hide toast
  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => {
        setShowToast(false)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [showToast])

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Lock body scroll when mobile menu, drawers, or auth modal is open
  useEffect(() => {
    if (isMobileMenuOpen || isAuthModalOpen || isCartOpen || isWishlistOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isMobileMenuOpen, isAuthModalOpen, isCartOpen, isWishlistOpen])

  // Handle clicking outside of search results & user dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        desktopSearchRef.current && !desktopSearchRef.current.contains(event.target as Node) &&
        mobileBarSearchRef.current && !mobileBarSearchRef.current.contains(event.target as Node) &&
        mobileDrawerSearchRef.current && !mobileDrawerSearchRef.current.contains(event.target as Node)
      ) {
        setShowResults(false)
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setIsUserDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Debounced Search API Call
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults([])
      return
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsSearching(true)
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`)
        const data = await res.json()
        if (data.success) {
          setSearchResults(data.products || [])
        }
      } catch (err) {
        console.error("Search fetch error:", err)
      } finally {
        setIsSearching(false)
      }
    }, 250)

    return () => clearTimeout(delayDebounceFn)
  }, [searchQuery])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, source: 'desktop' | 'mobile-bar' | 'mobile-drawer') => {
    setSearchQuery(e.target.value)
    setActiveSearchSource(source)
    setShowResults(e.target.value.trim().length >= 2)
  }

  const clearSearch = () => {
    setSearchQuery('')
    setSearchResults([])
    setShowResults(false)
  }

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsAuthLoading(true)
    setAuthError('')
    
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData)
      })
      const data = await res.json()
      
      if (!res.ok || !data.success) {
        setAuthError(data.message || 'Invalid credentials. Please try again.')
      } else {
        localStorage.setItem('skyfit_user', JSON.stringify(data.customer))
        setCurrentUser(data.customer)
        setIsAuthSuccess(true)
        setAuthSuccessMsg(`Welcome back, ${data.customer.name}!`)
        window.dispatchEvent(new Event('sync-cart-wishlist'))
      }
    } catch (err) {
      console.error(err)
      setAuthError('Something went wrong. Please try again.')
    } finally {
      setIsAuthLoading(false)
    }
  }

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthError('')
    
    if (signupData.password !== signupData.confirmPassword) {
      setAuthError("Passwords do not match!")
      return
    }
    
    setIsAuthLoading(true)
    
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: signupData.name,
          email: signupData.email,
          phone: signupData.phone,
          address: signupData.address,
          password: signupData.password
        })
      })
      const data = await res.json()
      
      if (!res.ok || !data.success) {
        setAuthError(data.message || 'Registration failed. Please try again.')
      } else {
        const autoLogin = {
          id: data.customer.id,
          name: signupData.name,
          email: signupData.email,
          phone: signupData.phone,
          address: signupData.address
        }
        localStorage.setItem('skyfit_user', JSON.stringify(autoLogin))
        setCurrentUser(autoLogin)
        setIsAuthSuccess(true)
        setAuthSuccessMsg(`Registration successful! Welcome to SkyFit, ${autoLogin.name}.`)
        window.dispatchEvent(new Event('sync-cart-wishlist'))
      }
    } catch (err) {
      console.error(err)
      setAuthError('Something went wrong. Please try again.')
    } finally {
      setIsAuthLoading(false)
    }
  }

  const closeAuthModal = () => {
    setIsAuthModalOpen(false)
    setIsAuthSuccess(false)
    setAuthError('')
    setLoginData({ email: '', password: '' })
    setSignupData({ name: '', email: '', phone: '', address: '', password: '', confirmPassword: '' })
  }

  const handleLogout = () => {
    localStorage.removeItem('skyfit_user')
    setCurrentUser(null)
    setIsUserDropdownOpen(false)
    setIsMobileMenuOpen(false)
    window.dispatchEvent(new Event('sync-cart-wishlist'))
    window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: "Logged out successfully." } }))
  }

  // Cart Drawer actions
  const handleRemoveFromCart = (productId: string) => {
    const updated = cartItems.filter(item => item.id !== productId)
    localStorage.setItem('skyfit_cart', JSON.stringify(updated))
    window.dispatchEvent(new Event('sync-cart-wishlist'))
    window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: "Item removed from cart." } }))
  }

  const handleUpdateQty = (productId: string, newQty: number) => {
    if (newQty < 1) return
    const updated = cartItems.map(item => item.id === productId ? { ...item, qty: newQty } : item)
    localStorage.setItem('skyfit_cart', JSON.stringify(updated))
    window.dispatchEvent(new Event('sync-cart-wishlist'))
  }

  // Wishlist Drawer actions
  const handleRemoveFromWishlist = (productId: string) => {
    const updated = wishlistItems.filter(item => item.id !== productId)
    localStorage.setItem('skyfit_wishlist', JSON.stringify(updated))
    window.dispatchEvent(new Event('sync-cart-wishlist'))
    
    // Also delete from DB in background
    if (currentUser && currentUser.email) {
      fetch('/api/wishlist', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: currentUser.email, productId })
      }).catch(err => console.error("Wishlist DB Remove Error:", err))
    }

    window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: "Item removed from wishlist." } }))
  }

  const handleMoveToCart = (product: any) => {
    handleRemoveFromWishlist(product.id)
    const defaultColor = product.colors?.[0] || null
    const defaultSize = product.sizes?.[0] || null
    const compositeId = `${product.id}-${defaultColor || 'none'}-${defaultSize || 'none'}`

    const cartProduct = {
      ...product,
      id: compositeId,
      productId: product.id,
      selectedColor: defaultColor,
      selectedSize: defaultSize,
      qty: 1
    }

    const cart = JSON.parse(localStorage.getItem('skyfit_cart') || '[]')
    const existingIdx = cart.findIndex((item: any) => item.id === cartProduct.id)
    if (existingIdx > -1) {
      cart[existingIdx].qty += 1
    } else {
      cart.push(cartProduct)
    }
    localStorage.setItem('skyfit_cart', JSON.stringify(cart))
    window.dispatchEvent(new Event('sync-cart-wishlist'))
    window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: `Moved "${product.name}" to cart.` } }))
  }

  const cartSubtotal = cartItems.reduce((acc, item) => acc + (item.price * item.qty), 0)

  const renderSearchResults = () => {
    if (!showResults || searchQuery.trim().length < 2) return null

    return (
      <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-2xl shadow-xl z-[150] overflow-hidden max-h-[360px] overflow-y-auto">
        {isSearching ? (
          <div className="p-5 flex items-center justify-center gap-2 text-xs font-semibold text-gray-400">
            <Loader size={14} className="animate-spin text-[#128a88]" />
            <span>Searching gear...</span>
          </div>
        ) : searchResults.length === 0 ? (
          <div className="p-5 text-center text-xs font-semibold text-gray-400">
            No products match "{searchQuery}"
          </div>
        ) : (
          <div className="py-2">
            <div className="px-4 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-55/10 mb-1.5">
              Matching Products
            </div>
            {searchResults.map((product) => (
              <Link
                key={product.id}
                href={getProductUrl(product)}
                onClick={() => {
                  setShowResults(false)
                  setSearchQuery('')
                  setIsSearchOpen(false)
                  setIsMobileMenuOpen(false)
                }}
                className="flex items-center gap-3.5 px-4 py-2.5 hover:bg-gray-50 transition-colors"
              >
                <div className="w-10 h-10 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center border border-gray-100 p-0.5">
                  {product.images[0] && product.images[0].startsWith('http') ? (
                    <img src={product.images[0]} alt="" className="w-full h-full object-contain rounded-md" />
                  ) : (
                    <span className="text-gray-300 text-xs">💪</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-gray-800 truncate">{product.name}</p>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">{product.category}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-black text-gray-900">Rs.{product.price.toLocaleString()}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <>
      <header className="w-full bg-white sticky top-0 z-[100] shadow-[0_2px_10px_-3px_rgba(0,0,0,0.07)]">
        {/* Top Section */}
        <div className="border-b border-gray-100 transition-all duration-300">
          <div className="max-w-7xl mx-auto px-4 lg:px-6 h-20 flex items-center justify-between gap-8">

            {/* Mobile Menu Toggle & Brand Logo */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="lg:hidden p-2 -ml-2 rounded-xl hover:bg-gray-50 text-gray-600 transition-colors focus:outline-none"
                aria-label="Toggle Menu"
              >
                <Menu size={24} />
              </button>

              <Link href="/" className="flex-shrink-0">
                <Image
                  src="/logo2.png"
                  alt="SkyFit"
                  width={130}
                  height={45}
                  className="h-12 w-auto object-contain"
                  priority
                />
              </Link>
            </div>

            {/* Search Bar (Desktop) */}
            <div ref={desktopSearchRef} className="flex-grow max-w-xl relative group hidden md:block">
              <input
                type="text"
                value={activeSearchSource === 'desktop' ? searchQuery : ''}
                onChange={(e) => handleInputChange(e, 'desktop')}
                onFocus={() => {
                  setActiveSearchSource('desktop')
                  if (searchQuery.trim().length >= 2) setShowResults(true)
                }}
                placeholder="Search fitness gear..."
                className="w-full h-11 pl-12 pr-10 bg-[#f8f9fa] rounded-xl text-sm outline-none border border-transparent focus:border-[#128a88]/20 focus:bg-white transition-all duration-300"
              />
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#128a88] transition-colors" />
              
              {activeSearchSource === 'desktop' && searchQuery && (
                <button 
                  onClick={clearSearch}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={15} />
                </button>
              )}

              {activeSearchSource === 'desktop' && renderSearchResults()}
            </div>

            {/* User & Shop Actions */}
            <div className="flex items-center gap-2 lg:gap-5">
              {/* Mobile Search Toggle */}
              <button
                onClick={() => {
                  setIsSearchOpen(!isSearchOpen)
                  clearSearch()
                }}
                className="md:hidden w-10 h-10 flex items-center justify-center hover:bg-gray-50 rounded-xl transition-all text-gray-600 focus:outline-none"
                aria-label="Toggle Search"
              >
                <Search size={20} className={isSearchOpen ? 'text-[#128a88]' : 'text-gray-600'} />
              </button>

              {/* User Dropdown / Login Button (Desktop) */}
              {currentUser ? (
                <div ref={userDropdownRef} className="relative hidden lg:block">
                  <button 
                    onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                    className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-gray-50 transition-all focus:outline-none text-left"
                  >
                    <div className="w-10 h-10 rounded-xl bg-[#128a88]/10 flex items-center justify-center text-[#128a88] border border-[#128a88]/20 shadow-sm font-black uppercase text-sm">
                      {currentUser.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-[#128a88] uppercase tracking-tighter leading-none mb-1">Hi, there</p>
                      <p className="text-sm font-bold text-[#1a1a1a] leading-none truncate max-w-[80px]">{currentUser.name.split(' ')[0]}</p>
                    </div>
                  </button>

                  {isUserDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-100 rounded-2xl shadow-xl z-[150] p-5 animate-in fade-in duration-200">
                      <div className="border-b border-gray-100 pb-3 mb-3">
                        <p className="font-bold text-gray-800 text-sm leading-none mb-1">{currentUser.name}</p>
                        <p className="text-xs font-semibold text-gray-450 truncate">{currentUser.email}</p>
                      </div>
                      <div className="flex flex-col gap-1.5 mb-4">
                        <Link
                          href="/account?tab=profile"
                          onClick={() => setIsUserDropdownOpen(false)}
                          className="w-full px-3.5 py-2.5 text-sm font-bold text-gray-700 hover:text-[#128a88] hover:bg-gray-50 rounded-xl transition-all flex items-center gap-2.5"
                        >
                          <User size={14} className="text-gray-400" />
                          <span>My Profile</span>
                        </Link>
                        <Link
                          href="/account?tab=orders"
                          onClick={() => setIsUserDropdownOpen(false)}
                          className="w-full px-3.5 py-2.5 text-sm font-bold text-gray-700 hover:text-[#128a88] hover:bg-gray-50 rounded-xl transition-all flex items-center gap-2.5"
                        >
                          <ShoppingBag size={14} className="text-gray-400" />
                          <span>My Orders</span>
                        </Link>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="w-full py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold rounded-xl transition-colors text-center text-xs focus:outline-none"
                      >
                        Log Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button 
                  onClick={() => {
                    setAuthError('')
                    setIsAuthModalOpen(true)
                  }}
                  className="hidden lg:flex items-center gap-2.5 p-2 rounded-xl hover:bg-gray-50 transition-all group focus:outline-none text-left"
                >
                  <div className="w-10 h-10 rounded-full bg-[#f8f9fa] flex items-center justify-center group-hover:bg-[#128a88]/10 transition-colors">
                    <User size={20} className="text-gray-600 group-hover:text-[#128a88]" />
                  </div>
                  <div className="hidden lg:block">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter leading-none mb-1">Account</p>
                    <p className="text-sm font-bold text-[#1a1a1a] leading-none">Login</p>
                  </div>
                </button>
              )}

              <div className="h-8 w-[1px] bg-gray-100 hidden lg:block"></div>

              <div className="flex items-center gap-1.5">
                {/* Wishlist Toggle Button */}
                <button 
                  onClick={() => {
                    const user = localStorage.getItem('skyfit_user')
                    if (!user) {
                      setIsAuthModalOpen(true)
                    } else {
                      setIsWishlistOpen(true)
                    }
                  }}
                  className="relative w-10 h-10 flex items-center justify-center hover:bg-gray-50 rounded-xl transition-all group focus:outline-none"
                >
                  <Heart size={20} className="text-gray-600 group-hover:text-[#128a88]" />
                  {wishlistCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#128a88] text-white text-[9px] font-black rounded-full flex items-center justify-center animate-in scale-in duration-100">{wishlistCount}</span>
                  )}
                </button>
                {/* Cart Toggle Button */}
                <button 
                  onClick={() => {
                    const user = localStorage.getItem('skyfit_user')
                    if (!user) {
                      setIsAuthModalOpen(true)
                    } else {
                      setIsCartOpen(true)
                    }
                  }}
                  className="relative w-10 h-10 flex items-center justify-center hover:bg-gray-50 rounded-xl transition-all group focus:outline-none"
                >
                  <ShoppingBag size={20} className="text-gray-600 group-hover:text-[#128a88]" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#128a88] text-white text-[9px] font-black rounded-full flex items-center justify-center animate-in scale-in duration-100">{cartCount}</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Slide-down Search Bar */}
        <div
          className={`md:hidden bg-white border-b border-gray-100 transition-all duration-300 ease-in-out overflow-hidden ${isSearchOpen ? 'max-h-24 opacity-100 overflow-visible' : 'max-h-0 opacity-0 pointer-events-none'
            }`}
        >
          <div ref={mobileBarSearchRef} className="px-4 py-3 relative">
            <input
              type="text"
              value={activeSearchSource === 'mobile-bar' ? searchQuery : ''}
              onChange={(e) => handleInputChange(e, 'mobile-bar')}
              onFocus={() => {
                setActiveSearchSource('mobile-bar')
                if (searchQuery.trim().length >= 2) setShowResults(true)
              }}
              placeholder="Search fitness gear..."
              className="w-full h-10 pl-11 pr-9 bg-[#f8f9fa] rounded-xl text-sm outline-none border border-transparent focus:border-[#128a88]/20 focus:bg-white transition-all"
            />
            <Search size={16} className="absolute left-7 top-1/2 -translate-y-1/2 text-gray-400" />
            
            {activeSearchSource === 'mobile-bar' && searchQuery && (
              <button 
                onClick={clearSearch}
                className="absolute right-7 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={14} />
              </button>
            )}

            {activeSearchSource === 'mobile-bar' && renderSearchResults()}
          </div>
        </div>

        {/* Navigation Bar - Collapses on Scroll - Desktop Only */}
        <div
          className={`hidden lg:block border-b border-gray-100 bg-gray-50/30 overflow-hidden transition-all duration-500 ease-in-out ${isScrolled ? 'max-h-0 opacity-0 pointer-events-none' : 'max-h-20 opacity-100'
            }`}
        >
          <div className="max-w-7xl mx-auto px-4 lg:px-6 h-14 flex items-center justify-between">
            <nav className="flex items-center h-full">
              <Link href="/shop" className="h-full px-6 text-sm font-bold text-[#1a1a1a] hover:text-[#128a88] transition-colors flex items-center gap-2 border-x border-gray-100 bg-white shadow-[inset_0_-2px_0_#128a88]">
                <Menu size={16} />
                Shop All
              </Link>

              <div className="flex items-center h-full px-2">
                <Link href="/popular" className="px-5 text-sm font-semibold text-gray-500 hover:text-[#1a1a1a] transition-colors border-r border-gray-100 last:border-r-0 h-8 flex items-center">Popular</Link>
                <Link href="/workouts" className="px-5 text-sm font-semibold text-gray-500 hover:text-[#1a1a1a] transition-colors border-r border-gray-100 last:border-r-0 h-8 flex items-center">Workouts</Link>
                <Link href="/blogs" className="px-5 text-sm font-semibold text-gray-500 hover:text-[#1a1a1a] transition-colors border-r border-gray-100 last:border-r-0 h-8 flex items-center">Blogs</Link>
                <Link href="/contact" className="px-5 text-sm font-semibold text-gray-500 hover:text-[#1a1a1a] transition-colors h-8 flex items-center">Contact</Link>
              </div>
            </nav>

            <div className="hidden sm:flex items-center gap-3 h-full px-6 border-l border-gray-100">
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center border border-gray-100 shadow-sm">
                <Phone size={14} className="text-[#128a88]" />
              </div>
              <div>
                <a href="tel:+977" className="text-sm font-black text-[#1a1a1a] hover:text-[#128a88] transition-colors leading-none">+977-980000000</a>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Drawer Backdrop */}
        <div
          className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-[150] transition-opacity duration-300 lg:hidden ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          onClick={() => setIsMobileMenuOpen(false)}
        />

        {/* Mobile Drawer */}
        <div
          className={`fixed top-0 bottom-0 left-0 w-full max-w-[300px] bg-white z-[200] shadow-2xl flex flex-col transition-transform duration-300 ease-in-out lg:hidden ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
        >
          {/* Drawer Header */}
          <div className="h-20 px-6 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
            <Link href="/" onClick={() => setIsMobileMenuOpen(false)}>
              <Image
                src="/logo.png"
                alt="SkyFit"
                width={110}
                height={38}
                className="h-8 w-auto object-contain"
              />
            </Link>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 rounded-xl hover:bg-gray-50 text-gray-600 transition-colors focus:outline-none"
              aria-label="Close Menu"
            >
              <X size={20} />
            </button>
          </div>

          {/* Drawer Content */}
          <div className="flex-1 overflow-y-auto py-6 px-6 space-y-8">
            {/* Mobile Search inside Drawer */}
            <div ref={mobileDrawerSearchRef} className="relative group">
              <input
                type="text"
                value={activeSearchSource === 'mobile-drawer' ? searchQuery : ''}
                onChange={(e) => handleInputChange(e, 'mobile-drawer')}
                onFocus={() => {
                  setActiveSearchSource('mobile-drawer')
                  if (searchQuery.trim().length >= 2) setShowResults(true)
                }}
                placeholder="Search fitness gear..."
                className="w-full h-11 pl-11 pr-9 bg-[#f8f9fa] rounded-xl text-sm outline-none border border-transparent focus:border-[#128a88]/20 focus:bg-white transition-all"
              />
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#128a88] transition-colors" />
              
              {activeSearchSource === 'mobile-drawer' && searchQuery && (
                <button 
                  onClick={clearSearch}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={14} />
                </button>
              )}

              {activeSearchSource === 'mobile-drawer' && renderSearchResults()}
            </div>

            {/* Navigation Links */}
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3 px-1">Shop Categories</p>

              <Link
                href="/shop"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 font-bold text-[#1a1a1a] text-sm transition-all group"
              >
                <span className="flex items-center gap-3 text-[#128a88]">
                  <Menu size={18} />
                  Shop All
                </span>
                <ChevronRight size={16} className="text-gray-400 group-hover:translate-x-0.5 transition-transform" />
              </Link>

              <Link
                href="/popular"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 font-semibold text-[#1a1a1a] text-sm transition-all group"
              >
                <span>Popular Products</span>
                <ChevronRight size={16} className="text-gray-400 group-hover:translate-x-0.5 transition-transform" />
              </Link>

              <Link
                href="/workouts"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 font-semibold text-[#1a1a1a] text-sm transition-all group"
              >
                <span>Workouts</span>
                <ChevronRight size={16} className="text-gray-400 group-hover:translate-x-0.5 transition-transform" />
              </Link>

              <Link
                href="/blogs"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 font-semibold text-[#1a1a1a] text-sm transition-all group"
              >
                <span>Blogs & News</span>
                <ChevronRight size={16} className="text-gray-400 group-hover:translate-x-0.5 transition-transform" />
              </Link>

              <Link
                href="/contact"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 font-semibold text-[#1a1a1a] text-sm transition-all group"
              >
                <span>Contact Us</span>
                <ChevronRight size={16} className="text-gray-400 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            {/* Quick Account Actions */}
            <div className="pt-6 border-t border-gray-100 space-y-2">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-1 mb-1">Your Account</p>

              {currentUser ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                    <div className="w-9 h-9 rounded-xl bg-[#128a88]/10 text-[#128a88] border border-[#128a88]/20 flex items-center justify-center text-xs font-black uppercase flex-shrink-0">
                      {currentUser.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-gray-800 truncate leading-none mb-1">{currentUser.name}</p>
                      <p className="text-[10px] font-semibold text-gray-400 truncate leading-none">{currentUser.email}</p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 py-1">
                    <Link
                      href="/account?tab=profile"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="w-full p-3 text-sm font-bold text-gray-700 hover:text-[#128a88] hover:bg-gray-50 rounded-xl transition-all flex items-center gap-2.5 border border-gray-100"
                    >
                      <User size={15} className="text-gray-400" />
                      <span>My Profile</span>
                    </Link>
                    <Link
                      href="/account?tab=orders"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="w-full p-3 text-sm font-bold text-gray-700 hover:text-[#128a88] hover:bg-gray-50 rounded-xl transition-all flex items-center gap-2.5 border border-gray-100"
                    >
                      <ShoppingBag size={15} className="text-gray-400" />
                      <span>My Orders</span>
                    </Link>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold rounded-xl transition-colors text-center text-xs focus:outline-none"
                  >
                    Log Out
                  </button>
                </div>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false)
                      setAuthError('')
                      setIsAuthModalOpen(true)
                    }}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-all text-left focus:outline-none"
                  >
                    <div className="w-9 h-9 rounded-full bg-[#f8f9fa] flex items-center justify-center text-gray-600">
                      <User size={18} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight leading-none mb-1">Welcome</p>
                      <p className="text-sm font-bold text-[#1a1a1a] leading-none">Login / Register</p>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false)
                      setIsWishlistOpen(true)
                    }}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 text-left focus:outline-none"
                  >
                    <div className="w-9 h-9 rounded-full bg-[#f8f9fa] flex items-center justify-center text-gray-600">
                      <Heart size={18} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight leading-none mb-1">Saved Items</p>
                      <p className="text-sm font-bold text-[#1a1a1a] leading-none">My Wishlist ({wishlistCount})</p>
                    </div>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Drawer Footer */}
          <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex-shrink-0">
            <div className="flex-shrink-0 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center border border-gray-100 shadow-sm flex-shrink-0">
                <Phone size={15} className="text-[#128a88]" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight leading-none mb-0.5">Need Help?</p>
                <a href="tel:+977" className="text-sm font-black text-[#1a1a1a] hover:text-[#128a88] transition-colors leading-none">+977-980000000</a>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Cart Off-Canvas Slide-out Drawer */}
      {isCartOpen && (
        <div className="fixed inset-0 z-[250] flex justify-end animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-xs" onClick={() => setIsCartOpen(false)}></div>
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingBag size={20} className="text-[#128a88]" />
                <h3 className="font-extrabold text-gray-900 text-base">Shopping Cart</h3>
                <span className="text-xs bg-gray-100 text-gray-500 font-bold px-2 py-0.5 rounded-full">{cartCount}</span>
              </div>
              <button onClick={() => setIsCartOpen(false)} className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:text-gray-800">
                <X size={16} />
              </button>
            </div>

            {/* Scrollable list */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {cartItems.length === 0 ? (
                <div className="text-center py-20">
                  <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-4">
                    <ShoppingBag className="text-gray-300 w-7 h-7" />
                  </div>
                  <p className="text-sm font-bold text-gray-800">Your cart is empty</p>
                  <p className="text-xs text-gray-400 mt-1">Add items to get started on your workouts.</p>
                </div>
              ) : (
                cartItems.map((item) => (
                  <div key={item.id} className="flex gap-4 border-b border-gray-100 pb-4 last:border-b-0">
                    <div className="w-16 h-16 bg-gray-50 rounded-xl overflow-hidden border border-gray-100 flex items-center justify-center p-1.5 flex-shrink-0">
                      {item.images[0] && item.images[0].startsWith('http') ? (
                        <img src={item.images[0]} alt="" className="w-full h-full object-contain rounded-lg" />
                      ) : (
                        <span className="text-xs">💪</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900 truncate">{item.name}</p>
                      <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                        <span className="text-xs font-semibold text-gray-400">{item.category}</span>
                        {(item.selectedColor || item.selectedSize) && (
                          <>
                            <span className="text-gray-300 text-xs">•</span>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#128a88] bg-[#128a88]/5 px-1.5 py-0.5 rounded">
                              {item.selectedColor && `${item.selectedColor}`}
                              {item.selectedColor && item.selectedSize && ' / '}
                              {item.selectedSize && `${item.selectedSize}`}
                            </span>
                          </>
                        )}
                      </div>
                      <div className="flex items-center justify-between mt-2.5">
                        <div className="flex items-center border border-gray-100 rounded-full p-0.5 bg-gray-50/50">
                          <button onClick={() => handleUpdateQty(item.id, item.qty - 1)} className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-black"><Minus size={12} /></button>
                          <span className="w-6 text-center text-xs font-bold text-gray-800">{item.qty}</span>
                          <button onClick={() => handleUpdateQty(item.id, item.qty + 1)} className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-black"><Plus size={12} /></button>
                        </div>
                        <span className="text-sm font-black text-gray-950">Rs.{(item.price * item.qty).toLocaleString()}</span>
                      </div>
                    </div>
                    <button onClick={() => handleRemoveFromCart(item.id)} className="text-gray-300 hover:text-rose-500 self-start p-1 transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Footer Summary */}
            {cartItems.length > 0 && (
              <div className="p-6 border-t border-gray-100 bg-gray-50">
                <div className="flex justify-between items-baseline mb-4">
                  <span className="text-sm font-bold text-gray-500 uppercase">Subtotal</span>
                  <span className="text-xl font-black text-gray-900">Rs.{cartSubtotal.toLocaleString()}</span>
                </div>
                <Link href="/checkout" onClick={() => setIsCartOpen(false)} className="w-full h-11 bg-[#1a1a1a] hover:bg-[#128a88] text-white rounded-xl text-sm font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2">
                  <span>Proceed to Checkout</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Wishlist Off-Canvas Slide-out Drawer */}
      {isWishlistOpen && (
        <div className="fixed inset-0 z-[250] flex justify-end animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-xs" onClick={() => setIsWishlistOpen(false)}></div>
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Heart size={20} className="text-[#128a88]" />
                <h3 className="font-extrabold text-gray-900 text-base">My Wishlist</h3>
                <span className="text-xs bg-gray-100 text-gray-500 font-bold px-2 py-0.5 rounded-full">{wishlistCount}</span>
              </div>
              <button onClick={() => setIsWishlistOpen(false)} className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:text-gray-800">
                <X size={16} />
              </button>
            </div>

            {/* Scrollable list */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {wishlistItems.length === 0 ? (
                <div className="text-center py-20">
                  <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-4">
                    <Heart className="text-gray-300 w-7 h-7" />
                  </div>
                  <p className="text-sm font-bold text-gray-800">Your wishlist is empty</p>
                  <p className="text-xs text-gray-400 mt-1">Save gear you love to purchase later.</p>
                </div>
              ) : (
                wishlistItems.map((item) => (
                  <div key={item.id} className="flex gap-4 border-b border-gray-100 pb-4 last:border-b-0">
                    <div className="w-16 h-16 bg-gray-50 rounded-xl overflow-hidden border border-gray-100 flex items-center justify-center p-1.5 flex-shrink-0">
                      {item.images[0] && item.images[0].startsWith('http') ? (
                        <img src={item.images[0]} alt="" className="w-full h-full object-contain rounded-lg" />
                      ) : (
                        <span className="text-xs">💪</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900 truncate">{item.name}</p>
                      <p className="text-xs font-semibold text-gray-500 mt-1">{item.category}</p>
                      <div className="flex items-center justify-between mt-2.5">
                        <span className="text-sm font-black text-gray-950">Rs.{item.price.toLocaleString()}</span>
                        <button onClick={() => handleMoveToCart(item)} className="text-xs font-bold bg-[#128a88]/10 hover:bg-[#128a88] text-[#128a88] hover:text-white px-3.5 py-1.5 rounded-lg transition-colors">
                          Add to Cart
                        </button>
                      </div>
                    </div>
                    <button onClick={() => handleRemoveFromWishlist(item.id)} className="text-gray-300 hover:text-rose-500 self-start p-1 transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Auth Modal Overlay */}
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 animate-in fade-in duration-200">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={closeAuthModal}
          ></div>

          {/* Modal Container */}
          <div className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden z-10 animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            {/* Close Button */}
            <button 
              onClick={closeAuthModal}
              className="absolute top-4 right-4 z-50 w-9 h-9 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:text-[#1a1a1a] transition-colors shadow-sm focus:outline-none"
            >
              <X size={18} />
            </button>

            {/* Scrollable Form Body */}
            <div className="overflow-y-auto p-6 sm:p-8">
              {isAuthSuccess ? (
                <div className="text-center py-6">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 text-[#22c55e] flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 size={28} />
                  </div>
                  <h3 className="text-lg font-bold text-emerald-800 mb-2">Success!</h3>
                  <p className="text-sm text-emerald-600/90 leading-relaxed mb-6">
                    {authSuccessMsg}
                  </p>
                  <button
                    onClick={closeAuthModal}
                    className="inline-flex h-11 px-6 items-center justify-center rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-lg shadow-emerald-500/10"
                  >
                    Got It
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3 mb-6">
                    <img src="/faviconskyfit.png" alt="SkyFit Logo" className="w-6 h-6 object-contain" />
                    <span className="text-sm font-bold text-gray-500">SkyFit Customer Portal</span>
                  </div>

                  {/* Tabs */}
                  <div className="grid grid-cols-2 border-b border-gray-100 pb-3 mb-5">
                    <button
                      onClick={() => {
                        setAuthTab('login')
                        setAuthError('')
                      }}
                      className={`text-center pb-2 text-sm font-bold border-b-2 transition-all focus:outline-none ${authTab === 'login'
                          ? 'border-[#128a88] text-[#128a88]'
                          : 'border-transparent text-gray-400 hover:text-gray-600'
                        }`}
                    >
                      Log In
                    </button>
                    <button
                      onClick={() => {
                        setAuthTab('signup')
                        setAuthError('')
                      }}
                      className={`text-center pb-2 text-sm font-bold border-b-2 transition-all focus:outline-none ${authTab === 'signup'
                          ? 'border-[#128a88] text-[#128a88]'
                          : 'border-transparent text-gray-400 hover:text-gray-600'
                        }`}
                    >
                      Register
                    </button>
                  </div>

                  {/* Error Alert Box */}
                  {authError && (
                    <div className="mb-4 p-3.5 bg-rose-50 border border-rose-100 rounded-2xl text-xs font-semibold text-rose-600 animate-in fade-in duration-150">
                      {authError}
                    </div>
                  )}

                  {/* Login Form */}
                  {authTab === 'login' ? (
                    <form onSubmit={handleLoginSubmit} className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Email Address</label>
                        <div className="relative">
                          <input
                            type="email"
                            required
                            value={loginData.email}
                            onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                            placeholder="john@example.com"
                            className="w-full h-11 pl-11 pr-4 bg-gray-50/50 border border-gray-200 rounded-xl text-sm outline-none focus:bg-white focus:border-[#128a88] transition-colors"
                          />
                          <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Password</label>
                          <a href="#" className="text-[10px] font-bold text-[#128a88] hover:underline">Forgot?</a>
                        </div>
                        <div className="relative">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            required
                            value={loginData.password}
                            onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                            placeholder="••••••••"
                            className="w-full h-11 pl-11 pr-10 bg-gray-50/50 border border-gray-200 rounded-xl text-sm outline-none focus:bg-white focus:border-[#128a88] transition-colors"
                          />
                          <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={isAuthLoading}
                        className="w-full h-11 bg-[#1a1a1a] text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-gray-800 disabled:bg-gray-300 transition-colors flex items-center justify-center gap-2 cursor-pointer mt-6"
                      >
                        <span>{isAuthLoading ? 'Processing...' : 'Log In'}</span>
                        {!isAuthLoading && <ArrowRight size={13} />}
                      </button>
                    </form>
                  ) : (
                    /* Signup Form */
                    <form onSubmit={handleSignupSubmit} className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Full Name</label>
                        <div className="relative">
                          <input
                            type="text"
                            required
                            value={signupData.name}
                            onChange={(e) => setSignupData({ ...signupData, name: e.target.value })}
                            placeholder="John Doe"
                            className="w-full h-11 pl-11 pr-4 bg-gray-50/50 border border-gray-200 rounded-xl text-sm outline-none focus:bg-white focus:border-[#128a88] transition-colors"
                          />
                          <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Email Address</label>
                        <div className="relative">
                          <input
                            type="email"
                            required
                            value={signupData.email}
                            onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                            placeholder="john@example.com"
                            className="w-full h-11 pl-11 pr-4 bg-gray-50/50 border border-gray-200 rounded-xl text-sm outline-none focus:bg-white focus:border-[#128a88] transition-colors"
                          />
                          <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Phone Number</label>
                        <div className="relative">
                          <input
                            type="tel"
                            required
                            value={signupData.phone}
                            onChange={(e) => setSignupData({ ...signupData, phone: e.target.value })}
                            placeholder="+977-9800000000"
                            className="w-full h-11 pl-11 pr-4 bg-gray-50/50 border border-gray-200 rounded-xl text-sm outline-none focus:bg-white focus:border-[#128a88] transition-colors"
                          />
                          <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Delivery Address</label>
                        <div className="relative">
                          <input
                            type="text"
                            required
                            value={signupData.address}
                            onChange={(e) => setSignupData({ ...signupData, address: e.target.value })}
                            placeholder="Kathmandu, Nepal"
                            className="w-full h-11 pl-11 pr-4 bg-gray-50/50 border border-gray-200 rounded-xl text-sm outline-none focus:bg-white focus:border-[#128a88] transition-colors"
                          />
                          <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Password</label>
                          <div className="relative">
                            <input
                              type={showPassword ? 'text' : 'password'}
                              required
                              value={signupData.password}
                              onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                              placeholder="••••••••"
                              className="w-full h-11 pl-11 pr-4 bg-gray-50/50 border border-gray-200 rounded-xl text-sm outline-none focus:bg-white focus:border-[#128a88] transition-colors"
                            />
                            <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Confirm</label>
                          <div className="relative">
                            <input
                              type={showPassword ? 'text' : 'password'}
                              required
                              value={signupData.confirmPassword}
                              onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
                              placeholder="••••••••"
                              className="w-full h-11 pl-11 pr-4 bg-gray-50/50 border border-gray-200 rounded-xl text-sm outline-none focus:bg-white focus:border-[#128a88] transition-colors"
                            />
                            <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[10px] text-gray-400 flex items-center gap-1">
                          <ShieldCheck size={12} className="text-[#128a88]" />
                          Data encrypted
                        </span>
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="text-[10px] font-bold text-gray-500 hover:text-black focus:outline-none"
                        >
                          {showPassword ? 'Hide Pass' : 'Show Pass'}
                        </button>
                      </div>

                      <button
                        type="submit"
                        disabled={isAuthLoading}
                        className="w-full h-11 bg-[#1a1a1a] text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-gray-800 disabled:bg-gray-300 transition-colors flex items-center justify-center gap-2 cursor-pointer mt-4"
                      >
                        <span>{isAuthLoading ? 'Creating...' : 'Register'}</span>
                        {!isAuthLoading && <ArrowRight size={13} />}
                      </button>
                    </form>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Custom Toast Notification Popup */}
      {showToast && (
        <div className="fixed bottom-6 right-6 z-[300] bg-[#1a1a1a] text-white text-xs font-bold px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 border border-gray-800 animate-in slide-in-from-bottom duration-300">
          <div className="w-5 h-5 rounded-full bg-[#128a88]/20 flex items-center justify-center text-[#128a88]">
            <Sparkles size={12} fill="currentColor" />
          </div>
          <span>{toastMessage}</span>
        </div>
      )}
    </>
  )
}
