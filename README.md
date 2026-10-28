# دوری فارسی | Doory FA

نسخهٔ فارسی و راست‌به‌چپ پروژهٔ متن‌باز [Doory](https://github.com/shaongitbd/doory).

> **وضعیت مخزن:** این مخزن در حال آماده‌سازی است. کد کامل فارسی‌سازی‌شده هنوز در شاخهٔ اصلی قرار نگرفته؛ تا زمانی که فایل‌های پروژه آپلود نشده‌اند، ساخت اپلیکیشن اندروید ممکن نیست.

## فایل‌های آماده‌شده

نسخهٔ کامل فارسی‌سازی‌شده Doory 0.2.0 در گفت‌وگوی ChatGPT به شکل فایل `doory-fa-0.2.0-source.zip` تحویل داده شده است. **با گوشی، فایل ZIP را بدون استخراج بارگذاری کنید؛ GitHub Actions خودش آن را استخراج می‌کند.** برای انتقال دستی با کامپیوتر می‌توانید فایل را استخراج کنید.

## انتقال پروژه با گوشی (اندروید یا آیفون)

1. فایل **`doory-fa-0.2.0-source.zip`** را از گفت‌وگوی ChatGPT دانلود کنید؛ نام آن را تغییر ندهید و استخراجش نکنید.
2. با مرورگر Chrome یا Safari وارد GitHub شوید. اگر دکمه‌های لازم دیده نمی‌شوند، گزینهٔ **Desktop site / Request Desktop Website** را روشن کنید.
3. به [صفحهٔ بارگذاری فایل مخزن](https://github.com/hasanclash500/doory-fa/upload/main) بروید یا از مخزن **Add file → Upload files** را انتخاب کنید.
4. همان فایل ZIP را از بخش Downloads گوشی انتخاب کنید. در پایین صفحه **Commit directly to the main branch** و سپس **Commit changes** را بزنید.
5. [بخش Actions مخزن](https://github.com/hasanclash500/doory-fa/actions/workflows/import-doory-fa-zip.yml) را باز کنید. گردش‌کار **Import Doory FA ZIP (mobile upload)** پس از آپلود باید خودکار اجرا شود. پس از موفقیت، فایل ZIP پاک می‌شود و هزاران فایل برنامه در مخزن ظاهر می‌شوند.
6. اگر اجرا خودکار شروع نشد، از همان صفحهٔ Actions گزینهٔ **Run workflow** را روی شاخهٔ `main` بزنید. اگر خطای دسترسی برای `git push` دیدید، در **Settings → Actions → General → Workflow permissions** دسترسی **Read and write permissions** را فعال کنید.

> **نکته:** تا قبل از موفقیت گردش‌کار Import، سورس کامل در GitHub نیست و ساخت APK انجام نمی‌شود.

## روش جایگزین: بارگذاری کد با کامپیوتر

**روش ساده با GitHub Desktop:**
1. [GitHub Desktop](https://desktop.github.com/) را روی رایانه نصب کنید و به حساب خود وارد شوید.
2. از `File → Clone repository` مخزن `hasanclash500/doory-fa` را روی رایانه کپی کنید.
3. فایل `doory-fa-0.2.0-source.zip` را استخراج کنید. **تمام محتویات داخل پوشهٔ `doory-fa-0.2.0`** (نه خود پوشهٔ اضافی و نه فایل ZIP) را به پوشهٔ مخزن کلون‌شده کپی کنید. به پرسش جایگزینی `README.md` و گردش‌کار اندروید، پاسخ «جایگزین» بدهید.
4. در GitHub Desktop یک پیام مانند `Add Persian Doory source` بنویسید، روی `Commit to main` و سپس `Push origin` بزنید.

**روش خط فرمان** (از پوشه‌ای که فایل ZIP را در آن دارید):

```bash
git clone https://github.com/hasanclash500/doory-fa.git
unzip doory-fa-0.2.0-source.zip
cp -a doory-fa-0.2.0/. doory-fa/
cd doory-fa
git add .
git commit -m "Add Doory 0.2.0 Persian RTL source"
git push origin main
```

پیش از انتشار، فایل‌های محرمانه مثل `.env`، کلیدها و رمزها را بررسی کنید و از `git push --force` استفاده نکنید.

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
