import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import * as fs from 'fs'
import * as path from 'path'

// Parse .env manually so Vite never falls back to .env.production
function loadDotEnv(root: string): Record<string, string> {
  const envPath = path.resolve(root, '.env')
  if (!fs.existsSync(envPath)) return {}
  const content = fs.readFileSync(envPath, 'utf-8')
  const result: Record<string, string> = {}
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eqIdx = trimmed.indexOf('=')
    if (eqIdx === -1) continue
    const key = trimmed.slice(0, eqIdx).trim()
    const val = trimmed.slice(eqIdx + 1).trim().replace(/^['"]|['"]$/g, '')
    result[key] = val
  }
  return result
}

// https://vite.dev/config/
export default defineConfig(() => {
  const envVars = loadDotEnv(__dirname)

  return {
    plugins: [react()],
    define: {
      // Inject VITE_ env vars so import.meta.env works as expected
      ...Object.fromEntries(
        Object.entries(envVars)
          .filter(([k]) => k.startsWith('VITE_'))
          .map(([k, v]) => [`import.meta.env.${k}`, JSON.stringify(v)])
      ),
    },
  }
})
