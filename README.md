# Real Estate Associate App — Phase 1 (frontend prototype)

A premium, dark-first mobile app for real-estate associates: **Lead → Follow-up → Property match → WhatsApp → Site visit → Plot selection → Cost preview → Booking intent → Activity history.**

> **This is a prototype.** All data is deterministic local seed data. There is no backend, no real authentication, no real WhatsApp, no payments and no inventory locking. Nothing in the app is live or secure, and no real customer data is used.

**Status: Stage 2 (design system + UI foundation + app shell) complete.** The architecture (Stage 1) is unchanged; the app now has a full token layer, 103 reusable components, a custom tab bar and headers, a working login/OTP, five representative compositions over the repositories, and a dev-only component gallery at `/dev/design-system`. Feature screens beyond those previews are built in later stages — see [docs/SCREEN_MAP.md](docs/SCREEN_MAP.md), [docs/DESIGN_SYSTEM.md](docs/DESIGN_SYSTEM.md) and [docs/AGENT_HANDOFF.md](docs/AGENT_HANDOFF.md).

## Stack

Expo SDK **57** (React Native 0.86.3), Expo Router, TypeScript strict, Zustand, Zod, React Hook Form, Reanimated + Gesture Handler, `expo-haptics`, `expo-image`, `lucide-react-native`, AsyncStorage (behind an abstraction), `date-fns`, Jest + React Native Testing Library, ESLint, Prettier. Expo SDK 58 (beta) is intentionally not used.

## Installation

Requirements: Node.js 22 LTS or newer (developed on Node 24), npm 10+ (the project is locked with **npm** — `package-lock.json`).

```bash
npm install
```

## Running

```bash
npm start            # Expo dev server; press a (Android), i (iOS), or scan the QR in Expo Go
npm run android
npm run ios
npm run web          # browser preview (visual QA only); open /dev/design-system for the component gallery
```

Every dependency is an Expo SDK 57 bundled module or pure JavaScript (no custom native modules), so Expo Go should be sufficient and a development build is optional. This has **not yet been verified on a device** — see Known limitations.

## Quality commands

```bash
npm run typecheck    # tsc --noEmit (strict)
npm run lint         # ESLint, zero warnings allowed
npm test             # Jest (unit, repository, seed-integrity, architecture, wiring)
npm run doctor       # Expo Doctor
npm run validate     # typecheck + lint + test
npm run format       # Prettier
```

## Demo login

|           |                                                          |
| --------- | -------------------------------------------------------- |
| **Phone** | `9876543210` (any valid 10-digit Indian mobile advances) |
| **OTP**   | `123456`                                                 |

These are fixed **prototype credentials**. They are not secure and not production-ready. Whichever number is entered, the seeded associate _K. V. Raghunath Reddy_ (Senior Associate, YH-APL2-1048, team YHIPL2) is who you are signed in as.

## Architecture in one picture

```text
Screens / routes            app/**                     ← may not import seed or mocks (lint + test enforced)
        ↓
Feature hooks / view-models src/features/**, src/hooks/**
        ↓
Repository contracts        src/repositories/contracts ← the seam FastAPI will implement
        ↓
Composition root            src/repositories/index.ts  ← the ONLY file that picks mock vs API
        ↓
Mock repositories           src/repositories/mock      ← latency / offline / error simulation
        ↓
Seed fixtures               src/seed                   ← deterministic builders, anchored to the Clock
```

Cross-cutting: `src/design-system` (all tokens), `src/domain` (Zod schemas + inferred types), `src/services` (clock, storage, simulation, haptics, prototype auth), `src/store` (Zustand — session, preferences and prototype controls **only**, never the database).

Swapping in a backend means writing `ApiLeadRepository`, `ApiProjectRepository`, … and exporting them from `src/repositories/index.ts`. No screen changes. Full detail: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Prototype mode

The app is always in prototype mode. Prototype controls (scenario, demo clock, latency, reset) are held in `prototypeStore`:

