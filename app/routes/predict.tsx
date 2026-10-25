import type { Route } from './+types/predict'

export function meta(_args: Route.MetaArgs) {
  return [{ title: 'CarVet · Predict' }]
}

export default function Predict() {
  return (
    <main>
      <h1>Predict</h1>
    </main>
  )
}
