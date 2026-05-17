'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Headphones } from 'lucide-react'

export const PromoBanner = () => {
  const [timeLeft, setTimeLeft] = useState({
    days: 6,
    hours: 7,
    minutes: 12,
    seconds: 0
  })

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 }
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 }
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 }
        if (prev.days > 0) return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 }
        return prev
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const TimeBlock = ({ value, label }: { value: number, label: string }) => (
    <div className="flex flex-col items-center">
      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white rounded-xl sm:rounded-2xl flex items-center justify-center shadow-sm mb-1.5 sm:mb-2">
        <span className="text-lg sm:text-2xl font-black text-[#1a1a1a]">
          {value.toString().padStart(2, '0')}
        </span>
      </div>
      <span className="text-[9px] sm:text-[10px] font-bold text-[#0c1222]/60 uppercase tracking-widest">{label}</span>
    </div>
  )

  return (
    <section className="max-w-7xl mx-auto px-4 lg:px-6 py-8 sm:py-12">
      <div className="relative w-full rounded-[32px] sm:rounded-[40px] bg-[#dbeafe] overflow-hidden flex flex-col md:flex-row items-center p-8 sm:p-12 md:p-20 min-h-auto md:min-h-[420px] gap-8 md:gap-0">
        
        {/* Decorative Background Element */}
        <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-white/20 to-transparent pointer-events-none"></div>
        <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-white/30 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 w-full md:w-1/2 max-w-xl flex flex-col items-center md:items-start text-center md:text-left">
          <span className="text-[#3b5cf6] font-black tracking-wider text-sm sm:text-base mb-3 sm:mb-4 uppercase block">Don't Miss!!</span>
          
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-[#0c1222] leading-[1.1] mb-3 sm:mb-4">
            Enhance Your Fitness <br className="hidden sm:inline" /> Experience
          </h2>
          
          <p className="text-[#0c1222]/60 font-bold text-xs sm:text-sm mb-6 sm:mb-8 tracking-wide uppercase">
            Exclusive SkyFit Audio Series
          </p>

          {/* Countdown Timer */}
          <div className="flex gap-2.5 sm:gap-4 mb-8 sm:mb-10 justify-center md:justify-start">
            <TimeBlock value={timeLeft.days} label="Days" />
            <TimeBlock value={timeLeft.hours} label="Hours" />
            <TimeBlock value={timeLeft.minutes} label="Minutes" />
            <TimeBlock value={timeLeft.seconds} label="Seconds" />
          </div>

          <Link 
            href="/shop" 
            className="inline-flex items-center justify-center px-8 py-3.5 sm:px-10 sm:py-4 bg-[#3b5cf6] text-white font-bold rounded-full hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/30 group text-sm sm:text-base"
          >
            Check it Out!
          </Link>
        </div>

        {/* Product Image Area */}
        <div className="w-full md:w-1/2 flex items-center justify-center p-4 md:p-8 pointer-events-none md:absolute md:right-0 md:bottom-0 md:top-1/2 md:-translate-y-1/2 md:h-full">
          <div className="relative w-full max-w-xs md:max-w-md flex items-center justify-center scale-90 sm:scale-100 md:scale-110 lg:scale-125">
             <div className="relative group">
                <div className="absolute inset-0 bg-[#3b5cf6]/20 blur-3xl rounded-full scale-75 group-hover:scale-100 transition-transform duration-700"></div>
                <Headphones className="text-[#0c1222] relative drop-shadow-2xl w-48 h-48 sm:w-64 sm:h-64 md:w-[280px] md:h-[280px]" strokeWidth={1} />
             </div>
          </div>
        </div>

      </div>
    </section>
  )
}
