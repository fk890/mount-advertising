"use client"

import { useState, useRef } from 'react'
import Image from 'next/image'
import { addToCart } from '@/shop-utils/cartWishlist'

// LED Board colors
const ledColors = [
  { id: 'white', name: 'White', hex: '#FFFFFF', bg: '#1a1a1a' },
  { id: 'red', name: 'Red', hex: '#FF0000', bg: '#1a0000' },
  { id: 'green', name: 'Green', hex: '#00FF00', bg: '#001a00' },
  { id: 'blue', name: 'Blue', hex: '#0066FF', bg: '#00001a' },
  { id: 'yellow', name: 'Yellow', hex: '#FFD700', bg: '#1a1a00' },
  { id: 'orange', name: 'Orange', hex: '#FF8C00', bg: '#1a0f00' },
  { id: 'pink', name: 'Pink', hex: '#FF69B4', bg: '#1a0010' },
  { id: 'cyan', name: 'Cyan', hex: '#00CED1', bg: '#001a1a' },
  { id: 'purple', name: 'Purple', hex: '#9933FF', bg: '#0f001a' },
  { id: 'multi', name: 'Multi-Color RGB', hex: 'linear-gradient(90deg, #FF0000, #00FF00, #0000FF)', bg: '#0a0a0a' },
]

// Font options same as neon
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

// Board types
const boardTypes = [
  { id: 'scrolling', name: 'Scrolling Text LED', description: 'Text scrolls horizontally' },
  { id: 'static', name: 'Static Display LED', description: 'Fixed text/image display' },
  { id: 'video', name: 'Video LED Board', description: 'Play videos and animations' },
]

// Add-ons for LED boards
const addOns = [
  { id: 'weatherproof', name: 'Weatherproof Outdoor Rated', price: 5000 },
  { id: 'wifi', name: 'WiFi Remote Control', price: 3000 },
  { id: 'timer', name: 'Auto Timer On/Off', price: 1500 },
  { id: 'brightness', name: 'Auto Brightness Sensor', price: 2000 },
]

type Font = typeof fonts[number]
type Color = typeof ledColors[number]
type BoardType = typeof boardTypes[number]

const basePricePerSqFt = 500

