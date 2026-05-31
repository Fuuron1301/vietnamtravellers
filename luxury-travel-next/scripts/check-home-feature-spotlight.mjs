import { existsSync, readFileSync } from 'node:fs';

const home = readFileSync('components/home/home-page.tsx', 'utf8');
const componentPath = 'components/sections/home-feature-spotlight.tsx';

const checks = [
  ['Home imports HomeFeatureSpotlight', /import \{ HomeFeatureSpotlight \} from '@\/components\/sections\/home-feature-spotlight';/.test(home)],
  ['Home renders HomeFeatureSpotlight below FeaturedTours', /<FeaturedTours tours=\{tours\} \/>\s*<HomeFeatureSpotlight \/>/.test(home)],
  ['HomeFeatureSpotlight component file exists', existsSync(componentPath)]
];

if (existsSync(componentPath)) {
  const component = readFileSync(componentPath, 'utf8');

  checks.push(
    ['HomeFeatureSpotlight exports a React component', /export function HomeFeatureSpotlight\(\)/.test(component)],
    ['HomeFeatureSpotlight links to tailor-made form', /href="\/customize-your-trip\/"/.test(component)],
    ['HomeFeatureSpotlight has an accessible heading', /<h2[\s\S]*Quiet luxury, planned with precision/.test(component)],
    ['HomeFeatureSpotlight renders three luxury feature cards', /features\.map/.test(component) && /Route design/.test(component) && /Luxury curation/.test(component) && /Human checked/.test(component)],
    [
      'HomeFeatureSpotlight uses unique true 4K source images',
      (component.match(/\/images\/assurance-true4k\/[^'"`]+-true-4k\.jpg/g) || []).length >= 4 &&
        !/\/images\/(hubs|assurance|assurance-hd|assurance-ultra)\//.test(component) &&
        /quality=\{100\}/.test(component) &&
        (component.match(/unoptimized/g) || []).length >= 2
    ],
    ['HomeFeatureSpotlight uses ivory form-like background instead of copied red', /bg-\[#f8f5ef\]|bg-ivory|bg-pearl/.test(component) && !/bg-\[#8f0714\]|#9b0715|#b50d1d|#77202a/.test(component)]
  );
}

const failed = checks.filter(([, passed]) => !passed);

if (failed.length) {
  console.error('Home feature spotlight UI check failed:');
  for (const [message] of failed) {
    console.error(`- ${message}`);
  }
  process.exit(1);
}

console.log('Home feature spotlight UI check passed.');
