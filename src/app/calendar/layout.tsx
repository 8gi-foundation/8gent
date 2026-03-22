/**
 * Calendar Layout - Force dynamic rendering for auth-required pages
 */
import { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Calendar - Book Time with 8gent | AI & Product Consulting",
  description:
    "Book a meeting with 8gent. Schedule AI consulting, product strategy sessions, or discovery calls. Dublin-based Creative Technologist available for projects.",
  keywords: [
    "Book 8gent",
    "8gent calendar",
    "AI consulting appointment",
    "Product strategy meeting",
    "Dublin tech consultant",
    "Schedule consultation",
    "CPO consulting",
    "Hire AI developer",
  ],
  openGraph: {
    title: "Book Time - 8gent",
    description: "Schedule a meeting for AI consulting or product strategy.",
    url: "https://8gent.app/calendar",
    type: "website",
    images: [
      {
        url: "https://8gent.app/8gent-logo.png",
        width: 1200,
        height: 630,
        alt: "Book Time with 8gent",
      },
    ],
  },
  twitter: {
    title: "Book 8gent",
    description: "Schedule AI consulting or product strategy meetings.",
    card: "summary_large_image",
  },
  alternates: {
    canonical: "https://8gent.app/calendar",
  },
};

export default function CalendarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
