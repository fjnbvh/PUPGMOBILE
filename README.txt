Kashier Test - خطوات التشغيل

1) هذه النسخة مبنية على index.html الحالي.
2) ارفع index.html و create-payment.php و config.php و redirect.html إلى استضافة تدعم PHP + cURL.
3) افتح config.php على السيرفر وضع:
   - Test Secret Key الجديد
   - Test API Key
   - Test Merchant ID
   - merchant_redirect = رابط redirect.html على موقعك
4) لا تضع Secret Key داخل index.html.
5) استخدم Kashier TEST فقط أثناء التجربة.
6) قبل الإنتاج، أضف Webhook/Verify وتحقق من العملية من السيرفر قبل تسليم الشدات.

ملاحظة:
GitHub Pages وحده لا يشغل create-payment.php. إذا كان الموقع على GitHub Pages،
يمكن إبقاء index.html هناك واستخدام Backend PHP على استضافة تدعم PHP.
