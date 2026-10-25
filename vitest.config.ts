import { defineConfig } from 'vitest/config'

// Separate from vite.config.ts so tests don't boot the React Router plugin.
export default defineConfig({
  oxc: { jsx: { runtime: 'automatic' } },
  test: {
    environment: 'node',
    include: ['app/**/*.test.{ts,tsx}'],
  },
})
