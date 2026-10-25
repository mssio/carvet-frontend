import type { Route } from './+types/not-found'

export function meta(_args: Route.MetaArgs) {
  return [{ title: 'CarVet · Not found' }]
}

export default function NotFound() {
  return (
    <main>
      <h1>Not found</h1>
    </main>
  )
}
