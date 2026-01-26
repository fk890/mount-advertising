import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// Lazy load the shop wrapper to avoid slowing down main website
const ShopPageContent = dynamic(
  () => import('./ShopPageContent').then(mod => mod.default),
  { 
    loading: () => (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-white mb-2">Loading Shop...</h1>
          <p className="text-gray-400">Please wait while we load your advertising products</p>
        </div>
      </div>
    ),
    ssr: true,
  }
);

export default function ShopPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ShopPageContent />
    </Suspense>
  );
}
