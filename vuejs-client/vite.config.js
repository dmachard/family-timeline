import { fileURLToPath, URL } from 'node:url'
import { execSync } from 'node:child_process'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { version as pkgVersion } from './package.json'

let appVersion = process.env.VITE_APP_VERSION || process.env.APP_VERSION || ''
if (!appVersion) {
  try {
    const gitTag = execSync('git describe --tags --abbrev=0', { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim()
    if (gitTag) {
      appVersion = gitTag.replace(/^v/, '')
    }
  } catch {
    appVersion = pkgVersion
  }
}
if (!appVersion) {
  appVersion = pkgVersion
}

export default defineConfig({
  plugins: [
    vue()
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  define: {
    'import.meta.env.VITE_APP_VERSION': JSON.stringify(appVersion)
  }
})
