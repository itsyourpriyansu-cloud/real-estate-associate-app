# Agent handoff

Every handoff **must** update this file. Rules (spec §23): agents do not create competing design tokens, do not bypass repository contracts, do not add dependencies without architect approval (record it in ARCHITECTURE.md §7), and leave the project compiling with `npm run validate` green.

Start here: [README.md](../README.md) → [ARCHITECTURE.md](ARCHITECTURE.md) → [SCREEN_MAP.md](SCREEN_MAP.md) → [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) → this file. Agent rules are also in `AGENTS.md` at the repo root.

## Current state

**App-flow restructure (structure only): complete and validated.** The app was reshaped around the "Android APP Flow" wireframe: public Home → Guest / Associate / Simple login → Our Projects (guest, client) or the associate dashboard with seven sections. **The route tree, session model, guards, domain schemas, repository contracts, mocks and seed are done. Home, the dashboard and the seven sections are placeholders** — no feature UI was built in this pass. Stage 2's design system is unchanged.

| Gate                                                          | Result                                       |
| ------------------------------------------------------------- | -------------------------------------------- |
| TypeScript strict (typed routes regenerated)                  | pass                                         |
| ESLint `--max-warnings=0`                                     | pass                                         |
| Jest                                                          | 387 tests / 11 suites pass                   |
| Production bundle (Android, Hermes)                           | pass                                         |
| Browser walk of the flow (Chrome 390×844, `expo start --web`) | pass, 0 console errors (see QA_CHECKLIST.md) |
| Expo Doctor / iOS bundle after the restructure                | not re-run                                   |
| **Run on a physical device / emulator**                       | **not done**                                 |

### What changed

- **Routes** — `(public)` Home + Associate/Simple login + OTP · `(guest)` guest hub · `(associate)` dashboard + 7 sections + profile + settings · shared `projects/**`, `plots/**`, `prototype-controls`. Full tree and the session→access table: [SCREEN_MAP.md](SCREEN_MAP.md).
- **Session** — `authStore.session` is `none | guest | client | associate`. `features/auth/sessionAccess.ts` is the single mapping from a kind to route-group access and landing screen; the root layout and `app/index.tsx` both read it. Persisted v1 sessions migrate.
- **Auth** — still phone + OTP (`9876543210` / `123456`). Associate Login and Simple Login share `LoginScreen` / `PhoneLoginForm`. A _known_ number used on the wrong login is refused (`WRONG_ROLE`); unknown valid numbers are accepted for either login, as before. Demo numbers: associate `9876543210`, client `9876500100`, team lead `9876500001`.
- **Domain** — `User` += `CLIENT` role, `sponsorId`, `joinedAt`, `status`; `Project.status`; new `Sale`, `SalesTarget`, `TeamMember`, `PublicSummary` / `AssociateSummary` (with a `PENDING` state), `calculatePlotCost` + `plotCostInputSchema`, `sumSales`.
- **Repositories** — new `SummaryRepository`, `TeamRepository`, `SalesRepository` (contracts, mocks, composition-root exports); `VisitRepository.list({ associateIds })`. `SEED_VERSION` is 2.
- **Seed** — 19 users (team of 16, downline of 9, a client), 20 sales (one per booked plot), 3 monthly targets, project statuses. Empty CRM removes sales so My Sales / Team Site Visits read _pending_.
- **CRM parked** — route files for Home/Leads/Tasks/Inbox tabs, lead/conversation detail, notifications, search and onboarding were removed. Their features, components, repositories and seed remain and compile (they navigate through `utils/parkedRoutes.ts`). To re-attach one, add its route file and drop the `parked(...)` wrapper.

### Known limits (deliberate, structure-only)

- `MockUserRepository.getCurrent()` / `currentAssociate` return **the first ASSOCIATE** in the seed, regardless of which associate number signed in — as before. The seed keeps the demo associate first; an API resolves this from the token.
- `SiteVisit` is still lead-bound, so only the demo associate has visits. **Team Site Visits** therefore counts the team's visits (7 in Normal) and the per-member visit history for the downline is a Stage D decision (see below).
- `PROTOTYPE_ACCOUNTS` (constants) duplicates three seeded phone numbers; `flow.test.ts` keeps it in step with the seed.
- Seeded notification `deepLink`s (`/visits/...`, `/leads/...`) point at parked or moved routes. Harmless while notifications are parked; re-point them when they return.
- `AppTabBar`, `HomeHeader`, the CRM dashboard components and `PlaceholderScreen` are still exported. Delete `PlaceholderScreen` once no route uses it.

