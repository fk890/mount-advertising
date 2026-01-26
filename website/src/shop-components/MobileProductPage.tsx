"use client"

import React, { useState, useEffect } from 'react'
import { ChevronLeft, Heart, Share2, Star, ChevronDown, ChevronUp, Truck, Shield, RotateCcw, Sparkles, ZoomIn, X, ChevronRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import AddToCartModal from './AddToCartModal'
import { addToCart, addToWishlist, removeFromWishlist, getWishlist } from '@/shop-utils/cartWishlist'

interface Product {
  id: string
  name: string
  price: string | number
  originalPrice?: string | number
  images: string[]
  description: string
  rating?: number
  reviews?: number
  collection?: string
  articleNo?: string
  inStock?: boolean
  materials?: string
  dimensions?: string
  care?: string
  priceString?: string; // For displaying formatted price
}

interface MobileProductPageProps {
  product: Product
}

interface ExpansionSection {
  title: string
  content: React.ReactNode
  icon: React.ReactNode
}

export default function MobileProductPage({ product }: MobileProductPageProps) {
  const router = useRouter()
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isInWishlist, setIsInWishlist] = useState(false)
  const [showAddToCartModal, setShowAddToCartModal] = useState(false)
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set())
  const [isZoomed, setIsZoomed] = useState(false)
  const [touchStart, setTouchStart] = useState({ x: 0, y: 0 })

  useEffect(() => {
    setIsInWishlist(getWishlist().some((item: string) => item === product.id))
  }, [product.id])
  const handleAddToCart = () => {
    addToCart({
      id: String(product.id),
      name: product.name,
      price: product.price,
      image: product.images[0],
      quantity: 1
    })
    setShowAddToCartModal(true)
  }

  const handleWishlistToggle = () => {
    if (isInWishlist) {
      removeFromWishlist(product.id)
      setIsInWishlist(false)
    } else {
      addToWishlist(product.id)
      setIsInWishlist(true)
    }
  }

  const handleImageClick = () => {
    setIsZoomed(true)
  }

  const handleZoomClose = () => {
    setIsZoomed(false)
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart({
      x: e.touches[0].clientX,
      y: e.touches[0].clientY
    })
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    const deltaX = touchStart.x - e.changedTouches[0].clientX
    const deltaY = Math.abs(touchStart.y - e.changedTouches[0].clientY)
    
    // Only trigger swipe if horizontal movement is greater than vertical
    if (Math.abs(deltaX) > 50 && deltaY < 100) {
      if (deltaX > 0 && currentImageIndex < product.images.length - 1) {
        // Swipe left - next image
        setCurrentImageIndex(currentImageIndex + 1)
      } else if (deltaX < 0 && currentImageIndex > 0) {
        // Swipe right - previous image
        setCurrentImageIndex(currentImageIndex - 1)
      }
    }
  }

  const toggleSection = (index: number) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(index)) {
      newExpanded.delete(index)
    } else {
      newExpanded.add(index)
    }
    setExpandedSections(newExpanded)
  }

  const expansionSections: ExpansionSection[] = [
    {
      title: "Shipping & returns",
      icon: <Truck className="h-5 w-5" />,
      content: (
        <div className="space-y-3 text-sm text-gray-600">
          <div className="flex items-start space-x-3">
            <Truck className="h-4 w-4 mt-0.5 text-gray-400" />
            <div>
              <p className="font-medium text-gray-900">Free shipping</p>
              <p>On orders over $100. Standard delivery in 3-5 business days.</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <RotateCcw className="h-4 w-4 mt-0.5 text-gray-400" />
            <div>
              <p className="font-medium text-gray-900">Free returns</p>
              <p>30-day return policy. Items must be in original condition.</p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Care & maintenance",
      icon: <Sparkles className="h-5 w-5" />,
      content: (
        <div className="space-y-3 text-sm text-gray-600">
          <p>• Store in a cool, dry place away from direct sunlight</p>
          <p>• Clean gently with a soft cloth</p>
          <p>• Avoid contact with perfumes, lotions, and chemicals</p>
          <p>• Remove before swimming, exercising, or sleeping</p>
          <p className="font-medium text-gray-900 mt-3">Professional cleaning available</p>
        </div>
      )
    },
    {
      title: "Product details",
      icon: <Shield className="h-5 w-5" />,
      content: (
        <div className="space-y-3 text-sm text-gray-600">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="font-medium text-gray-900">Collection</p>
              <p>{product.collection}</p>
            </div>
            <div>
              <p className="font-medium text-gray-900">Article No.</p>
              <p>{product.articleNo}</p>
            </div>
          </div>
          {product.materials && (
            <div>
              <p className="font-medium text-gray-900">Materials</p>
              <p>{product.materials}</p>
            </div>
          )}
          {product.dimensions && (
            <div>
              <p className="font-medium text-gray-900">Dimensions</p>
              <p>{product.dimensions}</p>
            </div>
          )}
        </div>
      )
    }
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => router.back()}
            className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <ChevronLeft className="h-6 w-6 text-gray-700" />
          </button>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleWishlistToggle}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <Heart className={`h-6 w-6 ${isInWishlist ? 'text-red-500 fill-current' : 'text-gray-700'}`} />
            </button>
            <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
              <Share2 className="h-6 w-6 text-gray-700" />
            </button>
          </div>
        </div>
      </div>      {/* Image Carousel */}
      <div className="relative">
        <div 
          className="aspect-square bg-gray-50 overflow-hidden relative cursor-zoom-in"
          onClick={handleImageClick}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <Image
            src={product.images[currentImageIndex]}
            alt={product.name}
            fill
            className="w-full h-full object-cover"
          />
          
          {/* Zoom Icon Overlay */}
          <div className="absolute top-4 right-4 bg-black/50 rounded-full p-2">
            <ZoomIn className="h-5 w-5 text-white" />
          </div>
        </div>
        
        {/* Image Indicators */}
        {product.images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {product.images.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  currentImageIndex === index ? 'bg-white' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        )}

        {/* Image Navigation */}
        {product.images.length > 1 && (
          <>
            <button
              onClick={() => setCurrentImageIndex(Math.max(0, currentImageIndex - 1))}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 p-2 rounded-full bg-white/80 backdrop-blur-sm shadow-sm"
              disabled={currentImageIndex === 0}
            >
              <ChevronLeft className="h-5 w-5 text-gray-700" />
            </button>
            <button
              onClick={() => setCurrentImageIndex(Math.min(product.images.length - 1, currentImageIndex + 1))}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 rounded-full bg-white/80 backdrop-blur-sm shadow-sm"
              disabled={currentImageIndex === product.images.length - 1}
            >
              <ChevronLeft className="h-5 w-5 text-gray-700 rotate-180" />
            </button>
          </>
        )}
      </div>

      {/* Product Info */}
      <div className="px-4 py-6">
        <h1 className="text-2xl font-serif font-medium text-gray-900 mb-2">
          {product.name}
        </h1>
        
        <div className="flex items-center space-x-3 mb-4">
          <div className="flex items-center space-x-1">
            <div className="flex">
              {[0, 1, 2, 3, 4].map((rating) => (
                <Star
                  key={rating}
                  className={`h-4 w-4 ${
                    (product.rating || 5) > rating
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-600">({product.reviews})</span>
          </div>
        </div>

        <div className="flex items-center space-x-3 mb-6">
          <span className="text-2xl font-serif font-medium text-gray-900">
            {product.price}
          </span>
          {product.originalPrice && (
            <span className="text-lg text-gray-500 line-through">
              {product.originalPrice}
            </span>
          )}
        </div>

        <p className="text-gray-600 leading-relaxed mb-6">
          {product.description}
        </p>

        {/* Expandable Sections */}
        <div className="space-y-1 mb-8">
          {expansionSections.map((section, index) => (
            <div key={index} className="border-b border-gray-200">
              <button
                onClick={() => toggleSection(index)}
                className="w-full flex items-center justify-between py-4 text-left"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-gray-400">{section.icon}</span>
                  <span className="font-medium text-gray-900">{section.title}</span>
                </div>
                {expandedSections.has(index) ? (
                  <ChevronUp className="h-5 w-5 text-gray-400" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                )}
              </button>
              {expandedSections.has(index) && (
                <div className="pb-4 pl-8">
                  {section.content}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Fixed Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-30">
        <button
          onClick={handleAddToCart}
          disabled={!product.inStock}
          className="w-full bg-gray-900 text-white py-4 rounded-full font-medium text-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-800 transition-colors"
        >
          {product.inStock ? 'Add to bag' : 'Out of stock'}
        </button>
      </div>      {/* Add to Cart Modal */}
      <AddToCartModal
        isOpen={showAddToCartModal}
        onClose={() => setShowAddToCartModal(false)}
        productName={product.name}
        productImage={product.images[0]}
        productPrice={product.priceString || (typeof product.price === 'string' ? product.price : `$${product.price}`)}
      />

      {/* Zoom Modal */}
      {isZoomed && (
        <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
          <div className="relative w-full h-full">
            {/* Close Button */}
            <button
              onClick={handleZoomClose}
              className="absolute top-4 right-4 z-10 text-white bg-black/50 rounded-full p-2"
            >
              <X className="h-6 w-6" />
            </button>
            
            {/* Zoomed Image */}
            <div 
              className="w-full h-full flex items-center justify-center"
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              <div className="relative max-w-full max-h-full">
                <Image
                  src={product.images[currentImageIndex]}
                  alt={product.name}
                  width={400}
                  height={400}
                  className="max-w-full max-h-full object-contain"
                  style={{
                    width: 'auto',
                    height: 'auto',
                    maxWidth: '95vw',
                    maxHeight: '95vh'
                  }}
                />
              </div>
            </div>
            
            {/* Image Counter */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm bg-black/50 px-3 py-1 rounded-full">
              {currentImageIndex + 1} of {product.images.length}
            </div>
            
            {/* Navigation for multiple images */}
            {product.images.length > 1 && (
              <>
                <button
                  onClick={() => setCurrentImageIndex(Math.max(0, currentImageIndex - 1))}
                  disabled={currentImageIndex === 0}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full disabled:opacity-50"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  onClick={() => setCurrentImageIndex(Math.min(product.images.length - 1, currentImageIndex + 1))}
                  disabled={currentImageIndex === product.images.length - 1}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full disabled:opacity-50"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Bottom padding to account for fixed CTA */}
      <div className="h-20" />
    </div>
  )
}
