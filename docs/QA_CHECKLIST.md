# QA checklist

Mirrors spec §26 plus the Stage 2 QA scope. **[x]** = verified with the evidence shown. **[ ]** = not yet applicable (feature not built) or **not verifiable in this environment** — never ticked on assumption.

Run everything: `npm run validate` (typecheck + lint + tests), then `npm run doctor`. Visual review: `npm run web` → `/dev/design-system`, `/home`, `/leads`, … (browser render; not a device).

## Build

- [x] **TypeScript strict** — `npm run typecheck`, typed routes active.
- [x] **ESLint** — `--max-warnings=0` (includes the React-Compiler rules from `eslint-config-expo`).
- [x] **Prettier** — `npm run format:check`.
- [x] **Jest** — 338 tests, 9 suites (architecture 79 · components 62 · design-system 48 · format/selectors · previews 18 · repositories · seed · services · stores).
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
- [x] Custom bottom navigation: exactly five tabs in order, safe-area aware, selected state and unread count spoken, no re-navigation on the focused tab — tested.
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
