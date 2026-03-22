import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Avatar - 8gent | Interactive 3D Avatar Generator",
  description:
    "Generate interactive 3D avatars from photos using AI. Cursor-tracking rotation and 3D model export capabilities. Inspired by 0xGF's avatar-3d project.",
  keywords: [
    "3D Avatar",
    "AI Avatar Generator",
    "Interactive Avatar",
    "Cursor Tracking",
    "Three.js Avatar",
    "AI Photo to 3D",
    "Replicate AI",
    "Next.js Avatar",
  ],
  openGraph: {
    title: "Avatar - Interactive 3D Avatar Generator",
    description: "Generate interactive 3D avatars from photos using AI.",
    url: "https://8gent.app/avatar",
    type: "website",
    images: [
      {
        url: "/8gent-logo.png",
        width: 1200,
        height: 630,
        alt: "8gent - Avatar Generator",
      },
    ],
  },
  twitter: {
    title: "Avatar - Interactive 3D Avatar Generator",
    description: "Generate interactive 3D avatars from photos using AI.",
    card: "summary_large_image",
  },
  alternates: {
    canonical: "https://8gent.app/avatar",
  },
};

export default function AvatarLayout({ children }: { children: React.ReactNode }) {
  return children;
}
