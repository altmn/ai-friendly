import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash, randomUUID } from 'node:crypto';

export const PACKAGE_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
export const DEFAULT_MAX_JSON_BYTES = 12 * 1024 * 1024;

export async function readJson(file, limit = DEFAULT_MAX_JSON_BYTES) {
  const stat = await fs.stat(file);
  if (!stat.isFile() || stat.size > limit) throw new Error('JSON input must be a regular file within the size limit.');
  return parseJson(await fs.readFile(file, 'utf8'));
}

export function parseJson(text) {
  const value = JSON.parse(text);
  const tokens = text.match(/"(?:[^"\\]|\\.)*"|[{}\[\]:,]|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?|true|false|null/g) ?? [];
  let at = 0;
  function visit(depth = 0) {
    if (depth > 256) throw new Error('JSON nesting exceeds 256 levels.');
    const token = tokens[at++];
    if (token === '{') {
      const keys = new Set();
      while (tokens[at] !== '}') {
        const key = JSON.parse(tokens[at++]);
        if (keys.has(key)) throw new Error('Duplicate JSON object key.');
        keys.add(key); at++; visit(depth + 1);
        if (tokens[at] !== ',') break;
        at++;
      }
      at++;
    } else if (token === '[') {
      while (tokens[at] !== ']') {
        visit(depth + 1);
        if (tokens[at] !== ',') break;
        at++;
      }
      at++;
    }
  }
  visit(); return value;
}

export async function readAudit(input) {
  const stat = await fs.stat(input);
  return readJson(stat.isDirectory() ? path.join(input, 'audit.json') : input);
}

export async function readCatalog() { return readJson(path.join(PACKAGE_ROOT, 'assets/rules/frontend-v1.json')); }
export async function readModule() { return readJson(path.join(PACKAGE_ROOT, 'assets/module.json')); }

export async function ensureOutputDirectory(directory) {
  const resolved = path.resolve(directory);
  let ancestor = path.parse(resolved).root;
  for (const segment of resolved.slice(ancestor.length).split(path.sep).filter(Boolean)) {
    ancestor = path.join(ancestor, segment);
    try { if ((await fs.lstat(ancestor)).isSymbolicLink()) throw new Error('Output paths cannot traverse symbolic links.'); }
    catch (error) { if (error.code !== 'ENOENT') throw error; }
  }
  await fs.mkdir(resolved, { recursive: true, mode: 0o700 });
  const stat = await fs.lstat(resolved);
  if (!stat.isDirectory() || stat.isSymbolicLink()) throw new Error('Output must be a real directory, not a symbolic link.');
  return resolved;
}

export async function writeFiles(directory, files, { overwrite = false } = {}) {
  const base = await ensureOutputDirectory(directory);
  const lockPath = path.join(base, '.audit-write.lock');
  let lock;
  try { lock = await fs.open(lockPath, 'wx', 0o600); }
  catch (error) {
    if (error.code === 'EEXIST') throw new Error('The output directory has an active or stale audit write lock. Select another directory, or remove a stale lock only after verifying that no writer is active.');
    throw error;
  }
  const lockIdentity = await lock.stat();
  try {
  // Check the whole write set before modifying any file.
  for (const name of Object.keys(files)) {
    if (path.basename(name) !== name || !/^[a-zA-Z0-9._-]+$/.test(name)) throw new Error('Output filename is not safe.');
    try {
      const stat = await fs.lstat(path.join(base, name));
      if (stat.isSymbolicLink() || !stat.isFile()) throw new Error(`Refusing nonregular output: ${name}`);
      if (!overwrite) throw new Error(`Output already exists: ${name}. Select another directory or use --overwrite.`);
    } catch (error) { if (error.code !== 'ENOENT') throw error; }
  }
  for (const [name, value] of Object.entries(files)) {
    const destination = path.join(base, name);
    const temporary = path.join(base, `.${name}.${randomUUID()}.tmp`);
    try {
      await fs.writeFile(temporary, typeof value === 'string' ? value : `${JSON.stringify(value, null, 2)}\n`, { flag: 'wx', mode: 0o600 });
      if (overwrite) await fs.rename(temporary, destination);
      else await fs.link(temporary, destination); // Atomic no-clobber, including external writers.
    } finally { await fs.rm(temporary, { force: true }); }
  }
  return base;
  } finally {
    await lock.close();
    try {
      const current = await fs.lstat(lockPath);
      if (current.ino === lockIdentity.ino && current.dev === lockIdentity.dev) await fs.unlink(lockPath);
    } catch (error) { if (error.code !== 'ENOENT') throw error; }
  }
}

export async function verifyArtifactPaths(audit, inputDirectory) {
  const errors = [];
  const base = await fs.realpath(inputDirectory);
  for (const e of audit.evidence ?? []) {
    const relative = e.artifact_path ?? e.path ?? null;
    if (relative == null) continue;
    if (typeof relative !== 'string' || path.isAbsolute(relative) || relative.split(/[\\/]/).includes('..')) {
      errors.push(`Evidence ${e.id}: unsafe artifact path.`); continue;
    }
    try {
      const real = await fs.realpath(path.resolve(base, relative));
      if (!real.startsWith(`${base}${path.sep}`)) errors.push(`Evidence ${e.id}: artifact escapes the run directory.`);
      else {
        const stat = await fs.stat(real);
        if (!stat.isFile()) errors.push(`Evidence ${e.id}: artifact is not a file.`);
        else if (e.sha256 !== null && e.sha256 !== undefined) {
          if (stat.size > 20 * 1024 * 1024) errors.push(`Evidence ${e.id}: retained artifact exceeds the 20 MiB integrity-check limit.`);
          else if (createHash('sha256').update(await fs.readFile(real)).digest('hex') !== e.sha256) errors.push(`Evidence ${e.id}: retained bytes do not match the recorded SHA-256.`);
        }
      }
    } catch { errors.push(`Evidence ${e.id}: referenced artifact is unavailable.`); }
  }
  return errors;
}
