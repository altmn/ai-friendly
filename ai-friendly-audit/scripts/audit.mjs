#!/usr/bin/env node
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { isDeepStrictEqual } from 'node:util';
import { fileURLToPath } from 'node:url';
import { PACKAGE_ROOT, ensureOutputDirectory, readAudit, readCatalog, readJson, verifyArtifactPaths, writeFiles } from './lib/io.mjs';
import { detectCapabilities, newAudit } from './lib/model.mjs';
import { calculateCoverage, getSchemaEngine, requireValidAudit, schemaErrors } from './lib/validation.mjs';
import { performCollection } from './lib/collect.mjs';
import { deriveOutputs } from './lib/report.mjs';
import { redactText, sanitizeData } from './lib/privacy.mjs';
import { validateTarget } from './lib/http.mjs';
import { inspectSourceFile } from './lib/source-view.mjs';

const HELP = `AI-friendly audit CLI 1.0.0

Commands:
  capabilities [--out DIR]
  init --url URL --out DIR
  collect --url URL --out DIR [--allow-origin ORIGIN ...]
          [--max-bytes 2000000] [--timeout-ms 20000] [--max-requests 5]
          [--allow-localhost-fixture]
  import --input AUDIT_JSON --out DIR
  validate --input FILE_OR_DIR [--schema NAME]
  report --input FILE_OR_DIR --out DIR
  rules [--format json|markdown] [--ids AFF-SEM-002,AFF-FORM-004]
  inspect-source --input HTML_FILE [--max-bytes 262144]

Write commands refuse existing outputs unless --overwrite is supplied.
collect fetches one explicit public document and allowed-origin redirects. It
does not crawl, drive a browser, attach sessions or invoke page instructions.
--allow-localhost-fixture permits only explicit loopback fixtures and labels
their evidence controlled_fixture; it never enables private network access.
import accepts the complete canonical audit.json contract, not raw HAR/profile
exports. Referenced files are not copied and no prior observation is rerun.
rules --ids prints full selected rule records and their linked owners as JSON;
it is a partial selection, not a complete catalog. inspect-source prints a
bounded source-field-inventory JSON to stdout: labels and declared ARIA names,
never entered values or computed browser names. It reads UTF-8 only, executes
no page code, accesses no network and writes no files. Output is capped at
65536 bytes; at most 50 controls and 1024 characters per name are retained.

Node >=22.15.0 <25. Validated commands require pinned AJV dependencies; collect
also requires parse5. Install locally with npm ci --ignore-scripts. No browser
download, global package installation or build step is required.
Exit codes: 0 success; 1 invalid input/validation/runtime error; 2 completed
partial collection with no usable response (a limitations report is retained).
`;

function parseArgs(argv) {
  const command = argv.shift() ?? 'help'; const options = { origins: [] };
  const booleans = new Set(['overwrite', 'allow-localhost-fixture']);
  const valued = new Set(['url', 'out', 'input', 'allow-origin', 'max-bytes', 'timeout-ms', 'max-requests', 'schema', 'format', 'ids']);
  const seen = new Set();
  while (argv.length) {
    const flag = argv.shift();
    if (flag === '--help' || flag === '-h') return { command: 'help', options: {} };
    if (!flag.startsWith('--')) throw new Error('Unexpected positional argument. Use --help for the command syntax.');
    const key = flag.slice(2);
    if (!booleans.has(key) && !valued.has(key)) throw new Error(`Unknown option: --${key}`);
    if (seen.has(key) && key !== 'allow-origin') throw new Error(`Duplicate option: --${key}`);
    seen.add(key);
    if (booleans.has(key)) { options[key] = true; continue; }
    const value = argv.shift(); if (value === undefined || value.startsWith('--')) throw new Error(`Missing value for --${key}.`);
    if (key === 'allow-origin') options.origins.push(value); else options[key] = value;
  }
  const permitted = {
    capabilities: ['out', 'overwrite'], init: ['url', 'out', 'overwrite'],
    collect: ['url', 'out', 'allow-origin', 'max-bytes', 'timeout-ms', 'max-requests', 'allow-localhost-fixture', 'overwrite'],
    import: ['input', 'out', 'overwrite'], validate: ['input', 'schema'], report: ['input', 'out', 'overwrite'], rules: ['format','ids'], 'inspect-source':['input','max-bytes'], help: []
  };
  if (!Object.hasOwn(permitted, command)) throw new Error('Unknown command. Use --help for supported commands.');
  for (const key of seen) if (!permitted[command].includes(key)) throw new Error(`--${key} does not apply to ${command}.`);
  return { command, options };
}

function required(options, name) { if (!options[name]) throw new Error(`--${name} is required.`); return options[name]; }
function boundedInteger(value, fallback, minimum, maximum, name) {
  if (value === undefined) return fallback;
  if (!/^\d+$/.test(value)) throw new Error(`${name} must be an integer.`);
  const result = Number(value); if (result < minimum || result > maximum) throw new Error(`${name} must be between ${minimum} and ${maximum}.`);
  return result;
}

