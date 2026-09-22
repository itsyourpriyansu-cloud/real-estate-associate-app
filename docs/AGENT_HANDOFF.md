# Agent handoff

Every handoff **must** update this file. Rules (spec §23): agents do not create competing design tokens, do not bypass repository contracts, do not add dependencies without architect approval (record it in ARCHITECTURE.md §7), and leave the project compiling with `npm run validate` green.

Start here: [README.md](../README.md) → [RUN_THE_PROTOTYPE.md](RUN_THE_PROTOTYPE.md) → [ARCHITECTURE.md](ARCHITECTURE.md) → [SCREEN_MAP.md](SCREEN_MAP.md) → [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) → this file. Agent rules are also in `AGENTS.md` at the repo root.

## Current state

**Vara Real Estates prototype: the whole "Android APP Flow" is built and working on seed data, in a new light design system. Verified in a browser; not yet on a device.**

| Gate                                              | Result                                                                                                       |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| TypeScript strict (typed routes regenerated)      | pass                                                                                                         |
| ESLint `--max-warnings=0`                         | pass                                                                                                         |
| Jest                                              | 470 tests / 13 suites pass                                                                                   |
| Android production bundle                         | pass (`expo export`, re-run after the redesign)                                                              |
| Browser walk, Chrome 390×844 (`expo start --web`) | pass, **0 console errors** (guest path, login, dashboard, all seven sections, booking, add member, sign out) |
| Expo Doctor / iOS bundle after the redesign       | not re-run                                                                                                   |
| **Run on a physical device / emulator**           | **not done**                                                                                                 |

### What exists

- **Flow** — public Home (numbers + two radio cards + Login) → Guest **or** Associate (phone + OTP) → guest hub → Our Projects (list, project, inventory, gallery, plot) **or** the associate dashboard: hero card, performance panel with **Pending** states, seven section rows, and a floating dock (Home · Projects · Team · Profile). A **hidden** admin login (`/admin-login`, not linked from Home) → admin dashboard → Senior Associates (promote, assign commission/reward). Sections: Our Projects, **Live Booking** (pick plot → customer → confirm → success), **Price Calculator**, **Site Visits History** (+ detail), **Team Sales** (month vs target, top sellers, sales), **Add Team Member** (Senior Associates only), **My Team** (+ member detail). Also Profile, Settings, Prototype controls. Route/screen map: [SCREEN_MAP.md](SCREEN_MAP.md).
- **Design system** — light theme with a green accent, ink actions, a charcoal hero card and dock, generous radii, soft shadows, tokenised motion, an icon vocabulary and the Vara brand mark. Full reference: [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md).
- **Data layer** — session kinds (`none|guest|associate|admin`), 12 repository contracts with mocks, seed v3 (18 users, 1 admin, 20 sales, targets, 4 associate incentives, project statuses). Booking a plot flips it to `BOOKED`, adds a `Sale`, and the plot, project counts, summaries and sales lists all follow (tested).
- **CRM parked** — Leads, Tasks, Inbox, notifications, search and their route files were removed from `app/`; the features, components, repositories and tests remain (they navigate through `utils/parkedRoutes.ts`).

### What changed in this pass

1. **Admin surface.** New `admin` session kind, reached only through a **hidden** `/admin-login` → `/admin-otp` flow (never linked from the public Home) requiring the exact demo admin number, not "any valid number" like associate login. `OtpForm`/`PhoneLoginForm` were refactored to take the verify/request action as a prop, so one component serves both logins without a `LoginAs`-style parameter creeping back into `AuthService`. Admin is a new small `Admin` domain type — **not** a `User` — with its own seed table and `AdminRepository` (the 12th contract): `listAssociates`, `promoteToSeniorAssociate`, `getIncentiveFor`, `assignIncentive`.
2. **Commission/reward are now really admin-configurable.** The flat `COMMISSION_RATE_SENIOR_ASSOCIATE`/`REWARD_PLOT_TARGET` constants from the previous pass are now only seed defaults. The real values live in a new per-associate `AssociateIncentive` record, read by the associate via `SalesRepository.getIncentive()`. The Dashboard's commission tile and reward panel are unchanged in appearance for the demo associate (same 5%/5-plot numbers, same "Unlocked" state) but now genuinely admin-assigned, and read `Pending` if an admin removes/never assigns the record — not just while sales are pending.
3. **Add Team Member gated to Senior Associates.** Previously **wholly unenforced** — any signed-in associate could add a member. `MockTeamRepository.addMember` now rejects a non-senior caller (`INVALID_INPUT`); the Dashboard's "Add Team Member" row and `AddMemberScreen` are hidden/blocked the same way the commission/reward panels already were. `SEED_VERSION` bumped 2 → 3 for the two new tables.
4. **Docs** — SCREEN_MAP, ARCHITECTURE (deviation 30), DOMAIN_SCHEMA, QA_CHECKLIST updated for the above. See ARCHITECTURE.md deviation 30 for full rationale and the documented test-coverage gap (no automated screen-render proof that the Add Team Member gate is invisible to a non-senior associate — covered at the repository level instead).

