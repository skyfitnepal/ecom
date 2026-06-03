"use client"

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Icon } from '@iconify/react'

interface Product {
  _id: string
  id: string
  name: string
  price: number
  sale_price: number | null
  description: string
  stock: number
  category_name: string
  images: string[]
  sku?: string
  has_variants?: boolean
  variant_options?: string[]
  variants?: any[]
  colors?: string[]
}

interface Category {
  _id: string
  name: string
  slug: string
  image?: {
    src: string
  }
  parent_id?: string | null
  level?: number
}

interface Order {
  _id: string
  orderId: string
  userId: string
  userEmail: string
  userName?: string
  shippingAddress?: {
    address: string
    city: string
    phone: string
    fullName: string
  }
  items: Array<{
    productId: string
    name: string
    price: number
    quantity: number
    image?: string
    selectedColor?: string
    selectedSize?: string
  }>
  totalAmount?: number
  total?: number
  customer?: {
    name: string
    email: string
    address: string
    city: string
    phone: string
  }
  status: string
  createdAt: string
}

interface User {
  _id: string
  email: string
  name?: string
  phone?: string
  address?: string
  createdAt?: string
}

export default function AdminDashboard() {
  const router = useRouter()
  const [authorized, setAuthorized] = useState(false)
  const [token, setToken] = useState<string | null>(null)

  // Navigation
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'categories' | 'orders' | 'users'>('overview')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [userDropdownOpen, setUserDropdownOpen] = useState(false)

  // Data States
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  // Products Search & Pagination States
  const [prodSearchQuery, setProdSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 8

  // Categories Pagination & Accordion States
  const [currentCatPage, setCurrentCatPage] = useState(1)
  const catsPerPage = 5
  const [expandedCategories, setExpandedCategories] = useState<string[]>([])

  // Product Modals / Forms state
  const [isProductModalOpen, setIsProductModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)

  // Product Form fields
  const [prodName, setProdName] = useState('')
  const [prodSku, setProdSku] = useState('')
  const [prodPrice, setProdPrice] = useState('')
  const [prodSalePrice, setProdSalePrice] = useState('')
  const [prodStock, setProdStock] = useState('')
  const [prodCategory, setProdCategory] = useState('Fitness')
  const [prodDescription, setProdDescription] = useState('')
  const [prodImages, setProdImages] = useState('')
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [prodCategorySearch, setProdCategorySearch] = useState('')
  const [prodCategoryDropdownOpen, setProdCategoryDropdownOpen] = useState(false)
  const [hasVariants, setHasVariants] = useState(false)
  const [variantOptionsText, setVariantOptionsText] = useState('')
  const [variantsList, setVariantsList] = useState<any[]>([])
  const [hasColors, setHasColors] = useState(false)
  const [selectedColors, setSelectedColors] = useState<string[]>([])
  const [orderTimeFilter, setOrderTimeFilter] = useState<'today' | 'yesterday' | 'week' | 'all'>('all')
  const [orderSearchQuery, setOrderSearchQuery] = useState('')

  // Bulk Import States
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false)
  const [bulkImportFile, setBulkImportFile] = useState<File | null>(null)
  const [bulkParsedProducts, setBulkParsedProducts] = useState<any[]>([])
  const [bulkImportLoading, setBulkImportLoading] = useState(false)

  // Dark Mode States
  const [darkMode, setDarkMode] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('skyfit_admin_dark_mode')
    if (stored === 'true') {
      setDarkMode(true)
    }
  }, [])

  const toggleDarkMode = () => {
    const nextVal = !darkMode
    setDarkMode(nextVal)
    localStorage.setItem('skyfit_admin_dark_mode', String(nextVal))
  }

  // Category Modals / Forms state
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)

  // Category Form fields
  const [catName, setCatName] = useState('')
  const [catSlug, setCatSlug] = useState('')
  const [catImageUrl, setCatImageUrl] = useState('')
  const [catParentId, setCatParentId] = useState<string>('')

  // Feedback States
  const [actionLoading, setActionLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  // Auth check & load initial data
  useEffect(() => {
    const adminToken = localStorage.getItem('skyfit_admin_token')
    if (!adminToken) {
      router.push('/admin-panel-login')
      return
    }
    setToken(adminToken)
    setAuthorized(true)
  }, [router])

  useEffect(() => {
    if (authorized && token) {
      fetchDashboardData()
    }
  }, [authorized, token])

  // Reset pagination to first page upon search changes
  useEffect(() => {
    setCurrentPage(1)
  }, [prodSearchQuery])

  const getStatusBadgeConfig = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'verified':
        return {
          classes: 'bg-emerald-50 text-emerald-700 border-emerald-100',
          icon: 'fluent:shield-checkmark-20-regular',
          iconColor: 'text-emerald-500',
          dotBg: 'bg-emerald-500',
          selectClasses: 'text-emerald-600 border-emerald-200'
        }
      case 'delivered':
        return {
          classes: 'bg-emerald-50 text-emerald-700 border-emerald-100',
          icon: 'fluent:vehicle-truck-profile-20-regular',
          iconColor: 'text-emerald-500',
          dotBg: 'bg-emerald-500',
          selectClasses: 'text-emerald-600 border-emerald-200'
        }
      case 'shipped':
        return {
          classes: 'bg-blue-50 text-blue-700 border-blue-100',
          icon: 'fluent:box-20-regular',
          iconColor: 'text-blue-500',
          dotBg: 'bg-blue-500',
          selectClasses: 'text-blue-600 border-blue-200'
        }
      case 'cancelled':
        return {
          classes: 'bg-rose-50 text-rose-700 border-rose-100',
          icon: 'fluent:dismiss-circle-20-regular',
          iconColor: 'text-rose-500',
          dotBg: 'bg-rose-500',
          selectClasses: 'text-rose-600 border-rose-200'
        }
      default: // pending
        return {
          classes: 'bg-amber-50 text-amber-700 border-amber-100',
          icon: 'fluent:clock-20-regular',
          iconColor: 'text-amber-500',
          dotBg: 'bg-amber-500',
          selectClasses: 'text-amber-600 border-amber-200'
        }
    }
  }

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      const headers = { 'Authorization': `Bearer ${token}` }

      const [prodRes, catRes, ordRes, usrRes] = await Promise.all([
        fetch('/api/admin/products', { headers }),
        fetch('/api/admin/categories', { headers }),
        fetch('/api/admin/orders', { headers }),
        fetch('/api/admin/users', { headers })
      ])

      const prodData = await prodRes.json()
      const catData = await catRes.json()
      const ordData = await ordRes.json()
      const usrData = await usrRes.json()

      if (prodData.success) setProducts(prodData.products)
      if (catData.success) setCategories(catData.categories)
      if (ordData.success) setOrders(ordData.orders)
      if (usrData.success) setUsers(usrData.users)
    } catch (error) {
      console.error("Failed to load dashboard data:", error)
      showToast('error', 'Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const showToast = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 4000)
  }

  // Dynamic XLSX script loader
  const loadXLSX = () => {
    return new Promise<any>((resolve, reject) => {
      if ((window as any).XLSX) {
        resolve((window as any).XLSX)
        return
      }
      const script = document.createElement('script')
      script.src = 'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js'
      script.onload = () => resolve((window as any).XLSX)
      script.onerror = reject
      document.head.appendChild(script)
    })
  }

  // Generate and download Excel template
  const downloadSampleExcel = async () => {
    try {
      const XLSX = await loadXLSX()
      const sampleData = [
        {
          "SKU": "FIT-DB-20",
          "Product Name": "Cast Iron Dumbbell Set (20kg)",
          "Price": 1500,
          "Sale Price": 1200,
          "Stock": 50,
          "Category Name": "Fitness",
          "Description": "Premium cast iron dumbbells with ergonomic grip. Perfect for home strength training and muscle building.",
          "Colors (comma separated)": "Black, Silver",
          "Sizes (comma separated)": "One Size",
          "Images (comma separated URLs)": "https://images.unsplash.com/photo-1638536532686-d610adfc8e5c",
          "SEO Title": "Buy Premium 20kg Cast Iron Dumbbell Set | SkyFit",
          "SEO Description": "Get the best 20kg cast iron dumbbell set for your home workouts. Free shipping across Nepal.",
          "SEO Keywords": "dumbbells, cast iron dumbbells, home weights, 20kg weights"
        },
        {
          "SKU": "FIT-MAT-05",
          "Product Name": "Non-Slip Yoga Mat (6mm)",
          "Price": 800,
          "Sale Price": "",
          "Stock": 100,
          "Category Name": "Yoga",
          "Description": "High density eco-friendly TPE yoga mat with alignment lines. 6mm thick for optimal cushioning.",
          "Colors (comma separated)": "Purple, Blue, Pink",
          "Sizes (comma separated)": "6mm",
          "Images (comma separated URLs)": "https://images.unsplash.com/photo-1592432678016-e910b452f9a2",
          "SEO Title": "Eco-Friendly Non-Slip Yoga Mat 6mm | SkyFit",
          "SEO Description": "Shop 6mm non-slip eco-friendly yoga mats with alignment lines. Perfect cushioning for yoga and stretching.",
          "SEO Keywords": "yoga mat, non slip yoga mat, eco friendly mat, yoga fitness"
        }
      ]

      const ws = XLSX.utils.json_to_sheet(sampleData)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, "Products Template")

      // Auto-fit column widths
      const maxLens = sampleData.reduce((acc, row) => {
        Object.keys(row).forEach(key => {
          const val = String((row as any)[key] || '')
          acc[key] = Math.max(acc[key] || 10, key.length, val.length)
        })
        return acc
      }, {} as any)
      ws['!cols'] = Object.keys(maxLens).map(key => ({ wch: maxLens[key] + 3 }))

      XLSX.writeFile(wb, "SkyFit_Bulk_Import_Template.xlsx")
      showToast('success', 'Excel template downloaded successfully!')
    } catch (err) {
      console.error(err)
      showToast('error', 'Failed to generate Excel template. Please try again.')
    }
  }

  // Parse Excel file upload
  const handleExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setBulkImportFile(file)
    setBulkParsedProducts([])
    setBulkImportLoading(true)

    try {
      const XLSX = await loadXLSX()
      const reader = new FileReader()
      reader.onload = (evt) => {
        try {
          const bstr = evt.target?.result
          const wb = XLSX.read(bstr, { type: 'binary' })
          const wsname = wb.SheetNames[0]
          const ws = wb.Sheets[wsname]
          const data = XLSX.read(bstr, { type: 'binary' }) // Read raw
          const rawRows = XLSX.utils.sheet_to_json(ws)

          if (!rawRows || rawRows.length === 0) {
            showToast('error', 'The uploaded file appears to be empty.')
            setBulkImportLoading(false)
            return
          }

          // Map Excel columns to standard internal product fields
          const mapped = rawRows.map((row: any) => {
            const rawSku = row['SKU'] || row['sku'] || '';
            const rawName = row['Product Name'] || row['product name'] || row['Name'] || row['name'] || '';
            const rawPrice = row['Price'] || row['price'] || '';
            const rawStock = row['Stock'] || row['stock'] || '';
            const rawCategory = row['Category Name'] || row['category name'] || row['Category'] || row['category'] || '';

            // Simple validation flag
            const isValid = !!rawName && !isNaN(Number(rawPrice)) && !isNaN(Number(rawStock)) && !!rawCategory;

            return {
              sku: rawSku,
              name: rawName,
              price: Number(rawPrice),
              sale_price: row['Sale Price'] || row['sale price'] || row['SalePrice'] || null,
              stock: Number(rawStock),
              category_name: rawCategory,
              description: row['Description'] || row['description'] || '',
              colors: row['Colors (comma separated)'] || row['colors'] || '',
              sizes: row['Sizes (comma separated)'] || row['sizes'] || '',
              images: row['Images (comma separated URLs)'] || row['images'] || '',
              seo_title: row['SEO Title'] || row['seo_title'] || '',
              seo_description: row['SEO Description'] || row['seo_description'] || '',
              seo_keywords: row['SEO Keywords'] || row['seo_keywords'] || '',
              isValid
            }
          })

          setBulkParsedProducts(mapped)
        } catch (err) {
          console.error(err)
          showToast('error', 'Error reading sheets. Please check the Excel format.')
        } finally {
          setBulkImportLoading(false)
        }
      }
      reader.readAsBinaryString(file)
    } catch (err) {
      console.error(err)
      showToast('error', 'Failed to initialize sheet parser.')
      setBulkImportLoading(false)
    }
  }

  // Submit bulk imports to backend bulk api
  const submitBulkImport = async () => {
    const validProducts = bulkParsedProducts.filter(p => p.isValid)
    if (validProducts.length === 0) {
      showToast('error', 'No valid products to import. Please check your uploaded file.')
      return
    }

    setBulkImportLoading(true)
    try {
      const res = await fetch('/api/admin/products/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ products: validProducts })
      })

      const data = await res.json()
      if (data.success) {
        showToast('success', data.message || 'Import successful!')
        setIsBulkImportOpen(false)
        setBulkImportFile(null)
        setBulkParsedProducts([])
        fetchDashboardData() // Refresh admin data
      } else {
        showToast('error', data.message || 'Failed to import products.')
      }
    } catch (err) {
      console.error(err)
      showToast('error', 'Network error during bulk import.')
    } finally {
      setBulkImportLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('skyfit_admin_token')
    router.push('/admin-panel-login')
  }

  // CRUD Product Actions
  const openAddProductModal = () => {
    setEditingProduct(null)
    setProdName('')
    setProdSku('')
    setProdPrice('')
    setProdSalePrice('')
    setProdStock('')
    setProdCategory('Fitness')
    setProdDescription('')
    setProdImages('')
    setImageUrls([])
    setProdCategorySearch('')
    setProdCategoryDropdownOpen(false)
    setHasVariants(false)
    setVariantOptionsText('')
    setVariantsList([])
    setHasColors(false)
    setSelectedColors([])
    setIsProductModalOpen(true)
  }

  const openEditProductModal = (product: Product) => {
    setEditingProduct(product)
    setProdName(product.name)
    setProdSku(product.sku || product.id || '')
    setProdPrice(product.price.toString())
    setProdSalePrice(product.sale_price ? product.sale_price.toString() : '')
    setProdStock(product.stock ? product.stock.toString() : '0')
    setProdCategory(product.category_name || 'Fitness')
    setProdDescription(product.description || '')
    setProdImages(product.images ? product.images.join(', ') : '')
    setImageUrls(product.images || [])
    setProdCategorySearch('')
    setProdCategoryDropdownOpen(false)
    setHasVariants(!!product.has_variants)
    setVariantOptionsText(product.variant_options ? product.variant_options.join(', ') : '')
    setVariantsList(product.variants || [])
    setHasColors(product.colors && product.colors.length > 0 ? true : false)
    setSelectedColors(product.colors || [])
    setIsProductModalOpen(true)
  }

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    setActionLoading(true)

    const variantOptionsArray = variantOptionsText
      .split(',')
      .map(opt => opt.trim())
      .filter(Boolean)

    let computedPrice = Number(prodPrice)
    let computedStock = Number(prodStock)

    if (hasVariants && variantsList.length > 0) {
      computedStock = variantsList.reduce((sum, v) => sum + (Number(v.stock) || 0), 0)
      const validPrices = variantsList.map(v => Number(v.price)).filter(p => !isNaN(p) && p > 0)
      if (validPrices.length > 0) {
        computedPrice = Math.min(...validPrices)
      }
    }

    const productPayload = {
      sku: prodSku,
      name: prodName,
      price: computedPrice,
      sale_price: prodSalePrice ? Number(prodSalePrice) : null,
      description: prodDescription,
      stock: computedStock,
      images: imageUrls.filter(Boolean),
      category_name: prodCategory,
      colors: hasColors ? selectedColors : [],
      has_variants: hasVariants,
      variant_options: variantOptionsArray,
      variants: variantsList
    }

    try {
      const url = editingProduct
        ? `/api/admin/products?id=${editingProduct.sku || editingProduct._id}`
        : '/api/admin/products'

      const method = editingProduct ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(productPayload)
      })

      const data = await response.json()
      if (response.ok && data.success) {
        showToast('success', editingProduct ? 'Product updated successfully!' : 'Product created successfully!')
        setIsProductModalOpen(false)
        fetchDashboardData()
      } else {
        showToast('error', data.message || 'Action failed')
      }
    } catch (error) {
      console.error(error)
      showToast('error', 'An error occurred during save')
    } finally {
      setActionLoading(false)
    }
  }

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return
    setActionLoading(true)

    try {
      const response = await fetch(`/api/admin/products?id=${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()
      if (response.ok && data.success) {
        showToast('success', 'Product deleted successfully!')
        fetchDashboardData()
      } else {
        showToast('error', data.message || 'Failed to delete product')
      }
    } catch (error) {
      console.error(error)
      showToast('error', 'An error occurred during delete')
    } finally {
      setActionLoading(false)
    }
  }

  // CRUD Category Actions
  const openAddCategoryModal = (prefilledParentId?: string) => {
    setEditingCategory(null)
    setCatName('')
    setCatSlug('')
    setCatImageUrl('')
    setCatParentId(prefilledParentId || '')
    setIsCategoryModalOpen(true)
  }

  const openEditCategoryModal = (category: Category) => {
    setEditingCategory(category)
    setCatName(category.name)
    setCatSlug(category.slug)
    setCatImageUrl(category.image?.src || '')
    setCatParentId(category.parent_id || '')
    setIsCategoryModalOpen(true)
  }

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    setActionLoading(true)

    const categoryPayload = {
      name: catName,
      slug: catSlug || catName.toLowerCase().trim().replace(/\s+/g, '-'),
      imageUrl: catImageUrl,
      parentId: catParentId || null
    }

    try {
      const url = editingCategory
        ? `/api/admin/categories?id=${editingCategory._id}`
        : '/api/admin/categories'

      const method = editingCategory ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(categoryPayload)
      })

      const data = await response.json()
      if (response.ok && data.success) {
        showToast('success', editingCategory ? 'Category updated successfully!' : 'Category created successfully!')
        setIsCategoryModalOpen(false)
        fetchDashboardData()
      } else {
        showToast('error', data.message || 'Action failed')
      }
    } catch (error) {
      console.error(error)
      showToast('error', 'An error occurred during category save')
    } finally {
      setActionLoading(false)
    }
  }

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category? Subcategories will be unlinked.')) return
    setActionLoading(true)

    try {
      const response = await fetch(`/api/admin/categories?id=${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()
      if (response.ok && data.success) {
        showToast('success', 'Category deleted successfully!')
        fetchDashboardData()
      } else {
        showToast('error', data.message || 'Failed to delete category')
      }
    } catch (error) {
      console.error(error)
      showToast('error', 'An error occurred during delete')
    } finally {
      setActionLoading(false)
    }
  }

  // Toggle Category Accordion Expand
  const toggleCategoryExpand = (id: string) => {
    setExpandedCategories(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    )
  }

  // Update Order Status
  const handleOrderStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch('/api/admin/orders', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ orderId, status: newStatus })
      })

      const data = await response.json()
      if (response.ok && data.success) {
        showToast('success', 'Order status updated!')
        fetchDashboardData()
      } else {
        showToast('error', data.message || 'Failed to update order status')
      }
    } catch (error) {
      console.error(error)
      showToast('error', 'An error occurred')
    }
  }

  // Analytics Metrics
  const totalRevenue = orders.reduce((sum, ord) => ord.status !== 'cancelled' ? sum + (ord.totalAmount || ord.total || 0) : sum, 0)
  const totalOrders = orders.length
  const totalStock = products.reduce((sum, prod) => sum + (prod.stock || 0), 0)
  const averageOrderVal = totalOrders > 0 ? (totalRevenue / totalOrders) : 0

  const getFilteredOrders = () => {
    const now = new Date()
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    const startOfYesterday = new Date(startOfToday)
    startOfYesterday.setDate(startOfYesterday.getDate() - 1)

    const startOfWeek = new Date(startOfToday)
    const day = startOfWeek.getDay()
    startOfWeek.setDate(startOfWeek.getDate() - day)

    let list = orders.filter(order => {
      if (!order.createdAt) return true
      const orderDate = new Date(order.createdAt)
      if (orderTimeFilter === 'today') {
        return orderDate >= startOfToday
      }
      if (orderTimeFilter === 'yesterday') {
        return orderDate >= startOfYesterday && orderDate < startOfToday
      }
      if (orderTimeFilter === 'week') {
        return orderDate >= startOfWeek
      }
      return true
    })

    if (orderSearchQuery.trim()) {
      const q = orderSearchQuery.toLowerCase().trim()
      list = list.filter(order => {
        const orderIdMatch = order.orderId?.toLowerCase().includes(q)
        const dateMatch = new Date(order.createdAt).toLocaleDateString().toLowerCase().includes(q)

        const customerName = (order.customer?.name || order.shippingAddress?.fullName || '').toLowerCase()
        const customerEmail = (order.customer?.email || order.userEmail || '').toLowerCase()
        const customerAddress = (order.customer?.address || order.shippingAddress?.address || '').toLowerCase()
        const customerCity = (order.customer?.city || order.shippingAddress?.city || '').toLowerCase()
        const customerPhone = (order.customer?.phone || order.shippingAddress?.phone || '').toLowerCase()

        return (
          orderIdMatch ||
          dateMatch ||
          customerName.includes(q) ||
          customerEmail.includes(q) ||
          customerAddress.includes(q) ||
          customerCity.includes(q) ||
          customerPhone.includes(q)
        )
      })
    }

    return list
  }

  const filteredOrders = getFilteredOrders()

  // Filter products by search query
  const filteredProducts = products.filter(prod =>
    prod.name.toLowerCase().includes(prodSearchQuery.toLowerCase()) ||
    (prod.sku || prod.id || '').toLowerCase().includes(prodSearchQuery.toLowerCase()) ||
    prod.category_name.toLowerCase().includes(prodSearchQuery.toLowerCase())
  )

  // Products Pagination calculation
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage)
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  // Categories Structure (Separate parent categories from subcategories using parent_id)
  const parentCategories = categories.filter(c => !c.parent_id)

  // Categories Pagination calculation
  const totalCatPages = Math.ceil(parentCategories.length / catsPerPage)
  const paginatedParentCategories = parentCategories.slice(
    (currentCatPage - 1) * catsPerPage,
    currentCatPage * catsPerPage
  )

  if (!authorized) {
    return (
      <div className={`min-h-screen flex items-center justify-center font-sans ${darkMode ? 'dark dark-mode-admin bg-[#0b0f19]' : 'bg-gray-55'}`}>
        <div className="text-gray-555 text-sm flex items-center gap-2">
          <Icon icon="line-md:loading-twotone-loop" className="w-5 h-5 text-blue-600" />
          <span>Verifying authentication privileges...</span>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen flex font-sans overflow-hidden transition-colors duration-200 ${darkMode ? 'dark dark-mode-admin bg-[#0b0f19]' : 'bg-gray-50 text-gray-800'}`}>
      {/* Toast Notification */}
      {message && (
        <div className={`fixed top-5 right-5 z-50 px-6 py-3.5 rounded-xl border shadow-xl transition-all duration-300 flex items-center gap-3 ${message.type === 'success'
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
            : 'bg-red-50 border-red-202 text-red-800'
          }`}>
          <Icon icon={message.type === 'success' ? 'lucide:check-circle' : 'lucide:alert-circle'} className={`w-5 h-5 ${message.type === 'success' ? 'text-emerald-600' : 'text-red-600'}`} />
          <span className="text-sm font-semibold">{message.text}</span>
        </div>
      )}

      {/* Collapsible Sidebar matches the shadcn sidebar demo structure */}
      <aside className={`bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ${sidebarCollapsed ? 'w-20' : 'w-64'
        }`}>
        {/* Sidebar Header (Brand Logo / Workspace Selector) */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between min-h-16 overflow-hidden">
          {!sidebarCollapsed ? (
            <img
              src="/logo2.png"
              alt="SkyFit"
              className="h-10 w-auto object-contain"
            />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center flex-shrink-0">
              <Icon icon="fluent:dumbbell-24-regular" className="w-5 h-5 text-blue-600" />
            </div>
          )}
        </div>

        {/* Sidebar Content (Navigation groups) */}
        <nav className="flex-1 p-3 space-y-6 overflow-y-auto">
          {/* Main platform controls */}
          <div>
            {!sidebarCollapsed && (
              <span className="px-3 text-xs font-bold uppercase tracking-wider text-gray-400 block mb-2">
                Platform
              </span>
            )}
            <div className="space-y-1">
              {[
                { id: 'overview', label: 'Overview', icon: 'fluent:box-multiple-24-regular' },
                { id: 'products', label: 'Products Catalog', icon: 'fluent:dumbbell-24-regular' },
                { id: 'categories', label: 'Categories Manager', icon: 'fluent:grid-24-regular' },
                { id: 'orders', label: 'Orders', icon: 'fluent:document-text-link-24-regular' },
                { id: 'users', label: 'Customers', icon: 'fluent:people-community-24-regular' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full flex items-center gap-3 px-3 py-3 text-sm font-semibold rounded-xl transition-all ${activeTab === tab.id
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-500 hover:text-gray-905 hover:bg-gray-50'
                    }`}
                  title={sidebarCollapsed ? tab.label : undefined}
                >
                  <Icon icon={tab.icon} className="w-5 h-5 flex-shrink-0" />
                  {!sidebarCollapsed && <span>{tab.label}</span>}
                </button>
              ))}
            </div>
          </div>
        </nav>

        {/* Sidebar Footer (User settings dropdown) */}
        <div className="p-3 border-t border-gray-150 relative">
          <button
            onClick={() => setUserDropdownOpen(!userDropdownOpen)}
            className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 text-left transition-all"
          >
            <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
              P
            </div>
            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">Pratik Admin</p>
                <p className="text-xs text-gray-400 truncate">pratik@skyfit.com</p>
              </div>
            )}
            {!sidebarCollapsed && <Icon icon="lucide:chevrons-up-down" className="w-4 h-4 text-gray-400 ml-auto" />}
          </button>

          {/* User Settings Dropdown */}
          {userDropdownOpen && (
            <div className={`absolute bottom-full left-3 right-3 bg-white border border-gray-200 rounded-xl shadow-lg z-50 p-1 mb-2 space-y-1 ${sidebarCollapsed ? 'w-48 left-20' : ''
              }`}>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2.5 text-left text-sm font-semibold text-red-600 hover:bg-red-55 rounded-lg transition-colors"
              >
                <Icon icon="lucide:log-out" className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Area (Sidebar Inset) */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Breadcrumbs & Header bar with trigger */}
        <header className="bg-white border-b border-gray-200 h-16 px-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-2 rounded-lg hover:bg-gray-50 border border-gray-200 text-gray-555 hover:text-gray-900 transition-colors"
              title="Toggle Sidebar"
            >
              <Icon icon="fluent:navigation-24-regular" className="w-5 h-5" />
            </button>

            <div className="h-4 w-px bg-gray-200" />

            {/* Simple Breadcrumbs */}
            <div className="flex items-center gap-2 text-sm font-medium text-gray-555">
              <span>Admin</span>
              <Icon icon="lucide:chevron-right" className="w-4 h-4 text-gray-400" />
              <span className="text-gray-900 capitalize font-bold">{activeTab}</span>
            </div>
          </div>

          {/* Right Header items - Dark Mode toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-lg hover:bg-gray-50 border border-gray-200 text-gray-555 hover:text-gray-900 transition-colors flex items-center justify-center cursor-pointer"
            title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            <Icon 
              icon={darkMode ? "fluent:weather-sunny-24-regular" : "fluent:weather-moon-24-regular"} 
              className={`w-5 h-5 ${darkMode ? 'text-amber-500' : 'text-slate-600'}`} 
            />
          </button>
        </header>

        {/* Scrollable Dashboard Body */}
        <div className="flex-grow p-6 overflow-y-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Icon icon="line-md:loading-twotone-loop" className="w-8 h-8 text-blue-600" />
              <span className="text-gray-400 font-semibold text-xs">Loading analytics...</span>
            </div>
          ) : (
            <>
              {/* Tab 1: OVERVIEW */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div className="flex flex-col gap-0.5">
                    <h1 className="text-xl font-bold text-gray-909">Dashboard Overview</h1>
                    <p className="text-gray-550 text-sm font-medium">Quick stats summary.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      {
                        title: 'Total Revenue',
                        value: `Rs. ${totalRevenue.toLocaleString()}`,
                        desc: 'From completed checkouts',
                        icon: 'fluent:money-hand-24-regular',
                        color: 'bg-emerald-50 text-emerald-600 border-emerald-100'
                      },
                      {
                        title: 'Total Orders',
                        value: totalOrders.toString(),
                        desc: 'Placed by active users',
                        icon: 'fluent:cart-24-regular',
                        color: 'bg-blue-50 text-blue-600 border-blue-100'
                      },
                      {
                        title: 'Items Stocked',
                        value: totalStock.toString(),
                        desc: 'Across catalog products',
                        icon: 'fluent:box-toolbox-24-regular',
                        color: 'bg-indigo-50 text-indigo-600 border-indigo-100'
                      },
                      {
                        title: 'Average Order Value',
                        value: `Rs. ${averageOrderVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                        desc: 'Revenue per transaction',
                        icon: 'fluent:arrow-trending-lines-24-regular',
                        color: 'bg-amber-50 text-amber-600 border-amber-100'
                      },
                    ].map((metric, idx) => (
                      <div key={idx} className="bg-white border border-gray-200 p-6 rounded-2xl flex items-center justify-between gap-4">
                        <div className="space-y-2">
                          <span className="text-gray-400 text-xs font-bold uppercase tracking-wider">{metric.title}</span>
                          <h3 className="text-2xl font-bold text-gray-900">{metric.value}</h3>
                          <p className="text-gray-500 text-xs font-medium">{metric.desc}</p>
                        </div>
                        <div className={`p-3 rounded-xl border ${metric.color}`}>
                          <Icon icon={metric.icon} className="w-6 h-6" />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Recent Activity lists */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Recent Orders card */}
                    <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
                      <h4 className="text-base font-bold text-gray-900 flex items-center gap-2">
                        <Icon icon="fluent:receipt-play-24-regular" className="text-blue-500" />
                        Recent Orders
                      </h4>
                      <div className="space-y-3">
                        {orders.slice(0, 5).map(order => {
                          const name = order.customer?.name || order.shippingAddress?.fullName || 'Customer';
                          const initials = name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();
                          const formattedDate = new Date(order.createdAt).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric'
                          });
                          const config = getStatusBadgeConfig(order.status);

                          return (
                            <div key={order.orderId} className="flex items-center justify-between p-3.5 rounded-2xl bg-gray-50/50 hover:bg-gray-50 border border-gray-100 hover:border-gray-200 transition-all duration-200">
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-extrabold text-xs tracking-wider shrink-0 shadow-sm shadow-slate-900/10">
                                  {initials || 'SF'}
                                </div>
                                <div className="min-w-0">
                                  <p className="font-bold text-gray-900 text-sm truncate">{name}</p>
                                  <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-400 font-medium">
                                    <span className="font-mono bg-white border border-gray-200/60 px-1.5 py-0.5 rounded text-[10px] text-gray-500">{order.orderId}</span>
                                    <span>•</span>
                                    <span>{formattedDate}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="text-right shrink-0">
                                <p className="font-black text-gray-955 text-sm">Rs. {(order.totalAmount || order.total || 0).toLocaleString()}</p>
                                <span className={`inline-flex items-center gap-1.5 mt-1 px-2.5 py-0.5 text-[10px] rounded-full font-black uppercase tracking-wider border ${config.classes}`}>
                                  <Icon icon={config.icon} className={`w-3.5 h-3.5 ${config.iconColor}`} />
                                  {order.status}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                        {orders.length === 0 && (
                          <p className="text-gray-450 py-6 text-center text-sm">No orders recorded yet.</p>
                        )}
                      </div>
                    </div>

                    {/* Stock Alert card */}
                    <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
                      <h4 className="text-base font-bold text-gray-909 flex items-center gap-2">
                        <Icon icon="fluent:warning-24-regular" className="text-amber-500" />
                        Stock Warnings
                      </h4>
                      <div className="divide-y divide-gray-100">
                        {products.filter(p => (p.stock !== undefined && p.stock !== null ? Number(p.stock) : 0) <= 5).slice(0, 5).map(prod => {
                          const stockVal = prod.stock !== undefined && prod.stock !== null ? Number(prod.stock) : 0;
                          return (
                            <div key={prod._id} className="py-3 flex justify-between items-center text-sm gap-2">
                              <div>
                                <p className="font-semibold text-gray-855">{prod.name}</p>
                                <p className="text-xs text-gray-400 font-mono">Category: {prod.category_name}</p>
                              </div>
                              <div className="text-right">
                                <span className={`inline-block px-2 py-0.5 text-xs rounded font-bold ${stockVal === 0 ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-amber-50 text-amber-600 border border-amber-100'
                                  }`}>
                                  {stockVal} left
                                </span>
                              </div>
                            </div>
                          );
                        })}
                        {products.filter(p => (p.stock !== undefined && p.stock !== null ? Number(p.stock) : 0) <= 5).length === 0 && (
                          <p className="text-gray-455 py-4 text-center text-sm">All products are healthy in stock!</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: PRODUCTS CRUD (With Search & Pagination) */}
              {activeTab === 'products' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex flex-col gap-0.5">
                      <h1 className="text-xl font-bold text-gray-909">Products Inventory</h1>
                      <p className="text-gray-555 text-sm">Manage catalog products listing.</p>
                    </div>
                    <div className="flex items-center gap-3 self-start sm:self-auto">
                      <button
                        onClick={() => setIsBulkImportOpen(true)}
                        className="flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-semibold border border-gray-300 hover:border-gray-400 bg-white text-gray-700 rounded-xl shadow-xs transition-all hover:bg-gray-50"
                      >
                        <Icon icon="fluent:document-arrow-up-20-regular" className="w-5 h-5 text-blue-600" />
                        Bulk Import
                      </button>
                      <button
                        onClick={openAddProductModal}
                        className="flex items-center justify-center gap-1.5 px-4.5 py-2.5 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm transition-all"
                      >
                        <Icon icon="fluent:add-circle-24-regular" className="w-5 h-5" />
                        Add New Product
                      </button>
                    </div>
                  </div>

                  {/* Filter and Search Bar */}
                  <div className="bg-white border border-gray-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-3 shadow-sm">
                    <div className="relative flex-1 w-full">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                        <Icon icon="lucide:search" className="w-4 h-4" />
                      </span>
                      <input
                        type="text"
                        value={prodSearchQuery}
                        onChange={(e) => setProdSearchQuery(e.target.value)}
                        className="block w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-300 text-gray-900 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
                        placeholder="Search by name, SKU, or category..."
                      />
                    </div>
                    {prodSearchQuery && (
                      <button
                        onClick={() => setProdSearchQuery('')}
                        className="text-xs font-semibold text-gray-505 hover:text-gray-955 px-3 py-2 border border-gray-200 rounded-xl bg-white transition-all w-full sm:w-auto"
                      >
                        Clear Filters
                      </button>
                    )}
                  </div>

                  {/* Products Table with paginated products */}
                  <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-gray-200 text-xs font-bold uppercase tracking-wider text-gray-400 bg-gray-50">
                            <th className="px-6 py-4">Details</th>
                            <th className="px-6 py-4">Category</th>
                            <th className="px-6 py-4">Price</th>
                            <th className="px-6 py-4">Stock</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-sm">
                          {paginatedProducts.map(prod => (
                            <tr key={prod._id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-4 flex items-center gap-3">
                                <div className="w-12 h-12 rounded-lg bg-gray-50 overflow-hidden border border-gray-200 flex-shrink-0">
                                  {prod.images && prod.images[0] ? (
                                    <img src={prod.images[0]} alt="" className="w-full h-full object-cover" />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-xs text-gray-300">No Image</div>
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <h4 className="font-semibold text-gray-855 truncate max-w-xs">{prod.name}</h4>
                                  <p className="text-xs text-gray-400 font-mono truncate">{prod.sku || prod.id}</p>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-gray-555 font-medium">
                                {prod.category_name}
                              </td>
                              <td className="px-6 py-4 text-gray-900 font-semibold font-mono">
                                Rs. {prod.price.toLocaleString()} {prod.sale_price && <span className="text-xs text-gray-400 line-through ml-1">Rs. {prod.sale_price.toLocaleString()}</span>}
                              </td>
                              <td className="px-6 py-4">
                                <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${prod.stock > 5 ? 'bg-gray-100 text-gray-600' :
                                    prod.stock > 0 ? 'bg-amber-50 text-amber-700' :
                                      'bg-red-50 text-red-700'
                                  }`}>
                                  {prod.stock} units
                                </span>
                              </td>
                              <td className="px-6 py-4 text-right space-x-2">
                                <button
                                  onClick={() => openEditProductModal(prod)}
                                  className="text-blue-600 hover:text-white border border-blue-200 hover:bg-blue-600 px-3 py-1.5 rounded-lg font-semibold transition-all inline-flex items-center gap-0.5"
                                >
                                  <Icon icon="fluent:edit-24-regular" className="w-4 h-4" />
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDeleteProduct(prod.sku || prod._id)}
                                  className="text-red-600 hover:text-white border border-red-200 hover:bg-red-650 px-3 py-1.5 rounded-lg font-semibold transition-all inline-flex items-center gap-0.5"
                                >
                                  <Icon icon="fluent:delete-24-regular" className="w-4 h-4" />
                                  Delete
                                </button>
                              </td>
                            </tr>
                          ))}
                          {filteredProducts.length === 0 && (
                            <tr>
                              <td colSpan={5} className="text-center text-gray-455 py-12">
                                No products found matching your search.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination Controls - Simplified layout */}
                    {totalPages > 1 && (
                      <div className="px-6 py-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between bg-gray-50/50 gap-3">
                        <span className="text-xs text-gray-555 font-medium text-center sm:text-left">
                          Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredProducts.length)} of {filteredProducts.length} items
                        </span>
                        <div className="flex items-center gap-4">
                          <button
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            className="p-1.5 border border-gray-200 bg-white rounded-lg text-gray-550 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-xs flex items-center gap-1 font-semibold shadow-sm"
                          >
                            <Icon icon="lucide:chevron-left" className="w-4 h-4" />
                            Previous
                          </button>

                          <span className="text-xs text-gray-700 font-bold font-mono">
                            Page {currentPage} of {totalPages}
                          </span>

                          <button
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            className="p-1.5 border border-gray-200 bg-white rounded-lg text-gray-555 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-xs flex items-center gap-1 font-semibold shadow-sm"
                          >
                            Next
                            <Icon icon="lucide:chevron-right" className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Tab 2.5: CATEGORIES CRUD (Collapsible hierarchy list matches the uploaded image mockup) */}
              {activeTab === 'categories' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex flex-col gap-0.5">
                      <h1 className="text-xl font-bold text-gray-900">Categories Manager</h1>
                      <p className="text-gray-555 text-sm font-medium">Manage top-level categories and their subcategories hierarchy.</p>
                    </div>
                    <button
                      onClick={() => openAddCategoryModal()}
                      className="flex items-center justify-center gap-1.5 px-4.5 py-2.5 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm transition-all"
                    >
                      <Icon icon="fluent:add-circle-24-regular" className="w-5 h-5" />
                      Add Main Category
                    </button>
                  </div>

                  {/* Top-level Categories Loop */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                    {paginatedParentCategories.map(cat => {
                      const subcats = categories.filter(c => c.parent_id === cat._id)
                      const isExpanded = expandedCategories.includes(cat._id)

                      return (
                        <div key={cat._id} className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                          {/* Parent Category Card Row (Level 1) */}
                          <div className="p-5 flex items-center justify-between gap-4 bg-white">
                            <div className="flex items-center gap-4">
                              {/* Left side folder/branch icon box */}
                              <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-blue-600 flex-shrink-0">
                                {cat.image?.src ? (
                                  <img src={cat.image.src} alt="" className="w-full h-full object-cover rounded-2xl" />
                                ) : (
                                  <Icon icon="fluent:text-bullet-list-tree-24-regular" className="w-6 h-6 text-blue-600" />
                                )}
                              </div>
                              {/* Center category metadata */}
                              <div>
                                <h3 className="text-base font-bold text-gray-900 flex items-center gap-1.5">
                                  {cat.name}
                                  <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full inline-block" />
                                </h3>
                                <p className="text-xs text-gray-405 font-mono">{cat.slug}</p>
                              </div>
                            </div>

                            {/* Actions Right Side */}
                            <div className="flex items-center gap-3">
                              <button
                                onClick={() => openEditCategoryModal(cat)}
                                className="p-2 border border-gray-200 bg-white rounded-xl text-gray-500 hover:text-blue-600 hover:border-blue-200 transition-all"
                                title="Edit Category"
                              >
                                <Icon icon="lucide:edit-3" className="w-4.5 h-4.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteCategory(cat._id)}
                                className="p-2 border border-gray-200 bg-white rounded-xl text-gray-500 hover:text-red-600 hover:border-red-200 transition-all"
                                title="Delete Category"
                              >
                                <Icon icon="lucide:trash-2" className="w-4.5 h-4.5" />
                              </button>
                            </div>
                          </div>

                          {/* Collapsible Accordion Header */}
                          <div className="border-t border-gray-100 px-5 py-3 flex items-center justify-between bg-slate-50/50">
                            <button
                              onClick={() => toggleCategoryExpand(cat._id)}
                              className="flex items-center gap-2 text-xs font-bold text-gray-600 hover:text-gray-900 transition-colors"
                            >
                              <Icon
                                icon="lucide:chevron-right"
                                className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
                              />
                              Subcategories ({subcats.length})
                            </button>
                            <button
                              onClick={() => openAddCategoryModal(cat._id)}
                              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
                            >
                              <Icon icon="fluent:add-12-filled" className="w-3.5 h-3.5" />
                              Add Subcategory
                            </button>
                          </div>

                          {/* Expanded Subcategories Block (Level 2) */}
                          {isExpanded && (
                            <div className="border-t border-gray-100 bg-white divide-y divide-gray-50">
                              {subcats.map(sub => {
                                const subSubcats = categories.filter(c => c.parent_id === sub._id)
                                const isSubExpanded = expandedCategories.includes(sub._id)

                                return (
                                  <div key={sub._id} className="divide-y divide-gray-50/50">
                                    {/* Level 2 Row */}
                                    <div className="pl-8 pr-5 py-3.5 flex items-center justify-between gap-4 hover:bg-slate-50/30 transition-all bg-slate-50/10">
                                      <div className="flex items-center gap-3.5">
                                        <button
                                          onClick={() => toggleCategoryExpand(sub._id)}
                                          className={`flex items-center justify-center p-1 rounded hover:bg-gray-100 transition-colors ${subSubcats.length === 0 ? 'opacity-0 pointer-events-none' : ''}`}
                                        >
                                          <Icon
                                            icon="lucide:chevron-right"
                                            className={`w-3.5 h-3.5 text-gray-500 transition-transform duration-200 ${isSubExpanded ? 'rotate-90' : ''}`}
                                          />
                                        </button>
                                        {sub.image?.src ? (
                                          <div className="w-8 h-8 rounded-lg bg-gray-50 overflow-hidden border border-gray-100 flex-shrink-0">
                                            <img src={sub.image.src} alt="" className="w-full h-full object-cover" />
                                          </div>
                                        ) : (
                                          <Icon icon="fluent:branch-fork-24-regular" className="w-5 h-5 text-blue-500/70 rotate-90 flex-shrink-0" />
                                        )}
                                        <div>
                                          <p className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                                            {sub.name}
                                            {subSubcats.length > 0 && (
                                              <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded-full font-bold">
                                                {subSubcats.length}
                                              </span>
                                            )}
                                          </p>
                                          <p className="text-[10px] text-gray-400 font-mono">{sub.slug}</p>
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-2.5">
                                        <button
                                          onClick={() => openAddCategoryModal(sub._id)}
                                          className="text-xs font-bold text-slate-500 hover:text-blue-600 flex items-center gap-1 transition-colors px-2 py-1 border border-transparent hover:border-blue-100 rounded-lg hover:bg-blue-50/50"
                                          title="Add Sub-subcategory"
                                        >
                                          <Icon icon="fluent:add-12-filled" className="w-3 h-3" />
                                          Add
                                        </button>
                                        <button
                                          onClick={() => openEditCategoryModal(sub)}
                                          className="p-1.5 border border-gray-200 bg-white rounded-lg text-gray-450 hover:text-blue-600 hover:border-blue-200 transition-all"
                                          title="Edit Subcategory"
                                        >
                                          <Icon icon="lucide:edit-3" className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                          onClick={() => handleDeleteCategory(sub._id)}
                                          className="p-1.5 border border-gray-200 bg-white rounded-lg text-gray-455 hover:text-red-600 hover:border-red-205 transition-all"
                                          title="Delete Subcategory"
                                        >
                                          <Icon icon="lucide:trash-2" className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    </div>

                                    {/* Expanded Sub-subcategories Block (Level 3) */}
                                    {isSubExpanded && subSubcats.length > 0 && (
                                      <div className="bg-slate-50/50 divide-y divide-gray-100/50">
                                        {subSubcats.map(subSub => (
                                          <div key={subSub._id} className="pl-20 pr-5 py-2.5 flex items-center justify-between gap-4 hover:bg-slate-100/30 transition-all">
                                            <div className="flex items-center gap-3">
                                              {subSub.image?.src ? (
                                                <div className="w-6 h-6 rounded-md bg-gray-50 overflow-hidden border border-gray-100 flex-shrink-0">
                                                  <img src={subSub.image.src} alt="" className="w-full h-full object-cover" />
                                                </div>
                                              ) : (
                                                <Icon icon="fluent:branch-24-regular" className="w-4 h-4 text-gray-400 rotate-180 flex-shrink-0" />
                                              )}
                                              <div>
                                                <p className="text-xs font-semibold text-gray-700">{subSub.name}</p>
                                                <p className="text-[9px] text-gray-400 font-mono">{subSub.slug}</p>
                                              </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                              <button
                                                onClick={() => openEditCategoryModal(subSub)}
                                                className="p-1 border border-gray-200 bg-white rounded-md text-gray-455 hover:text-blue-600 hover:border-blue-200 transition-all"
                                                title="Edit Sub-subcategory"
                                              >
                                                <Icon icon="lucide:edit-3" className="w-3 h-3" />
                                              </button>
                                              <button
                                                onClick={() => handleDeleteCategory(subSub._id)}
                                                className="p-1 border border-gray-200 bg-white rounded-md text-gray-455 hover:text-red-600 hover:border-red-205 transition-all"
                                                title="Delete Sub-subcategory"
                                              >
                                                <Icon icon="lucide:trash-2" className="w-3 h-3" />
                                              </button>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                )
                              })}
                              {subcats.length === 0 && (
                                <p className="text-center text-xs text-gray-400 py-6 italic">No subcategories defined.</p>
                              )}
                            </div>
                          )}
                        </div>
                      )
                    })}

                    {parentCategories.length === 0 && (
                      <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center text-gray-400 font-medium">
                        No categories found. Click "Add Main Category" to begin.
                      </div>
                    )}
                  </div>

                  {/* Categories Tab Pagination */}
                  {totalCatPages > 1 && (
                    <div className="bg-white border border-gray-200 rounded-2xl px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
                      <span className="text-xs text-gray-550 font-medium">
                        Showing {(currentCatPage - 1) * catsPerPage + 1} to {Math.min(currentCatPage * catsPerPage, parentCategories.length)} of {parentCategories.length} main categories
                      </span>
                      <div className="flex items-center gap-4">
                        <button
                          disabled={currentCatPage === 1}
                          onClick={() => setCurrentCatPage(prev => Math.max(prev - 1, 1))}
                          className="p-1.5 border border-gray-200 bg-white rounded-lg text-gray-555 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-xs flex items-center gap-1 font-semibold"
                        >
                          <Icon icon="lucide:chevron-left" className="w-4 h-4" />
                          Previous
                        </button>

                        <span className="text-xs text-gray-700 font-bold font-mono">
                          Page {currentCatPage} of {totalCatPages}
                        </span>

                        <button
                          disabled={currentCatPage === totalCatPages}
                          onClick={() => setCurrentCatPage(prev => Math.min(prev + 1, totalCatPages))}
                          className="p-1.5 border border-gray-200 bg-white rounded-lg text-gray-555 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-xs flex items-center gap-1 font-semibold"
                        >
                          Next
                          <Icon icon="lucide:chevron-right" className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 3: ORDERS */}
              {activeTab === 'orders' && (
                <div className="space-y-4">
                  <div className="flex flex-col gap-0.5">
                    <h1 className="text-xl font-bold text-gray-909">Orders</h1>
                    <p className="text-gray-555 text-sm">Fulfill orders and update their statuses.</p>
                  </div>

                  {/* Filters & Search Row */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-1">
                    {/* Date Filter Buttons */}
                    <div className="flex flex-wrap gap-2">
                      {[
                        { id: 'today', label: 'Today' },
                        { id: 'yesterday', label: 'Yesterday' },
                        { id: 'week', label: 'This Week' },
                        { id: 'all', label: 'Order Till Now' }
                      ].map(filter => (
                        <button
                          key={filter.id}
                          type="button"
                          onClick={() => setOrderTimeFilter(filter.id as any)}
                          className={`px-3 py-2 text-xs font-bold rounded-xl border transition-all ${orderTimeFilter === filter.id
                              ? 'bg-slate-900 border-slate-900 text-white shadow-sm'
                              : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                            }`}
                        >
                          {filter.label}
                        </button>
                      ))}
                    </div>

                    {/* Search Input */}
                    <div className="relative w-full sm:w-72">
                      <input
                        type="text"
                        placeholder="Search ID, date, name, tel..."
                        value={orderSearchQuery}
                        onChange={(e) => setOrderSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-8 py-2.5 bg-white border border-gray-205 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-650 focus:border-blue-650 font-semibold"
                      />
                      <Icon
                        icon="fluent:search-24-regular"
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4"
                      />
                      {orderSearchQuery && (
                        <button
                          type="button"
                          onClick={() => setOrderSearchQuery('')}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          <Icon icon="fluent:dismiss-24-regular" className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-gray-200 text-xs font-bold uppercase tracking-wider text-gray-400 bg-gray-50">
                            <th className="px-6 py-3">ID & Date</th>
                            <th className="px-6 py-3">Customer Details</th>
                            <th className="px-6 py-3">Items Summary</th>
                            <th className="px-6 py-3">Total</th>
                            <th className="px-6 py-3">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-sm">
                          {filteredOrders.map(order => (
                            <tr key={order._id} className="hover:bg-gray-50 transition-colors align-top">
                              <td className="px-6 py-4 font-mono text-xs whitespace-nowrap">
                                <span className="font-semibold text-gray-800 block">{order.orderId}</span>
                                <span className="text-gray-450">{new Date(order.createdAt).toLocaleDateString()}</span>
                              </td>
                              <td className="px-6 py-4">
                                <div className="space-y-1">
                                  <p className="font-semibold text-gray-855">
                                    {order.customer?.name || order.shippingAddress?.fullName || 'Anonymous'}
                                  </p>
                                  <p className="text-xs text-gray-455">
                                    {order.customer?.email || order.userEmail}
                                  </p>
                                  {(order.customer?.address || order.shippingAddress?.address) ? (
                                    <>
                                      <p className="text-xs text-gray-505 truncate max-w-xs">
                                        {order.customer?.address || order.shippingAddress?.address}
                                        {(order.customer?.city || order.shippingAddress?.city) && `, ${order.customer?.city || order.shippingAddress?.city}`}
                                      </p>
                                      <p className="text-xs text-gray-505 font-semibold font-mono">
                                        Tel: {order.customer?.phone || order.shippingAddress?.phone}
                                      </p>
                                    </>
                                  ) : (
                                    <p className="text-xs text-gray-400 italic">No details</p>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="space-y-2 max-w-xs">
                                  {order.items.map((item, idx) => (
                                    <div key={idx} className="flex flex-col text-xs text-gray-600 border-b border-gray-100/40 pb-1.5 last:border-b-0 last:pb-0">
                                      <div className="flex justify-between items-start gap-4">
                                        <span className="font-semibold text-gray-800 break-words flex-1">{item.name}</span>
                                        <span className="text-gray-500 font-mono font-bold shrink-0">x{item.quantity}</span>
                                      </div>
                                      {(item.selectedColor || item.selectedSize) && (
                                        <span className="text-[10px] font-bold text-[#128a88] bg-[#128a88]/5 px-1 py-0.5 rounded self-start mt-0.5 uppercase tracking-wide">
                                          {item.selectedColor && `Color: ${item.selectedColor}`}
                                          {item.selectedColor && item.selectedSize && ' / '}
                                          {item.selectedSize && `Size: ${item.selectedSize}`}
                                        </span>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </td>
                              <td className="px-6 py-4 font-bold text-gray-900 font-mono">
                                Rs. {(order.totalAmount || order.total || 0).toLocaleString()}
                              </td>
                              <td className="px-6 py-4">
                                <select
                                  value={order.status}
                                  onChange={(e) => handleOrderStatusUpdate(order.orderId, e.target.value)}
                                  className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase bg-white border text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-600 ${getStatusBadgeConfig(order.status).selectClasses
                                    }`}
                                >
                                  <option value="pending">Pending</option>
                                  <option value="verified">Verified</option>
                                  <option value="shipped">Shipped</option>
                                  <option value="delivered">Delivered</option>
                                  <option value="cancelled">Cancelled</option>
                                </select>
                              </td>
                            </tr>
                          ))}
                          {filteredOrders.length === 0 && (
                            <tr>
                              <td colSpan={5} className="text-center text-gray-400 py-10">
                                No orders found for the selected time filter.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 4: USERS */}
              {activeTab === 'users' && (
                <div className="space-y-4">
                  <div className="flex flex-col gap-0.5">
                    <h1 className="text-xl font-bold text-gray-909">Registered Customers</h1>
                    <p className="text-gray-500 text-sm">Browse customer profiles and system details.</p>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-gray-200 text-xs font-bold uppercase tracking-wider text-gray-400 bg-gray-50">
                            <th className="px-6 py-4">Customer Name</th>
                            <th className="px-6 py-4">Email</th>
                            <th className="px-6 py-4">Phone Number</th>
                            <th className="px-6 py-4">Default Address</th>
                            <th className="px-6 py-4 text-right">Registered On</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-sm text-gray-650 font-medium">
                          {users.map(user => (
                            <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-4 font-semibold text-gray-855">
                                {user.name || 'Anonymous User'}
                              </td>
                              <td className="px-6 py-4 text-gray-655">
                                {user.email}
                              </td>
                              <td className="px-6 py-4 font-mono text-xs">
                                {user.phone || 'Not Specified'}
                              </td>
                              <td className="px-6 py-4 truncate max-w-xs">
                                {user.address || 'Not Specified'}
                              </td>
                              <td className="px-6 py-4 text-right font-mono text-xs text-gray-405">
                                {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
                              </td>
                            </tr>
                          ))}
                          {users.length === 0 && (
                            <tr>
                              <td colSpan={5} className="text-center text-gray-400 py-10">
                                No registered users found.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Product CRUD Sliding Drawer (Sheet UI) */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-sm flex justify-end">
          <div className="bg-white border-l border-gray-200 w-full max-w-2xl h-full shadow-2xl flex flex-col relative animate-in slide-in-from-right duration-300">
            <form onSubmit={handleSaveProduct} className="flex flex-col h-full overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between flex-shrink-0">
                <h3 className="text-base font-bold text-gray-909 font-sans">
                  {editingProduct ? 'Edit Catalog Product' : 'Add Catalog Product'}
                </h3>
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="text-gray-400 hover:text-gray-950 transition-colors"
                >
                  <Icon icon="fluent:dismiss-24-regular" className="w-6 h-6" />
                </button>
              </div>

              {/* Scrollable form body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500">Product SKU / ID</label>
                    <input
                      type="text"
                      required
                      value={prodSku}
                      disabled={!!editingProduct}
                      onChange={(e) => setProdSku(e.target.value)}
                      className="mt-1.5 block w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      placeholder="e.g. TRD-4000"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500">Product Name</label>
                    <input
                      type="text"
                      required
                      value={prodName}
                      onChange={(e) => setProdName(e.target.value)}
                      className="mt-1.5 block w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-650 text-sm"
                      placeholder="e.g. Pro-Series Treadmill"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500">Price (Rs.)</label>
                    <input
                      type="number"
                      required
                      value={prodPrice}
                      onChange={(e) => setProdPrice(e.target.value)}
                      className="mt-1.5 block w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 text-sm"
                      placeholder="e.g. 1299"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500">Sale Price (Rs.) [Optional]</label>
                    <input
                      type="number"
                      value={prodSalePrice}
                      onChange={(e) => setProdSalePrice(e.target.value)}
                      className="mt-1.5 block w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 text-sm"
                      placeholder="e.g. 1099"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500">Inventory / Stock</label>
                    <input
                      type="number"
                      required
                      value={prodStock}
                      onChange={(e) => setProdStock(e.target.value)}
                      className="mt-1.5 block w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 text-sm"
                      placeholder="e.g. 20"
                    />
                  </div>
                </div>

                <div className="relative">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Product Category</label>
                  <button
                    type="button"
                    onClick={() => setProdCategoryDropdownOpen(!prodCategoryDropdownOpen)}
                    className="w-full flex items-center justify-between px-4 py-2.5 bg-gray-55 border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 text-sm font-semibold transition-all text-left"
                  >
                    <span className={prodCategory ? 'text-gray-900' : 'text-gray-400'}>
                      {prodCategory || 'Select a category...'}
                    </span>
                    <Icon icon="lucide:chevron-down" className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${prodCategoryDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {prodCategoryDropdownOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-gray-200 rounded-xl shadow-xl z-50 p-2 max-h-72 overflow-y-auto space-y-2">
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                          <Icon icon="lucide:search" className="w-3.5 h-3.5" />
                        </span>
                        <input
                          type="text"
                          value={prodCategorySearch}
                          onChange={(e) => setProdCategorySearch(e.target.value)}
                          placeholder="Search categories..."
                          className="block w-full pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-250 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>

                      <div className="divide-y divide-gray-50 text-xs">
                        {(() => {
                          const options: { name: string; level: number }[] = []
                          categories.filter(c => !c.parent_id).forEach(l1 => {
                            options.push({ name: l1.name, level: 1 })

                            const level2 = categories.filter(c => c.parent_id === l1._id)
                            level2.forEach(l2 => {
                              options.push({ name: l2.name, level: 2 })

                              const level3 = categories.filter(c => c.parent_id === l2._id)
                              level3.forEach(l3 => {
                                options.push({ name: l3.name, level: 3 })
                              })
                            })
                          })

                          const filtered = options.filter(opt =>
                            opt.name.toLowerCase().includes(prodCategorySearch.toLowerCase())
                          )

                          if (filtered.length === 0) {
                            return (
                              <p className="text-center text-gray-400 py-3 italic">No matching categories found</p>
                            )
                          }

                          return filtered.map((opt, i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={() => {
                                setProdCategory(opt.name)
                                setProdCategoryDropdownOpen(false)
                              }}
                              className={`w-full text-left px-3 py-2 hover:bg-blue-50/50 rounded-lg font-medium transition-colors flex items-center gap-1.5 ${prodCategory === opt.name ? 'text-blue-600 bg-blue-50/30' : 'text-gray-700'}`}
                            >
                              {opt.level === 3 ? (
                                <span className="text-gray-400 font-mono pl-4">└─</span>
                              ) : opt.level === 2 ? (
                                <span className="text-gray-400 font-mono pl-2">├─</span>
                              ) : null}
                              <span>{opt.name}</span>
                            </button>
                          ))
                        })()}
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Product Image Gallery</label>

                  {/* Visual Image Grid Layout */}
                  {imageUrls.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                      {imageUrls.map((url, idx) => (
                        <div key={idx} className={`relative rounded-xl overflow-hidden border bg-gray-50 flex flex-col group transition-all ${idx === 0 ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-gray-200'}`}>
                          <div className="aspect-video w-full overflow-hidden relative bg-white flex items-center justify-center">
                            {url ? (
                              <img src={url} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-[10px] text-gray-405">Empty URL</span>
                            )}
                            {idx === 0 && (
                              <span className="absolute top-1.5 left-1.5 bg-blue-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                                Featured
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={() => setImageUrls(prev => prev.filter((_, i) => i !== idx))}
                              className="absolute top-1.5 right-1.5 bg-red-600 hover:bg-red-700 text-white p-1 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                              title="Remove image"
                            >
                              <Icon icon="lucide:trash-2" className="w-3 h-3" />
                            </button>
                          </div>
                          {idx > 0 && (
                            <button
                              type="button"
                              onClick={() => {
                                const newImages = [...imageUrls]
                                const [selected] = newImages.splice(idx, 1)
                                newImages.unshift(selected)
                                setImageUrls(newImages)
                              }}
                              className="w-full py-1.5 text-[10px] font-bold text-blue-600 hover:bg-blue-50 border-t border-gray-150 bg-white transition-all"
                            >
                              Make Featured
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add image row */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      id="newImageUrlInput"
                      placeholder="Paste image URL here..."
                      className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          const input = e.currentTarget
                          const url = input.value.trim()
                          if (url) {
                            setImageUrls(prev => [...prev, url])
                            input.value = ''
                          }
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const input = document.getElementById('newImageUrlInput') as HTMLInputElement
                        const url = input?.value.trim()
                        if (url) {
                          setImageUrls(prev => [...prev, url])
                          input.value = ''
                        }
                      }}
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-all"
                    >
                      Add URL
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500">Product Description</label>
                  <textarea
                    value={prodDescription}
                    onChange={(e) => setProdDescription(e.target.value)}
                    className="mt-1.5 block w-full px-4 py-2.5 bg-gray-55 border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 text-sm"
                    rows={3}
                    placeholder="Tell clients about product features, technical highlights..."
                  />
                </div>

                {/* Product Colors Section */}
                <div className="border-t border-gray-100 pt-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={hasColors}
                        onChange={(e) => setHasColors(e.target.checked)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm font-semibold text-gray-800">This product has color options</span>
                    </label>
                  </div>

                  {hasColors && (
                    <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                        Select Available Colors
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {[
                          { name: 'Black', hex: '#1a1a1a' },
                          { name: 'White', hex: '#ffffff' },
                          { name: 'Gray', hex: '#e5e7eb' },
                          { name: 'Red', hex: '#ef4444' },
                          { name: 'Blue', hex: '#3b82f6' },
                          { name: 'Yellow', hex: '#facc15' },
                          { name: 'Green', hex: '#22c55e' },
                          { name: 'Orange', hex: '#f97316' },
                          { name: 'Pink', hex: '#ec4899' },
                          { name: 'Purple', hex: '#8b5cf6' }
                        ].map((color) => {
                          const isSelected = selectedColors.includes(color.name)
                          return (
                            <button
                              key={color.name}
                              type="button"
                              onClick={() => {
                                setSelectedColors(prev =>
                                  isSelected
                                    ? prev.filter(c => c !== color.name)
                                    : [...prev, color.name]
                                )
                              }}
                              className={`flex items-center gap-2 px-3 py-2 text-xs font-bold rounded-xl border transition-all ${isSelected
                                  ? 'bg-slate-900 border-slate-900 text-white shadow-sm'
                                  : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                                }`}
                            >
                              <span
                                style={{ backgroundColor: color.hex }}
                                className="w-3.5 h-3.5 rounded-full border border-gray-200 inline-block"
                              />
                              <span>{color.name}</span>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Product Variants Section */}
                <div className="border-t border-gray-100 pt-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={hasVariants}
                        onChange={(e) => setHasVariants(e.target.checked)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm font-semibold text-gray-800">This product has variants (e.g. weight, size, color)</span>
                    </label>
                  </div>

                  {hasVariants && (
                    <div className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                          Variant Option Names (comma separated)
                        </label>
                        <input
                          type="text"
                          value={variantOptionsText}
                          onChange={(e) => setVariantOptionsText(e.target.value)}
                          placeholder="e.g. weight (or 'size, color')"
                          className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
                        />
                        <p className="text-[10px] text-gray-400 mt-1">
                          Define names of variant options. Example: <code>weight</code> or <code>size, color</code>.
                        </p>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Variants Matrix</label>
                          <button
                            type="button"
                            onClick={() => {
                              const optionNames = variantOptionsText.split(',').map(o => o.trim()).filter(Boolean)
                              const optionDefaults: Record<string, string> = {}
                              optionNames.forEach(name => {
                                optionDefaults[name] = ''
                              })
                              const nextIndex = variantsList.length + 1
                              setVariantsList(prev => [
                                ...prev,
                                {
                                  sku: `${prodSku}-V0${nextIndex}`,
                                  options: optionDefaults,
                                  price: prodPrice ? Number(prodPrice) : 0,
                                  sale_price: prodSalePrice ? Number(prodSalePrice) : null,
                                  stock: 10,
                                  is_active: true
                                }
                              ])
                            }}
                            className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-750 text-white text-[11px] font-bold rounded-lg transition-colors flex items-center gap-1"
                          >
                            <Icon icon="fluent:add-12-filled" className="w-3 h-3" />
                            Add Variant
                          </button>
                        </div>

                        {variantsList.length > 0 ? (
                          <div className="overflow-x-auto border border-gray-200 rounded-lg bg-white">
                            <table className="w-full text-left border-collapse text-xs">
                              <thead>
                                <tr className="bg-slate-50 border-b border-gray-250 text-gray-500 font-bold">
                                  <th className="px-3 py-2.5">Variant SKU</th>
                                  {variantOptionsText.split(',').map(o => o.trim()).filter(Boolean).map(opt => (
                                    <th key={opt} className="px-3 py-2.5 capitalize">{opt}</th>
                                  ))}
                                  <th className="px-3 py-2.5 w-24">Price (Rs.)</th>
                                  <th className="px-3 py-2.5 w-24">Sale Price</th>
                                  <th className="px-3 py-2.5 w-20">Stock</th>
                                  <th className="px-3 py-2.5 text-right w-12"></th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-150">
                                {variantsList.map((variant, idx) => {
                                  const optionNames = variantOptionsText.split(',').map(o => o.trim()).filter(Boolean)
                                  return (
                                    <tr key={idx} className="hover:bg-slate-50/50">
                                      <td className="px-3 py-2 font-mono">
                                        <input
                                          type="text"
                                          value={variant.sku}
                                          onChange={(e) => {
                                            const nextList = [...variantsList]
                                            nextList[idx].sku = e.target.value
                                            setVariantsList(nextList)
                                          }}
                                          className="w-full px-2 py-1 border border-gray-200 rounded bg-slate-50 focus:bg-white text-[11px]"
                                        />
                                      </td>
                                      {optionNames.map(opt => (
                                        <td key={opt} className="px-3 py-2">
                                          <input
                                            type="text"
                                            value={variant.options?.[opt] || ''}
                                            onChange={(e) => {
                                              const nextList = [...variantsList]
                                              if (!nextList[idx].options) nextList[idx].options = {}
                                              nextList[idx].options[opt] = e.target.value
                                              setVariantsList(nextList)
                                            }}
                                            required
                                            placeholder={`e.g. ${opt === 'weight' ? '10 kg' : opt === 'size' ? 'M' : 'value'}`}
                                            className="w-full px-2 py-1 border border-gray-200 rounded text-[11px]"
                                          />
                                        </td>
                                      ))}
                                      <td className="px-3 py-2">
                                        <input
                                          type="number"
                                          value={variant.price}
                                          onChange={(e) => {
                                            const nextList = [...variantsList]
                                            nextList[idx].price = Number(e.target.value)
                                            setVariantsList(nextList)
                                          }}
                                          required
                                          className="w-full px-2 py-1 border border-gray-200 rounded text-[11px]"
                                        />
                                      </td>
                                      <td className="px-3 py-2">
                                        <input
                                          type="number"
                                          value={variant.sale_price || ''}
                                          placeholder="None"
                                          onChange={(e) => {
                                            const nextList = [...variantsList]
                                            nextList[idx].sale_price = e.target.value ? Number(e.target.value) : null
                                            setVariantsList(nextList)
                                          }}
                                          className="w-full px-2 py-1 border border-gray-200 rounded text-[11px]"
                                        />
                                      </td>
                                      <td className="px-3 py-2">
                                        <input
                                          type="number"
                                          value={variant.stock}
                                          onChange={(e) => {
                                            const nextList = [...variantsList]
                                            nextList[idx].stock = Number(e.target.value)
                                            setVariantsList(nextList)
                                          }}
                                          required
                                          className="w-full px-2 py-1 border border-gray-200 rounded text-[11px]"
                                        />
                                      </td>
                                      <td className="px-3 py-2 text-right">
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setVariantsList(prev => prev.filter((_, i) => i !== idx))
                                          }}
                                          className="text-red-500 hover:text-red-700 p-1"
                                          title="Delete Variant"
                                        >
                                          <Icon icon="lucide:trash-2" className="w-3.5 h-3.5" />
                                        </button>
                                      </td>
                                    </tr>
                                  )
                                })}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <p className="text-center text-xs text-gray-400 py-6 border border-dashed border-gray-200 rounded-lg bg-white italic">
                            No variants added. Click "Add Variant" to configure options.
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

              </div>

              {/* Pinned footer */}
              <div className="px-6 py-4.5 border-t border-gray-100 bg-gray-55/50 flex justify-end gap-3 flex-shrink-0 bg-white">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-5 py-2.5 text-sm font-semibold border border-gray-200 text-gray-555 hover:text-gray-955 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2.5 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all disabled:opacity-50"
                >
                  {actionLoading ? 'Saving...' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category CRUD Modal */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-md overflow-hidden shadow-xl relative">
            <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
              <h3 className="text-base font-bold text-gray-900 font-sans">
                {editingCategory ? 'Edit Category' : 'Add Category'}
              </h3>
              <button
                onClick={() => setIsCategoryModalOpen(false)}
                className="text-gray-400 hover:text-gray-955 transition-colors"
              >
                <Icon icon="fluent:dismiss-24-regular" className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500">Category Name</label>
                <input
                  type="text"
                  required
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  className="mt-1.5 block w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 text-sm"
                  placeholder="e.g. Accessories"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500">Category Slug</label>
                <input
                  type="text"
                  value={catSlug}
                  onChange={(e) => setCatSlug(e.target.value)}
                  className="mt-1.5 block w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 text-sm"
                  placeholder="e.g. accessories (auto-generated if empty)"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500">Parent Category (Optional)</label>
                <select
                  value={catParentId}
                  onChange={(e) => setCatParentId(e.target.value)}
                  className="mt-1.5 block w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 text-sm"
                >
                  <option value="">None (Top-level Parent Category)</option>
                  {(() => {
                    const options: { _id: string; name: string; level: number }[] = []
                    // Build nested lists
                    categories.filter(c => !c.parent_id).forEach(l1 => {
                      options.push({ _id: l1._id, name: l1.name, level: 1 })
                      categories.filter(c => c.parent_id === l1._id).forEach(l2 => {
                        options.push({ _id: l2._id, name: l2.name, level: 2 })
                      })
                    })
                    return options
                      .filter(c => c._id !== editingCategory?._id)
                      .map(c => (
                        <option key={c._id} value={c._id}>
                          {c.level === 2 ? `\u00A0\u00A0\u00A0\u00A0\u2014 ${c.name}` : c.name}
                        </option>
                      ))
                  })()}
                </select>
              </div>

              <div className="space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500">Category Image</label>

                {/* Image Preview Box */}
                {catImageUrl && (
                  <div className="relative w-32 h-32 rounded-2xl border border-gray-200 overflow-hidden bg-gray-55/30">
                    <img src={catImageUrl} alt="Category preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setCatImageUrl('')}
                      className="absolute top-1.5 right-1.5 bg-red-600 hover:bg-red-750 text-white rounded-lg p-1 text-xs shadow-md transition-colors"
                      title="Remove image"
                    >
                      <Icon icon="fluent:delete-16-regular" className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Upload & Link options */}
                <div className="flex flex-col gap-2">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => document.getElementById('cat-image-file-input')?.click()}
                      className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border border-gray-300 hover:border-gray-400 bg-white text-gray-700 rounded-xl shadow-xs transition-all hover:bg-gray-50 cursor-pointer"
                    >
                      <Icon icon="fluent:image-arrow-counterclockwise-20-regular" className="w-4 h-4 text-blue-600" />
                      Upload Local File
                    </button>
                    <input
                      type="file"
                      id="cat-image-file-input"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          const reader = new FileReader()
                          reader.onloadend = () => {
                            if (typeof reader.result === 'string') {
                              setCatImageUrl(reader.result)
                            }
                          }
                          reader.readAsDataURL(file)
                        }
                      }}
                    />
                  </div>

                  <div className="relative">
                    <input
                      type="text"
                      value={catImageUrl}
                      onChange={(e) => setCatImageUrl(e.target.value)}
                      className="block w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-905 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 text-xs"
                      placeholder="Or paste remote image URL"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="px-5 py-2.5 text-sm font-semibold border border-gray-200 text-gray-555 hover:text-gray-955 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2.5 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all disabled:opacity-50"
                >
                  {actionLoading ? 'Saving...' : 'Save Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Product Import Modal */}
      {isBulkImportOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-gray-200 rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl relative flex flex-col max-h-[90vh]">

            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between shrink-0">
              <div>
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Icon icon="fluent:document-arrow-up-20-regular" className="w-5 h-5 text-blue-600" />
                  Bulk Import Products catalog
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">Upload an Excel or CSV file to import products in bulk with SEO metadata.</p>
              </div>
              <button
                onClick={() => {
                  setIsBulkImportOpen(false)
                  setBulkImportFile(null)
                  setBulkParsedProducts([])
                }}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1.5 rounded-lg transition-colors"
              >
                <Icon icon="fluent:dismiss-24-regular" className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">

              {/* Instructions & Template Row */}
              <div className="bg-blue-50/40 border border-blue-100 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-blue-900 flex items-center gap-1.5">
                    <Icon icon="fluent:info-24-regular" className="w-4.5 h-4.5 text-blue-600" />
                    Clean Product Import Sheet Structure
                  </h4>
                  <p className="text-xs text-blue-700 leading-relaxed max-w-xl">
                    For a clean import, use our template containing name, SKU, price, sale price, stock, category name, colors, sizes, image URLs, and SEO titles/descriptions.
                  </p>
                </div>
                <button
                  onClick={downloadSampleExcel}
                  className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-all shrink-0"
                >
                  <Icon icon="fluent:arrow-download-16-regular" className="w-4 h-4" />
                  Download Sample Template
                </button>
              </div>

              {/* Upload Dropzone */}
              <div className="border-2 border-dashed border-gray-300 hover:border-blue-500 rounded-3xl p-8 transition-colors flex flex-col items-center justify-center gap-3 relative bg-gray-50/55 hover:bg-gray-50">
                <input
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  onChange={handleExcelUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <Icon icon="fluent:cloud-backup-48-regular" className="w-12 h-12 text-gray-400" />
                <div className="text-center">
                  <p className="text-sm font-bold text-gray-700">
                    {bulkImportFile ? `Selected: ${bulkImportFile.name}` : 'Click or Drag & Drop Excel/CSV File here'}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">Supports .xlsx, .xls, and .csv formats up to 5MB</p>
                </div>
              </div>

              {/* Validation Preview Table */}
              {bulkParsedProducts.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-gray-900">
                      Parsed Products Preview ({bulkParsedProducts.length} items found)
                    </h4>
                    <span className="text-xs text-gray-500 font-semibold bg-gray-100 px-2 py-0.5 rounded-md">
                      {bulkParsedProducts.filter(p => p.isValid).length} Valid • {bulkParsedProducts.filter(p => !p.isValid).length} Invalid
                    </span>
                  </div>

                  <div className="border border-gray-200 rounded-2xl overflow-hidden max-h-[300px] overflow-y-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-gray-200 bg-gray-50 text-gray-500 font-bold uppercase">
                          <th className="px-4 py-3">Status</th>
                          <th className="px-4 py-3">Product details</th>
                          <th className="px-4 py-3">Price / Stock</th>
                          <th className="px-4 py-3">Category</th>
                          <th className="px-4 py-3">SEO Fields</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {bulkParsedProducts.map((p, idx) => (
                          <tr key={idx} className={p.isValid ? 'hover:bg-gray-50/50' : 'bg-rose-50/30'}>
                            <td className="px-4 py-3">
                              {p.isValid ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100 uppercase tracking-wide">
                                  <Icon icon="fluent:checkmark-circle-16-regular" className="w-3.5 h-3.5 text-emerald-500" />
                                  Ready
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-100 uppercase tracking-wide">
                                  <Icon icon="fluent:error-circle-16-regular" className="w-3.5 h-3.5 text-rose-500" />
                                  Missing info
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <p className="font-bold text-gray-800">{p.name || '—'}</p>
                              <p className="text-gray-400 font-mono text-[10px]">SKU: {p.sku || 'Auto'}</p>
                            </td>
                            <td className="px-4 py-3">
                              <p className="font-semibold text-gray-800">Rs. {p.price || 0}</p>
                              <p className="text-gray-500">Qty: {p.stock || 0}</p>
                            </td>
                            <td className="px-4 py-3 font-semibold text-gray-700">{p.category_name || '—'}</td>
                            <td className="px-4 py-3 max-w-[200px] truncate">
                              <span className="text-[10px] text-gray-500 font-mono animate-pulse" title={p.seo_title || 'No SEO Title'}>
                                {p.seo_title ? `Title: ${p.seo_title}` : 'No SEO title'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4.5 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-3 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setIsBulkImportOpen(false)
                  setBulkImportFile(null)
                  setBulkParsedProducts([])
                }}
                className="px-5 py-2.5 text-sm font-semibold border border-gray-200 text-gray-555 hover:text-gray-955 rounded-xl hover:bg-gray-50 transition-colors bg-white"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={bulkImportLoading || bulkParsedProducts.filter(p => p.isValid).length === 0}
                onClick={submitBulkImport}
                className="px-5 py-2.5 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {bulkImportLoading ? 'Processing...' : `Import ${bulkParsedProducts.filter(p => p.isValid).length} Products`}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  )
}
