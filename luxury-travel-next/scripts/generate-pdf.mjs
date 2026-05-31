/**
 * Tạo PDF báo cáo sản phẩm với ảnh chụp màn hình minh họa từng chức năng.
 * Chạy: node docs/generate-pdf.mjs
 */
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const BASE = 'http://localhost:3000';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.join(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'docs', 'screenshots');
const PDF_OUT = path.join(ROOT, 'docs', 'PRODUCT-DELIVERY-REPORT.pdf');

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

// ── Danh sách trang cần chụp ────────────────────────────────────────────────
const PAGES = [
  // ALL STYLES
  {
    id: 'styles-01-catalog',
    url: '/travel-styles/',
    label: 'ALL STYLES — Trang danh mục 20 phong cách du lịch',
    section: 'ALL STYLES',
    waitFor: 'networkidle',
    fullPage: true,
  },
  {
    id: 'styles-02-detail',
    url: '/travel-styles/beach-escapes/',
    label: 'ALL STYLES — Trang chi tiết phong cách "Beach Escapes"',
    section: 'ALL STYLES',
    waitFor: 'networkidle',
    fullPage: true,
  },
  // Phải mở trang chủ rồi hover nav để chụp dropdown
  {
    id: 'styles-03-menu',
    url: '/',
    label: 'ALL STYLES — Mega-menu dropdown "Tour Formats" trên thanh nav',
    section: 'ALL STYLES',
    waitFor: 'networkidle',
    fullPage: false,
    action: async (page) => {
      // Hover vào "ALL STYLES" nav button
      const btn = page.locator('nav button, nav a').filter({ hasText: /all styles/i }).first();
      await btn.hover();
      await page.waitForTimeout(800);
    },
  },
  // SIM CARD
  {
    id: 'sim-01-catalog',
    url: '/sim-card/',
    label: 'SIM CARD — Trang catalog với tìm kiếm và lọc sản phẩm',
    section: 'SIM CARD 5G',
    waitFor: 'networkidle',
    fullPage: true,
  },
  {
    id: 'sim-02-detail-top',
    url: '/sim-card/123902-vietnam-esim-high-speed-internet-qr-code-voucher',
    label: 'SIM CARD — Trang chi tiết sản phẩm (phần trên: hero, thông tin, scroll nav)',
    section: 'SIM CARD 5G',
    waitFor: 'networkidle',
    fullPage: false,
  },
  {
    id: 'sim-03-packages',
    url: '/sim-card/123902-vietnam-esim-high-speed-internet-qr-code-voucher#package-options',
    label: 'SIM CARD — Bộ lọc và chọn gói cước (Package Options)',
    section: 'SIM CARD 5G',
    waitFor: 'networkidle',
    fullPage: false,
    action: async (page) => {
      const section = page.locator('#package-options');
      if (await section.count() > 0) await section.scrollIntoViewIfNeeded();
      await page.waitForTimeout(600);
    },
  },
  {
    id: 'sim-04-howto',
    url: '/sim-card/123902-vietnam-esim-high-speed-internet-qr-code-voucher#how-to-use',
    label: 'SIM CARD — Hướng dẫn kích hoạt eSIM từng bước',
    section: 'SIM CARD 5G',
    waitFor: 'networkidle',
    fullPage: false,
    action: async (page) => {
      const section = page.locator('#how-to-use');
      if (await section.count() > 0) await section.scrollIntoViewIfNeeded();
      await page.waitForTimeout(600);
    },
  },
  {
    id: 'sim-05-faq',
    url: '/sim-card/123902-vietnam-esim-high-speed-internet-qr-code-voucher#faqs',
    label: 'SIM CARD — FAQ accordion (câu hỏi thường gặp về eSIM)',
    section: 'SIM CARD 5G',
    waitFor: 'networkidle',
    fullPage: false,
    action: async (page) => {
      const section = page.locator('#faqs');
      if (await section.count() > 0) await section.scrollIntoViewIfNeeded();
      await page.waitForTimeout(600);
    },
  },
  {
    id: 'sim-06-book',
    url: '/sim-card/123902-vietnam-esim-high-speed-internet-qr-code-voucher/book?pkgId=12390201&price=3.99&pkg=Data+in+total+%C2%B7+3+days+%C2%B7+3GB+%C2%B7+Data+only',
    label: 'SIM CARD — Form đặt hàng eSIM (thông tin liên hệ, giao hàng)',
    section: 'SIM CARD 5G',
    waitFor: 'networkidle',
    fullPage: true,
  },
  // ASIA VISA
  {
    id: 'visa-01-page',
    url: '/visa/',
    label: 'ASIA VISA — Trang đăng ký visa (hero + form đầy đủ)',
    section: 'ASIA VISA',
    waitFor: 'networkidle',
    fullPage: true,
  },
];

