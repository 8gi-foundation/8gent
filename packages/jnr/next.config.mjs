/** @type {import('next').NextConfig} */
const nextConfig = {
  // Redirect demo.8gentjr.com root to /app (bypass static CDN cache)
  async redirects() {
    return [
      {
        source: '/',
        has: [{ type: 'host', value: 'demo.8gentjr.com' }],
        destination: '/app',
        permanent: false,
      },
    ];
  },

  // Enable wildcard subdomains for multi-tenant routing
  // e.g., nick.8gent.app, emma.8gent.app
  // Mode (kid/adult) is a setting toggle, not a domain change
  async rewrites() {
    return {
      beforeFiles: [
        // Handle subdomain routing for *.8gent.app
        {
          source: '/:path*',
          has: [
            {
              type: 'host',
              // Match subdomains except 'www' - www.8gent.app routes normally
              value: '(?<subdomain>(?!www)[^.]+)\\.8gent\\.app',
            },
          ],
          destination: '/tenant/:subdomain/:path*',
        },
      ],
      afterFiles: [],
      fallback: [],
    };
  },

  // Transpile monorepo packages
  transpilePackages: ['@8gent/toolshed'],

  // Image optimization for AAC cards
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'fal.media',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.vercel-storage.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'api.arasaac.org',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'static.arasaac.org',
        pathname: '/**',
      },
    ],
  },

  // Experimental features
  experimental: {
    // Enable server actions for form handling
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
};

export default nextConfig;
