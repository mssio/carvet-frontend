import { Link } from 'react-router'
import type { Route } from './+types/not-found'

export function meta(_args: Route.MetaArgs) {
  return [{ title: 'CarVet · Not found' }]
}

export default function NotFound() {
  return (
    <section className="flex flex-col items-start gap-space-md">
      <h1 className="text-headline-xl-mobile md:font-headline-xl md:text-headline-xl">Not found</h1>
      <p>The page you're looking for doesn't exist.</p>
      <Link to="/" className="btn-primary">
        Back to home
      </Link>
    </section>
  )
}
