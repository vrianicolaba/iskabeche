# TradingView -> Telegram Signal Relay

Sends your XAUUSD BUY/SELL alerts from TradingView straight into a Telegram
channel, group, or DM.

## Step 1 — Create your Telegram bot

1. Open Telegram, search for **@BotFather**, and start a chat.
2. Send `/newbot`, give it a name and a username (must end in "bot").
3. BotFather gives you a **bot token** — looks like `123456789:AAExampleTokenHere`.
   Save it, you'll need it in Step 4.

## Step 2 — Create your channel/group and get the chat ID

1. Create a Telegram **channel** (for broadcasting to subscribers) or **group**.
2. Add your bot to it as an **admin** (so it has permission to post).
3. To find the chat ID:
   - Send any message in the channel/group.
   - Visit this URL in your browser (replace `<TOKEN>` with your bot token):
     `https://api.telegram.org/bot<TOKEN>/getUpdates`
   - Look for `"chat":{"id": -1001234567890, ...}` in the response — that
     number (including the minus sign, if present) is your **chat ID**.
   - If you don't see anything, make sure you sent a message *after* adding
     the bot, then refresh the URL.

## Step 3 — Deploy this relay to Vercel (free)

1. Go to vercel.com and sign up / log in (GitHub login is easiest).
2. Create a new GitHub repo, upload this whole `tradingview-telegram-relay` folder to it.
3. In Vercel: **Add New Project** -> Import that GitHub repo -> Deploy.
4. Once deployed, go to your project's **Settings -> Environment Variables** and add:
   - `TELEGRAM_BOT_TOKEN` = the token from Step 1
   - `TELEGRAM_CHAT_ID` = the chat ID from Step 2
   - `WEBHOOK_SECRET` = any random string you make up (e.g. `xG7k9pQ2z`) — this
     stops strangers from spamming your channel if they guess your URL.
5. Redeploy after adding env vars (Vercel prompts you, or push any small change).
6. Your webhook URL will be:
   `https://<your-project-name>.vercel.app/api/webhook?secret=xG7k9pQ2z`

## Step 4 — Connect it to TradingView

1. On your XAUUSD chart with the strategy/indicator applied, click **Alert** (clock icon).
2. Set the **Condition** to your script, e.g. "XAUUSD Buy Signal" or "XAUUSD Sell Signal"
   (create one alert for Buy, one for Sell).
3. Under **Notifications**, check **Webhook URL** and paste the URL from Step 3.6.
4. In the **Message** box, write what you want sent to Telegram. You can use
   TradingView's placeholders, e.g.:
   ```
   {{strategy.order.action}} XAUUSD
   Price: {{close}}
   Time: {{time}}
   Timeframe: {{interval}}
   ```
   Or for a plain indicator (non-strategy) alert:
   ```
   XAUUSD Signal ({{interval}})
   Price: {{close}}
   Time: {{time}}
   ```
5. Click **Create**. Trigger a test (or wait for a real signal) and check your
   Telegram channel.

## Testing without waiting for a live signal

You can test the relay directly with curl:

```bash
curl -X POST "https://<your-project-name>.vercel.app/api/webhook?secret=xG7k9pQ2z" \
  -H "Content-Type: text/plain" \
  -d "TEST: BUY XAUUSD at 2385.50"
```

If it works, you'll get `{"success":true}` back and see the message in Telegram.

## Notes

- **Free tier limits:** Vercel's free tier easily handles the volume of a
  personal signal setup (a handful of alerts a day).
- **Reliability:** TradingView webhooks fire from server-side alerts, so they
  work even if your TradingView tab/browser is closed — but only on paid
  TradingView plans that support server-side alerts on custom scripts, and
  only while your chart/alert remains active. Free-tier alert limits apply too.
- **If you plan to share signals with others (especially for payment):**
  many jurisdictions regulate "signal providers" or investment advice
  services. This isn't legal advice — it's worth checking your local
  securities regulator's rules before offering paid signals to the public.
