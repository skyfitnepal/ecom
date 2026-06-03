'use client'

import React from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation } from 'swiper/modules'

// Import Swiper styles
import 'swiper/css'
import 'swiper/css/navigation'

import { CategoryData } from '@/lib/db'

// Fallback fitness categories in case the database list is empty
const FALLBACK_CATEGORIES: CategoryData[] = [
  { name: 'Strength Training', slug: 'strength-training', icon: '🏋️', count: 0, thumbnail: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=300&h=300&fit=crop&auto=format&q=80' },
  { name: 'Cardio Machines', slug: 'cardio-machines', icon: '🏃', count: 0, thumbnail: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=300&h=300&fit=crop&auto=format&q=80' },
  { name: 'Yoga & Pilates', slug: 'yoga-and-pilates', icon: '🧘', count: 0, thumbnail: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=300&h=300&fit=crop&auto=format&q=80' },
  { name: 'Boxing & MMA', slug: 'boxing-and-mma', icon: '🥊', count: 0, thumbnail: 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=300&h=300&fit=crop&auto=format&q=80' },
  { name: 'Supplements', slug: 'supplements', icon: '💊', count: 0, thumbnail: 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=300&h=300&fit=crop&auto=format&q=80' },
  { name: 'Accessories', slug: 'accessories', icon: '🎗️', count: 0, thumbnail: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=300&h=300&fit=crop&auto=format&q=80' },
]

interface CategoriesProps {
  categories?: CategoryData[]
}

export const Categories: React.FC<CategoriesProps> = ({ categories = [] }) => {
  const displayCategories = categories.length > 0 ? categories : FALLBACK_CATEGORIES

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
        {displayCategories.map((cat, index) => (
          <SwiperSlide key={index}>
            <Link
              href={`/category/${cat.slug}`}
              className="flex flex-col items-center group"
            >
              <div className="w-24 h-24 rounded-full bg-[#f8f9fa] flex items-center justify-center mb-4 overflow-hidden relative border border-gray-100 transition-all duration-300 group-hover:bg-white group-hover:shadow-[0_10px_30px_-10px_rgba(0,0,0,0.1)] group-hover:-translate-y-1 mx-auto">
                {cat.thumbnail ? (
                  <img 
                    src={cat.thumbnail} 
                    alt={cat.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                ) : (
                  <span className="text-2xl filter group-hover:scale-110 transition-transform">{cat.icon}</span>
                )}
              </div>
              <p className="text-sm font-bold text-[#1a1a1a] text-center group-hover:text-[#128a88] transition-colors line-clamp-1 max-w-[120px]">
                {cat.name}
              </p>
            </Link>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  )
}