## Component ownership (Stage 2)

| Area                                                                               | Owner                     | Path                                                                         |
| ---------------------------------------------------------------------------------- | ------------------------- | ---------------------------------------------------------------------------- |
| Tokens, fonts, theme                                                               | 02 Design System Guardian | `src/design-system/`                                                         |
| Primitives, buttons, forms, chips, lists                                           | 02                        | `src/components/{primitives,buttons,forms,chips,lists}/`                     |
| Feedback: states, sheets, toast, skeletons                                         | 02                        | `src/components/feedback/`                                                   |
| Patterns: `ScreenLayout`, `ResourceBoundary`                                       | 02                        | `src/components/patterns/`                                                   |
| Tab bar (parked), headers, root layout, session/guards, auth UI and forms          | 04 Navigation / Shell     | `src/components/navigation/`, `app/_layout.tsx`, `src/features/auth/`        |
| Lead / task / visit / timeline / dashboard components; Home, Leads, Tasks previews | 05 CRM (parked)           | `src/components/domain/{crm,dashboard}/`, `src/features/{home,leads,tasks}/` |
| Project / plot / inventory / pricing components; Projects preview                  | 06 Property               | `src/components/domain/property/`, `src/features/projects/`                  |
| Conversation / message / template / badge components; Inbox preview                | 07 Communication (parked) | `src/components/domain/communication/`, `src/features/inbox/`                |
| Formatters, urgency, labels; all component/composition/architecture tests; gallery | 08 QA                     | `src/utils/`, `__tests__/`, `src/features/dev/`                              |

Rule: a component has exactly one owner. To change another owner's component, extend it through a prop (and its test) rather than forking a variant. New components for the flow (below) are owned by 04 (Home, guest hub, dashboard shell) and 06 (Live Booking, Price Calculator); Team / Sales screens are a new owner, **09 Team & Sales**.

## Reference implementations

- **Data → screen:** `HomePreview` ← `useHomeData` (repositories via `Promise.all`) ← pure `buildHomeData` selector (`features/home/homeData.ts`, unit-tested). The component never sees a repository, a seed or a `Date`. (Parked, still the pattern to copy.)
- **Four states:** wrap any resource in `ResourceBoundary` (skeleton → recoverable error → human empty state → content). See `LeadsPreview` and the retry test in `previews.test.tsx`.
- **Real mutation with feedback:** `TasksPreview` → `taskRepository.complete` → toast → refetch of list and counts.
- **Forms:** `PhoneLoginForm` (React Hook Form + shared Zod schema + loading + error text, incl. the wrong-role message) and `OtpForm`. Add Team Member and Live Booking should follow it, reusing `addTeamMemberInputSchema` / `createBookingInputSchema`.
- **Session gating:** `sessionAccess.ts` + `__tests__/session.test.ts`.

## Findings that change plans

1. **Contrast:** the brief's `textTertiary` (#72726E) is 3.49–4.17:1 — below AA. It is restricted to non-essential text. Decision needed (DESIGN_SYSTEM.md → Colour).
2. **Wireframe colours** (blue/green/orange gradients) are not adopted; the flow's summary containers use existing monochrome surfaces. Confirm this with the reviewer before Stage C.
3. **"Sales" units are ambiguous in the wireframe** ("Team Total Sales 223,000" equals "Total Registered Sq. Yards 223,000"). The data exposes both `areaSqYd` and `amount` (`SalesTotals`); Stage C must choose which to headline.
4. **Numbers differ from the wireframe's examples** because the app reads the seed (4 projects, 120 plots, team of 16), not production totals.
5. **Bold weight removed** so the three-weight rule is structural.

## Briefs for the next stages

The route files exist as placeholders; each stage replaces its placeholders using the existing components and the contracts already in place. Every stage adds gallery entries and tests for any new component and keeps `npm run validate` green.

### Stage A — Public Home, logins, guest hub (04 Navigation)

`/home`: logo, **summary container** from `SummaryRepository.getPublicSummary` (registered sq yds, completed, ongoing, available plots) through a `useAsyncResource` hook with all four states; three login option cards (Guest / Associate / Simple) and a LOGIN action. The wireframe is ambiguous about whether cards are selectable with a shared LOGIN button or each navigates on tap — planned: select, then LOGIN, with tap-to-continue also working; confirm. `/guest-home`: header "Our Projects" with one row + exit. Polish `LoginScreen` / `otp`. **First on-device run** (Expo Go, Android first): Inter, haptics, safe areas, keyboard over `PhoneField` / `OTPField`, `Stack.Protected` redirects.

