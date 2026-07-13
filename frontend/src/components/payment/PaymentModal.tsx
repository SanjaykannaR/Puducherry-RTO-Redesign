'use client';

// ── PaymentModal: dialog wrapper for GRAS payment flow ──
// Shows a summary of what the user is paying for, then launches GRAS checkout.
// Used by fee-calculator, challan pay, appointment booking, and service forms.

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import GRASPaymentButton from './GRASPaymentButton';
import { CheckCircle, XCircle } from 'lucide-react';

interface PaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  amount: number;              // Amount in rupees
  title?: string;              // Dialog title
  description?: string;        // What the payment is for
  applicationId?: string;      // Optional: link to application
  onSuccess?: (payment: any) => void;
  onError?: (error: string) => void;
}

export default function PaymentModal({
  open,
  onOpenChange,
  amount,
  title = 'Confirm Payment',
  description,
  applicationId,
  onSuccess,
  onError,
}: PaymentModalProps) {
  const [result, setResult] = useState<'success' | 'error' | null>(null);
  const [resultMessage, setResultMessage] = useState('');

  const handleSuccess = (payment: any) => {
    setResult('success');
    setResultMessage(`Payment of ₹${amount.toLocaleString('en-IN')} completed successfully!`);
    onSuccess?.(payment);
  };

  const handleError = (error: string) => {
    setResult('error');
    setResultMessage(error);
    onError?.(error);
  };

  const handleClose = () => {
    setResult(null);
    setResultMessage('');
    onOpenChange(false);
  };

  // Success/Error state
  if (result) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {result === 'success' ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600" />
              )}
              {result === 'success' ? 'Payment Successful' : 'Payment Failed'}
            </DialogTitle>
            <DialogDescription>{resultMessage}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={handleClose}>
              {result === 'success' ? 'Done' : 'Try Again'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  // Payment form
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description || 'Complete your payment via GRAS (Government Receipt Accounting System)'}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
            <span className="text-sm text-muted-foreground">Amount</span>
            <span className="text-2xl font-bold">₹{amount.toLocaleString('en-IN')}</span>
          </div>

          <div className="text-xs text-muted-foreground text-center">
            Government of India • GRAS Portal
          </div>
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <GRASPaymentButton
            amount={amount}
            purpose={description || 'RTO Service Fee'}
            applicationId={applicationId}
            onSuccess={handleSuccess}
            onError={handleError}
          />
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