### What changed before this pass

See the Handoff log below for the full dated history. In short: Simple Login (client) was removed (Guest/Associate only); Our Projects gained a photo gallery and the four demo projects were renamed off company-sounding names, all under one brand; before that, the app was rebuilt around the "Android APP Flow" wireframe in a new light design system (tokens, ~103 components, the floating dock, brand, motion) on top of the original Stage 1 architecture (repository pattern, Zod domain schemas, deterministic seed).

### Known limits (deliberate)

- **Not run on hardware.** Haptics, fonts on device, keyboard over the phone/OTP fields, safe areas, the dock and sheet gestures need a device pass — the first task of the next stage.
- `MockUserRepository.getCurrent()` returns **the first ASSOCIATE** in the seed whichever associate number signed in (an API resolves it from the token). Signing in with the team lead's number still shows Raghunath's data.
- **Sales units.** The wireframe is ambiguous ("Team Total Sales" equals registered sq. yards). The dashboard headlines the registered **sq. yards** and shows team and personal sales as **₹ value** with plots and sq. yards as captions.
- **Team site visits** counts the associate's own visits (visits are lead-bound); a per-member visit history is not modelled.
- **Auth is phone + OTP** (a product decision), not the wireframe's User ID + Password. There is now one login (Associate); any valid 10-digit number is accepted.
- `SuccessMark`, `ProgressBar` and the dock spring were reviewed in a browser, not on a device; tune springs on hardware.
- The Android adaptive-icon foreground and monochrome layers are the bare "V" (safe-zone sized); check them against a launcher mask.
- `PlaceholderScreen`, `AppTabBar`, `HomeHeader` and the CRM components are still exported (parked); delete what you do not re-attach.
- Project imagery is seeded stock photography (`picsum.photos`), not real project photos. Notifications, search and WhatsApp are out of this flow.
- Senior-associate eligibility is still a free-text `designation === 'Senior Associate'` string match (`designation` has no enum); a non-senior associate earns no commission and sees no reward panel, and cannot add a team member.
- The parked CRM's lead/task copy still names the pre-rename project ("Follow up on Real Rise shortlist"); it is unrouted and invisible, so it was left as-is when the projects were renamed (ARCHITECTURE.md deviation 28).
- **Admin login only accepts one fixed demo number** (`PROTOTYPE_ADMIN_PHONE`) — there is no admin directory/multi-admin concept, matching the single-associate-identity limitation the prototype already has.
- **No automated screen-render test** proves the Add Team Member gate is invisible to a non-senior associate — `screens.test.tsx` has no DI seam to swap the current user. Repository-level rejection is tested; the UI gate is the same proven pattern as the commission/reward panels but unverified end-to-end by Jest. See QA_CHECKLIST.md.
- **No "demote" capability** — an admin can promote an associate to Senior Associate but not reverse it; not requested, and reversible manually via the seed if needed.

## Component ownership

| Area                                                                 | Owner                     | Path                                                                                             |
| -------------------------------------------------------------------- | ------------------------- | ------------------------------------------------------------------------------------------------ |
| Tokens, fonts, theme, icons, brand                                   | 02 Design System Guardian | `src/design-system/`, `src/components/primitives/{icons,BrandMark}`                              |
| Primitives, blocks, buttons, forms, chips, lists, feedback, patterns | 02                        | `src/components/{primitives,blocks,buttons,forms,chips,lists,feedback,patterns}/`                |
| Dock, headers, root layout, session/guards, auth UI                  | 04 Navigation / Shell     | `src/components/navigation/`, `app/_layout.tsx`, `src/features/{auth,navigation}/`               |
| Home, guest, dashboard, profile, settings, prototype controls        | 04                        | `src/features/{landing,guest,dashboard,profile}/`                                                |
| Project / plot / inventory, live booking, price calculator           | 06 Property               | `src/components/domain/property/`, `src/features/{projects,booking,calculator}/`                 |
| Team, team sales, site visits                                        | 09 Team & Sales           | `src/components/domain/{team,crm/VisitHistoryRow}`, `src/features/{team,sales,visits}/`          |
| CRM (parked)                                                         | 05 CRM / 07 Communication | `src/components/domain/{crm,communication,dashboard}/`, `src/features/{home,leads,tasks,inbox}/` |
| Formatters, labels, all tests, the gallery                           | 08 QA                     | `src/utils/`, `__tests__/`, `src/features/dev/`                                                  |

Rule: a component has exactly one owner. To change another owner's component, extend it through a prop (and its test) rather than forking a variant.

## Reference implementations

