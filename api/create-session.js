export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  try {
    const { playerId, coins, amount } = req.body || {};
    if (!/^[1-9][0-9]{7,14}$/.test(String(playerId || "")))
      return res.status(400).json({ error: "معرف اللاعب غير صحيح" });

    const prices = {500:280,1000:560,2000:1120,4000:2240,8000:4480,16000:8960};
    const key = String(Number(coins));
    if (!(key in prices)) return res.status(400).json({ error: "الباقة غير صحيحة" });

    const expectedAmount = prices[key];
    if (Number(amount) !== expectedAmount)
      return res.status(400).json({ error: "المبلغ غير صحيح" });

    const {KASHIER_SECRET_KEY, KASHIER_API_KEY, KASHIER_MERCHANT_ID} = process.env;
    if (!KASHIER_SECRET_KEY || !KASHIER_API_KEY || !KASHIER_MERCHANT_ID)
      return res.status(500).json({ error: "إعدادات Kashier غير مكتملة" });

    const order = `PUBG-TEST-${Date.now()}-${Math.random().toString(16).slice(2,10)}`;
    const proto = req.headers["x-forwarded-proto"] || "https";
    const baseUrl = `${proto}://${req.headers.host}`;

    const payload = {
      expireAt:new Date(Date.now()+1800000).toISOString(),
      maxFailureAttempts:3,paymentType:"credit",amount:expectedAmount.toFixed(2),
      currency:"EGP",order,merchantRedirect:`${baseUrl}/result.html`,
      display:"ar",type:"one-time",allowedMethods:"card,wallet",redirectMethod:"get",
      merchantId:KASHIER_MERCHANT_ID,failureRedirect:false,brandColor:"#1a73e8",
      defaultMethod:"card",description:`PUBG UC TEST - ${key} UC - Player ${playerId}`,
      interactionSource:"ECOMMERCE",enable3DS:true,
      metaData:{playerId:String(playerId),coins:Number(coins)}
    };

    const r = await fetch("https://test-api.kashier.io/v3/payment/sessions",{
      method:"POST",
      headers:{Authorization:KASHIER_SECRET_KEY,"api-key":KASHIER_API_KEY,"Content-Type":"application/json"},
      body:JSON.stringify(payload)
    });
    const data = await r.json();
    if (!r.ok) return res.status(r.status).json({error:"Kashier rejected the session",details:data});
    if (!data.sessionUrl) return res.status(502).json({error:"Kashier did not return sessionUrl",details:data});
    return res.status(200).json({sessionUrl:data.sessionUrl,sessionId:data.sessionId||data.id||null,order});
  } catch(e) {
    return res.status(500).json({error:e.message||"Server error"});
  }
}
