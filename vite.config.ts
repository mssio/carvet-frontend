import { reactRouter } from '@react-router/dev/vite'
import babel from '@rolldown/plugin-babel'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// React Compiler runs after reactRouter() so it sees plain TSX.
export default defineConfig({
  plugins: [
    tailwindcss(),
    reactRouter(),
    babel({
      include: /\/app\/.*\.[jt]sx?$/,
      plugins: [['babel-plugin-react-compiler', {}]],
    }),
  ],
})
