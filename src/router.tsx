import { createRouter } from '@tanstack/react-router'
import { QueryClient } from '@tanstack/react-query'
import { routerWithQueryClient } from '@tanstack/react-router-with-query'
import { ConvexQueryClient } from '@convex-dev/react-query'
import { ConvexBetterAuthProvider } from '@convex-dev/better-auth/react'
import { routeTree } from './routeTree.gen'
import { authClient } from './lib/auth-client'
import { ImpersonateProvider } from './hooks/use-impersonate'

import { env } from './lib/env'

export function getRouter() {
  const CONVEX_URL = env.VITE_CONVEX_URL

  const convexQueryClient = new ConvexQueryClient(CONVEX_URL)

  const queryClient: QueryClient = new QueryClient({
    defaultOptions: {
      queries: {
        queryKeyHashFn: convexQueryClient.hashFn(),
        queryFn: convexQueryClient.queryFn(),
        gcTime: 5000,
      },
    },
  })
  convexQueryClient.connect(queryClient)

  const router = routerWithQueryClient(
    createRouter({
      routeTree,
      defaultPreload: 'intent',
      context: { queryClient },
      scrollRestoration: true,
      defaultPreloadStaleTime: 0, // Let React Query handle all caching
      defaultErrorComponent: (err) => <p>{err.error.stack}</p>,
      defaultNotFoundComponent: () => <p>not found</p>,
      Wrap: ({ children }) => (
        <ConvexBetterAuthProvider 
            client={convexQueryClient.convexClient}
            authClient={authClient}
        >
          <ImpersonateProvider>
            {children}
          </ImpersonateProvider>
        </ConvexBetterAuthProvider>
      ),
    }),
    queryClient,
  )

  return router
}

