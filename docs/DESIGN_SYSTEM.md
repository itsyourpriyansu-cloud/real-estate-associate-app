# Design system

The visual and interaction language of the app: premium, dark-first, monochrome, tactile, typography-driven. Inspired by the _principles_ behind CRED's design (beauty and utility together, rigour, restraint, honest data). No CRED logo, font, asset, screen or animation is used or copied.

**Where things live**

| Layer                                         | Location                                                                                                    | Owner                     |
| --------------------------------------------- | ----------------------------------------------------------------------------------------------------------- | ------------------------- |
| Tokens                                        | `src/design-system/` (`colors`, `spacing`, `typography`, `radius`, `elevation`, `motion`, `theme`, `fonts`) | 02 Design System Guardian |
| Primitives                                    | `src/components/primitives/`                                                                                | 02                        |
| Controls (buttons, forms, chips, lists)       | `src/components/{buttons,forms,chips,lists}/`                                                               | 02                        |
| Feedback (states, sheets, toast, skeletons)   | `src/components/feedback/`                                                                                  | 02                        |
| Shell (tab bar, headers)                      | `src/components/navigation/`                                                                                | 04 Navigation             |
| Patterns (screen template, resource boundary) | `src/components/patterns/`                                                                                  | 02                        |
| Domain components                             | `src/components/domain/{crm,property,communication,dashboard}/`                                             | 05 / 06 / 07              |
| Live catalogue                                | `/dev/design-system` (development builds only)                                                              | 02                        |

> The brief suggested `design-system/{tokens,primitives,components,patterns}`. The master spec (§6) and Stage 1 already fix tokens at `src/design-system/*.ts` and components under `src/components/*`, so the layers were mapped onto that structure rather than creating two competing homes. Import everything from `@/components` or `@/design-system`.

## Philosophy

1. **Hierarchy comes from typography, spacing and contrast — not from boxes.** Page → section → rows. A surface is used only where grouping helps comprehension. No card inside a card inside a card.
2. **White is the accent.** Because the palette is monochrome, the one bright thing on a screen (the primary button, the selected chip, the unread count, the active tab) is the thing that matters. It is used deliberately and rarely.
3. **Colour is state, never decoration.** Green/amber/red/blue mark inventory and task state on small marks (dot, icon, label). Nothing is a coloured panel or gradient.
4. **Status is always icon + label + tone.** Never colour alone.
5. **Motion confirms; it never decorates.** Short, springy, quiet, and off when Reduce Motion is on.
6. **Numbers are the product.** Prices, sizes and counts are tabular, large where they matter, and never overflow.

## Tokens

Everything visual comes from a token. ESLint bans hex literals in UI code, and `architecture.test.ts` fails on any literal radius, spacing, font size, shadow or animation duration in `app/`, `src/features/` or `src/components/`. Component _dimensions_ (a 44pt target, a 26px checkbox) are allowed; the scales are not.

### Colour

| Group      | Tokens                                                                                                                    |
| ---------- | ------------------------------------------------------------------------------------------------------------------------- |
| Background | `backgroundPrimary #070707` · `backgroundSecondary #0D0D0D` · `backgroundTertiary #121212`                                |
| Surface    | `surfacePrimary #111111` · `surfaceSecondary #171717` · `surfaceElevated #1D1D1D` · `surfacePressed #232323`              |
| White      | `whitePrimary #F7F7F5` · `whiteSecondary #E8E8E5`                                                                         |
| Text       | `textPrimary #F5F5F3` · `textSecondary #A7A7A2` · `textTertiary #72726E` · `textDisabled #51514E` · `textInverse #070707` |
| Border     | `borderSubtle` / `borderMedium` / `borderStrong` = white at 8% / 14% / 22%                                                |
| Semantic   | `success #70D7A0` · `warning #E8C26A` · `danger #F07A7A` · `info #8BAFE8` (+ `*Muted` 12% tints for chip backgrounds)     |
| Utility    | `highlightTop` (top-edge hairline) · `scrim` · `transparent`                                                              |

