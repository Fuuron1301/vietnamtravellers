const BESTPRICE_ITINERARY_CDN = 'https://d122axpxm39woi.cloudfront.net/itinerary';

const explicitDownloadFields = [
  'itineraryPdfUrl',
  'itineraryPdf',
  'itineraryUrl',
  'downloadItineraryUrl',
  'downloadUrl',
  'pdfUrl'
] as const;

function readNonEmptyString(value: unknown) {
  return typeof value === 'string' && value.trim() ? value.trim() : '';
}

export function buildBestPriceItineraryPdfUrl(sourceUrl: string) {
  const rawUrl = readNonEmptyString(sourceUrl);
  if (!rawUrl) return '';

  try {
    const url = new URL(rawUrl);
    const host = url.hostname.toLowerCase();
    if (!host.endsWith('bestpricetravel.com')) return '';

    const fileName = url.pathname.split('/').filter(Boolean).pop() || '';
    const slug = fileName.replace(/\.html?$/i, '').trim();
    if (!slug || slug === fileName) return '';

    return `${BESTPRICE_ITINERARY_CDN}/en_${slug}.pdf`;
  } catch {
    return '';
  }
}

export function getItineraryProgramDownloadUrl(details: Record<string, unknown>, sourceUrl: string) {
  for (const field of explicitDownloadFields) {
    const explicitUrl = readNonEmptyString(details[field]);
    if (explicitUrl) return explicitUrl;
  }

  return buildBestPriceItineraryPdfUrl(sourceUrl);
}
