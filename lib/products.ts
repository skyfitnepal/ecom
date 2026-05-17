export interface Product {
  id: number
  name: string
  price: number
  oldPrice: number
  desc: string
  rating: number
  reviewsCount: number
  inStock: boolean
  colors: string[]
  sizes: string[]
  images: string[] // SVG placeholders or placeholder icon representation
  category: string
}

export const PRODUCTS: Product[] = [
  {
    id: 1,
    name: 'Cast Iron Dumbbell Set (20kg)',
    price: 899,
    oldPrice: 1200,
    desc: 'Premium cast iron dumbbells with ergonomic grip. Perfect for home strength training and muscle building.',
    rating: 5,
    reviewsCount: 12,
    inStock: true,
    colors: ['#1a1a1a', '#e5e7eb', '#ef4444'],
    sizes: ['10kg', '20kg', '30kg'],
    images: ['🏋️‍♂️', '💪'],
    category: 'Strength'
  },
  {
    id: 2,
    name: 'Indoor Steel Adjustable Silent Treadmill',
    price: 45000,
    oldPrice: 52000,
    desc: 'Foldable treadmill with silent motor technology and 12 pre-set workout programs for all fitness levels.',
    rating: 4,
    reviewsCount: 8,
    inStock: true,
    colors: ['#1a1a1a', '#3b82f6'],
    sizes: ['Compact', 'Standard', 'Pro'],
    images: ['🏃‍♂️', '👟'],
    category: 'Cardio'
  },
  {
    id: 3,
    name: 'Premium Non-Slip Yoga Mat',
    price: 1500,
    oldPrice: 2200,
    desc: 'Extra thick eco-friendly yoga mat with alignment lines and superior non-slip surface for perfect balance.',
    rating: 5,
    reviewsCount: 24,
    inStock: true,
    colors: ['#128a88', '#ec4899', '#8b5cf6'],
    sizes: ['6mm', '8mm', '10mm'],
    images: ['🧘‍♀️', '🌸'],
    category: 'Yoga & Pilates'
  },
  {
    id: 4,
    name: 'Adjustable Power Weight Bench',
    price: 8500,
    oldPrice: 11000,
    desc: 'Heavy-duty steel construction with 6 adjustable positions for a full range of strength exercises.',
    rating: 5,
    reviewsCount: 5,
    inStock: true,
    colors: ['#1a1a1a', '#ef4444'],
    sizes: ['Standard', 'Heavy Duty'],
    images: ['🏋️‍♀️', '🛠️'],
    category: 'Strength'
  },
  {
    id: 5,
    name: 'Resistance Band Pro Set',
    price: 1200,
    oldPrice: 1800,
    desc: 'Complete set of 5 resistance bands with different tension levels, handles, and door anchor.',
    rating: 4,
    reviewsCount: 19,
    inStock: true,
    colors: ['#eab308', '#22c55e', '#ef4444', '#3b82f6', '#1a1a1a'],
    sizes: ['Standard', 'Heavy (5-Band)', 'Extreme (7-Band)'],
    images: ['🎗️', '💪'],
    category: 'Accessories'
  },
  {
    id: 6,
    name: 'Elite Cardio Spin Bike',
    price: 32000,
    oldPrice: 38000,
    desc: 'Professional indoor cycling bike with adjustable resistance and heavy flywheel for a smooth ride.',
    rating: 5,
    reviewsCount: 7,
    inStock: true,
    colors: ['#1a1a1a', '#ef4444', '#e5e7eb'],
    sizes: ['Standard', 'Pro Flywheel'],
    images: ['🚴‍♂️', '🔥'],
    category: 'Cardio'
  },
  {
    id: 7,
    name: 'Professional Boxing Gloves',
    price: 2800,
    oldPrice: 3500,
    desc: 'High-grade synthetic leather gloves with triple-layer foam padding for maximum hand protection.',
    rating: 5,
    reviewsCount: 15,
    inStock: true,
    colors: ['#ef4444', '#1a1a1a', '#3b82f6'],
    sizes: ['10 oz', '12 oz', '14 oz', '16 oz'],
    images: ['🥊', '👊'],
    category: 'Combat'
  },
  {
    id: 8,
    name: 'Olympic Barbell Rack',
    price: 12500,
    oldPrice: 15000,
    desc: 'Multi-functional power rack with adjustable height and safety bars for safe solo lifting.',
    rating: 4,
    reviewsCount: 3,
    inStock: false,
    colors: ['#1a1a1a', '#e5e7eb'],
    sizes: ['Standard', 'Commercial Grade'],
    images: ['🏋️‍♂️', '🔒'],
    category: 'Strength'
  }
]
