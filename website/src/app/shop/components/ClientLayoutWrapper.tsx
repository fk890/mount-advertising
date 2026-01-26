'use client'

import React from 'react';
import { usePathname } from 'next/navigation';
import { Navbar } from "@/shop-components/Navbar";
import { SimpleFooter } from "@/shop-components/SimpleFooter";
import ClientOnly from "@/shop-components/ClientOnly";

export default function ClientLayoutWrapper({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ClientOnly>
        <Navbar />
      </ClientOnly>
      <main className="pt-16 lg:pt-20 pb-20 lg:pb-0">
        {children}
      </main>
      <ClientOnly>
        <SimpleFooter />
      </ClientOnly>
    </>
  );
}
