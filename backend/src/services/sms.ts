// ── SMS Gateway Service ──
// Sends SMS via MSG91 (India) or logs to console in demo mode.
// Set SMS_PROVIDER=console for demo, SMS_PROVIDER=msg91 for real SMS.
// Never throws — always catches and logs.

const SMS_PROVIDER = process.env.SMS_PROVIDER || 'console';

// ── Send SMS ──
export async function sendSMS(mobile: string, message: string): Promise<void> {
  if (SMS_PROVIDER === 'msg91') {
    await sendViaMSG91(mobile, message);
  } else {
    console.log(`[SMS] To ${mobile}: ${message}`);
  }
}

// ── MSG91 API ──
async function sendViaMSG91(mobile: string, message: string): Promise<void> {
  const apiKey = process.env.MSG91_API_KEY;
  const templateId = process.env.MSG91_TEMPLATE_ID;

  if (!apiKey || !templateId) {
    console.warn('[SMS] MSG91_API_KEY or MSG91_TEMPLATE_ID not set — falling back to console log');
    console.log(`[SMS] To ${mobile}: ${message}`);
    return;
  }

  try {
    const response = await fetch('https://api.msg91.com/api/v5/flow', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'authorization': apiKey,
      },
      body: JSON.stringify({
        flow_id: templateId,
        sender: 'RTOGOV',
        mobiles: `91${mobile.replace(/^\+?91/, '')}`,
        VAR1: message.substring(0, 30),  // MSG91 template variables
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      console.warn(`[SMS] MSG91 API error (${response.status}): ${body}`);
    } else {
      console.log(`[SMS] Sent to ${mobile} via MSG91`);
    }
  } catch (err) {
    console.warn('[SMS] MSG91 request failed:', err instanceof Error ? err.message : err);
  }
}

// ── Send OTP SMS (specialized for verification) ──
export async function sendOTPSMS(mobile: string, otp: string): Promise<void> {
  const message = `Your Puducherry RTO verification OTP is: ${otp}. Valid for 10 minutes. Do not share this with anyone.`;
  await sendSMS(mobile, message);
}

// ── Send bulk SMS ──
export async function sendBulkSMS(
  recipients: { mobile: string; message: string }[]
): Promise<{ sent: number; failed: number }> {
  let sent = 0;
  let failed = 0;
  for (const r of recipients) {
    try {
      await sendSMS(r.mobile, r.message);
      sent++;
    } catch {
      failed++;
    }
  }
  return { sent, failed };
}
