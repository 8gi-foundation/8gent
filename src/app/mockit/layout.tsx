import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Mockit - Device Mockup Generator | 8gent',
  description: 'Generate beautiful device mockups from any website. Capture screenshots in mobile, tablet, and desktop views, add animations, and export as PNG, GIF, JSON, or React code. Free mockup tool by 8gent.',
  keywords: [
    'mockup generator',
    'screenshot tool',
    'device frames',
    'responsive design',
    'web design',
    'iPhone mockup',
    'MacBook mockup',
    'iPad mockup',
    'free mockup tool',
    '8gent',
  ],
  openGraph: {
    title: 'Mockit - Free Device Mockup Generator',
    description: 'Generate beautiful device mockups from any website. iPhone, iPad, MacBook frames with animations and export options.',
    url: 'https://8gent.app/mockit',
    type: 'website',
    images: [
      {
        url: 'https://8gent.app/8gent-logo.png',
        width: 1200,
        height: 630,
        alt: 'Mockit - Device Mockup Generator by 8gent',
      },
    ],
  },
  twitter: {
    title: 'Mockit - Free Device Mockup Generator',
    description: 'Generate beautiful device mockups from any website.',
    card: 'summary_large_image',
    images: ['https://8gent.app/8gent-logo.png'],
  },
  alternates: {
    canonical: 'https://8gent.app/mockit',
  },
};

export default function MockitLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
