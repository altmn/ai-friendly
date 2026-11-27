import http from 'node:http';
import https from 'node:https';
import dns from 'node:dns/promises';
import net from 'node:net';
import { isCredentialParameter, redactText, sanitizeUrl } from './privacy.mjs';

export class CollectionError extends Error {
  constructor(code, message) { super(message); this.name = 'CollectionError'; this.code = code; }
}

function ipv4Public(ip) {
  const a = ip.split('.').map(Number);
  if (a.length !== 4 || a.some((v) => !Number.isInteger(v) || v < 0 || v > 255)) return false;
  return !(a[0] === 0 || a[0] === 10 || a[0] === 127 || a[0] >= 224 ||
    (a[0] === 100 && a[1] >= 64 && a[1] <= 127) ||
    (a[0] === 169 && a[1] === 254) || (a[0] === 172 && a[1] >= 16 && a[1] <= 31) ||
    (a[0] === 192 && (a[1] === 168 || (a[1] === 0 && (a[2] === 0 || a[2] === 2)) || (a[1] === 88 && a[2] === 99))) ||
    (a[0] === 198 && (a[1] === 18 || a[1] === 19 || (a[1] === 51 && a[2] === 100))) ||
    (a[0] === 203 && a[1] === 0 && a[2] === 113));
}

function expandedIPv6(ip) {
  let value = ip.toLowerCase().replace(/^\[|\]$/g, '');
  if (value.includes('%')) return null;
  if (value.includes('.')) {
    const i = value.lastIndexOf(':');
    const bytes = value.slice(i + 1).split('.').map(Number);
    if (bytes.length !== 4 || bytes.some((b) => b < 0 || b > 255 || !Number.isInteger(b))) return null;
    value = value.slice(0, i + 1) + ((bytes[0] << 8) | bytes[1]).toString(16) + ':' + ((bytes[2] << 8) | bytes[3]).toString(16);
  }
  const parts = value.split('::');
  if (parts.length > 2) return null;
  const left = parts[0] ? parts[0].split(':') : [];
  const right = parts.length === 2 && parts[1] ? parts[1].split(':') : [];
  const words = parts.length === 2 ? [...left, ...Array(8 - left.length - right.length).fill('0'), ...right] : left;
  if (words.length !== 8 || words.some((word) => !/^[0-9a-f]{1,4}$/.test(word))) return null;
  return words.map((word) => Number.parseInt(word, 16));
}

export function isPublicAddress(ip) {
  const version = net.isIP(ip.replace(/^\[|\]$/g, ''));
  if (version === 4) return ipv4Public(ip);
  if (version !== 6) return false;
  const w = expandedIPv6(ip); if (!w) return false;
  if (w.slice(0, 5).every((v) => v === 0) && w[5] === 0xffff) {
    return ipv4Public(`${w[6] >> 8}.${w[6] & 255}.${w[7] >> 8}.${w[7] & 255}`);
  }
  // Restrict to currently allocated global unicast. Exclude documentation,
  // Teredo, 6to4 and special-purpose 2001::/23 networks as a conservative rule.
  if ((w[0] & 0xe000) !== 0x2000) return false;
  if ((w[0] === 0x2001 && (w[1] < 0x0200 || w[1] === 0x0db8)) || w[0] === 0x2002 ||
      (w[0] === 0x3fff && (w[1] & 0xf000) === 0)) return false;
  return true;
}

function isLoopbackHost(host) { return ['localhost', '127.0.0.1', '::1'].includes(host.replace(/^\[|\]$/g, '').toLowerCase()); }

