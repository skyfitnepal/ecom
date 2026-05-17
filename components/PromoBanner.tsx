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
      <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-2">
        <span className="text-2xl font-black text-[#1a1a1a]">
          {value.toString().padStart(2, '0')}
        </span>
      </div>
      <span className="text-[10px] font-bold text-[#0c1222]/60 uppercase tracking-widest">{label}</span>
    </div>
  )

  return (
    <section className="max-w-7xl mx-auto px-4 lg:px-6 py-12">
      <div className="relative w-full rounded-[40px] bg-[#dbeafe] overflow-hidden min-h-[420px] flex items-center p-12 md:p-20">
        
        {/* Decorative Background Element */}
        <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-white/20 to-transparent pointer-events-none"></div>
        <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-white/30 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-xl">
          <span className="text-[#3b5cf6] font-bold tracking-tight text-lg mb-4 block">Don't Miss!!</span>
          
          <h2 className="text-4xl md:text-5xl font-black text-[#0c1222] leading-[1.1] mb-4">
            Enhance Your Fitness <br /> Experience
          </h2>
          
          <p className="text-[#0c1222]/60 font-bold text-sm mb-10 tracking-wide uppercase">
            Exclusive SkyFit Audio Series
          </p>

          {/* Countdown Timer */}
          <div className="flex gap-4 mb-12">
            <TimeBlock value={timeLeft.days} label="Days" />
            <TimeBlock value={timeLeft.hours} label="Hours" />
            <TimeBlock value={timeLeft.minutes} label="Minutes" />
            <TimeBlock value={timeLeft.seconds} label="Seconds" />
          </div>

          <Link 
            href="/shop" 
            className="inline-flex items-center justify-center px-10 py-4 bg-[#3b5cf6] text-white font-bold rounded-full hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/30 group"
          >
            Check it Out!
          </Link>
        </div>

        {/* Product Image Area */}
        <div className="absolute right-0 bottom-0 md:top-1/2 md:-translate-y-1/2 w-full md:w-1/2 h-full flex items-center justify-center p-8 pointer-events-none">
          <div className="relative w-full h-full max-w-md flex items-center justify-center scale-110 md:scale-125">
             {/* Note: Use real product image here */}
             <div className="relative group">
                <div className="absolute inset-0 bg-[#3b5cf6]/20 blur-3xl rounded-full scale-75 group-hover:scale-100 transition-transform duration-700"></div>
                <Headphones size={280} strokeWidth={1} className="text-[#0c1222] relative drop-shadow-2xl" />
             </div>
          </div>
        </div>

      </div>
    </section>
  )
}