function collectionOptions(options) {
  const url = new URL(required(options, 'url'));
  const origins = options.origins.length ? options.origins.map((value) => {
    const parsed = new URL(value);
    if (parsed.username || parsed.password || parsed.pathname !== '/' || parsed.search || parsed.hash || !['http:', 'https:'].includes(parsed.protocol)) throw new Error('--allow-origin must contain only an HTTP(S) origin.');
    return parsed.origin;
  }) : [url.origin];
  if (!origins.includes(url.origin)) throw new Error('The target origin must be explicitly allowed.');
  const fixture = options['allow-localhost-fixture'] === true;
  validateTarget(url.href, { allowOrigins: new Set(origins), allowLocalhostFixture: fixture });
  return {
    allowOrigins: [...new Set(origins)], fixture,
    maxBytes: boundedInteger(options['max-bytes'], 2_000_000, 1024, 5_000_000, '--max-bytes'),
    timeoutMs: boundedInteger(options['timeout-ms'], 20_000, 100, 30_000, '--timeout-ms'),
    maxRequests: boundedInteger(options['max-requests'], 5, 1, 10, '--max-requests')
  };
}

async function writeAudit(audit, out, overwrite) {
  await requireValidAudit(audit);
  const files = deriveOutputs(audit);
  for (const [name, schema] of [['evidence-index.json', 'evidence-index'], ['compatibility-tests.json', 'compatibility-tests']]) {
    const errors = await schemaErrors(files[name], schema); if (errors.length) throw new Error(`Derived ${name} is invalid: ${errors.join('; ')}`);
  }
  const directory = await writeFiles(out, files, { overwrite });
  await ensureOutputDirectory(path.join(directory, 'evidence'));
  return directory;
}

async function validateInput(input, schema) {
  const stat = await fs.stat(input);
  if (schema) {
    if (stat.isDirectory()) throw new Error('--schema requires one JSON file.');
    if (schema === 'report') return validateInput(input);
    const errors = await schemaErrors(await readJson(input), schema);
    if (errors.length) throw new Error(`Validation failed:\n${errors.slice(0, 40).map((e) => `- ${e}`).join('\n')}`);
    return { schema, valid: true };
  }
  const audit = await readAudit(input); await requireValidAudit(audit);
  const directory = stat.isDirectory() ? input : path.dirname(input);
  const errors = await verifyArtifactPaths(audit, directory);
  if (stat.isDirectory()) {
    const derived = deriveOutputs(audit);
    for (const [name, expected] of Object.entries(derived)) {
      if (name === 'audit.json') continue;
      try {
        const file = path.join(directory, name);
        if (name.endsWith('.json')) {
          const actual = await readJson(file);
          errors.push(...(await schemaErrors(actual, name.replace('.json', ''))).map((e) => `${name}: ${e}`));
          if (!isDeepStrictEqual(actual, expected)) errors.push(`${name}: derived data differs from audit.json.`);
        } else if (await fs.readFile(file, 'utf8') !== expected) errors.push(`${name}: generated text differs from audit.json.`);
      } catch (error) { if (error.code !== 'ENOENT') throw error; errors.push(`${name}: required deliverable is missing.`); }
    }
  }
  if (errors.length) throw new Error(`Run validation failed:\n${errors.slice(0, 40).map((e) => `- ${e}`).join('\n')}`);
  return { schema: 'report', valid: true, run_id: audit.run.id, coverage: audit.coverage };
}

