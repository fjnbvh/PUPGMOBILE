<?php
// ضع بيانات Kashier TEST هنا على السيرفر فقط.
// لا ترفع هذا الملف إلى GitHub public ولا تضع القيم داخل index.html.

return [
    'secret_key' => 'PUT_YOUR_NEW_TEST_SECRET_KEY_HERE',
    'api_key'    => 'PUT_YOUR_TEST_API_KEY_HERE',
    'merchant_id'=> 'PUT_YOUR_TEST_MERCHANT_ID_HERE',

    // Test endpoint من توثيق Kashier:
    'sessions_url' => 'https://test-api.kashier.io/v3/payment/sessions',

    // رابط موقعك بعد الدفع:
    'merchant_redirect' => 'https://YOUR-DOMAIN.example/redirect.html',
];
