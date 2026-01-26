'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { ShoppingBag, Menu, X, User, Package, ChevronRight, Sparkles, Clock, Search } from 'lucide-react'
import { getCart } from '@/shop-utils/cartWishlist';
import { AuthDropdown } from './AuthDropdown';
import ClientOnly from './ClientOnly';
import { SlideCart } from './SlideCart';

type SaleConfig = {
  enabled?: boolean;
  endsAt?: string;
  headline?: string;
  promo?: string;
};

const fallbackSaleConfig: SaleConfig = {
  enabled: true,
  endsAt: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
  headline: 'Mount Advertising Sale',
  promo: 'Mount Advertising Sale is HERE! Get Flat 30% Off Site-Wide for Limited-Time Only',
};

export function Navbar() {
  const [cartCount, setCartCount] = useState(0)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [user, setUser] = useState<{ firstName: string; lastName: string; email: string } | null>(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [saleConfig, setSaleConfig] = useState<SaleConfig>(fallbackSaleConfig)
  const [countdown, setCountdown] = useState<string | null>(null)

  const parseSaleConfig = useCallback((): SaleConfig => {
    try {
      const stored = typeof window !== 'undefined' ? localStorage.getItem('saleConfig') : null
      if (!stored) return fallbackSaleConfig
      const parsed = JSON.parse(stored)
      return {
        enabled: parsed.enabled ?? true,
        endsAt: parsed.endsAt || fallbackSaleConfig.endsAt,
        headline: parsed.headline || fallbackSaleConfig.headline,
        promo: parsed.promo || fallbackSaleConfig.promo,
      }
    } catch (error) {
      console.warn('Using fallback sale config', error)
      return fallbackSaleConfig
    }
  }, [])

  const refreshSaleConfig = useCallback(() => {
    const config = parseSaleConfig()
    setSaleConfig(config)
  }, [parseSaleConfig])

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024 && isMenuOpen) {
        setIsMenuOpen(false)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [isMenuOpen])

  useEffect(() => {    
    function updateCounts() {
      if (typeof window !== 'undefined') {
        setCartCount(getCart().length)
      }
    }
    function updateUser() {
      if (typeof window !== 'undefined') {
        const storedUser = localStorage.getItem('user')
        if (storedUser) {
          try {
            setUser(JSON.parse(storedUser))
          } catch (error) {
            console.error('Error parsing user data:', error)
            localStorage.removeItem('user')
            setUser(null)
          }
        } else {
          setUser(null)
        }
      }
    }
    
    updateCounts()
    updateUser()
    refreshSaleConfig()
    
    window.addEventListener('storage', updateCounts)
    window.addEventListener('cartWishlistUpdate', updateCounts)
    window.addEventListener('storage', updateUser)
    window.addEventListener('storage', refreshSaleConfig)
    window.addEventListener('saleConfigUpdate', refreshSaleConfig)
    return () => {
      window.removeEventListener('storage', updateCounts)
      window.removeEventListener('cartWishlistUpdate', updateCounts)
      window.removeEventListener('storage', updateUser)
      window.removeEventListener('storage', refreshSaleConfig)
      window.removeEventListener('saleConfigUpdate', refreshSaleConfig)
    }
  }, [refreshSaleConfig])

  useEffect(() => {
    if (!saleConfig?.enabled || !saleConfig.endsAt) {
      setCountdown(null)
      return
    }

    const target = new Date(saleConfig.endsAt).getTime()
    if (Number.isNaN(target)) {
      setCountdown(null)
      return
    }

    const tick = () => {
      const diff = target - Date.now()
      if (diff <= 0) {
        setCountdown('00h : 00m : 00s')
        return
      }
      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff / (1000 * 60)) % 60)
      const seconds = Math.floor((diff / 1000) % 60)
      const pad = (v: number) => v.toString().padStart(2, '0')
      setCountdown(`${pad(hours)}h : ${pad(minutes)}m : ${pad(seconds)}s`)
    }

    tick()
    const id = window.setInterval(tick, 1000)
    return () => window.clearInterval(id)
  }, [saleConfig])
  const handleLogin = (userData: { firstName: string; lastName: string; email: string }) => {
    setUser(userData)
    window.dispatchEvent(new Event('storage'))
  }
  const handleLogout = () => {
    localStorage.removeItem('user')
    setUser(null)
    window.location.reload()
  };

  return (
    <ClientOnly fallback={<div className="h-16 lg:h-20 bg-[#0a0a0a]" />}>
      <nav className="fixed top-0 left-0 w-full z-50 neon-nav">
        {/* Top alert bar */}
        {saleConfig?.enabled !== false && saleConfig.headline && saleConfig.endsAt && (
          <div className="nav-alert-bar">
            <div className="inner nav-inner">
              <div className="flex items-center space-x-2">
                <Sparkles className="h-4 w-4 text-[#c8ff00]" />
                <span className="text-xs sm:text-sm font-semibold tracking-wide uppercase">{saleConfig.headline}</span>
              </div>
              <div className="flex items-center space-x-1 text-xs sm:text-sm font-medium">
                <span>Ends in</span>
                <Clock className="h-4 w-4" />
                <span>{countdown || '--h : --m : --s'}</span>
              </div>
            </div>
          </div>
        )}

        {/* Promo band */}
        {saleConfig?.enabled !== false && saleConfig.promo && (
          <div className="nav-promo-band">
            <div className="inner nav-inner promo-inner">
              <span className="nav-promo-text">{saleConfig.promo}</span>
            </div>
          </div>
        )}

        <div className="nav-shell">
          <div className="nav-row h-[72px] lg:h-[88px]">
            {/* Left: Menu + Logo */}
            <div className="flex items-center gap-3">
              {/* Mobile hamburger - hidden on screens >= 1024px */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="mobile-menu-toggle p-2 text-white neon-link"
                aria-label="Toggle menu"
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
              <Link href="/shop" className="flex items-center select-none">
                <span className="text-lg sm:text-xl lg:text-2xl font-bold tracking-wide text-white leading-none whitespace-nowrap neon-text" style={{ fontFamily: "var(--font-montserrat)", letterSpacing: "0.02em" }}>Mount Advertising</span>
              </Link>
            </div>

            {/* Center: Desktop Menu */}
            <div className="hidden lg:flex nav-links items-center gap-6">
              <Link href="/shop" className="text-sm font-medium neon-link whitespace-nowrap">Home</Link>
              <Link href="/shop/neon-signage" className="text-sm font-medium neon-link whitespace-nowrap" prefetch>Neon Signage</Link>
              <Link href="/shop/led-boards" className="text-sm font-medium neon-link whitespace-nowrap" prefetch>LED Boards</Link>
              <Link href="/shop/banners" className="text-sm font-medium neon-link whitespace-nowrap" prefetch>Banners</Link>
              <Link href="/shop/displays" className="text-sm font-medium neon-link whitespace-nowrap" prefetch>Displays</Link>
            </div>

            {/* Right: Icons & Auth */}
            <div className="nav-right space-x-1 sm:space-x-2 lg:space-x-4">
              <Link href="/shop/search" className="p-2 neon-link hidden sm:block">
                <Search className="h-5 w-5 lg:h-6 lg:w-6" />
              </Link>
              <button 
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 neon-link"
              >
                <ShoppingBag className="h-5 w-5 lg:h-6 lg:w-6" />
                <ClientOnly>
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 neon-chip text-xs rounded-full h-4 w-4 lg:h-5 lg:w-5 flex items-center justify-center font-sans font-bold text-[10px]">
                      {cartCount}
                    </span>
                  )}
                </ClientOnly>
              </button>
              <div className="hidden lg:block ml-2">
                {user ? (
                  <ClientOnly>
                    <AuthDropdown 
                      user={user}
                      onLogin={handleLogin}
                      onLogout={handleLogout}
                    />
                  </ClientOnly>
                ) : (
                  <Link href="/shop/login" className="px-4 py-2 neon-link text-sm font-normal">
                    Login
                  </Link>
                )}
              </div>
            </div>

          </div>

          {/* Thin horizontal guide under the primary nav to keep items aligned */}
          <div className="mt-1 hidden h-px w-full bg-gradient-to-r from-[#2df5ff40] via-[#c8ff00] to-[#ff3df240] lg:block" />
        </div>
        {/* Mobile Menu - Full Screen Overlay */}
        {isMenuOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 z-40"
              style={{ display: 'block' }}
              onClick={() => setIsMenuOpen(false)}
            />
            
            {/* Slide-in Menu from Right */}
            <div 
              className="fixed top-0 right-0 h-full bg-[#0b0b12] z-50 transform transition-transform duration-300 ease-in-out shadow-2xl"
              style={{ 
                width: '80%', 
                maxWidth: '320px',
                transform: isMenuOpen ? 'translateX(0)' : 'translateX(100%)'
              }}
            >
                <div className="flex flex-col h-full">
                  {/* Header with Close Button */}
                  <div className="flex items-center justify-between p-6 border-b border-gray-800">
                    <span className="text-xl font-bold neon-text">Menu</span>
                    <button
                      onClick={() => setIsMenuOpen(false)}
                      className="p-2 rounded-full hover:bg-gray-800 transition-colors neon-link"
                    >
                      <X className="h-6 w-6 text-white" />
                    </button>
                  </div>
                  
                  {/* Account Section with Circle Avatar - Now at the bottom for better UX */}
                  <div className="px-6 py-6 border-b border-gray-800">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center">
                        <User className="h-6 w-6 text-gray-300" />
                      </div>
                      <div className="flex-1">
                        {user ? (
                          <div>
                            <p className="text-lg font-medium text-white">{user.firstName} {user.lastName}</p>
                            <p className="text-sm text-gray-400">{user.email}</p>
                          </div>
                        ) : (
                          <div>
                            <p className="text-sm text-gray-400 mb-2">Access your account</p>
                            <div className="flex space-x-2">
                                <Link href="/shop/login" className="px-4 py-2 text-sm rounded-md neon-btn" onClick={() => setIsMenuOpen(false)}>
                                    Login
                                </Link>
                                <Link href="/shop/login?signup=true" className="px-4 py-2 text-sm rounded-md neon-btn-secondary" onClick={() => setIsMenuOpen(false)}>
                                    Create Account
                                </Link>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Menu Items */}
                  <div className="flex-1 overflow-y-auto">
                    <div className="px-6 py-4 space-y-1">
                      {/* Navigation links */}
                      <Link href="/shop" className="block py-4 border-b border-gray-800" onClick={() => setIsMenuOpen(false)}>
                        <span className="text-lg font-medium neon-link">Home</span>
                      </Link>
                      
                      {/* Products Category Links */}
                      <div className="py-4 border-b border-gray-800">
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-medium neon-link">Products</span>
                          <ChevronRight className="h-5 w-5 text-gray-500" />
                        </div>
                        <div className="mt-3 ml-4 space-y-3">
                          <Link href="/shop/neon-signage" className="block text-base neon-link" onClick={() => setIsMenuOpen(false)} prefetch>Neon Signage</Link>
                          <Link href="/shop/led-boards" className="block text-base neon-link" onClick={() => setIsMenuOpen(false)} prefetch>LED Boards</Link>
                          <Link href="/shop/banners" className="block text-base neon-link" onClick={() => setIsMenuOpen(false)} prefetch>Banners</Link>
                          <Link href="/shop/displays" className="block text-base neon-link" onClick={() => setIsMenuOpen(false)} prefetch>Displays</Link>
                        </div>
                      </div>

                      {/* Account link for logged-in users */}
                      {user && (
                        <Link href="/shop/account" className="block py-4 border-b border-gray-800" onClick={() => setIsMenuOpen(false)}>
                          <span className="text-lg font-medium neon-link">Account</span>
                        </Link>
                      )}
                    </div>
                  </div>

                  {/* Footer with Logout button */}
                  {user ? (
                    <div className="p-6 mt-auto border-t border-gray-800">
                      <button 
                        onClick={() => {
                          handleLogout();
                          setIsMenuOpen(false);
                        }}
                        className="w-full text-center px-4 py-3 rounded-md neon-btn-secondary"
                      >
                        Logout
                      </button>
                    </div>
                  ) : (
                     <div className="p-6 mt-auto border-t border-gray-800">
                        {/* This space is intentionally left blank for guests, login is at the top */}
                     </div>
                  )}
                </div>
              </div>
            </>
          )}
      </nav>
      
      {/* Sliding Cart Panel */}
      <SlideCart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </ClientOnly>
  )
}
