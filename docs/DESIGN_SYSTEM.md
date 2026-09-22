# Design system — Vara Real Estates

The visual and interaction language of the app: **light, soft, premium, minimal.** A pale grey page, white rounded cards, near-black ink for actions, one charcoal "inverse" surface for the hero card and the floating dock, and a single calm green accent. It was reshaped from a dark monochrome system after a fintech-wallet reference (soft cards, big radii, a floating pill dock, a dark hero card) — the _principles_ were adopted, no assets or brand were copied.

**Where things live**

| Layer                                         | Location                                                                                                                              |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Tokens                                        | `src/design-system/` (`colors`, `spacing`, `typography`, `radius`, `elevation`, `motion`, `theme`, `fonts`)                           |
| Icon vocabulary                               | `src/components/primitives/icons.ts` (`icons.<meaning>`)                                                                              |
| Primitives                                    | `src/components/primitives/` (`AppText`, `Icon`, `Surface`, `PressableScale`, `Reveal`, `AnimatedNumber`, `BrandMark`, …)             |
| Controls (buttons, forms, chips, lists)       | `src/components/{buttons,forms,chips,lists}/`                                                                                         |
| **Blocks** (the Vara composition pieces)      | `src/components/blocks/` (`HeroCard`, `SummaryPanel`/`StatTile`, `NavPanel`/`NavRow`, `ActionTile`, `LoginOptionCard`, `ProgressBar`) |
| Feedback (states, sheets, toast, skeletons)   | `src/components/feedback/` (+ `SuccessMark`)                                                                                          |
| Shell (dock, headers)                         | `src/components/navigation/` (`AssociateDock`, `AppHeader`, `Headers`)                                                                |
| Patterns (screen template, resource boundary) | `src/components/patterns/`                                                                                                            |
| Domain components                             | `src/components/domain/{property,team,crm,communication,dashboard}/`                                                                  |
| Live catalogue                                | `/dev/design-system` (development builds only)                                                                                        |

Import everything from `@/components` or `@/design-system`.

## Philosophy

1. **Hierarchy comes from spacing, size and contrast** — then from soft white surfaces. One idea per card; no card inside a card inside a card.
2. **Ink is the action colour.** The primary button, the selected filter, the dock are near-black. It is the one heavy thing on a light screen, so it is used once per screen.
3. **Green is the only accent, and it is quiet.** It marks progress, selection, success and small brand touches (icon tiles, avatar initials, the toggle). It is never a wash and never a gradient.
4. **The charcoal card is the exception.** Each screen has at most one inverse surface (the hero card) plus the floating dock.
5. **Status is always icon + label + tone**, never colour alone.
6. **Numbers are the product.** Tabular figures, large where they matter, counting up on arrival, and a figure that does not exist yet reads _Pending_, never `0`.
7. **Motion confirms; it never decorates.** Short, springy, quiet — and off with Reduce Motion.

## Tokens

Everything visual comes from a token. ESLint bans hex literals in UI code, and `__tests__/architecture.test.ts` fails on any literal radius, spacing, font size, shadow or animation duration in `app/`, `src/features/` or `src/components/`. Component _dimensions_ (a 44pt target, a 26px check ring) are allowed; the scales are not.

### Colour

| Group      | Tokens                                                                                                                                                   |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Background | `backgroundPrimary #F1F2F4` (the page) · `backgroundSecondary #F7F8F9` · `backgroundTertiary #EAEBEE`                                                    |
| Surface    | `surfacePrimary #FFFFFF` (cards) · `surfaceSecondary #F5F6F8` (tiles inside cards) · `surfaceElevated #FFFFFF` · `surfacePressed #E9EAEE`                |
| Ink        | `inkPrimary #121316` (primary button, selected filter) · `inkSecondary #2B2C31` (pressed)                                                                |
| Inverse    | `surfaceInverse #17181B` (hero card, dock) · `surfaceInverseRaised #26272C` · `textOnInverse #F6F6F7` · `textOnInverseMuted #A9ABB3` · `borderOnInverse` |
| Text       | `textPrimary #121316` · `textSecondary #565860` · `textTertiary #666870` · `textDisabled #A6A8B0` · `textInverse #FFFFFF`                                |
| Border     | `borderSubtle` / `borderMedium` / `borderStrong` = ink at 6% / 10% / 18%                                                                                 |
| Brand      | `brand #2E9B6A` · `brandStrong #167547` (text and fills that must reach AA) · `brandMuted` (12% tint) · `brandSoft #E4F3EB` (solid tint)                 |
| Semantic   | `success #167547` · `warning #946000` · `danger #C0392B` · `info #2A5FC0` (+ `*Muted` 10% tints)                                                         |
| Utility    | `highlightTop` · `scrim` · `shadowInk` · `transparent`                                                                                                   |

