import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
const root = process.env.AFF_PACKAGE_ROOT || path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../ai-friendly-audit');
const { inspectInitialHtml, requireHtmlParser } = await import(pathToFileURL(path.join(root,'scripts/lib/collect.mjs')));
const { parse } = await requireHtmlParser();

test('initial metadata is drawn from the document head and root', () => {
  const result=inspectInitialHtml('<!doctype html><html lang="en-US"><head><title>Public service details</title></head><body><h1>Consultation</h1><p>$29 USD per month, eligible accounts only.</p></body></html>',parse);
  assert.equal(result.title_nonempty,true);
  assert.equal(result.root_lang_syntax_valid,true);
  assert.equal(result.title_excerpt,'Public service details');
});
test('script text, SVG titles and templates cannot create a false document-title pass', () => {
  const snippets=[
    '<script>const sample="<title>False document title</title>";</script>',
    '<template><title>Hidden template title</title></template>',
    '<svg><title>Diagram title</title></svg>'
  ];
  for(const snippet of snippets) {
    const result=inspectInitialHtml(`<!doctype html><html lang="en"><head></head><body>${snippet}</body></html>`,parse);
    assert.equal(result.title_nonempty,false,snippet);
  }
});
test('a descendant language attribute cannot replace root language metadata', () => {
  const result=inspectInitialHtml('<!doctype html><html><head><title>Title</title></head><body><p lang="en">Text</p></body></html>',parse);
  assert.equal(result.root_lang_present,false);
  assert.equal(result.root_lang_syntax_valid,false);
});
test('sensitive title values are minimized before they enter retained signals', () => {
  const result=inspectInitialHtml('<!doctype html><html lang="en"><head><title>Account alex-fixture@example.com password=FAKE_SECRET_123</title></head></html>',parse);
  assert.equal(result.title_excerpt.includes('alex-fixture@example.com'),false);
  assert.equal(result.title_excerpt.includes('FAKE_SECRET_123'),false);
});
test('unsupported character encoding is represented as uncertainty', () => {
  const result=inspectInitialHtml('<!doctype html><html lang="en"><head><meta charset="shift_jis"><title>Title</title></head></html>',parse);
  assert.equal(Boolean(result.decoder_uncertainty),true);
});
