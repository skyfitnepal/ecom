import React from 'react'
import { headers } from 'next/headers'
import Link from 'next/link'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { Hero } from '@/components/Hero'
import { Categories } from '@/components/Categories'
import { NewArrivals } from '@/components/NewArrivals'
import { PromoBanner } from '@/components/PromoBanner'
import { Testimonials } from '@/components/Testimonials'
import { Footer } from '@/components/Footer'

export default async function HomePage() {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await headers() })

  return (
    <div className="bg-white min-h-screen">
      {/* Integrated Hero & Features */}
      <Hero />

      {/* Browse by Category Slider */}
      <Categories />

      {/* New Arrivals Grid */}
      <NewArrivals />

      {/* Promo Banner Section */}
      <PromoBanner />

      {/* Athlete Testimonials (Infinite Marquee) */}
      <Testimonials />

      {/* Main Footer */}
      <Footer />

      {/* Admin Quick Link */}
      <div className="fixed bottom-8 right-8 z-50">
        <Link 
          href="/admin" 
          className="bg-black text-white px-6 py-3 rounded-full font-bold text-sm shadow-2xl hover:scale-105 transition-transform flex items-center gap-2"
        >
          <div className="w-2 h-2 bg-[#128a88] rounded-full animate-pulse"></div>
          Go to Admin
        </Link>
      </div>
    </div>
  )
}
