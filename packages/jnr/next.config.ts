import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Enable wildcard subdomains for multi-tenant routing
  // e.g., nick.8gentjr.app, emma.8gentjr.app
  async rewrites() {
    return {
      beforeFiles: [
        // Handle subdomain routing
        {
          source: '/:path*',
          has: [
            {
              type: 'host',
              value: '(?<subdomain>[^.]+)\\.8gentjr\\.app',
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
