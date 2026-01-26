"use client"

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import { addToCart } from '@/shop-utils/cartWishlist'

// Neon colors - same as neon signage
const neonColors = [
  { id: 'warm-white', name: 'Warm White', hex: '#FFE4B5' },
  { id: 'white', name: 'White', hex: '#FFFFFF' },
  { id: 'red', name: 'Red', hex: '#FF0000' },
  { id: 'pink', name: 'Pink', hex: '#FF69B4' },
  { id: 'hot-pink', name: 'Hot Pink', hex: '#FF1493' },
  { id: 'orange', name: 'Orange', hex: '#FF4500' },
  { id: 'yellow', name: 'Yellow', hex: '#FFD700' },
  { id: 'green', name: 'Green', hex: '#00FF00' },
  { id: 'blue', name: 'Blue', hex: '#0066FF' },
  { id: 'purple', name: 'Purple', hex: '#9933FF' },
]

// Size options
const sizes = [
  { id: 'small', name: 'Small', dimensions: '12" x 8"', priceMultiplier: 1 },
  { id: 'medium', name: 'Medium', dimensions: '18" x 12"', priceMultiplier: 1.5 },
  { id: 'large', name: 'Large', dimensions: '24" x 16"', priceMultiplier: 2 },
  { id: 'xlarge', name: 'X-Large', dimensions: '36" x 24"', priceMultiplier: 2.8 },
  { id: 'custom', name: 'Custom Size', dimensions: 'Contact for quote', priceMultiplier: 3 },
]

// Add-ons
const addOns = [
  { id: 'dimmer', name: 'Dimmer', price: 500 },
  { id: 'remote', name: 'Remote Control', price: 800 },
  { id: 'acrylic-backing', name: 'Premium Acrylic Backing', price: 1000 },
  { id: 'outdoor', name: 'Outdoor Weatherproof', price: 2000 },
]

interface Product {
  id: string
  name: string
  description: string
  price: number
  images: string[]
  category: string
  specifications?: Record<string, string>
}

type Color = typeof neonColors[number]
type Size = typeof sizes[number]

