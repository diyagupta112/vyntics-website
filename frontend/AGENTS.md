# Project rules (Vyntics website)

## Scope
- Work only inside frontend/. Never edit, create or delete files outside it.
- Edit only the files the task needs. Do not refactor, rename, move or delete files unless I ask.
- Do not add or upgrade dependencies. Do not edit package.json or lock files. If a change seems to need one, stop and tell me.

## Git
- Never run any git command (no status, diff, log, add, commit, push, pull, fetch, checkout, switch, branch, stash, merge, rebase, reset, revert). I handle version control myself.
- Never create, switch or delete branches.

## No verification (save tokens)
- Do not run tests, builds, lint, type checks or the dev server, and do not open a browser. I check results myself.
- Do not re-read files you just edited to confirm the edit.

## Token discipline
- Read only the files needed. Do not scan node_modules, .next or build output.
- Make the smallest change that satisfies the request. Do not add features, sections or polish I did not ask for.
- Keep replies short: a few lines saying what changed and which files. No long summaries or repeated plans.
- If the request is unclear, ask one short question instead of exploring the codebase.

## Content rules
- Do not invent facts: no made-up statistics, client names, testimonials, certifications, partnerships, prices or timelines.
- No vendor or brand logos or names unless I provide them.
- American English. No em dashes, no exclamation marks, no emojis.
- Reuse existing components and styles. Do not add animation or UI libraries.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
