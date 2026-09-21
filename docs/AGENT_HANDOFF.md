# Agent handoff

Every handoff **must** update this file. Rules (spec §23): agents do not create competing design tokens, do not bypass repository contracts, do not add dependencies without architect approval (record it in ARCHITECTURE.md §7), and leave the project compiling with `npm run validate` green.

Start here: [README.md](../README.md) → [ARCHITECTURE.md](ARCHITECTURE.md) → [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) → this file. Agent rules are also in `AGENTS.md` at the repo root.

## Current state

**Stage 2 — Design system + UI foundation + app shell: complete and validated. Stage 3 is _not_ authorised until the Stage 2 report is reviewed.**

| Gate                                                                     | Result                                      |
| ------------------------------------------------------------------------ | ------------------------------------------- |
| TypeScript strict (typed routes active)                                  | pass                                        |
| ESLint `--max-warnings=0`                                                | pass                                        |
| Jest                                                                     | 338 tests / 9 suites pass                   |
| Expo Doctor                                                              | 21/21                                       |
| Production bundles (Android + iOS, `__DEV__` false)                      | pass                                        |
| Web render of every tab, login and the full gallery (390, 360, 412 wide) | reviewed via screenshots; no console errors |
| **Run on a physical device / emulator**                                  | **not done** — first task of the next stage |

Stage 1 (architecture) remains intact: repository contracts are unchanged, no screen imports seed data (lint + test), `npm run validate` was green at every step.

## Component ownership (Stage 2)

| Area                                                                               | Owner                     | Path                                                                         |
| ---------------------------------------------------------------------------------- | ------------------------- | ---------------------------------------------------------------------------- |
| Tokens, fonts, theme                                                               | 02 Design System Guardian | `src/design-system/`                                                         |
| Primitives, buttons, forms, chips, lists                                           | 02                        | `src/components/{primitives,buttons,forms,chips,lists}/`                     |
| Feedback: states, sheets, toast, skeletons                                         | 02                        | `src/components/feedback/`                                                   |
| Patterns: `ScreenLayout`, `ResourceBoundary`                                       | 02                        | `src/components/patterns/`                                                   |
| Tab bar, headers, root layout, auth UI and forms                                   | 04 Navigation / Shell     | `src/components/navigation/`, `app/_layout.tsx`, `src/features/auth/`        |
| Lead / task / visit / timeline / dashboard components; Home, Leads, Tasks previews | 05 CRM                    | `src/components/domain/{crm,dashboard}/`, `src/features/{home,leads,tasks}/` |
| Project / plot / inventory / pricing components; Projects preview                  | 06 Property               | `src/components/domain/property/`, `src/features/projects/`                  |
| Conversation / message / template / badge components; Inbox preview                | 07 Communication          | `src/components/domain/communication/`, `src/features/inbox/`                |
| Formatters, urgency, labels; all component/composition/architecture tests; gallery | 08 QA                     | `src/utils/`, `__tests__/`, `src/features/dev/`                              |

Rule: a component has exactly one owner. To change another owner's component, extend it through a prop (and its test) rather than forking a variant.

## Reference implementations

- **Data → screen:** `HomePreview` ← `useHomeData` (repositories via `Promise.all`) ← pure `buildHomeData` selector (`features/home/homeData.ts`, unit-tested). The component never sees a repository, a seed or a `Date`.
- **Four states:** wrap any resource in `ResourceBoundary` (skeleton → recoverable error → human empty state → content). See `LeadsPreview` (per-filter empty copy) and the retry test in `previews.test.tsx`.
- **Real mutation with feedback:** `TasksPreview` → `taskRepository.complete` → toast → refetch of list and counts.
- **Forms:** `PhoneLoginForm` (React Hook Form + shared Zod schema + loading + error text) and `OtpForm`.

## Findings that change plans

