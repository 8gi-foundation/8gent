import { Metadata } from "next";

export const metadata: Metadata = {
  title: "System Evolution - The Journey of 8gent",
  description:
    "Discover the evolution of 8gent, an AI-native operating system designed for high-performance productivity. From conceptual phases to technical architecture and multi-agent orchestration.",
  keywords: [
    "8gent evolution",
    "AI-native OS journey",
    "Systems Architecture",
    "Product Evolution",
    "Agentic Orchestration",
    "Design-led Engineering",
  ],
  openGraph: {
    title: "System Evolution - 8gent",
    description:
      "The technical and product journey of 8gent, from conceptual phase to agentic core.",
    url: "https://8gent.app/story",
    type: "profile",
    images: [
      {
        url: "https://8gent.app/8gent-logo.png",
        width: 1200,
        height: 630,
        alt: "8gent - AI-Native Operating System",
      },
    ],
  },
  twitter: {
    title: "System Evolution - 8gent",
    description: "The journey of building an AI-native operating system from scratch.",
    card: "summary_large_image",
  },
  alternates: {
    canonical: "https://8gent.app/story",
  },
};

export default function StoryLayout({ children }: { children: React.ReactNode }) {
  return children;
}
