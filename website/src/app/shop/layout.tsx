import type { Metadata } from "next";
import { Inter, Cormorant_Garamond, Montserrat, Work_Sans } from "next/font/google";
import "./critical.css"; // Critical CSS first
import "./globals_clean.css";
import "./styles/product-card-overrides.css";
import { Toaster } from "@/shop-components/Toaster";
import ClientLayoutWrapper from "./components/ClientLayoutWrapper";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: 'swap',
  preload: true,
  fallback: ['system-ui', 'Arial', 'sans-serif'],
});

const cormorantGaramond = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
  preload: true,
  fallback: ['Georgia', 'serif'],
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ['300', '400', '500', '600', '700', '800'],
  display: 'swap',
  preload: true,
  fallback: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
});

const workSans = Work_Sans({
  variable: "--font-work-sans",
  subsets: ["latin"],
  weight: ['300', '400', '500', '600', '700'],
  style: ['normal', 'italic'],
  display: 'swap',
  preload: true,
  fallback: ['system-ui', 'Arial', 'sans-serif'],
});

// Optimize for performance - remove force-dynamic
// export const dynamic = 'force-dynamic';
// export const revalidate = 0;

export const metadata: Metadata = {
  metadataBase: new URL('https://mount-advertising.vercel.app'),
  title: {
    default: 'Mount Advertising - Premium Signage & Display Solutions',
    template: '%s | Mount Advertising'
  },
  description: 'Discover premium advertising solutions at Mount Advertising. Shop quality neon signage, LED boards, banners, and display solutions for your business.',
  keywords: ['advertising products', 'neon signage', 'LED boards', 'banners', 'display solutions', 'Mount Advertising', 'business signage'],
  authors: [{ name: 'Mount Advertising' }],
  creator: 'Mount Advertising',
  publisher: 'Mount Advertising',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://mount-advertising.vercel.app',
    siteName: 'Mount Advertising',
    title: 'Mount Advertising - Premium Signage & Display Solutions',
    description: 'Discover premium advertising solutions at Mount Advertising. Shop quality neon signage, LED boards, banners, and displays.',
    images: [
      {
        url: '/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Mount Advertising Products Collection'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mount Advertising - Premium Signage & Display Solutions',
    description: 'Discover premium advertising solutions at Mount Advertising. Shop quality neon signage, LED boards, and display solutions.',
    images: ['/images/og-image.jpg']
  },
  alternates: {
    canonical: 'https://mount-advertising.vercel.app'
  },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-16x16.svg', type: 'image/svg+xml', sizes: '16x16' },
      { url: '/favicon-32x32.svg', type: 'image/svg+xml', sizes: '32x32' }
    ],
    apple: [
      { url: '/apple-touch-icon.svg', type: 'image/svg+xml', sizes: '180x180' }
    ]
  }
};

// Removed LayoutWrapper component - now imported as ClientLayoutWrapper from components

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`${inter.variable} ${cormorantGaramond.variable} ${montserrat.variable} ${workSans.variable}`}
      style={{ fontFamily: 'var(--font-basement-grotesque)' }}
    >
      <Toaster />
      <ClientLayoutWrapper>
        {children}
      </ClientLayoutWrapper>
    </div>
  );
}
