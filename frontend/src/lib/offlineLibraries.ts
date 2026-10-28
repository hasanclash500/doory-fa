/**
 * Offline-only libraries for the standalone Android WebView.
 * The browser catalog services call Django; native mode MUST use these instead.
 */
import { createBlankDocument, newId } from '@/lib/document'
import type { BrandKit, ElementItem, ElementPack, ElementQuery, FontFamily, FontQuery, TemplateCategory, TemplateDetail, TemplateQuery, TemplateSummary, UserFontUploadInput, UserFontUploadOptions } from '@/types/api'
import type { UserFontsService } from '@/types/adapter'
import { readFontInfo, cleanFamilyName, MAX_FONT_BYTES } from '@/editor/fonts/fontFile'

type StoredFont = { id: string; family: string; weight: number; style: 'normal' | 'italic'; category: FontFamily['category']; blob: Blob }
const fontUrls = new Map<string, string>()
const dbName = 'doory-fa-offline-fonts-v1'
function openFonts(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, 1)
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains('files')) request.result.createObjectStore('files', { keyPath: 'id' })
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error ?? new Error('خطا در باز کردن حافظه فونت‌ها'))
    request.onblocked = () => reject(new Error('حافظه فونت‌ها قفل شده است'))
  })
}
async function storedFonts(): Promise<StoredFont[]> {
  const db = await openFonts()
  try {
    return await new Promise<StoredFont[]>((resolve, reject) => {
      const req = db.transaction('files', 'readonly').objectStore('files').getAll()
      req.onsuccess = () => resolve(req.result as StoredFont[])
      req.onerror = () => reject(req.error ?? new Error('فونت‌ها خوانده نشدند'))
    })
  } finally { db.close() }
}
async function writeFonts(items: StoredFont[], remove = false): Promise<void> {
  const db = await openFonts()
  try {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction('files', 'readwrite')
      const store = tx.objectStore('files')
      for (const item of items) {
        if (remove) store.delete(item.id)
        else store.put(item)
      }
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error ?? new Error('ذخیره‌سازی فونت ناموفق بود'))
      tx.onabort = () => reject(tx.error ?? new Error('ذخیره‌سازی فونت متوقف شد'))
    })
  } finally { db.close() }
}
function fontFamilies(items: StoredFont[]): FontFamily[] {
  const groups = new Map<string, FontFamily>()
  for (const font of items) {
    const key = font.family.toLocaleLowerCase()
    let family = groups.get(key)
    if (!family) {
      family = { id: key, family: font.family, category: font.category, scripts: ['latin', 'arabic'], is_variable: false, is_user_font: true, variants: [], popularity: 9999 }
      groups.set(key, family)
    }
    let url = fontUrls.get(font.id)
    if (!url) {
      url = URL.createObjectURL(font.blob)
      fontUrls.set(font.id, url)
    }
    family.variants.push({ weight: font.weight, style: font.style, url })
  }
  return [...groups.values()].sort((a, b) => a.family.localeCompare(b.family))
}
export const offlineFonts: UserFontsService = {
  async list() { return fontFamilies(await storedFonts()) },
  async upload(input: UserFontUploadInput, options?: UserFontUploadOptions) {
    const current = await storedFonts()
    const added: StoredFont[] = []
    if (!input.files.length) throw new Error('فایل فونت انتخاب نشده است')
    for (const file of input.files) {
      if (options?.signal?.aborted) throw new DOMException('Cancelled', 'AbortError')
      if (file.size > MAX_FONT_BYTES || file.size === 0) throw new Error('اندازه فونت باید کمتر از ۱۰ مگابایت باشد')
      const info = await readFontInfo(await file.arrayBuffer())
      const family = cleanFamilyName(input.family || info.family || file.name.replace(/\.[^.]+$/, ''))
      if (!family) throw new Error('نام فونت معتبر نیست')
      const weight = info.weight ?? 400
      const style = info.style ?? 'normal'
      if ([...current, ...added].some(f => f.family.toLocaleLowerCase() === family.toLocaleLowerCase() && f.weight === weight && f.style === style)) {
        throw new Error('این وزن و سبک فونت قبلاً اضافه شده است')
      }
      added.push({ id: newId(), family, category: input.category ?? 'sans-serif', weight, style, blob: file })
    }
    await writeFonts(added)
    options?.onProgress?.(1)
    const all = fontFamilies([...current, ...added])
    return all.find(f => f.family.toLocaleLowerCase() === added[0].family.toLocaleLowerCase())!
  },
  async remove(id: string) {
    const matched = (await storedFonts()).filter(f => f.family.toLowerCase() === id.toLowerCase() || f.id === id)
    await writeFonts(matched, true)
    for (const item of matched) {
      const url = fontUrls.get(item.id)
      if (url) URL.revokeObjectURL(url)
      fontUrls.delete(item.id)
    }
  },
}

