import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// Public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/privacy(.*)',
  '/api/voice/speak', // TTS endpoint needs to work without auth for demo
  '/jr(.*)', // Jr tenant routes are publicly accessible
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
  const hostname = request.headers.get('x-forwarded-host') || request.headers.get('host') || '';

  // Demo subdomain - bypass all auth, redirect root to /app
  const hostnameForDemoCheck = hostname.split(':')[0];
  if (hostnameForDemoCheck === 'demo.8gentjr.com') {
    if (url.pathname === '/') {
      return NextResponse.redirect(new URL('/app', request.url));
    }
    const response = NextResponse.next();
    response.headers.set('x-demo-mode', '1');
    response.headers.set('x-tenant-subdomain', 'demo');
    response.headers.set('x-tenant-mode', 'kid');
    return response;
  }

  // Parse subdomain
  // Handles: nick.8gent.app, nick.localhost:3001, etc.
  let subdomain: string | null = null;
  const hostnameNoPort = hostname.split(':')[0];

  if (hostnameNoPort.endsWith('.8gent.app')) {
    // e.g. nick.8gent.app → nick, www.8gent.app → www
    const sub = hostnameNoPort.replace('.8gent.app', '');
    if (sub && sub !== 'www' && sub !== 'clerk' && sub !== 'accounts') {
      subdomain = sub;
    }
  } else if (hostnameNoPort.endsWith('.8gentjr.com')) {
    // e.g. nick.8gentjr.com → nick
    const sub = hostnameNoPort.replace('.8gentjr.com', '');
    if (sub && sub !== 'www' && sub !== 'clerk' && sub !== 'accounts') {
      subdomain = sub;
    }
  } else if (hostnameNoPort.endsWith('.8gentos.com')) {
    // e.g. james.8gentos.com → james
    const sub = hostnameNoPort.replace('.8gentos.com', '');
    if (sub && sub !== 'www' && sub !== 'clerk' && sub !== 'accounts') {
      subdomain = sub;
    }
  } else if (hostnameNoPort.endsWith('.localhost')) {
    // e.g. nick.localhost → nick
    const sub = hostnameNoPort.replace('.localhost', '');
    if (sub && sub !== 'localhost') {
      subdomain = sub;
    }
  }

  // If on subdomain, inject it into headers for the app to use
  // Note: subdomain routing kept for backwards compat but path-based (/jr/[tenant]) is preferred
  if (subdomain) {
    const response = NextResponse.next();
    response.headers.set('x-tenant-subdomain', subdomain);

    // Set tenant mode based on domain
    if (hostnameNoPort.endsWith('.8gentos.com')) {
      response.headers.set('x-tenant-mode', 'adult');
    } else if (hostnameNoPort.endsWith('.8gentjr.com')) {
      response.headers.set('x-tenant-mode', 'kid');
    }

    return response;
  }

  // Main domain logic
  if (!isPublicRoute(request) && !isMarketingRoute(request)) {
    await auth.protect();
  }

  // Pass hostname to pages so they can render domain-specific content
  const response = NextResponse.next();
  response.headers.set('x-hostname', hostname);
  return response;
});

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
