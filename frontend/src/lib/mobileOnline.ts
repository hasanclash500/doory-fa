/**
 * Online mode opens a same-origin HTTPS Doory deployment via Android Custom Tabs.
 * Django session cookies, CSRF tokens, uploads and WebSockets stay on that origin.
 * The packaged offline editor remains available without any server.
 */
import { registerPlugin } from '@capacitor/core'
const STORAGE_KEY = 'doory.fa.onlineServer.v1'
interface BrowserPlugin { open(options: { url: string }): Promise<void> }
const Browser = registerPlugin<BrowserPlugin>('Browser')

export function normaliseOnlineServer(input: string): string {
  const trimmed = input.trim()
  if (!trimmed) throw new Error('نشانی سرور را وارد کنید.')
  let url: URL
  try { url = new URL(trimmed) }
  catch { throw new Error('نشانی معتبر نیست. نمونه: https://design.example.com') }
  if (url.protocol !== 'https:') throw new Error('نشانی سرور باید با https:// شروع شود.')
  if (!url.hostname || url.username || url.password || url.port || url.search || url.hash || url.pathname !== '/') {
    throw new Error('فقط دامنه اصلی HTTPS را وارد کنید، بدون مسیر، رمز، پورت یا پارامتر.')
  }
  const host = url.hostname.toLowerCase()
  if (host === 'localhost' || host.endsWith('.local') || host === '127.0.0.1' || host === '0.0.0.0') {
    throw new Error('آدرس سرور باید یک دامنه عمومی HTTPS باشد.')
  }
  return url.origin
}
export function getSavedOnlineServer(): string {
  try { return localStorage.getItem(STORAGE_KEY) ?? '' } catch { return '' }
}
export function saveOnlineServer(value: string): string {
  const url = normaliseOnlineServer(value)
  localStorage.setItem(STORAGE_KEY, url)
  return url
}
export async function openOnlineDoory(url: string): Promise<void> {
  const safeUrl = normaliseOnlineServer(url)
  const native = (window as Window & { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor?.isNativePlatform?.()
  if (native) await Browser.open({ url: safeUrl })
  else {
    const opened = window.open(safeUrl, '_blank', 'noopener,noreferrer')
    if (!opened) window.location.assign(safeUrl)
  }
}
