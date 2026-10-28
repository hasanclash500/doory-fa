/** Detect a bundled Android/iOS Capacitor WebView (not the normal browser). */
export function isStandaloneMobile(): boolean {
  if (typeof window === 'undefined') return false
  const capacitor = (window as Window & { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor
  return Boolean(capacitor?.isNativePlatform?.())
}
