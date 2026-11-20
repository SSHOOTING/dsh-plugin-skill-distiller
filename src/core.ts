/**
 * Pure, dependency-free core for dsh-plugin-skill-distiller (Skill Distiller).
 * Reads only metadata from session events; never prompts, tool bodies or file contents.
 */

const SECRET_RE = /((?:token|key|secret|password|authorization|bearer)[^\s:=]{0,24}[:=]\s*)[^\s&]+/gi
const QUERY_RE = /([?&](?:token|key|secret|password|auth)=)[^&#\s]+/gi
/** Strip credential-looking substrings before anything is printed. */
export function redact(value: unknown): string {
  const text = value instanceof Error ? value.stack || value.message : String(value)
  return text.replace(SECRET_RE, '$1[redacted]').replace(QUERY_RE, '$1[redacted]')
}
export function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

export function analyze(events: readonly unknown[]): any {
  const list = Array.isArray(events) ? events : []
  const tools = new Set()
  let successSignals = 0
  for (const e of list) {
    if (!isRecord(e) || !isRecord(e.data)) continue
    if (typeof e.data.name === 'string' && typeof e.type === 'string' && e.type.startsWith('tool')) tools.add(e.data.name)
    if (typeof e.type === 'string' && (e.type.includes('success') || e.type.includes('result'))) successSignals++
  }
  const steps = [...tools].slice(0, 12)
  return {
    sampledEvents: list.length,
    steps,
    successSignals,
    applicableWhen: successSignals > 0 ? 'a similar multi-tool task with a verified result' : 'need a successful run first',
    counterExample: 'do not reuse when inputs or acceptance criteria differ materially',
    minimalTest: 'replay saved input with the same tools and assert the same acceptance criteria',
    ready: successSignals > 0 && steps.length > 0,
  }
}

export function formatReport(a: any, opts: { json?: boolean } = {}): string {
  if (opts.json) return JSON.stringify(a, null, 2)
  const head = '[skill-distill] ' + (a.ready ? 'skill draft ready' : 'not enough signal yet') +
    ' · ' + a.steps.length + ' step(s) · ' + a.successSignals + ' success signal(s)'
  const lines = a.steps.map((s, i) => '  ' + (i + 1) + '. ' + redact(s))
  return [head, ...lines, '  when: ' + a.applicableWhen, '  not when: ' + a.counterExample,
    '  test: ' + a.minimalTest].join('\n')
}
