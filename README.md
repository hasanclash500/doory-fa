# دوری فارسی | Doory FA

نسخهٔ فارسیِ پروژهٔ متن‌باز [Doory](https://github.com/shaongitbd/doory) برای وب و اندروید.

**وضعیت:** کد اصلی نسخهٔ **v0.2.0** دریافت شده است. واژه‌نامهٔ **۱۹۰۴ عبارت فارسی**، چیدمان راست‌به‌چپ، پیام‌های فارسی حساب کاربری و تنظیمات ساخت APK اندروید در مخزن قرار دارند. همچنان بازبینی بصری و آزمون واقعی همهٔ بخش‌ها لازم است.

## 📱 دانلود APK آزمایشی

وارد [بخش ساخت اندروید](https://github.com/hasanclash500/doory-fa/actions/workflows/android-apk-fa.yml) شوید؛ آخرین اجرای موفق را باز کنید و از **Artifacts** بستهٔ `doory-fa-debug-apk` را دریافت کنید. پس از استخراج ZIP، فایل `app-debug.apk` را روی گوشی نصب کنید.

> APK فعلی نسخهٔ آزمایشی است، نه انتشار امضاشدهٔ فروشگاهی. ممکن است برای نصب نیاز باشد اجازهٔ نصب از این منبع را در اندروید فعال کنید.

## کار با سرور و قابلیت‌ها

بستهٔ اندروید به‌صورت پیش‌فرض صفحات React را درون برنامه نگه می‌دارد، اما **سرور Django را شامل نمی‌شود**. برای ورود به حساب، ذخیرهٔ ابری، اشتراک‌گذاری و قابلیت‌های وابسته به API باید بک‌اند Doory را روی HTTPS استقرار دهید.

برای نسخهٔ متصل به سرور، متغیر `DOORY_APP_URL` را در بخش **Settings → Secrets and variables → Actions → Variables** مخزن روی نشانی HTTPS استقرار فارسی خود قرار دهید و گردش‌کار APK را دوباره اجرا کنید. اگر این نشانی تنظیم نشود، APK به‌صورت محلی بسته‌بندی می‌شود.

## توسعه و ترجمه

- واژه‌نامه: `frontend/src/i18n/fa-dictionary.ts`
- منطق ترجمه و جلوگیری از تغییر متن طرح‌ها: `frontend/src/i18n/fa.ts`
- تنظیمات راست‌به‌چپ: `frontend/src/styles/global.css`
- تنظیمات موبایل: `frontend/capacitor.config.ts`
- فارسی‌سازی پیام‌های ایمیل: `backend/apps/accounts/templates/accounts/email/`
- راهنمای کامل‌تر: [README_FA.md](README_FA.md)
- کد و راهنمای انگلیسی نسخهٔ سازنده: [README_UPSTREAM.md](README_UPSTREAM.md)

## انتساب و مجوز

**Doory — ساختهٔ Siam، خالق و نگهدارندهٔ اصلی پروژه — [github.com/shaongitbd/doory](https://github.com/shaongitbd/doory)**

این نسخه وابسته به سازندهٔ اصلی نیست. شرایط مجوز و حقوق مشارکت‌کنندگان مطابق فایل‌های [LICENSE](LICENSE)، [NOTICE](NOTICE) و [AUTHORS.md](AUTHORS.md) حفظ شده‌اند.

## اعتبار توسعه نسخه فارسی و اندروید

**فارسی‌سازی و توسعه نسخه اندروید: حسن عابدینی** — [GitHub: @hasanclash500](https://github.com/hasanclash500)

این نسخه بر پایهٔ [Doory](https://github.com/shaongitbd/doory) ساخته شده است. حقوق و انتساب سازندهٔ اصلی، **Siam**، مطابق فایل `LICENSE` محفوظ می‌ماند.
