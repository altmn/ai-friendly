import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, copyFileSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

test('release archives and manifest use the package version and reject unsafe versions', () => {
  const dir = mkdtempSync(join(tmpdir(), 'ai-friendly-package-'));
  try {
    const dev = join(dir, 'development');
    const runtime = join(dir, 'ai-friendly-audit');
    mkdirSync(dev);
    copyFileSync(fileURLToPath(new URL('../package_release.py', import.meta.url)), join(dev, 'package_release.py'));
    for (const name of ['LICENSE', 'NOTICE.md']) writeFileSync(join(dir, name), 'synthetic license fixture\n');
    for (const name of ['LICENSE', 'NOTICE.md', 'SKILL.md', 'agents/openai.yaml', 'assets/module.json', 'assets/rules/frontend-v1.json', 'assets/report-template.md', 'package-lock.json', 'scripts/audit.mjs']) {
      const path = join(runtime, name);
      mkdirSync(join(path, '..'), { recursive: true });
      writeFileSync(path, 'synthetic packaging fixture\n');
    }
    writeFileSync(join(runtime, 'package.json'), JSON.stringify({ version: '2.3.4' }));
    const run = () => spawnSync('python3', [join(dev, 'package_release.py'), '--package-root', runtime, '--out', join(dir, 'dist')], { encoding: 'utf8' });
    const first = run();
    assert.equal(first.status, 0, first.stderr);
    const result = JSON.parse(first.stdout);
    assert.deepEqual(result.archives.map(x => x.filename), ['ai-friendly-audit-canonical-package-2.3.4.zip', 'ai-friendly-audit-development-and-verification-2.3.4.zip']);
    assert.equal(JSON.parse(readFileSync(join(dev, 'runtime-manifest.json'))).version, '2.3.4');
    const second = run();
    assert.equal(second.status, 0, second.stderr);
    assert.deepEqual(JSON.parse(second.stdout), result, 'identical source must produce identical archive identities');
    writeFileSync(join(runtime, 'package.json'), JSON.stringify({ version: '../escape' }));
    const invalid = run();
    assert.notEqual(invalid.status, 0);
    assert.match(invalid.stderr, /stable semantic version/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
