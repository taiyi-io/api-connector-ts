# AGENTS — Taiyi Cloud API Connector (TypeScript)

Inherits global rules from `~/.claude/CLAUDE.md`. This file is English to save tokens; chat output, code comments, commit messages, CHANGELOG entries, and all other docs stay Simplified Chinese. This file imposes no English requirement on anything outside itself.

Package: `@taiyi-io/api-connector-ts` · CommonJS · ES6 target · pnpm 10.x · Node.

## Coding Discipline (Karpathy)

- **Think before coding**: state assumptions, surface ambiguity, present alternatives instead of silently picking one.
- **Simplicity first**: minimum code that solves the problem; no speculative abstractions, no unrequested flexibility.
- **Surgical changes**: touch only what the request requires; match existing style; don't refactor adjacent code or clean pre-existing dead code.
- **Goal-driven**: define a verifiable success check (failing test → passing test) before looping.

## Project Constraints

- OpenSpec doc-driven workflow: consult OpenSpec docs before planning / searching / designing; update them when code diverges.
- Public API never throws — return `BackendResult<T> = { data?, error?, unauthenticated? }`.
- Use explicit TypeScript types on every public signature; no `any`, no `@ts-ignore` / `@ts-expect-error`.
- TSDoc required on every exported symbol.
- Import from `src/` during development; never from `dist/`.
- Files marked `"use server";` are server-only.

## Build & Test

Commands (pnpm only):

```bash
pnpm install
pnpm build        # tsc
pnpm lint         # eslint .
pnpm test:run [path-or-pattern]   # vitest run, single pass, exits
./gendoc.sh       # typedoc
```

Test env (`.env`):

```
BACKEND_HOST=<host>
BACKEND_PORT=5851
ACCESS_STRING=<token>
```

### Do

1. Run tests as `pnpm test:run [path]` — single-run, terminates, stdout captured by the agent harness.
2. Build with `pnpm build`.
3. Always pass a path/pattern; full-suite only when the task explicitly requires it.
4. Default vitest reporter; `--reporter=basic` to cut noise; `--reporter=verbose` only while debugging.
5. Invoke as a blocking command and read stdout/stderr directly.

### Don't (hard bans)

1. ❌ **No watch mode** — `pnpm test`, `vitest`, `vitest watch`, `vitest --watch`, `vitest dev`, or any invocation without the `run` subcommand. They never exit and output is lost.
2. ❌ **No file redirection / tee** — `> file`, `>> file`, `tee`, `2>&1 > file`, `| cat > log`, named pipes. Output must not transit disk (latency + `tmp/` residue).
3. ❌ **No background/detached runs** — `&`, `nohup`, `disown`, `tmux`, `screen`, `setsid`.
4. ❌ **No interactive flags** — `--ui`, `--inspect`, `--inspect-brk`.
5. ❌ **No silent suppression** — `--silent`, `2>/dev/null`, `>/dev/null` on the primary stream.

## Code Style

Naming:

| Element | Convention | Example |
|---|---|---|
| Variable / function | camelCase | `accessToken`, `queryGuests()` |
| Private field | `_` prefix | `_id`, `_authenticated` |
| Class / interface / enum / type | PascalCase | `TaiyiConnector`, `GuestConfig`, `TaskStatus` |
| Enum member | PascalCase | `TaskStatus.Completed` |
| DTO field (wire format) | snake_case | `access_token`, `guest_id` |
| Constant | UPPER_SNAKE_CASE | `API_VERSION` |

Layout:

```
src/
  index.ts              public exports + convenience fns
  connector.ts          TaiyiConnector class
  enums.ts              all enums
  data-defines.ts       domain interfaces
  request-params.ts     API req/res types
  request-forwarder.ts  transport layer
  helper.ts             utils
  *-store.ts            token stores
```

Imports: external packages first, then internal modules, separated by a blank line.

### Async task pattern

Long-running ops expose `tryXxx` + `waitTask`, plus a convenience wrapper:

```typescript
const task = await connector.tryCreateGuest(poolID, system, config);
if (task.error) throw new Error(task.error);
const done = await connector.waitTask(task.data!, 300);
if (done.error) throw new Error(done.error);
const guestID = done.data!.guest;

// or
const result = await connector.createGuest(poolID, system, config, 300);
```

Handle `unauthenticated` to trigger token refresh. Use `generateNonce()` for cryptographic ops.

## Git

- Never run `git add` / `commit` / `push` unless the user explicitly asks.
- When asked, use conventional commits with Simplified Chinese subject, e.g. `feat: 新增云主机安全策略接口`.
- Branch names and PR titles in Simplified Chinese.

## Changelog

- No placeholder versions (`[Unreleased]`, `[next]`, `[0.x-dev]`); never bump version implicitly.
- Append under the topmost existing version; create `### 新增` / `### 调整` / `### 修复` sections if missing.
- Sync that version's date header to today; keep the version number.
- User-perspective wording in Simplified Chinese: scenarios, flows, behavior changes, problems solved.
- Banned in entries: function / variable / file names, code snippets, internal data structures, diff summaries, changed-file lists.