export async function main(argv = process.argv.slice(2)) {
  if (argv[0] === '--help' || argv[0] === '-h') { process.stdout.write(HELP); return 0; }
  const { command, options } = parseArgs([...argv]);
  if (command === 'help') { process.stdout.write(HELP); return 0; }
  const major = Number(process.versions.node.split('.')[0]);
  const minor = Number(process.versions.node.split('.')[1]);
  if (major < 22 || major >= 25 || (major === 22 && minor < 15)) throw new Error('This runtime supports Node >=22.15.0 <25.');
  if (command === 'rules') {
    const format = options.format ?? 'json';
    if(options.ids!==undefined) {
      if(format!=='json')throw new Error('--ids requires JSON format.');
      const ids=options.ids.split(',');
      if(ids.some(id=>!/^AFF-[A-Z]+-\d{3}$/.test(id))||new Set(ids).size!==ids.length)throw new Error('--ids requires unique comma-separated rule IDs.');
      const catalog=await readCatalog();
      if(ids.some(id=>!catalog.rules.some(r=>r.id===id)))throw new Error('--ids contains an unknown rule ID.');
      const rules=catalog.rules.filter(r=>ids.includes(r.id));
      const owners=new Set(rules.flatMap(r=>r.owner_verification_ids));
      process.stdout.write(`${JSON.stringify({record_type:'rule-selection',catalog_version:catalog.catalog_version,
        provenance:catalog.provenance,rules,owner_requirements:catalog.owner_requirements.filter(o=>owners.has(o.id)),
        limitations:['Partial selection only; no whole-catalog or guide-coverage claim.']},null,2)}\n`);
      return 0;
    }
    if (format === 'json') process.stdout.write(`${JSON.stringify(await readCatalog(), null, 2)}\n`);
    else if (format === 'markdown') process.stdout.write(await fs.readFile(path.join(PACKAGE_ROOT, 'references/frontend-rules.md'), 'utf8'));
    else throw new Error('--format must be json or markdown.');
    return 0;
  }
  if(command==='inspect-source') {
    const result=await inspectSourceFile(required(options,'input'),boundedInteger(options['max-bytes'],262144,1024,2_000_000,'--max-bytes'));
    process.stdout.write(`${JSON.stringify(result)}\n`);return 0;
  }
  if (command === 'capabilities') {
    const capabilities = await detectCapabilities();
    if (options.out) { const directory = await writeFiles(options.out, { 'capabilities.json': capabilities }, { overwrite: options.overwrite }); process.stdout.write(`Capability manifest written to ${directory}. No target request was made.\n`); }
    else process.stdout.write(`${JSON.stringify(capabilities, null, 2)}\n`);
    return 0;
  }
  await getSchemaEngine(); // Fail closed before network collection or persistence.
  if (command === 'validate') { process.stdout.write(`${JSON.stringify(await validateInput(required(options, 'input'), options.schema), null, 2)}\n`); return 0; }
  if (command === 'init') {
    const url = required(options, 'url');
    // Initialization records a proposed URL without contacting it. Credential URLs
    // are rejected and private routes require an explicit host-driven context.
    validateTarget(url);
    const audit = await newAudit(url);
    const directory = await writeAudit(audit, required(options, 'out'), options.overwrite);
    process.stdout.write(`Initialized audit contract at ${directory}. No target request was made.\n`); return 0;
  }
  if (command === 'collect') {
    const config = collectionOptions(options); const out = required(options, 'out');
    const audit = sanitizeData(await performCollection(options.url, config));
    audit.coverage = calculateCoverage(audit);
    const directory = await writeAudit(audit, out, options.overwrite);
    process.stdout.write(`Partial HTTP inspection written to ${directory}. Checks: ${audit.coverage.executed_check_instances}/${audit.coverage.planned_check_instances}; task trials: ${audit.coverage.total_trials}.\n`);
    return audit.states.length ? 0 : 2;
  }
  if (command === 'import') {
    const input = required(options, 'input'); const original = await readAudit(input);
    await requireValidAudit(original);
    const audit = sanitizeData(original);
    audit.run.imported_from = redactText(path.basename(input));
    audit.limitations.push('Imported canonical evidence; no original observation was rerun. External artifact files were not copied or opened. Minimized embedded summaries preserve the submitted source context.');
    for (const e of audit.evidence) {
      if (e.artifact_path !== null) e.limitations.push('The source artifact reference was removed during import; no local copy is claimed.');
      e.artifact_path = null; e.sha256 = null; e.sanitization.reviewed = false;
      e.sanitization.method += '; imported schema-aware known-pattern minimization';
    }
    audit.coverage = calculateCoverage(audit);
    const directory = await writeAudit(audit, required(options, 'out'), options.overwrite);
    process.stdout.write(`Canonical report imported to ${directory}. No website was accessed.\n`); return 0;
  }
  if (command === 'report') {
    const input = required(options, 'input'); const original = await readAudit(input); await requireValidAudit(original);
    const inputDirectory = (await fs.stat(input)).isDirectory() ? path.resolve(input) : path.dirname(path.resolve(input));
    const out = required(options, 'out');
    const artifactErrors = await verifyArtifactPaths(original, inputDirectory);
    if (artifactErrors.length) throw new Error(`Cannot generate reports with invalid retained artifacts: ${artifactErrors.join(' ')}`);
    if (original.evidence.some((e) => e.artifact_path !== null) && path.resolve(out) !== inputDirectory) throw new Error('Reports with retained artifacts must use the existing run directory. Use import for a separate minimized copy without artifact files.');
    const audit = sanitizeData(original); audit.coverage = calculateCoverage(audit);
    if (audit.evidence.some((e, index) => e.artifact_path !== original.evidence[index].artifact_path)) throw new Error('A retained artifact path contains information that would be redacted. Report generation stopped before writing. Use import to produce a minimized copy without external artifact paths, or rename and revalidate the sanitized artifact explicitly.');
    const directory = await writeAudit(audit, out, options.overwrite);
    process.stdout.write(`Reports generated from canonical data at ${directory}.\n`); return 0;
  }
  throw new Error('Unsupported command.');
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().then((code) => { process.exitCode = code; }).catch((error) => { process.stderr.write(`Error: ${redactText(error.message)}\n`); process.exitCode = 1; });
}
