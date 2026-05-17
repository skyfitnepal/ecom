'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Pagination, Autoplay, EffectFade } from 'swiper/modules'
import { Truck, ShieldCheck, Star, Zap } from 'lucide-react'

// Import Swiper styles
import 'swiper/css'
import 'swiper/css/pagination'
import 'swiper/css/effect-fade'

const SLIDES = [
  {
    tag: "Premium Gear",
    title: <>Pro Fitness <br className="hidden md:inline" /> Power Rack</>,
    desc: "Heavy-duty steel construction for ultimate stability. Elevate your home gym performance.",
    bg: "#111111",
    accent: "#128a88",
    label: "GYM"
  },
  {
    tag: "New Arrival",
    title: <>Elite Cardio <br className="hidden md:inline" /> Treadmill X1</>,
    desc: "Advanced shock absorption and 15% incline. Experience the next level of running.",
    bg: "#0c1222",
    accent: "#3b5cf6",
    label: "RUN"
  },
  {
    tag: "Sports Series",
    title: <>Performance <br className="hidden md:inline" /> Yoga Mat</>,
    desc: "Non-slip grip and extra cushioning for perfect balance and comfort during every pose.",
    bg: "#1a1b1a",
    accent: "#ccff00",
    label: "FIT"
  }
]

const FEATURES = [
  { icon: Truck, title: 'Free Shipping', desc: 'On orders over Rs.999' },
  { icon: ShieldCheck, title: 'Secure Payment', desc: '100% secure checkout' },
  { icon: Star, title: 'Quality Gear', desc: 'Premium materials only' },
  { icon: Zap, title: 'Fast Delivery', desc: 'Worldwide in 3-5 days' },
]

export const Hero = () => {
  return (
    <section className="max-w-7xl mx-auto px-4 lg:px-6 py-4 sm:py-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Banner Slider */}
        <div className="lg:col-span-2 relative rounded-3xl overflow-hidden h-[380px] sm:h-[460px] md:h-[480px] lg:h-[520px]">
          <Swiper
            modules={[Pagination, Autoplay, EffectFade]}
            pagination={{ clickable: true, bulletActiveClass: 'swiper-pagination-bullet-active !bg-white !w-8' }}
            autoplay={{ delay: 4000, disableOnInteraction: false }}
            effect="fade"
            loop={true}
            className="h-full w-full"
          >
            {SLIDES.map((slide, index) => (
              <SwiperSlide key={index}>
                <div 
                  className="h-full w-full flex items-center p-6 sm:p-12 md:p-16 relative" 
                  style={{ backgroundColor: slide.bg }}
                >
                  <div 
                    className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l -z-0"
                    style={{ backgroundImage: `linear-gradient(to left, ${slide.accent}33, transparent)` }}
                  ></div>
                  
                  <div className="relative z-10 max-w-lg">
                    <span className="text-white/60 font-bold tracking-[0.2em] text-[10px] sm:text-xs uppercase mb-3 sm:mb-6 block">
                      {slide.tag}
                    </span>
                    <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white leading-tight mb-4 sm:mb-6">
                      {slide.title}
                    </h1>
                    <p className="text-white/50 text-xs sm:text-base md:text-lg mb-6 sm:mb-8 md:mb-10 leading-relaxed font-medium max-w-md">
                      {slide.desc}
                    </p>
                    <Link 
                      href="/shop" 
                      className="inline-flex items-center justify-center px-8 py-3.5 sm:px-10 sm:py-4 text-sm sm:text-base text-white font-bold rounded-full transition-all shadow-xl group"
                      style={{ 
                        backgroundColor: slide.accent,
                        boxShadow: `0 10px 30px -10px ${slide.accent}80`
                      }}
                    >
                      Shop Now
                    </Link>
                  </div>

                  <div className="absolute right-0 bottom-0 w-full md:w-2/3 h-full pointer-events-none flex items-center justify-end p-4 sm:p-8">
                    <div className="relative w-full h-full opacity-[0.07] flex items-center justify-end">
                       <span className="text-white text-[6rem] sm:text-[10rem] md:text-[12rem] font-black select-none uppercase tracking-tighter leading-none">
                         {slide.label}
                       </span>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        {/* Side Banners */}
        <div className="grid grid-cols-2 lg:grid-cols-1 gap-6">
          <div className="min-h-[160px] sm:min-h-[220px] flex-1 relative rounded-3xl overflow-hidden bg-[#eaf4ed] p-5 sm:p-8 flex flex-col justify-between group cursor-pointer hover:shadow-lg transition-shadow">
            <div>
              <h2 className="text-sm sm:text-2xl font-black text-[#1a1a1a] leading-tight mb-2 sm:mb-4">
                Cast Iron <br /> Dumbbell Set
              </h2>
              <p className="text-[#128a88] font-bold text-[10px] sm:text-sm">Start from <span className="text-sm sm:text-xl">Rs.899</span></p>
            </div>
            <div className="absolute right-4 bottom-4 w-28 h-28 sm:w-32 sm:h-32 opacity-80 group-hover:scale-110 transition-transform"></div>
          </div>

          <div className="min-h-[160px] sm:min-h-[220px] flex-1 relative rounded-3xl overflow-hidden bg-[#f6f2ff] p-5 sm:p-8 flex flex-col justify-between group cursor-pointer hover:shadow-lg transition-shadow">
            <div>
              <h2 className="text-sm sm:text-2xl font-black text-[#1a1a1a] leading-tight mb-2 sm:mb-4">
                Smart Fitness <br /> Tracker v2
              </h2>
              <p className="text-[#3b5cf6] font-bold text-[10px] sm:text-sm">Save up to <span className="text-sm sm:text-xl">Rs.1200</span></p>
            </div>
            <div className="absolute right-4 bottom-4 w-28 h-28 sm:w-32 sm:h-32 opacity-80 group-hover:scale-110 transition-transform"></div>
          </div>
        </div>
      </div>

      {/* Trust Badges / Features Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 py-8 md:py-10 mt-6 border-t border-gray-100">
        {FEATURES.map((feature, i) => (
          <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50/60 border border-gray-100 hover:border-[#128a88]/30 hover:bg-[#128a88]/5 transition-all duration-300 group cursor-default">
            <div className="w-12 h-12 bg-[#128a88]/10 rounded-xl flex items-center justify-center group-hover:bg-[#128a88] transition-all duration-300 flex-shrink-0">
              <feature.icon className="text-[#128a88] group-hover:text-white w-5 h-5 transition-colors" />
            </div>
            <div>
              <h4 className="font-bold text-[#1a1a1a] text-sm leading-none mb-1.5">{feature.title}</h4>
              <p className="text-xs text-gray-400 font-medium leading-none">{feature.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <style jsx global>{`
        .swiper-pagination-bullet {
          background: rgba(255, 255, 255, 0.2);
          opacity: 1;
          height: 6px;
          width: 24px;
          border-radius: 10px;
          transition: all 0.3s ease;
        }
        .swiper-pagination-bullet-active {
          background: white !important;
          width: 32px !important;
        }
        .swiper-pagination {
          bottom: 24px !important;
        }
        @media (min-width: 640px) {
          .swiper-pagination {
            bottom: 32px !important;
          }
        }
      `}</style>
    </section>
  )
}
