/**
 * Tạo hóa đơn thanh toán PDF chuyên nghiệp.
 * Chạy: node scripts/generate-invoice.mjs
 */
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.join(__dirname, '..');
const PDF_OUT = path.join(ROOT, 'docs', 'INVOICE-HaLongLuxury-May2026.pdf');

const INVOICE_NO = 'INV-2026-0525';
const DATE = '26/05/2026';
const DUE_DATE = '31/05/2026';

// ── Dữ liệu hóa đơn ──────────────────────────────────────────────────────────
const items = [
  {
    group: '01. THANH TOÁN PHẦN CÒN LẠI — Dự án hiện tại',
    rows: [
      {
        desc: 'Ha Long Luxury Travel Platform — Phát triển website du lịch cao cấp\n(Tour booking, Blog, Destination pages, Design System, Navigation)',
        note: 'Đã cọc 30% — Thanh toán 35% còn lại — Giữ 35% cọc chờ deploy web thực tế',
        qty: 1,
        unit: 3_500_000,
        pct: 35,
        amount: 1_750_000,
      },
    ],
  },
  {
    group: '02. PHÁT TRIỂN 3 TÍNH NĂNG MỚI',
    rows: [
      {
        desc: 'All Styles — Design layout mega-menu "Tour Formats" trên thanh điều hướng\n& trang danh mục /travel-styles/ với 20 phong cách du lịch, search, filter, grid cards',
        note: '',
        qty: 1,
        unit: 0,
        pct: null,
        amount: 0,
      },
      {
        desc: 'Asia Visa Application — Import dữ liệu + Design full layout / CSS\n& Backend: form 5 bước (contact, visa info, applicants, car pickup, fee), API route, email SMTP',
        note: '',
        qty: 1,
        unit: 750_000,
        pct: null,
        amount: 750_000,
      },
      {
        desc: 'SIM Card 5G & eSIM — Import 180 sản phẩm từ Klook + Design full layout / CSS\n& Backend: catalog, detail page 9-tab, package filter, booking form, API route, email SMTP',
        note: '',
        qty: 1,
        unit: 750_000,
        pct: null,
        amount: 750_000,
      },
    ],
  },
  {
    group: '03. CỌC DỰ ÁN MỚI',
    rows: [
      {
        desc: 'Phát triển web vietnamtravelers.com',
        note: 'Tổng dự án: 4.800.000 VND — Đặt cọc 30%',
        qty: 1,
        unit: 4_800_000,
        pct: 30,
        amount: 1_500_000,
      },
    ],
  },
];

const TOTAL = items.flatMap(g => g.rows).reduce((s, r) => s + r.amount, 0);

// ── QR code từ VietQR API ─────────────────────────────────────────────────────
const qrUrl = `https://img.vietqr.io/image/BIDV-7500699867-compact2.jpg?amount=${TOTAL}&addInfo=${encodeURIComponent('Thanh toan Ha Long Luxury Travel ' + INVOICE_NO)}&accountName=${encodeURIComponent('TRAN HUU LONG')}`;

// ── Format tiền VND ───────────────────────────────────────────────────────────
function vnd(n) {
  return new Intl.NumberFormat('vi-VN').format(n) + ' ₫';
}

