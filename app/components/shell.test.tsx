import { renderToString } from 'react-dom/server'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'
import { Co2BandChip } from './Co2BandChip'
import { Icon } from './Icon'
import { SiteFooter } from './SiteFooter'
import { SiteHeader } from './SiteHeader'

// R2: strip React's text-node separators before asserting on text.
const html = (node: React.ReactNode) => renderToString(node).replace(/<!-- -->/g, '')

describe('SiteHeader', () => {
  const out = html(
    <MemoryRouter initialEntries={['/predict']}>
      <SiteHeader />
    </MemoryRouter>,
  )

  it('marks only the /predict links current, in both navs', () => {
    expect(out.match(/aria-current="page"/g)).toHaveLength(2)
    const currentLinks = out.match(/<a[^>]*aria-current="page"[^>]*>/g) ?? []
    expect(currentLinks).toHaveLength(2)
    for (const link of currentLinks) expect(link).toContain('href="/predict"')
  })

  it('renders a collapsed mobile menu toggle', () => {
    expect(out).toContain('aria-controls="mobileNav"')
    expect(out).toContain('aria-expanded="false"')
  })
})

describe('SiteHeader variants', () => {
  const at = (path: string) =>
    html(
      <MemoryRouter initialEntries={[path]}>
        <SiteHeader />
      </MemoryRouter>,
    )
  const DATA = 'Data source: Natural Resources Canada Fuel Consumption Ratings — Open Government Licence – Canada'

  it('centres the nav only on /, with no data source strip', () => {
    const out = at('/')
    expect(out).toContain('translateX(-50%)')
    expect(out).toContain('position:relative')
    expect(out).toContain('hidden md:block w-28')
    expect(out).not.toContain(DATA)
  })

  it.each(['/predict', '/explore'])('uses the right-aligned header on %s', (path) => {
    const out = at(path)
    expect(out).not.toContain('translateX')
    expect(out).not.toContain('position:relative')
    expect(out).not.toContain('w-28')
    expect(out).not.toContain(DATA)
  })

  it('treats /compare/ like /compare', () => {
    expect(at('/compare/')).toContain(DATA)
    expect(at('/predict/')).not.toContain('translateX')
  })

  it('adds the data source strip only on /compare', () => {
    const out = at('/compare')
    expect(out).toContain(DATA)
    expect(out).not.toContain('translateX')
  })
})

describe('SiteFooter', () => {
  it('renders the credits', () => {
    expect(html(<SiteFooter />)).toContain('CarVet by Team Moneyball · Data: NRCan, OGL-Canada')
  })
})

describe('Icon', () => {
  it('renders an inline lucide svg', () => {
    const out = html(<Icon name="car" />)
    expect(out).toContain('<svg')
    expect(out).toContain('stroke="currentColor"')
    expect(out).toContain('aria-hidden="true"')
  })
})

describe('Co2BandChip', () => {
  it('renders the band class and label', () => {
    const out = html(<Co2BandChip gkm={199} />)
    expect(out).toContain('chip-elevated')
    expect(out).toContain('Elevated')
  })
})
