const allowedGoogleMapsHosts = new Set(['www.google.com', 'maps.google.com']);
export const sharedTourGoogleMapsEmbedUrl = 'https://www.google.com/maps?ll=21.0277644,105.8341598&z=11&t=m&hl=vi&gl=US&mapclient=embed';

const stopCoordinates: Record<string, [number, number]> = {
  hanoi: [21.0277644, 105.8341598],
  'ha noi': [21.0277644, 105.8341598],
  'ha long bay': [20.9101, 107.1839],
  halong: [20.9101, 107.1839],
  halongbay: [20.9101, 107.1839],
  hue: [16.4637, 107.5909],
  'hoi an': [15.8801, 108.338],
  saigon: [10.7769, 106.7009],
  'ho chi minh city': [10.7769, 106.7009],
  hcmc: [10.7769, 106.7009],
  'cu chi tunnels': [10.9849, 106.4647],
  'ninh binh': [20.2539, 105.9745],
  'trang an': [20.2539, 105.92299],
  'da nang': [16.0544, 108.2022],
  danang: [16.0544, 108.2022],
  'mekong delta': [10.0452, 105.7469],
  'can tho': [10.0452, 105.7469],
  sapa: [22.3364, 103.8431],
  'phu quoc': [10.2899, 103.984],
  'luang prabang': [19.8833, 102.1388],
  'siem reap': [13.3633, 103.8559],
  'angkor wat': [13.4125, 103.8667],
  bangkok: [13.7563, 100.5018],
  'chiang mai': [18.7883, 98.9853],
  phuket: [7.8804, 98.3923],
  bagan: [21.1717, 94.8585],
  'koh samui': [9.512, 100.0136],
  'ky son village': [20.455, 105.455],
  'ky son': [20.455, 105.455]
};

function decodeHtmlAttribute(value: string) {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#34;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'");
}

function readIframeSrc(value: string) {
  const match = value.match(/\bsrc\s*=\s*(["'])(.*?)\1/i) || value.match(/\bsrc\s*=\s*([^>\s]+)/i);
  return (match?.[2] || match?.[1] || value).trim();
}

export function extractGoogleMapsEmbedSrc(value: unknown) {
  if (typeof value !== 'string' || !value.trim()) return '';
  const candidate = decodeHtmlAttribute(readIframeSrc(value.trim()));

  try {
    const url = new URL(candidate);
    if (url.protocol !== 'https:') return '';
    if (!allowedGoogleMapsHosts.has(url.hostname)) return '';
    if (!url.pathname.startsWith('/maps')) return '';
    if (url.pathname !== '/maps/embed') url.searchParams.set('output', 'embed');
    return url.toString();
  } catch {
    return '';
  }
}

function normalizeStop(value: string) {
  return value
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function isUsableStop(value: string) {
  return value.length > 1 && !/^(route on request|route confirmed after consultation)$/i.test(value);
}

function normalizeStopKey(value: string) {
  return value
    .toLowerCase()
    .replace(/<[^>]*>/g, ' ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

function stopToCoordinate(stop: string): [number, number] | null {
  const key = normalizeStopKey(stop);
  return stopCoordinates[key] || stopCoordinates[key.replace(/\s+/g, '')] || null;
}

function formatNumber(value: number) {
  return Number.isFinite(value) ? Number(value.toFixed(6)).toString() : '';
}

export function buildGoogleMapsEmbedSrcFromStops(stops: string[]) {
  const cleanStops = Array.from(new Set(stops.map(normalizeStop).filter(isUsableStop))).slice(0, 8);
  const primaryStop = cleanStops.find((stop) => stopToCoordinate(stop)) || cleanStops[0];
  if (!primaryStop) return '';

  const coordinate = stopToCoordinate(primaryStop);
  const url = new URL('https://www.google.com/maps');
  if (coordinate) {
    url.searchParams.set('ll', `${formatNumber(coordinate[0])},${formatNumber(coordinate[1])}`);
    url.searchParams.set('z', '12');
  } else {
    url.searchParams.set('q', primaryStop);
    url.searchParams.set('z', '10');
  }
  url.searchParams.set('t', 'm');
  url.searchParams.set('hl', 'vi');
  url.searchParams.set('gl', 'US');
  url.searchParams.set('mapclient', 'embed');
  url.searchParams.set('output', 'embed');
  return url.toString();
}
