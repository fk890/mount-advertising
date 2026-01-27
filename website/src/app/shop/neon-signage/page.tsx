"use client"

import { useState } from 'react'
import Image from 'next/image'
import { addToCart } from '@/shop-utils/cartWishlist'

// Neon colors matching Neon Attack
const neonColors = [
  { id: 'white', name: 'White', hex: '#E8E8E8' },
  { id: 'pink', name: 'Pink', hex: '#FF69B4' },
  { id: 'green', name: 'Green', hex: '#00FF00' },
  { id: 'blue', name: 'Blue', hex: '#0066FF' },
  { id: 'purple', name: 'Purple', hex: '#9933FF' },
  { id: 'orange', name: 'Orange', hex: '#FF8C00' },
  { id: 'cyan', name: 'Cyan', hex: '#00CED1' },
  { id: 'warm-white', name: 'Warm White', hex: '#F5DEB3' },
  { id: 'red', name: 'Red', hex: '#FF4444' },
  { id: 'yellow', name: 'Yellow', hex: '#FFD700' },
]

// Font options matching Neon Attack
const fonts = [
  { id: 'passionate', name: 'Passionate', fontFamily: "'Alex Brush', cursive" },
  { id: 'dreamy', name: 'Dreamy', fontFamily: "'Sacramento', cursive" },
  { id: 'flowy', name: 'Flowy', fontFamily: "'Great Vibes', cursive" },
  { id: 'original', name: 'ORIGINAL', fontFamily: "'Bebas Neue', sans-serif" },
  { id: 'classic', name: 'CLASSIC', fontFamily: "'Oswald', sans-serif" },
  { id: 'sign', name: 'Sign', fontFamily: "'Allura', cursive" },
  { id: 'funky', name: 'Funky', fontFamily: "'Bangers', cursive" },
  { id: 'chic', name: 'Chic', fontFamily: "'Playfair Display', serif" },
  { id: 'delight', name: 'Delight', fontFamily: "'Satisfy', cursive" },
  { id: 'classy', name: 'Classy', fontFamily: "'Cormorant Garamond', serif" },
  { id: 'romantic', name: 'Romantic', fontFamily: "'Pacifico', cursive" },
  { id: 'robo', name: 'ROBO', fontFamily: "'Orbitron', sans-serif" },
  { id: 'charming', name: 'Charming', fontFamily: "'Caveat', cursive" },
  { id: 'quirky', name: 'Quirky', fontFamily: "'Indie Flower', cursive" },
  { id: 'stylish', name: 'Stylish', fontFamily: "'Italiana', serif" },
]

// Size options
const sizes = [
  { id: 'regular', name: 'Regular', width: '3"', height: '10"', multiplier: 1 },
  { id: 'medium', name: 'Medium', width: '4"', height: '13"', multiplier: 1.5 },
  { id: 'large', name: 'Large', width: '5"', height: '15"', multiplier: 2 },
]

// Add-ons
const addOns = [
  { id: 'waterproof', name: 'Waterproof IP67 Rated', price: 3000 },
  { id: 'wireless', name: 'Smart Wireless Controller', price: 2000 },
]

type Font = typeof fonts[number]
type Color = typeof neonColors[number]
type Size = typeof sizes[number]

const basePrice = 0

