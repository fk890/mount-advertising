'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import styles from './cart.module.scss'

type CartItem = {
  id: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  collection?: string;
}

export default function Cart() {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [promoCode, setPromoCode] = useState('')
  const [appliedPromo, setAppliedPromo] = useState<{code: string, discount: number} | null>(null)
  const [promoError, setPromoError] = useState('')

  const fetchProductDetails = async (id: string | number) => {
    try {
      const response = await fetch(`/api/products?id=${id}`)
      if (response.ok) {
        const data = await response.json()
        const product = data.product
        if (product) {
          return {
            id: product.id,
            name: product.name || "Product",
            image: product.image || (product.images && product.images.length > 0 && product.images[0]) || '/images/world.svg',
            price: typeof product.price === 'number' ? product.price : parseFloat(String(product.price || '0').replace(/[$,]/g, '')) || 0,
            quantity: 1,
            collection: product.collection
          }
        }
      }
      
      // If we couldn't fetch the product or it doesn't exist, create a fallback product
      console.warn(`Product ${id} could not be found. Using fallback.`);
      return {
        id: String(id),
        name: "Advertising Product",
        image: '/images/world.svg',
        price: 0,
        quantity: 1,
        collection: "Collections"
      }
    } catch (error) {
      console.error(`Error fetching product ${id}:`, error)
      // Return a fallback product instead of null
      return {
        id: String(id),
        name: "Advertising Product",
        image: '/images/world.svg',
        price: 0,
        quantity: 1,
        collection: "Collections"
      }
    }
  }

  useEffect(() => {
    const loadCart = async () => {
      setIsLoading(true)
      try {
        const storedCart = JSON.parse(localStorage.getItem('cart') || '[]')
        const storedPromo = localStorage.getItem('appliedPromo')
        if (storedPromo) {
          setAppliedPromo(JSON.parse(storedPromo))
        }

        if (storedCart.length > 0) {
          const loadedItems: CartItem[] = []
          for (const item of storedCart) {
            if (typeof item === 'string' || typeof item === 'number') {
              const product = await fetchProductDetails(item)
              if (product) loadedItems.push(product)
            } else if (typeof item === 'object' && item.id) {
              const product = {
                ...item,
                price: typeof item.price === 'number' ? item.price : parseFloat(String(item.price).replace(/[$,]/g, '')) || 0,
              }
              loadedItems.push(product)
            }
          }
          
          const consolidatedCart = loadedItems.reduce((acc, current) => {
            const existingItem = acc.find(item => item.id === current.id)
            if (existingItem) {
              existingItem.quantity += current.quantity
            } else {
              acc.push(current)
            }
            return acc
          }, [] as CartItem[])

          setCartItems(consolidatedCart)
          localStorage.setItem('cart', JSON.stringify(consolidatedCart))
        }
      } catch (error) {
        console.error('Error loading cart:', error)
        setCartItems([])
      } finally {
        setIsLoading(false)
      }
    }
    loadCart()
  }, [])

  const updateCart = useCallback((updatedCart: CartItem[]) => {
    const filteredCart = updatedCart.filter(item => item.quantity > 0)
    setCartItems(filteredCart)
    localStorage.setItem('cart', JSON.stringify(filteredCart))
    window.dispatchEvent(new Event('cartWishlistUpdate'))
  }, [])

  const handleRemoveFromCart = useCallback((productId: string) => {
    const updatedCart = cartItems.filter(item => item.id !== productId)
    updateCart(updatedCart)
  }, [cartItems, updateCart])

  const handleQuantityChange = useCallback((productId: string, newQuantity: number) => {
    const updatedCart = cartItems.map(item =>
      item.id === productId ? { ...item, quantity: newQuantity } : item
    )
    updateCart(updatedCart)
  }, [cartItems, updateCart])

  const handlePromoCode = useCallback(() => {
    setPromoError('')
    if (!promoCode.trim()) {
      setPromoError('Please enter a promo code')
      return
    }
    const code = promoCode.trim().toUpperCase()
    if (code === 'MOUNTNEW') {
      const promoData = { code: 'MOUNTNEW', discount: 0.05 }
      setAppliedPromo(promoData)
      localStorage.setItem('appliedPromo', JSON.stringify(promoData))
      setPromoCode('')
    } else if (code === 'WELCOME10') {
      const promoData = { code: 'WELCOME10', discount: 0.10 }
      setAppliedPromo(promoData)
      localStorage.setItem('appliedPromo', JSON.stringify(promoData))
      setPromoCode('')
    } else {
      setPromoError('Invalid promo code')
      setAppliedPromo(null)
      localStorage.removeItem('appliedPromo')
    }
  }, [promoCode])

  const handleRemovePromo = useCallback(() => {
    setAppliedPromo(null)
    setPromoCode('')
    setPromoError('')
    localStorage.removeItem('appliedPromo')
  }, [])

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const promoDiscount = appliedPromo ? subtotal * appliedPromo.discount : 0
  const total = subtotal - promoDiscount

  if (isLoading) {
    return (
      <div className={styles.loading}>
        <div>
          <div className={styles.spinner} />
          <p className={styles.loadingText}>Loading cart...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <h1 className={styles.title} style={{ fontFamily: 'var(--font-cormorant)' }}>Shopping Cart</h1>
          <p className={styles.subtitle} style={{ fontFamily: 'var(--font-cormorant)' }}>Review your selected advertising products</p>
        </div>
        
        {cartItems.length === 0 ? (
          /* Empty Cart */
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={styles.empty}
          >
            <div className={styles.emptyEmoji}>🛍️</div>
            <h2 className={styles.emptyTitle} style={{ fontFamily: 'var(--font-cormorant)' }}>Your cart is empty</h2>
            <p className={styles.emptySubtitle} style={{ fontFamily: 'var(--font-cormorant)' }}>Discover our premium advertising products</p>
            <Link 
              href="/shop" 
              className={styles.primaryButton}
            >
              Browse Products
              <span style={{ marginLeft: '8px' }}>→</span>
            </Link>
          </motion.div>
        ) : (
          <div className={styles.grid}>
            {/* Cart Items */}
            <div className={styles.items}>
              {cartItems.map((item, index) => (
                <motion.div
                  key={`${item.id}-${index}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={styles.itemCard}
                >
                  <div className={styles.itemRow}>
                    {/* Product Image */}
                    <div className={styles.itemImage}>
                      <Image
                        src={item.image || '/shop/placeholder.webp'}
                        alt={item.name || 'Product image'}
                        fill
                        style={{ objectFit: 'contain', padding: '8px' }}
                        sizes="112px"
                        onError={(e) => { (e.target as HTMLImageElement).src = '/shop/placeholder.webp'; }}
                      />
                    </div>
                    
                    {/* Product Details */}
                    <div className={styles.itemBody}>
                      <div className={styles.itemHeader}>
                        <div>
                          <Link href={`/shop/product/${item.id}`}>
                            <h3 className={styles.itemName} style={{ fontFamily: 'var(--font-cormorant)' }}>{item.name}</h3>
                          </Link>
                          {item.collection && (
                            <p className={styles.itemCollection} style={{ fontFamily: 'var(--font-cormorant)' }}>{item.collection}</p>
                          )}
                          <p className={styles.itemPrice} style={{ fontFamily: 'var(--font-cormorant)' }}>
                            ${typeof item.price === 'number' ? item.price.toLocaleString() : '0.00'}
                          </p>
                        </div>
                        
                        <button
                          onClick={() => handleRemoveFromCart(item.id)}
                          className={styles.removeButton}
                        >
                          <span style={{ fontSize: '20px' }}>✕</span>
                        </button>
                      </div>
                      
                      {/* Quantity Controls */}
                      <div className={styles.quantityRow}>
                        <div className={styles.quantityGroup}>
                          <span className={styles.quantityLabel} style={{ fontFamily: 'var(--font-cormorant)' }}>Quantity:</span>
                          <div className={styles.quantityControl}>
                            <button
                              onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                              className={styles.quantityButton}
                            >
                              <span style={{ fontSize: '16px' }}>−</span>
                            </button>
                            <span className={styles.quantityValue} style={{ fontFamily: 'var(--font-cormorant)' }}>
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                              className={styles.quantityButton}
                            >
                              <span style={{ fontSize: '16px' }}>+</span>
                            </button>
                          </div>
                        </div>
                        
                        <div className={styles.itemTotal}>
                          <p className={styles.itemTotalAmount} style={{ fontFamily: 'var(--font-cormorant)' }}>
                            ${(item.price * item.quantity).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            
            {/* Order Summary */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className={styles.summaryCard}
            >
              <h2 className={styles.summaryTitle} style={{ fontFamily: 'var(--font-cormorant)' }}>Order Summary</h2>
              <div className={styles.summaryRows}>
                <div className={styles.summaryRow} style={{ fontFamily: 'var(--font-cormorant)' }}>
                  <span>Subtotal ({cartItems.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
                  <strong>${subtotal.toLocaleString()}</strong>
                </div>
                <div className={styles.summaryRow} style={{ fontFamily: 'var(--font-cormorant)' }}>
                  <span>Shipping</span>
                  <span style={{ color: '#4ade80', fontWeight: 600 }}>Free</span>
                </div>
                {appliedPromo && (
                  <div className={styles.summaryRow} style={{ fontFamily: 'var(--font-cormorant)' }}>
                    <div>
                      <span style={{ color: '#4ade80' }}>Promo ({appliedPromo.code})</span>
                      <button
                        onClick={handleRemovePromo}
                        className={styles.removeButton}
                        style={{ marginLeft: 8, fontSize: 12 }}
                      >
                        Remove
                      </button>
                    </div>
                    <span style={{ color: '#4ade80' }}>-${promoDiscount.toLocaleString()}</span>
                  </div>
                )}
                <div className={styles.summaryTotal} style={{ fontFamily: 'var(--font-cormorant)' }}>
                  <span>Total</span>
                  <span>${total.toLocaleString()}</span>
                </div>
              </div>
                
                {/* Promo Code Section */}
              <div className={styles.promoSection}>
                <h3 className={styles.promoTitle} style={{ fontFamily: 'var(--font-cormorant)' }}>Promo Code</h3>
                <div className={styles.promoRow}>
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="Enter promo code"
                    className={styles.promoInput}
                    onKeyPress={(e) => e.key === 'Enter' && handlePromoCode()}
                  />
                  <button
                    onClick={handlePromoCode}
                    className={styles.promoButton}
                  >
                    Apply
                  </button>
                </div>
                {promoError && (
                  <p className={`${styles.promoMessage} ${styles.promoError}`} style={{ fontFamily: 'var(--font-cormorant)' }}>{promoError}</p>
                )}
                {appliedPromo && (
                  <p className={`${styles.promoMessage} ${styles.promoSuccess}`} style={{ fontFamily: 'var(--font-cormorant)' }}>
                    ✓ Promo code {appliedPromo.code} applied ({Math.round(appliedPromo.discount * 100)}% off)
                  </p>
                )}
              </div>
                
                {/* Action Buttons */}
              <div className={styles.actionButtons}>
                <Link
                  href="/shop/checkout"
                  className={styles.actionButtonPrimary}
                >
                  Proceed to Checkout
                </Link>
                <Link
                  href="/shop"
                  className={styles.actionButtonSecondary}
                >
                  Continue Shopping
                </Link>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  )
}