1. **Contrast:** the brief's `textTertiary` (#72726E) is 3.49–4.17:1 — below AA. It is restricted to non-essential text. Decision needed (DESIGN_SYSTEM.md → Colour).
2. **Next-action rule:** the spec's Home sample shows Rahul Sharma; seeded data has an earlier task (Ananya, 9:30, NORMAL lead). Home now ranks _hottest lead first among tasks due today_ (`pickNextAction`), which yields Rahul. Confirm this is the rule you want.
3. **Numbers differ from the brief's examples** because previews read the seed: Real Rise is ₹26.8L onwards with 21 of 36 plots available (not "₹32L / 137"); Rahul's follow-up is 10:30 AM (not 4:30 PM). Plot 26 displays as ₹44.1L (one-decimal lakh precision).
4. **Bold weight removed** so the three-weight rule is structural.

## Briefs for the next stages

### Stage 3 — Shell completion + auth screens (04 Navigation)

The tab bar, headers, login and OTP exist. Remaining: onboarding shell, wire header actions on every tab (search / notifications / profile — currently only Home has them), Profile and Settings screens on `SettingRow`/`ActionRow` (+ "Reset demo data" via `prototypeStore.resetData()`), Prototype Controls UI (scenario, clock, latency, reset) — the state and `Toggle`/`SelectField` exist. **First on-device run** (Expo Go, Android first): verify Inter, haptics, safe areas, the keyboard over `PhoneField`/`OTPField`, `Stack.Protected` redirects, the sheet drag gesture and the tab bar height.

### Stage 4 — CRM (05 CRM)

Replace the previews with real screens using the existing components: Lead detail (`LeadSummary`, `LeadStageIndicator`, `ContactActionBar` in `stickyAction`, `TimelineEventRow`), Visit detail, full Tasks. Call/WhatsApp/Add lead currently toast "arrives in a later stage" — wire them or keep them honest. Add stale-while-revalidate to `useAsyncResource` so the Offline banner is truthful. Consider `FlatList` virtualisation once lists grow (18 leads render fine today).

### Stage 5 — Property (06 Property)

Inventory screen (grid of `PlotCard`, `PlotLegend`, filters in a `BottomSheet`), Plot detail (`PriceSummary`, Prototype Hold via `ConfirmationSheet`), property-matching pure function → `PropertyMatchCard`. Replace `placeholder://` art with real images when they exist (`ProjectImage` already handles URLs via `expo-image`).

### Stage 6/7 — Communication, search, notifications

`WhatsAppService`, templates (`WhatsAppTemplateCard`, `QuickReplyChip`), conversation detail (`MessageBubble` + composer), Notifications and Search screens (`NotificationRow`, `SearchHeader`).

### Stage 8 — QA hardening

Device matrix, accessibility audit with a real screen reader, reduced-motion pass, prototype-controls walkthrough, delete `PlaceholderScreen`.

## Open questions for the reviewer

1. **Tertiary text colour:** keep #72726E (restricted use) or adopt `#8A8A85` (AA)?
2. **Next-action ranking** (finding 2).
3. **Web dev dependency:** `react-native-web` was added as a devDependency solely so the UI can be rendered in a browser for visual QA (`npm run web`). Remove it if you prefer a strictly native tree; visual review would then need a device.
4. **Five Stage 1 "unused" dependencies are now used** (Reanimated, worklets, expo-image, React Hook Form, resolvers).
5. **Inter "I" vs "l":** in Inter's default glyphs a capital I and lowercase l look alike ("Ananya Iyer" reads "Ananya lyer"). Fixable with Inter's disambiguation feature via a custom font build, or by switching to a face with a slab-serif I. Cosmetic; noting it.

## Handoff log

| Date       | From → To                      | Summary                                                                                                               |
| ---------- | ------------------------------ | --------------------------------------------------------------------------------------------------------------------- |
| 2026-09-19 | Stage 1 (all roles) → reviewer | Architecture, tokens, schemas, contracts, mocks, seed, services, stores, route skeleton, tests, docs.                 |
| 2026-09-19 | Stage 2 (all roles) → reviewer | New tokens; 103 components; custom tab bar + headers; auth UI; 5 representative compositions; dev gallery; 338 tests. |