export function validateTarget(value, { allowOrigins, allowLocalhostFixture = false } = {}) {
  let u; try { u = new URL(value); } catch { throw new CollectionError('invalid_url', 'The target must be an absolute HTTP(S) URL.'); }
  if (!['http:', 'https:'].includes(u.protocol)) throw new CollectionError('invalid_scheme', 'Only HTTP and HTTPS are supported.');
  if (u.username || u.password) throw new CollectionError('credentials_in_url', 'URL credentials are not accepted.');
  if (u.hash) throw new CollectionError('fragment_not_fetchable', 'HTTP collection cannot inspect fragment routes. Supply a public document URL; use a browser adapter for SPA routes.');
  for (const [key, val] of u.searchParams) {
    if (isCredentialParameter(key)) throw new CollectionError('sensitive_url', 'Credential-like URL parameters are excluded from public collection.');
    if (/^(action|do|operation|cmd)$/i.test(key) && /(?:delete|remove|logout|logoff|unsubscribe|reset|revoke|cancel|confirm|submit|purchase|pay)/i.test(val)) {
      throw new CollectionError('suspected_mutation', 'The URL appears to request a state-changing action. Inspect it with the authorized host workflow instead.');
    }
  }
  let decodedPath; try { decodedPath = decodeURIComponent(u.pathname); } catch { throw new CollectionError('invalid_url', 'Invalid URL encoding.'); }
  if (/(?:^|\/)(?:logout|logoff|signout|sign-out|delete|remove|unsubscribe|revoke|destroy|reset|reset-password|confirm|confirm-email|activate|cancel|submit|purchase|publish|send)(?:\/|$|\.)/i.test(decodedPath)) {
    throw new CollectionError('suspected_mutation', 'The URL appears to perform an account or data action and is excluded from automatic collection.');
  }
  const host = u.hostname.replace(/^\[|\]$/g, '').toLowerCase();
  if (allowOrigins && !allowOrigins.has(u.origin)) throw new CollectionError('origin_out_of_scope', 'A requested or redirected origin is outside the explicit scope.');
  if (allowLocalhostFixture && isLoopbackHost(host)) return u;
  if (isLoopbackHost(host) || /(?:^|\.)(?:local|internal|localhost|test|invalid|example)$/.test(host) || (!host.includes('.') && !net.isIP(host))) {
    throw new CollectionError('non_public_target', 'Public HTTP collection excludes local, internal and reserved hosts.');
  }
  if (net.isIP(host) && !isPublicAddress(host)) throw new CollectionError('non_public_target', 'Public HTTP collection excludes private and special-use IP addresses.');
  return u;
}

async function resolvePublic(url, allowLocalhostFixture, timeoutMs) {
  const host = url.hostname.replace(/^\[|\]$/g, '');
  let timer;
  const resolution = dns.lookup(host, { all: true, verbatim: true });
  let answers;
  try { answers = await Promise.race([resolution, new Promise((_, reject) => { timer = setTimeout(() => reject(new CollectionError('dns_timeout', 'DNS lookup exceeded its time budget.')), Math.min(timeoutMs, 5000)); })]); }
  catch (error) { if (error instanceof CollectionError) throw error; throw new CollectionError('dns_failure', 'The target could not be resolved through this environment.'); }
  finally { clearTimeout(timer); }
  if (!answers.length) throw new CollectionError('dns_failure', 'The target did not resolve to an address.');
  if (allowLocalhostFixture && isLoopbackHost(host)) {
    if (!answers.every(({ address }) => ['127.0.0.1', '::1'].includes(address))) throw new CollectionError('non_public_target', 'Local fixture name resolved outside loopback.');
  } else if (answers.some(({ address }) => !isPublicAddress(address))) {
    throw new CollectionError('non_public_target', 'The target resolves to a private or special-use address.');
  }
  return answers[0];
}

const keptHeaders = ['content-type', 'content-length', 'cache-control', 'age', 'vary', 'x-robots-tag', 'date', 'last-modified', 'retry-after'];
function metadataHeaders(headers) {
  const result = {};
  for (const key of keptHeaders) if (headers[key] !== undefined) result[key] = redactText(String(headers[key]).slice(0, 1000));
  result.etag_present = headers.etag !== undefined;
  return result;
}

