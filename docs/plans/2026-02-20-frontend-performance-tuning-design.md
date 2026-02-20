# Frontend performance tuning design

## Goal
Improve frontend build/runtime performance for core landing and dashboard flows with low-risk changes only. No UI/behavior changes.

## Scope
- Frontend only (Next.js app).
- Priority routes: `/`, `/dashboard`, `/dashboard/dsa`, and top nav flows.

## Approach (low-risk)
1. **Error scan**
   - Run `npm run build`, `npm run lint`, `npm run check-types`.
   - Fix any TS/ESLint issues encountered during optimization.

2. **RSC boundary audit**
   - Ensure hook-using components are client-only.
   - Avoid clientifying large trees; prefer small client leaf components.

3. **Dynamic imports (bundle size)**
   - Defer heavy/rare UI (charts, editors, modals) with `next/dynamic`.
   - Keep `ssr: false` where components rely on browser-only APIs.

4. **Memoization (render cost)**
   - Add `useMemo`/`useCallback` for expensive derived data and list rendering on dashboard pages.
   - Stabilize props passed into heavy child components.

5. **Caching hints (safe wins)**
   - Use `fetch` options or `revalidate` for static-like reads when safe.
   - Avoid changing data semantics; only hint caching where data is already non-critical.

## Non-goals
- No API contract changes.
- No UI/behavior changes.
- No backend modifications.

## Verification
- Build passes (`npm run build`).
- Lint passes (`npm run lint`).
- Type check passes (`npm run check-types`).
