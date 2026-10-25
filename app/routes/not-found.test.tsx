import { renderToString } from 'react-dom/server'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'
import NotFound, { meta } from './not-found'

const out = renderToString(
  <MemoryRouter>
    <NotFound />
  </MemoryRouter>,
).replace(/<!-- -->/g, '')

describe('NotFound', () => {
  it('does not nest a main landmark', () => {
    expect(out).not.toContain('<main')
  })
  it('has a heading, copy and a link home', () => {
    expect(out).toContain('Not found')
    expect(out).toContain("The page you're looking for doesn't exist.".replace("'", '&#x27;').replace("'", '&#x27;'))
    expect(out).toContain('href="/"')
  })
  it('keeps the title', () => {
    expect(meta({} as never)).toEqual([{ title: 'CarVet · Not found' }])
  })
})