export default function NeonSignage() {
  const [customText, setCustomText] = useState('Text Preview')
  const [selectedColor, setSelectedColor] = useState<Color>(neonColors[0]!)
  const [selectedFont, setSelectedFont] = useState<Font>(fonts[0]!)
  const [selectedSize, setSelectedSize] = useState<Size>(sizes[0]!)
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([])
  const [copied, setCopied] = useState(false)
  const [addedToCart, setAddedToCart] = useState(false)

  const calculatePrice = () => {
    let price = basePrice * selectedSize.multiplier
    if (customText.length > 10) {
      price += (customText.length - 10) * 100
    }
    selectedAddOns.forEach(addonId => {
      const addon = addOns.find(a => a.id === addonId)
      if (addon) price += addon.price
    })
    return Math.round(price)
  }

  const toggleAddOn = (addonId: string) => {
    setSelectedAddOns(prev => 
      prev.includes(addonId) 
        ? prev.filter(id => id !== addonId)
        : [...prev, addonId]
    )
  }

  const handleCopyCode = () => {
    navigator.clipboard.writeText('NEONTANK30')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleAddToCart = () => {
    const product = {
      id: `custom-neon-${Date.now()}`,
      name: `Custom Neon Sign: "${customText}"`,
      price: calculatePrice(),
      image: '/images/neon-custom.jpg',
      quantity: 1,
      customization: {
        text: customText,
        font: selectedFont.name,
        color: selectedColor.name,
        size: selectedSize.name,
        addOns: selectedAddOns.map(id => addOns.find(a => a.id === id)?.name).filter(Boolean)
      }
    }
    addToCart(product)
    setAddedToCart(true)
    setTimeout(() => setAddedToCart(false), 3000)
  }

  const getNeonStyle = (): React.CSSProperties => ({
    fontFamily: selectedFont.fontFamily,
    color: selectedColor.hex,
    textShadow: `0 0 10px ${selectedColor.hex}, 0 0 20px ${selectedColor.hex}, 0 0 40px ${selectedColor.hex}, 0 0 80px ${selectedColor.hex}`,
    fontSize: '4rem',
    textAlign: 'center',
  })

  return (
    <>
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link 
        href="https://fonts.googleapis.com/css2?family=Alex+Brush&family=Sacramento&family=Great+Vibes&family=Bebas+Neue&family=Oswald:wght@500&family=Allura&family=Bangers&family=Playfair+Display:wght@600&family=Satisfy&family=Cormorant+Garamond:wght@500&family=Pacifico&family=Orbitron:wght@700&family=Caveat:wght@600&family=Indie+Flower&family=Italiana&display=swap" 
        rel="stylesheet" 
      />
      
      <div style={{ minHeight: '100vh', backgroundColor: '#0a0a0a', paddingTop: '100px' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px' }}>
            
            {/* Left Side - Preview */}
            <div style={{ position: 'relative' }}>
              {/* Preview Area with Sofa */}
              <div style={{ 
                position: 'relative', 
                backgroundColor: '#1a1a2e', 
                borderRadius: '12px', 
                overflow: 'hidden',
                minHeight: '500px',
              }}>
                {/* Neon Text Preview */}
                <div style={{ 
                  padding: '60px 40px 200px 40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: '300px',
                }}>
                  <div style={getNeonStyle()}>
                    {customText || 'Your Text'}
                  </div>
                </div>
                
                {/* Sofa Image - placeholder, user will add sofa.png later */}
                <div style={{ 
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: '200px',
                  background: 'linear-gradient(to top, #2a2015 0%, #1a1510 50%, transparent 100%)',
                }}>
                  {/* Sofa placeholder - golden couch shape */}
                  <div style={{
                    position: 'absolute',
                    bottom: '20px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '85%',
                    height: '100px',
                    background: 'linear-gradient(135deg, #C4A052 0%, #8B7355 50%, #6B5344 100%)',
                    borderRadius: '30px 30px 10px 10px',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
                  }}>
                    {/* Cushions */}
                    <div style={{
                      position: 'absolute',
                      top: '10px',
                      left: '10%',
                      width: '25%',
                      height: '50px',
                      background: 'linear-gradient(135deg, #D4B062 0%, #9B8365 100%)',
                      borderRadius: '8px',
                    }} />
                    <div style={{
                      position: 'absolute',
                      top: '10px',
                      left: '38%',
                      width: '25%',
                      height: '50px',
                      background: 'linear-gradient(135deg, #D4B062 0%, #9B8365 100%)',
                      borderRadius: '8px',
                    }} />
                    <div style={{
                      position: 'absolute',
                      top: '10px',
                      right: '10%',
                      width: '25%',
                      height: '50px',
                      background: 'linear-gradient(135deg, #D4B062 0%, #9B8365 100%)',
                      borderRadius: '8px',
                    }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Customization Options */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Title */}
              <div>
                <h2 style={{ fontSize: '32px', fontWeight: 'bold', color: '#fff', margin: '0 0 8px 0' }}>Customise Neon Sign</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <div style={{ color: '#FBBF24', fontSize: '18px' }}>★★★★★</div>
                  <span style={{ color: '#9CA3AF' }}>363 reviews</span>
                </div>
                <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#00CED1', margin: 0 }}>₹ {calculatePrice()}</p>
              </div>

              {/* Type Your Text */}
              <div>
                <label style={{ display: 'block', color: '#fff', fontWeight: 500, marginBottom: '12px' }}>Type Your Text</label>
                <input
                  type="text"
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  placeholder="Enter your custom text..."
                  maxLength={30}
                  style={{
                    width: '100%',
                    backgroundColor: '#1a1a1a',
                    border: '2px solid #374151',
                    borderRadius: '8px',
                    padding: '16px',
                    color: '#fff',
                    fontSize: '18px',
                    fontFamily: selectedFont.fontFamily,
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              {/* Pick Your Font */}
              <div>
                <label style={{ display: 'block', color: '#fff', fontWeight: 500, marginBottom: '12px' }}>Pick Your Font</label>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(3, 1fr)', 
                  gap: '8px', 
                  maxHeight: '240px', 
                  overflowY: 'auto',
                  paddingRight: '4px',
                }}>
                  {fonts.map((font) => (
                    <button
                      key={font.id}
                      onClick={() => setSelectedFont(font)}
                      style={{
                        padding: '12px 8px',
                        borderRadius: '8px',
                        border: selectedFont.id === font.id ? '2px solid #9333EA' : '2px solid #374151',
                        backgroundColor: selectedFont.id === font.id ? '#9333EA' : '#1a1a1a',
                        color: '#fff',
                        fontSize: '14px',
                        fontFamily: font.fontFamily,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                    >
                      {font.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Select Your Colour */}
              <div>
                <label style={{ display: 'block', color: '#fff', fontWeight: 500, marginBottom: '12px' }}>Select Your Colour</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                  {neonColors.map((color) => (
                    <button
                      key={color.id}
                      onClick={() => setSelectedColor(color)}
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        backgroundColor: color.hex,
                        border: selectedColor.id === color.id ? '3px solid #fff' : '2px solid transparent',
                        cursor: 'pointer',
                        transition: 'transform 0.2s',
                        transform: selectedColor.id === color.id ? 'scale(1.15)' : 'scale(1)',
                        boxShadow: selectedColor.id === color.id ? `0 0 12px ${color.hex}` : 'none',
                      }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>

              {/* Select Size */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <label style={{ color: '#fff', fontWeight: 500 }}>Select Size</label>
                  <span style={{ color: '#9CA3AF', fontSize: '16px', cursor: 'help' }}>?</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                  {sizes.map((size) => (
                    <button
                      key={size.id}
                      onClick={() => setSelectedSize(size)}
                      style={{
                        padding: '12px',
                        borderRadius: '8px',
                        border: selectedSize.id === size.id ? '2px solid #9333EA' : '2px solid #374151',
                        backgroundColor: selectedSize.id === size.id ? 'rgba(147, 51, 234, 0.2)' : '#1a1a1a',
                        cursor: 'pointer',
                        textAlign: 'center',
                      }}
                    >
                      <span style={{ display: 'block', fontWeight: 600, color: selectedSize.id === size.id ? '#fff' : '#D1D5DB', marginBottom: '4px' }}>
                        {size.name}
                      </span>
                      <span style={{ display: 'block', fontSize: '12px', color: '#9CA3AF' }}>Width: {size.width}</span>
                      <span style={{ display: 'block', fontSize: '12px', color: '#9CA3AF' }}>Height: {size.height}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Add Ons */}
              <div>
                <label style={{ display: 'block', color: '#fff', fontWeight: 500, marginBottom: '12px' }}>Add Ons</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                  {addOns.map((addon) => (
                    <button
                      key={addon.id}
                      onClick={() => toggleAddOn(addon.id)}
                      style={{
                        padding: '16px',
                        borderRadius: '8px',
                        border: selectedAddOns.includes(addon.id) ? '2px solid #9333EA' : '2px solid #374151',
                        backgroundColor: selectedAddOns.includes(addon.id) ? 'rgba(147, 51, 234, 0.2)' : '#1a1a1a',
                        cursor: 'pointer',
                        textAlign: 'left',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '12px',
                      }}
                    >
                      <div style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        border: selectedAddOns.includes(addon.id) ? '2px solid #9333EA' : '2px solid #6B7280',
                        backgroundColor: selectedAddOns.includes(addon.id) ? '#9333EA' : 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}>
                        {selectedAddOns.includes(addon.id) && <span style={{ color: '#fff', fontSize: '12px' }}>✓</span>}
                      </div>
                      <div style={{ flex: 1 }}>
                        <span style={{ display: 'block', color: '#fff', fontSize: '14px', fontWeight: 500 }}>{addon.name}</span>
                        <span style={{ display: 'block', color: '#9CA3AF', fontSize: '14px' }}>₹ {addon.price.toLocaleString()}</span>
                      </div>
                      <span style={{ color: '#10B981', fontSize: '18px' }}>ⓘ</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Price */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: '#fff', fontWeight: 500 }}>Price:</span>
                <span style={{ color: '#00CED1', fontSize: '20px', fontWeight: 'bold' }}>₹ {calculatePrice()}</span>
              </div>

              {/* Add to Cart */}
              <button
                onClick={handleAddToCart}
                style={{
                  width: '100%',
                  padding: '16px',
                  borderRadius: '8px',
                  backgroundColor: addedToCart ? '#16A34A' : '#c8ff00',
                  color: '#000',
                  fontWeight: 'bold',
                  fontSize: '18px',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                }}
              >
                {addedToCart ? '✓ Added to Cart!' : 'ADD TO CART'}
              </button>

              {/* WhatsApp */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between', 
                backgroundColor: '#1a1a1a', 
                borderRadius: '8px', 
                padding: '16px', 
                border: '1px solid #374151',
                flexWrap: 'wrap',
                gap: '12px',
              }}>
                <p style={{ color: '#fff', margin: 0 }}>Have your own logo or design?</p>
                <a 
                  href="https://wa.me/919999999999?text=Hi, I want a custom neon sign"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    backgroundColor: '#25D366',
                    color: '#fff',
                    padding: '10px 16px',
                    borderRadius: '8px',
                    fontWeight: 500,
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <span>📱</span>
                  <span>WhatsApp Now</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{ 
          backgroundColor: '#2a2a2a', 
          borderTop: '1px solid #374151',
          borderBottom: '1px solid #374151',
          marginTop: '48px',
          position: 'sticky',
          top: '80px',
          zIndex: 20,
        }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '48px' }}>
              <a href="#product-details" style={{ color: '#fff', textDecoration: 'none', padding: '16px 0', fontSize: '15px', fontWeight: 500 }}>Product Details</a>
              <a href="#whats-in-box" style={{ color: '#fff', textDecoration: 'none', padding: '16px 0', fontSize: '15px', fontWeight: 500 }}>What&apos;s in the box?</a>
              <a href="#how-to-install" style={{ color: '#fff', textDecoration: 'none', padding: '16px 0', fontSize: '15px', fontWeight: 500 }}>How to install?</a>
              <a href="#customise" style={{ 
                color: '#00ff00', 
                textDecoration: 'none', 
                padding: '12px 24px', 
                fontSize: '15px', 
                fontWeight: 500,
                border: '2px solid #00ff00',
                borderRadius: '8px',
              }}>Customise</a>
              <a href="#faqs" style={{ color: '#fff', textDecoration: 'none', padding: '16px 0', fontSize: '15px', fontWeight: 500 }}>FAQs</a>
            </div>
          </div>
        </div>

        {/* About Your Neon Sign Section */}
        <div id="product-details" style={{ maxWidth: '1400px', margin: '0 auto', padding: '60px 24px' }}>
          <h3 style={{ color: '#00ff00', fontSize: '28px', fontWeight: 'bold', marginBottom: '16px' }}>About Your Neon Sign:</h3>
          <p style={{ color: '#fff', fontSize: '18px', lineHeight: 1.6, marginBottom: '40px', maxWidth: '900px' }}>
            Mount Advertising&apos;s neon signs are handcrafted with advanced 2nd gen LED on high-quality 6MM transparent acrylic. 
            Energy-efficient, durable, and easy to install–perfect for any space!
          </p>

          {/* Feature Card */}
          <div style={{ 
            backgroundColor: '#1a1a2e', 
            borderRadius: '16px', 
            padding: '40px',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '40px',
            alignItems: 'center',
          }}>
            {/* Left - LED image */}
            <div style={{ 
              position: 'relative',
              height: '300px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Image
                src="/shop/led-1.webp"
                alt="2nd Gen LED Neon"
                fill
                style={{ objectFit: 'contain' }}
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
            
            {/* Right - Content */}
            <div>
              <h4 style={{ color: '#fff', fontSize: '24px', fontWeight: 'bold', marginBottom: '20px', lineHeight: 1.3 }}>
                Meet 2nd Gen LED Neon - 2X Brighter & Built to Last!
              </h4>
              <p style={{ color: '#9CA3AF', fontSize: '16px', lineHeight: 1.7, marginBottom: '20px' }}>
                Our revolutionary 2nd Gen LED Neon is twice as bright, 80% more energy-efficient, and built to 
                outlast the rest. Plus, with adjustable brightness controls, and the option for waterproof durability, 
                this is the ultimate neon upgrade you&apos;ve been waiting for!
              </p>
              <p style={{ color: '#9CA3AF', fontSize: '16px', fontStyle: 'italic' }}>
                Say goodbye to dull, outdated neon–this is the future!
              </p>
            </div>
          </div>
        </div>

        {/* The Box Contains Section */}
        <div id="whats-in-box" style={{ maxWidth: '1400px', margin: '0 auto', padding: '60px 24px' }}>
          <h3 style={{ color: '#00ff00', fontSize: '28px', fontWeight: 'bold', marginBottom: '16px' }}>The Box Contains:</h3>
          <p style={{ color: '#fff', fontSize: '18px', marginBottom: '8px' }}>
            Our neon lights are ready to shine straight from the box!
          </p>
          <p style={{ color: '#fff', fontSize: '16px', lineHeight: 1.6, marginBottom: '40px', maxWidth: '900px' }}>
            Each sign is mounted on clear acrylic for support and comes with pre-drilled holes. Stainless steel mounting 
            screws are included, making wall installation quick and easy.
          </p>

          {/* Box Contents Image */}
          <div style={{ 
            position: 'relative',
            backgroundColor: '#0a0a0a',
            borderRadius: '16px',
            padding: '24px',
          }}>
            <div style={{ position: 'relative', width: '100%', height: '520px' }}>
              <Image
                src="/shop/box-contains.webp"
                alt="What's in the box"
                fill
                style={{ objectFit: 'contain' }}
                sizes="(max-width: 768px) 100vw, 80vw"
              />
            </div>
          </div>
        </div>

        {/* Comparison Table Section */}
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '60px 24px' }}>
          {/* Scrolling Rating Badges - placeholder */}
          <div style={{ marginBottom: '40px', overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '48px', color: '#00CED1', fontSize: '14px' }}>
              <span>⭐ 4.9 Star Rating by 10K+ Customers</span>
              <span>⭐ 4.9 Star Rating by 10K+ Customers</span>
              <span>⭐ 4.9 Star Rating by 10K+ Customers</span>
            </div>
          </div>

          {/* Comparison Table */}
          <div style={{ 
            backgroundColor: '#00E5A0', 
            borderRadius: '16px', 
            overflow: 'hidden',
            maxWidth: '800px',
            margin: '0 auto',
          }}>
            {/* Header */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '2fr 1fr 1fr', 
              padding: '20px 24px',
              borderBottom: '1px solid rgba(0,0,0,0.1)',
            }}>
              <span style={{ color: '#000', fontSize: '18px', fontWeight: 'bold' }}>Go For the best!</span>
              <span style={{ color: '#000', fontSize: '16px', fontWeight: 'bold', textAlign: 'center' }}>Us</span>
              <span style={{ color: '#000', fontSize: '16px', fontWeight: 'bold', textAlign: 'center' }}>Them</span>
            </div>

            {/* Rows */}
            {[
              'Top Notch Quality with Flawless finishing',
              'Premium Craftsmanship',
              'Easy repair or replacement covered with 2 year warranty',
              'IP67 technology. Waterproof add-on for outdoor usage',
              '24/7 Customer Support',
            ].map((feature, index) => (
              <div key={index} style={{ 
                display: 'grid', 
                gridTemplateColumns: '2fr 1fr 1fr', 
                padding: '16px 24px',
                borderBottom: index < 4 ? '1px solid rgba(0,0,0,0.1)' : 'none',
                backgroundColor: index % 2 === 0 ? 'rgba(255,255,255,0.1)' : 'transparent',
              }}>
                <span style={{ color: '#000', fontSize: '15px' }}>{feature}</span>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <div style={{ 
                    width: '28px', 
                    height: '28px', 
                    borderRadius: '50%', 
                    backgroundColor: '#22C55E',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <span style={{ color: '#fff', fontSize: '16px' }}>✓</span>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <div style={{ 
                    width: '28px', 
                    height: '28px', 
                    borderRadius: '50%', 
                    backgroundColor: '#EF4444',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <span style={{ color: '#fff', fontSize: '16px' }}>✕</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* How to Install Section */}
        <div id="how-to-install" style={{ maxWidth: '1400px', margin: '0 auto', padding: '60px 24px' }}>
          <h3 style={{ color: '#00ff00', fontSize: '28px', fontWeight: 'bold', marginBottom: '24px' }}>
            Here&apos;s how you can install our neon signs on your wall:
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
            {[
              {
                image: '/shop/install-1.avif',
                text: 'Take a measuring tape and mark out the position of your neon sign.'
              },
              {
                image: '/shop/install-2.avif',
                text: 'Safely drill small holes on the wall.'
              },
              {
                image: '/shop/install-3.avif',
                text: 'Use the SS mounting screws to mount your neon sign on the wall.'
              },
              {
                image: '/shop/install-4.avif',
                text: 'Connect the power adapter to the transparent cable and your sign is ready!'
              },
            ].map((item, index) => (
              <div key={index} style={{ 
                backgroundColor: '#111111',
                borderRadius: '18px',
                overflow: 'hidden',
                boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
              }}>
                <div style={{ position: 'relative', width: '100%', height: '200px' }}>
                  <Image
                    src={item.image}
                    alt={`Install step ${index + 1}`}
                    fill
                    style={{ objectFit: 'cover' }}
                    sizes="(max-width: 1200px) 50vw, 25vw"
                  />
                </div>
                <div style={{
                  padding: '20px 18px 26px',
                  background: 'linear-gradient(180deg, rgba(17,17,17,0.9) 0%, #000 100%)',
                  minHeight: '120px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <p style={{ color: '#fff', fontSize: '15px', lineHeight: 1.5, textAlign: 'center', margin: 0 }}>
                    {item.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQs Section */}
        <div id="faqs" style={{ maxWidth: '1400px', margin: '0 auto', padding: '60px 24px 100px' }}>
          <h3 style={{ color: '#00ff00', fontSize: '28px', fontWeight: 'bold', marginBottom: '24px' }}>Frequently Asked Questions</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { q: 'How long do neon signs last?', a: 'Our LED neon signs last 50,000+ hours, which is approximately 5-7 years of continuous use.' },
              { q: 'Are neon signs safe?', a: 'Yes! Our LED neon signs run on low voltage (12V) and remain cool to touch, making them completely safe.' },
              { q: 'Can I use neon signs outdoors?', a: 'With our Waterproof IP67 add-on, your neon sign can be used outdoors in any weather condition.' },
              { q: 'How do I clean my neon sign?', a: 'Simply wipe with a soft, dry cloth. Avoid using water or cleaning chemicals directly on the sign.' },
              { q: 'What is the warranty period?', a: 'All our neon signs come with a 2-year warranty covering manufacturing defects and repairs.' },
            ].map((faq, index) => (
              <div key={index} style={{ 
                backgroundColor: '#1a1a1a', 
                borderRadius: '8px', 
                padding: '20px 24px',
                border: '1px solid #374151',
              }}>
                <h4 style={{ color: '#fff', fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>{faq.q}</h4>
                <p style={{ color: '#9CA3AF', fontSize: '14px', lineHeight: 1.6, margin: 0 }}>{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* WhatsApp Floating Button */}
        <a 
          href="https://wa.me/919999999999?text=Hi, I want to order a custom neon sign"
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
    </>
  )
}
