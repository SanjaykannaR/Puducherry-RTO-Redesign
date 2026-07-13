// ── Payment routes: GRAS (Government Receipt Accounting System) integration ──
// Handles challan creation, payment verification, and history.
// Simulates the GRAS flow used by real Puducherry RTO for citizen payments.
// No external API keys needed — this is a demo/mock of the government payment system.

import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import prisma from '../services/prisma';

const router = Router();

// ── Helper: Generate realistic GRN (Government Reference Number) ──
function generateGRN(): string {
  const year = new Date().getFullYear();
  const month = String(new Date().getMonth() + 1).padStart(2, '0');
  const day = String(new Date().getDate()).padStart(2, '0');
  const seq = String(Math.floor(Math.random() * 999999)).padStart(6, '0');
  return `26PY${year}${month}${day}${seq}`;
}

// ── Helper: Generate realistic BRN (Bank Reference Number) ──
function generateBRN(): string {
  const bank = 'SBI';
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const seq = String(Math.floor(Math.random() * 999999)).padStart(6, '0');
  return `${bank}${date}${seq}`;
}

// ── Helper: Generate Challan ID ──
function generateChallanId(): string {
  const prefix = 'PY';
  const year = new Date().getFullYear();
  const seq = String(Math.floor(Math.random() * 99999)).padStart(5, '0');
  return `${prefix}-${year}-${seq}`;
}

// ── POST /api/payments/create-challan ──
// Creates a new challan for payment via GRAS.
// Body: { amount: number, purpose: string, applicationId?: string }
router.post('/create-challan', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { amount, purpose, applicationId } = req.body;
    if (!amount || amount <= 0) {
      res.status(400).json({ error: 'Valid amount required' });
      return;
    }
    if (!purpose) {
      res.status(400).json({ error: 'Purpose is required' });
      return;
    }

    const challanId = generateChallanId();
    const grn = generateGRN();

    // Create pending payment record
    const payment = await prisma.payment.create({
      data: {
        amount,
        transactionId: grn, // Store GRN as transaction ID
        status: 'PENDING',
        userId: req.user!.userId,
        applicationId: applicationId || undefined,
      },
    });

    res.status(201).json({
      challanId,
      grn,
      amount,
      purpose,
      department: 'Transport Department, Puducherry',
      headOfAccount: '2202-00-103-001-14',
      paymentDbId: payment.id,
    });
  } catch (err: any) {
    console.error('create-challan error:', err);
    res.status(500).json({ error: err.message || 'Failed to create challan' });
  }
});

// ── POST /api/payments/verify-challan ──
// Completes the challan payment (simulates GRAS callback).
// Body: { challanId: string, grn: string, paymentMethod: string }
router.post('/verify-challan', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { challanId, grn, paymentMethod } = req.body;
    if (!challanId || !grn || !paymentMethod) {
      res.status(400).json({ error: 'Missing payment verification fields' });
      return;
    }

    // Find the pending payment by GRN
    const payment = await prisma.payment.findFirst({
      where: { transactionId: grn, userId: req.user!.userId },
    });
    if (!payment) {
      res.status(404).json({ error: 'Payment record not found' });
      return;
    }
    if (payment.status === 'COMPLETED') {
      res.status(400).json({ error: 'Payment already completed' });
      return;
    }

    const brn = generateBRN();

    // Update payment record
    const updated = await prisma.payment.update({
      where: { id: payment.id },
      data: {
        gatewayRefNo: brn, // Store BRN as gateway reference
        status: 'COMPLETED',
        paidAt: new Date(),
      },
    });

    res.json({
      message: 'Payment verified successfully',
      grn,
      brn,
      amount: updated.amount,
      status: 'COMPLETED',
      paymentMethod,
      paidAt: updated.paidAt,
    });
  } catch (err: any) {
    console.error('verify-challan error:', err);
    res.status(500).json({ error: err.message || 'Verification failed' });
  }
});

// ── GET /api/payments/history ──
// Returns all payments for the authenticated user.
router.get('/history', authenticate, async (req: AuthRequest, res: Response) => {
  const payments = await prisma.payment.findMany({
    where: { userId: req.user!.userId },
    orderBy: { createdAt: 'desc' },
  });
  res.json({ payments });
});

// ── GET /api/payments/:id ──
// Returns a single payment record.
router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  const payment = await prisma.payment.findFirst({
    where: { id: req.params.id as string, userId: req.user!.userId },
  });
  if (!payment) {
    res.status(404).json({ error: 'Payment not found' });
    return;
  }
  res.json(payment);
});

export default router;