`toneColors` maps a tone (`neutral | brand | success | warning | danger | info`) to `{fg, bg, border}`.

**Measured contrast (tested in `design-system.test.ts`, WCAG 2.x):**

| Pair                                                                        | Result          |
| --------------------------------------------------------------------------- | --------------- |
| `textPrimary` on every page and surface colour                              | ≥ 7:1 (AAA)     |
| `textSecondary` and **`textTertiary`** on every page and surface            | ≥ 4.5:1 (AA)    |
| White on `inkPrimary` / `inkSecondary` (buttons)                            | ≥ 7:1 (AAA)     |
| `textOnInverse` / `textOnInverseMuted` on the charcoal surfaces             | ≥ 7:1 / ≥ 4.5:1 |
| `brandStrong` on white, on the page, on `brandSoft`; white on `brandStrong` | ≥ 4.5:1         |
| `success` `warning` `danger` `info` on page, cards and tiles                | ≥ 4.5:1 (AA)    |

The dark theme's tertiary-text exception is gone: `textTertiary` is now safe for meta and hints. `brand` (#2E9B6A) is for non-text marks (progress fill, dots, the V); anything that carries text uses `brandStrong`.

### Typography

Inter, **three weights only** (Regular / Medium / SemiBold — there is no Bold). Sizes carry the hierarchy; large sizes get slight negative tracking.

| Token                            | Size / line                   | Weight                | Use                                                 |
| -------------------------------- | ----------------------------- | --------------------- | --------------------------------------------------- |
| `displayLarge` / `displayMedium` | 40/44 · 32/38                 | SemiBold              | Landing and login headlines, big plot number        |
| `headingXL` / `LG` / `MD` / `SM` | 26/32 · 22/28 · 18/24 · 16/22 | SemiBold              | Page titles, card titles                            |
| `bodyLG` / `MD` / `SM`           | 16/24 · 14/20 · 13/18         | Regular               | Text                                                |
| `labelLG` / `MD` / `SM`          | 14/18 · 12/16 · 11/14         | Medium                | Row titles, meta; `SM` is the uppercase micro-label |
| `caption`                        | 11/15                         | Regular               | Timestamps, fine print                              |
| `metricXL` / `LG` / `MD`         | 36/40 · 28/32 · 20/24         | SemiBold, **tabular** | Hero figure, prices, counts                         |
| `tabLabel`, `buttonLG` / `MD`    | 11/14 · 16/20 · 14/18         | Medium / SemiBold     | Dock, buttons                                       |

`AppText` is the only text component. Tones: `primary secondary tertiary disabled inverse onInverse onInverseMuted brand success warning danger info`. It caps Dynamic Type at 1.3×.

### Spacing, radius, elevation

- **Spacing** is keyed by pixel value: `space[16]` = 16. Scale `2 4 6 8 12 16 20 24 32 40 48 64`. Page gutter **20**; section gap **32**; min tap target **44**; dock **64** high, **12** above the bottom inset.
- **Radius** (generous): `xs 8 · sm 12 · md 16 · lg 20 · xl 28 · pill`. Cards are `xl`, tiles and rows `lg`, fields `md`, buttons/chips/dock/avatars are pills.
- **Elevation** = white + hairline + a soft, wide shadow ("floating paper"): `flat`, `tile` (no shadow), `raised` (cards), `elevated`, `overlay` (sheets, toasts), `inverse` (hero card, dock). Shadows are always ≤ 25% opacity and ≥ 16 blur — never a hard drop shadow; tested.
- **Icons**: lucide only, 1.75 stroke, `iconSize` `sm 16 · md 18 · lg 20 · xl 22 · hero 28`. `Icon` is the only wrapper.