// ── Chạy ────────────────────────────────────────────────────────────────────
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await context.newPage();

const screenshots = [];

for (const item of PAGES) {
  console.log(`📸 Chụp: ${item.label}`);
  await page.goto(`${BASE}${item.url}`, { waitUntil: item.waitFor, timeout: 30000 });
  await page.waitForTimeout(1000);
  if (item.action) await item.action(page);
  const file = path.join(OUT_DIR, `${item.id}.png`);
  await page.screenshot({ path: file, fullPage: item.fullPage ?? false });
  screenshots.push({ ...item, file: path.resolve(file) });
  console.log(`   ✅ ${file}`);
}

await browser.close();
console.log('\n✅ Đã chụp xong tất cả ảnh. Đang tạo PDF...');

// ── Tạo HTML rồi in PDF ───────────────────────────────────────────────────
function sectionColor(section) {
  if (section === 'ALL STYLES') return '#1a3a5c';
  if (section === 'SIM CARD 5G') return '#8a6420';
  return '#2d5a3d';
}

function buildHtml(shots) {
  const sections = [...new Set(shots.map(s => s.section))];
  const sectionNums = { 'ALL STYLES': '01', 'SIM CARD 5G': '02', 'ASIA VISA': '03' };

  let body = '';
  // Cover page
  body += `
  <div class="cover">
    <div class="cover-inner">
      <p class="cover-eyebrow">HA LONG LUXURY TRAVEL</p>
      <h1 class="cover-title">Product Delivery<br><em>Evidence</em></h1>
      <p class="cover-sub">Báo cáo bàn giao sản phẩm<br>với ảnh minh họa chi tiết từng chức năng</p>
      <div class="cover-date">Ngày bàn giao: 25/05/2026</div>
      <div class="cover-modules">
        <div class="cover-module" style="border-color:#1a3a5c">
          <span class="cm-num">01</span>
          <span class="cm-label">ALL STYLES</span>
        </div>
        <div class="cover-module" style="border-color:#8a6420">
          <span class="cm-num">02</span>
          <span class="cm-label">SIM CARD 5G</span>
        </div>
        <div class="cover-module" style="border-color:#2d5a3d">
          <span class="cm-num">03</span>
          <span class="cm-label">ASIA VISA</span>
        </div>
      </div>
    </div>
  </div>
  `;

  for (const section of sections) {
    const items = shots.filter(s => s.section === section);
    const color = sectionColor(section);
    const num = sectionNums[section] || '0x';

    // Section divider
    body += `
    <div class="section-cover" style="border-color:${color}">
      <p class="sc-num" style="color:${color}">${num}</p>
      <h2 class="sc-title">${section}</h2>
      <p class="sc-count">${items.length} màn hình minh hoạ</p>
    </div>
    `;

    for (let i = 0; i < items.length; i++) {
      const shot = items[i];
      const imgData = fs.readFileSync(shot.file);
      const b64 = imgData.toString('base64');

      body += `
      <div class="screenshot-page">
        <div class="ss-header" style="border-left-color:${color}">
          <span class="ss-tag" style="background:${color}">${section}</span>
          <h3 class="ss-label">${shot.label}</h3>
          <span class="ss-idx">${i + 1}/${items.length}</span>
        </div>
        <div class="ss-frame">
          <img src="data:image/png;base64,${b64}" alt="${shot.label}" />
        </div>
      </div>
      `;
    }
  }

  return `<!DOCTYPE html>
<html lang="vi">
<head>
<meta charset="UTF-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Segoe UI', Arial, sans-serif; background: #fff; color: #0B1B2B; }

  /* COVER */
  .cover { width:100%; min-height:100vh; background:linear-gradient(135deg,#07121e 0%,#0b1b2b 60%,#1a2f48 100%); display:flex; align-items:center; justify-content:center; page-break-after:always; }
  .cover-inner { text-align:center; padding:60px 40px; }
  .cover-eyebrow { letter-spacing:.28em; text-transform:uppercase; color:#c8a96a; font-size:12px; font-weight:800; margin-bottom:28px; }
  .cover-title { font-size:72px; font-weight:900; line-height:.9; letter-spacing:-.04em; color:#f8f5ef; margin-bottom:32px; }
  .cover-title em { color:#c8a96a; font-style:normal; }
  .cover-sub { font-size:16px; color:#f8f5ef; opacity:.7; line-height:1.7; margin-bottom:40px; }
  .cover-date { display:inline-block; border:1px solid rgba(200,169,106,.4); border-radius:999px; padding:8px 22px; font-size:12px; letter-spacing:.16em; text-transform:uppercase; color:#c8a96a; margin-bottom:52px; }
  .cover-modules { display:flex; gap:20px; justify-content:center; }
  .cover-module { border:1px solid; border-radius:16px; padding:20px 28px; min-width:160px; }
  .cm-num { display:block; font-size:32px; font-weight:900; color:#c8a96a; letter-spacing:-.04em; line-height:1; margin-bottom:8px; }
  .cm-label { font-size:11px; font-weight:800; letter-spacing:.18em; text-transform:uppercase; color:#f8f5ef; opacity:.8; }

  /* SECTION COVER */
  .section-cover { page-break-before:always; width:100%; min-height:100vh; background:#f8f5ef; display:flex; flex-direction:column; align-items:center; justify-content:center; border-top:6px solid; padding:60px; text-align:center; }
  .sc-num { font-size:96px; font-weight:900; letter-spacing:-.06em; line-height:1; margin-bottom:12px; opacity:.22; }
  .sc-title { font-size:52px; font-weight:900; letter-spacing:-.04em; color:#0b1b2b; margin-bottom:16px; }
  .sc-count { font-size:14px; font-weight:700; letter-spacing:.16em; text-transform:uppercase; color:#888; }

  /* SCREENSHOT PAGE */
  .screenshot-page { page-break-before:always; width:100%; min-height:100vh; padding:32px 40px 40px; background:#fff; display:flex; flex-direction:column; }
  .ss-header { border-left:4px solid; padding-left:16px; margin-bottom:24px; display:flex; align-items:center; gap:14px; flex-wrap:wrap; }
  .ss-tag { font-size:10px; font-weight:800; letter-spacing:.18em; text-transform:uppercase; color:#fff; border-radius:999px; padding:5px 14px; white-space:nowrap; }
  .ss-label { font-size:17px; font-weight:700; color:#0b1b2b; flex:1; }
  .ss-idx { font-size:12px; font-weight:600; color:#aaa; white-space:nowrap; }
  .ss-frame { flex:1; display:flex; align-items:flex-start; justify-content:center; background:#f0ece4; border-radius:16px; overflow:hidden; border:1px solid #e5dfd4; }
  .ss-frame img { max-width:100%; height:auto; display:block; }
</style>
</head>
<body>${body}</body>
</html>`;
}

const html = buildHtml(screenshots);
const htmlFile = path.join(ROOT, 'docs', '_report-tmp.html');
fs.writeFileSync(htmlFile, html, 'utf-8');

// In HTML sang PDF
const browser2 = await chromium.launch({ headless: true });
const page2 = await (await browser2.newContext()).newPage();
await page2.goto(`file:///${path.resolve(htmlFile).replace(/\\/g, '/')}`, { waitUntil: 'networkidle' });
await page2.waitForTimeout(1000);
await page2.pdf({
  path: PDF_OUT,
  format: 'A4',
  printBackground: true,
  margin: { top: '0', right: '0', bottom: '0', left: '0' },
});
await browser2.close();

// Dọn file tạm
fs.unlinkSync(htmlFile);

console.log(`\n🎉 PDF đã tạo xong: ${PDF_OUT}`);
