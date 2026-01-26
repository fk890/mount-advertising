'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import AuthModal from './AuthModal'
import { toast } from 'sonner'

interface AuthenticatedLinkProps {
  href: string
  featureName: 'cart' | 'wishlist' | 'account'
  children: React.ReactNode
  className?: string
  onClick?: () => void
}

export default function AuthenticatedLink({ 
  href, 
  featureName, 
  children, 
  className,
  onClick 
}: AuthenticatedLinkProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [authModalTab, setAuthModalTab] = useState<'login' | 'signup'>('login')

  useEffect(() => {
    const checkAuth = () => {
      const user = localStorage.getItem('user')
      setIsAuthenticated(!!user)
    }
    
    checkAuth()
    
    // Listen for auth changes
    const handleStorageChange = () => checkAuth()
    window.addEventListener('storage', handleStorageChange)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  const handleClick = (e: React.MouseEvent) => {
    if (featureName === 'cart') {
      // Allow guest access to cart
      if (onClick) onClick()
      return
    }

    // For wishlist and account, check authentication
    if (!isAuthenticated) {
      e.preventDefault()
      // Instead of showing a modal, show a toast notification
      toast.info('Please log in to use the wishlist.', {
        action: {
          label: 'Login',
          onClick: () => {
            setAuthModalTab('login');
            setIsAuthModalOpen(true);
          },
        },
      });
      return
    }
    
    if (onClick) onClick()
  }

  const handleLogin = () => {
    setAuthModalTab('login')
    setIsAuthModalOpen(true)
  }

  const handleSignup = () => {
    setAuthModalTab('signup')
    setIsAuthModalOpen(true)
  }

  const closeAuthModal = () => {
    setIsAuthModalOpen(false)
  }

  return (
    <>
      <Link 
        href={href} 
        className={className}
        onClick={handleClick}
      >
        {children}
      </Link>

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={closeAuthModal}
        defaultTab={authModalTab}
      />
    </>
  )
}
