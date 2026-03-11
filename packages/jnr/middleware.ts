import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// Public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/voice/speak', // TTS endpoint needs to work without auth for demo
]);

// Marketing routes (main domain only)
const isMarketingRoute = createRouteMatcher([
  '/',
  '/pricing',
  '/about',
  '/features',
  '/contact',
]);

export default clerkMiddleware(async (auth, request) => {
  const url = request.nextUrl;
  const hostname = request.headers.get('host') || '';

  // Parse subdomain
  // Handles: nick.8gent.app, nick.localhost:3001, etc.
  const mainDomains = ['8gent.app', 'www.8gent.app', 'localhost:3001', '127.0.0.1:3001'];
  const isMainDomain = mainDomains.some(
    (domain) => hostname === domain || hostname.endsWith(`.${domain.split(':')[0]}`)
  );

  // Extract subdomain
  let subdomain: string | null = null;
  if (!isMainDomain) {
    const parts = hostname.split('.');
    if (parts.length >= 2) {
      // nick.8gent.app -> nick
      // nick.localhost:3001 -> nick
      subdomain = parts[0];
    }
  }

  // If on subdomain, inject it into headers for the app to use
  if (subdomain) {
    // Subdomain tenant routes
    const response = NextResponse.next();
    response.headers.set('x-tenant-subdomain', subdomain);

    // Protect app routes on subdomains
    if (!isPublicRoute(request)) {
      await auth.protect();
    }

    return response;
  }

  // Main domain logic
  if (!isPublicRoute(request) && !isMarketingRoute(request)) {
    await auth.protect();
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
