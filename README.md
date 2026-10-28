# دوری فارسی | Doory FA

نسخهٔ فارسی و راست‌به‌چپ پروژهٔ متن‌باز [Doory](https://github.com/shaongitbd/doory).

> **وضعیت مخزن:** این مخزن در حال آماده‌سازی است. کد کامل فارسی‌سازی‌شده هنوز در شاخهٔ اصلی قرار نگرفته؛ تا زمانی که فایل‌های پروژه آپلود نشده‌اند، ساخت اپلیکیشن اندروید ممکن نیست.

## فایل‌های آماده‌شده

نسخهٔ کامل فارسی‌سازی‌شده Doory 0.2.0 در گفت‌وگوی ChatGPT به شکل فایل `doory-fa-0.2.0-source.zip` تحویل داده شده است. قبل از اجرا باید **محتویات ZIP استخراج شوند** و فایل‌های درون پوشهٔ `doory-fa-0.2.0` در ریشهٔ این مخزن قرار بگیرند، نه خود فایل ZIP.

## بارگذاری کد

در رایانه‌ای که `git` نصب است:

```bash
unzip doory-fa-0.2.0-source.zip
cd doory-fa-0.2.0
git init
git remote add origin https://github.com/hasanclash500/doory-fa.git
git fetch origin main
git add .
git commit -m "Add Doory 0.2.0 Persian RTL source"
git branch -M main
git pull --rebase origin main
git push -u origin main
```

اگر `git pull --rebase` به دلیل تغییرهای مشترک در README خطا داد، ابتدا خطا را رفع کنید و سپس `git rebase --continue` را اجرا کنید. **از `git push --force` استفاده نکنید.** قبل از انتشار، فایل‌های محرمانه مثل `.env`، کلیدها و رمزها را بررسی کنید.

## اجرای وب

بخش رابط کاربری React و TypeScript و بخش سرور Django است. برای اجرای کامل، سرور، پایگاه‌داده و تنظیمات محیطی لازم‌اند.

```bash
cp .env.example .env
# DJANGO_SECRET_KEY و POSTGRES_PASSWORD را با مقدارهای امن تنظیم کنید
docker compose up -d --build
```

## ساخت برنامهٔ اندروید

این پروژه از Capacitor استفاده می‌کند. نسخهٔ اندروید، وب‌اپ را روی دامنهٔ HTTPS شما نمایش می‌دهد و **سرور Django را در گوشی اجرا نمی‌کند**.

1. ابتدا برنامه را روی دامنهٔ HTTPS اجرا و آزمایش کنید.
2. در GitHub به `Settings → Secrets and variables → Actions → Variables` بروید.
3. متغیر `DOORY_APP_URL` را برابر نشانی HTTPS واقعی سایت قرار دهید.
4. از بخش `Actions` گردش‌کار «ساخت APK آزمایشی دوری فارسی» را اجرا کنید.
5. اگر مراحل موفق شد، APK آزمایشی را از بخش `Artifacts` دریافت کنید.

این APK آزمایشی است و برای انتشار عمومی، امضای برنامه و آزمایش کامل نیاز است.

## مجوز و انتساب

حقوق Doory متعلق به Siam و مشارکت‌کنندگان است. هنگام بارگذاری کد، فایل‌های اصلی `LICENSE`، `NOTICE` و `AUTHORS.md` را بدون حذف کردن نگه دارید. مجوز مستلزم نمایش برجستهٔ انتساب سازنده هنگام اجرای برنامه است:

**Siam — Creator and maintainer of Doory — https://github.com/shaongitbd/doory**

این مخزن وابسته یا مورد تأیید سازندهٔ اصلی نیست.
