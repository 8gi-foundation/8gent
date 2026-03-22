# DNS Setup for 8gent Ecosystem

## 8gentos.com
npx vercel domains add 8gentos.com
npx vercel domains add www.8gentos.com
npx vercel domains add "*.8gentos.com"
npx vercel dns add 8gentos.com clerk CNAME frontend-api.clerk.services
npx vercel dns add 8gentos.com accounts CNAME accounts.clerk.services

## Already configured
- 8gent.app (+ www, + wildcard)
- 8gentjr.com (+ www, + clerk CNAMEs)
