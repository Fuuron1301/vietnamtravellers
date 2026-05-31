import { readFileSync } from 'node:fs';

const header = readFileSync(new URL('../components/header.tsx', import.meta.url), 'utf8');

const expectations = [
  ['desktop language option model', /const languageChoices = \[/],
  ['Vietnamese language option', /label: 'Tieng Viet'/],
  ['Chinese language option', /label: 'Chinese'/],
  ['desktop language dropdown', /aria-label="Language options"/],
  ['mobile language grid', /aria-label="Mobile language options"/],
  ['compact top language trigger', /aria-label=\{`Change language, current \$\{activeLanguage\.label\}`\}/],
  ['quiet language underline', /aria-hidden="true" className=\{cn\('absolute -bottom-1 left-1\/2 h-px w-7 -translate-x-1\/2 bg-gold/]
];

const missing = expectations.filter(([, pattern]) => !pattern.test(header));
const forbidden = [
  ['globe icon in language switcher', /Globe2/],
  ['visible top label inside language trigger', /<span className="translate-y-\[1px\][\s\S]*?\{activeLanguage\.label\}/]
].filter(([, pattern]) => pattern.test(header));

if (missing.length > 0 || forbidden.length > 0) {
  console.error('Header language switcher is missing:');
  for (const [label] of missing) {
    console.error(`- ${label}`);
  }
  for (const [label] of forbidden) {
    console.error(`- remove ${label}`);
  }
  process.exit(1);
}

console.log('Header language switcher checks passed.');