async function requestOne(url, options) {
  const selected = await resolvePublic(url, options.allowLocalhostFixture, options.timeoutMs);
  return new Promise((resolve, reject) => {
    const started = performance.now();
    let settled = false; let timer; let observed;
    const finish = (error, result) => { if (settled) return; settled = true; clearTimeout(timer); if (error && observed) error.response = { ...observed, duration_ms: Math.round(performance.now() - started) }; error ? reject(error) : resolve(result); };
    const req = (url.protocol === 'https:' ? https : http).request(url, {
      method: 'GET', maxHeaderSize: 32 * 1024, agent: false,
      headers: { 'User-Agent': 'ai-friendly-audit/1.0 (public HTTP inspection)', Accept: 'text/html,application/xhtml+xml;q=0.9,text/plain;q=0.5', 'Accept-Encoding': 'identity' },
      // Pin the validated DNS answer for this connection. No second lookup occurs.
      lookup: (_hostname, opts, callback) => opts?.all ? callback(null, [selected]) : callback(null, selected.address, selected.family)
    }, (response) => {
      const status = response.statusCode ?? 0;
      const headers = metadataHeaders(response.headers);
      observed = { url: sanitizeUrl(url.href), status, headers, complete: false };
      if ([301, 302, 303, 307, 308].includes(status)) {
        const location = response.headers.location;
        response.destroy(); // Redirect bodies are unnecessary and must not stream without a budget.
        finish(null, { status, headers, location, body: null, bytes: 0, durationMs: Math.round(performance.now() - started), complete: true }); return;
      }
      const encoding = String(response.headers['content-encoding'] ?? 'identity').toLowerCase();
      if (!['identity', ''].includes(encoding)) {
        response.destroy(); finish(new CollectionError('unsupported_encoding', 'The server returned compressed bytes despite an identity request; no body was persisted.')); return;
      }
      const contentLength = Number(response.headers['content-length']);
      if (Number.isFinite(contentLength) && contentLength > options.maxBytes) {
        response.destroy(); finish(new CollectionError('byte_limit', 'The response exceeds the configured byte limit.')); return;
      }
      const chunks = []; let bytes = 0;
      response.on('data', (chunk) => {
        bytes += chunk.length;
        if (bytes > options.maxBytes) { response.destroy(); finish(new CollectionError('byte_limit', 'The response exceeds the configured byte limit.')); }
        else chunks.push(chunk);
      });
      response.on('end', () => finish(null, { status, headers, body: Buffer.concat(chunks).toString('utf8'), bytes, durationMs: Math.round(performance.now() - started), complete: response.complete }));
      response.on('error', () => finish(new CollectionError('response_failure', 'The response stream ended unexpectedly.')));
    });
    timer = setTimeout(() => { req.destroy(); finish(new CollectionError('request_timeout', 'The response exceeded the configured request time limit.')); }, options.timeoutMs);
    req.on('error', (err) => finish(err instanceof CollectionError ? err : new CollectionError('network_failure', `Public fetch failed (${/^[A-Z0-9_]+$/.test(err.code ?? '') ? err.code : 'transport_error'}).`)));
    req.end();
  });
}

export async function collectHttp(value, { allowOrigins, allowLocalhostFixture = false, timeoutMs = 15000, maxBytes = 2 * 1024 * 1024, maxRequests = 5 } = {}) {
  const origins = new Set(allowOrigins ?? [new URL(value).origin]);
  let target = validateTarget(value, { allowOrigins: origins, allowLocalhostFixture });
  if (allowLocalhostFixture && !isLoopbackHost(target.hostname)) throw new CollectionError('fixture_scope', '--allow-localhost-fixture may only target an explicit loopback fixture.');
  const attempts = []; const began = performance.now();
  try {
  for (let i = 0; i < maxRequests; i++) {
    if (performance.now() - began > timeoutMs * 2) throw new CollectionError('run_timeout', 'The bounded collection exceeded its total time budget.');
    const response = await requestOne(target, { allowLocalhostFixture, timeoutMs: Math.min(timeoutMs, Math.max(1, timeoutMs * 2 - (performance.now() - began))), maxBytes });
    attempts.push({ url: sanitizeUrl(target.href), status: response.status, headers: response.headers, bytes: response.bytes, duration_ms: response.durationMs });
    if (response.location !== undefined) {
      let next;
      try { next = new URL(response.location, target); }
      catch { throw new CollectionError('invalid_redirect', 'The server returned an invalid redirect URL; collection stopped without following it.'); }
      if (target.protocol === 'https:' && next.protocol !== 'https:') throw new CollectionError('https_downgrade', 'HTTPS-to-HTTP redirects are excluded.');
      if (allowLocalhostFixture && !isLoopbackHost(next.hostname)) throw new CollectionError('fixture_scope', 'A fixture redirect attempted to leave loopback.');
      target = validateTarget(next.href, { allowOrigins: origins, allowLocalhostFixture });
      continue;
    }
    return { ...response, requestedUrl: sanitizeUrl(value), finalUrl: sanitizeUrl(target.href), attempts };
  }
  throw new CollectionError('redirect_limit', 'The redirect/request budget was exhausted.');
  } catch (error) {
    if (error.response) attempts.push(error.response);
    error.attempts = attempts;
    throw error;
  }
}
