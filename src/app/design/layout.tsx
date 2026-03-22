import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Design System Gallery - 8gent | 35+ UI Themes & Design Tokens",
  description:
    "Explore 35+ beautiful UI themes and design systems created by 8gent. Copy-ready prompts for AI design, dark/light mode support, and comprehensive design tokens. Perfect for developers and designers.",
  keywords: [
    "8gent design",
    "UI themes",
    "Design system",
    "Design tokens",
    "React themes",
    "TailwindCSS themes",
    "Dark mode themes",
    "Light mode themes",
    "AI design prompts",
    "Copy prompt design",
    "Theme gallery",
    "CSS design system",
    "Modern UI design",
    "Web design portfolio",
    "Design components",
    "Color schemes",
    "Typography systems",
    "Figma alternative",
  ],
  openGraph: {
    title: "Design System Gallery - 35+ UI Themes",
    description:
      "Beautiful UI themes with copy-ready AI prompts. Dark/light mode, comprehensive design tokens.",
    url: "https://8gent.app/design",
    type: "website",
    images: [
      {
        url: "https://8gent.app/8gent-logo.png",
        width: 1200,
        height: 630,
        alt: "8gent - Design System Gallery",
      },
    ],
  },
  twitter: {
    title: "Design System Gallery - 8gent",
    description: "35+ beautiful UI themes with AI-ready prompts. Perfect for developers.",
    card: "summary_large_image",
  },
  alternates: {
    canonical: "https://8gent.app/design",
  },
};

export default function DesignLayout({ children }: { children: React.ReactNode }) {
  return children;
}
