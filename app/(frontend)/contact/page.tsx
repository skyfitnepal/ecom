'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Footer } from '@/components/Footer'
import { ChevronRight, Phone, Mail, MapPin, Clock, Send, CheckCircle2 } from 'lucide-react'

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' })
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    // Simulate API request
    setTimeout(() => {
      setIsSubmitting(false)
      setIsSubmitted(true)
      setFormData({ name: '', email: '', subject: '', message: '' })
    }, 1200)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  return (
    <div className="bg-white min-h-screen flex flex-col">
      {/* Contact Header Banner */}
      <div className="bg-gray-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-10 sm:py-12">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 mb-4">
            <Link href="/" className="hover:text-[#1a1a1a] transition-colors">Home</Link>
            <ChevronRight size={12} className="text-gray-300" />
            <span className="text-[#128a88] font-bold">Contact Us</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white border border-gray-100 shadow-sm flex items-center justify-center p-2.5 flex-shrink-0">
              <img 
                src="/faviconskyfit.png" 
                alt="SkyFit Logo" 
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0c1222]">
                Get In Touch
              </h1>
              <p className="text-sm text-gray-500 mt-1 max-w-xl">
                Have questions about our fitness equipment? Reach out and our team will get back to you shortly.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="flex-1 bg-white py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 lg:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* Contact Details (Left) */}
            <div className="lg:col-span-5 space-y-8">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Contact Information</h3>
                <p className="text-sm text-gray-500 leading-relaxed mb-6">
                  Feel free to give us a call, drop an email, or visit our local headquarters store. We are here to support your fitness journey.
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-[#128a88] flex-shrink-0">
                    <Phone size={18} />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-gray-400 uppercase block">Phone Support</span>
                    <a href="tel:+977" className="text-sm font-bold text-gray-800 hover:text-[#128a88] transition-colors">+977-980000000</a>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-[#128a88] flex-shrink-0">
                    <Mail size={18} />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-gray-400 uppercase block">Email Address</span>
                    <a href="mailto:support@skyfit.com" className="text-sm font-bold text-gray-800 hover:text-[#128a88] transition-colors">support@skyfit.com</a>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-[#128a88] flex-shrink-0">
                    <MapPin size={18} />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-gray-400 uppercase block">Headquarters Address</span>
                    <span className="text-sm font-bold text-gray-800">Kathmandu, Nepal</span>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-[#128a88] flex-shrink-0">
                    <Clock size={18} />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-gray-400 uppercase block">Business Hours</span>
                    <span className="text-sm font-bold text-gray-800">Sun - Fri: 9:00 AM - 6:00 PM</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Inquiry Form (Right) */}
            <div className="lg:col-span-7 bg-gray-50/50 border border-gray-100 rounded-3xl p-6 sm:p-8">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Send a Message</h3>
              
              {isSubmitted ? (
                <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6 text-center animate-in fade-in duration-300">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-[#22c55e] flex items-center justify-center mx-auto mb-3">
                    <CheckCircle2 size={24} />
                  </div>
                  <h4 className="text-base font-bold text-emerald-800 mb-1">Message Sent Successfully!</h4>
                  <p className="text-xs text-emerald-600/80 max-w-sm mx-auto mb-4">
                    Thank you for contacting SkyFit. One of our fitness product experts will review and reply within 24 business hours.
                  </p>
                  <button 
                    onClick={() => setIsSubmitted(false)}
                    className="h-9 px-4 rounded-full bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label htmlFor="name" className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Your Name</label>
                      <input 
                        type="text" 
                        id="name" 
                        name="name" 
                        required 
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#128a88] transition-colors"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Email Address</label>
                      <input 
                        type="email" 
                        id="email" 
                        name="email" 
                        required 
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#128a88] transition-colors"
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Inquiry Subject</label>
                    <input 
                      type="text" 
                      id="subject" 
                      name="subject" 
                      required 
                      value={formData.subject}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#128a88] transition-colors"
                      placeholder="Product question, wholesale query, etc."
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Message</label>
                    <textarea 
                      id="message" 
                      name="message" 
                      rows={5} 
                      required 
                      value={formData.message}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#128a88] transition-colors resize-none"
                      placeholder="Type your message here..."
                    ></textarea>
                  </div>

                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full h-11 bg-[#1a1a1a] text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-gray-800 disabled:bg-gray-300 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>{isSubmitting ? 'Sending...' : 'Send Inquiry'}</span>
                    {!isSubmitting && <Send size={13} />}
                  </button>
                </form>
              )}
            </div>

          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
