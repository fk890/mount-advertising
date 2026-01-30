'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRef, useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const circles = [
  {
    name: 'Shop All',
    href: '/shop',
    image: '/shop/customise-your-own.webp',
    isActive: true,
  },
  {
    name: 'Cafe',
    href: '/shop/cafe',
    image: '/shop/circle-cafe.webp',
  },
  {
    name: 'Gaming',
    href: '/shop/gaming',
    image: '/shop/circle-gaming.webp',
  },
]

export function CategoryCircleRow() {
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

  return (
    <div className="w-full bg-black py-8 relative">
      <div className="max-w-[1400px] mx-auto px-4">
        {/* Scroll Left Button */}
        {canScrollLeft && (
          <button
            onClick={() => scroll('left')}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-gray-900/90 hover:bg-gray-800 flex items-center justify-center transition-all shadow-lg border border-gray-700"
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-5 w-5 text-white" />
          </button>
        )}

        {/* Scroll Right Button */}
        {canScrollRight && (
          <button
            onClick={() => scroll('right')}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-gray-900/90 hover:bg-gray-800 flex items-center justify-center transition-all shadow-lg border border-gray-700"
            aria-label="Scroll right"
          >
            <ChevronRight className="h-5 w-5 text-white" />
          </button>
        )}

        {/* Scrollable container */}
        <div 
          ref={scrollContainerRef}
          className="flex items-center gap-6 sm:gap-8 md:gap-12 overflow-x-auto scroll-smooth pb-2"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          <style jsx>{`
            div::-webkit-scrollbar {
              display: none;
            }
          `}</style>
          
          {circles.map((circle) => (
            <Link
              key={circle.name}
              href={circle.href}
              className="flex flex-col items-center gap-3 shrink-0 group"
            >
              {/* Circle with image */}
              <div className={`relative w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden ${
                circle.isActive 
                  ? 'ring-[3px] ring-[#c8ff00] ring-offset-2 ring-offset-black' 
                  : 'ring-2 ring-gray-600 group-hover:ring-gray-400'
              } transition-all duration-200`}>
                <Image
                  src={circle.image}
                  alt={circle.name}
                  fill
                  className="object-cover"
                  sizes="96px"
                />
              </div>
              {/* Label */}
              <span className={`text-xs sm:text-sm font-medium whitespace-nowrap ${
                circle.isActive ? 'text-[#c8ff00]' : 'text-white group-hover:text-gray-300'
              }`}>
                {circle.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