### Stage B — Our Projects, inventory, plot (06 Property)

Promote `ProjectsPreview` to the real `/projects` list (show `Project.status`), then project detail, `/projects/:id/inventory` (grid of `PlotCard`, `PlotLegend`, filters in a `BottomSheet`) and `/plots/:id` (`PriceSummary`, plot facts). These routes are shared by guest, client and associate, so they must not assume an associate (no shortlist / hold actions for guests). Replace `placeholder://` art when real images exist.

### Stage C — Associate dashboard shell (04 Navigation)

`/dashboard`: two `SummaryCard` containers from `getAssociateSummary` (container 1: registered sq yds, team total sales, team members, my team; container 2: my sales, team site visits — each renders _Pending / Not yet added_ from the `PENDING` state) and seven `DashboardSectionRow`s. `DashboardHeader`: hamburger opens a **menu sheet** (Profile · Settings · Prototype controls · Sign out) on `BottomSheet`; profile icon → `/profile`. Real Profile and Settings (`SettingRow`/`ActionRow`, "Reset demo data" via `prototypeStore.resetData()`), Prototype Controls UI. See Finding 3 for the sales unit.

### Stage D — Site Visits History, Price Calculator (06 Property / 05)

`/site-visits` (list from `VisitRepository.list({ associateIds })` joined to leads and projects; statuses; team total) and `/site-visits/:id` (reuse the CRM `VisitCard` / visit detail work). Decide how the downline's visits are seeded (visits are lead-bound today). `/price-calculator`: project → plot or manual area/rate, validated with `plotCostInputSchema`, result from `calculatePlotCost`, with the "preview, not a quotation" wording.

### Stage E — Team and Team Sales (09 Team & Sales)

`/team` (`TeamRepository.listMyTeam`, grouped by `level`, `INACTIVE` shown), `/team/:memberId`, `/team/add` (RHF + `addTeamMemberInputSchema`, duplicate-phone and outside-sponsor errors as field/inline text, toast + refetch on success). `/team-sales`: `SalesRepository.listTeam` + `getTargets`, performance vs target per month, using `sumSales` and a pure selector (unit-tested).

### Stage F — Live Booking (06 Property / 09)

`/live-booking`: choose project → available plot (`PlotRepository.list`, `AVAILABLE`/`ON_HOLD`); `/live-booking/:plotId`: customer details (`createBookingInputSchema`), cost preview, confirm → `SalesRepository.createBooking`. **Prototype only** (spec §2): no payment, no real lock — the copy must say so. On success the plot, project counts, summaries and sales lists must all update (the refetch signal is `datasetRevision`; add a targeted refetch if needed).

### Later — Stage 8 QA hardening

Device matrix, accessibility audit with a real screen reader, reduced-motion pass, prototype-controls walkthrough, delete `PlaceholderScreen`, decide the fate of the parked CRM (re-attach, or move under `src/features/_archive`).

## Open questions for the reviewer

1. **Tertiary text colour:** keep #72726E (restricted use) or adopt `#8A8A85` (AA)?
2. **Home LOGIN button** — selectable cards + shared LOGIN, or per-card navigation? (Stage A)
3. **Guest Section vs Guest Login** — treated as one guest entry; say if they are two destinations.
4. **Sales units** on the dashboard — sq yards or rupees? (Finding 3)
5. **Web dev dependency:** `react-native-web` was added as a devDependency solely so the UI can be rendered in a browser for visual QA (`npm run web`). The restructure was verified with it (headless Chrome). Remove it if you prefer a strictly native tree.
6. **Inter "I" vs "l":** in Inter's default glyphs a capital I and lowercase l look alike ("Ananya Iyer" reads "Ananya lyer"). Cosmetic; noting it.

## Handoff log

| Date       | From → To                      | Summary                                                                                                                                                                                                                |
| ---------- | ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-09-19 | Stage 1 (all roles) → reviewer | Architecture, tokens, schemas, contracts, mocks, seed, services, stores, route skeleton, tests, docs.                                                                                                                  |
| 2026-09-19 | Stage 2 (all roles) → reviewer | New tokens; 103 components; custom tab bar + headers; auth UI; 5 representative compositions; dev gallery; 338 tests.                                                                                                  |
| 2026-09-21 | Flow restructure → reviewer    | Rebuilt routes/session/guards around the app-flow wireframe (structure only); CRM parked; +3 repository contracts, Sale/Team/Summary/pricing domain, seed v2; 387 tests; browser walk clean. Stages A–F briefed above. |
