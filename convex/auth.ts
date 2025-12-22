import { betterAuth } from "better-auth";
import * as convexAdapter from "@convex-dev/better-auth/adapter";
import { mcp } from "better-auth/plugins";

export const auth = betterAuth({
  database: convexAdapter,
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  plugins: [
    mcp({
        loginPage: "/sign-in",
        // MCP plugin configuration if needed
    })
  ]
});
