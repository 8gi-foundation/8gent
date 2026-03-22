import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Music - 8gent | Creative Technologist & Music Producer",
  description:
    "Explore 8gent's music production work and audio creations. From ReLOVEution band days in Brazil to vibe coding tracks. A creative technologist who bridges music and technology.",
  keywords: [
    "8gent music",
    "Music producer Dublin",
    "Creative Technologist music",
    "ReLOVEution band",
    "Vibe coding music",
    "Tech and music",
    "Ireland music producer",
    "Brazilian Irish musician",
    "AI and music",
    "Audio production",
  ],
  openGraph: {
    title: "Music - 8gent",
    description: "Music production and audio creations from a Creative Technologist.",
    url: "https://8gent.app/music",
    type: "website",
    images: [
      {
        url: "https://8gent.app/8gent-logo.png",
        width: 1200,
        height: 630,
        alt: "8gent - Music",
      },
    ],
  },
  twitter: {
    title: "8gent's Music",
    description: "Music production from a Creative Technologist.",
    card: "summary_large_image",
  },
  alternates: {
    canonical: "https://8gent.app/music",
  },
};

export default function MusicLayout({ children }: { children: React.ReactNode }) {
  return children;
}
