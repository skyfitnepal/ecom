'use client'

import React, { useState } from 'react'
import { Star, MessageSquare, ClipboardList, Info } from 'lucide-react'
import { Product } from '@/lib/products'

interface ProductTabsProps {
  product: Product
}

export const ProductTabs: React.FC<ProductTabsProps> = ({ product }) => {
  const [activeTab, setActiveTab] = useState<'desc' | 'info' | 'reviews'>('desc')

  // Mock specs based on product categories for realistic Additional Information tab
  const getSpecs = () => {
    switch (product.category) {
      case 'Strength':
        return [
          { label: 'Material', value: 'Commercial Grade Cast Iron & Steel' },
          { label: 'Weight Range', value: product.sizes.join(', ') },
          { label: 'Grip Type', value: 'Ergonomic Knurled Chrome' },
          { label: 'Warranty', value: '2 Years Manufacturer Warranty' }
        ]
      case 'Cardio':
        return [
          { label: 'Frame Material', value: 'Reinforced Alloy Steel' },
          { label: 'Power Source', value: 'Electric Corded (220V)' },
          { label: 'Max Weight Capacity', value: '150 kg' },
          { label: 'Console Features', value: 'Speed, Time, Distance, Calories, Heart Rate' },
          { label: 'Warranty', value: '3 Years Frame, 1 Year Motor' }
        ]
      case 'Yoga & Pilates':
        return [
          { label: 'Material', value: 'Eco-Friendly High Density TPE' },
          { label: 'Dimensions', value: '183cm x 61cm' },
          { label: 'Thickness Options', value: product.sizes.join(', ') },
          { label: 'Texture', value: 'Dual-sided Non-slip Grip' }
        ]
      default:
        return [
          { label: 'Category', value: product.category },
          { label: 'Available Sizes', value: product.sizes.join(', ') },
          { label: 'Stock Status', value: product.inStock ? 'Available' : 'Out of Stock' },
          { label: 'Warranty', value: '1 Year Standard Warranty' }
        ]
    }
  }

  // Generate realistic customer reviews
  const getReviews = () => {
    return [
      {
        id: 1,
        author: 'Arjun Adhikari',
        rating: 5,
        date: 'May 10, 2026',
        comment: `Excellent product! The quality absolutely exceeded my expectations. Fast delivery within Kathmandu.`
      },
      {
        id: 2,
        author: 'Pooja Shrestha',
        rating: 4,
        date: 'April 28, 2026',
        comment: `Great value for money. Built very sturdy. Fits perfectly in my home gym setup.`
      }
    ]
  }

  return (
    <section className="bg-white py-12 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 lg:px-6">
        
        {/* Tabs Headers */}
        <div className="mb-10 rounded-2xl bg-[#f8f9fa] border border-gray-100 p-2 flex gap-2 md:gap-4 overflow-x-auto select-none">
          <button
            onClick={() => setActiveTab('desc')}
            className={`flex items-center gap-2 px-6 py-3.5 text-sm font-black rounded-xl transition-all whitespace-nowrap ${
              activeTab === 'desc'
                ? 'bg-white text-[#3b5cf6] shadow-sm'
                : 'text-gray-500 hover:text-[#0c1222]'
            }`}
          >
            <ClipboardList size={16} />
            Description
          </button>
          <button
            onClick={() => setActiveTab('info')}
            className={`flex items-center gap-2 px-6 py-3.5 text-sm font-black rounded-xl transition-all whitespace-nowrap ${
              activeTab === 'info'
                ? 'bg-white text-[#3b5cf6] shadow-sm'
                : 'text-gray-500 hover:text-[#0c1222]'
            }`}
          >
            <Info size={16} />
            Additional Information
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`flex items-center gap-2 px-6 py-3.5 text-sm font-black rounded-xl transition-all whitespace-nowrap ${
              activeTab === 'reviews'
                ? 'bg-white text-[#3b5cf6] shadow-sm'
                : 'text-gray-500 hover:text-[#0c1222]'
            }`}
          >
            <MessageSquare size={16} />
            Reviews ({product.reviewsCount})
          </button>
        </div>

        {/* Tab Content Panel */}
        <div className="bg-white rounded-3xl min-h-[250px] animate-in fade-in duration-300">
          
          {/* Description Tab */}
          {activeTab === 'desc' && (
            <div>
              <h3 className="text-lg font-black text-[#0c1222] mb-6">Specifications:</h3>
              <div className="space-y-6 max-w-4xl text-sm font-semibold text-gray-500 leading-relaxed">
                <p>
                  Various versions have evolved over the years, sometimes by accident, sometimes on purpose (injected humour and the like).
                </p>
                <p>
                  Specifically optimized for durability and heavy usage. Designed with human biomechanics in mind to ensure correct posture and body alignment during training.
                </p>
                <p>
                  Ideal for professional gyms, fitness studios, as well as home workouts. Crafted using premium, highly resilient composite materials that resist wear and tear over long workout sessions.
                </p>
              </div>
            </div>
          )}

          {/* Additional Information Tab */}
          {activeTab === 'info' && (
            <div className="max-w-2xl">
              <h3 className="text-lg font-black text-[#0c1222] mb-6">Product Technical Data:</h3>
              <div className="border border-gray-100 rounded-2xl overflow-hidden divide-y divide-gray-100">
                {getSpecs().map((spec, i) => (
                  <div key={i} className="flex p-4 text-sm font-semibold">
                    <span className="w-1/3 text-gray-400">{spec.label}</span>
                    <span className="w-2/3 text-[#0c1222]">{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reviews Tab */}
          {activeTab === 'reviews' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
              
              {/* Left Column: Review List */}
              <div className="lg:col-span-7">
                <h3 className="text-lg font-black text-[#0c1222] mb-8">
                  Customer Feedback ({product.reviewsCount}):
                </h3>
                
                <div className="space-y-8">
                  {getReviews().map((rev) => (
                    <div key={rev.id} className="border-b border-gray-100 pb-8 last:border-b-0 last:pb-0">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-black text-sm text-[#0c1222]">{rev.author}</h4>
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{rev.date}</span>
                        </div>
                        <div className="flex gap-0.5 text-yellow-400">
                          {[...Array(rev.rating)].map((_, i) => (
                            <Star key={i} size={12} fill="currentColor" />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm font-semibold text-gray-500 leading-relaxed">
                        "{rev.comment}"
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: Sticky Feedback Form */}
              <div className="lg:col-span-5">
                <div className="bg-[#f8f9fa] border border-gray-100 rounded-3xl p-8 sticky top-28">
                  <h4 className="font-black text-lg text-[#0c1222] mb-2">Add Your Review</h4>
                  <p className="text-xs font-semibold text-gray-400 mb-6">
                    Your email address will not be published. Required fields are marked *
                  </p>
                  
                  <div className="space-y-6">
                    {/* Rating Select */}
                    <div className="flex gap-3 items-center text-gray-500">
                      <span className="text-xs font-black uppercase tracking-wider">Your Rating *:</span>
                      <div className="flex gap-1 text-gray-300">
                        {[...Array(5)].map((_, i) => (
                          <button key={i} className="hover:text-yellow-400 transition-colors">
                            <Star size={18} />
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Review text field */}
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-wider text-gray-500">Your Review *</label>
                      <textarea
                        rows={5}
                        placeholder="Write your review here..."
                        className="w-full rounded-2xl border border-gray-200 bg-white p-4 text-sm font-semibold outline-none focus:border-[#3b5cf6] transition-colors resize-none"
                      ></textarea>
                    </div>

                    <button className="w-full py-4 rounded-full bg-[#0c1222] text-white text-xs font-black uppercase tracking-widest hover:bg-black transition-all shadow-lg shadow-black/10">
                      Submit Review
                    </button>
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>

      </div>
    </section>
  )
}
