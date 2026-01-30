"use client"

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState, useRef } from 'react'
import ProductCard from '@/shop-components/ProductCard'
import { ChevronLeft, ChevronRight } from 'lucide-react'

type ApiProduct = {
  id: string
  name: string
  description?: string
  price: number
  images?: string[]
  category?: string
  collection?: string
}

const featuredFallbackProducts: ApiProduct[] = [
  {
    id: 'cafe-pizza-sandwich-neon-sign',
    name: 'Pizza Sandwich Neon Sign',
    price: 4999,
    images: ['/shop/Cafe_LED_4_1.webp'],
    category: 'cafe',
    collection: 'cafe'
  },
  {
    id: 'gaming-custom-neon-sign',
    name: 'Gaming Neon Sign',
    price: 5499,
    images: ['/shop/gaming-custom.webp'],
    category: 'gaming',
    collection: 'gaming'
  }
]

const categories = [
  { name: 'Shop All', href: '/shop', image: '/shop/customise-your-own.webp', active: true },
  { name: 'Cafe', href: '/shop/cafe', image: '/shop/circle-cafe.webp', active: false },
  { name: 'Gaming', href: '/shop/gaming', image: '/shop/circle-gaming.webp', active: false },
]

export default function ShopPageContent() {
  const [randomProducts, setRandomProducts] = useState<ApiProduct[]>(featuredFallbackProducts)
  const [loading, setLoading] = useState(false)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const checkScrollability = () => {
    const container = scrollContainerRef.current
    if (container) {
      setCanScrollLeft(container.scrollLeft > 0)
      setCanScrollRight(
        container.scrollLeft < container.scrollWidth - container.clientWidth - 10
      )
    }
  }

  useEffect(() => {
    checkScrollability()
    const container = scrollContainerRef.current
    if (container) {
      container.addEventListener('scroll', checkScrollability)
      window.addEventListener('resize', checkScrollability)
    }
    return () => {
      if (container) {
        container.removeEventListener('scroll', checkScrollability)
      }
      window.removeEventListener('resize', checkScrollability)
    }
  }, [])

  const scroll = (direction: 'left' | 'right') => {
    const container = scrollContainerRef.current
    if (container) {
      const scrollAmount = 150
      container.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      })
    }
  }

  useEffect(() => {
    const fetchRandomProducts = async () => {
      setLoading(true)
      try {
        const response = await fetch('/api/products?limit=20')
        if (!response.ok) {
          setLoading(false)
          return
        }
        const data = await response.json()
        const products: ApiProduct[] = data.products || []
        
        // Filter to only cafe and gaming items, exclude customise products
        const filtered = products.filter((product) => {
          const category = (product.category || '').toLowerCase().trim()
          const collection = (product.collection || '').toLowerCase().trim()
          const id = product.id?.toLowerCase() || ''
          const name = product.name?.toLowerCase() || ''
          
          // Exclude neon-signage, led-boards, and "customise" products
          const isExcluded = 
            category === 'neon-signage' || 
            category === 'led-boards' || 
            collection === 'neon-signage' || 
            collection === 'led-boards' ||
            name.includes('customise') ||
            name.includes('customize')
            
          const isCafe = category === 'cafe' || collection === 'cafe' || id.startsWith('cafe-')
          const isGaming = category === 'gaming' || collection === 'gaming' || id.startsWith('gaming-')
          return !isExcluded && (isCafe || isGaming)
        })
        
        const unique = Array.from(
          new Map(
            filtered.map((p) => {
              const key = (p.name || p.id || '').toLowerCase().trim()
              return [key, p]
            })
          ).values()
        )

        const cafeItem = unique.find((p) => (p.category || '').toLowerCase().includes('cafe') || (p.collection || '').toLowerCase().includes('cafe') || p.id.toLowerCase().startsWith('cafe-'))
        const gamingItem = unique.find((p) => (p.category || '').toLowerCase().includes('gaming') || (p.collection || '').toLowerCase().includes('gaming') || p.id.toLowerCase().startsWith('gaming-'))

        const picked: ApiProduct[] = []
        if (cafeItem) picked.push(cafeItem)
        if (gamingItem && gamingItem.id !== cafeItem?.id) picked.push(gamingItem)

        if (picked.length < 2) {
          const remaining = unique.filter((p) => !picked.some((q) => q.id === p.id))
          picked.push(...remaining.slice(0, 2 - picked.length))
        }

        const result = picked.slice(0, 2)
        if (result.length > 0) {
          setRandomProducts(result)
        }
      } catch (error) {
        console.error('Failed to load random products', error)
      } finally {
        setLoading(false)
      }
    }
    fetchRandomProducts()
  }, [])

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#000' }}>
      {/* Category Circles Row - Scrollable */}
      <div className="w-full bg-black py-6 sm:py-8 relative">
        <div className="max-w-[1400px] mx-auto px-4">
          {/* Scroll Left Button */}
          {canScrollLeft && (
            <button
              onClick={() => scroll('left')}
              className="absolute left-1 sm:left-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-900/90 hover:bg-gray-800 flex items-center justify-center transition-all shadow-lg border border-gray-700"
              aria-label="Scroll left"
            >
              <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </button>
          )}

          {/* Scroll Right Button */}
          {canScrollRight && (
            <button
              onClick={() => scroll('right')}
              className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-900/90 hover:bg-gray-800 flex items-center justify-center transition-all shadow-lg border border-gray-700"
              aria-label="Scroll right"
            >
              <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </button>
          )}

          {/* Scrollable container */}
          <div 
            ref={scrollContainerRef}
            className="flex items-center gap-4 sm:gap-6 md:gap-12 overflow-x-auto scroll-smooth pb-2 px-2"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              WebkitOverflowScrolling: 'touch',
            }}
          >
            {categories.map((cat) => (
              <Link 
                key={cat.name} 
                href={cat.href} 
                className="flex flex-col items-center gap-2 sm:gap-3 shrink-0 group"
              >
                <div className={`relative w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full overflow-hidden transition-all duration-200 ${
                  cat.active 
                    ? 'ring-[3px] ring-[#c8ff00] ring-offset-2 ring-offset-black' 
                    : 'ring-2 ring-gray-600 group-hover:ring-gray-400'
                }`}>
                  <Image
                    src={cat.image}
                    alt={cat.name}
                    fill
                    style={{ objectFit: 'cover' }}
                    sizes="96px"
                  />
                </div>
                <span className={`text-xs sm:text-sm font-medium whitespace-nowrap ${
                  cat.active ? 'text-[#c8ff00]' : 'text-white group-hover:text-gray-300'
                }`}>
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Product Grid - Responsive */}
      <div className="max-w-[1400px] mx-auto px-3 sm:px-4 py-6 sm:py-8">
        {/* Section Title */}
        <h2 className="text-white text-lg sm:text-xl font-semibold mb-4 sm:mb-6">
          Shop All<span className="text-[#c8ff00]">Cafe</span><span className="text-white">Gaming</span>
        </h2>
        
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-[4px]">
          {/* Hardcoded Custom Products */}
          <ProductCard
            href="/shop/neon-signage"
            name="Customise Neon Sign"
            image="/shop/customise-your-own.webp"
            price={3000}
            originalPrice={4285}
            priority
          />
          <ProductCard
            href="/shop/led-boards"
            name="Customise LED Signage Board"
            image="/shop/customise-your-own.webp"
            price={3000}
            originalPrice={4285}
            priority
          />
          {/* Dynamic Products from API */}
          {randomProducts.map((product) => (
            <ProductCard
              key={product.id}
              href={product.id.startsWith('cafe-') ? `/shop/cafe/${product.id}` : `/shop/gaming/${product.id}`}
              name={product.name}
              image={product.images?.[0] || '/shop/placeholder.webp'}
              price={product.price}
              priority
            />
          ))}
          {/* Show loading skeleton while products load */}
          {loading && randomProducts.length === 0 && (
            <>
              <div className="aspect-square bg-gray-900 animate-pulse rounded-lg" />
              <div className="aspect-square bg-gray-900 animate-pulse rounded-lg" />
            </>
          )}
        </div>
      </div>
    </div>
  )
}
