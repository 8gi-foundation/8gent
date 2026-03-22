import { DATA } from "@/data/resume";

const BASE_URL = "https://8gent.app";

// WebSite Schema
export function WebSiteJsonLd() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${BASE_URL}/#website`,
    url: BASE_URL,
    name: `${DATA.name} - The AI-Native Operating System`,
    description: DATA.description,
    publisher: {
      "@type": "Organization",
      "@id": `${BASE_URL}/#organization`,
      name: "8gent",
    },
    inLanguage: ["en"],
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${BASE_URL}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
    copyrightHolder: {
      "@id": `${BASE_URL}/#organization`,
    },
    copyrightYear: 2025,
    keywords: [
      "8gent",
      "AI Operating System",
      "AI-native OS",
      "Agentic AI Orchestration",
      "Multi-Agent Systems",
      "Product-Led Development",
      "Rapid Prototyping",
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// Organization Schema
export function OrganizationJsonLd() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${BASE_URL}/#organization`,
    name: "8gent",
    url: BASE_URL,
    logo: {
      "@type": "ImageObject",
      url: `${BASE_URL}/8gent-logo.png`,
      width: 1200,
      height: 630,
    },
    image: `${BASE_URL}/8gent-logo.png`,
    description: DATA.description,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Dublin",
      addressCountry: "IE",
    },
    areaServed: [
      {
        "@type": "Country",
        name: "Worldwide",
      },
    ],
    foundingDate: "2024",
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// BreadcrumbList Schema
export function BreadcrumbJsonLd({
  items,
}: {
  items: { name: string; url: string }[];
}) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// Service Schema
export function ServiceJsonLd() {
  const services = [
    {
      name: "AI-Native Operating System",
      description: "A complete software ecosystem built for the agentic age.",
    },
    {
      name: "Agentic Orchestration",
      description: "Seamless coordination of multiple AI agents for complex task automation.",
    },
  ];

  const schema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: services.map((service, index) => ({
      "@type": "Service",
      position: index + 1,
      name: service.name,
      description: service.description,
      provider: {
        "@id": `${BASE_URL}/#organization`,
      },
      areaServed: {
        "@type": "Place",
        name: "Worldwide (Cloud)",
      },
      serviceType: "Software as a Service",
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// Combined structured data for homepage
export function HomePageStructuredData() {
  return (
    <>
      <WebSiteJsonLd />
      <OrganizationJsonLd />
      <ServiceJsonLd />
    </>
  );
}
