'use client'

import React from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation } from 'swiper/modules'

// Import Swiper styles
import 'swiper/css'
import 'swiper/css/navigation'

const CATEGORIES = [
  { name: 'Laptop & PC', icon: '💻' },
  { name: 'Watches', icon: '⌚' },
  { name: 'Mobile & Tablets', icon: '📱' },
  { name: 'Health & Sports', icon: '🏃' },
  { name: 'Home Appliances', icon: '🏠' },
  { name: 'Games & Videos', icon: '🎮' },
  { name: 'Audio & Music', icon: '🎧' },
  { name: 'Gym Gear', icon: '🏋️' },
]

export const Categories = () => {
  return (
    <section className="max-w-7xl mx-auto px-4 lg:px-6 py-12">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-[#0c1222]">Browse by Category</h2>
        <div className="flex gap-2">
          <button className="category-prev w-10 h-10 rounded-full border border-gray-100 flex items-center justify-center hover:bg-[#128a88] hover:text-white hover:border-[#128a88] transition-all cursor-pointer">
            <ChevronLeft size={20} />
          </button>
          <button className="category-next w-10 h-10 rounded-full border border-gray-100 flex items-center justify-center hover:bg-[#128a88] hover:text-white hover:border-[#128a88] transition-all cursor-pointer">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <Swiper
        modules={[Navigation]}
        navigation={{
          prevEl: '.category-prev',
          nextEl: '.category-next',
        }}
        spaceBetween={20}
        slidesPerView={2}
        breakpoints={{
          640: { slidesPerView: 3 },
          768: { slidesPerView: 4 },
          1024: { slidesPerView: 6 },
        }}
        className="pb-4"
      >
        {CATEGORIES.map((cat, index) => (
          <SwiperSlide key={index}>
            <Link
              href={`/category/${cat.name.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-')}`}
              className="flex flex-col items-center group"
            >
              <div className="w-24 h-24 rounded-full bg-[#f8f9fa] flex items-center justify-center mb-4 transition-all duration-300 group-hover:bg-white group-hover:shadow-[0_10px_30px_-10px_rgba(0,0,0,0.1)] group-hover:-translate-y-1 mx-auto">
                <span className="text-2xl filter group-hover:scale-110 transition-transform">{cat.icon}</span>
              </div>
              <p className="text-sm font-bold text-[#1a1a1a] text-center group-hover:text-[#128a88] transition-colors">
                {cat.name}
              </p>
            </Link>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  )
}
