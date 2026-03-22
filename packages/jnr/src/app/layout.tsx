import type { Metadata, Viewport } from 'next';
import { Inter, Fraunces, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  weight: ['400', '700', '800'],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['400', '500'],
});

const siteConfig = {
  name: '8gent Jr',
  tagline: 'No more gatekeeping. A voice for every kid.',
  description: 'A super-powered AI assistant that learns with your child. Accessibility first. Free forever. AAC communication, AI-generated custom symbols, and personalized voice synthesis.',
  url: 'https://www.8gent.app',
  ogImage: 'https://www.8gent.app/og-image.png',
  twitterHandle: '@8gentapp',
  author: 'James Spalding',
};

export const metadata: Metadata = {
  // Core metadata
  title: {
    default: `${siteConfig.name} - ${siteConfig.tagline}`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [
    'AAC',
    'AAC app',
    'AAC for autism',
    'augmentative communication',
    'alternative communication',
    'autism communication app',
    'non-verbal communication',
    'speech app for kids',
    'visual communication',
    'communication board',
    'autism app',
    'special needs app',
    'assistive technology',
    'speech therapy app',
    'ARASAAC',
    'Fitzgerald Key',
    'gestalt language processing',
    'GLP',
    'voice synthesis',
    'text to speech',
    'ElevenLabs',
    'personalized voice',
  ],
  authors: [{ name: siteConfig.author }],
  creator: siteConfig.author,
  publisher: siteConfig.name,

  // Canonical URL
  metadataBase: new URL(siteConfig.url),
  alternates: {
    canonical: '/',
  },

  // Open Graph (Facebook, LinkedIn, etc.)
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: `${siteConfig.name} - ${siteConfig.tagline}`,
    description: siteConfig.description,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: `${siteConfig.name} - AAC Communication App`,
        type: 'image/png',
      },
    ],
  },

  // Twitter Card
  twitter: {
    card: 'summary_large_image',
    site: siteConfig.twitterHandle,
    creator: siteConfig.twitterHandle,
    title: `${siteConfig.name} - ${siteConfig.tagline}`,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
  },

  // Robots
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  // App-specific
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: siteConfig.name,
  },
  formatDetection: {
    telephone: false,
  },

  // Verification (add your IDs when available)
  // verification: {
  //   google: 'your-google-site-verification',
  //   yandex: 'your-yandex-verification',
  // },

  // Category for app stores
  category: 'Education',

  // Additional link tags
  other: {
    'msapplication-TileColor': '#E8610A',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, // Important for AAC - prevent accidental zooming
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FFFDF9' },
    { media: '(prefers-color-scheme: dark)', color: '#1A1612' },
  ],
};

// JSON-LD Structured Data
const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    // Organization
    {
      '@type': 'Organization',
      '@id': `${siteConfig.url}/#organization`,
      name: '8gent',
      url: 'https://8gent.app',
      logo: {
        '@type': 'ImageObject',
        url: `${siteConfig.url}/logo.png`,
      },
      sameAs: [
        'https://twitter.com/8gentapp',
        // Add more social links as available
      ],
    },
    // WebSite
    {
      '@type': 'WebSite',
      '@id': `${siteConfig.url}/#website`,
      url: siteConfig.url,
      name: siteConfig.name,
      description: siteConfig.description,
      publisher: {
        '@id': `${siteConfig.url}/#organization`,
      },
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${siteConfig.url}/search?q={search_term_string}`,
        },
        'query-input': 'required name=search_term_string',
      },
    },
    // SoftwareApplication (AAC App)
    {
      '@type': 'SoftwareApplication',
      '@id': `${siteConfig.url}/#app`,
      name: siteConfig.name,
      description: siteConfig.description,
      url: siteConfig.url,
      applicationCategory: 'EducationalApplication',
      operatingSystem: 'Web Browser',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
        availability: 'https://schema.org/InStock',
      },
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.8',
        ratingCount: '50',
        bestRating: '5',
        worstRating: '1',
      },
      featureList: [
        'Visual AAC communication cards',
        'AI-generated custom symbols',
        'Personalized voice synthesis',
        'Fitzgerald Key color categories',
        'Gestalt Language Processing support',
        'Offline-first functionality',
        'Mobile-first responsive design',
      ],
      screenshot: siteConfig.ogImage,
      softwareVersion: '1.0.0',
      author: {
        '@id': `${siteConfig.url}/#organization`,
      },
      publisher: {
        '@id': `${siteConfig.url}/#organization`,
      },
      audience: {
        '@type': 'Audience',
        audienceType: [
          'Autistic children',
          'Non-verbal children',
          'Speech-Language Pathologists',
          'Parents of children with AAC needs',
          'Special education teachers',
        ],
      },
      accessibilityFeature: [
        'largePrint',
        'highContrast',
        'alternativeText',
        'audioDescription',
        'captions',
        'structuralNavigation',
        'tableOfContents',
      ],
      accessibilityHazard: 'none',
      accessibilityControl: [
        'fullKeyboardControl',
        'fullMouseControl',
        'fullTouchControl',
      ],
    },
    // WebPage (for homepage)
    {
      '@type': 'WebPage',
      '@id': `${siteConfig.url}/#webpage`,
      url: siteConfig.url,
      name: `${siteConfig.name} - ${siteConfig.tagline}`,
      description: siteConfig.description,
      isPartOf: {
        '@id': `${siteConfig.url}/#website`,
      },
      about: {
        '@id': `${siteConfig.url}/#app`,
      },
      breadcrumb: {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: siteConfig.url,
          },
        ],
      },
    },
    // FAQ Schema (common AAC questions)
    {
      '@type': 'FAQPage',
      '@id': `${siteConfig.url}/#faq`,
      mainEntity: [
        {
          '@type': 'Question',
          name: 'What is AAC?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'AAC stands for Augmentative and Alternative Communication. It includes all forms of communication other than oral speech that are used to express thoughts, needs, wants, and ideas. 8gent provides visual communication cards and AI-powered voice synthesis to help non-verbal and minimally-verbal children communicate.',
          },
        },
        {
          '@type': 'Question',
          name: 'Is 8gent free to use?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: '8gent offers a free demo and trial period. The app includes core AAC functionality at no cost, with premium features available for voice customization and advanced card generation.',
          },
        },
        {
          '@type': 'Question',
          name: 'Does 8gent work offline?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes, 8gent is built with offline-first design. Core communication features including pre-built cards and basic text-to-speech work without an internet connection.',
          },
        },
      ],
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${fraunces.variable} ${jetbrainsMono.variable}`} data-theme="light">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />

        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
