import { z } from 'zod'

const envSchema = z.object({
  VITE_CONVEX_URL: z.string().url(),
  VITE_CONVEX_SITE_URL: z.string().url().optional(),
  VITE_GAME_VERSION: z.string().optional().default('1.0.0'),
})

// Validate import.meta.env
// Note: In Vite, import.meta.env has string|boolean|undefined values,
// but for these keys we expect strings.
const parsed = envSchema.safeParse({
    VITE_CONVEX_URL: import.meta.env.VITE_CONVEX_URL,
    VITE_CONVEX_SITE_URL: import.meta.env.VITE_CONVEX_SITE_URL,
    VITE_GAME_VERSION: import.meta.env.VITE_GAME_VERSION
})

if (!parsed.success) {
  console.error('❌ Invalid environment variables:', parsed.error.flatten().fieldErrors)
  throw new Error('Invalid environment variables')
}

export const env = parsed.data
