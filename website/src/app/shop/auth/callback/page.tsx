'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const userParam = searchParams.get('user');
    
    if (userParam) {
      try {
        // Decode the base64 user data
        const userData = JSON.parse(atob(userParam));
        
        // Store user data in localStorage
        localStorage.setItem('user', JSON.stringify(userData));
        
        // Dispatch storage event to update navbar
        window.dispatchEvent(new Event('storage'));
        window.dispatchEvent(new CustomEvent('cartWishlistUpdate'));
        
        // Redirect to account page
        router.replace('/shop/account');
      } catch (error) {
        console.error('Error processing auth callback:', error);
        router.replace('/shop/login?error=callback_processing');
      }
    } else {
      router.replace('/shop/login?error=no_user_data');
    }
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#c8ff00] mx-auto mb-4"></div>
        <p className="text-white text-lg">Completing sign in...</p>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    }>
      <CallbackContent />
    </Suspense>
  );
}
