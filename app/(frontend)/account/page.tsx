'use client'

import React, { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Footer } from '@/components/Footer'
import { ChevronRight, User, Mail, Phone, MapPin, Lock, ArrowRight, CheckCircle2, ShieldCheck, ShoppingBag, Eye, EyeOff, Loader, Calendar, CreditCard, Sparkles, Clock, Package, Truck, XCircle } from 'lucide-react'

function AccountContent() {
  const searchParams = useSearchParams()
  const tabParam = searchParams.get('tab')

  const [currentUser, setCurrentUser] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<'profile' | 'orders'>('profile')
  const [isLoadingOrders, setIsLoadingOrders] = useState(false)
  const [orders, setOrders] = useState<any[]>([])
  
  // Profile update form states
  const [profileData, setProfileData] = useState({
    name: '',
    phone: '',
    address: ''
  })
  const [isUpdating, setIsUpdating] = useState(false)

  // Load user details on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('skyfit_user')
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser)
        setCurrentUser(user)
        setProfileData({
          name: user.name || '',
          phone: user.phone || '',
          address: user.address || ''
        })
      } catch (err) {
        console.error("Failed to parse user details:", err)
      }
    }
  }, [])

  // Manage tabs from query parameters
  useEffect(() => {
    if (tabParam === 'orders') {
      setActiveTab('orders')
    } else {
      setActiveTab('profile')
    }
  }, [tabParam])

  // Fetch orders when tab is orders
  useEffect(() => {
    if (activeTab === 'orders' && currentUser?.email) {
      setIsLoadingOrders(true)
      fetch(`/api/orders?email=${encodeURIComponent(currentUser.email)}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setOrders(data.orders || [])
          }
        })
        .catch(err => console.error(err))
        .finally(() => setIsLoadingOrders(false))
    }
  }, [activeTab, currentUser])

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentUser?.email) return
    setIsUpdating(true)

    try {
      const res = await fetch('/api/auth/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: currentUser.email,
          name: profileData.name,
          phone: profileData.phone,
          address: profileData.address
        })
      })

      const data = await res.json()

      if (data.success && data.customer) {
        // Save back to local storage
        localStorage.setItem('skyfit_user', JSON.stringify({
          ...currentUser,
          name: data.customer.name,
          phone: data.customer.phone,
          address: data.customer.address
        }))
        setCurrentUser(data.customer)
        window.dispatchEvent(new Event('sync-cart-wishlist'))
        window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: "Profile updated successfully!" } }))
      } else {
        window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: data.message || "Failed to update profile." } }))
      }
    } catch (err) {
      console.error(err)
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: "Network connection error." } }))
    } finally {
      setIsUpdating(false)
    }
  }

  // Not logged in layout
  if (!currentUser) {
    return (
      <div className="bg-white min-h-screen flex flex-col justify-between">
        <div>
          {/* Account Banner */}
          <div className="bg-gray-50 border-b border-gray-100 py-12">
            <div className="max-w-7xl mx-auto px-4 lg:px-6">
              <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 mb-4">
                <Link href="/" className="hover:text-[#1a1a1a] transition-colors">Home</Link>
                <ChevronRight size={12} className="text-gray-300" />
                <span className="text-[#128a88] font-bold">My Account</span>
              </div>
              <h1 className="text-3xl font-extrabold text-[#0c1222]">Customer Portal</h1>
            </div>
          </div>

          {/* Secure Access Form Prompts */}
          <div className="max-w-md mx-auto px-4 py-20 text-center">
            <div className="w-16 h-16 rounded-3xl bg-[#128a88]/10 text-[#128a88] flex items-center justify-center mx-auto mb-6 border border-[#128a88]/20">
              <Lock size={26} />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Secure Portal Access</h2>
            <p className="text-xs text-gray-500 mb-8 leading-relaxed">
              Please sign in or register an account to view and manage your profile records, fitness orders, and training histories.
            </p>
            <button
              onClick={() => window.dispatchEvent(new Event('open-auth-modal'))}
              className="w-full h-11 bg-[#1a1a1a] hover:bg-[#128a88] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <span>Access Account</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="bg-white min-h-screen flex flex-col justify-between">
      <div>
        {/* Banner */}
        <div className="bg-gray-50 border-b border-gray-100 py-12">
          <div className="max-w-7xl mx-auto px-4 lg:px-6">
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 mb-4">
              <Link href="/" className="hover:text-[#1a1a1a] transition-colors">Home</Link>
              <ChevronRight size={12} className="text-gray-300" />
              <span className="text-[#128a88] font-bold">Account Dashboard</span>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white border border-gray-100 shadow-sm flex items-center justify-center p-2.5 flex-shrink-0">
                <img src="/faviconskyfit.png" alt="SkyFit" className="w-full h-full object-contain" />
              </div>
              <div>
                <h1 className="text-3xl font-black text-[#0c1222]">
                  Welcome, {currentUser.name?.split(' ')[0]}
                </h1>
                <p className="text-sm font-semibold text-gray-500 mt-0.5">{currentUser.email}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Sections */}
        <div className="max-w-5xl mx-auto px-4 lg:px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            
            {/* Tabs sidebar menu */}
            <div className="md:col-span-3 flex flex-row md:flex-col gap-2 border-b md:border-b-0 md:border-r border-gray-150 pb-4 md:pb-0 md:pr-6">
              <button
                onClick={() => setActiveTab('profile')}
                className={`flex-1 md:w-full text-left px-4 py-3.5 rounded-xl text-sm font-bold uppercase tracking-wider flex items-center gap-3 transition-all ${
                  activeTab === 'profile'
                    ? 'bg-[#1a1a1a] text-white shadow-sm'
                    : 'bg-gray-50 text-gray-550 hover:bg-gray-100 hover:text-black'
                }`}
              >
                <User size={16} />
                <span>My Profile</span>
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className={`flex-1 md:w-full text-left px-4 py-3.5 rounded-xl text-sm font-bold uppercase tracking-wider flex items-center gap-3 transition-all ${
                  activeTab === 'orders'
                    ? 'bg-[#1a1a1a] text-white shadow-sm'
                    : 'bg-gray-50 text-gray-550 hover:bg-gray-100 hover:text-black'
                }`}
              >
                <ShoppingBag size={16} />
                <span>My Orders</span>
              </button>
            </div>

            {/* Content Display Window */}
            <div className="md:col-span-9">
              {activeTab === 'profile' ? (
                <form onSubmit={handleProfileUpdate} className="space-y-6 max-w-xl bg-white border border-gray-150 rounded-3xl p-6 sm:p-8 shadow-xs animate-in fade-in duration-200">
                  <h2 className="text-xl font-black text-gray-900 border-b border-gray-100 pb-2 mb-6">Edit Profile Settings</h2>
                  
                  <div>
                    <label className="block text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Name</label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={profileData.name}
                        onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                        placeholder="Full Name"
                        className="w-full h-12 pl-11 pr-4 bg-gray-50/50 border border-gray-205 rounded-xl text-sm font-medium outline-none focus:bg-white focus:border-[#128a88] transition-all"
                      />
                      <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Email Address (Immutable)</label>
                    <div className="relative">
                      <input
                        type="email"
                        disabled
                        value={currentUser.email}
                        className="w-full h-12 pl-11 pr-4 bg-gray-100 border border-gray-205 rounded-xl text-sm font-medium outline-none text-gray-500 cursor-not-allowed"
                      />
                      <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Phone Number</label>
                    <div className="relative">
                      <input
                        type="tel"
                        required
                        value={profileData.phone}
                        onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                        placeholder="Phone Number"
                        className="w-full h-12 pl-11 pr-4 bg-gray-50/50 border border-gray-205 rounded-xl text-sm font-medium outline-none focus:bg-white focus:border-[#128a88] transition-all"
                      />
                      <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Delivery Address</label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={profileData.address}
                        onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                        placeholder="Delivery Address"
                        className="w-full h-12 pl-11 pr-4 bg-gray-50/50 border border-gray-205 rounded-xl text-sm font-medium outline-none focus:bg-white focus:border-[#128a88] transition-all"
                      />
                      <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="w-full h-12 bg-[#1a1a1a] hover:bg-[#128a88] text-white rounded-xl text-sm font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 disabled:bg-gray-300"
                  >
                    {isUpdating ? (
                      <>
                        <Loader size={16} className="animate-spin" />
                        <span>Saving Details...</span>
                      </>
                    ) : (
                      <>
                        <span>Save Changes</span>
                        <ArrowRight size={15} />
                      </>
                    )}
                  </button>
                </form>
              ) : (
                /* Orders tab content */
                <div className="space-y-6 animate-in fade-in duration-200">
                  <h2 className="text-xl font-black text-gray-900 border-b border-gray-100 pb-2 mb-6">My Orders History</h2>
                  
                  {isLoadingOrders ? (
                    <div className="py-20 text-center">
                      <Loader size={32} className="animate-spin text-[#128a88] mx-auto mb-3" />
                      <p className="text-sm font-bold text-gray-500">Querying orders history...</p>
                    </div>
                  ) : orders.length === 0 ? (
                    <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200 p-8">
                      <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center mx-auto mb-4 border border-gray-150 shadow-sm">
                        <ShoppingBag className="text-gray-300 w-7 h-7" />
                      </div>
                      <h3 className="text-sm font-bold text-gray-800">No orders found</h3>
                      <p className="text-xs text-gray-400 mt-1 mb-6">Looks like you haven't placed any gym equipment orders yet.</p>
                      <Link
                        href="/shop"
                        className="inline-flex h-11 px-6 bg-[#1a1a1a] hover:bg-[#128a88] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-colors items-center"
                      >
                        Shop Now
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {orders.map((order) => (
                        <div key={order._id} className="border border-gray-200 rounded-3xl overflow-hidden bg-white shadow-xs">
                          {/* Order Header Summary */}
                          <div className="bg-gray-50/60 p-5 sm:p-6 border-b border-gray-100 flex flex-wrap justify-between items-center gap-4">
                            <div className="space-y-1">
                              <p className="text-xs font-bold text-gray-400 uppercase leading-none">Order Reference</p>
                              <p className="text-sm font-extrabold text-gray-900">{order.orderId}</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-xs font-bold text-gray-400 uppercase leading-none">Order Date</p>
                              <p className="text-sm font-bold text-gray-700 flex items-center gap-1.5">
                                <Calendar size={14} className="text-gray-400" />
                                {new Date(order.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-xs font-bold text-gray-400 uppercase leading-none">Status</p>
                              <span className={`inline-flex items-center gap-1.5 text-xs font-extrabold uppercase px-3 py-1 rounded-full border ${
                                order.status === 'delivered' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                order.status === 'verified' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                order.status === 'shipped' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                order.status === 'cancelled' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                                'bg-amber-50 text-amber-700 border-amber-200'
                              }`}>
                                {order.status === 'delivered' && <Truck size={14} className="text-emerald-500" />}
                                {order.status === 'verified' && <ShieldCheck size={14} className="text-emerald-500" />}
                                {order.status === 'shipped' && <Package size={14} className="text-blue-500" />}
                                {order.status === 'cancelled' && <XCircle size={14} className="text-rose-500" />}
                                {order.status !== 'delivered' && order.status !== 'verified' && order.status !== 'shipped' && order.status !== 'cancelled' && <Clock size={14} className="text-amber-500" />}
                                {order.status}
                              </span>
                            </div>
                            <div className="space-y-1 text-right">
                              <p className="text-xs font-bold text-gray-400 uppercase leading-none">Total Amount</p>
                              <p className="text-base font-black text-[#128a88]">Rs.{order.total.toLocaleString()}</p>
                            </div>
                          </div>

                          {/* Order Items list */}
                          <div className="p-5 sm:p-6 divide-y divide-gray-100">
                            {order.items.map((item: any, idx: number) => (
                              <div key={`${order.orderId}-${item.id}-${idx}`} className="flex justify-between items-center py-4 first:pt-0 last:pb-0 text-sm">
                                <div>
                                  <p className="font-bold text-gray-800">{item.name}</p>
                                  <p className="text-xs font-bold text-gray-400 uppercase mt-1">
                                    Quantity: {item.qty} <span className="text-gray-200 mx-1.5">|</span> {item.category}
                                    {(item.selectedColor || item.selectedSize) && (
                                      <>
                                        <span className="text-gray-250 mx-1.5">|</span>
                                        {item.selectedColor && `Color: ${item.selectedColor}`}
                                        {item.selectedColor && item.selectedSize && ' / '}
                                        {item.selectedSize && `Size: ${item.selectedSize}`}
                                      </>
                                    )}
                                  </p>
                                </div>
                                <span className="font-extrabold text-gray-900">Rs.{(item.price * item.qty).toLocaleString()}</span>
                              </div>
                            ))}

                            {/* Additional metadata info */}
                            <div className="pt-4 mt-4 border-t border-gray-100 flex flex-wrap justify-between items-center gap-4 text-xs text-gray-400 font-bold uppercase tracking-wider">
                              <div className="flex items-center gap-2">
                                <CreditCard size={15} className="text-gray-400" />
                                <span>Mode: {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Bank Transfer'}</span>
                              </div>
                              {order.notes && (
                                <div className="max-w-xs truncate text-gray-505">
                                  Notes: "{order.notes}"
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default function AccountPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader className="w-8 h-8 animate-spin text-[#128a88]" /></div>}>
      <AccountContent />
    </Suspense>
  )
}