export default function LEDBoards() {
  const [customText, setCustomText] = useState('Your Message Here')
  const [selectedColor, setSelectedColor] = useState<Color>(ledColors[0]!)
  const [selectedFont, setSelectedFont] = useState<Font>(fonts[3]!) // ORIGINAL font default
  const [selectedBoardType, setSelectedBoardType] = useState<BoardType>(boardTypes[0]!)
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([])
  const [width, setWidth] = useState('48')
  const [height, setHeight] = useState('12')
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [additionalNotes, setAdditionalNotes] = useState('')
  const [addedToCart, setAddedToCart] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const calculatePrice = () => {
    const w = parseFloat(width) || 0
    const h = parseFloat(height) || 0
    const sqFt = (w * h) / 144 // Convert sq inches to sq feet
    let price = sqFt * basePricePerSqFt
    
    // Add board type multiplier
    if (selectedBoardType.id === 'video') price *= 2
    else if (selectedBoardType.id === 'static') price *= 1.2
    
    // Add-ons
    selectedAddOns.forEach(addonId => {
      const addon = addOns.find(a => a.id === addonId)
      if (addon) price += addon.price
    })
    
    return Math.round(Math.max(price, 2999)) // Minimum price
  }

  const toggleAddOn = (addonId: string) => {
    setSelectedAddOns(prev => 
      prev.includes(addonId) 
        ? prev.filter(id => id !== addonId)
        : [...prev, addonId]
    )
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setUploadedImage(event.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeUploadedImage = () => {
    setUploadedImage(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleAddToCart = () => {
    const product = {
      id: `custom-led-board-${Date.now()}`,
      name: `Custom LED Board: ${width}" x ${height}"`,
      price: calculatePrice(),
      image: uploadedImage || '/shop/led-board-preview.webp',
      quantity: 1,
      customization: {
        text: customText,
        font: selectedFont.name,
        color: selectedColor.name,
        boardType: selectedBoardType.name,
        dimensions: `${width}" x ${height}"`,
        hasCustomDesign: !!uploadedImage,
        notes: additionalNotes,
        addOns: selectedAddOns.map(id => addOns.find(a => a.id === id)?.name).filter(Boolean)
      }
    }
    addToCart(product)
    setAddedToCart(true)
    setTimeout(() => setAddedToCart(false), 3000)
  }

  const getLEDTextStyle = (): React.CSSProperties => ({
    fontFamily: selectedFont.fontFamily,
    color: selectedColor.id === 'multi' ? '#fff' : selectedColor.hex,
    textShadow: selectedColor.id === 'multi' 
      ? '0 0 10px #FF0000, 0 0 20px #00FF00, 0 0 30px #0000FF'
      : `0 0 5px ${selectedColor.hex}, 0 0 10px ${selectedColor.hex}, 0 0 20px ${selectedColor.hex}`,
    fontSize: 'clamp(1.5rem, 4vw, 3rem)',
    textAlign: 'center',
    background: selectedColor.id === 'multi' ? 'linear-gradient(90deg, #FF0000, #FFD700, #00FF00, #00CED1, #0066FF, #9933FF)' : 'transparent',
    WebkitBackgroundClip: selectedColor.id === 'multi' ? 'text' : 'unset',
    WebkitTextFillColor: selectedColor.id === 'multi' ? 'transparent' : 'unset',
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
              {/* Preview Area */}
              <div style={{ 
                position: 'relative', 
                backgroundColor: selectedColor.bg,
                borderRadius: '12px', 
                overflow: 'hidden',
                border: '4px solid #333',
                minHeight: '400px',
              }}>
                {/* Board Frame Effect */}
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  border: '8px solid #222',
                  borderRadius: '8px',
                  pointerEvents: 'none',
                }} />
                
                {/* LED Dots Background Effect */}
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)',
                  backgroundSize: '8px 8px',
                }} />

                {/* Content Area */}
                <div style={{ 
                  padding: '40px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: '350px',
                  gap: '20px',
                }}>
                  {uploadedImage ? (
                    <div style={{ position: 'relative', maxWidth: '100%', maxHeight: '250px' }}>
                      <Image 
                        src={uploadedImage} 
                        alt="Uploaded design" 
                        width={800}
                        height={600}
                        style={{ 
                          maxWidth: '100%', 
                          maxHeight: '250px', 
                          objectFit: 'contain',
                          borderRadius: '8px',
                        }} 
                        unoptimized
                      />
                      <button
                        onClick={removeUploadedImage}
                        style={{
                          position: 'absolute',
                          top: '-10px',
                          right: '-10px',
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          backgroundColor: '#EF4444',
                          color: '#fff',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '16px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <div style={getLEDTextStyle()}>
                      {customText || 'Your Message'}
                    </div>
                  )}
                </div>

                {/* Dimensions Display */}
                <div style={{
                  position: 'absolute',
                  bottom: '12px',
                  right: '12px',
                  backgroundColor: 'rgba(0,0,0,0.7)',
                  padding: '6px 12px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  color: '#888',
                }}>
                  {width}&quot; × {height}&quot;
                </div>
              </div>

              {/* Board Type Indicator */}
              <div style={{
                marginTop: '16px',
                padding: '12px 16px',
                backgroundColor: '#1a1a1a',
                borderRadius: '8px',
                border: '1px solid #333',
              }}>
                <span style={{ color: '#888', fontSize: '14px' }}>Board Type: </span>
                <span style={{ color: '#00ff00', fontSize: '14px', fontWeight: 600 }}>{selectedBoardType.name}</span>
              </div>
            </div>

            {/* Right Side - Customization Options */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Title */}
              <div>
                <h2 style={{ fontSize: '32px', fontWeight: 'bold', color: '#fff', margin: '0 0 8px 0' }}>Custom LED Board</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <div style={{ color: '#FBBF24', fontSize: '18px' }}>★★★★★</div>
                  <span style={{ color: '#9CA3AF' }}>248 reviews</span>
                </div>
                <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#00CED1', margin: 0 }}>₹ {calculatePrice().toLocaleString()}</p>
              </div>

              {/* Board Type Selection */}
              <div>
                <label style={{ display: 'block', color: '#fff', fontWeight: 500, marginBottom: '12px' }}>Select Board Type</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                  {boardTypes.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => setSelectedBoardType(type)}
                      style={{
                        padding: '12px 8px',
                        borderRadius: '8px',
                        border: selectedBoardType.id === type.id ? '2px solid #00ff00' : '2px solid #374151',
                        backgroundColor: selectedBoardType.id === type.id ? 'rgba(0, 255, 0, 0.1)' : '#1a1a1a',
                        color: '#fff',
                        fontSize: '13px',
                        fontWeight: 500,
                        cursor: 'pointer',
                        textAlign: 'center',
                      }}
                    >
                      {type.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dimensions Input */}
              <div>
                <label style={{ display: 'block', color: '#fff', fontWeight: 500, marginBottom: '12px' }}>
                  Board Dimensions (inches)
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', color: '#9CA3AF', fontSize: '12px', marginBottom: '4px' }}>Width</label>
                    <input
                      type="number"
                      value={width}
                      onChange={(e) => setWidth(e.target.value)}
                      min="12"
                      max="240"
                      style={{
                        width: '100%',
                        backgroundColor: '#1a1a1a',
                        border: '2px solid #374151',
                        borderRadius: '8px',
                        padding: '12px',
                        color: '#fff',
                        fontSize: '16px',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', color: '#9CA3AF', fontSize: '12px', marginBottom: '4px' }}>Height</label>
                    <input
                      type="number"
                      value={height}
                      onChange={(e) => setHeight(e.target.value)}
                      min="6"
                      max="120"
                      style={{
                        width: '100%',
                        backgroundColor: '#1a1a1a',
                        border: '2px solid #374151',
                        borderRadius: '8px',
                        padding: '12px',
                        color: '#fff',
                        fontSize: '16px',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Upload Design */}
              <div>
                <label style={{ display: 'block', color: '#fff', fontWeight: 500, marginBottom: '12px' }}>
                  Upload Your Design (Optional)
                </label>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    border: '2px dashed #374151',
                    borderRadius: '8px',
                    padding: '24px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    backgroundColor: '#1a1a1a',
                    transition: 'border-color 0.2s',
                  }}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={{ display: 'none' }}
                  />
                  <div style={{ fontSize: '32px', marginBottom: '8px' }}>📁</div>
                  <p style={{ color: '#9CA3AF', fontSize: '14px', margin: 0 }}>
                    {uploadedImage ? 'Click to change image' : 'Click to upload logo or design'}
                  </p>
                  <p style={{ color: '#6B7280', fontSize: '12px', margin: '4px 0 0' }}>
                    PNG, JPG, SVG up to 10MB
                  </p>
                </div>
              </div>

              {/* Type Your Text */}
              <div>
                <label style={{ display: 'block', color: '#fff', fontWeight: 500, marginBottom: '12px' }}>
                  Type Your Message {uploadedImage && <span style={{ color: '#9CA3AF', fontWeight: 400 }}>(optional if design uploaded)</span>}
                </label>
                <textarea
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  placeholder="Enter your custom message..."
                  rows={3}
                  style={{
                    width: '100%',
                    backgroundColor: '#1a1a1a',
                    border: '2px solid #374151',
                    borderRadius: '8px',
                    padding: '16px',
                    color: '#fff',
                    fontSize: '16px',
                    fontFamily: selectedFont.fontFamily,
                    outline: 'none',
                    boxSizing: 'border-box',
                    resize: 'vertical',
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
                  maxHeight: '180px', 
                  overflowY: 'auto',
                  paddingRight: '4px',
                }}>
                  {fonts.map((font) => (
                    <button
                      key={font.id}
                      onClick={() => setSelectedFont(font)}
                      style={{
                        padding: '10px 8px',
                        borderRadius: '8px',
                        border: selectedFont.id === font.id ? '2px solid #00ff00' : '2px solid #374151',
                        backgroundColor: selectedFont.id === font.id ? 'rgba(0, 255, 0, 0.1)' : '#1a1a1a',
                        color: '#fff',
                        fontSize: '13px',
                        fontFamily: font.fontFamily,
                        cursor: 'pointer',
                      }}
                    >
                      {font.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Select LED Colour */}
              <div>
                <label style={{ display: 'block', color: '#fff', fontWeight: 500, marginBottom: '12px' }}>Select LED Colour</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                  {ledColors.map((color) => (
                    <button
                      key={color.id}
                      onClick={() => setSelectedColor(color)}
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        background: color.id === 'multi' ? 'linear-gradient(135deg, #FF0000, #00FF00, #0000FF)' : color.hex,
                        border: selectedColor.id === color.id ? '3px solid #fff' : '2px solid #333',
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

              {/* Add Ons */}
              <div>
                <label style={{ display: 'block', color: '#fff', fontWeight: 500, marginBottom: '12px' }}>Add Ons</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                  {addOns.map((addon) => (
                    <button
                      key={addon.id}
                      onClick={() => toggleAddOn(addon.id)}
                      style={{
                        padding: '14px',
                        borderRadius: '8px',
                        border: selectedAddOns.includes(addon.id) ? '2px solid #00ff00' : '2px solid #374151',
                        backgroundColor: selectedAddOns.includes(addon.id) ? 'rgba(0, 255, 0, 0.1)' : '#1a1a1a',
                        cursor: 'pointer',
                        textAlign: 'left',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '10px',
                      }}
                    >
                      <div style={{
                        width: '18px',
                        height: '18px',
                        borderRadius: '4px',
                        border: selectedAddOns.includes(addon.id) ? '2px solid #00ff00' : '2px solid #6B7280',
                        backgroundColor: selectedAddOns.includes(addon.id) ? '#00ff00' : 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        marginTop: '2px',
                      }}>
                        {selectedAddOns.includes(addon.id) && <span style={{ color: '#000', fontSize: '12px' }}>✓</span>}
                      </div>
                      <div style={{ flex: 1 }}>
                        <span style={{ display: 'block', color: '#fff', fontSize: '13px', fontWeight: 500 }}>{addon.name}</span>
                        <span style={{ display: 'block', color: '#9CA3AF', fontSize: '13px' }}>₹ {addon.price.toLocaleString()}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Additional Notes */}
              <div>
                <label style={{ display: 'block', color: '#fff', fontWeight: 500, marginBottom: '12px' }}>
                  Additional Notes / Requirements
                </label>
                <textarea
                  value={additionalNotes}
                  onChange={(e) => setAdditionalNotes(e.target.value)}
                  placeholder="Any special requirements, mounting preferences, installation location details..."
                  rows={3}
                  style={{
                    width: '100%',
                    backgroundColor: '#1a1a1a',
                    border: '2px solid #374151',
                    borderRadius: '8px',
                    padding: '14px',
                    color: '#fff',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box',
                    resize: 'vertical',
                  }}
                />
              </div>

              {/* Price Summary */}
              <div style={{ 
                backgroundColor: '#1a1a1a', 
                borderRadius: '8px', 
                padding: '16px', 
                border: '1px solid #374151',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: '#9CA3AF', fontSize: '14px' }}>Board Size:</span>
                  <span style={{ color: '#fff', fontSize: '14px' }}>{width}&quot; × {height}&quot; ({((parseFloat(width) * parseFloat(height)) / 144).toFixed(2)} sq.ft)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: '#9CA3AF', fontSize: '14px' }}>Board Type:</span>
                  <span style={{ color: '#fff', fontSize: '14px' }}>{selectedBoardType.name}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #374151', paddingTop: '12px', marginTop: '12px' }}>
                  <span style={{ color: '#fff', fontWeight: 600, fontSize: '16px' }}>Total Price:</span>
                  <span style={{ color: '#00ff00', fontSize: '24px', fontWeight: 'bold' }}>₹ {calculatePrice().toLocaleString()}</span>
                </div>
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
                <p style={{ color: '#fff', margin: 0 }}>Need help with your LED board?</p>
                <a 
                  href="https://wa.me/919999999999?text=Hi, I want to order a custom LED board"
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

        {/* Features Section */}
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '60px 24px' }}>
          <h3 style={{ color: '#00ff00', fontSize: '28px', fontWeight: 'bold', marginBottom: '24px' }}>Why Choose Our LED Boards?</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
            {[
              { icon: '💡', title: 'Ultra Bright LEDs', desc: 'Visible even in direct sunlight with 5000+ nits brightness' },
              { icon: '🔧', title: 'Easy Installation', desc: 'Wall mount or hanging options with included hardware' },
              { icon: '📱', title: 'Remote Control', desc: 'Change messages via WiFi from your phone' },
              { icon: '⚡', title: 'Energy Efficient', desc: '80% less power consumption than traditional signs' },
            ].map((feature, index) => (
              <div key={index} style={{
                backgroundColor: '#1a1a1a',
                borderRadius: '12px',
                padding: '24px',
                border: '1px solid #333',
                textAlign: 'center',
              }}>
                <div style={{ fontSize: '40px', marginBottom: '12px' }}>{feature.icon}</div>
                <h4 style={{ color: '#fff', fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>{feature.title}</h4>
                <p style={{ color: '#9CA3AF', fontSize: '14px', lineHeight: 1.5, margin: 0 }}>{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* WhatsApp Floating Button */}
        <a 
          href="https://wa.me/919999999999?text=Hi, I want to order a custom LED board"
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
