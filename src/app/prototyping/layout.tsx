import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Rapid Prototyping - 8gent | MVP Development & High-Velocity Engineering",
  description:
    "Rapid prototyping and MVP development services by 8gent. From concept to production in days, not months. React, Next.js, TypeScript, and AI-native development.",
  keywords: [
    "8gent prototyping",
    "Rapid prototyping Dublin",
    "MVP development Ireland",
    "High-velocity development",
    "Fast prototyping",
    "Concept to production",
    "React prototyping",
    "Next.js MVP",
    "TypeScript development",
    "AI-native prototyping",
    "Startup MVP",
    "Product prototype",
    "Cursor IDE developer",
    "v0.dev prototyping",
  ],
  openGraph: {
    title: "Rapid Prototyping - 8gent",
    description: "MVP development from concept to production. High-velocity engineering.",
    url: "https://8gent.app/prototyping",
    type: "website",
    images: [
      {
        url: "https://8gent.app/8gent-logo.png",
        width: 1200,
        height: 630,
        alt: "8gent - Rapid Prototyping",
      },
    ],
  },
  twitter: {
    title: "Rapid Prototyping - 8gent",
    description: "MVP development in days, not months.",
    card: "summary_large_image",
  },
  alternates: {
    canonical: "https://8gent.app/prototyping",
  },
};

export default function PrototypingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
