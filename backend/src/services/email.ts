// ── Email Service ──
// Sends emails via Nodemailer (SMTP) or logs to console in demo mode.
// Set EMAIL_PROVIDER=console for demo, EMAIL_PROVIDER=smtp for real emails.
// Supports Gmail, SendGrid, or any SMTP server.
// Never throws — always catches and logs.

import nodemailer from 'nodemailer';

const EMAIL_PROVIDER = process.env.EMAIL_PROVIDER || 'console';

// ── Lazy-init transporter (created once on first use) ──
let transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const user = process.env.SMTP_USER || '';
  const pass = process.env.SMTP_PASS || '';

  transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: user ? { user, pass } : undefined,
  });

  return transporter;
}

const SMTP_FROM = process.env.SMTP_FROM || 'noreply@rto.puducherry.gov.in';

// ── Send email ──
export async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  if (EMAIL_PROVIDER === 'console') {
    console.log(`[EMAIL] To: ${to} | Subject: ${subject}`);
    console.log(`[EMAIL] Body: ${html.replace(/<[^>]*>/g, '').substring(0, 200)}...`);
    return;
  }

  try {
    const transport = getTransporter();
    await transport.sendMail({
      from: SMTP_FROM,
      to,
      subject,
      html,
    });
    console.log(`[EMAIL] Sent to ${to}: ${subject}`);
  } catch (err) {
    console.warn('[EMAIL] Send failed:', err instanceof Error ? err.message : err);
  }
}

// ── Convenience: send plain text email ──
export async function sendTextEmail(to: string, subject: string, text: string): Promise<void> {
  const html = `<p style="font-family: Arial, sans-serif; line-height: 1.6;">${text.replace(/\n/g, '<br>')}</p>`;
  await sendEmail(to, subject, html);
}

// ── Email templates for common RTO notifications ──
export const emailTemplates = {
  applicationStatus: (name: string, appId: string, status: string) => ({
    subject: `Application ${appId} — Status Updated`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #1e40af; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0; font-size: 20px;">Puducherry RTO</h1>
        </div>
        <div style="padding: 24px; background: #f9fafb;">
          <p>Dear <strong>${name}</strong>,</p>
          <p>Your application <code>${appId}</code> has been <strong>${status}</strong>.</p>
          <p>Please log in to your dashboard for details.</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 16px 0;">
          <p style="font-size: 12px; color: #6b7280;">
            This is an automated notification from the Office of the Transport Commissioner, Puducherry.
          </p>
        </div>
      </div>
    `,
  }),

  paymentReceipt: (name: string, amount: string, grn: string) => ({
    subject: `Payment Receipt — GRN ${grn}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #16a34a; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0; font-size: 20px;">Payment Confirmed</h1>
        </div>
        <div style="padding: 24px; background: #f9fafb;">
          <p>Dear <strong>${name}</strong>,</p>
          <p>Your payment of <strong>₹${amount}</strong> has been received.</p>
          <p>GRN: <code>${grn}</code></p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 16px 0;">
          <p style="font-size: 12px; color: #6b7280;">
            Office of the Transport Commissioner, Puducherry
          </p>
        </div>
      </div>
    `,
  }),

  expiryAlert: (name: string, item: string, days: number) => ({
    subject: `Expiry Alert — ${item}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #f59e0b; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0; font-size: 20px;">⚠️ Expiry Warning</h1>
        </div>
        <div style="padding: 24px; background: #f9fafb;">
          <p>Dear <strong>${name}</strong>,</p>
          <p>Your <strong>${item}</strong> expires in <strong>${days} days</strong>.</p>
          <p>Please renew before it expires to avoid penalties.</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 16px 0;">
          <p style="font-size: 12px; color: #6b7280;">
            Office of the Transport Commissioner, Puducherry
          </p>
        </div>
      </div>
    `,
  }),
};
