import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { HBarChart } from './HBarChart'

// R2: strip React's text-node separators before asserting on text.
const out = renderToString(
  <HBarChart
    unit="g/km"
    items={[
      { label: 'A', value: 200, color: '#2e7d32' },
      { label: 'B', value: 100, color: '#ba1a1a' },
    ]}
  />,
).replace(/<!-- -->/g, '')

describe('HBarChart', () => {
  it('renders an svg with labels, colours and values', () => {
    for (const text of ['<svg', '>A<', '>B<', 'fill="#2e7d32"', 'fill="#ba1a1a"', '200 g/km']) {
      expect(out).toContain(text)
    }
  })

  it('scales bar widths proportionally to value', () => {
    const widths = [...out.matchAll(/<rect[^>]*data-bar[^>]*width="([\d.]+)%"/g)].map((m) => Number(m[1]))
    expect(widths).toHaveLength(2)
    expect(widths[0] / widths[1]).toBe(2)
  })
})
