import type { CapacitorConfig } from '@capacitor/cli'

/**
 * When DOORY_APP_URL is set, Android uses the real HTTPS Doory deployment.
 * Without it, Android packages the local web frontend. Cloud functions
 * still need a running backend; no Django server is bundled inside the APK.
 */
const webUrl = process.env.DOORY_APP_URL?.replace(/\/$/, '')

const config: CapacitorConfig = {
  appId: 'com.hasanclash500.dooryfa',
  appName: 'دوری فارسی',
  webDir: 'dist',
  ...(webUrl ? { server: { url: webUrl, cleartext: false } } : {}),
  android: { allowMixedContent: false },
}

export default config