`toneColors` maps a tone (`neutral | success | warning | danger | info`) to `{fg, bg, border}`. Semantic colours are for: available plot / confirmed / completed (success); follow-up due / on hold / attention (warning); overdue / blocked / error / destructive (danger); info only when genuinely useful.

**Measured contrast (tested in `design-system.test.ts`, WCAG 2.x):**

| Pair                                                         | Result                     |
| ------------------------------------------------------------ | -------------------------- |
| `textPrimary` on every background/surface                    | ≥ 7:1 (AAA)                |
| `textSecondary` on every background/surface                  | ≥ 4.5:1 (AA)               |
| `textInverse` on `whitePrimary` / `whiteSecondary` (buttons) | ≥ 7:1 (AAA)                |
| `success` / `warning` / `danger` / `info` on page and cards  | ≥ 4.5:1 (AA)               |
| **`textTertiary` on surfaces**                               | **3.49–4.17:1 — below AA** |

`#72726E` is the brief's value for tertiary text and it does not reach 4.5:1. The system therefore treats it as **non-essential only**: input placeholders, a decorative chevron, completed-task text (which is also struck through and ticked), zero counts. Timestamps, counts, hints and metadata use `textSecondary`. If you want tertiary usable for real information, lighten it: `#8A8A85` measures 4.86–5.81:1 on every surface (AA); this is flagged for your decision.

### Typography

Inter, **three weights only** (Regular / Medium / SemiBold). There is no Bold, so "never more than three weights on a screen" holds by construction, and restraint is the default. Sizes carry the hierarchy; large sizes get slight negative tracking.

| Token                            | Size / line                   | Weight                | Use                                                 |
| -------------------------------- | ----------------------------- | --------------------- | --------------------------------------------------- |
| `displayLarge` / `displayMedium` | 40/44 · 32/38                 | SemiBold              | Auth headlines                                      |
| `headingXL` / `LG` / `MD` / `SM` | 26/32 · 22/28 · 18/24 · 16/22 | SemiBold              | Page titles, section titles, card titles            |
| `bodyLG` / `MD` / `SM`           | 16/24 · 14/20 · 13/18         | Regular               | Text                                                |
| `labelLG` / `MD` / `SM`          | 14/18 · 12/16 · 11/14         | Medium                | Row titles, meta; `SM` is the uppercase micro-label |
| `caption`                        | 11/15                         | Regular               | Timestamps                                          |
| `metricXL` / `LG` / `MD`         | 36/40 · 28/32 · 20/24         | SemiBold, **tabular** | Prices, counts, times                               |
| `tabLabel`, `buttonLG` / `MD`    | 11/14 · 16/20 · 14/18         | Medium / SemiBold     | Tab bar, buttons                                    |

`AppText` is the only text component. It sets the style and colour from tokens, caps Dynamic Type at 1.3× so dense rows survive large text, and offers `uppercase` (micro-labels and status only — never paragraphs) and `header`.

### Spacing, radius, elevation

- **Spacing** is keyed by pixel value: `space[16]` = 16. Scale `2 4 6 8 12 16 20 24 32 40 48 64`. Page gutter **20**; section gap **32** (40 for large); min tap target **44**.
- **Radius**: `xs 6 · sm 10 · md 14 · lg 18 · xl 24 · pill`. Controls stay tight (`sm`); larger radii only for major surfaces.
- **Icons**: lucide only, 1.75 stroke, `iconSize` `sm 16 · md 18 · lg 20 · xl 22 · hero 28`. `Icon` is the only wrapper.
- **Elevation** = tonal step + hairline border (+ top-edge highlight). `flat`, `raised`, `elevated`, and `overlay` — the **only** one allowed a shadow, and a soft one. Tested.

### Deliberate departures from master spec §9

