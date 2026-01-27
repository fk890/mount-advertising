'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { getCart, removeFromCart, updateCartItem } from '@/shop-utils/cartWishlist'
import styles from './slide-cart.module.scss'

// Inline SVG Icons to avoid lucide-react JSX issues
const XIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
  </svg>
)

const PlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14"/><path d="M12 5v14"/>
  </svg>
)

const MinusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14"/>
  </svg>
)

const ShoppingBagIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>
  </svg>
)

const GiftIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13"/><path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"/><path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5"/>
  </svg>
)

type CartItem = {
  id: string
  name: string
  image: string
  price: number
  quantity: number
  customization?: {
    color?: string
    size?: string
    dimensions?: string
    addOns?: string[]
  }
}

interface SlideCartProps {
  isOpen: boolean
  onClose: () => void
}

export function SlideCart({ isOpen, onClose }: SlideCartProps) {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const loadCart = useCallback(() => {
    setIsLoading(true)
    try {
      const storedCart = getCart()
      const processedItems = storedCart.map((item: any) => ({
        id: item.id,
        name: item.name || 'Product',
        image: item.image || '/shop/placeholder.webp',
        price: typeof item.price === 'number' ? item.price : parseFloat(String(item.price).replace(/[₹$,]/g, '')) || 0,
        quantity: item.quantity || 1,
        customization: item.customization
      }))
      setCartItems(processedItems)
    } catch (error) {
      console.error('Error loading cart:', error)
      setCartItems([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadCart()
    const handleCartUpdate = () => loadCart()
    window.addEventListener('cartUpdated', handleCartUpdate)
    window.addEventListener('cartWishlistUpdate', handleCartUpdate)
    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate)
      window.removeEventListener('cartWishlistUpdate', handleCartUpdate)
    }
  }, [loadCart])

  useEffect(() => {
    if (isOpen) {
      loadCart()
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen, loadCart])

  const handleRemove = (id: string) => {
    removeFromCart(id)
    loadCart()
  }

  const handleQuantityChange = (id: string, newQuantity: number) => {
    if (newQuantity < 1) {
      handleRemove(id)
      return
    }
    updateCartItem(id, { quantity: newQuantity })
    loadCart()
  }

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0)

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div 
        className={styles.backdrop}
        onClick={onClose}
      />

      {/* Slide-in Panel */}
      <div 
        className={styles.panel}
        style={{ transform: isOpen ? 'translateX(0)' : 'translateX(100%)' }}
      >
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerTitle}>
            <ShoppingBagIcon className={styles.iconSmall} />
            <span style={{ fontFamily: 'var(--font-basement-grotesque)' }}>
              {itemCount} {itemCount === 1 ? 'item' : 'items'}
            </span>
          </div>
          <button 
            onClick={onClose}
            className={styles.iconButton}
          >
            <XIcon />
          </button>
        </div>

        {/* Free offer banner */}
        <div className={styles.freeBanner}>
          <div className={styles.freeBannerInner}>
            <div className={styles.freeIcon}>
              <GiftIcon />
            </div>
            <div>
              <p className={styles.freeTitle}>Claim your FREE Remote Control worth ₹1500</p>
              <button className={styles.freeLink}>ADD FOR FREE</button>
            </div>
          </div>
        </div>

        {/* Cart Items */}
        <div className={styles.content}>
          {isLoading ? (
            <div className={styles.loading}>Loading cart...</div>
          ) : cartItems.length === 0 ? (
            <div className={styles.empty}>
              <ShoppingBagIcon className={styles.iconLarge} />
              <p className={styles.emptyTitle}>Your cart is empty</p>
              <p className={styles.emptySubtitle}>Add some amazing products to get started!</p>
              <button
                onClick={onClose}
                className={styles.emptyButton}
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className={styles.items}>
              {cartItems.map((item) => (
                <div key={item.id} className={styles.itemCard}>
                  <div className={styles.itemRow}>
                    {/* Product Image */}
                    <div className={styles.itemImage}>
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        style={{ objectFit: 'contain', padding: '8px' }}
                        sizes="96px"
                      />
                    </div>
                    
                    {/* Product Info */}
                    <div className={styles.itemInfo}>
                      <h3 className={styles.itemName}>
                        {item.name}
                      </h3>
                      {item.customization && (
                        <p className={styles.itemMeta}>
                          {item.customization.size && `${item.customization.size}`}
                          {item.customization.color && ` • ${item.customization.color}`}
                        </p>
                      )}
                      <p className={styles.itemPrice}>
                        ₹ {item.price.toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>
                  
                  {/* Quantity & Remove */}
                  <div className={styles.itemActions}>
                    <div className={styles.qtyControl}>
                      <button
                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                        className={styles.qtyButton}
                      >
                        <MinusIcon />
                      </button>
                      <span className={styles.qtyValue}>{item.quantity}</span>
                      <button
                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        className={styles.qtyButton}
                      >
                        <PlusIcon />
                      </button>
                    </div>
                    <button
                      onClick={() => handleRemove(item.id)}
                      className={styles.removeButton}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer with Checkout */}
        {cartItems.length > 0 && (
          <div className={styles.footer}>
            {/* Promo Code Banner */}
            <div className={styles.promoBanner}>
              <span style={{ color: '#22c55e', fontSize: 18 }}>🏷️</span>
              <p className={styles.promoText}>
                Use Code <span className="font-bold">&apos;BRIGHT25&apos;</span> to get Extra 25% Off at Checkout
              </p>
            </div>

            {/* Total */}
            <div className={styles.totalRow}>
              <span className={styles.totalLabel}>Subtotal</span>
              <div style={{ textAlign: 'right' }}>
                <span className={styles.totalAmount}>₹ {subtotal.toLocaleString('en-IN')}</span>
                <p className={styles.totalNote}>(Inclusive of all taxes)</p>
              </div>
            </div>

            {/* Checkout Button */}
            <Link href="/shop/checkout" onClick={onClose}>
              <button className={styles.checkoutButton}
                style={{ fontFamily: 'var(--font-basement-grotesque)' }}
              >
                CHECKOUT
              </button>
            </Link>
          </div>
        )}
      </div>
    </>
  )
}
