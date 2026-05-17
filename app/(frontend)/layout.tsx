import React from 'react'
import { Header } from '@/components/Header'
import './styles.css'

export const metadata = {
  description: 'SkyFit - Premium Fitness Store',
  title: 'SkyFit',
  icons: {
    icon: '/faviconskyfit.png',
  },
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props

  return (
    <html lang="en">
      <body className="bg-white">
        <Header />
        <main>{children}</main>
      </body>
    </html>
  )
}
