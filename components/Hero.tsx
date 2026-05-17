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
    title: <>Pro Fitness <br /> Power Rack</>,
    desc: "Heavy-duty steel construction for ultimate stability. Elevate your home gym performance.",
    bg: "#111111",
    accent: "#128a88",
    label: "GYM"
  },
  {
    tag: "New Arrival",
    title: <>Elite Cardio <br /> Treadmill X1</>,
    desc: "Advanced shock absorption and 15% incline. Experience the next level of running.",
    bg: "#0c1222",
    accent: "#3b5cf6",
    label: "RUN"
  },
  {
    tag: "Sports Series",
    title: <>Performance <br /> Yoga Mat</>,
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
    <section className="max-w-7xl mx-auto px-4 lg:px-6 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Banner Slider */}
        <div className="lg:col-span-2 relative rounded-3xl overflow-hidden min-h-[460px]">
          <Swiper
            modules={[Pagination, Autoplay, EffectFade]}
            pagination={{ clickable: true, bulletActiveClass: 'swiper-pagination-bullet-active !bg-white !w-8' }}
            autoplay={{ delay: 3000, disableOnInteraction: false }}
            effect="fade"
            loop={true}
            className="h-full w-full"
          >
            {SLIDES.map((slide, index) => (
              <SwiperSlide key={index}>
                <div 
                  className="h-full w-full flex items-center p-8 md:p-16 relative" 
                  style={{ backgroundColor: slide.bg }}
                >
                  <div 
                    className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l -z-0"
                    style={{ backgroundImage: `linear-gradient(to left, ${slide.accent}33, transparent)` }}
                  ></div>
                  
                  <div className="relative z-10 max-w-lg">
                    <span className="text-white/60 font-bold tracking-[0.2em] text-xs uppercase mb-6 block">
                      {slide.tag}
                    </span>
                    <h1 className="text-4xl md:text-6xl font-black text-white leading-tight mb-6">
                      {slide.title}
                    </h1>
                    <p className="text-white/50 text-base md:text-lg mb-10 leading-relaxed font-medium">
                      {slide.desc}
                    </p>
                    <Link 
                      href="/shop" 
                      className="inline-flex items-center justify-center px-10 py-4 text-white font-bold rounded-full transition-all shadow-xl group"
                      style={{ 
                        backgroundColor: slide.accent,
                        boxShadow: `0 10px 30px -10px Rs.{slide.accent}80`
                      }}
                    >
                      Shop Now
                    </Link>
                  </div>

                  <div className="absolute right-0 bottom-0 w-full md:w-2/3 h-full pointer-events-none flex items-center justify-end p-8">
                    <div className="relative w-full h-full opacity-10 flex items-center justify-end">
                       <span className="text-white text-[12rem] font-black select-none uppercase tracking-tighter leading-none">
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
        <div className="flex flex-col gap-6">
          <div className="flex-1 relative rounded-3xl overflow-hidden bg-[#eaf4ed] p-8 flex flex-col justify-between group cursor-pointer hover:shadow-lg transition-shadow">
            <div>
              <h2 className="text-2xl font-black text-[#1a1a1a] leading-tight mb-4">
                Cast Iron <br /> Dumbbell Set
              </h2>
              <p className="text-[#128a88] font-bold text-sm">Start from <span className="text-xl">Rs.899</span></p>
            </div>
            <div className="absolute right-4 bottom-4 w-32 h-32 opacity-80 group-hover:scale-110 transition-transform"></div>
          </div>

          <div className="flex-1 relative rounded-3xl overflow-hidden bg-[#f6f2ff] p-8 flex flex-col justify-between group cursor-pointer hover:shadow-lg transition-shadow">
            <div>
              <h2 className="text-2xl font-black text-[#1a1a1a] leading-tight mb-4">
                Smart Fitness <br /> Tracker v2
              </h2>
              <p className="text-[#3b5cf6] font-bold text-sm">Save up to <span className="text-xl">Rs.1200</span></p>
            </div>
            <div className="absolute right-4 bottom-4 w-32 h-32 opacity-80 group-hover:scale-110 transition-transform"></div>
          </div>
        </div>
      </div>

      {/* Trust Badges / Features Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 py-10 mt-6 border-t border-gray-100">
        {FEATURES.map((feature, i) => (
          <div key={i} className="flex items-center gap-4 group cursor-default">
            <div className="w-14 h-14 bg-[#128a88] rounded-2xl flex items-center justify-center group-hover:bg-[#f3f4f6] transition-all duration-300">
              <feature.icon size={24} className="text-white group-hover:text-gray-700" />
            </div>
            <div>
              <h4 className="font-bold text-[#1a1a1a] text-sm lg:text-base leading-none mb-1">{feature.title}</h4>
              <p className="text-xs text-gray-400 font-medium">{feature.desc}</p>
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
          bottom: 32px !important;
        }
      `}</style>
    </section>
  )
}
