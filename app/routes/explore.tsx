import type { Route } from './+types/explore'

export function meta(_args: Route.MetaArgs) {
  return [{ title: 'CarVet · Explore' }]
}

export default function Explore() {
  return (
    <main>
      <h1>Explore</h1>
    </main>
  )
}