Your Stage 2 brief supersedes the Stage 1 values: new palette names/values, new type names (`headingXL`, `metricLG`, …) and sizes, radius `6/10/14/18/24`, spacing keyed by pixels (was index-keyed), and **Bold removed**. `space[5]` from Stage 1 is now `space[20]`. No compatibility aliases were kept — one system only.

## Surfaces and layout

`ScreenLayout` is the template every screen uses:

```text
SafeArea → Header → Scrollable content (20px gutter, 32px between sections) → Sticky action → (Tab bar)
```

Content is capped at 640px and centred on wide viewports; the sticky action respects the bottom inset; the keyboard pushes content up. Tab screens use `edges=['top']` (the tab bar owns the bottom inset); pushed screens use `['top','bottom']`.

Prefer, in this order: **typography → spacing → hairline divider → tonal surface → bordered card.** `Section`, `MetricStrip` and `ListRow` exist so that pages read as lists and typography, not stacks of rectangles.

## Buttons

One hierarchy per screen. `Button` (also `PrimaryButton`, `SecondaryButton`, `TertiaryButton`, `DangerButton`) and `IconButton`.

| Variant   | Look                          | Use                                             |
| --------- | ----------------------------- | ----------------------------------------------- |
| Primary   | Solid white, dark label       | The single main action on a screen              |
| Secondary | `surfaceElevated` + border    | Alternative actions                             |
| Tertiary  | No surface                    | Low-emphasis (Cancel, Open)                     |
| Danger    | Red-tinted surface, red label | Destructive only — always behind a confirmation |

Sizes `large 52` / `medium 44` / `small 36` (small still has a 44pt hit area). States: default, pressed (spring 0.98 + surface shift), **disabled** (an inert dark surface with disabled text — not a dimmed white slab), **loading** (spinner replaces the label but the label stays laid out, so the width never jumps; presses are blocked; `busy` is exposed). `IconButton` is 44×44 and **requires** an `accessibilityLabel`; a `badgeCount` is folded into its spoken name.

## Forms

`TextField`, `SearchField`, `PhoneField`, `OTPField`, `TextArea`, `SelectField`, `DateField`, `TimeField` — all built on `FieldFrame` so states cannot drift apart.

States: **idle · focused · filled · error · disabled.** 16px text (no iOS zoom), 52pt height, the whole surface focuses the input. **Errors are text with an icon**, announced as an alert — never only a red border. `PhoneField` keeps digits only (cap 10, shows +91). `OTPField` is six cells over one hidden input, so paste and SMS autofill work. `SelectField`, `DateField` and `TimeField` open a bottom sheet (dates come from the Clock, so demo mode offers "Today"). Forms are wired with React Hook Form + the shared Zod schemas (see `PhoneLoginForm`).

## Chips and status

| Component                       | Purpose                                                             |
| ------------------------------- | ------------------------------------------------------------------- |
| `FilterChip`                    | Selectable filter; selected = solid white; optional count           |
| `ChoiceChip`                    | Form choice; selection shown by border + tick + tonal lift          |
| `StatusChip`                    | Non-interactive label; tone + optional icon                         |
| `LeadPriorityChip`              | HOT is the only priority that draws colour (attention required)     |
| `LeadStageChip`                 | Won ✓ / Lost ✗ carry a tone and icon; other stages are neutral text |
| `PlotStatusBadge`, `PlotLegend` | All five plot statuses                                              |

**Status language (never colour alone):** Available = dot, On hold = clock, Booked = check, Blocked = lock, Not for sale = minus — each with its label. `plotStatusTokens` is typed `Record<PlotStatus, …>`, so adding a status without a token is a compile error. Urgency reads the same way: overdue says "Overdue" with an alert icon; due-today is amber with a clock (`utils/schedule.ts`).

## Motion

Reanimated 4. Tokens: `instant 80 · fast 140 · standard 220 · slow 320` ms; springs `press`, `sheet`, `settle` (near-critically damped — no bounce).

