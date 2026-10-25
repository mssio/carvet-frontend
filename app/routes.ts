import { type RouteConfig, index, route } from '@react-router/dev/routes'

export default [
  index('routes/home.tsx'),
  route('explore', 'routes/explore.tsx'),
  route('predict', 'routes/predict.tsx'),
  route('compare', 'routes/compare.tsx'),
  route('*', 'routes/not-found.tsx'),
] satisfies RouteConfig
