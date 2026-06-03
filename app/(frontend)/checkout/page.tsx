'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { ShoppingBag, ChevronRight, MapPin, Phone, Mail, User, CreditCard, ShieldCheck, ArrowRight, CheckCircle2, Ticket, Percent, Sparkles, Loader } from 'lucide-react'
import { Footer } from '@/components/Footer'

export default function CheckoutPage() {
  const [cartItems, setCartItems] = useState<any[]>([])
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [isSuccess, setIsSuccess] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [promoCode, setPromoCode] = useState('')
  const [promoDiscount, setPromoDiscount] = useState(0)
  const [promoError, setPromoError] = useState('')
  const [promoSuccess, setPromoSuccess] = useState('')
  const [orderId, setOrderId] = useState('')

  // Form Fields
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: 'Kathmandu',
    notes: '',
    paymentMethod: 'cod' // cod or bank
  })

  useEffect(() => {
    // Load User
    const storedUser = localStorage.getItem('skyfit_user')
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser)
        setCurrentUser(user)
        setFormData(prev => ({
          ...prev,
          name: user.name || '',
          email: user.email || '',
          phone: user.phone || '',
          address: user.address || ''
        }))
      } catch (err) {
        console.error(err)
      }
    }

    // Load Cart
    const storedCart = localStorage.getItem('skyfit_cart')
    if (storedCart) {
      try {
        setCartItems(JSON.parse(storedCart))
      } catch (err) {
        console.error(err)
      }
    }
  }, [])

  const cartSubtotal = cartItems.reduce((acc, item) => acc + (item.price * item.qty), 0)
  const shippingFee = cartSubtotal > 5000 || cartSubtotal === 0 ? 0 : 150
  const discountAmount = Math.round(cartSubtotal * promoDiscount)
  const orderTotal = cartSubtotal + shippingFee - discountAmount

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault()
    setPromoError('')
    setPromoSuccess('')
    
    const promo = promoCode.trim().toUpperCase()
    if (!promo) return

    if (promo === 'SKYFIT10') {
      setPromoDiscount(0.10)
      setPromoSuccess('Promo code "SKYFIT10" applied successfully! 10% discount added.')
    } else if (promo === 'FITNEW') {
      setPromoDiscount(0.15)
      setPromoSuccess('Promo code "FITNEW" applied successfully! 15% discount added.')
    } else {
      setPromoError('Invalid promo code. Try "SKYFIT10" or "FITNEW".')
      setPromoDiscount(0)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    if (cartItems.length === 0) return

    setIsProcessing(true)

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            address: formData.address,
            city: formData.city
          },
          items: cartItems,
          paymentMethod: formData.paymentMethod,
          notes: formData.notes,
          subtotal: cartSubtotal,
          discount: discountAmount,
          shippingFee,
          total: orderTotal
        })
      })

      const data = await res.json()

      if (data.success) {
        setOrderId(data.orderId)
        setIsSuccess(true)
        // Clear Cart
        localStorage.removeItem('skyfit_cart')
        setCartItems([])
        window.dispatchEvent(new Event('sync-cart-wishlist'))
        window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: "Order placed successfully!" } }))
      } else {
        window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: data.message || "Failed to place order." } }))
      }
    } catch (err) {
      console.error(err)
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: "A network error occurred." } }))
    } finally {
      setIsProcessing(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="bg-white min-h-screen flex flex-col justify-between">
        <div className="flex-1 max-w-2xl w-full mx-auto px-4 py-16 sm:py-24 text-center">
          <div className="w-20 h-20 rounded-full bg-[#128a88]/10 text-[#128a88] flex items-center justify-center mx-auto mb-6 border border-[#128a88]/20 animate-bounce">
            <CheckCircle2 size={40} />
          </div>
          <h1 className="text-3xl font-black text-gray-900 mb-2">Order Confirmed!</h1>
          <p className="text-gray-500 text-sm mb-8">
            Thank you for shopping with SkyFit. Your order has been placed successfully and is currently being processed.
          </p>

          <div className="bg-gray-50 border border-gray-100 rounded-3xl p-6 sm:p-8 text-left mb-8 space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-gray-200/60">
              <span className="text-xs font-bold text-gray-400 uppercase">Order Reference</span>
              <span className="text-sm font-extrabold text-[#128a88]">{orderId}</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-gray-200/60">
              <span className="text-xs font-bold text-gray-400 uppercase">Estimated Delivery</span>
              <span className="text-sm font-extrabold text-gray-800">2 - 3 Business Days</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-gray-200/60">
              <span className="text-xs font-bold text-gray-400 uppercase">Payment Mode</span>
              <span className="text-sm font-extrabold text-gray-800">
                {formData.paymentMethod === 'cod' ? 'Cash on Delivery (COD)' : 'Direct Bank Transfer'}
              </span>
            </div>
            <div className="flex justify-between items-center pt-1">
              <span className="text-xs font-bold text-gray-400 uppercase">Amount Paid</span>
              <span className="text-base font-black text-gray-900">Rs.{orderTotal.toLocaleString()}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/shop"
              className="h-12 px-8 bg-[#1a1a1a] hover:bg-[#128a88] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <span>Continue Shopping</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="bg-white min-h-screen flex flex-col justify-between">
      <div>
        {/* Checkout Header Banner */}
        <div className="bg-gray-50 border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 lg:px-6 py-10 sm:py-12">
            {/* Breadcrumbs */}
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 mb-4">
              <Link href="/" className="hover:text-[#1a1a1a] transition-colors">Home</Link>
              <ChevronRight size={12} className="text-gray-300" />
              <Link href="/shop" className="hover:text-[#1a1a1a] transition-colors">Shop</Link>
              <ChevronRight size={12} className="text-gray-300" />
              <span className="text-[#128a88] font-bold">Checkout</span>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white border border-gray-100 shadow-sm flex items-center justify-center p-2.5 flex-shrink-0">
                <ShoppingBag className="text-[#128a88] w-7 h-7" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0c1222]">
                  Secure Checkout
                </h1>
                <p className="text-sm text-gray-500 mt-1 max-w-xl">
                  Please review your fitness items and complete your delivery details below.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Checkout Layout */}
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-12 sm:py-16">
          {cartItems.length === 0 ? (
            <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200 max-w-lg mx-auto p-8">
              <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center mx-auto mb-4 border border-gray-100 shadow-sm">
                <ShoppingBag className="text-gray-300 w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold text-gray-800">Your cart is empty</h2>
              <p className="text-xs text-gray-400 mt-1 mb-6">You need fitness equipment in your cart to proceed to checkout.</p>
              <Link
                href="/shop"
                className="inline-flex h-11 px-6 bg-[#1a1a1a] hover:bg-[#128a88] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-colors items-center justify-center"
              >
                Go to Shop
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
              
              {/* Left Column: Delivery & Payment Details */}
              <div className="lg:col-span-7 space-y-8">
                
                {/* User Prompt if Guest */}
                {!currentUser && (
                  <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl flex items-start gap-3.5">
                    <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center flex-shrink-0 font-bold text-xs">🔑</div>
                    <div className="flex-1 text-xs">
                      <p className="font-bold text-amber-800">Have an account?</p>
                      <p className="text-amber-700/90 mt-0.5 mb-2 leading-relaxed">Log in to automatically autofill your billing address details and track your package.</p>
                      <button 
                        type="button"
                        onClick={() => window.dispatchEvent(new Event('open-auth-modal'))}
                        className="text-xs font-bold text-[#128a88] underline hover:text-[#128a88]/80 focus:outline-none"
                      >
                        Log In Now
                      </button>
                    </div>
                  </div>
                )}

                {/* Delivery details section */}
                <div className="space-y-5">
                  <div className="flex items-center gap-2.5 pb-2 border-b border-gray-100">
                    <div className="w-7 h-7 rounded-lg bg-[#128a88]/10 text-[#128a88] flex items-center justify-center text-xs font-bold">1</div>
                    <h2 className="text-base font-extrabold text-gray-900">Delivery Information</h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Full Name</label>
                      <div className="relative">
                        <input
                          type="text"
                          name="name"
                          required
                          value={formData.name}
                          onChange={handleInputChange}
                          placeholder="Your Name"
                          className="w-full h-11 pl-11 pr-4 bg-gray-50/50 border border-gray-200 rounded-xl text-sm outline-none focus:bg-white focus:border-[#128a88] transition-all"
                        />
                        <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Email Address</label>
                      <div className="relative">
                        <input
                          type="email"
                          name="email"
                          required
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="name@domain.com"
                          className="w-full h-11 pl-11 pr-4 bg-gray-50/50 border border-gray-200 rounded-xl text-sm outline-none focus:bg-white focus:border-[#128a88] transition-all"
                        />
                        <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Phone Number</label>
                      <div className="relative">
                        <input
                          type="tel"
                          name="phone"
                          required
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder="Phone number"
                          className="w-full h-11 pl-11 pr-4 bg-gray-50/50 border border-gray-200 rounded-xl text-sm outline-none focus:bg-white focus:border-[#128a88] transition-all"
                        />
                        <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">City</label>
                      <div className="relative">
                        <select
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          className="w-full h-11 pl-4 pr-10 bg-gray-50/50 border border-gray-200 rounded-xl text-sm outline-none focus:bg-white focus:border-[#128a88] transition-all appearance-none cursor-pointer"
                        >
                          <option value="Kathmandu">Kathmandu</option>
                          <option value="Lalitpur">Lalitpur</option>
                          <option value="Bhaktapur">Bhaktapur</option>
                          <option value="Pokhara">Pokhara</option>
                          <option value="Chitwan">Chitwan</option>
                          <option value="Butwal">Butwal</option>
                          <option value="Dharan">Dharan</option>
                        </select>
                        <ChevronRight size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 rotate-90 pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Detailed Address</label>
                    <div className="relative">
                      <input
                        type="text"
                        name="address"
                        required
                        value={formData.address}
                        onChange={handleInputChange}
                        placeholder="Street address, building, floor etc."
                        className="w-full h-11 pl-11 pr-4 bg-gray-50/50 border border-gray-200 rounded-xl text-sm outline-none focus:bg-white focus:border-[#128a88] transition-all"
                      />
                      <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Order Notes (Optional)</label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      placeholder="Special notes for delivery personnel..."
                      rows={3}
                      className="w-full p-4 bg-gray-50/50 border border-gray-200 rounded-2xl text-sm outline-none focus:bg-white focus:border-[#128a88] transition-all resize-none"
                    ></textarea>
                  </div>
                </div>

                {/* Payment details section */}
                <div className="space-y-4 pt-4">
                  <div className="flex items-center gap-2.5 pb-2 border-b border-gray-100">
                    <div className="w-7 h-7 rounded-lg bg-[#128a88]/10 text-[#128a88] flex items-center justify-center text-xs font-bold">2</div>
                    <h2 className="text-base font-extrabold text-gray-900">Payment Option</h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* COD Option */}
                    <label className={`border-2 rounded-2xl p-5 flex items-start gap-4 cursor-pointer transition-all ${
                      formData.paymentMethod === 'cod' 
                        ? 'border-[#128a88] bg-[#128a88]/5' 
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="cod"
                        checked={formData.paymentMethod === 'cod'}
                        onChange={handleInputChange}
                        className="mt-1 h-4 w-4 text-[#128a88] border-gray-300 focus:ring-[#128a88] accent-[#128a88]"
                      />
                      <div>
                        <p className="text-sm font-extrabold text-gray-800 flex items-center gap-2">
                          <ShoppingBag size={15} className="text-[#128a88]" />
                          Cash On Delivery
                        </p>
                        <p className="text-[11px] text-gray-400 mt-1 leading-normal">
                          Pay cash or scan QR when the package is delivered to your doorstep.
                        </p>
                      </div>
                    </label>

                    {/* Bank Transfer Option */}
                    <label className={`border-2 rounded-2xl p-5 flex items-start gap-4 cursor-pointer transition-all ${
                      formData.paymentMethod === 'bank' 
                        ? 'border-[#128a88] bg-[#128a88]/5' 
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="bank"
                        checked={formData.paymentMethod === 'bank'}
                        onChange={handleInputChange}
                        className="mt-1 h-4 w-4 text-[#128a88] border-gray-300 focus:ring-[#128a88] accent-[#128a88]"
                      />
                      <div>
                        <p className="text-sm font-extrabold text-gray-800 flex items-center gap-2">
                          <CreditCard size={15} className="text-[#128a88]" />
                          Direct Bank Transfer
                        </p>
                        <p className="text-[11px] text-gray-400 mt-1 leading-normal">
                          Receive our bank details instantly upon placing your order.
                        </p>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Right Column: Order Summary & Review */}
              <div className="lg:col-span-5 space-y-6">
                
                {/* Summary Card */}
                <div className="border border-gray-150 rounded-3xl p-6 sm:p-8 bg-gray-50/50 sticky top-24">
                  <h3 className="font-extrabold text-gray-900 text-base mb-6 pb-2 border-b border-gray-200/60 flex items-center justify-between">
                    <span>Order Summary</span>
                    <span className="text-xs bg-white text-gray-500 font-bold px-2.5 py-0.5 rounded-full border border-gray-200">
                      {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}
                    </span>
                  </h3>

                  {/* Scrollable Items list */}
                  <div className="max-h-[260px] overflow-y-auto pr-2 divide-y divide-gray-100 mb-6 space-y-4">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex gap-4 pt-4 first:pt-0 pb-4 last:pb-0">
                        <div className="w-14 h-14 bg-white rounded-xl overflow-hidden border border-gray-150 flex items-center justify-center p-1.5 flex-shrink-0">
                          {item.images?.[0] && item.images[0].startsWith('http') ? (
                            <img src={item.images[0]} alt="" className="w-full h-full object-contain rounded-lg" />
                          ) : (
                            <span className="text-xs">💪</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-gray-900 truncate">{item.name}</p>
                          <p className="text-xs font-semibold text-gray-500 mt-1">
                            Quantity: {item.qty} <span className="text-gray-300 mx-1.5">|</span> {item.category}
                          </p>
                          {(item.selectedColor || item.selectedSize) && (
                            <p className="text-[10px] font-bold uppercase tracking-wider text-[#128a88] bg-[#128a88]/5 px-1.5 py-0.5 rounded inline-block mt-1">
                              {item.selectedColor && `Color: ${item.selectedColor}`}
                              {item.selectedColor && item.selectedSize && ' / '}
                              {item.selectedSize && `Size: ${item.selectedSize}`}
                            </p>
                          )}
                        </div>
                        <span className="text-sm font-black text-gray-900 self-center">
                          Rs.{(item.price * item.qty).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Promo Code Input */}
                  <div className="border-t border-b border-gray-200/60 py-5 mb-6">
                    <div className="flex gap-2.5">
                      <div className="relative flex-1">
                        <input
                          type="text"
                          value={promoCode}
                          onChange={(e) => setPromoCode(e.target.value)}
                          placeholder="Promo Code"
                          className="w-full h-11 pl-10 pr-3 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-[#128a88] transition-colors uppercase font-medium"
                        />
                        <Ticket size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      </div>
                      <button
                        type="button"
                        onClick={handleApplyPromo}
                        className="h-11 px-5 bg-white border border-gray-250 hover:border-gray-900 rounded-xl text-sm font-bold uppercase transition-colors"
                      >
                        Apply
                      </button>
                    </div>

                    {promoError && (
                      <p className="text-xs text-rose-600 font-bold mt-2 flex items-center gap-1">
                        <span>⚠️</span> {promoError}
                      </p>
                    )}
                    {promoSuccess && (
                      <p className="text-xs text-emerald-600 font-bold mt-2 flex items-center gap-1">
                        <Percent size={12} className="text-emerald-500" /> {promoSuccess}
                      </p>
                    )}
                  </div>

                  {/* Details Subtotal, Shipping, Tax, Total */}
                  <div className="space-y-3.5 text-sm mb-8">
                    <div className="flex justify-between items-center text-gray-600">
                      <span>Subtotal</span>
                      <span className="font-bold text-gray-900">Rs.{cartSubtotal.toLocaleString()}</span>
                    </div>

                    {promoDiscount > 0 && (
                      <div className="flex justify-between items-center text-emerald-600 font-bold">
                        <span>Discount ({promoDiscount * 100}%)</span>
                        <span>- Rs.{discountAmount.toLocaleString()}</span>
                      </div>
                    )}

                    <div className="flex justify-between items-center text-gray-600">
                      <span>Shipping Fee</span>
                      <span className="font-bold text-gray-900">
                        {shippingFee === 0 ? 'FREE' : `Rs.${shippingFee.toLocaleString()}`}
                      </span>
                    </div>

                    <div className="h-[1px] bg-gray-200/80 my-3"></div>

                    <div className="flex justify-between items-baseline pt-1">
                      <span className="text-base font-black text-gray-950">Order Total</span>
                      <span className="text-2xl font-black text-[#128a88]">Rs.{orderTotal.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Place Order CTA */}
                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="w-full h-12 bg-[#1a1a1a] hover:bg-[#128a88] text-white rounded-xl text-sm font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 shadow-lg shadow-black/5 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    {isProcessing ? (
                      <>
                        <Loader size={16} className="animate-spin" />
                        <span>Processing Order...</span>
                      </>
                    ) : (
                      <>
                        <span>Place Order</span>
                        <ArrowRight size={15} />
                      </>
                    )}
                  </button>

                  <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-400 font-bold uppercase tracking-wider">
                    <ShieldCheck size={16} className="text-[#128a88]" />
                    <span>Secure SSL Encrypted Checkout</span>
                  </div>
                </div>

              </div>
            </form>
          )}
        </div>
      </div>

      <Footer />
    </div>
  )
}
