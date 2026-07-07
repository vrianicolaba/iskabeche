// TradingView -> Telegram relay
// Deploy this on Vercel (free tier is enough). See README.md for full setup.

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Use POST" });
  }

  // ---- Security: require a shared secret in the URL ----
  // Set WEBHOOK_SECRET in Vercel env vars, and use it in your TradingView
  // webhook URL like: https://your-app.vercel.app/api/webhook?secret=XXXX
  const expectedSecret = process.env.WEBHOOK_SECRET;
  if (expectedSecret && req.query.secret !== expectedSecret) {
    return res.status(401).json({ error: "Invalid or missing secret" });
  }

  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    return res.status(500).json({ error: "Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID env vars" });
  }

  // TradingView sends the alert "Message" field as the raw request body.
  // It may arrive as plain text or as JSON depending on what you typed
  // in the alert's Message box - handle both.
  let text;
  if (typeof req.body === "string") {
    text = req.body;
  } else if (req.body && typeof req.body === "object") {
    text = req.body.message || req.body.text || JSON.stringify(req.body);
  } else {
    text = "TradingView alert received (no message body)";
  }

  try {
    const telegramResp = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: `📊 *XAUUSD Signal*\n\n${text}`,
        parse_mode: "Markdown",
      }),
    });

    const data = await telegramResp.json();

    if (!data.ok) {
      console.error("Telegram API error:", data);
      return res.status(502).json({ error: "Telegram API rejected the message", details: data });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Relay error:", err);
    return res.status(500).json({ error: "Failed to reach Telegram", details: String(err) });
  }
}