- **Scenarios:** Normal · Busy day · Empty CRM · Offline · Repository errors
- **Clock:** _Demo clock_ (default) freezes "now" at **Mon 21 Sep 2026, 09:15** so today's tasks and visits are always meaningful, even if the app is opened weeks later. _Real clock_ re-anchors all seed data to the actual current day.
- **Latency:** optional 250–700 ms delay on every repository call.

The controls **UI** ships in Stage 8 (route `/prototype-controls` exists as a placeholder). Until then the store can be driven programmatically — see [docs/PROTOTYPE_STATES.md](docs/PROTOTYPE_STATES.md).

## Resetting demo data

Mutations (completing tasks, shortlisting plots, sending messages, prototype holds) are saved to local storage and survive restarts. To discard them:

- **In code:** `await usePrototypeStore.getState().resetData()` re-seeds the database for the current scenario and clock.
- **On device:** clear the app's storage / reinstall.
- **Automatically:** changing scenario or clock mode rebuilds the dataset; corrupt or invalid stored data falls back to a fresh seed.
- **In the UI:** a "Reset demo data" action is added to Profile and Prototype Controls in Stages 3 and 8.

Signing out does **not** reset data.

## Project layout

```text
app/                 Expo Router routes ((auth), (tabs), leads, projects, plots, visits, …)
src/
  components/        primitives · feedback · navigation · domain   (Stage 2 builds these)
  design-system/     colors · spacing · typography · radius · elevation · motion · theme · fonts
  domain/            Zod schemas + inferred types + pure derivations
  features/          feature hooks / view-models, one folder per module
  repositories/      contracts/ · mock/ · index.ts (composition root)
  seed/              deterministic fixture builders
  services/          clock · storage · simulation · haptics · auth
  store/             authStore · preferencesStore · prototypeStore · hydration
  hooks/             useAsyncResource
  constants/         prototype constants (credentials, demo date, storage keys)
docs/                ARCHITECTURE · DESIGN_SYSTEM · DOMAIN_SCHEMA · SCREEN_MAP · PROTOTYPE_STATES · AGENT_HANDOFF · QA_CHECKLIST
__tests__/           Jest suites
```

## Known limitations

- **Most routes are still placeholders.** Login, OTP and the five tab compositions are real; lead/project/plot/visit/conversation detail, notifications, search, profile and settings are placeholders (on the real design system) until their stages. The tab screens are representative compositions, not the final screens.
- **Not yet run on a device or emulator.** Stages 1–2 were verified by typecheck, lint, 338 tests, Expo Doctor, production Metro bundles for Android and iOS, and a browser render of every tab and the full gallery — not by launching on hardware. Fonts, haptics, safe areas, keyboard behaviour and gesture feel remain unverified; the first on-device run is the first task of the next stage.
- **App icon and splash** are the Expo template's placeholder images; brand assets are not part of Phase 1.
- **Tertiary text contrast** (#72726E from the design brief) is below WCAG AA; it is restricted to non-essential text. See docs/DESIGN_SYSTEM.md.
- **Call / WhatsApp / Add lead** actions on the previews show an honest "arrives in a later stage" toast.
- **Project images** use `placeholder://` keys (see [docs/DOMAIN_SCHEMA.md](docs/DOMAIN_SCHEMA.md)); the image resolver and monochrome placeholders arrive in Stage 5.
- **WhatsApp** is not integrated; Stage 6 adds prefilled deep links and a seeded, clearly-labelled prototype inbox.
- **No real OTP, backend, payments, notifications infrastructure or AI.** All out of scope for Phase 1.
- **Seed phone numbers** are synthetic sequential values (`+91 90000 000NN`). A WhatsApp deep link to one could reach a real person's number, so Stage 6 must always prefill text and never auto-send.
- **Real-clock mode** re-anchors seed data to today, so local mutations are discarded when the calendar day changes. Demo-clock mode does not have this behaviour.
- **React Compiler is off.** The SDK 57 template enables it; it was disabled to keep Reanimated shared-value code predictable. Revisit deliberately.