const BRAND_KEY = 'doory-fa-local-brand-kits-v1'
export const offlineBrand = {
  async list(): Promise<BrandKit[]> {
    try { return JSON.parse(localStorage.getItem(BRAND_KEY) || '[]') as BrandKit[] }
    catch { return [] }
  },
  async save(kit: BrandKit): Promise<BrandKit> {
    const items = await offlineBrand.list()
    const now = new Date().toISOString()
    const saved: BrandKit = { ...kit, id: kit.id || newId(), created_at: kit.created_at || now, updated_at: now }
    const updated = items.filter(k => k.id !== saved.id).map(k => saved.is_default ? { ...k, is_default: false } : k)
    updated.push(saved)
    localStorage.setItem(BRAND_KEY, JSON.stringify(updated))
    return saved
  },
}

/* Bundled editable templates — no HTTP, no remote thumbnails. */
type BaseTemplate = { slug: string; title: string; width: number; height: number; bg: string; accent: string; sub: string; caption: string; category: string }
const sampleTemplates: BaseTemplate[] = [
  { slug: 'fa-birthday', title: 'تولدت مبارک', width: 1080, height: 1920, bg: '#fff0f4', accent: '#bc3e72', sub: 'امروز روز توست', caption: 'جشن لبخندهای قشنگت 🎉', category: 'جشن' },
  { slug: 'fa-blue-birthday', title: 'جشن آبی', width: 1080, height: 1920, bg: '#e6f5ff', accent: '#2057b0', sub: 'تولدت مبارک', caption: 'یک دنیا آرزوی خوب 💙', category: 'جشن' },
  { slug: 'fa-sale', title: 'تخفیف ویژه', width: 1080, height: 1080, bg: '#fff3dc', accent: '#a34d18', sub: 'فرصت محدود', caption: 'تا ۵۰٪ تخفیف', category: 'فروشگاه' },
  { slug: 'fa-cafe', title: 'کافه گرم', width: 1080, height: 1350, bg: '#f4eee6', accent: '#65412d', sub: 'یک فنجان آرامش', caption: 'همین امروز مهمان ما باش', category: 'فروشگاه' },
  { slug: 'fa-love', title: 'متن عاشقانه', width: 1080, height: 1920, bg: '#f9e8ef', accent: '#922e52', sub: 'برای عزیزترینم', caption: 'با تو دنیا قشنگ‌تره ♡', category: 'احساسی' },
  { slug: 'fa-quote', title: 'نقل‌قول انگیزشی', width: 1080, height: 1080, bg: '#ebf1e7', accent: '#285e3c', sub: 'به خودت ایمان داشته باش', caption: 'هر روز یک شروع تازه است', category: 'انگیزشی' },
  { slug: 'fa-invite', title: 'دعوت‌نامه', width: 1080, height: 1920, bg: '#eeeaff', accent: '#55418e', sub: 'دعوتید به جشن ما', caption: 'زمان و مکان را اینجا بنویسید', category: 'جشن' },
  { slug: 'fa-announcement', title: 'اطلاعیه', width: 1080, height: 1350, bg: '#e8f5f5', accent: '#0e6266', sub: 'اطلاعیه مهم', caption: 'متن اطلاعیه شما', category: 'کاری' },
]
const previewSvg = (t: BaseTemplate) => {
  const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 400"><rect width="300" height="400" fill="' + t.bg + '"/><rect x="20" y="20" width="260" height="360" rx="25" fill="none" stroke="' + t.accent + '" stroke-width="5"/><circle cx="150" cy="105" r="40" fill="' + t.accent + '" opacity=".14"/><path d="M110 270 H190" stroke="' + t.accent + '" stroke-width="4"/><text x="150" y="210" font-family="Tahoma,sans-serif" font-size="23" fill="' + t.accent + '" text-anchor="middle" direction="rtl">' + t.title + '</text></svg>'
  return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg)
}
function summary(t: BaseTemplate): TemplateSummary {
  return { id: t.slug, slug: t.slug, title: t.title, category: { id: t.category, slug: t.category, name: t.category }, tags: [t.title, t.category], width: t.width, height: t.height, orientation: t.width === t.height ? 'square' : t.width > t.height ? 'landscape' : 'portrait', preset: 'custom', page_count: 1, thumbnail_url: previewSvg(t), is_featured: true, use_count: 0, created_at: '2026-10-28T00:00:00Z' }
}
export const offlineTemplates = {
  async categories(): Promise<TemplateCategory[]> {
    return [...new Set(sampleTemplates.map(t => t.category))].map((name, i) => ({ id: name, slug: name, name, icon: 'layout-template', template_count: sampleTemplates.filter(t => t.category === name).length, sort_order: i }))
  },
  async list(q: TemplateQuery) {
    const needle = q.q?.trim().toLowerCase()
    const filtered = sampleTemplates.map(summary).filter(t =>
      (!needle || (t.title + ' ' + t.tags.join(' ')).toLowerCase().includes(needle)) &&
      (!q.category || t.category?.slug === q.category) && (!q.orientation || t.orientation === q.orientation))
    const size = q.page_size ?? 24
    const offset = ((q.page ?? 1) - 1) * size
    return { count: filtered.length, next: null, previous: null, results: filtered.slice(offset, offset + size) }
  },
  async get(slug: string): Promise<TemplateDetail> {
    const sample = sampleTemplates.find(t => t.slug === slug)
    if (!sample) throw new Error('قالب پیدا نشد')
    const doc = createBlankDocument(sample.width, sample.height)
    const w = sample.width, h = sample.height
    const line = Math.round(w * 0.04)
    doc.pages[0].background = { type: 'solid', color: sample.bg }
    doc.pages[0].objects = [
      { id: newId(), type: 'rect', left: line, top: line, width: w - line * 2, height: h - line * 2, fill: 'transparent', stroke: sample.accent, strokeWidth: Math.max(4, w * 0.009), rx: 30, ry: 30 },
      { id: newId(), type: 'ellipse', left: w * 0.36, top: h * 0.17, rx: w * 0.14, ry: w * 0.14, width: w * 0.28, height: w * 0.28, fill: sample.accent, opacity: 0.17 },
      { id: newId(), type: 'textbox', text: sample.sub, left: w * 0.12, top: h * 0.42, width: w * 0.76, fontSize: w * 0.061, fontFamily: 'Tahoma', fontWeight: 600, fill: sample.accent, textAlign: 'center', lineHeight: 1.3 },
      { id: newId(), type: 'textbox', text: sample.caption, left: w * 0.12, top: h * 0.53, width: w * 0.76, fontSize: w * 0.04, fontFamily: 'Tahoma', fill: sample.accent, textAlign: 'center', lineHeight: 1.4 },
    ]
    return { ...summary(sample), description: 'قالب فارسی آفلاین و قابل ویرایش', document: doc }
  },
}

