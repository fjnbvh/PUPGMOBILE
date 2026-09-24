# PUBG UC + Kashier TEST — GitHub + Vercel

ارفع محتويات هذا المجلد إلى GitHub ثم استورد المستودع في Vercel.

أضف في Vercel Environment Variables:
- KASHIER_SECRET_KEY
- KASHIER_API_KEY
- KASHIER_MERCHANT_ID

لا تضع المفاتيح السرية في GitHub أو index.html.

الواجهة تستدعي /api/create-session، وVercel يشغل api/create-session.js.
التحقق التجريبي موجود في api/verify/[sessionId].js.

استخدم مفاتيح Kashier TEST أثناء التجربة.
