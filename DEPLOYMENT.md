# Deployment Guide

## 1. WordPress CMS

1. Copy `halong-cruise-wp` to `wp-content/plugins/halong-cruise-wp`.
2. Activate `Ha Long Luxury Headless CMS` in wp-admin.
3. Go to `Settings > Permalinks` and save `Post name`.
4. Create content in Countries, Tours, Travel Styles, Testimonials and Posts.
5. Upload original licensed media to the WordPress Media Library.

## 2. Next.js Frontend

```bash
cd luxury-travel-next
cp .env.example .env.local
npm install
npm run build
npm run start
```

Set these variables:

```text
WORDPRESS_API_URL=https://cms.example.com/wp-json/hlt/v1
NEXT_PUBLIC_SITE_URL=https://www.example.com
```

## 3. Payments

- VietQR uses `VIETQR_BANK_ID`, `VIETQR_ACCOUNT_NO`, `VIETQR_ACCOUNT_NAME` to create a QR payload.
- PayPal requires app credentials before production checkout links are enabled.
- VNPAY requires TMN code, hash secret and signed return flow before accepting real payments.

## 4. SEO Checklist

- Fill meta title, description, H1, canonical and OG image in WordPress.
- Add FAQ JSON to hubs/tours where relevant.
- Verify `/sitemap.xml` and `/robots.txt` after deploy.
- Keep clean URLs such as `/vietnam-tours/` and `/luxury-vietnam-tour-10-days/`.

## 5. Performance Checklist

- Use compressed, licensed hero images.
- Serve Next.js through a CDN.
- Keep WordPress admin on a separate subdomain such as `cms.example.com`.
- Run Lighthouse on mobile and optimize image sizes if score is below 90.
