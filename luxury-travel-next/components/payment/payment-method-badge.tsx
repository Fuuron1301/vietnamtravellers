import type { PaymentMethodId } from '@/lib/payment-session';
import { cn } from '@/lib/utils';

export const checkoutPaymentMethods: Array<{
  id: PaymentMethodId;
  label: string;
  note: string;
}> = [
  { id: 'vietqr', label: 'VietQR', note: 'Real bank QR' },
  { id: 'napas', label: 'NAPAS', note: 'Demo intent' },
  { id: 'momo', label: 'MoMo', note: 'Demo intent' },
  { id: 'vnpay', label: 'VNPay', note: 'Demo intent' },
  { id: 'visa', label: 'Visa', note: 'Demo intent' },
  { id: 'mastercard', label: 'Mastercard', note: 'Demo intent' },
  { id: 'onepay', label: 'OnePay', note: 'Demo intent' },
  { id: 'paypal', label: 'PayPal', note: 'Demo intent' }
];

type PaymentMethodBadgeProps = {
  id: PaymentMethodId;
  active?: boolean;
  compact?: boolean;
};

export function PaymentMethodBadge({ id, active = false, compact = false }: PaymentMethodBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex h-[38px] min-w-[72px] items-center justify-center rounded-[10px] border px-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.78),0_12px_22px_rgba(0,0,0,0.12)] transition duration-300 ease-luxe',
        active ? 'border-gold bg-pearl shadow-[inset_0_1px_0_rgba(255,255,255,0.92),0_16px_30px_rgba(200,169,106,0.22)]' : 'border-pearl/42 bg-[#eef6ff]',
        compact && 'h-[32px] min-w-[58px] px-2'
      )}
    >
      {id === 'vietqr' && (
        <span className="inline-flex items-center gap-2 leading-none">
          <span className="grid h-[18px] w-[18px] place-items-center rounded-[4px] bg-[#0b7bd3] shadow-[inset_0_0_0_2px_rgba(255,255,255,0.35)]">
            <span className="h-[7px] w-[7px] rounded-[1px] border-[1.5px] border-white" />
          </span>
          <span className="text-[10px] font-black tracking-[-0.05em]">
            <span className="text-[#1167b1]">Viet</span>
            <span className="text-[#18a058]">QR</span>
          </span>
        </span>
      )}
      {id === 'napas' && (
        <span className="relative inline-flex min-w-[52px] items-center justify-center overflow-hidden rounded-[4px] bg-white px-1.5 py-[0.45rem] text-[10px] font-black uppercase italic tracking-[-0.08em] text-[#0a4c98] ring-1 ring-[#dbe8f7]">
          NAPAS
          <span className="absolute bottom-0 right-0 h-[3px] w-[18px] rounded-tl-full bg-[#f37021]" />
        </span>
      )}
      {id === 'momo' && (
        <span className="grid h-[23px] min-w-[48px] place-items-center rounded-[5px] bg-[#a50064] px-2 text-[10px] font-black leading-none tracking-[-0.06em] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.24)]">
          MoMo
        </span>
      )}
      {id === 'vnpay' && (
        <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase leading-none tracking-[-0.08em]">
          <span className="rounded-[3px] bg-[#005baa] px-1.5 py-[0.34rem] text-white">VN</span>
          <span className="rounded-[3px] bg-[#e31b23] px-1.5 py-[0.34rem] text-white">PAY</span>
        </span>
      )}
      {id === 'visa' && (
        <span className="text-[12px] font-black italic leading-none tracking-[-0.12em] text-[#1d4fa3]">
          VISA
        </span>
      )}
      {id === 'mastercard' && (
        <span className="relative h-[19px] w-[34px]" aria-hidden="true">
          <span className="absolute left-0 top-0 h-[19px] w-[19px] rounded-full bg-[#eb001b]" />
          <span className="absolute right-0 top-0 h-[19px] w-[19px] rounded-full bg-[#f79e1b] mix-blend-multiply" />
        </span>
      )}
      {id === 'onepay' && (
        <span className="grid h-[21px] w-[38px] place-items-center rounded-[4px] bg-[#2a6a75] text-[7px] font-black uppercase leading-none text-white ring-1 ring-white/45">
          OnePay
        </span>
      )}
      {id === 'paypal' && (
        <span className="text-[10px] font-black leading-none tracking-[-0.05em]">
          <span className="text-[#003087]">Pay</span>
          <span className="text-[#009cde]">Pal</span>
        </span>
      )}
    </span>
  );
}
