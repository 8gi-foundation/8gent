import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Resume - 8gent | Creative Technologist & AI Product Leader",
  description:
    "8gent's professional resume. 12+ years experience in product strategy, AI development, and full-stack engineering. Based in Dublin, Ireland. Available for CPO, Product Lead, and AI consulting roles.",
  keywords: [
    "8gent resume",
    "8gent CV",
    "Creative Technologist resume",
    "AI Product Leader CV",
    "CPO resume",
    "Chief Product Officer",
    "Dublin developer resume",
    "Ireland tech professional",
    "React developer CV",
    "Next.js developer resume",
    "TypeScript engineer",
    "LLM application developer",
    "Prompt engineer resume",
    "Product strategist CV",
    "Full stack developer Dublin",
    "Hire AI consultant Ireland",
  ],
  openGraph: {
    title: "Resume - 8gent | Creative Technologist",
    description:
      "12+ years in product strategy, AI development, and full-stack engineering. Dublin, Ireland. Available for consulting.",
    url: "https://8gent.app/resume",
    type: "profile",
    images: [
      {
        url: "https://8gent.app/8gent-logo.png",
        width: 1200,
        height: 630,
        alt: "8gent - Resume & Professional Background",
      },
    ],
  },
  twitter: {
    title: "8gent's Resume",
    description: "Creative Technologist & AI Product Leader. 12+ years experience. Dublin, Ireland.",
    card: "summary_large_image",
  },
  alternates: {
    canonical: "https://8gent.app/resume",
  },
};

export default function ResumeLayout({ children }: { children: React.ReactNode }) {
  return children;
}