/* A small CC0-style geometric sticker pack drawn here as original SVG art. */
const stickers = [
  ['قلب', '<path d="M50 87 C17 62 2 43 12 25 C23 5 44 17 50 31 C62 13 81 7 91 26 C100 45 76 66 50 87Z" fill="#ec4b80"/>'],
  ['ستاره', '<polygon points="50,4 61,36 95,36 68,57 79,91 50,70 21,91 32,57 5,36 39,36" fill="#f2bc32"/>'],
  ['خورشید', '<circle cx="50" cy="50" r="25" fill="#f8bf39"/><path d="M50 2V17M50 83V98M2 50H17M83 50H98M16 16L27 27M73 73L84 84M84 16L73 27M27 73L16 84" stroke="#ed9e21" stroke-width="7" stroke-linecap="round"/>'],
  ['ابر', '<path d="M20 75A21 21 0 0 1 15 35A28 28 0 0 1 67 24A24 24 0 1 1 75 75Z" fill="#9fd7f5"/>'],
  ['گل', '<g fill="#f08bb0"><ellipse cx="50" cy="25" rx="15" ry="23"/><ellipse cx="50" cy="75" rx="15" ry="23"/><ellipse cx="25" cy="50" rx="23" ry="15"/><ellipse cx="75" cy="50" rx="23" ry="15"/></g><circle cx="50" cy="50" r="15" fill="#ffdc56"/>'],
  ['ماه', '<path d="M65 9A43 43 0 1 0 91 77A43 43 0 0 1 65 9Z" fill="#a69cdf"/>'],
  ['تیک', '<circle cx="50" cy="50" r="45" fill="#7acaab"/><path d="M25 51L43 69L77 32" fill="none" stroke="#fff" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>'],
  ['برگ', '<path d="M83 9C43 9 14 33 15 64C16 91 43 98 63 82C81 65 83 37 83 9Z" fill="#60b98b"/><path d="M22 87Q45 52 72 30" stroke="#317854" stroke-width="5" fill="none"/>'],
  ['بادکنک', '<ellipse cx="50" cy="37" rx="25" ry="32" fill="#899be5"/><path d="M48 69L52 78L46 87Q65 91 50 99" stroke="#657abd" fill="none" stroke-width="4"/>'],
  ['الماس', '<polygon points="23,20 77,20 96,45 50,93 4,45" fill="#5ac5d9"/><path d="M23 20L35 45L50 93L65 45L77 20M4 45H96" fill="none" stroke="#ffffff" opacity=".55" stroke-width="3"/>'],
  ['روبــان', '<path d="M5 33Q50 7 95 33L84 66Q50 45 16 66Z" fill="#f08c70"/><path d="M7 33L2 75L24 65M93 33L98 75L76 65" fill="#d26b5f"/>'],
  ['جرقه', '<path d="M50 3L60 41L97 50L60 60L50 97L40 60L3 50L40 41Z" fill="#e7ad4d"/>'],
] as const
const stickerPack: ElementPack = { id: 'doory-fa-original', slug: 'doory-fa-original', name: 'استیکرهای فارسی آفلاین', kind: 'sticker', thumbnail_url: null, element_count: stickers.length, license: 'CC0-1.0', license_url: 'https://creativecommons.org/publicdomain/zero/1.0/', attribution: '', source_url: '' }
const builtinStickers: ElementItem[] = stickers.map(([name, svg], i) => ({
  id: 'fa-' + i, name, kind: 'sticker', style: 'colour', pack: { id: stickerPack.id, slug: stickerPack.slug, name: stickerPack.name }, tags: [name], svg_url: 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">' + svg + '</svg>'), width: 100, height: 100, colors: [], is_recolorable: false,
}))
export const offlineElements = {
  async packs(): Promise<ElementPack[]> { return [stickerPack] },
  async list(q: ElementQuery) {
    const filtered = builtinStickers.filter(x => (!q.kind || q.kind === 'sticker') && (!q.pack || q.pack === stickerPack.slug) && (!q.q || x.name.includes(q.q)))
    const count = filtered.length, size = q.page_size ?? 36, offset = ((q.page ?? 1) - 1) * size
    return { count, next: null, previous: null, results: filtered.slice(offset, offset + size) }
  },
}
