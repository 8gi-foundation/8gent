import { HomePageClient } from './components/HomePageClient';

/**
 * Domain-aware root page (Server Component shell):
 * - 8gent.app / www.8gent.app / localhost -> App gateway (sign in or redirect)
 * - 8gentjr.com / www.8gentjr.com -> Jr landing
 *
 * SSR content is provided for crawlers. Client component handles domain routing.
 */
export default function HomePage() {
  return (
    <>
      {/* SSR content for crawlers - visible to screen readers */}
      <div className="sr-only">
        <h1>8gent Jr - No more gatekeeping. A voice for every kid.</h1>
        <p>
          A super-powered AI assistant that learns with your child. Accessibility first.
          Free forever. AAC communication, AI-generated custom symbols, and personalized
          voice synthesis for non-verbal and minimally-verbal children.
        </p>
      </div>

      {/* Client-side domain-aware interactive content */}
      <HomePageClient />
    </>
  );
}
