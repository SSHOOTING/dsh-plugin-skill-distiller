# dsh-plugin-skill-distiller

**Turn one successful task into a reusable skill draft: when it applies, the steps, counter-examples and a minimal test.**

This is one of 14 read-only observability plugins for the DSH agent lifecycle (theme: **Skill Distiller**). It reads only metadata from session events — never prompts, tool bodies, or file contents — and makes no network calls.

## Install

```powershell
dsh plugin --profile web add dsh-plugin-skill-distiller
```

Requires Node `^22.19.0 || >=24` and DSH `>=0.2.0-rc.2 <0.3.0`.

## 30-second demo

1. Use DSH normally for a few turns.
2. In any session, type `/skill-distill`.
3. You get a compact, read-only report; use `/skill-distill --json` for machine-readable output.

```text
[skill-distill] skill draft ready · 3 step(s) · 2 success signal(s)
  1. read_file
  2. write_file
  3. retry_request
  when: a similar multi-tool task with a verified result
  not when: do not reuse when inputs or acceptance criteria differ materially
  test: replay saved input with the same tools and assert the same acceptance criteria
```

## What it reads

Session event metadata only: event types, tool names, token counts, and route names. Credential-looking values are redacted before display. No file contents or prompts are read, stored, or transmitted.

## License

MIT — SSHOOTING.
