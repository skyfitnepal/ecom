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
import { getNewArrivals, getCategories } from '@/lib/db'

export default async function HomePage() {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await headers() })

  // Fetch live products from database
  const newArrivals = await getNewArrivals(8)
  const categories = await getCategories(12)

  return (
    <div className="bg-white min-h-screen">
      {/* Integrated Hero & Features */}
      <Hero />

      {/* Browse by Category Slider */}
      <Categories categories={categories} />

      {/* New Arrivals Grid */}
      <NewArrivals initialProducts={newArrivals} />

      {/* Promo Banner Section */}
      <PromoBanner />

      {/* Athlete Testimonials (Infinite Marquee) */}
      <Testimonials />

      {/* Main Footer */}
      <Footer />

    </div>
  )
}
