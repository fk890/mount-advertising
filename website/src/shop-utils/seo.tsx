import { Metadata } from 'next'
import { Product } from '@/shop-types/Product';

interface SEOProps {
  title?: string
  description?: string
  keywords?: string[]
  canonical?: string
  ogImage?: string
  ogType?: string
  twitterCard?: string
  noindex?: boolean
  product?: Product
  structuredData?: object
}

// Generate structured data for products
export function generateProductSchema(product: Product, baseUrl: string = 'https://mount-advertising.vercel.app') {
  const schema = {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.images.map(img => `${baseUrl}${img}`),
    brand: {
      '@type': 'Brand',
      name: 'Mount Advertising'
    },
    category: 'Advertising',
    offers: {
      '@type': 'Offer',
      url: `${baseUrl}/shop/product/${product.id}`,
      priceCurrency: 'USD',
      price: product.price.toString(),
      availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      condition: 'https://schema.org/NewCondition',
      seller: {
        '@type': 'Organization',
        name: 'Mount Advertising'
      }
    },
    ...(product.rating && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: product.rating,
        reviewCount: product.reviews || 0,
        bestRating: 5,
        worstRating: 1
      }
    }),    additionalProperty: Object.entries(product.details)
      .filter(([, value]) => value !== undefined)
      .map(([key, value]) => ({
        '@type': 'PropertyValue',
        name: key,
        value: value as string
      }))
  }
  
  return schema
}

// Generate organization schema
export function generateOrganizationSchema(baseUrl: string = 'https://mount-advertising.vercel.app') {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Mount Advertising',
    url: baseUrl,
    logo: `${baseUrl}/images/brand/mount-logo.svg`,
    description: 'Premium advertising products including neon signage, LED boards, banners, and display solutions for businesses.',
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      email: 'contact@mountadvertising.com'
    },
    sameAs: [
      'https://facebook.com/mountadvertising',
      'https://instagram.com/mountadvertising',
      'https://twitter.com/mountadvertising'
    ]
  }
}

// Generate website schema
export function generateWebsiteSchema(baseUrl: string = 'https://mount-advertising.vercel.app') {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Mount Advertising',
    url: baseUrl,
    description: 'Discover premium advertising products at Mount Advertising. Shop quality neon signage, LED boards, banners, and display solutions for your business.'
  }
}

// Generate breadcrumb schema
export function generateBreadcrumbSchema(items: Array<{name: string, url: string}>, baseUrl: string = 'https://mount-advertising.vercel.app') {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${baseUrl}${item.url}`
    }))
  }
}

// Generate Next.js metadata for pages
export function generateMetadata({
  title = 'Mount Advertising | Premium Signage & Display Solutions',
  description = 'Discover premium advertising products at Mount Advertising. Shop quality neon signage, LED boards, banners, and display solutions for your business.',
  keywords = ['advertising products', 'neon signage', 'LED boards', 'banners', 'display solutions', 'business signage', 'Mount Advertising'],
  canonical,
  ogImage = '/images/brand/mount-logo.svg',
  product,
  noindex = false
}: SEOProps): Metadata {
  const baseUrl = 'https://mount-advertising.vercel.app'
  
  // If it's a product page, customize the meta
  if (product) {
    title = `${product.name} | Mount Advertising - Premium Signage & Displays`
    description = `Shop the ${product.name} at Mount Advertising. Premium quality advertising product with excellent features. Order now for fast delivery.`
    keywords.push(...(product.tags || []))
    ogImage = product.images?.[0] || ogImage
  }
  
  const metadata: Metadata = {
    title,
    description,
    keywords,
    openGraph: {
      title,
      description,
      url: canonical || baseUrl,
      images: [ogImage],
      type: product ? 'article' : 'website'
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage]
    },
    ...(canonical ? { robots: { index: !noindex, follow: true } } : {})
  }
  
  return metadata
}

export function StructuredData({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}