export default function GamingProductPage() {
  const params = useParams()
  const productId = params.id as string

  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedColor, setSelectedColor] = useState<Color>(neonColors[0]!)
  const [selectedSize, setSelectedSize] = useState<Size>(sizes[1]!) // Medium default
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([])
  const [quantity, setQuantity] = useState(1)
  const [addedToCart, setAddedToCart] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [activeTab, setActiveTab] = useState<'details' | 'specs' | 'shipping'>('details')

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/products?id=${productId}`)
        if (!response.ok) throw new Error('Failed to fetch product')
        const data = await response.json()
        if (data.products && data.products.length > 0) {
          setProduct(data.products[0])
        }
      } catch (error) {
        console.error('Error fetching product:', error)
      } finally {
        setLoading(false)
      }
    }
    if (productId) fetchProduct()
  }, [productId])

  const calculatePrice = () => {
    if (!product) return 0
    let price = product.price * selectedSize.priceMultiplier
    selectedAddOns.forEach(addonId => {
      const addon = addOns.find(a => a.id === addonId)
      if (addon) price += addon.price
    })
    return Math.round(price * quantity)
  }

  const toggleAddOn = (addonId: string) => {
    setSelectedAddOns(prev =>
      prev.includes(addonId)
        ? prev.filter(id => id !== addonId)
        : [...prev, addonId]
    )
  }

  const handleAddToCart = () => {
    if (!product) return
    const cartItem = {
      id: `${product.id}-${Date.now()}`,
      name: product.name,
      price: calculatePrice(),
      image: product.images?.[0] || '/shop/placeholder.webp',
      quantity: quantity,
      customization: {
        color: selectedColor.name,
        size: selectedSize.name,
        dimensions: selectedSize.dimensions,
        addOns: selectedAddOns.map(id => addOns.find(a => a.id === id)?.name).filter(Boolean)
      }
    }
    addToCart(cartItem)
    setAddedToCart(true)
    setTimeout(() => setAddedToCart(false), 3000)
  }

  const getNeonGlowStyle = (hex: string): React.CSSProperties => ({
    boxShadow: `0 0 10px ${hex}, 0 0 20px ${hex}, 0 0 30px ${hex}`,
  })

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#0a0a0a', paddingTop: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#9CA3AF' }}>Loading product...</p>
      </div>
    )
  }

  if (!product) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#0a0a0a', paddingTop: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#9CA3AF' }}>Product not found</p>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0a0a', paddingTop: '100px' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px' }}>
          
          {/* Left Side - Product Images */}
          <div>
            {/* Main Image */}
            <div style={{
              position: 'relative',
              aspectRatio: '1',
              backgroundColor: '#111',
              borderRadius: '12px',
              overflow: 'hidden',
              border: '1px solid #333',
            }}>
              <div style={{
                position: 'absolute',
                inset: 0,
                ...getNeonGlowStyle(selectedColor.hex),
                opacity: 0.3,
                pointerEvents: 'none',
              }} />
              <Image
                src={product.images?.[currentImageIndex] || '/shop/placeholder.webp'}
                alt={product.name}
                fill
                style={{ objectFit: 'contain', padding: '20px' }}
              />
              {/* Color indicator */}
              <div style={{
                position: 'absolute',
                bottom: '16px',
                left: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: 'rgba(0,0,0,0.7)',
                padding: '8px 12px',
                borderRadius: '8px',
              }}>
                <div style={{
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  backgroundColor: selectedColor.hex,
                  boxShadow: `0 0 8px ${selectedColor.hex}`,
                }} />
                <span style={{ color: '#fff', fontSize: '12px' }}>{selectedColor.name}</span>
              </div>
            </div>

            {/* Thumbnail Images */}
            {product.images && product.images.length > 1 && (
              <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                {product.images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    style={{
                      width: '80px',
                      height: '80px',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      border: currentImageIndex === index ? '2px solid #00ff00' : '2px solid #333',
                      backgroundColor: '#111',
                      cursor: 'pointer',
                      position: 'relative',
                    }}
                  >
                    <Image src={img} alt={`${product.name} ${index + 1}`} fill style={{ objectFit: 'cover' }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Side - Product Details & Customization */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Title & Price */}
            <div>
              <p style={{ color: '#9933FF', fontSize: '14px', fontWeight: 500, marginBottom: '8px' }}>GAMING COLLECTION</p>
              <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#fff', marginBottom: '12px' }}>
                {product.name}
              </h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <div style={{ color: '#FBBF24', fontSize: '18px' }}>★★★★★</div>
                <span style={{ color: '#9CA3AF' }}>128 reviews</span>
              </div>
              <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#00ff00' }}>
                ₹ {calculatePrice().toLocaleString()}
              </p>
            </div>

            {/* Description */}
            <p style={{ color: '#9CA3AF', lineHeight: 1.6 }}>
              {product.description}
            </p>

            {/* Select Size */}
            <div>
              <label style={{ display: 'block', color: '#fff', fontWeight: 500, marginBottom: '12px' }}>
                Select Size
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                {sizes.map((size) => (
                  <button
                    key={size.id}
                    onClick={() => setSelectedSize(size)}
                    style={{
                      padding: '12px 8px',
                      borderRadius: '8px',
                      border: selectedSize.id === size.id ? '2px solid #9933FF' : '2px solid #374151',
                      backgroundColor: selectedSize.id === size.id ? 'rgba(153, 51, 255, 0.1)' : '#1a1a1a',
                      color: '#fff',
                      cursor: 'pointer',
                      textAlign: 'center',
                    }}
                  >
                    <span style={{ display: 'block', fontSize: '14px', fontWeight: 600 }}>{size.name}</span>
                    <span style={{ display: 'block', fontSize: '12px', color: '#9CA3AF' }}>{size.dimensions}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Select Color */}
            <div>
              <label style={{ display: 'block', color: '#fff', fontWeight: 500, marginBottom: '12px' }}>
                Select Neon Colour
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {neonColors.map((color) => (
                  <button
                    key={color.id}
                    onClick={() => setSelectedColor(color)}
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      backgroundColor: color.hex,
                      border: selectedColor.id === color.id ? '3px solid #fff' : '2px solid #333',
                      cursor: 'pointer',
                      transform: selectedColor.id === color.id ? 'scale(1.15)' : 'scale(1)',
                      boxShadow: selectedColor.id === color.id ? `0 0 12px ${color.hex}` : 'none',
                      transition: 'transform 0.2s',
                    }}
                    title={color.name}
                  />
                ))}
              </div>
              <p style={{ color: '#9CA3AF', fontSize: '12px', marginTop: '8px' }}>
                Selected: {selectedColor.name}
              </p>
            </div>

            {/* Add-ons */}
            <div>
              <label style={{ display: 'block', color: '#fff', fontWeight: 500, marginBottom: '12px' }}>
                Add Ons (Optional)
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                {addOns.map((addon) => (
                  <button
                    key={addon.id}
                    onClick={() => toggleAddOn(addon.id)}
                    style={{
                      padding: '14px',
                      borderRadius: '8px',
                      border: selectedAddOns.includes(addon.id) ? '2px solid #9933FF' : '2px solid #374151',
                      backgroundColor: selectedAddOns.includes(addon.id) ? 'rgba(153, 51, 255, 0.1)' : '#1a1a1a',
                      cursor: 'pointer',
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                    }}
                  >
                    <div style={{
                      width: '18px',
                      height: '18px',
                      borderRadius: '4px',
                      border: selectedAddOns.includes(addon.id) ? '2px solid #9933FF' : '2px solid #6B7280',
                      backgroundColor: selectedAddOns.includes(addon.id) ? '#9933FF' : 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      {selectedAddOns.includes(addon.id) && <span style={{ color: '#fff', fontSize: '12px' }}>✓</span>}
                    </div>
                    <div style={{ flex: 1 }}>
                      <span style={{ display: 'block', color: '#fff', fontSize: '13px', fontWeight: 500 }}>{addon.name}</span>
                      <span style={{ display: 'block', color: '#9CA3AF', fontSize: '13px' }}>+ ₹ {addon.price.toLocaleString()}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div>
              <label style={{ display: 'block', color: '#fff', fontWeight: 500, marginBottom: '12px' }}>
                Quantity
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '8px',
                    border: '2px solid #374151',
                    backgroundColor: '#1a1a1a',
                    color: '#fff',
                    fontSize: '20px',
                    cursor: 'pointer',
                  }}
                >
                  −
                </button>
                <span style={{ color: '#fff', fontSize: '18px', fontWeight: 600, minWidth: '40px', textAlign: 'center' }}>
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '8px',
                    border: '2px solid #374151',
                    backgroundColor: '#1a1a1a',
                    color: '#fff',
                    fontSize: '20px',
                    cursor: 'pointer',
                  }}
                >
                  +
                </button>
              </div>
            </div>

            {/* Price Summary */}
            <div style={{
              backgroundColor: '#1a1a1a',
              borderRadius: '8px',
              padding: '16px',
              border: '1px solid #374151',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: '#9CA3AF' }}>Size:</span>
                <span style={{ color: '#fff' }}>{selectedSize.name} ({selectedSize.dimensions})</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: '#9CA3AF' }}>Color:</span>
                <span style={{ color: '#fff' }}>{selectedColor.name}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: '#9CA3AF' }}>Quantity:</span>
                <span style={{ color: '#fff' }}>{quantity}</span>
              </div>
              <div style={{ borderTop: '1px solid #374151', marginTop: '12px', paddingTop: '12px', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#fff', fontWeight: 600 }}>Total:</span>
                <span style={{ color: '#00ff00', fontSize: '24px', fontWeight: 'bold' }}>₹ {calculatePrice().toLocaleString()}</span>
              </div>
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              style={{
                width: '100%',
                padding: '16px',
                borderRadius: '8px',
                backgroundColor: addedToCart ? '#16A34A' : '#9933FF',
                color: '#fff',
                fontWeight: 'bold',
                fontSize: '18px',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              {addedToCart ? '✓ Added to Cart!' : 'ADD TO CART'}
            </button>

            {/* WhatsApp */}
            <a
              href={`https://wa.me/919999999999?text=Hi, I'm interested in ${encodeURIComponent(product.name)}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '14px',
                borderRadius: '8px',
                backgroundColor: '#25D366',
                color: '#fff',
                fontWeight: 500,
                textDecoration: 'none',
              }}
            >
              <span>📱</span>
              <span>Order via WhatsApp</span>
            </a>
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{ marginTop: '60px', borderTop: '1px solid #333', paddingTop: '40px' }}>
          <div style={{ display: 'flex', gap: '32px', marginBottom: '32px', borderBottom: '1px solid #333' }}>
            {(['details', 'specs', 'shipping'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '16px 0',
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: activeTab === tab ? '#9933FF' : '#9CA3AF',
                  fontSize: '16px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  borderBottom: activeTab === tab ? '2px solid #9933FF' : '2px solid transparent',
                  marginBottom: '-1px',
                }}
              >
                {tab === 'details' ? 'Product Details' : tab === 'specs' ? 'Specifications' : 'Shipping & Returns'}
              </button>
            ))}
          </div>

          {activeTab === 'details' && (
            <div style={{ color: '#9CA3AF', lineHeight: 1.8 }}>
              <h3 style={{ color: '#fff', fontSize: '20px', fontWeight: 600, marginBottom: '16px' }}>About This Product</h3>
              <p>{product.description}</p>
              <ul style={{ marginTop: '16px', paddingLeft: '20px' }}>
                <li style={{ marginBottom: '8px' }}>Premium quality LED neon flex</li>
                <li style={{ marginBottom: '8px' }}>Energy efficient - uses only 10-15W</li>
                <li style={{ marginBottom: '8px' }}>Long lifespan - 50,000+ hours</li>
                <li style={{ marginBottom: '8px' }}>Safe to touch - no heat emission</li>
                <li style={{ marginBottom: '8px' }}>Easy plug-and-play installation</li>
              </ul>
            </div>
          )}

          {activeTab === 'specs' && (
            <div>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #333' }}>
                    <td style={{ padding: '12px 0', color: '#9CA3AF', width: '40%' }}>Material</td>
                    <td style={{ padding: '12px 0', color: '#fff' }}>LED Neon Flex + Acrylic</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #333' }}>
                    <td style={{ padding: '12px 0', color: '#9CA3AF' }}>Power</td>
                    <td style={{ padding: '12px 0', color: '#fff' }}>DC 12V / 24V</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #333' }}>
                    <td style={{ padding: '12px 0', color: '#9CA3AF' }}>Lifespan</td>
                    <td style={{ padding: '12px 0', color: '#fff' }}>50,000+ hours</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #333' }}>
                    <td style={{ padding: '12px 0', color: '#9CA3AF' }}>Warranty</td>
                    <td style={{ padding: '12px 0', color: '#fff' }}>2 Years</td>
                  </tr>
                  {product.specifications && Object.entries(product.specifications).map(([key, value]) => (
                    <tr key={key} style={{ borderBottom: '1px solid #333' }}>
                      <td style={{ padding: '12px 0', color: '#9CA3AF' }}>{key}</td>
                      <td style={{ padding: '12px 0', color: '#fff' }}>{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'shipping' && (
            <div style={{ color: '#9CA3AF', lineHeight: 1.8 }}>
              <h3 style={{ color: '#fff', fontSize: '20px', fontWeight: 600, marginBottom: '16px' }}>Shipping Information</h3>
              <ul style={{ paddingLeft: '20px' }}>
                <li style={{ marginBottom: '8px' }}>Free shipping on orders above ₹5,000</li>
                <li style={{ marginBottom: '8px' }}>Delivery within 7-10 business days</li>
                <li style={{ marginBottom: '8px' }}>Secure packaging to prevent damage</li>
              </ul>
              <h3 style={{ color: '#fff', fontSize: '20px', fontWeight: 600, marginTop: '24px', marginBottom: '16px' }}>Returns & Refunds</h3>
              <ul style={{ paddingLeft: '20px' }}>
                <li style={{ marginBottom: '8px' }}>7-day replacement for manufacturing defects</li>
                <li style={{ marginBottom: '8px' }}>Custom orders are non-refundable</li>
                <li style={{ marginBottom: '8px' }}>Contact support for any issues</li>
              </ul>
            </div>
          )}
        </div>

        {/* WhatsApp Floating Button */}
        <a
          href={`https://wa.me/919999999999?text=Hi, I'm interested in ${encodeURIComponent(product.name)}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            backgroundColor: '#25D366',
            color: '#fff',
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '28px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            zIndex: 50,
            textDecoration: 'none',
          }}
        >
          💬
        </a>
      </div>
    </div>
  )
}
