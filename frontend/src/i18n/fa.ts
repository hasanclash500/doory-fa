/** Persian UI translation helpers; never modify user-authored artwork. */
import { faDictionary } from './fa-dictionary'

const persianDigits = (value: string) => value.replace(/[0-9]/g, digit => '۰۱۲۳۴۵۶۷۸۹'[Number(digit)])

export function translateUi(input: string): string {
  if (!input || !/[A-Za-z]/.test(input)) return input
  const leading = input.match(/^\s*/)?.[0] ?? ''
  const trailing = input.match(/\s*$/)?.[0] ?? ''
  const text = input.trim()
  const exact = faDictionary[text] ?? faDictionary[text.replace(/\.\.\.$/, '…')]
  if (exact) return leading + exact + trailing

  let match: RegExpMatchArray | null
  if ((match = text.match(/^Page (\d+) of (\d+)$/))) return `${leading}صفحه ${persianDigits(match[1])} از ${persianDigits(match[2])}${trailing}`
  if ((match = text.match(/^Page (\d+)$/))) return `${leading}صفحه ${persianDigits(match[1])}${trailing}`
  if ((match = text.match(/^(\d+) pages?$/))) return `${leading}${persianDigits(match[1])} صفحه${trailing}`
  if ((match = text.match(/^(\d+) designs?$/))) return `${leading}${persianDigits(match[1])} طرح${trailing}`
  if ((match = text.match(/^(\d+) files?$/))) return `${leading}${persianDigits(match[1])} فایل${trailing}`
  if ((match = text.match(/^(\d+) selected$/))) return `${leading}${persianDigits(match[1])} مورد انتخاب‌شده${trailing}`
  if ((match = text.match(/^Loading (.+)…$/))) {
    const translated = translateUi(match[1])
    if (translated !== match[1]) return `${leading}در حال بارگذاری ${translated}…${trailing}`
  }
  return input
}

/** Translate nested editor message resources, including interpolated functions. */
export function localizeEditorStrings<T>(value: T): T {
  if (typeof value === 'string') return translateUi(value) as T
  if (typeof value === 'function') {
    const fn = value as (...args: unknown[]) => unknown
    return ((...args: unknown[]) => localizeEditorStrings(fn(...args))) as T
  }
  if (Array.isArray(value)) return value.map(localizeEditorStrings) as T
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, localizeEditorStrings(entry)])) as T
  }
  return value
}

const excluded = (element: Element | null): boolean => Boolean(element?.closest(
  '[data-artboard], [data-no-translate], [contenteditable], pre, code, script, style, svg, canvas, [translate="no"]',
))

function localizeElement(element: Element) {
  if (excluded(element)) return
  for (const attribute of ['placeholder', 'title', 'aria-label', 'alt']) {
    const value = element.getAttribute(attribute)
    if (!value) continue
    const translated = translateUi(value)
    if (translated !== value) element.setAttribute(attribute, translated)
  }
  if (element instanceof HTMLInputElement && ['button', 'submit', 'reset'].includes(element.type)) {
    const translated = translateUi(element.value)
    if (translated !== element.value) element.value = translated
  }
}

function localizeText(node: Node) {
  if (node.nodeType !== Node.TEXT_NODE || excluded(node.parentElement)) return
  const current = node.nodeValue ?? ''
  const translated = translateUi(current)
  if (translated !== current) node.nodeValue = translated
}

function localizeSubtree(root: Node) {
  if (root.nodeType === Node.TEXT_NODE) return localizeText(root)
  if (!(root instanceof Element) || excluded(root)) return
  localizeElement(root)
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT)
  while (walker.nextNode()) {
    if (walker.currentNode.nodeType === Node.TEXT_NODE) localizeText(walker.currentNode)
    else if (walker.currentNode instanceof Element) localizeElement(walker.currentNode)
  }
}

function showNativeCredit() {
  const capacitor = (window as Window & { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor
  if (!capacitor?.isNativePlatform?.() || document.getElementById('doory-native-credit')) return

  const banner = document.createElement('aside')
  banner.id = 'doory-native-credit'
  banner.setAttribute('role', 'note')
  banner.dir = 'rtl'
  banner.style.cssText = 'position:fixed;z-index:2147483647;bottom:0;inset-inline:0;background:#fffdf8;color:#2b1c17;padding:12px 16px calc(12px + env(safe-area-inset-bottom));box-shadow:0 -4px 25px #0002;font:13px/1.9 Vazirmatn,Tahoma,sans-serif;max-height:45dvh;overflow-y:auto;text-align:right;'

  const upstreamLine = document.createElement('div')
  upstreamLine.textContent = 'دوری (Doory) — ساختهٔ Siam، خالق و نگهدارندهٔ پروژه • '
  const upstreamLink = document.createElement('a')
  upstreamLink.href = 'https://github.com/shaongitbd/doory'
  upstreamLink.target = '_blank'
  upstreamLink.rel = 'noopener noreferrer'
  upstreamLink.textContent = 'GitHub سازنده اصلی'
  upstreamLine.appendChild(upstreamLink)

  const persianLine = document.createElement('div')
  persianLine.textContent = 'فارسی‌سازی و توسعه نسخه اندروید: حسن عابدینی • '
  const githubLink = document.createElement('a')
  githubLink.href = 'https://github.com/hasanclash500'
  githubLink.target = '_blank'
  githubLink.rel = 'noopener noreferrer'
  githubLink.textContent = 'GitHub حسن عابدینی'
  persianLine.appendChild(githubLink)

  const close = document.createElement('button')
  close.type = 'button'
  close.textContent = 'ورود به برنامه'
  close.style.cssText = 'display:inline-block;padding:6px 14px;margin-top:8px;border-radius:8px;background:#2b1c17;color:white;cursor:pointer;font:inherit;'
  close.addEventListener('click', () => banner.remove())
  banner.append(upstreamLine, persianLine, close)
  document.body.appendChild(banner)
}

/** Initialize locale before React renders and observe dynamically rendered labels. */
export function initPersianLocale(): void {
  document.documentElement.lang = 'fa'
  document.documentElement.dir = 'rtl'
  document.body.classList.add('locale-fa')
  document.title = 'دوری فارسی | ویرایشگر طراحی'
  showNativeCredit()
  const observer = new MutationObserver(mutations => {
    for (const mutation of mutations) {
      if (mutation.type === 'characterData') localizeText(mutation.target)
      if (mutation.type === 'attributes' && mutation.target instanceof Element) localizeElement(mutation.target)
      for (const child of mutation.addedNodes) localizeSubtree(child)
    }
  })
  observer.observe(document.getElementById('root') ?? document.body, {
    subtree: true, childList: true, characterData: true,
    attributes: true, attributeFilter: ['placeholder', 'title', 'aria-label', 'alt'],
  })
}
