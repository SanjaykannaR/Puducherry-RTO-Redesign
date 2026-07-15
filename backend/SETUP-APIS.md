# API Setup Guide — SMS & Email

## SMS Gateway (MSG91)

MSG91 is an Indian SMS gateway with a free tier perfect for government portals.

### Getting your API key:
1. Go to **https://msg91.com** and sign up (free)
2. After login, go to **Dashboard → API → Auth Token**
3. Copy your **API Key** (looks like: `xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`)
4. Go to **SMS → Templates** and create a transactional template:
   - Template name: `RTO Notifications`
   - Body: `Your Puducherry RTO notification: {var1}. Do not share this message.`
   - Submit for approval (usually instant for transactional)
5. Copy the **Template ID** from the template list

### Environment variables:
```env
SMS_PROVIDER=msg91
MSG91_API_KEY=your_api_key_here
MSG91_TEMPLATE_ID=your_template_id_here
```

### Pricing:
- Free tier: **100 SMS/month** (transactional)
- Paid plans start at ₹0.15/SMS for bulk
- No credit card required for free tier

### Testing:
Set `SMS_PROVIDER=console` to see SMS messages in the terminal instead of sending real SMS.

---

## Email (SMTP — Gmail)

The simplest setup uses a Gmail account with App Passwords.

### Getting Gmail App Password:
1. Go to **https://myaccount.google.com**
2. Click **Security** in the left sidebar
3. Under "How you sign in to Google", enable **2-Step Verification** (required)
4. After enabling, go to **App Passwords**: https://myaccount.google.com/apppasswords
5. Select app: **Mail**, Select device: **Other (custom name)** → enter "RTO Portal"
6. Click **Generate**
7. Copy the **16-character password** (looks like: `abcd efgh ijkl mnop`)

### Environment variables:
```env
EMAIL_PROVIDER=smtp
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-gmail@gmail.com
SMTP_PASS=abcd efgh ijkl mnop
SMTP_FROM=your-gmail@gmail.com
```

### Testing:
Set `EMAIL_PROVIDER=console` to see email contents in the terminal without sending.

---

## Email (Alternative — SendGrid)

If you prefer SendGrid over Gmail (better for production):

1. Go to **https://sendgrid.com** and sign up (free tier: 100 emails/day)
2. Go to **Settings → API Keys → Create API Key**
3. Copy the key
4. For SMTP, use:
```env
EMAIL_PROVIDER=smtp
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your_sendgrid_api_key
SMTP_FROM=noreply@yourdomain.com
```

---

## Quick Start (Demo Mode)

For local development with no real API keys:
```env
SMS_PROVIDER=console
EMAIL_PROVIDER=console
```

All SMS/Email will be logged to the terminal. No real messages are sent.
