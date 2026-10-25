import type { Route } from './+types/home'

export function meta(_args: Route.MetaArgs) {
  return [{ title: 'CarVet · Home' }]
}

export default function Home() {
  return (
    <main>
      <h1>Home</h1>
    </main>
  )
}
