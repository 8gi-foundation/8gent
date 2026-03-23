# Subdomain Setup for 8gentos.com

## How Subdomain Routing Works

The middleware at `packages/jnr/middleware.ts` handles subdomain detection:

1. Request comes in to `james.8gentos.com`
2. Middleware extracts `james` as the subdomain
3. Sets headers: `x-tenant-subdomain: james`, `x-tenant-mode: adult`
4. App code reads these headers to customize the experience

## Required: Manual DNS Configuration (Vercel)

You must add a wildcard CNAME in the Vercel project settings:

```bash
# Add the wildcard subdomain to Vercel
npx vercel domains add "*.8gentos.com"

# Or in the Vercel dashboard:
# Project Settings > Domains > Add > *.8gentos.com
```

The DNS records needed (already in DNS-SETUP.md):

| Type | Name | Value |
|------|------|-------|
| CNAME | `*.8gentos.com` | `cname.vercel-dns.com` |

Clerk also needs subdomains for auth:

| Type | Name | Value |
|------|------|-------|
| CNAME | `clerk.8gentos.com` | `frontend-api.clerk.services` |
| CNAME | `accounts.8gentos.com` | `accounts.clerk.services` |

## Required: Environment Variables

Set the daemon WebSocket URL so the OS connects to the Fly.dev vessel:

```
NEXT_PUBLIC_DAEMON_URL=wss://eight-vessel.fly.dev
```

The `DaemonClient` (at `src/lib/daemon/client.ts`) reads this at construction:
- If set, connects to the remote daemon
- If not set, falls back to `ws://localhost:18789`

## Testing Locally

To test subdomain routing locally:

1. Edit `/etc/hosts`:
   ```
   127.0.0.1 james.localhost
   ```

2. Run the dev server:
   ```bash
   pnpm dev
   ```

3. Visit `http://james.localhost:3000` (or whatever port the Jr app runs on)

The middleware also handles `*.localhost` subdomains for local testing.

## Verification Checklist

- [ ] `*.8gentos.com` wildcard domain added in Vercel
- [ ] Clerk CNAME records added for `clerk.8gentos.com` and `accounts.8gentos.com`
- [ ] `NEXT_PUBLIC_DAEMON_URL=wss://eight-vessel.fly.dev` set in Vercel env vars
- [ ] Visit `james.8gentos.com` and confirm the `x-tenant-subdomain` header is `james`
- [ ] Confirm WebSocket connects to the Fly.dev daemon

## Architecture

```
james.8gentos.com
  |
  v
Vercel (*.8gentos.com wildcard)
  |
  v
packages/jnr/middleware.ts
  - Extracts subdomain: "james"
  - Sets x-tenant-mode: "adult"
  - Sets x-tenant-subdomain: "james"
  |
  v
App renders with tenant context
  |
  v
DaemonClient connects to wss://eight-vessel.fly.dev
```
