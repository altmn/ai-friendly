/** Minimize before persistence. This is a conservative filter, not a privacy guarantee. */
const sensitiveKeys = /^(authorization|proxy-authorization|cookie|set-cookie|password|passwd|access_token|refresh_token|id_token|api[_-]?key|client_secret|secret|session_token|session_cookie|storageState|raw_body|response_body|request_body|raw_html)$/i;
const secretQuery = /(?:token|secret|password|passwd|auth|session|credential|signature|api[_-]?key|code)/i;
const trackingKey = /^(utm_.+|gclid|fbclid|msclkid|mc_cid|mc_eid)$/i;

export function isCredentialParameter(key) { return secretQuery.test(key); }

export function redactText(value) {
  if (typeof value !== 'string') return value;
  return value
    .replace(/\bBearer\s+[A-Za-z0-9._~+/=-]+/gi, 'Bearer [redacted]')
    .replace(/\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/g, '[redacted-token]')
    .replace(/\b(?:sk|pk)_(?:live|test)_[A-Za-z0-9_-]+\b/g, '[redacted-token]')
    .replace(/\b(?:sk|ghp|github_pat|xox[baprs])[-_][A-Za-z0-9_-]{12,}\b/g, '[redacted-token]')
    .replace(/((?:password|passwd|secret|api[_-]?key|access[_-]?token|refresh[_-]?token|session[_-]?token)\s*[=:]\s*)(?:"[^"]*"|'[^']*'|[^\s,;<>]+)/gi, '$1[redacted]')
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, '[redacted-email]')
    .replace(/\b(?:\d[ -]*?){13,19}\b/g, '[redacted-number]')
    .replace(/https?:\/\/[^\s<>"']+/gi, (url) => sanitizeUrl(url))
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, '');
}

export function sanitizeUrl(input) {
  try {
    const u = new URL(input);
    if (!['http:', 'https:'].includes(u.protocol)) return '[unsupported-url]';
    u.username = ''; u.password = '';
    u.pathname = u.pathname.split('/').map((segment) => {
      let decoded; try { decoded = decodeURIComponent(segment); } catch { return '[redacted]'; }
      if (/[@\s]/.test(decoded) || /(?:token|secret|password|session|credential)/i.test(decoded) ||
          /^[0-9]{4,}$/.test(decoded) || /^[a-f0-9]{16,}$/i.test(decoded) ||
          /^[a-f0-9]{8}-[a-f0-9-]{27,}$/i.test(decoded) ||
          (decoded.length > 24 && /[A-Za-z]/.test(decoded) && /\d/.test(decoded))) return '[redacted]';
      return segment;
    }).join('/');
    const params = [];
    for (const [key] of u.searchParams) {
      if (trackingKey.test(key)) continue;
      const safeKey = /^[a-z][a-z0-9_-]{0,50}$/i.test(key) ? key : '[redacted-key]';
      params.push(`${encodeURIComponent(safeKey)}=[redacted]`);
    }
    u.search = params.length ? `?${params.join('&')}` : '';
    u.hash = ''; // Fragment values can carry credentials and private SPA state.
    return u.href.replaceAll('%5Bredacted%5D', '[redacted]');
  } catch { return '[invalid-url]'; }
}

export function sanitizeData(value, key = '', depth = 0) {
  if (depth > 80) throw new Error('Input nesting exceeds the privacy limit.');
  if (sensitiveKeys.test(key)) return typeof value === 'string' ? '[redacted]' : null;
  if (typeof value === 'string') {
    // Do not exempt keys globally: free-form observed_data can reuse a key such
    // as version or timestamp to carry a credential. Fixed-form valid hashes,
    // dates and versions survive the patterns naturally. If an identifier is
    // redacted, validate its references and reject an invalid result.
    if (/^(url|sanitized_url|target_url|origin|final_url|requested_url)$/.test(key)) return ['unknown', 'not_exposed'].includes(value) ? value : sanitizeUrl(value);
    return redactText(value);
  }
  if (Array.isArray(value)) return value.map((v) => sanitizeData(v, key, depth + 1));
  if (value && typeof value === 'object') {
    const out = Object.create(null);
    for (const [k, v] of Object.entries(value)) {
      if (['__proto__', 'prototype', 'constructor'].includes(k)) throw new Error('Unsafe object key.');
      out[k] = sanitizeData(v, k, depth + 1);
    }
    return out;
  }
  return value;
}

export function markdownText(value) {
  return redactText(String(value ?? '')).replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/[\\`*_{}\[\]()#+!|]/g, '\\$&').replace(/\r?\n/g, ' ');
}

export const PRIVACY_LIMITATION = 'Automated minimization removes known credential and identifier patterns. It does not guarantee absence of private data; review imported free text and retained artifacts before sharing. All URL query values and fragments are removed from persisted identifiers, which can limit reproduction of query-driven or SPA routes. Raw HTML, response bodies, cookies, authorization headers, storage values and authenticated screenshots are not collected by the HTTP collector.';
