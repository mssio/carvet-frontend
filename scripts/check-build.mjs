import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

const client = 'build/client'
const errors = []

const pages = {
  'index.html': 'Home',
  'explore/index.html': 'Explore',
  'predict/index.html': 'Predict',
  'compare/index.html': 'Compare',
}

for (const file of [...Object.keys(pages), '404.html']) {
  if (!existsSync(join(client, file))) errors.push(`missing ${client}/${file}`)
}

for (const [file, name] of Object.entries(pages)) {
  const path = join(client, file)
  if (!existsSync(path)) continue
  const html = readFileSync(path, 'utf8')
  const titles = [`CarVet · ${name}`, `CarVet &middot; ${name}`, `CarVet &#183; ${name}`, `CarVet &#xB7; ${name}`]
  if (!titles.some((t) => html.includes(`<title>${t}</title>`))) errors.push(`${file}: missing <title>CarVet · ${name}</title>`)
}

const htmlFiles = []
const walk = (dir) => {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name)
    if (entry.isDirectory()) walk(p)
    else if (entry.name.endsWith('.html')) htmlFiles.push(p)
  }
}
if (existsSync(client)) walk(client)
for (const f of htmlFiles) {
  const html = readFileSync(f, 'utf8')
  for (const bad of ['cdn.jsdelivr.net', 'fonts.googleapis.com']) {
    if (html.includes(bad)) errors.push(`${f} references ${bad}`)
  }
}

// React Compiler check: React's own runtime chunk contains the sentinel even with
// the compiler off, so it must appear in a route chunk.
const assets = join(client, 'assets')
const routeChunk = /^(home|explore|predict|compare|not-found|root)-.*\.js$/
const routeFiles = existsSync(assets) ? readdirSync(assets).filter((f) => routeChunk.test(f)) : []
if (!routeFiles.some((f) => readFileSync(join(assets, f), 'utf8').includes('react.memo_cache_sentinel'))) {
  errors.push('no route chunk contains react.memo_cache_sentinel (React Compiler inactive?)')
}

if (errors.length) {
  console.error('check:build FAILED\n- ' + errors.join('\n- '))
  process.exit(1)
}
console.log('check:build OK')
