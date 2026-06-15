import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const repositoryName =
  process.env.VITE_REPOSITORY_NAME ??
  process.env.GITHUB_REPOSITORY?.split('/')[1] ??
  'midigimal'

export default defineConfig(({ command }) => ({
  base: command === 'build' ? `/${repositoryName}/` : '/',
  plugins: [react()],
}))
