import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Inspirations - 8gent | People Who Inspire My Work",
  description:
    "Discover the designers, developers, and thought leaders who inspire 8gent's work. A curated collection of innovative minds in tech, design, and product.",
  keywords: [
    "8gent inspirations",
    "Tech inspirations",
    "Design inspirations",
    "Developer inspirations",
    "Product leaders",
    "Thought leaders tech",
    "Creative inspirations",
    "Dublin tech community",
  ],
  openGraph: {
    title: "Inspirations - 8gent",
    description: "People who inspire my work in tech, design, and product.",
    url: "https://8gent.app/inspirations",
    type: "website",
    images: [
      {
        url: "https://8gent.app/8gent-logo.png",
        width: 1200,
        height: 630,
        alt: "8gent - Inspirations",
      },
    ],
  },
  twitter: {
    title: "Inspirations - 8gent",
    description: "The people who inspire my work.",
    card: "summary_large_image",
  },
  alternates: {
    canonical: "https://8gent.app/inspirations",
  },
};

export default function InspirationsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
