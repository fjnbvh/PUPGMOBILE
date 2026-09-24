export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({error:"Method not allowed"});
  try {
    const sessionId = req.query.sessionId;
    if (!sessionId) return res.status(400).json({error:"sessionId is required"});
    const secret = process.env.KASHIER_SECRET_KEY;
    if (!secret) return res.status(500).json({error:"Kashier Secret Key غير مضبوط"});
    const r = await fetch(`https://test-api.kashier.io/v3/payment/sessions/${encodeURIComponent(sessionId)}/payment`,{
      headers:{Authorization:secret}
    });
    const text = await r.text();
    res.status(r.status).setHeader("Content-Type","application/json; charset=utf-8");
    return res.send(text);
  } catch(e) {
    return res.status(500).json({error:e.message||"Server error"});
  }
}
