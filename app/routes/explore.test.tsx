import { renderToString } from 'react-dom/server'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'
import Explore, { meta } from './explore'

// R2: strip React's text-node separators before asserting on text.
const out = renderToString(
  <MemoryRouter>
    <Explore />
  </MemoryRouter>,
).replace(/<!-- -->/g, '')

describe('Explore', () => {
  it('prerenders the static KPI cards from stats', () => {
    for (const text of [
      'Canadian light-duty vehicles, 1995–2026',
      '29,215',
      '1995–26',
      '32 years',
      '274.2',
      'range 94–633',
      '12.04',
      'range 4.0–27.5',
      'mean 274.2 · median 267 · SD 66',
      'mean 12.04 · median 11.6 · SD 3.17',
    ]) {
      expect(out).toContain(text)
    }
  })

  it('shows the loading status and no canvas before the CSV loads', () => {
    expect(out).toContain('Loading the attached CSV dataset…')
    expect(out).toContain('Loading vehicle data…')
    expect(out).toContain('Preparing charts')
    expect(out).not.toContain('<canvas')
    expect(out).not.toContain('NaN')
  })

  it('renders the static filters and data dictionary', () => {
    for (const text of [
      'X - Regular Gasoline',
      'E - Ethanol (E85)',
      'All classes',
      'Reset filters',
      'Data dictionary &amp; feature rationale',
      '4,504 distinct values.',
    ]) {
      expect(out).toContain(text)
    }
  })

  it('has the page title and description', () => {
    const m = meta({} as never)
    expect(m[0]).toEqual({ title: 'CarVet · Explore' })
    expect(m[1]).toMatchObject({ name: 'description' })
  })
})
