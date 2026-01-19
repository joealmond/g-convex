import { defineConfig, globalIgnores } from 'eslint/config'
import { tanstackConfig } from '@tanstack/eslint-config'
import convexPlugin from '@convex-dev/eslint-plugin'
import tseslint from 'typescript-eslint';

export default defineConfig([
  ...tanstackConfig,
  ...convexPlugin.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      '@typescript-eslint/no-unnecessary-type-assertion': 'off',
       '@typescript-eslint/no-explicit-any': 'off',
       '@typescript-eslint/no-unused-vars': 'off',
       '@typescript-eslint/ban-ts-comment': 'off',
       '@typescript-eslint/no-unnecessary-condition': 'off',
    }
  },
  globalIgnores(['convex/_generated', 'dist', '.tanstack']),
])
