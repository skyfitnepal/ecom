'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Search, User, Heart, ShoppingBag, Menu, Phone, X, ChevronRight } from 'lucide-react'

export const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isMobileMenuOpen])

  return (
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
                src="/logo.png" 
                alt="SkyFit" 
                width={130} 
                height={45} 
                className="h-9 w-auto object-contain"
                priority
              />
            </Link>
          </div>

          {/* Search Bar (Desktop) */}
          <div className="flex-grow max-w-xl relative group hidden md:block">
            <input 
              type="text" 
              placeholder="Search fitness gear..." 
              className="w-full h-11 pl-12 pr-4 bg-[#f8f9fa] rounded-xl text-sm outline-none border border-transparent focus:border-[#128a88]/20 focus:bg-white transition-all duration-300"
            />
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#128a88] transition-colors" />
          </div>

          {/* User & Shop Actions */}
          <div className="flex items-center gap-2 lg:gap-5">
            {/* Mobile Search Toggle */}
            <button 
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="md:hidden w-10 h-10 flex items-center justify-center hover:bg-gray-50 rounded-xl transition-all text-gray-600 focus:outline-none"
              aria-label="Toggle Search"
            >
              <Search size={20} className={isSearchOpen ? 'text-[#128a88]' : 'text-gray-600'} />
            </button>

            <Link href="/account" className="hidden lg:flex items-center gap-2.5 p-2 rounded-xl hover:bg-gray-50 transition-all group">
              <div className="w-10 h-10 rounded-full bg-[#f8f9fa] flex items-center justify-center group-hover:bg-[#128a88]/10 transition-colors">
                <User size={20} className="text-gray-600 group-hover:text-[#128a88]" />
              </div>
              <div className="hidden lg:block text-left">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter leading-none mb-1">Account</p>
                <p className="text-sm font-bold text-[#1a1a1a] leading-none">Login</p>
              </div>
            </Link>

            <div className="h-8 w-[1px] bg-gray-100 hidden lg:block"></div>

            <div className="flex items-center gap-1.5">
              <button className="relative w-10 h-10 hidden lg:flex items-center justify-center hover:bg-gray-50 rounded-xl transition-all group">
                <Heart size={20} className="text-gray-600 group-hover:text-[#128a88]" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#128a88] text-white text-[9px] font-black rounded-full flex items-center justify-center">0</span>
              </button>
              <button className="relative w-10 h-10 flex items-center justify-center hover:bg-gray-50 rounded-xl transition-all group">
                <ShoppingBag size={20} className="text-gray-600 group-hover:text-[#128a88]" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#128a88] text-white text-[9px] font-black rounded-full flex items-center justify-center">0</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Slide-down Search Bar */}
      <div 
        className={`md:hidden bg-white border-b border-gray-100 transition-all duration-300 ease-in-out overflow-hidden ${
          isSearchOpen ? 'max-h-16 opacity-100' : 'max-h-0 opacity-0 pointer-events-none'
        }`}
      >
        <div className="px-4 py-3 relative">
          <input 
            type="text" 
            placeholder="Search fitness gear..." 
            className="w-full h-10 pl-11 pr-4 bg-[#f8f9fa] rounded-xl text-sm outline-none border border-transparent focus:border-[#128a88]/20 focus:bg-white transition-all"
          />
          <Search size={16} className="absolute left-7 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>
      </div>

      {/* Navigation Bar - Collapses on Scroll - Desktop Only */}
      <div 
        className={`hidden lg:block border-b border-gray-100 bg-gray-50/30 overflow-hidden transition-all duration-500 ease-in-out ${
          isScrolled ? 'max-h-0 opacity-0 pointer-events-none' : 'max-h-20 opacity-100'
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
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-[150] transition-opacity duration-300 lg:hidden ${
          isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsMobileMenuOpen(false)}
      />

      {/* Mobile Drawer */}
      <div 
        className={`fixed top-0 bottom-0 left-0 w-full max-w-[300px] bg-white z-[200] shadow-2xl flex flex-col transition-transform duration-300 ease-in-out lg:hidden ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
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
          <div className="relative group">
            <input 
              type="text" 
              placeholder="Search fitness gear..." 
              className="w-full h-11 pl-11 pr-4 bg-[#f8f9fa] rounded-xl text-sm outline-none border border-transparent focus:border-[#128a88]/20 focus:bg-white transition-all"
            />
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#128a88] transition-colors" />
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
            
            <Link 
              href="/account" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-all"
            >
              <div className="w-9 h-9 rounded-full bg-[#f8f9fa] flex items-center justify-center text-gray-600">
                <User size={18} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight leading-none mb-1">Welcome</p>
                <p className="text-sm font-bold text-[#1a1a1a] leading-none">Login / Register</p>
              </div>
            </Link>

            <Link 
              href="/wishlist" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-all"
            >
              <div className="w-9 h-9 rounded-full bg-[#f8f9fa] flex items-center justify-center text-gray-600">
                <Heart size={18} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight leading-none mb-1">Saved Items</p>
                <p className="text-sm font-bold text-[#1a1a1a] leading-none">My Wishlist (0)</p>
              </div>
            </Link>
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
  )
}