// ── Tạo HTML hóa đơn ─────────────────────────────────────────────────────────
function buildHtml() {
  const rows = items.map((group, gi) => {
    const groupRows = group.rows.map((r, ri) => {
      const noteHtml = r.note ? `<span class="item-note">${r.note}</span>` : '';
      const pctHtml = r.pct ? ` <span class="pct-badge">${r.pct}%</span>` : '';
      return `
      <tr class="${ri % 2 === 0 ? 'even' : 'odd'}">
        <td class="td-desc">
          <div class="item-desc">${r.desc.replace(/\n/g, '<br/>')}${pctHtml}</div>
          ${noteHtml}
        </td>
        <td class="td-right">${r.amount === 0 ? '' : r.unit === r.amount ? '—' : vnd(r.unit)}</td>
        <td class="td-right amount">${r.amount === 0 ? '<span style="color:#c8a96a;font-weight:800;letter-spacing:.05em">FREE</span>' : vnd(r.amount)}</td>
      </tr>`;
    }).join('');

    return `
    <tr class="group-header">
      <td colspan="3" class="td-group">${group.group}</td>
    </tr>
    ${groupRows}`;
  }).join('');

  return `<!DOCTYPE html>
<html lang="vi">
<head>
<meta charset="UTF-8">
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family:'Segoe UI',Arial,sans-serif; font-size:13px; color:#0b1b2b; background:#fff; width:210mm; }

  /* ── Header ── */
  .inv-header { background:linear-gradient(135deg,#07121e 0%,#0b1b2b 55%,#16304e 100%); color:#f8f5ef; padding:36px 44px 32px; position:relative; overflow:hidden; }
  .inv-header::before { content:''; position:absolute; top:-40px; right:-40px; width:220px; height:220px; border-radius:50%; background:radial-gradient(circle,rgba(200,169,106,0.22),transparent 70%); }
  .brand { display:flex; align-items:center; gap:16px; margin-bottom:28px; }
  .brand-dot { width:42px; height:42px; border-radius:50%; background:linear-gradient(135deg,#c8a96a,#9d7a3d); display:flex; align-items:center; justify-content:center; font-size:18px; font-weight:900; color:#07121e; flex-shrink:0; }
  .brand-text { }
  .brand-name { font-size:18px; font-weight:800; letter-spacing:-.01em; color:#f8f5ef; line-height:1.1; }
  .brand-sub { font-size:10px; font-weight:700; letter-spacing:.22em; text-transform:uppercase; color:#c8a96a; margin-top:3px; }

  .inv-meta { display:flex; justify-content:space-between; align-items:flex-end; }
  .inv-title { font-size:32px; font-weight:900; letter-spacing:-.04em; color:#c8a96a; line-height:1; }
  .inv-title span { display:block; font-size:12px; font-weight:700; letter-spacing:.24em; text-transform:uppercase; color:#f8f5ef; opacity:.6; margin-bottom:6px; }
  .inv-details { text-align:right; }
  .inv-details p { font-size:12px; color:#f8f5ef; opacity:.75; line-height:1.9; }
  .inv-details strong { color:#c8a96a; opacity:1; }

  /* ── Parties ── */
  .parties { display:grid; grid-template-columns:1fr 1fr; gap:0; border-bottom:2px solid #efe5d1; }
  .party { padding:24px 44px; }
  .party + .party { border-left:1px solid #efe5d1; }
  .party-label { font-size:9px; font-weight:800; letter-spacing:.26em; text-transform:uppercase; color:#c8a96a; margin-bottom:10px; }
  .party-name { font-size:15px; font-weight:800; color:#0b1b2b; margin-bottom:4px; }
  .party-detail { font-size:12px; color:#555; line-height:1.8; }

  /* ── Table ── */
  .table-wrap { padding:0 44px; margin-top:4px; }
  table { width:100%; border-collapse:collapse; }
  thead tr { background:#0b1b2b; }
  thead th { font-size:9px; font-weight:800; letter-spacing:.20em; text-transform:uppercase; color:#c8a96a; padding:11px 14px; text-align:left; }
  thead th:last-child, thead th:nth-child(2) { text-align:right; }

  .group-header td { background:#f8f5ef; font-size:10px; font-weight:800; letter-spacing:.16em; text-transform:uppercase; color:#9d7a3d; padding:10px 14px 7px; border-top:1px solid #e8e0d0; }
  tr.even td { background:#fff; }
  tr.odd td { background:#fdfcfa; }
  td { padding:13px 14px; vertical-align:top; border-bottom:1px solid #f0ece5; }
  .td-desc { width:72%; }
  .td-right { text-align:right; white-space:nowrap; font-size:12px; color:#666; }
  td.amount { font-weight:700; color:#0b1b2b; font-size:13px; }
  .item-desc { font-size:12.5px; line-height:1.65; color:#0b1b2b; font-weight:500; }
  .item-note { display:block; margin-top:5px; font-size:11px; color:#9d7a3d; font-style:italic; background:#fff8ec; border-left:3px solid #c8a96a; padding:4px 10px; border-radius:0 4px 4px 0; }
  .pct-badge { display:inline-block; background:#c8a96a; color:#07121e; font-size:10px; font-weight:800; border-radius:999px; padding:2px 8px; margin-left:7px; vertical-align:middle; }

  /* ── Totals ── */
  .totals-wrap { display:flex; justify-content:space-between; align-items:flex-start; padding:28px 44px 0; gap:32px; }
  .totals-table { min-width:300px; }
  .totals-table tr td { border:none; padding:5px 0; font-size:13px; }
  .totals-table .t-label { color:#666; font-weight:500; }
  .totals-table .t-val { text-align:right; font-weight:600; color:#0b1b2b; }
  .totals-table .grand td { border-top:2px solid #0b1b2b; padding-top:12px; margin-top:4px; }
  .totals-table .grand .t-label { font-size:15px; font-weight:800; color:#0b1b2b; text-transform:uppercase; letter-spacing:.04em; }
  .totals-table .grand .t-val { font-size:18px; font-weight:900; color:#c8a96a; }

  /* ── Payment QR ── */
  .payment-box { background:#f8f5ef; border:1px solid #e8dfc8; border-radius:16px; padding:20px 24px; min-width:240px; max-width:280px; }
  .pay-label { font-size:9px; font-weight:800; letter-spacing:.22em; text-transform:uppercase; color:#9d7a3d; margin-bottom:14px; }
  .pay-qr { text-align:center; margin-bottom:14px; }
  .pay-qr img { width:160px; height:160px; border-radius:10px; }
  .pay-bank { font-size:12px; line-height:1.9; color:#0b1b2b; }
  .pay-bank strong { font-weight:800; }
  .pay-bank .pay-amount { font-size:16px; font-weight:900; color:#c8a96a; margin-top:6px; display:block; }
  .pay-bank .pay-desc { font-size:10px; color:#888; margin-top:2px; }

  /* ── Footer note ── */
  .inv-note { padding:24px 44px 16px; }
  .inv-note p { font-size:11px; color:#888; line-height:1.8; }
  .inv-note strong { color:#0b1b2b; }

  .inv-footer { background:#f8f5ef; border-top:1px solid #efe5d1; padding:14px 44px; display:flex; justify-content:space-between; align-items:center; }
  .inv-footer p { font-size:10px; color:#aaa; }
  .inv-footer .footer-brand { font-size:11px; font-weight:800; letter-spacing:.12em; text-transform:uppercase; color:#c8a96a; }
</style>
</head>
<body>

<!-- HEADER -->
<div class="inv-header">
  <div class="brand">
    <div class="brand-text">
      <div class="brand-name">Ha Long Luxury Travel</div>
      <div class="brand-sub">Private Asia Journeys</div>
    </div>
  </div>
  <div class="inv-meta">
    <div class="inv-title">
      <span>Invoice</span>
      HÓA ĐƠN
    </div>
    <div class="inv-details">
      <p>Số hóa đơn: <strong>${INVOICE_NO}</strong></p>
      <p>Ngày lập: <strong>${DATE}</strong></p>
      <p>Hạn thanh toán: <strong>${DUE_DATE}</strong></p>
    </div>
  </div>
</div>

<!-- PARTIES -->
<div class="parties" style="grid-template-columns:1fr">
  <div class="party">
    <div class="party-label">Bên cung cấp dịch vụ</div>
    <div class="party-name">Dev / Designer</div>
    <div class="party-detail">
      Phát triển Web & Thiết kế UI<br>
      Ha Long Luxury Travel Platform<br>
      luxury-travel-next (Next.js 14)
    </div>
  </div>
</div>

<!-- TABLE -->
<div class="table-wrap">
<table>
  <thead>
    <tr>
      <th>Hạng mục dịch vụ</th>
      <th>Giá gốc</th>
      <th>Thành tiền</th>
    </tr>
  </thead>
  <tbody>
    ${rows}
  </tbody>
</table>
</div>

<!-- TOTALS + QR -->
<div class="totals-wrap">
  <div class="payment-box">
    <div class="pay-label">Thanh toán qua VietQR</div>
    <div class="pay-qr">
      <img src="${qrUrl}" alt="VietQR Payment QR Code" />
    </div>
    <div class="pay-bank">
      <strong>TRAN HUU LONG</strong><br>
      STK: <strong>7500699867</strong><br>
      Ngân hàng: <strong>BIDV</strong> — PGD Tân Hiệp<br>
      <span class="pay-amount">${vnd(TOTAL)}</span>
      <span class="pay-desc">Nội dung: ${INVOICE_NO} Thanh toan Ha Long</span>
    </div>
  </div>

  <table class="totals-table">
    <tr>
      <td class="t-label">Thanh toán 50% dự án hiện tại</td>
      <td class="t-val">${vnd(1_750_000)}</td>
    </tr>
    <tr>
      <td class="t-label">Phát triển 3 tính năng mới</td>
      <td class="t-val">${vnd(1_500_000)}</td>
    </tr>
    <tr>
      <td class="t-label">Cọc 30% dự án giai đoạn 2</td>
      <td class="t-val">${vnd(1_500_000)}</td>
    </tr>
    <tr>
      <td class="t-label" style="padding-top:10px;font-size:11px;color:#aaa" colspan="2">Thuế VAT: Miễn</td>
    </tr>
    <tr class="grand">
      <td class="t-label">TỔNG THANH TOÁN</td>
      <td class="t-val">${vnd(TOTAL)}</td>
    </tr>
    <tr>
      <td colspan="2" style="padding-top:8px;font-size:11px;color:#888;font-style:italic;border:none">
        Bằng chữ: Bốn triệu bảy trăm năm mươi nghìn đồng chẵn
      </td>
    </tr>
  </table>
</div>

<!-- NOTE -->
<div class="inv-note">
  <p>
    <strong>Lưu ý:</strong> Vui lòng chuyển khoản đúng số tiền <strong>${vnd(TOTAL)}</strong> và ghi nội dung
    chuyển khoản: <strong>"${INVOICE_NO} Thanh toan Ha Long"</strong>. Hóa đơn sẽ được xác nhận
    sau khi nhận được thanh toán. Mọi thắc mắc vui lòng liên hệ qua email hoặc Zalo.
  </p>
</div>

<!-- FOOTER -->
<div class="inv-footer">
  <p>Hóa đơn được tạo tự động — ${DATE}</p>
  <p>${INVOICE_NO}</p>
</div>

</body>
</html>`;
}

// ── Xuất PDF ─────────────────────────────────────────────────────────────────
const browser = await chromium.launch({ headless: true });
const page = await (await browser.newContext()).newPage();

console.log('🖨️  Đang tải hóa đơn...');
await page.setContent(buildHtml(), { waitUntil: 'networkidle' });
await page.waitForTimeout(2000); // chờ QR code load từ VietQR API

await page.pdf({
  path: PDF_OUT,
  format: 'A4',
  printBackground: true,
  margin: { top: '0', right: '0', bottom: '0', left: '0' },
});

await browser.close();
console.log(`\n✅ Hóa đơn PDF đã tạo: ${PDF_OUT}`);
console.log(`   Tổng thanh toán: ${new Intl.NumberFormat('vi-VN').format(TOTAL)} VND`);
console.log(`   STK: 7500699867 — BIDV (TRAN HUU LONG)`);
