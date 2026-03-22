import { HomeClient } from "@/components/home/HomeClient";

/**
 * Homepage - Server Component shell with SSR-friendly content for crawlers.
 * The HomeClient component handles client-side onboarding routing and IOSHome rendering.
 */
export default function Page() {
  return (
    <>
      {/* SSR content visible to crawlers */}
      <div className="sr-only">
        <h1>8gent - The AI-Native Operating System</h1>
        <p>
          The AI-native operating system designed for high-performance productivity
          and seamless human-AI collaboration. Built with agentic orchestration,
          multi-agent systems, and a design-led engineering approach.
        </p>
      </div>

      {/* Client-side interactive app */}
      <HomeClient />
    </>
  );
}
