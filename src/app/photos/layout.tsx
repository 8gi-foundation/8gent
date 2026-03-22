import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Photos - 8gent | Visual Journey & Photography",
  description:
    "Photo gallery from 8gent. Visual documentation of life, work, and travels between Dublin, Ireland and Brazil. A Creative Technologist's perspective.",
  keywords: [
    "8gent photos",
    "8gent photography",
    "Dublin photography",
    "Ireland photos",
    "Brazil photos",
    "Creative Technologist gallery",
    "Tech leader photography",
  ],
  openGraph: {
    title: "Photos - 8gent",
    description: "Visual journey and photography from a Creative Technologist.",
    url: "https://8gent.app/photos",
    type: "website",
    images: [
      {
        url: "https://8gent.app/8gent-logo.png",
        width: 1200,
        height: 630,
        alt: "8gent - Photos",
      },
    ],
  },
  twitter: {
    title: "8gent's Photos",
    description: "Photography from a Creative Technologist.",
    card: "summary_large_image",
  },
  alternates: {
    canonical: "https://8gent.app/photos",
  },
};

export default function PhotosLayout({ children }: { children: React.ReactNode }) {
  return children;
}