### The icon vocabulary

`icons.<meaning>` (`src/components/primitives/icons.ts`) is the only way a screen names an icon. Every meaning has exactly one glyph and no two meanings share one (tested): chrome (`home menu back forward close search filter notifications support profile settings signOut`), states (`check verified info warning alert show hide`), the seven sections (`projects booking calculator siteVisits teamSales addMember myTeam`), entry paths (`guest associate admin`) and real-estate facts (`plot area price location visit phone mail gallery`). Screens do not import lucide directly.

### Brand

**Vara Real Estates.** `BrandMark` is a charcoal rounded tile with a "V" whose left stroke is light and right stroke is the brand green, drawn as vector (so it is crisp at every size). `Wordmark` sets the mark beside "Vara" and a small uppercase "Real Estates". The same artwork is rendered to the app icon, adaptive icon, splash and favicon in `assets/images/`.

## Layout

`ScreenLayout` is the template every screen uses:

```text
SafeArea → Header → Scrollable content (20px gutter, 24–32px between sections) → Sticky action → (Dock clearance)
```

Content is capped at 640px and centred on wide viewports; the sticky action sits on a white bar above the bottom inset; the keyboard pushes content up. `ScreenLayout` reads `useDockClearance()` so scrolling content always clears the floating dock.

Composition order on a screen: **header → title/intro → hero or summary card → supporting cards → list panel.** A `SummaryPanel` groups figures; a `NavPanel` groups destinations; both are white `xl` cards with hairlines between rows.

## Navigation

- **Floating dock** (`AssociateDock`): a charcoal pill with four icons — Home, Projects, Team, Profile. The selected item widens to show its label (a spring). It appears only on those four top-level routes (`dockKeyFor` in `features/navigation/dock.ts`, tested); pushed screens show a back button instead.
- **Header** (`AppHeader`): a white round menu button, the screen name, and the profile avatar. The menu opens an action sheet (Profile, Settings, Prototype controls, Sign out).
- **Pushed screens** use `DetailHeader`: a white round back button and a centred title (+ subtitle).

## Buttons

One hierarchy per screen. `Button` (also `PrimaryButton`, `SecondaryButton`, `TertiaryButton`, `DangerButton`) and `IconButton`. All buttons are **pills**.

| Variant   | Look                          | Use                                             |
| --------- | ----------------------------- | ----------------------------------------------- |
| Primary   | Ink fill, white label         | The single main action on a screen              |
| Secondary | White fill, hairline border   | Alternative actions                             |
| Tertiary  | No surface                    | Low-emphasis (Cancel, Open)                     |
| Danger    | Red-tinted surface, red label | Destructive only — always behind a confirmation |

Sizes `large 52` / `medium 44` / `small 36` (small still has a 44pt hit area). States: default, pressed (spring 0.98 + darken), **disabled** (a quiet grey pill with disabled text), **loading** (spinner replaces the label, width never jumps, presses blocked, `busy` exposed). `IconButton` is 44×44, requires an `accessibilityLabel`, and its `filled` variant is the white floating circle used for back and menu.

## Forms

`TextField`, `SearchField`, `PhoneField`, `OTPField`, `TextArea`, `SelectField`, `DateField`, `TimeField` — all on `FieldFrame`. Fields are **white with a hairline border**; focus turns the border **green**; error turns it red. States: idle · focused · filled · error · disabled. 16px text, 54pt tall, the whole surface focuses the input. **Errors are text with an icon**, announced as an alert. Forms use React Hook Form + Zod (`PhoneLoginForm`, `AddMemberScreen`, `BookingConfirmScreen`).

## Chips and status

| Component                       | Purpose                                                     |
| ------------------------------- | ----------------------------------------------------------- |
| `FilterChip`                    | Selectable filter; selected = ink fill; optional count      |
| `ChoiceChip`                    | Form choice; selected = green tint + green border + tick    |
| `StatusChip`                    | Non-interactive label; tone (incl. `brand`) + optional icon |
| `ChipRow`                       | Horizontal chip scroller that bleeds to the screen edges    |
| `PlotStatusBadge`, `PlotLegend` | All five plot statuses                                      |

