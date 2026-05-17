'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Search, User, Heart, ShoppingBag, Menu, Phone } from 'lucide-react'

export const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header className="w-full bg-white sticky top-0 z-[100] shadow-[0_2px_10px_-3px_rgba(0,0,0,0.07)]">
      {/* Top Section */}
      <div className="border-b border-gray-100 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 h-20 flex items-center justify-between gap-8">
          {/* Brand Logo */}
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

          {/* Search Bar */}
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
            <Link href="/account" className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-gray-50 transition-all group">
              <div className="w-10 h-10 rounded-full bg-[#f8f9fa] flex items-center justify-center group-hover:bg-[#128a88]/10 transition-colors">
                <User size={20} className="text-gray-600 group-hover:text-[#128a88]" />
              </div>
              <div className="hidden lg:block text-left">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter leading-none mb-1">Account</p>
                <p className="text-sm font-bold text-[#1a1a1a] leading-none">Login</p>
              </div>
            </Link>

            <div className="h-8 w-[1px] bg-gray-100 hidden sm:block"></div>

            <div className="flex items-center gap-1.5">
              <button className="relative w-10 h-10 flex items-center justify-center hover:bg-gray-50 rounded-xl transition-all group">
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

      {/* Navigation Bar - Collapses on Scroll */}
      <div 
        className={`border-b border-gray-100 bg-gray-50/30 overflow-hidden transition-all duration-500 ease-in-out ${
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
    </header>
  )
}
