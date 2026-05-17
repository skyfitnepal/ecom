'use client'

import React, { useEffect, useState } from 'react'
import { Star, Quote } from 'lucide-react'

const REVIEWS = [
  {
    id: 1,
    name: "Aashish Thapa",
    role: "Professional Athlete",
    body: "The quality of gym equipment from SkyFit is unmatched. Their dumbbells have the perfect grip, and the delivery was incredibly fast!",
    rating: 5,
  },
  {
    id: 2,
    name: "Srijana Rai",
    role: "Yoga Instructor",
    body: "I've tried many mats, but the SkyFit non-slip mat is on another level. It provides amazing cushion and stays perfectly in place during intense sessions.",
    rating: 5,
  },
  {
    id: 3,
    name: "Bibek Sharma",
    role: "Fitness Enthusiast",
    body: "Finally found a store in Nepal that sells authentic international-grade sports gear. Their customer support team helped me pick the right treadmill for my home.",
    rating: 5,
  },
  {
    id: 4,
    name: "Prabesh Kunwar",
    role: "Gym Owner",
    body: "Outfitted my entire commercial gym with SkyFit gear. The durability is incredible, even with heavy daily use. Highly recommended for professionals.",
    rating: 5,
  },
  {
    id: 5,
    name: "Maya Gurung",
    role: "Home Workout Fan",
    body: "The kettlebells and resistance bands are high quality and look great in my home gym. Love the aesthetic and the functional design.",
    rating: 5,
  },
  {
    id: 6,
    name: "Roshan Devkota",
    role: "Basketball Player",
    body: "Great collection of sports accessories. Got my knee sleeves and compression gear here. Real game changer for my performance.",
    rating: 5,
  }
]

const ReviewCard = ({ name, role, body, rating }: any) => (
  <div className="relative p-6 sm:p-8 w-[290px] sm:w-[350px] rounded-2xl sm:rounded-[32px] bg-[#f8f9fa] border border-gray-100 hover:bg-white hover:border-[#128a88]/20 hover:shadow-[0_20px_50px_-15px_rgba(0,0,0,0.05)] transition-all duration-500 group select-none mx-3 sm:mx-4 shrink-0">
    <div className="absolute top-6 right-6 sm:top-8 sm:right-8 text-[#128a88]/10 group-hover:text-[#128a88]/20 transition-colors">
      <Quote className="w-8 h-8 sm:w-10 sm:h-10" />
    </div>
    <div className="flex gap-1 mb-5 sm:mb-6 text-yellow-400">
      {[...Array(rating)].map((_, i) => (
        <Star key={i} size={14} fill="currentColor" />
      ))}
    </div>
    <p className="text-[#1a1a1a] font-medium leading-relaxed mb-6 sm:mb-8 relative z-10 min-h-[130px] sm:min-h-[100px] text-xs sm:text-sm">
      "{body}"
    </p>
    <div className="flex items-center gap-3 sm:gap-4">
      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#128a88]/10 flex items-center justify-center text-[#128a88] font-black text-base sm:text-lg">
        {name[0]}
      </div>
      <div>
        <h4 className="font-black text-[#1a1a1a] text-xs sm:text-sm">{name}</h4>
        <p className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-widest">{role}</p>
      </div>
    </div>
  </div>
)

export const Testimonials = () => {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <section className="py-16 sm:py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 lg:px-6 mb-12 sm:mb-16">
        <div className="text-center">
          <span className="text-[#128a88] font-bold tracking-widest text-[10px] uppercase mb-2 sm:mb-3 block">Testimonials</span>
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-[#1a1a1a] mb-3 sm:mb-4">Real Results from Real Athletes</h2>
          <p className="text-gray-500 max-w-2xl mx-auto font-medium text-xs sm:text-sm md:text-base">
            Join thousands of people in Nepal who have transformed their fitness journey with SkyFit.
          </p>
        </div>
      </div>

      <div className="relative w-full overflow-hidden flex">
        {/* Simple CSS-only Marquee Row */}
        <div className="flex animate-marquee hover:[animation-play-state:paused] py-4">
          {[...REVIEWS, ...REVIEWS, ...REVIEWS].map((review, i) => (
            <ReviewCard key={`${review.id}-${i}`} {...review} />
          ))}
        </div>

        {/* Gradient Overlays */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-12 sm:w-32 bg-gradient-to-r from-white to-transparent z-10"></div>
        <div className="pointer-events-none absolute inset-y-0 right-0 w-12 sm:w-32 bg-gradient-to-l from-white to-transparent z-10"></div>
      </div>

      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.33%); }
        }
        .animate-marquee {
          animation: marquee 40s linear infinite;
        }
      `}</style>
    </section>
  )
}