**Status language (never colour alone):** Available = dot, On hold = clock, Booked = check, Blocked = lock, Not for sale = minus — each with its label. `plotStatusTokens` is typed `Record<PlotStatus, …>`.

## Motion

Reanimated 4. Durations `instant 80 · fast 140 · standard 220 · slow 320` ms; springs `press`, `sheet`, `settle`; plus screen-level timings: `enterMs 420`, `staggerStep 45` (max 6 steps), `countUpMs 900`, `progressFillMs 1000`, `successRingMs 900` (tested to stay under 1.5 s and the stagger under 400 ms total).

| Micro-interaction                    | How                                                                                        |
| ------------------------------------ | ------------------------------------------------------------------------------------------ |
| Press (buttons, cards, chips, tiles) | Spring scale (button .98, card .985, chip .96, icon .9) + surface change + optional haptic |
| Screen sections and list rows        | `Reveal`: fade + 8px rise, staggered 45 ms per item (capped at 6)                          |
| Headline figures                     | `AnimatedNumber` / `useCountUp`: ease-out count-up; screen readers get the final value     |
| Progress bars                        | Fill animates to its value (1 s ease-out) with the knob riding the end                     |
| Dock                                 | Selected item widens with a spring; label fades in                                         |
| Login option cards                   | Green ring + check springs in when selected                                                |
| Booking confirmation                 | `SuccessMark`: disc and check spring in, one ring expands and fades — plays once           |
| Bottom sheet                         | Spring in (no bounce), slide out; scrim fades with the drag; drag-to-dismiss               |
| Toast                                | Fade + 16px rise, 220 ms, auto-dismiss 2.8 s                                               |
| Toggle                               | Thumb slide, 140 ms                                                                        |
| Skeleton                             | Slow opacity pulse                                                                         |

**Reduce Motion:** `useReducedMotion()` honours the OS setting unless Settings → Motion forces it on/off. When reduced: no scales, no rises, figures and bars are simply at their value, the dock and sheets change without movement. State changes and haptics still happen.

## Haptics

Through `services/haptics` only (preference-aware, never throws). `light` — card/row/tile press; `selection` — chip, plot tile, dock item, radio card, toggle; `success` — accepted OTP, booking, member added; `warning`/`error` — rejected input. Never continuous; never on scroll.

## Accessibility

- Every interactive element ≥ 44pt; smaller visuals get `hitSlop`.
- Icon-only controls are named (`IconButton` requires it). Cards expose one descriptive name; the dock is a `tablist` of `tab`s with selected state; login options are `radio`s; progress bars are `progressbar`s with min/max/now/text.
- **No nested interactive elements** (`PressableCard` + `CardPressRegion`).
- A pending figure is spoken as "My sales, pending, not yet added"; a masked figure as "hidden"; a count-up is never spoken mid-count.
- Errors and toasts are `alert` regions; empty/error copy is written for people and never shows raw errors.
- Dynamic Type up to 1.3×; long names truncate, large amounts shrink rather than overflow.

## Copy

Concise, human, second person. `Couldn't load your dashboard` (not `FETCH ERROR`); `No site visits yet` + what to do; `Plot booked` (not `TRANSACTION SUCCESS`). Anything simulated says so: _Prototype booking · no payment taken_.

## Usage rules

1. Import tokens from `@/design-system` and components from `@/components`. Never hard-code a colour, radius, gap, padding, font size, shadow or duration.
2. Text is `AppText`; press is `PressableScale` / `PressableCard`; icons are `Icon` with `icons.<meaning>`; gaps are tokens.
3. A screen has one Primary button and at most one charcoal card.
4. Wrap repository data in `ResourceBoundary` so loading, error, empty and success are all handled.
5. Format with `utils/format.ts` (₹, sq yd, dates relative to the Clock). Dates come from the Clock via `useNow()`, never `new Date()`.
6. Screens and features never import raw RN `Text`/`Pressable`/`Switch`/`TextInput` (tested).
7. New component? Add it to the gallery (`features/dev/sections/`) and a test first.

