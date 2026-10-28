import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { createBlankDocument } from '@/lib/document'
import { createLocalDesign, listLocalDesigns, type LocalDesignSummary } from '@/lib/local'

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
      <p style={{ fontSize: 12, lineHeight: 1.9, marginTop: 28, color: '#665879' }}>
        ورود به حساب، اشتراک‌گذاری آنلاین، قالب‌های سروری و ذخیره ابری در این نسخه آفلاین فعال نیستند.
        قبل از حذف برنامه، از طرح‌های مهم خروجی بگیر.
      </p>
    </main>
  )
}
