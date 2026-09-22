# QA checklist

Mirrors spec §26 plus the Stage 2 QA scope. **[x]** = verified with the evidence shown. **[ ]** = not yet applicable (feature not built) or **not verifiable in this environment** — never ticked on assumption.

Run everything: `npm run validate` (typecheck + lint + tests), then `npm run doctor`. Visual review: `npm run web` → `/dev/design-system`, `/home`, `/leads`, … (browser render; not a device).

## Build

- [x] **TypeScript strict** — `npm run typecheck`, typed routes active.
- [x] **ESLint** — `--max-warnings=0` (includes the React-Compiler rules from `eslint-config-expo`).
- [x] **Prettier** — `npm run format:check`.
- [x] **Jest** — 470 tests, 13 suites (screens · Vara components · architecture · session guard matrix · flow: team/sales/summary/pricing/admin · components · design-system · format/selectors · previews · repositories · seed · services · stores).
- [x] **Expo Doctor** — 21/21; `expo install --check` clean.
- [x] **Production bundles** — Android + iOS (Hermes), `__DEV__` false; only three Inter files ship.
- [ ] **Android build launches on a device/emulator** — _not verified._
- [ ] **iOS simulator launches** — _not verified (Windows host)._

## Architecture gate (still holds)

- [x] No screen/feature/component/hook imports seed or mocks; components also cannot import stores or repositories (other than contracts) — lint + `architecture.test.ts`.
- [x] Repository contracts unchanged since Stage 1.
- [x] Seed integrity and determinism — 3 scenarios.

## Stage 2 acceptance gate

- [x] Centralised design tokens — colours, spacing, type, radius, elevation, motion, theme, fonts.
- [x] **No literal radius / spacing / font size / shadow / animation duration / hex in UI code** — enforced by test (found and fixed 20 violations while building the test).
- [x] All requested primitives, buttons (5 + IconButton), form fields (8), chips, list rows (7), CRM (8), property (10), communication (5), dashboard (8) and feedback components exist — inventory in DESIGN_SYSTEM.md; each has gallery coverage.
- [x] Button states: default, pressed, disabled, loading (busy, unpressable, width-stable) — tested.
- [x] Form states: idle, focused, filled, error (text + icon + alert role), disabled — tested; PhoneField digit filter and OTPField completion — tested.
- [x] Status system: all five plot statuses render label + icon + tone with a spoken "Status: …" — tested; urgency spelled out ("Overdue · Yesterday · 6:00 PM").
- [x] `AppTabBar` component (parked with the CRM shell): five tabs in order, safe-area aware, selected state and unread count spoken; component test kept. The app itself has no tab bar (SCREEN_MAP.md).
- [x] Header system: Standard, LargeTitle, Detail, Search, Home — in the gallery.
- [x] Design-system gallery at `/dev/design-system`, dev-only (`Stack.Protected guard={__DEV__}` + redirect; test + production bundle).
- [x] Five representative compositions (Home, Leads, Projects, Tasks, Inbox) over repositories, each tested for data, empty, error and offline behaviour.
- [x] Auth UI: splash, phone login (RHF + Zod), OTP — with prototype notice.
- [x] No screen imports fixtures directly.

## Accessibility (Stage 2 scope)

