export const paymentMethods = [
  {
    id: 'vietqr',
    label: 'VietQR',
    description: 'Real Vietnamese bank-transfer QR when bank details are configured.',
    credentialHint: 'VIETQR_BANK_ID, VIETQR_ACCOUNT_NO, VIETQR_ACCOUNT_NAME'
  },
  {
    id: 'napas',
    label: 'NAPAS',
    description: 'Domestic card payment handoff placeholder.',
    credentialHint: 'NAPAS merchant credentials'
  },
  {
    id: 'momo',
    label: 'MoMo',
    description: 'MoMo wallet payment handoff placeholder.',
    credentialHint: 'MOMO_PARTNER_CODE, MOMO_ACCESS_KEY, MOMO_SECRET_KEY'
  },
  {
    id: 'vnpay',
    label: 'VNPay',
    description: 'VNPay gateway handoff placeholder.',
    credentialHint: 'VNPAY_TMN_CODE, VNPAY_HASH_SECRET'
  },
  {
    id: 'visa',
    label: 'Visa',
    description: 'International card payment handoff placeholder.',
    credentialHint: 'Card processor credentials'
  },
  {
    id: 'mastercard',
    label: 'Mastercard',
    description: 'International card payment handoff placeholder.',
    credentialHint: 'Card processor credentials'
  },
  {
    id: 'onepay',
    label: 'OnePay',
    description: 'OnePay gateway handoff placeholder.',
    credentialHint: 'ONEPAY merchant credentials'
  },
  {
    id: 'paypal',
    label: 'PayPal',
    description: 'PayPal checkout handoff placeholder.',
    credentialHint: 'PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET'
  }
] as const;

export type PaymentMethodId = (typeof paymentMethods)[number]['id'];
export type PaymentMode = 'real' | 'demo' | 'configuration_required';

export type PaymentRequestInput = {
  bookingId: string;
  amount: number;
  currency: string;
  method: PaymentMethodId;
};

export type PaymentSession = PaymentRequestInput & {
  sessionId: string;
  methodLabel: string;
  mode: PaymentMode;
  status: 'ready' | 'demo' | 'needs_configuration';
  qrPayload: string;
  qrImageUrl: string;
  transferNote: string;
  expiresAt: string;
  account?: {
    bankId: string;
    accountNo: string;
    accountName: string;
  };
  instructions: string[];
  warning?: string;
};

type EnvSource = Record<string, string | undefined>;

const methodLookup = new Map<PaymentMethodId, (typeof paymentMethods)[number]>(
  paymentMethods.map((method) => [method.id, method])
);

function compactString(value: unknown) {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function amountForCurrency(amount: number, currency: string) {
  if (currency === 'VND') return Math.round(amount);
  return Math.round(amount * 100) / 100;
}

function encodeQrServerPayload(payload: string) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=360x360&margin=14&data=${encodeURIComponent(payload)}`;
}

function sessionReference(now: Date) {
  const date = now.toISOString().slice(0, 10).replace(/-/g, '');
  return `PAY-${date}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

function requireObject(input: unknown) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new Error('Payment request must be an object.');
  }
  return input as Record<string, unknown>;
}

export function normalizePaymentRequest(input: unknown): PaymentRequestInput {
  const body = requireObject(input);
  const bookingId = compactString(body.bookingId).slice(0, 64);
  if (!bookingId) {
    throw new Error('Booking reference is required.');
  }

  const amount = Number(body.amount);
  if (!Number.isFinite(amount) || amount <= 0 || amount > 1_000_000_000) {
    throw new Error('Payment amount must be greater than 0 and below 1,000,000,000.');
  }

  const currency = compactString(body.currency || 'VND').toUpperCase();
  if (!/^[A-Z]{3}$/.test(currency)) {
    throw new Error('Currency must be a 3-letter ISO code.');
  }

  const method = compactString(body.method || 'vietqr').toLowerCase() as PaymentMethodId;
  if (!methodLookup.has(method)) {
    throw new Error('Unsupported payment method.');
  }

  return {
    bookingId,
    amount: amountForCurrency(amount, currency),
    currency,
    method
  };
}

export function buildPaymentSession(
  request: PaymentRequestInput,
  env: EnvSource = process.env,
  now = new Date()
): PaymentSession {
  const method = methodLookup.get(request.method);
  if (!method) {
    throw new Error('Unsupported payment method.');
  }

  const expiresAt = new Date(now.getTime() + 30 * 60 * 1000).toISOString();
  const transferNote = request.bookingId;

  if (request.method === 'vietqr') {
    const bankId = compactString(env.VIETQR_BANK_ID);
    const accountNo = compactString(env.VIETQR_ACCOUNT_NO);
    const accountName = compactString(env.VIETQR_ACCOUNT_NAME);
    const configured = Boolean(bankId && accountNo && accountName);
    const payloadBank = configured ? bankId : 'BANK_ID';
    const payloadAccount = configured ? accountNo : 'ACCOUNT_NO';
    const payloadName = configured ? accountName : 'ACCOUNT_NAME';
    const amount = Math.round(request.amount);
    const qrPayload = `vietqr://${payloadBank}/${payloadAccount}?amount=${amount}&message=${encodeURIComponent(transferNote)}&accountName=${encodeURIComponent(payloadName)}`;
    const qrImageUrl = configured
      ? `https://img.vietqr.io/image/${encodeURIComponent(bankId)}-${encodeURIComponent(accountNo)}-compact2.png?amount=${amount}&addInfo=${encodeURIComponent(transferNote)}&accountName=${encodeURIComponent(accountName)}`
      : encodeQrServerPayload(qrPayload);

    return {
      ...request,
      sessionId: sessionReference(now),
      methodLabel: method.label,
      mode: configured ? 'real' : 'configuration_required',
      status: configured ? 'ready' : 'needs_configuration',
      qrPayload,
      qrImageUrl,
      transferNote,
      expiresAt,
      account: configured ? { bankId, accountNo, accountName } : undefined,
      instructions: configured
        ? [
            'Open your banking app and scan the VietQR code.',
            `Transfer exactly ${amount.toLocaleString('vi-VN')} ${request.currency}.`,
            `Keep the transfer note as ${transferNote} so our team can match the payment.`
          ]
        : [
            'Add VIETQR_BANK_ID, VIETQR_ACCOUNT_NO and VIETQR_ACCOUNT_NAME to enable real bank-transfer QR.',
            'This QR is a configuration preview and should not be used for collecting money.'
          ],
      warning: configured
        ? undefined
        : 'VietQR bank details are not configured yet.'
    };
  }

  const demoPayload = `demo-payment://${request.method}?bookingId=${encodeURIComponent(request.bookingId)}&amount=${encodeURIComponent(String(request.amount))}&currency=${encodeURIComponent(request.currency)}&expiresAt=${encodeURIComponent(expiresAt)}`;

  return {
    ...request,
    sessionId: sessionReference(now),
    methodLabel: method.label,
    mode: 'demo',
    status: 'demo',
    qrPayload: demoPayload,
    qrImageUrl: encodeQrServerPayload(demoPayload),
    transferNote,
    expiresAt,
    instructions: [
      `${method.label} is shown as a demo payment intent in this build.`,
      `Add ${method.credentialHint} and a gateway adapter before collecting real money.`,
      'Use this QR only to preview the traveler payment handoff.'
    ],
    warning: `${method.label} is running in demo mode until official gateway credentials are connected.`
  };
}
