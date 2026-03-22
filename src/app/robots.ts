import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/_next/', '/private/', '/vault/upload', '/s/', '/settings'],
    },
    sitemap: 'https://8gent.app/sitemap.xml',
  }
}
