'use client';

import { usePathname } from 'next/navigation';
import React from 'react';
import { Navbar } from "@/shop-components/Navbar";
import { SimpleFooter } from "@/shop-components/SimpleFooter";

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHomePage = pathname === '/home';
  
  if (isHomePage) {
    return <>{children}</>;
  }
  
  return (
    <>
      <Navbar />
      <main className="pt-16 lg:pt-20 pb-20 lg:pb-0">
        {children}
      </main>
      <SimpleFooter />
    </>
  );
}
