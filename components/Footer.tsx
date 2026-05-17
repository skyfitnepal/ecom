'use client'

import React from 'react'
import Link from 'next/link'
import { MapPin, Phone, Mail, Globe, Share2, Info, Link as LinkIcon, ArrowUp } from 'lucide-react'

export const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer className="bg-white border-t border-gray-100 pt-20 pb-8">
      <div className="max-w-7xl mx-auto px-4 lg:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">

          {/* Help & Support */}
          <div>
            <h3 className="text-xl font-black text-[#1a1a1a] mb-8">Help & Support</h3>
            <ul className="space-y-6">
              <li className="flex gap-4">
                <MapPin className="text-[#3b5cf6] shrink-0" size={20} />
                <span className="text-sm font-medium text-gray-500 leading-relaxed">
                  Kathmandu, Nepal<br />
                </span>
              </li>
              <li className="flex items-center gap-4">
                <Phone className="text-[#3b5cf6] shrink-0" size={20} />
                <span className="text-sm font-medium text-gray-500">(+099) 532-786-9843</span>
              </li>
              <li className="flex items-center gap-4">
                <Mail className="text-[#3b5cf6] shrink-0" size={20} />
                <span className="text-sm font-medium text-gray-500">support@example.com</span>
              </li>
            </ul>
            <div className="flex gap-4 mt-8">
              {[Globe, Share2, Info, LinkIcon].map((Icon, i) => (
                <Link key={i} href="#" className="w-8 h-8 flex items-center justify-center text-[#1a1a1a] hover:text-[#3b5cf6] transition-colors">
                  <Icon size={18} />
                </Link>
              ))}
            </div>
          </div>

          {/* Account */}
          <div>
            <h3 className="text-xl font-black text-[#1a1a1a] mb-8">Account</h3>
            <ul className="space-y-4">
              {['Login / Register', 'Cart', 'Wishlist', 'Shop'].map((item) => (
                <li key={item}>
                  <Link href="#" className="text-sm font-medium text-gray-500 hover:text-[#3b5cf6] transition-colors">{item}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Link */}
          <div>
            <h3 className="text-xl font-black text-[#1a1a1a] mb-8">Quick Link</h3>
            <ul className="space-y-4">
              {['Privacy Policy', 'Refund Policy', 'Terms of Use', "FAQ's", 'Contact'].map((item) => (
                <li key={item}>
                  <Link href="#" className="text-sm font-medium text-gray-500 hover:text-[#3b5cf6] transition-colors">{item}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Download App */}
          <div>
            <h3 className="text-xl font-black text-[#1a1a1a] mb-8">Download App</h3>
            <p className="text-sm font-medium text-gray-500 mb-8">Save Rs.500 With App & New User only</p>
            <div className="flex flex-col gap-4">
              <Link href="#" className="flex items-center gap-3 bg-[#0c1222] text-white p-4 rounded-2xl hover:bg-black transition-all shadow-xl shadow-black/10">
                <div className="w-8 h-8 flex items-center justify-center">
                  <svg viewBox="0 0 384 512" width="24" height="24" fill="currentColor"><path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 21.8-88.5 21.8-11.4 0-51.1-20.8-83.6-20.8-42.3 0-82.7 24.3-104.4 62.1-43.6 75.5-11.4 187.4 31.4 249.5 21 30.5 45.8 64.6 78.8 63.4 31.7-1.2 44.1-20.3 82.5-20.3 38.4 0 50.1 20.3 83.2 19.6 34.2-.7 55.4-30.8 76.2-61.1 24.2-35.4 34.2-69.7 34.6-71.4-.7-.3-66.7-25.7-66.9-102zM265.1 84.4c16.5-20.2 27.6-48.4 24.5-76.4-23.7 1.1-52.1 16-69.1 36.4-15.2 18-28.5 46.2-25.2 73.1 26.4 2 53-12.7 69.8-33.1z" /></svg>
                </div>
                <div>
                  <p className="text-[10px] opacity-60">Download on the</p>
                  <p className="text-sm font-black">App Store</p>
                </div>
              </Link>
              <Link href="#" className="flex items-center gap-3 bg-[#3b5cf6] text-white p-4 rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20">
                <div className="w-8 h-8 flex items-center justify-center">
                  <svg viewBox="0 0 512 512" width="24" height="24" fill="currentColor"><path d="M325.3 234.3L104.6 13l280.8 161.2-60.1 60.1zM47 0C34 6.8 25.3 19.2 25.3 35.3v441.3c0 16.1 8.7 28.5 21.7 35.3l236.6-236.6L47 0zm421.1 216.9l-61.9-35.5-68.5 68.5 68.5 68.5 61.9-35.5c16.3-9.3 27.2-26.6 27.2-46s-10.9-36.7-27.2-46zM104.6 499l280.8-161.2-60.1-60.1L104.6 499z" /></svg>
                </div>
                <div>
                  <p className="text-[10px] opacity-60">Get it On</p>
                  <p className="text-sm font-black">Google Play</p>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-gray-50 gap-6">
          <p className="text-xs font-bold text-gray-400">
            © 2026. All rights reserved by SkyFit.
          </p>

          <div className="flex items-center gap-6">
            <span className="text-xs font-bold text-gray-400">We Accept:</span>
            <div className="flex gap-4 opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all cursor-pointer">
              {/* Payment Method Placeholders */}
              <div className="h-6 w-10 bg-gray-200 rounded"></div>
              <div className="h-6 w-10 bg-gray-200 rounded"></div>
              <div className="h-6 w-10 bg-gray-200 rounded"></div>
              <div className="h-6 w-10 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Scroll to Top */}
      <button
        onClick={scrollToTop}
        className="fixed bottom-24 right-8 w-12 h-12 rounded-full bg-[#3b5cf6] text-white flex items-center justify-center shadow-2xl hover:scale-110 transition-transform z-[100]"
      >
        <ArrowUp size={24} strokeWidth={3} />
      </button>
    </footer>
  )
}
