'use client'

import Image from 'next/image'
import Link from 'next/link'

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
  return (
    <div className="w-full bg-black py-8">
      <div className="max-w-[1400px] mx-auto px-4">
        <div className="flex items-center justify-start gap-12 overflow-x-auto scrollbar-hide">
          {circles.map((circle) => (
            <Link
              key={circle.name}
              href={circle.href}
              className="flex flex-col items-center gap-3 shrink-0 group"
            >
              {/* Circle with image */}
              <div className={`relative w-24 h-24 rounded-full overflow-hidden ${
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
              <span className={`text-sm font-medium ${
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
