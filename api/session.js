export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { amount, coins, playerId } = req.body || {};

  if (!amount || !coins || !playerId) {
    return res.status(400).json({ error: 'Missing amount, coins or playerId' });
  }

  const MERCHANT_ID = process.env.KASHIER_MERCHANT_ID;
  const SECRET_KEY  = process.env.KASHIER_SECRET_KEY;
  const API_KEY     = process.env.KASHIER_API_KEY;
  const BASE        = process.env.KASHIER_BASE || 'https://test-api.kashier.io';
  const SITE_URL    = process.env.SITE_URL || `https://${req.headers.host}`;

  if (!MERCHANT_ID || !SECRET_KEY || !API_KEY) {
    return res.status(500).json({ error: 'Missing Kashier credentials on server' });
  }

  const orderRef = `PUBG-${playerId}-${coins}-${Date.now()}`;

  const payload = {
    expireAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    maxFailureAttempts: 3,
    paymentType: 'credit',
    amount: String(amount),
    currency: 'EGP',
    order: orderRef,
    merchantRedirect: `${SITE_URL}/success.html`,
    display: 'ar',
    type: 'one-time',
    allowedMethods: 'card,wallet',
    merchantId: MERCHANT_ID,
    description: `PUBG UC ${coins} - Player ${playerId}`,
    customer: {
      email: `player${playerId}@pubg.local`,
      reference: playerId
    },
    interactionSource: 'ECOMMERCE',
    enable3DS: true,
    metaData: {
      playerId: String(playerId),
      coins: String(coins)
    }
  };

  try {
    const kashierRes = await fetch(`${BASE}/v3/payment/sessions`, {
      method: 'POST',
      headers: {
        'Authorization': SECRET_KEY,
        'api-key': API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await kashierRes.json();

    if (!kashierRes.ok) {
      return res.status(kashierRes.status).json({
        error: 'Kashier rejected the request',
        details: data
      });
    }

    const sessionUrl = data.sessionUrl || (data.data && data.data.sessionUrl);
    const sessionId  = data.sessionId  || (data.data && data.data.sessionId);

    return res.status(200).json({ sessionUrl, sessionId, raw: data });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
