import type { Route } from './+types/compare'

export function meta(_args: Route.MetaArgs) {
  return [{ title: 'CarVet · Compare' }]
}

export default function Compare() {
  return (
    <main>
      <h1>Compare</h1>
    </main>
  )
}
