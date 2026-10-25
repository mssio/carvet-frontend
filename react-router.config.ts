import type { Config } from '@react-router/dev/config'

export default {
  ssr: false,
  prerender: ['/', '/explore', '/predict', '/compare'],
} satisfies Config
