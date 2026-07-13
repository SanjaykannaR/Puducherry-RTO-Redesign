'use client';

// ── GRASPaymentButton: initiates GRAS payment flow ──
// Creates a challan via backend API, then shows the GRAS payment modal.
// Simulates the Government Receipt Accounting System (GRAS) flow
// used by real Puducherry RTO for citizen payments.
//
// Usage:
//   <GRASPaymentButton
//     amount={500}
//     purpose="Driving License Fee"
//     applicationId="app_123"
//     onSuccess={(payment) => console.log('Paid!', payment)}
//   />

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { Loader2 } from 'lucide-react';
import GRASPaymentModal from './GRASPaymentModal';

interface GRASPaymentButtonProps {
  amount: number;              // Amount in rupees
  purpose: string;             // What the payment is for
  applicationId?: string;      // Optional: link to an application
  label?: string;              // Button text
  disabled?: boolean;
  onSuccess?: (payment: any) => void;
  onError?: (error: string) => void;
}

export default function GRASPaymentButton({
  amount,
  purpose,
  applicationId,
  label,
  disabled = false,
  onSuccess,
  onError,
}: GRASPaymentButtonProps) {
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [challanData, setChallanData] = useState<any>(null);

  const handlePayment = useCallback(async () => {
    setLoading(true);
    try {
      // Create challan via backend
      const result = await api.post('/payments/create-challan', {
        amount,
        purpose,
        applicationId,
      });
      setChallanData(result);
      setModalOpen(true);
    } catch (err: any) {
      onError?.(err.message || 'Failed to create challan');
    } finally {
      setLoading(false);
    }
  }, [amount, purpose, applicationId, onError]);

  const handleSuccess = (payment: any) => {
    setModalOpen(false);
    setChallanData(null);
    onSuccess?.(payment);
  };

  const displayLabel = label || `Pay ₹${amount.toLocaleString('en-IN')}`;

  return (
    <>
      <Button
        onClick={handlePayment}
        disabled={disabled || loading}
        className="w-full"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating Challan...
          </>
        ) : (
          displayLabel
        )}
      </Button>

      {challanData && (
        <GRASPaymentModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          challan={challanData}
          onSuccess={handleSuccess}
          onError={onError}
        />
      )}
    </>
  );
}