| Animated                            | How                                                                          |
| ----------------------------------- | ---------------------------------------------------------------------------- |
| Press (buttons, cards, chips, rows) | Spring scale (button .98, card .985, chip .96, icon .9) + surface change     |
| Tab indicator                       | Fade + scale, 140ms                                                          |
| Bottom sheet                        | Spring in (no bounce), slide out; scrim fades with the drag; drag-to-dismiss |
| Toast                               | Fade + 16px rise, 220ms, auto-dismiss 2.8s                                   |
| Toggle                              | Thumb slide, 140ms                                                           |
| Skeleton                            | Slow opacity pulse                                                           |

Not animated: list items on render, screen content, metrics. **Reduce Motion**: `useReducedMotion()` honours the OS setting unless `preferencesStore.reduceMotion` forces `on`/`off`; when reduced, scales are skipped, durations are 0, the sheet appears without movement and skeletons are static. State changes and haptics still happen.

## Haptics

Through `services/haptics` only (preference-aware, never throws). `light` — card/row/quick-action press, tab change; `selection` — chip, plot tile, toggle, picker choice; `medium` — task completed, destructive confirm; `success` — accepted OTP, success toast; `warning`/`error` — rejected input, error toast. Never continuous; never on scroll.

## Accessibility

- Every interactive element ≥ 44pt (`layout.minTapTarget`); smaller visuals get `hitSlop`.
- Icon-only controls must be named (`IconButton` requires it). Cards expose one descriptive name ("Rahul Sharma. Hot priority. Visit. ₹40–55L. Next: …").
- **No nested interactive elements.** `PressableCard` + `CardPressRegion` make the open-target a _sibling_ of Call / WhatsApp / Share buttons; a test asserts no `button` exists inside another. (This also removed invalid `<button>` nesting on web.)
- Unread, selected, checked, busy, disabled and delivery state are exposed as accessibility state or spoken in the label — never a dot alone.
- Errors and toasts are `alert` regions; empty/error copy is written for people.
- Dynamic Type is allowed up to 1.3×; long names truncate with an ellipsis, large amounts shrink (`adjustsFontSizeToFit`) rather than overflow.
- Contrast is measured (see Colour). `textTertiary` is the known exception.

## Copy

Concise and human. `Couldn't load your leads` (not `FETCH ERROR`); `No follow-ups scheduled` / `Nothing scheduled yet` (not `NO DATA`); `Visit marked complete.` (not `TRANSACTION SUCCESS`). Empty states say what is missing and what to do. Error states reassure ("Your prototype data is still safe.") and never show raw errors.

## Usage rules

1. Import tokens from `@/design-system` and components from `@/components`. Never hard-code a colour, radius, gap, padding, font size, shadow or duration.
2. Text is `AppText`; press is `PressableScale` / `PressableCard`; icons are `Icon`; layout gaps are `Stack`/`Row` with a token `gap`.
3. A screen has one Primary button. Destructive actions use `ConfirmationSheet`.
4. Wrap repository data in `ResourceBoundary` so loading (skeleton), error (recoverable), empty and success are all handled.
5. Format with `utils/format.ts` (₹, sq yd, dates relative to the Clock) — never inline. Dates come from the Clock via `useNow()`, never `new Date()`.
6. Screens and features never import raw RN `Text`/`Pressable`/`Switch`/`TextInput` (tested).
7. New component? Add it to the gallery and a test first.

## Anti-patterns (reject in review)

Card in card in card · a coloured panel or gradient · a status shown only by colour · a red border as the only error signal · a button inside a button · a lone full-screen spinner · more than one Primary · a shadow on a non-overlay · a one-off radius/spacing value · `textTertiary` for real information · uppercase paragraphs · animating every list item · a generic silhouette avatar · "No data found".

## Component catalogue

103 exports across the layers (see the gallery for each in every state):

