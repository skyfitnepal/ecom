"use client"

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Icon } from '@iconify/react'

export default function AdminLogin() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        localStorage.setItem('skyfit_admin_token', data.token)
        router.push('/admin')
      } else {
        setError(data.message || 'Invalid username or password')
      }
    } catch (err) {
      console.error(err)
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12 font-sans">
      <div className="max-w-md w-full space-y-8 bg-white border border-gray-200 p-8 sm:p-10 rounded-2xl shadow-sm text-gray-900">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <img
              src="/logo2.png"
              alt="SkyFit Logo"
              className="h-14 w-auto object-contain"
            />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">
            Admin Control Center
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            Sign in to manage your e-commerce platform
          </p>
        </div>

        <form className="mt-8 space-y-5" onSubmit={handleLogin}>
          {error && (
            <div className="bg-red-55 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
              <Icon icon="lucide:alert-circle" className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-5">
            <div>
              <label htmlFor="username" className="block text-sm font-semibold text-gray-600 mb-1.5">
                Username
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                  <Icon icon="lucide:user" className="w-5 h-5" />
                </span>
                <input
                  id="username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-300 text-gray-950 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all"
                  placeholder="Username"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-600 mb-1.5">
                Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                  <Icon icon="lucide:lock" className="w-5 h-5" />
                </span>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-300 text-gray-950 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all"
                  placeholder="Password"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-3 px-4 text-base font-semibold rounded-xl text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition-all mt-4"
          >
            {loading ? (
              <Icon icon="line-md:loading-twotone-loop" className="w-5 h-5" />
            ) : (
              'Log In'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
