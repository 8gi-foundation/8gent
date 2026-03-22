import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Product Strategy - 8gent | CPO & Product Leadership",
  description:
    "Product strategy expertise from 8gent. Jobs-to-be-Done framework, workshop facilitation, roadmap development, and product-led growth. Dublin-based CPO consultant.",
  keywords: [
    "8gent product",
    "Product strategy Dublin",
    "CPO consultant Ireland",
    "Jobs-to-be-Done",
    "JTBD framework",
    "Product workshop facilitation",
    "Product roadmap",
    "Product-led growth",
    "Product management consultant",
    "Chief Product Officer",
    "AI product strategy",
    "Startup product strategy",
  ],
  openGraph: {
    title: "Product Strategy - 8gent",
    description: "Product leadership and strategy consulting. Dublin-based CPO.",
    url: "https://8gent.app/product",
    type: "website",
    images: [
      {
        url: "https://8gent.app/8gent-logo.png",
        width: 1200,
        height: 630,
        alt: "8gent - Product Strategy",
      },
    ],
  },
  twitter: {
    title: "Product Strategy - 8gent",
    description: "CPO & Product leadership consulting.",
    card: "summary_large_image",
  },
  alternates: {
    canonical: "https://8gent.app/product",
  },
};

export default function ProductLayout({ children }: { children: React.ReactNode }) {
  return children;
}
