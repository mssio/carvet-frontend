// Cloudflare's "404-page" mode serves /404.html with status 404 for unknown URLs.
// The SPA fallback shell boots the client router, which renders routes/not-found.tsx.
import { copyFileSync } from 'node:fs'

copyFileSync('build/client/__spa-fallback.html', 'build/client/404.html')
console.log('postbuild: build/client/__spa-fallback.html -> build/client/404.html')
