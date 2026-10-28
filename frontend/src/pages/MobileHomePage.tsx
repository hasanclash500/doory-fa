import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { createBlankDocument } from '@/lib/document'
import { createLocalDesign, listLocalDesigns, type LocalDesignSummary } from '@/lib/local'
import { getSavedOnlineServer, openOnlineDoory, saveOnlineServer } from '@/lib/mobileOnline'

const presets = [
  { label: 'استوری', detail: '۱۰۸۰ × ۱۹۲۰', width: 1080, height: 1920 },
  { label: 'پست مربعی', detail: '۱۰۸۰ × ۱۰۸۰', width: 1080, height: 1080 },
  { label: 'پوستر', detail: '۱۲۰۰ × ۱۶۰۰', width: 1200, height: 1600 },
  { label: 'اسلاید', detail: '۱۹۲۰ × ۱۰۸۰', width: 1920, height: 1080 },
]

/** The standalone Android application starts here; no backend is requested. */
export default function MobileHomePage() {
  const navigate = useNavigate()
  const [designs, setDesigns] = useState<LocalDesignSummary[]>([])
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')
  const [onlineUrl, setOnlineUrl] = useState(getSavedOnlineServer)
  const [onlineError, setOnlineError] = useState('')
  const [openingOnline, setOpeningOnline] = useState(false)
  async function launchOnline() {
    if (openingOnline) return
    setOnlineError('')
    try {
      const url = saveOnlineServer(onlineUrl)
      setOnlineUrl(url)
      setOpeningOnline(true)
      await openOnlineDoory(url)
    } catch (e) {
      setOnlineError(e instanceof Error ? e.message : 'بازکردن نسخه آنلاین انجام نشد.')
    } finally { setOpeningOnline(false) }
  }

  useEffect(() => {
    let active = true
    listLocalDesigns()
      .then((items) => { if (active) setDesigns(items) })
      .catch(() => { if (active) setError('امکان خواندن طرح‌های ذخیره‌شده وجود ندارد.') })
    return () => { active = false }
  }, [])

  async function makeDesign(width: number, height: number, label: string) {
    if (creating) return
    setCreating(true)
    setError('')
    try {
      const design = await createLocalDesign({
        title: `طرح ${label}`,
        document: createBlankDocument(width, height),
      })
      navigate(`/local/${design.id}`)
    } catch {
      setError('ایجاد طرح انجام نشد. فضای ذخیره‌سازی گوشی را بررسی کنید.')
      setCreating(false)
    }
  }

  const cardStyle = { border: '1px solid #e4def1', borderRadius: 18, padding: 16, background: '#fff', color: '#28194b' }
  return (
    <main id="main" dir="rtl" style={{ minHeight: '100dvh', padding: '28px 18px 110px', maxWidth: 760, margin: 'auto', fontFamily: 'inherit', color: '#24183f' }}>
      <header style={{ marginBottom: 26 }}>
        <p style={{ fontSize: 14, color: '#755ab5', margin: '0 0 5px' }}>دوری فارسی 💙</p>
        <h1 style={{ fontSize: 29, margin: '0 0 10px' }}>چی دوست داری طراحی کنی؟</h1>
        <p style={{ lineHeight: 2, color: '#59516c', fontSize: 14 }}>
          بدون ثبت‌نام شروع کن. طرح‌ها در حافظه همین گوشی ذخیره می‌شوند و برای طراحی اولیه به اینترنت نیازی نیست.
        </p>
      </header>
      <section aria-label="ساخت طرح جدید">
        <h2 style={{ fontSize: 19, marginBottom: 14 }}>ساخت طرح جدید</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 12 }}>
          {presets.map((item) => (
            <button key={item.label} type="button" disabled={creating}
              onClick={() => void makeDesign(item.width, item.height, item.label)}
              style={{ ...cardStyle, textAlign: 'right', minHeight: 106, cursor: 'pointer' }}>
              <span style={{ display: 'block', fontSize: 19, fontWeight: 700, marginBottom: 9 }}>{item.label}</span>
              <span style={{ color: '#74658a', fontSize: 13 }}>{item.detail}</span>
            </button>
          ))}
        </div>
      </section>
      {error && <p role="alert" style={{ color: '#ae2342', marginTop: 16 }}>{error}</p>}
      <section aria-labelledby="saved-designs-heading" style={{ marginTop: 34 }}>
        <h2 id="saved-designs-heading" style={{ fontSize: 19, marginBottom: 14 }}>طرح‌های من</h2>
        {designs.length === 0 ? (
          <div style={cardStyle}>هنوز طرحی ذخیره نکرده‌ای. یکی از گزینه‌های بالا را انتخاب کن.</div>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: 10 }}>
            {designs.map((design) => (
              <li key={design.id}>
                <Link to={`/local/${design.id}`} style={{ ...cardStyle, display: 'block', textDecoration: 'none' }}>
                  <strong>{design.title || 'طرح بدون نام'}</strong>
                  <span style={{ display: 'block', fontSize: 12, marginTop: 4, color: '#74658a' }}>
                    {design.width} × {design.height} — {design.pageCount} صفحه
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
      <section aria-labelledby="online-mode-title" style={{ marginTop: 32, border: '1px solid #d7c8ec', background: '#f6f2ff', borderRadius: 18, padding: 18 }}>
        <h2 id="online-mode-title" style={{ fontSize: 19, margin: '0 0 8px' }}>امکانات آنلاین</h2>
        <p style={{ fontSize: 13, lineHeight: 2, color: '#55446c', marginBottom: 14 }}>
          بعد از راه‌اندازی سرور دوری فارسی، نشانی HTTPS آن را اینجا وارد کن. نسخه آنلاین در تب امن اندروید باز می‌شود
          و می‌تواند از قالب‌های سرور، فایل‌های آنلاین و امکانات ابری استفاده کند؛ هرکدام که روی سرور فعال باشند.
        </p>
        <label htmlFor="doory-online-url" style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 7 }}>آدرس سایت دوری فارسی</label>
        <input id="doory-online-url" type="url" inputMode="url" dir="ltr" autoCapitalize="off" autoComplete="url"
          placeholder="https://design.example.com" value={onlineUrl}
          onChange={event => { setOnlineUrl(event.target.value); setOnlineError('') }}
          style={{ display: 'block', width: '100%', height: 46, boxSizing: 'border-box', border: '1px solid #b5a5d2', borderRadius: 10, padding: '0 12px', background: '#fff', color: '#24183f', fontSize: 14, textAlign: 'left' }} />
        {onlineError && <p role="alert" style={{ color: '#aa2240', marginTop: 8, fontSize: 13 }}>{onlineError}</p>}
        <button type="button" disabled={openingOnline || !onlineUrl.trim()} onClick={() => { void launchOnline() }}
          style={{ display: 'block', width: '100%', marginTop: 12, minHeight: 46, color: 'white', background: '#4b3289', borderRadius: 10, fontWeight: 700, opacity: openingOnline ? .6 : 1 }}>
          {openingOnline ? 'در حال باز کردن…' : 'باز کردن دوری آنلاین'}
        </button>
        <p style={{ fontSize: 12, lineHeight: 1.9, color: '#665879', marginTop: 12 }}>
          ذخیره این نشانی به معنی راه‌اندازی سرور نیست. طرح‌های گوشی خودکار به سایت منتقل نمی‌شوند.
          ذخیره و اشتراک‌گذاری ابری ممکن است به ورود حساب نیاز داشته باشد. برای کار آفلاین از «طرح‌های من» استفاده کن.
        </p>
      </section>
      <footer aria-label="درباره برنامه و توسعه‌دهندگان" style={{ marginTop: 30, padding: '18px 14px', border: '1px solid #e4def1', borderRadius: 16, background: '#faf8ff', textAlign: 'center', fontSize: 13, lineHeight: 2 }}>
        <p style={{ color: '#28194b', fontWeight: 700 }}>فارسی‌سازی و توسعه نسخه اندروید: حسن عابدینی</p>
        <a href="https://github.com/hasanclash500" target="_blank" rel="noopener noreferrer" dir="ltr" style={{ display: 'inline-block', fontWeight: 600, direction: 'ltr' }}>github.com/hasanclash500</a>
        <p style={{ color: '#665879', marginTop: 8, fontSize: 12 }}>
          بر پایهٔ پروژه متن‌باز Doory، ساختهٔ Siam — <a href="https://github.com/shaongitbd/doory" target="_blank" rel="noopener noreferrer" dir="ltr">GitHub سازنده اصلی</a>
        </p>
      </footer>
      <p style={{ fontSize: 12, lineHeight: 1.9, marginTop: 28, color: '#665879' }}>
        در حالت آفلاین ورود به حساب لازم نیست. امکانات سروری فقط هنگام اتصال به سایت آنلاین فعال می‌شوند.
        قبل از حذف برنامه، از طرح‌های مهم خروجی بگیر.
      </p>
    </main>
  )
}