- **Primitives (18):** `AppText`, `Icon`, `IconContainer`, `Avatar`, `CountBadge`, `Surface`, `Stack`, `Row`, `Spacer`, `Divider`, `PressableScale`, `PressableCard`/`CardPressRegion`, `Toggle`, `ScreenContainer`, `SafeScreen`, `Section`, `SectionHeader`.
- **Buttons (6):** `Button`, `PrimaryButton`, `SecondaryButton`, `TertiaryButton`, `DangerButton`, `IconButton`.
- **Forms (9):** `TextField`, `SearchField`, `PhoneField`, `OTPField`, `TextArea`, `SelectField`, `DateField`, `TimeField`, `FieldFrame`.
- **Chips (5):** `FilterChip`, `ChoiceChip`, `StatusChip`, `LeadStageChip`, `LeadPriorityChip`.
- **Lists (7):** `ListRow`, `ActionRow`, `SettingRow`, `MetricRow`, `TimelineRow`, `ActivityRow`, `NotificationRow`.
- **Feedback:** `Toast` (`ToastProvider`, `useToast`), `InlineError`, `EmptyState`, `LoadingState` + skeletons, `OfflineBanner`, `RepositoryErrorState`, `ConfirmationSheet`, `ActionSheet`, `BottomSheet`.
- **Navigation:** `AppTabBar`, `StandardHeader`, `LargeTitleHeader`, `DetailHeader`, `SearchHeader`, `HomeHeader`.
- **Patterns:** `ScreenLayout`, `ResourceBoundary`.
- **CRM:** `LeadCard`, `LeadStageIndicator`, `LeadSummary`, `NextActionCard`, `TaskCard`, `VisitCard`, `TimelineEventRow`, `ContactActionBar`.
- **Property:** `ProjectCard`, `ProjectHero`, `ProjectImage` (monochrome site-plan artwork — no image files), `PropertyMetric`, `InventorySummary`, `PlotCard`, `PlotStatusBadge`, `PlotLegend`, `PropertyMatchCard`, `PriceSummary`.
- **Communication:** `ConversationRow`, `MessageBubble`, `WhatsAppTemplateCard`, `QuickReplyChip`, `UnreadBadge`.
- **Dashboard:** `MetricBlock`, `MetricStrip`, `SectionHeader`, `QuickAction`, `PipelineSummary`, `ProgressMeter`, `PerformanceSummary`, `AttentionBanner`.

`PlaceholderScreen` (feedback) still backs routes whose real screens arrive later; it now sits on the real system and is deleted when the last placeholder route is replaced.

## The gallery

`/dev/design-system` renders everything above — typography, colour, spacing/radius/elevation, every button variant × size × state, every field state, chips, lists, CRM/property/communication/dashboard components (including a 52-character name, ₹8.5–32Cr budgets, ₹123Cr plots, sold-out projects, overdue/no-next-action leads), empty/error/offline/partial states, skeletons, sheets, toasts and headers — on data read through repositories. It is registered under `Stack.Protected guard={__DEV__}` and redirects home when `__DEV__` is false, so it is absent from production builds (a test asserts this; production bundles were built to confirm). Open it from Prototype controls, or go to `/dev/design-system` in the dev server.

## Visual QA

Review screenshots (browser renders at 390×844, 2×) are in [`docs/screenshots/`](screenshots): `home`, `leads`, `projects`, `tasks`, `inbox`, `login`, `bottom-sheet`, and the first two screens of the gallery (`gallery-1`, `gallery-2`).

The UI was reviewed by rendering the real app through `react-native-web` in Chrome (390×844, 360×640/900, 412×915) and inspecting screenshots of every tab, login and the whole gallery. That process found and fixed: nested buttons, a wrapping time column, a heavy disabled-primary, a teal web switch, crisp-vs-dim completed ticks, dimmed display-only pipeline counts, artwork cropping, hyphen breaks in metric labels, and a browser focus ring inside inputs. It is **not** a substitute for a device run: fonts, haptics, safe areas, keyboard behaviour and gesture feel still need on-device verification.