## Anti-patterns (reject in review)

A gradient or a second accent colour · green as a background wash · a status shown only by colour · a red border as the only error signal · a button inside a button · a lone full-screen spinner · more than one Primary · a hard shadow · a one-off radius/spacing value · a zero where the honest state is "pending" · animating every element (motion is for arrival, selection and confirmation) · a count-up that a screen reader reads aloud · "No data found".

## Component catalogue

- **Primitives:** `AppText`, `Icon`, `icons`, `IconContainer`, `Avatar`, `BrandMark`/`Wordmark`, `CountBadge`, `Surface`, `Stack`, `Row`, `Spacer`, `Divider`, `PressableScale`, `PressableCard`/`CardPressRegion`, `Reveal`, `AnimatedNumber`, `Toggle`, `ScreenContainer`, `SafeScreen`, `Section`, `SectionHeader`.
- **Blocks:** `HeroCard`/`HeroStat`, `SummaryPanel`/`StatGrid`/`StatTile`, `NavPanel`/`NavRow`, `ActionTile`/`ActionTileRow`, `LoginOptionCard`, `ProgressBar`.
- **Buttons:** `Button` (+ presets), `IconButton`.
- **Forms:** `TextField`, `SearchField`, `PhoneField`, `OTPField`, `TextArea`, `SelectField`, `DateField`, `TimeField`, `FieldFrame`.
- **Chips:** `FilterChip`, `ChoiceChip`, `StatusChip`, `ChipRow`, `LeadStageChip`, `LeadPriorityChip`.
- **Lists:** `ListRow`, `ActionRow`, `SettingRow`, `MetricRow`, `TimelineRow`, `ActivityRow`, `NotificationRow`.
- **Feedback:** `ToastProvider`/`useToast`, `InlineError`, `EmptyState`, `LoadingState` + skeletons, `OfflineBanner`, `RepositoryErrorState`, `ConfirmationSheet`, `ActionSheet`, `BottomSheet`, `SuccessMark`.
- **Navigation:** `AssociateDock`, `AppHeader`, `StandardHeader`, `LargeTitleHeader`, `DetailHeader`, `SearchHeader`, `HomeHeader`, `AppTabBar` (parked).
- **Patterns:** `ScreenLayout`, `ResourceBoundary`.
- **Property:** `ProjectCard`, `ProjectHero`, `ProjectImage` (site-plan artwork, no image files), `PropertyMetric`, `InventorySummary`, `PlotCard`, `PlotStatusBadge`, `PlotLegend`, `PropertyMatchCard`, `PriceSummary`.
- **Team and sales:** `TeamMemberRow`, `SaleRow`. **Visits:** `VisitCard`, `VisitStatusChip`, `VisitHistoryRow`.
- **Parked (CRM):** `LeadCard`, `LeadStageIndicator`, `LeadSummary`, `NextActionCard`, `TaskCard`, `TimelineEventRow`, `ContactActionBar`, conversation/message components, dashboard metrics.

`PlaceholderScreen` (feedback) is no longer used by any route; delete it when convenient.

## The gallery

`/dev/design-system` renders every component in every state on data read through repositories, including a **Vara blocks** section (brand, the full icon set, hero card, summary tiles with a pending state, navigation rows, action tiles, header, dock, radio cards, progress bar, success mark, team/sale/visit rows). It is registered under `Stack.Protected guard={__DEV__}` and absent from production builds (tested). Open it from Settings → Prototype controls in a dev build, or go to `/dev/design-system`.

## Visual QA

Screenshots of the flow (390×844 @2×, headless Chrome through `react-native-web`) are in [`docs/screenshots/`](screenshots), numbered in walk order: home, login, guest hub, dashboard (+ menu), projects, project, inventory, plot, live booking (+ confirm sheet, success), calculator, site visits, team sales, my team, profile, settings, prototype controls. The flow was walked end to end in the browser with zero console errors (see [QA_CHECKLIST.md](QA_CHECKLIST.md)). A device run is still outstanding: fonts, haptics, safe areas, keyboard behaviour and gesture feel need on-device verification.
