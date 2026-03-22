import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/_next/', '/private/', '/tenant/'],
    },
    sitemap: 'https://8gentjr.com/sitemap.xml',
  }
}
