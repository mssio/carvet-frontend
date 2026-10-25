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
