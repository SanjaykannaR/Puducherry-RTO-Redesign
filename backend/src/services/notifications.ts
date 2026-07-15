// ── Notification Service ──
// Centralized service for sending notifications across channels (IN_APP, SMS, EMAIL).
// SMS/EMAIL use real services when configured, console logs in demo mode.
// Includes expiry alert generation for vehicles and licenses.

import prisma from './prisma';
import { sendSMS } from './sms';
import { sendEmail } from './email';

// ── Channel Types ──
type Channel = 'IN_APP' | 'SMS' | 'EMAIL';
type NotificationType = 'INFO' | 'WARNING' | 'SUCCESS' | 'ERROR';

interface SendNotificationOpts {
  title: string;
  message: string;
  type?: NotificationType;
  channel?: Channel;
}

// ── Send a single notification ──
export async function sendNotification(
  userId: string,
  opts: SendNotificationOpts
): Promise<void> {
  const { title, message, type = 'INFO', channel = 'IN_APP' } = opts;

  // Always create in-app notification
  await prisma.notification.create({
    data: { title, message, type, channel, userId },
  });

  // Look up user contact info for SMS/EMAIL delivery
  if (channel === 'SMS' || channel === 'EMAIL') {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { mobile: true, email: true, name: true },
    });

    if (!user) {
      console.warn(`[Notification] User ${userId} not found — cannot send ${channel}`);
      return;
    }

    if (channel === 'SMS' && user.mobile) {
      await sendSMS(user.mobile, message);
    } else if (channel === 'EMAIL' && user.email) {
      const html = `<p style="font-family:Arial,sans-serif;line-height:1.6;"><strong>${title}</strong><br><br>${message.replace(/\n/g, '<br>')}</p>`;
      await sendEmail(user.email, title, html);
    }
  }
}

// ── Send bulk notifications ──
export async function sendBulkNotification(
  userIds: string[],
  opts: SendNotificationOpts
): Promise<{ sent: number; failed: number }> {
  let sent = 0;
  let failed = 0;

  for (const userId of userIds) {
    try {
      await sendNotification(userId, opts);
      sent++;
    } catch {
      failed++;
    }
  }

  return { sent, failed };
}

// ── Get items expiring in the next N days ──
interface ExpiringItem {
  userId: string;
  userName: string;
  type: 'vehicle' | 'license';
  itemDetail: string;
  expiryField: string;
  expiryDate: Date;
  daysUntilExpiry: number;
}

export async function getExpiringItems(daysThreshold = 30): Promise<ExpiringItem[]> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() + daysThreshold);

  const items: ExpiringItem[] = [];

  // Check vehicles: insuranceUpto, puccUpto, fitnessUpto, taxPaidUpto
  const vehicles = await prisma.vehicle.findMany({
    where: { status: 'ACTIVE' },
    include: { owner: true },
  });

  for (const v of vehicles) {
    const checks = [
      { field: 'Insurance', date: v.insuranceUpto },
      { field: 'PUCC', date: v.puccUpto },
      { field: 'Fitness', date: v.fitnessUpto },
      { field: 'Tax Paid', date: v.taxPaidUpto },
    ];

    for (const check of checks) {
      if (check.date && check.date <= cutoffDate && check.date >= new Date()) {
        const daysUntil = Math.ceil((check.date.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        items.push({
          userId: v.ownerId,
          userName: v.owner.name,
          type: 'vehicle',
          itemDetail: `${v.make} ${v.model} (${v.registrationNo}) — ${check.field}`,
          expiryField: check.field,
          expiryDate: check.date,
          daysUntilExpiry: daysUntil,
        });
      }
    }
  }

  // Check licenses: expiryDate
  const licenses = await prisma.license.findMany({
    where: { status: 'ACTIVE' },
    include: { holder: true },
  });

  for (const l of licenses) {
    if (l.expiryDate <= cutoffDate && l.expiryDate >= new Date()) {
      const daysUntil = Math.ceil((l.expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      items.push({
        userId: l.holderId,
        userName: l.holder.name,
        type: 'license',
        itemDetail: `${l.type} License (${l.licenseNo}) — Expiry`,
        expiryField: 'Expiry',
        expiryDate: l.expiryDate,
        daysUntilExpiry: daysUntil,
      });
    }
  }

  return items;
}

// ── Create expiry alert notifications ──
export async function createExpiryAlerts(): Promise<{ alertsCreated: number; usersNotified: number }> {
  const expiringItems = await getExpiringItems(30);

  let alertsCreated = 0;
  const usersNotified = new Set<string>();

  for (const item of expiringItems) {
    const daysText = item.daysUntilExpiry <= 7 ? `${item.daysUntilExpiry} days` : `~${Math.ceil(item.daysUntilExpiry / 7)} weeks`;
    
    await sendNotification(item.userId, {
      title: `${item.type === 'vehicle' ? 'Vehicle' : 'License'} Expiry Alert`,
      message: `Your ${item.itemDetail} expires in ${daysText}. Please renew before ${item.expiryDate.toLocaleDateString('en-IN')}.`,
      type: 'WARNING',
      channel: 'IN_APP',
    });

    alertsCreated++;
    usersNotified.add(item.userId);
  }

  return { alertsCreated, usersNotified: usersNotified.size };
}
