import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/shop',
        disallow: [
          '/shop/admin/',
          '/shop/account/',
          '/shop/cart/',
          '/shop/checkout/',
          '/shop/orders/',
          '/shop/success/',
          '/shop/track-order/',
          '/_next/',
          '/*.json$',
          '/private/',
          '/temp/',
          '/shop/search?*',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: [
          '/shop',
          '/shop/neon-signage',
          '/shop/led-boards',
          '/shop/cafe',
          '/shop/gaming',
          '/shop/banners',
          '/shop/product/',
          '/shop/support',
        ],
        disallow: [
          '/shop/admin/',
          '/shop/api/',
          '/shop/account/',
          '/shop/cart/',
          '/shop/checkout/',
          '/shop/orders/',
          '/shop/success/',
          '/shop/track-order/',
        ],
      },
    ],
    sitemap: 'https://mountadvertising.vercel.app/shop/sitemap.xml',
    host: 'https://mountadvertising.vercel.app',
  }
}
