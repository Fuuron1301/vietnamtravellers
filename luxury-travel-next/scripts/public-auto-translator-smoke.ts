import assert from 'node:assert/strict';
import {
  chunkTextsForTranslation,
  extractTranslationSegments,
  googleTranslateCookieValue,
  googleTranslateLanguageForLocale,
  shouldAutoTranslatePath,
  wrapTranslationSegment
} from '../lib/public-auto-translate';

assert.equal(googleTranslateLanguageForLocale('vi'), 'vi');
assert.equal(googleTranslateLanguageForLocale('zh'), 'zh-CN');
assert.equal(googleTranslateLanguageForLocale('ar'), 'ar');

assert.equal(googleTranslateCookieValue('en'), '');
assert.equal(googleTranslateCookieValue('vi'), '/en/vi');
assert.equal(googleTranslateCookieValue('zh'), '/en/zh-CN');

assert.equal(shouldAutoTranslatePath('/'), true);
assert.equal(shouldAutoTranslatePath('/vi/'), true);
assert.equal(shouldAutoTranslatePath('/vi/vietnam-tours/'), true);
assert.equal(shouldAutoTranslatePath('/admin/login'), false);
assert.equal(shouldAutoTranslatePath('/vi/admin/login'), false);
assert.equal(shouldAutoTranslatePath('/api/leads'), false);
assert.equal(shouldAutoTranslatePath('/_next/static/chunk.js'), false);

assert.equal(wrapTranslationSegment(7, 'Hello'), '[[7]]Hello[[/7]]');

const parsedSegments = extractTranslationSegments('[[0]]Điểm đến[[/0]] [[1]]Hành trình riêng tư[[/1]]');
assert.equal(parsedSegments.get(0), 'Điểm đến');
assert.equal(parsedSegments.get(1), 'Hành trình riêng tư');

const chunks = chunkTextsForTranslation(['Hello', 'World']);
assert.equal(chunks.length, 1);
assert.deepEqual(chunks[0]?.texts, ['Hello', 'World']);
assert.equal(chunks[0]?.wrapped, '[[0]]Hello[[/0]] [[1]]World[[/1]]');

console.log('public-auto-translator smoke passed');
