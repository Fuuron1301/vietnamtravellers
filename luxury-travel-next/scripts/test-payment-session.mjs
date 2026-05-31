import assert from 'node:assert/strict';
import {
  buildPaymentSession,
  normalizePaymentRequest,
  paymentMethods
} from '../lib/payment-session.ts';

const methodIds = paymentMethods.map((method) => method.id);
assert.deepEqual(methodIds, ['vietqr', 'napas', 'momo', 'vnpay', 'visa', 'mastercard', 'onepay', 'paypal']);

const vietQrSession = buildPaymentSession(
  normalizePaymentRequest({
    bookingId: 'HLT-20260507-ABC123',
    amount: 27500000,
    currency: 'VND',
    method: 'vietqr'
  }),
  {
    VIETQR_BANK_ID: '970436',
    VIETQR_ACCOUNT_NO: '123456789',
    VIETQR_ACCOUNT_NAME: 'HA LONG LUXURY TRAVEL'
  }
);

assert.equal(vietQrSession.mode, 'real');
assert.equal(vietQrSession.method, 'vietqr');
assert.equal(vietQrSession.account?.bankId, '970436');
assert.match(vietQrSession.qrPayload, /^vietqr:\/\/970436\/123456789/);
assert.match(vietQrSession.qrImageUrl, /^https:\/\/img\.vietqr\.io\/image\/970436-123456789-compact2\.png/);
assert.match(vietQrSession.qrImageUrl, /amount=27500000/);
assert.match(vietQrSession.qrImageUrl, /addInfo=HLT-20260507-ABC123/);

const momoSession = buildPaymentSession(
  normalizePaymentRequest({
    bookingId: 'HLT-DEMO-001',
    amount: 1299,
    currency: 'USD',
    method: 'momo'
  }),
  {}
);

assert.equal(momoSession.mode, 'demo');
assert.equal(momoSession.method, 'momo');
assert.match(momoSession.qrPayload, /^demo-payment:\/\/momo/);
assert.match(momoSession.qrImageUrl, /^https:\/\/api\.qrserver\.com\/v1\/create-qr-code\//);
assert.match(momoSession.warning || '', /demo/i);

assert.throws(
  () => normalizePaymentRequest({ bookingId: '', amount: -5, currency: 'VND', method: 'vietqr' }),
  /booking reference/i
);

console.log('payment-session tests passed');
