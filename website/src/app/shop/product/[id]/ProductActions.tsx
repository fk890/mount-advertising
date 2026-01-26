'use client'

import { useState, useEffect } from 'react'
import { Heart, ShoppingBag } from 'lucide-react'
import { 
  addToCart, 
  addToWishlist, 
  removeFromWishlist, 
  getWishlist 
} from '@/shop-utils/cartWishlist'
import { Product } from '@/shop-types/Product'

interface ProductActionsProps {
  product: Product
}

export default function ProductActions({ product }: ProductActionsProps) {
  const [isInWishlist, setIsInWishlist] = useState(false)
  const [isAddingToCart, setIsAddingToCart] = useState(false)

  useEffect(() => {
    setIsInWishlist(getWishlist().some((item: string) => item === product.id))
  }, [product.id])
  const handleAddToCart = () => {
    setIsAddingToCart(true)
    addToCart({
      id: String(product.id),
      name: product.name,
      price: product.price,
      image: product.images?.[0] || '/images/world.svg',
      quantity: 1
    })
    setTimeout(() => setIsAddingToCart(false), 500)
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

  return (
    <div className="flex space-x-4">
      <button
        onClick={handleAddToCart}
        disabled={isAddingToCart}
        className="flex-1 bg-gray-900 text-white px-8 py-4 rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
      >
        <ShoppingBag className="h-5 w-5" />
        <span>{isAddingToCart ? 'Adding...' : 'Add to Cart'}</span>
      </button>
      
      <button
        onClick={handleWishlistToggle}
        className={`p-4 rounded-lg border-2 transition-colors ${
          isInWishlist 
            ? 'border-red-500 text-red-500 bg-red-50' 
            : 'border-gray-300 text-gray-600 hover:border-gray-400'
        }`}
      >
        <Heart className={`h-5 w-5 ${isInWishlist ? 'fill-current' : ''}`} />
      </button>
    </div>
  )
}
