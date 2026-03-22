import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Projects - 8gent | AI & System Development",
  description:
    "Explore the ecosystem of 8gent including AI applications, agentic tools, and system roadmaps. See the development of a professional AI operating system.",
  keywords: [
    "8gent projects",
    "AI development",
    "Agentic system showcases",
    "8gent",
    "IAMAI Research",
    "RAG applications",
    "WebGPU projects",
    "React architecture",
    "Next.js projects",
    "AI consulting",
    "Dublin tech ecosystem",
    "LLM applications",
    "Creative Technology",
    "8gent",
    "Personal AI operating system",
  ],
  openGraph: {
    title: "Projects - 8gent | AI & System Development",
    description:
      "AI applications, agentic tools, and more. Explore the architecture of 8gent.",
    url: "https://8gent.app/projects",
    type: "website",
    images: [
      {
        url: "https://8gent.app/8gent-logo.png",
        width: 1200,
        height: 630,
        alt: "8gent - Projects",
      },
    ],
  },
  twitter: {
    title: "8gent Projects",
    description: "AI applications, agentic tools, and more. System architecture showcase.",
    card: "summary_large_image",
  },
  alternates: {
    canonical: "https://8gent.app/projects",
  },
};

export default function ProjectsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
