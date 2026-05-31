import type { Metadata } from 'next';
import { CheckoutExperience } from '@/components/payment/checkout-experience';
import { checkoutPaymentMethods } from '@/components/payment/payment-method-badge';
import type { PaymentMethodId } from '@/lib/payment-session';

export const metadata: Metadata = {
  title: 'Secure Online Payment',
  description: 'Generate a secure payment QR for VietQR bank transfer or preview demo payment handoffs for card, MoMo, VNPay, OnePay and PayPal.'
};

function searchValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function paymentMethodValue(value: string | undefined): PaymentMethodId {
  const allowed = checkoutPaymentMethods.map((method) => method.id);
  return allowed.includes(value as PaymentMethodId) ? (value as PaymentMethodId) : 'vietqr';
}

export default async function PaymentPage({
  searchParams
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = searchParams ? await searchParams : {};
  const initialBookingId = searchValue(params.bookingId);
  const initialAmount = searchValue(params.amount);
  const initialCurrency = searchValue(params.currency);
  const initialMethod = paymentMethodValue(searchValue(params.method));

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_16%_0%,rgba(200,169,106,0.18),transparent_28%),linear-gradient(180deg,#081723_0%,#0b1b2b_190px,#f3e8d7_190px,#efe1cc_100%)]">
      <CheckoutExperience
        initialBookingId={initialBookingId}
        initialAmount={initialAmount}
        initialCurrency={initialCurrency}
        initialMethod={initialMethod}
      />
    </main>
  );
}
