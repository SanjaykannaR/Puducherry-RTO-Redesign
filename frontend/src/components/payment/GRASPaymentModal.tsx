'use client';

// ── GRASPaymentModal: realistic Government Receipt Accounting System UI ──
// Simulates the GRAS payment portal used by Puducherry RTO.
// Shows challan details, payment method selection, processing, and receipt.
// This is a demo/mock — no real government API calls are made.

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';
import {
  CheckCircle,
  CreditCard,
  Smartphone,
  Building2,
  Loader2,
  Download,
  ArrowLeft,
} from 'lucide-react';

interface GRASPaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  challan: {
    challanId: string;
    grn: string;
    amount: number;
    purpose: string;
    department: string;
    headOfAccount: string;
  };
  onSuccess?: (payment: any) => void;
  onError?: (error: string) => void;
}

type PaymentStep = 'select' | 'processing' | 'success' | 'error';

const paymentMethods = [
  { id: 'upi', label: 'UPI', icon: Smartphone, description: 'Google Pay, PhonePe, Paytm' },
  { id: 'card', label: 'Debit/Credit Card', icon: CreditCard, description: 'Visa, Mastercard, RuPay' },
  { id: 'netbanking', label: 'Net Banking', icon: Building2, description: 'SBI, HDFC, ICICI, and more' },
];

export default function GRASPaymentModal({
  open,
  onOpenChange,
  challan,
  onSuccess,
  onError,
}: GRASPaymentModalProps) {
  const [step, setStep] = useState<PaymentStep>('select');
  const [selectedMethod, setSelectedMethod] = useState('');
  const [paymentResult, setPaymentResult] = useState<any>(null);

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      setStep('select');
      setSelectedMethod('');
      setPaymentResult(null);
    }
  }, [open]);

  const handlePay = async () => {
    if (!selectedMethod) return;
    setStep('processing');

    try {
      // Simulate GRAS processing delay (2 seconds)
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Verify payment via backend (creates payment record)
      const result = await api.post('/payments/verify-challan', {
        challanId: challan.challanId,
        grn: challan.grn,
        paymentMethod: selectedMethod,
      });

      setPaymentResult(result);
      setStep('success');
      onSuccess?.(result);
    } catch (err: any) {
      setStep('error');
      onError?.(err.message || 'Payment failed');
    }
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        {/* Header with GRAS branding */}
        <DialogHeader className="text-center border-b pb-4">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-blue-800 font-bold text-sm">GOI</span>
            </div>
            <div className="text-left">
              <DialogTitle className="text-base">Government Receipt Accounting System</DialogTitle>
              <p className="text-xs text-muted-foreground">Ministry of Transport • Puducherry</p>
            </div>
          </div>
        </DialogHeader>

        {/* Step 1: Select Payment Method */}
        {step === 'select' && (
          <div className="space-y-4">
            {/* Challan Details */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Challan No</span>
                <span className="font-mono font-medium">{challan.challanId}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">GRN</span>
                <span className="font-mono font-medium">{challan.grn}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Purpose</span>
                <span className="font-medium">{challan.purpose}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Department</span>
                <span>{challan.department}</span>
              </div>
              <div className="flex justify-between text-sm font-bold border-t pt-2 mt-2">
                <span>Total Amount</span>
                <span className="text-primary text-lg">₹{challan.amount.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Payment Method Selection */}
            <div className="space-y-2">
              <p className="text-sm font-medium">Select Payment Method</p>
              {paymentMethods.map((method) => {
                const Icon = method.icon;
                return (
                  <button
                    key={method.id}
                    onClick={() => setSelectedMethod(method.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                      selectedMethod === method.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <Icon className="h-5 w-5 text-primary" />
                    <div className="text-left flex-1">
                      <p className="text-sm font-medium">{method.label}</p>
                      <p className="text-xs text-muted-foreground">{method.description}</p>
                    </div>
                    {selectedMethod === method.id && (
                      <CheckCircle className="h-5 w-5 text-primary" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <Button variant="outline" onClick={handleClose} className="flex-1">
                Cancel
              </Button>
              <Button
                onClick={handlePay}
                disabled={!selectedMethod}
                className="flex-1"
              >
                Pay ₹{challan.amount.toLocaleString('en-IN')}
              </Button>
            </div>

            <p className="text-xs text-center text-muted-foreground">
              Secured by Government of India • GRAS Portal
            </p>
          </div>
        )}

        {/* Step 2: Processing */}
        {step === 'processing' && (
          <div className="flex flex-col items-center py-8 space-y-4">
            <Loader2 className="h-12 w-12 text-primary animate-spin" />
            <div className="text-center">
              <p className="font-medium">Processing Payment...</p>
              <p className="text-sm text-muted-foreground mt-1">
                Please do not close this window
              </p>
            </div>
            <div className="w-full bg-muted rounded-full h-2 mt-4">
              <div className="bg-primary h-2 rounded-full animate-pulse" style={{ width: '70%' }} />
            </div>
          </div>
        )}

        {/* Step 3: Success */}
        {step === 'success' && paymentResult && (
          <div className="space-y-4">
            <div className="flex flex-col items-center py-4">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-green-700">Payment Successful!</h3>
              <p className="text-sm text-muted-foreground mt-1">Your payment has been recorded</p>
            </div>

            {/* Receipt Details */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">GRN</span>
                <span className="font-mono font-medium">{challan.grn}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">BRN</span>
                <span className="font-mono font-medium">{paymentResult.brn}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Amount Paid</span>
                <span className="font-bold">₹{challan.amount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Payment Method</span>
                <span>{paymentMethods.find(m => m.id === selectedMethod)?.label}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Date & Time</span>
                <span>{new Date().toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Status</span>
                <Badge className="bg-green-100 text-green-800">COMPLETED</Badge>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={handleClose} className="flex-1">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Portal
              </Button>
              <Button className="flex-1">
                <Download className="mr-2 h-4 w-4" />
                Download Receipt
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Error */}
        {step === 'error' && (
          <div className="flex flex-col items-center py-8 space-y-4">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
              <span className="text-2xl">✕</span>
            </div>
            <div className="text-center">
              <p className="font-medium text-red-700">Payment Failed</p>
              <p className="text-sm text-muted-foreground mt-1">
                Please try again or use a different payment method
              </p>
            </div>
            <div className="flex gap-2 w-full">
              <Button variant="outline" onClick={handleClose} className="flex-1">
                Cancel
              </Button>
              <Button onClick={() => setStep('select')} className="flex-1">
                Try Again
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
