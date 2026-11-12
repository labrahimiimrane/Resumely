<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# AGENTS.md

Instructions for AI coding agents working in this project.

AI tools must not add AI attribution to commits or pull requests, including AI
`Co-Authored-By` trailers or generated-by signatures. Preserve genuine human
attribution.

## What this is

Resumely is a web app for building professional, ATS-friendly CVs in the
browser: edit content, pick and customize a template, preview live, get
advisory ATS feedback, and download a server-generated PDF. No accounts and no
database; CV data stays in the browser's LocalStorage except when the user
requests a PDF.

## Proportional engineering

Build for established requirements, not hypothetical scale, threats, or future
flexibility. Reuse existing code, the standard library, native platform features,
and installed dependencies before adding machinery.

- Unknown scale or extensibility defaults to the smaller reversible design. Do
  not infer enterprise, multi-tenant, hostile-user, or compliance requirements.
- Derive trust and data-integrity boundaries from actual reachability: untrusted
  input, auth/session/ownership, shared persisted data, destructive operations,
  payments, secrets, and sensitive data.
- Ask only when an unknown materially changes behavior, architecture, persisted
  data, interoperability, a real security boundary, or cost. Otherwise choose the
  simplest repository-native implementation.
- Add an abstraction, dependency, service, configuration surface, compatibility
  layer, or security mechanism only for a current requirement.
- Simplicity never removes real trust-boundary validation, data-loss prevention,
  accessibility, explicit security requirements, configured tests, or project rules.

## Stack and conventions

- Next.js 16 (App Router) with React 19 and TypeScript in strict mode
- npm (`package-lock.json`)
- Tailwind CSS v4 (CSS-first config in `app/globals.css`) and shadcn/ui
  (`base-nova` style on Base UI, Lucide icons)
- React Hook Form + Zod for forms and validation; dnd-kit for reordering
- Playwright for server-side PDF generation
- Path alias `@/*` maps to the repo root; there is no `src/` directory

## Commands

- Dev server: `npm run dev` (http://localhost:3000)
- Build: `npm run build`
- Production server: `npm run start`
- Lint: `npm run lint`
- Browser tests: `npm run test:browser` (Playwright Test, Chromium; builds the
  production app and serves it on port 3210, so it does not reuse a dev server)

There is no unit test command and no typecheck script yet; `npm run build` runs
the TypeScript check. Unit tests are not a required gate until a real test
command is added here.
