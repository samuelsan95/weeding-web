import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

function injectAssetUrls() {
  let base
  let ogImageId, logoId
  return {
    name: 'inject-asset-urls',
    apply: 'build',
    configResolved(config) {
      base = config.base || './'
      ogImageId = fileURLToPath(new URL('./src/assets/og-image.jpg', import.meta.url))
      logoId = fileURLToPath(new URL('./src/assets/logo.png', import.meta.url))
    },
    transformIndexHtml(html) {
      const ogRefId = this.emitFile({
        type: 'asset',
        fileName: 'og-image.jpg',
        source: readFileSync(ogImageId)
      })
      const logoRefId = this.emitFile({
        type: 'asset',
        fileName: 'favicon.png',
        source: readFileSync(logoId)
      })
      const ogName = this.getFileName(ogRefId)
      const logoName = this.getFileName(logoRefId)
      const prefix = base.endsWith('/') ? base : base + '/'
      return html
        .replaceAll('__OG_IMAGE__', `${prefix}${ogName}`)
        .replaceAll('__FAVICON__', `${prefix}${logoName}`)
    }
  }
}

export default defineConfig({
  plugins: [injectAssetUrls(), vue()],
})
