import { createAuthClient } from "better-auth/react";
import { convexClient } from "@convex-dev/better-auth/client/plugins";

// const convex = new ConvexHttpClient(import.meta.env.VITE_CONVEX_URL);

export const authClient = createAuthClient({
  baseURL: import.meta.env.VITE_CONVEX_URL,
  plugins: [convexClient()],
});
