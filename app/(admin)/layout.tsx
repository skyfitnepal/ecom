import React from 'react'
import { Inter, Outfit } from 'next/font/google'
import '../(frontend)/styles.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
})

export const metadata = {
  description: 'SkyFit - Admin Dashboard',
  title: 'SkyFit Admin',
  icons: {
    icon: '/faviconskyfit.png',
  },
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable}`}>
      <body className="bg-gray-50 text-gray-900 min-h-screen font-sans">
        {children}
      </body>
    </html>
  )
}