- **Data → screen:** `DashboardScreen` ← `useDashboard` (repositories via `Promise.all`) → `ResourceBoundary`. Screens never see a repository, a seed or `new Date()`.
- **Pure selectors:** `features/sales/salesSelectors.ts` (month vs target, seller ranking) — unit-tested, no I/O.
- **Forms:** `AddMemberScreen` and `BookingConfirmScreen` (React Hook Form + Zod, field errors mapped from repository errors, toast + refetch on success).
- **Real mutation with feedback:** booking → `SalesRepository.createBooking` → success mark → the sale appears in Team Sales.
- **Session gating:** `features/auth/sessionAccess.ts` + `__tests__/session.test.ts`; the dock: `features/navigation/dock.ts`.
- **Motion:** `Reveal`, `AnimatedNumber`, `ProgressBar`, `AssociateDock`, `SuccessMark` — all read `useReducedMotion`.

## Next steps

1. **Run it on a phone** (Android first) and tune: springs, dock size and label width, sheet drag, keyboard over the login/OTP/add-member/booking fields, the hero card arcs at small widths, font rendering.
2. **Expo Doctor and both production bundles** after the redesign.
3. **Screen-reader pass** (TalkBack / VoiceOver): dock as tabs, radio cards, progress bars, pending tiles, sheets.
4. **Decisions to confirm** (below), then polish copy.
5. **Optional:** dark theme as a second palette (the token layer is centralised; the components read tokens only), real project photography (stock photos are a placeholder, not final imagery), per-member visit history, re-attach the CRM, replace the mocks with FastAPI repositories (the contracts are the seam).

## Open questions for the reviewer

1. **Sales unit** on the dashboard — sq. yards (headline) with ₹ captions, or the reverse?
2. **Green accent** — `#2E9B6A` / `#167547`. Keep, or match a brand green?
3. **Dock** — Home · Projects · Team · Profile, or something else (e.g. Bookings)?
4. **Web dev dependency:** `react-native-web` is a devDependency so the UI can be reviewed in a browser (`npm run web`); it is not part of the native app. Keep it?
5. **App icon** — the "V" mark is a working brand placeholder; replace when a real logo exists (the vector geometry lives in `BrandMark.tsx` (a 48-unit grid; strokes 4.2 wide) and the PNGs in `assets/images/` were rendered from it; see DESIGN_SYSTEM.md → Brand).

## Handoff log

| Date       | From → To                      | Summary                                                                                                                                                                                                                                                    |
| ---------- | ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-09-19 | Stage 1 (all roles) → reviewer | Architecture, tokens, schemas, contracts, mocks, seed, services, stores, route skeleton, tests, docs.                                                                                                                                                      |
| 2026-09-19 | Stage 2 (all roles) → reviewer | New tokens; 103 components; custom tab bar + headers; auth UI; 5 representative compositions; dev gallery; 338 tests.                                                                                                                                      |
| 2026-09-21 | Flow restructure → reviewer    | Rebuilt routes/session/guards around the app-flow wireframe; CRM parked; +3 repository contracts, Sale/Team/Summary/pricing domain, seed v2; 387 tests.                                                                                                    |
| 2026-09-21 | Vara redesign → reviewer       | Light theme + green accent, brand, icon vocabulary, floating dock, hero card, motion set; every flow screen built (Home → dashboard → seven sections, booking, team); 449 tests; browser walk clean; RUN_THE_PROTOTYPE.md; docs and screenshots refreshed. |
| 2026-09-22 | Simple Login removal + project gallery → reviewer | Removed Simple Login (client) end to end (Home, routes, `AuthService`, `authStore`, `sessionAccess`, `User.role`, seed); added `Project.galleryImages` + "View Gallery" action + `/projects/[projectId]/gallery`; renamed the four projects to Sunrise Meadows / Emerald Hills / Silver Creek / Maple Ridge, all under one brand (Vara Real Estates) instead of four invented developers; swapped drawn placeholder project art for seeded stock photography. ARCHITECTURE.md deviation 28; SCREEN_MAP/DOMAIN_SCHEMA/QA_CHECKLIST updated; tests updated and extended. |
| 2026-09-22 | Senior-associate commission + reward → reviewer | Added a 5% sales commission and a 5-plot "foreign trip" reward for senior associates: `dashboardSelectors.ts` (`commissionFor`/`rewardProgressFor`), prototype constants, a third "My commission" `StatTile` and a new "Sales reward" panel on the Dashboard, both senior-associate only and `Pending`-aware. ARCHITECTURE.md deviation 29; `vara-components.test.tsx`/`screens.test.tsx` extended. |
| 2026-09-22 | Admin surface → reviewer | New hidden `admin` session kind/login (`/admin-login`, never on public Home), `Admin` domain type + seed (not a `User`), `AdminRepository` (12th contract: list/promote/assign), per-associate `AssociateIncentive` replacing the flat commission/reward constants (`SalesRepository.getIncentive`), and Add Team Member gated to Senior Associates end to end (repository + UI). `SEED_VERSION` → 3. ARCHITECTURE.md deviation 30; SCREEN_MAP/DOMAIN_SCHEMA/QA_CHECKLIST updated; new `AdminRepository`/`getIncentive`/gating tests in `flow.test.ts`. |
