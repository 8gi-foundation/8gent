// Convex Auth Configuration for Clerk

export default {
  providers: [
    {
      // Clerk JWT provider
      domain: process.env.CLERK_JWT_ISSUER_DOMAIN,
      applicationID: "convex",
    },
  ],
};
