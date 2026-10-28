# راه‌اندازی بخش آنلاین دوری فارسی — راهنمای سرور

این سند راه‌اندازی اختیاری بک‌اند Django و نسخه وب در یک دامنه HTTPS است.
**GitHub به‌تنهایی سرور Django، PostgreSQL یا WebSocket را اجرا نمی‌کند.**
تا وقتی سرویس واقعی راه‌اندازی نشود، قابلیت‌های آنلاین APK فعال نیستند.

## پیش‌نیاز

- سرور لینوکسی با دسترسی SSH، Docker Engine و Docker Compose
- دامنه‌ای که رکورد A/AAAA آن به IP همان سرور اشاره کند
- دسترسی ورودی TCP به پورت‌های 80 و 443 (در صورت امکان UDP 443)
- منابع کافی برای PostgreSQL، Django، و در صورت نیاز ffmpeg و Chromium
- بکاپ دوره‌ای پایگاه داده و فایل‌های کاربران

## تنظیمات سرور

در سرور، پروژه را دریافت کنید:

~~~bash
git clone https://github.com/hasanclash500/doory-fa.git
cd doory-fa
cp .env.example .env
~~~

**فایل .env را در GitHub منتشر نکنید.** در آن تنظیم کنید:

~~~dotenv
SITE_URL=https://design.example.com
DJANGO_ALLOWED_HOSTS=design.example.com
DJANGO_SECRET_KEY=REPLACE_WITH_A_LONG_RANDOM_SECRET
POSTGRES_PASSWORD=REPLACE_WITH_A_STRONG_URL_SAFE_PASSWORD
SECURE_SSL_REDIRECT=true
SECURE_COOKIES=true
WEB_BIND=127.0.0.1
DOORY_DOMAIN=design.example.com
~~~

دامنه نمونه را به دامنه خودتان تغییر دهید. برای کلید جنگو و رمز دیتابیس
مقادیر طولانی و تصادفی تولید کنید. فایل .env.example تنظیمات اضافهٔ ایمیل،
بازیابی رمز، محدودیت فایل و providerهای آنلاین دارد.

## اجرا با HTTPS خودکار

~~~bash
docker compose -f docker-compose.yml -f docker-compose.online.yml up -d --build
docker compose -f docker-compose.yml -f docker-compose.online.yml ps
~~~

وب، API، فایل‌ها و WebSocket پشت Caddy با گواهی TLS قرار می‌گیرند.
این آدرس‌ها را بررسی کنید (دامنه مثال را عوض کنید):

- https://design.example.com
- https://design.example.com/healthz
- https://design.example.com/api/v1/config/

**پاسخ JSON صحیح از /api/v1/config/** مهم است؛ نمایش /healthz به‌تنهایی
سلامت Django را اثبات نمی‌کند.

سرور تازه معمولاً قالب‌های عمومی آماده ندارد. برای واردکردن محتوا راهنمای
[افزودن محتوای سرور](self-hosting/content.md) را بخوانید.
استوک و سرویس‌های هوش مصنوعی ممکن است کلید API، هزینه و مجوز جداگانه بخواهند.

## اتصال از APK

برنامه دوری فارسی را باز کنید و در «امکانات آنلاین» نشانی HTTPS دامنه را وارد
کنید. دکمهٔ «باز کردن دوری آنلاین» مرورگر امن اندروید (Custom Tabs) را باز می‌کند.
کوکی ورود و API روی همان دامنه کار می‌کنند. با بستن تب، به ویرایش آفلاین برمی‌گردید.

**فایل‌های گوشی خودکار با سرور همگام‌سازی نمی‌شوند.** قابلیت‌هایی مانند ذخیره ابری
و اشتراک‌گذاری بین دستگاه‌ها ممکن است به حساب کاربری روی سرور نیاز داشته باشند.
این نسخه برای ثبت طرح محلی به حساب نیاز ندارد.

## امنیت و نگهداری

- دامنه HTTPS معتبر و تنظیمات صحیح DNS لازم است؛ HTTP را در APK وارد نکنید.
- هیچ رمز/کلید را در فایل‌های عمومی GitHub و گزارش‌های Actions منتشر نکنید.
- از volumeهای pgdata و media بکاپ بگیرید و بازیابی را تمرین کنید.
- هنگام اتصال عمومی، نرخ درخواست، ایمیل ثبت‌نام، بروزرسانی‌ها و مانیتورینگ را تنظیم کنید.
- مجوز و انتساب سازنده اصلی Doory را حفظ کنید.