- [x] Text contrast measured: primary ≥ 7:1, secondary ≥ 4.5:1, button labels ≥ 7:1, semantic colours ≥ 4.5:1.
- [ ] **`textTertiary` (#72726E) is 3.49–4.17:1 — below AA.** Restricted to non-essential text; decision pending (DESIGN_SYSTEM.md).
- [x] Tap targets ≥ 44pt token; small visuals use `hitSlop`; icon-only controls require a label.
- [x] No status by colour alone (chips, tasks, visits, notifications, plots, conversations).
- [x] **No nested interactive elements** — `PressableCard`/`CardPressRegion`; test asserts no `button` inside another. Found and fixed via a real `<button>`-in-`<button>` console error.
- [x] Two identically-named "Open" buttons on Home were given distinct names (found during testing).
- [x] Errors/toasts are `alert` regions and `accessible`.
- [x] Reduce Motion: OS setting + preference override; motion collapses to instant (hook tested; sheet/skeleton/press implement it).
- [ ] Screen-reader pass (TalkBack / VoiceOver) — _needs a device._
- [ ] Dynamic Type at real OS large sizes — capped at 1.3× in `AppText`; _needs a device._

## Layout and viewport QA (browser render)

- [x] 390×844 (iPhone-class): Home, Leads, Projects, Tasks, Inbox, Login, full gallery — screenshots reviewed.
- [x] 360×640/900 (small Android): Home, Leads, Tasks, Login — no clipped controls, no unintended horizontal overflow.
- [x] 412×915 (large Android): Home — no overflow.
- [x] Long customer name (52 chars), ₹8.5–32Cr budget, ₹123Cr plot, sold-out project, no-budget lead, no-next-action lead — in the gallery; truncate/shrink rather than overflow.
- [x] Empty, loading (skeleton), error, partial-failure and offline states — gallery + composition tests.
- [ ] Safe areas, status bar and gesture navigation on real hardware.
- [ ] Keyboard behaviour over inputs on real hardware (`KeyboardAvoidingView` is in `ScreenLayout`; not exercised without a keyboard).
- [ ] Haptics — implemented via `services/haptics` (tested to be silent when disabled and never throw); _feel needs a device._

## Visual quality gate

Answered from the rendered screenshots (a designer's eye, not a metric):

- [x] Premium and cohesive without gradients — one type family, three weights, one neutral palette, white used as the single accent.
- [x] Hierarchy obvious; information scannable — Home's first viewport answers "what next?" (today's counts → overdue banner → one elevated next-action card).
- [x] Cards not overused — metrics, sections, rows, tasks, timeline and activity are typography/dividers; surfaces only for leads, visits, projects, plots, the next action.
- [x] Status legible without colour — verified per component.
- [x] Reads as a sales tool — next actions, follow-ups and one-tap contact dominate; projects are inventory-first, not listing-portal galleries.
- [ ] Navigation "feels native" — structure/behaviour follow platform conventions; _feel needs a device._

## Known gaps

- No on-device verification yet (all "needs a device" items above).
- Call / WhatsApp / Add lead / Create cost sheet actions on the previews toast "arrives in a later stage" — deliberately honest, not wired.
- Inter renders capital "I" and lowercase "l" alike ("Ananya Iyer" ≈ "Ananya lyer").
- App icon and splash remain the Expo template placeholders.
- `react-native-web` is a dev dependency used only for visual QA.

## App-flow restructure (route tree, session, contracts)

- [x] **Session guards** — none / guest / associate / admin against every route group, plus the landing per session (`session.test.ts`).
- [x] **Route tree** — every route file exists, the CRM route files are gone, every top-level route is registered in the root layout (`architecture.test.ts`).
- [x] **Invalid phone / OTP** — a malformed number and a wrong code show an inline error and set no pending phone (`stores.test.tsx`, `services.test.ts`, browser walk). Associate login accepts any valid number (there is only one associate login, so no "wrong login" case); admin login additionally rejects any number that isn't the exact demo admin number.
- [x] **Persisted session migration** — a v1 `{status, phone}` session becomes an associate session; signed-out stays signed out (`stores.test.tsx`).
- [x] **Team / Sales / Summary** — downline levels, add member (default sponsor, deeper sponsor, duplicate, outside sponsor), booking side effects, pending states, offline (`flow.test.ts`).
- [x] **Browser walk (Chrome 390x844, `expo start --web`)** — Home to Guest / Associate; OTP; Dashboard to all 7 sections plus Profile and Settings and back; sign out; a guest session survives a reload; **0 console errors**.
- [x] **Production bundle** — `expo export --platform android` succeeds with the new tree.
- [ ] **Not verified:** a device/emulator run, Expo Doctor after the restructure, an iOS bundle.
- [x] **Senior-associate commission and the foreign-trip reward, now admin-assigned** — pure selector math (`vara-components.test.tsx`), Dashboard shows the commission tile and reward progress/"Unlocked" for the demo senior associate (sourced from their seeded `AssociateIncentive`, not a flat constant) and reads Pending under Empty CRM (`screens.test.tsx`).

## Admin surface

- [x] **Hidden admin login** — `/admin-login` is reachable by direct URL and not linked from `/home`; only the exact demo admin number is accepted (unlike associate login's "any valid number"), the wrong number or a malformed one is rejected without a pending phone (`authStore`/`AdminLoginScreen`).
- [x] **AdminRepository** — `listAssociates` (role-filtered), `promoteToSeniorAssociate` (idempotent, `NOT_FOUND` for an unknown id), `assignIncentive` (upserts, `INVALID_INPUT` for a non-senior target, `NOT_FOUND` for an unknown associate) — `flow.test.ts`.
- [x] **`SalesRepository.getIncentive`** — `READY` with the seeded values for the demo senior associate, `PENDING` once their record is removed — `flow.test.ts`.
- [x] **Add Team Member gated to Senior Associates** — `MockTeamRepository.addMember` rejects `INVALID_INPUT` for a non-senior caller (`flow.test.ts`); the Dashboard's "Add Team Member" row and `AddMemberScreen` itself are hidden/blocked for a non-senior associate (verified by code inspection — the same `isSeniorAssociate` gate already proven correct for the commission/reward panels — and by browser walk, not by an automated screen-render test).
- [ ] **Known gap, by design:** no automated screen-render test proves the Add Team Member gate is invisible to a non-senior associate. `screens.test.tsx` renders against the app's single shared `@/repositories` singleton with no seam to swap which user is "current," and there is no demote capability to make the demo associate non-senior for a test. The repository-level rejection is the real enforcement and is tested; this is a manual-QA item until the test harness gains dependency injection.

## Vara light theme, brand and screens

- [x] **Contrast** — the light palette is measured in `design-system.test.ts`: primary text AAA, secondary and tertiary text AA on every page and surface, white on ink AAA, charcoal-surface text AAA/AA, `brandStrong` and every semantic colour AA on page, cards and tiles.
- [x] **Shadows** — soft and wide only (≤ 25% opacity, ≥ 16 blur); flat surfaces and tiles have none.
- [x] **Icon vocabulary** — one glyph per meaning, no shared glyphs (`vara-components.test.tsx`).
- [x] **Motion** — `Reveal`, count-up, progress, dock spring, radio check, success mark: all instant with Reduce Motion (tested), all tokenised (architecture test forbids literal durations).
- [x] **Screens over the real repositories** (`screens.test.tsx`) — Home (numbers, radio cards, offline), guest hub, dashboard (numbers, mask, **pending** in Empty CRM, menu, error → recovery), projects filter, team (levels, validation, duplicate phone, add), team sales (progress bars), visits filter, calculator (total, digits only), booking (validation → confirm → success; a booked plot is refused).
- [x] **Dock** — four tabs in order, one selected, shown only on the four top-level routes.
- [x] **Browser walk (Chrome 390×844)** — guest path; associate login; hide figures; menu sheet; all seven sections and back; dock; calculator; **live booking → success → the sale appears in Team Sales**; **add member → appears in My Team (10 members)**; sign out. **0 console errors.** Screenshots in `docs/screenshots/`.
- [x] **Brand** — "Vara Real Estates" in the app name, wordmark and icons; app icon, adaptive icon, splash and favicon regenerated from the vector mark.
- [ ] **Not verified:** a device/emulator run (haptics, fonts on device, keyboard, safe areas), Expo Doctor and an iOS bundle after the redesign, a screen-reader pass.
