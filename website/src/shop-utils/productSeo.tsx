import { Product } from '@/shop-types/Product';
import { Metadata } from 'next';
import { generateMetadata as generateBasicMetadata, generateProductSchema, generateBreadcrumbSchema, StructuredData } from './seo'

export function generateProductMetadata(product: Product): Metadata {
  const baseUrl = 'https://mount-advertising.vercel.app'
  const title = `Mount Advertising | ${product.name} - Premium Signage & Displays`;
  const description = `Discover the ${product.name} from Mount Advertising. Premium quality advertising product with excellent features. Order now for fast delivery.`;

  return generateBasicMetadata({
    title,
    description,
    keywords: [
      'Mount Advertising',
      product.name,
      'neon signage',
      'LED boards',
      'banners',
      'displays',
      'advertising products',
      'business signage',
      ...(product.collection ? [product.collection] : []),
      ...(product.tags || [])
    ],
    canonical: `${baseUrl}/shop/product/${product.id}`,
    ogImage: product.images[0],
    product: product
  })
}

export function generateProductStructuredData(product: Product) {
  const baseUrl = 'https://mount-advertising.vercel.app'
  
  const productSchema = generateProductSchema(product, baseUrl)
  
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/shop' },
    { name: 'Products', url: '/shop' },
    ...(product.collection ? [{ name: product.collection, url: `/${product.collection.toLowerCase()}` }] : []),
    { name: product.name, url: `/shop/product/${product.id}` }
  ], baseUrl)
  
  return [productSchema, breadcrumbSchema]
}

export function generateProductJsonLd(product: Product) {
  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: product.images,
    description: `Discover the ${product.name} from Mount Advertising. Premium quality advertising product with excellent features. Order now for fast delivery.`,
    sku: product.id,
    brand: {
      '@type': 'Brand',
      name: 'Mount Advertising',
    },
    offers: {
      '@type': 'Offer',
      url: `https://mount-advertising.vercel.app/shop/product/${product.id}`,
      priceCurrency: 'USD',
      price: product.price.toString(),
      priceValidUntil: new Date().toISOString().split('T')[0],
      itemCondition: 'https://schema.org/NewCondition',
      availability: 'https://schema.org/InStock',
      shippingDetails: {
        '@type': 'OfferShippingDetails',
        shippingRate: {
          '@type': 'MonetaryAmount',
          value: '9.95',
          currency: 'USD'
        }
      }
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: product.rating?.toString() || '5',
      reviewCount: product.reviews?.toString() || '10',
    },
  }

  return (
    <StructuredData data={productJsonLd} />
  )
}

const productSeoUtils = {
  generateProductMetadata,
  generateProductStructuredData,
  generateProductJsonLd
}
export default productSeoUtils