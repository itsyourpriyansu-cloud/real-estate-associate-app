# Agent handoff

Every handoff **must** update this file. Rules (spec §23): agents do not create competing design tokens, do not bypass repository contracts, do not add dependencies without architect approval (record it in ARCHITECTURE.md §7), and leave the project compiling with `npm run validate` green.

Start here: [README.md](../README.md) → [RUN_THE_PROTOTYPE.md](RUN_THE_PROTOTYPE.md) → [ARCHITECTURE.md](ARCHITECTURE.md) → [SCREEN_MAP.md](SCREEN_MAP.md) → [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) → this file. Agent rules are also in `AGENTS.md` at the repo root.

## Current state

**Vara Real Estates prototype: the whole "Android APP Flow" is built and working on seed data, in a new light design system. Verified in a browser; not yet on a device.**

| Gate                                              | Result                                                                                                       |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| TypeScript strict (typed routes regenerated)      | pass                                                                                                         |
| ESLint `--max-warnings=0`                         | pass                                                                                                         |
| Jest                                              | 449 tests / 13 suites pass                                                                                   |
| Android production bundle                         | pass (`expo export`, re-run after the redesign)                                                              |
| Browser walk, Chrome 390×844 (`expo start --web`) | pass, **0 console errors** (guest path, login, dashboard, all seven sections, booking, add member, sign out) |
| Expo Doctor / iOS bundle after the redesign       | not re-run                                                                                                   |
| **Run on a physical device / emulator**           | **not done**                                                                                                 |

### What exists

- **Flow** — public Home (numbers + three radio cards + Login) → Guest / Associate / Simple login (phone + OTP) → guest hub → Our Projects (list, project, inventory, plot) **or** the associate dashboard: hero card, performance panel with **Pending** states, seven section rows, and a floating dock (Home · Projects · Team · Profile). Sections: Our Projects, **Live Booking** (pick plot → customer → confirm → success), **Price Calculator**, **Site Visits History** (+ detail), **Team Sales** (month vs target, top sellers, sales), **Add Team Member**, **My Team** (+ member detail). Also Profile, Settings, Prototype controls. Route/screen map: [SCREEN_MAP.md](SCREEN_MAP.md).
- **Design system** — light theme with a green accent, ink actions, a charcoal hero card and dock, generous radii, soft shadows, tokenised motion, an icon vocabulary and the Vara brand mark. Full reference: [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md).
- **Data layer** (from the previous pass) — session kinds (`none|guest|client|associate`), 11 repository contracts with mocks, seed v2 (19 users, 20 sales, targets, project statuses). Booking a plot flips it to `BOOKED`, adds a `Sale`, and the plot, project counts, summaries and sales lists all follow (tested).
- **CRM parked** — Leads, Tasks, Inbox, notifications, search and their route files were removed from `app/`; the features, components, repositories and tests remain (they navigate through `utils/parkedRoutes.ts`).

### What changed in this pass

1. **Tokens** — `colors` rewritten (light palette + ink/inverse/brand groups; `whitePrimary`/`whiteSecondary` → `inkPrimary`/`inkSecondary`), `radius` `8/12/16/20/28`, `elevation` gained `tile` and `inverse` and soft shadows on cards, `motion` gained `enterMs`, `staggerStep`, `countUpMs`, `progressFillMs`, `successRingMs`; `layout` gained `dockHeight`/`dockOffset`. `Tone` gained `brand`.
2. **Components** — new: `BrandMark`/`Wordmark`, `icons`, `Reveal`, `AnimatedNumber` (+ `useCountUp`), blocks (`HeroCard`, `SummaryPanel`/`StatTile`, `NavPanel`/`NavRow`, `ActionTile`, `LoginOptionCard`, `ProgressBar`), `AssociateDock` + `DockContext`, `AppHeader`, `ChipRow`, `SuccessMark`, `TeamMemberRow`, `SaleRow`, `VisitHistoryRow`. Restyled: buttons (pills), fields (white, green focus), chips, toggle (green), avatar, count badge, plot/project cards, headers.
3. **Screens** — every route in the flow (see above), each with loading / error / empty / success handled by `ResourceBoundary`, staggered entrance and reduced-motion support.
4. **Brand** — company name "Vara Real Estates" (app name, wordmark); icon, adaptive icon, splash and favicon PNGs generated from the vector mark.
5. **Preferences** — `hideFigures` (the eye on the hero card).
6. **Tests** — `screens.test.tsx` (screens over the real repositories), `vara-components.test.tsx` (new components, dock helper, sales selectors), design-system contrast/shadow/motion tests rewritten for the light theme, stores/architecture tests updated.
7. **Docs** — new [RUN_THE_PROTOTYPE.md](RUN_THE_PROTOTYPE.md); DESIGN_SYSTEM, SCREEN_MAP, ARCHITECTURE (deviations 23–27), QA_CHECKLIST and README updated; screenshots in `docs/screenshots/` replaced.

### Known limits (deliberate)

- **Not run on hardware.** Haptics, fonts on device, keyboard over the phone/OTP fields, safe areas, the dock and sheet gestures need a device pass — the first task of the next stage.
- `MockUserRepository.getCurrent()` returns **the first ASSOCIATE** in the seed whichever associate number signed in (an API resolves it from the token). Signing in with the team lead's number still shows Raghunath's data.
- **Sales units.** The wireframe is ambiguous ("Team Total Sales" equals registered sq. yards). The dashboard headlines the registered **sq. yards** and shows team and personal sales as **₹ value** with plots and sq. yards as captions.
- **Team site visits** counts the associate's own visits (visits are lead-bound); a per-member visit history is not modelled.
- **Auth is phone + OTP** (a product decision), not the wireframe's User ID + Password; a known number on the wrong login is refused, unknown numbers are accepted for either.
- `SuccessMark`, `ProgressBar` and the dock spring were reviewed in a browser, not on a device; tune springs on hardware.
- The Android adaptive-icon foreground and monochrome layers are the bare "V" (safe-zone sized); check them against a launcher mask.
- `PlaceholderScreen`, `AppTabBar`, `HomeHeader` and the CRM components are still exported (parked); delete what you do not re-attach.
- Project imagery is the generated site-plan artwork (no photos). Notifications, search and WhatsApp are out of this flow.

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
5. **Optional:** dark theme as a second palette (the token layer is centralised; the components read tokens only), real project photography, per-member visit history, re-attach the CRM, replace the mocks with FastAPI repositories (the contracts are the seam).

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
