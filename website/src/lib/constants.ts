const _siteUrlString = (process.env.NEXT_PUBLIC_SITE_URL as string) || 'http://localhost:3000'
export const siteURL = new URL(_siteUrlString)
export const siteOrigin = siteURL.origin
