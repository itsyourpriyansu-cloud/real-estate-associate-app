# Real Estate Associate App — Phase 1 Frontend Prototype Master Specification

> **Purpose:** This document is the single source of truth for Claude/Claude Code to architect and build the Phase 1 frontend prototype of a mobile-first real-estate associate sales application using React Native and deterministic seed data only.
>
> **Design direction:** Premium, monochrome, tactile, CRED-inspired product design — black/white dominant, restrained depth, sharp information hierarchy, subtle haptics, purposeful motion, and zero visual clutter. Do **not** copy CRED branding, logos, proprietary assets, exact screens, or proprietary fonts. Reinterpret the principles for a real-estate sales operating system.
>
> **Prototype rule:** No real backend, no production authentication, no real CRM, no payment processing, no real WhatsApp Business API, and no real inventory locking in Phase 1. All domain behaviour must be represented by deterministic local seed data and mock service adapters so the frontend can later connect to FastAPI without a rewrite.

---

# 1. Product Definition

Build a premium mobile app for real-estate associates that helps them operate their entire sales day from one place:

**Lead → Follow-up → Property Match → WhatsApp → Site Visit → Plot Selection → Cost Sheet Preview → Booking Intent → Activity History**

Phase 1 is not an admin ERP and not a customer-facing marketplace. It is the **associate-facing command center**.

The app must answer these questions within seconds:

1. What should I do next?
2. Which leads need attention?
3. Which projects and plots are currently shown as available in the prototype?
4. Which site visits are scheduled today?
5. What happened with a lead previously?
6. What should I send to the customer?
7. What has changed since I last opened the app?

---

# 2. Phase 1 Scope

## Required modules

- Prototype authentication
- Home / My Day dashboard
- Leads list
- Lead search and filters
- Lead detail
- Lead timeline
- Lead requirements
- Property matches
- Projects list
- Project detail
- Inventory / plot layout
- Plot detail
- Tasks
- Site visits
- WhatsApp-style communication templates and outbound deep-link action
- Prototype inbox with seeded conversations
- Notifications
- Universal search
- Profile
- Settings shell
- Seed-data repository layer
- Design system
- Reusable component library
- Loading / empty / error / offline simulation states

## Explicitly out of scope

Do not build real:

- backend APIs
- PostgreSQL
- Redis
- WebSockets
- actual OTP
- actual WhatsApp Business Cloud API
- actual lead imports
- map routing APIs
- payment gateways
- brokerage payouts
- document verification
- cloud storage
- analytics ingestion
- push notification infrastructure
- AI/LLM calls

Create extension points for them, but do not implement them.

---

# 3. Recommended Tech Stack

Use a stable Expo toolchain rather than the September 2026 Expo SDK 58 beta.

## Core

| Layer | Choice | Reason |
|---|---|---|
| Mobile framework | React Native | Required mobile stack |
| App platform | Expo SDK 57 stable | Stable current Expo release for prototype work |
| React Native baseline | Expo-managed RN 0.86.x | SDK 57 target; avoid manual version drift |
| Language | TypeScript strict mode | Domain-heavy product; prevents prototype rot |
| Routing | Expo Router | File-based routing and future deep-link support |
| State | Zustand | Lightweight app/client state |
| Persisted prototype state | AsyncStorage via a storage adapter | Allows seed data to feel persistent between sessions |
| Validation | Zod | Runtime validation for fixtures and future API data |
| Forms | React Hook Form + Zod resolver | Onboarding/filter/edit forms |
| Animation | React Native Reanimated | Smooth purposeful motion |
| Gestures | React Native Gesture Handler | Swipe/actions/sheets |
| Haptics | expo-haptics | Premium tactile feedback |
| Icons | lucide-react-native | Clean consistent line iconography |
| Image | expo-image | Caching and high-quality project imagery |
| Safe areas | react-native-safe-area-context | Device-safe layouts |
| Date utilities | date-fns | Deterministic date formatting |
| Testing | Jest + React Native Testing Library | Unit/component coverage |
| Linting | ESLint | Code quality |
| Formatting | Prettier | Consistency |

## Do not use in Phase 1 unless there is a strong reason

- Redux Toolkit
- MobX
- GraphQL
- TanStack Query for fake seed data
- NativeWind/Tailwind as the primary design system
- UI kits that dictate the visual language
- a backend server only to serve JSON fixtures

### Styling rule

Use a **typed token-based custom design system** with React Native `StyleSheet` or small token-aware primitives. Avoid scattering hex values, spacing numbers, shadows, and font sizes throughout feature code.

---

# 4. Environment Baseline

Claude should initialize the project using the latest stable Expo SDK 57-compatible template and keep Expo-managed dependencies aligned using `npx expo install`.

Use:

- Node.js 22 LTS or newer compatible version
- npm or pnpm, but choose one and lock it
- Expo Router
- TypeScript strict mode
- Expo development build optional; Expo Go is acceptable for the first prototype if every dependency supports it

Do not opt into Expo SDK 58 beta in this prototype.

---

# 5. Architecture Principle

The frontend must behave as though a backend already exists, while still using seed data.

Screens must **never import fixture arrays directly**.

Wrong:

```ts
import { leads } from '@/data/leads';
```

Correct:

```ts
const leads = await leadRepository.list(filters);
```

The repository implementation may read local seed data today. Later, it can be replaced with an API repository.

Architecture:

```text
Screens / Routes
      ↓
Feature View Models / Hooks
      ↓
Domain Repositories
      ↓
Mock Repository Implementations
      ↓
Seed Fixtures + Fake Latency / Failure Simulator
```

This rule is mandatory.

---

# 6. Folder Architecture

Use this structure unless Claude finds a concrete technical reason to improve it.

```text
real-estate-associate-app/
│
├── app/
│   ├── _layout.tsx
│   ├── index.tsx
│   │
│   ├── (auth)/
│   │   ├── _layout.tsx
│   │   ├── login.tsx
│   │   ├── otp.tsx
│   │   └── onboarding.tsx
│   │
│   ├── (tabs)/
│   │   ├── _layout.tsx
│   │   ├── home.tsx
│   │   ├── leads.tsx
│   │   ├── projects.tsx
│   │   ├── tasks.tsx
│   │   └── inbox.tsx
│   │
│   ├── leads/
│   │   └── [leadId].tsx
│   │
│   ├── projects/
│   │   ├── [projectId].tsx
│   │   └── [projectId]/inventory.tsx
│   │
│   ├── plots/
│   │   └── [plotId].tsx
│   │
│   ├── visits/
│   │   └── [visitId].tsx
│   │
│   ├── notifications.tsx
│   ├── search.tsx
│   ├── profile.tsx
│   └── settings.tsx
│
├── src/
│   ├── components/
│   │   ├── primitives/
│   │   ├── feedback/
│   │   ├── navigation/
│   │   └── domain/
│   │
│   ├── design-system/
│   │   ├── colors.ts
│   │   ├── spacing.ts
│   │   ├── typography.ts
│   │   ├── radius.ts
│   │   ├── elevation.ts
│   │   ├── motion.ts
│   │   ├── theme.ts
│   │   └── index.ts
│   │
│   ├── domain/
│   │   ├── lead.ts
│   │   ├── project.ts
│   │   ├── plot.ts
│   │   ├── task.ts
│   │   ├── visit.ts
│   │   ├── notification.ts
│   │   ├── conversation.ts
│   │   └── user.ts
│   │
│   ├── features/
│   │   ├── auth/
│   │   ├── home/
│   │   ├── leads/
│   │   ├── projects/
│   │   ├── inventory/
│   │   ├── tasks/
│   │   ├── visits/
│   │   ├── inbox/
│   │   ├── notifications/
│   │   ├── search/
│   │   └── profile/
│   │
│   ├── repositories/
│   │   ├── contracts/
│   │   ├── mock/
│   │   └── index.ts
│   │
│   ├── seed/
│   │   ├── users.ts
│   │   ├── leads.ts
│   │   ├── projects.ts
│   │   ├── plots.ts
│   │   ├── tasks.ts
│   │   ├── visits.ts
│   │   ├── conversations.ts
│   │   ├── notifications.ts
│   │   └── resetSeed.ts
│   │
│   ├── services/
│   │   ├── whatsapp.ts
│   │   ├── clock.ts
│   │   ├── storage.ts
│   │   └── simulation.ts
│   │
│   ├── store/
│   │   ├── authStore.ts
│   │   ├── preferencesStore.ts
│   │   └── prototypeStore.ts
│   │
│   ├── hooks/
│   ├── utils/
│   ├── constants/
│   └── types/
│
├── assets/
│   ├── images/
│   ├── project-placeholders/
│   └── fonts/
│
├── docs/
│   ├── ARCHITECTURE.md
│   ├── DESIGN_SYSTEM.md
│   ├── DOMAIN_SCHEMA.md
│   ├── SCREEN_MAP.md
│   ├── PROTOTYPE_STATES.md
│   ├── AGENT_HANDOFF.md
│   └── QA_CHECKLIST.md
│
├── __tests__/
├── app.json
├── package.json
├── tsconfig.json
└── README.md
```

---

# 7. Navigation Model

## Primary bottom tabs

Use exactly five primary destinations:

1. **Home**
2. **Leads**
3. **Projects**
4. **Tasks**
5. **Inbox**

Do not put Search, Alerts, History, Wallet, Profile, or AI in the tab bar.

## Secondary global actions

Top-level header actions:

- Universal search
- Notifications
- Profile/avatar

## Navigation behaviour

- Preserve tab state when switching tabs.
- Detail pages should push onto a stack.
- Back action should return to the previous scroll/filter state.
- Deep-link-friendly route ids must use domain ids (`leadId`, `projectId`, `plotId`, `visitId`).
- No hidden hamburger menu for primary workflows.

---

# 8. CRED-Inspired Design Strategy

The visual goal is not “copy CRED.” The goal is to apply the qualities that make CRED feel deliberate:

- beauty and utility at the same time
- premium restraint
- strong typography
- high-contrast composition
- tactile surfaces
- deliberate micro-interactions
- haptic acknowledgement
- few but meaningful actions per viewport
- motion that communicates hierarchy instead of decorating screens
- honest data presentation

CRED's public brand guidance emphasizes balancing **beautiful and useful**, being **curious and informed**, **generous and rigorous**, and **expressive and honest**. Its public design playground historically exposes foundations such as colors/typography and reusable controls including BottomSheet, Button, ElevatedCard, Header, InputField, SearchBar, Tags, Toasts and Toggle. Translate those principles into this real-estate product rather than reproducing CRED screens.

---

# 9. Visual Design System

## 9.1 Color Tokens

The product is dark-first and almost monochrome.

```ts
export const colors = {
  canvas: '#050505',
  canvasRaised: '#080808',
  surface1: '#0D0D0D',
  surface2: '#121212',
  surface3: '#181818',
  surfaceInteractive: '#1E1E1E',

  textPrimary: '#F7F7F7',
  textSecondary: '#B0B0B0',
  textTertiary: '#747474',
  textInverse: '#070707',

  borderSubtle: '#1C1C1C',
  borderDefault: '#292929',
  borderStrong: '#3A3A3A',

  white: '#FFFFFF',
  black: '#000000',
  silver: '#D9D9D9',

  success: '#70D7A0',
  warning: '#E8C26A',
  danger: '#F07A7A',
  info: '#8BAFE8',
};
```

### Usage rule

Black, white, grey and silver should account for **at least 90% of the interface**.

Semantic colors may only be used for:

- status indicators
- warnings
- destructive actions
- confirmation states
- inventory status

Never use decorative gradients in Phase 1.

## 9.2 Inventory Status Language

Never communicate status using color alone.

```text
AVAILABLE       text + dot
ON HOLD         text + clock icon
BOOKED          text + check icon
BLOCKED         text + lock icon
NOT FOR SALE    text + minus icon
```

Suggested semantic mapping:

- Available → success
- On Hold → warning
- Booked → neutral/silver
- Blocked → danger
- Not for Sale → tertiary grey

## 9.3 Typography

Do not use CRED's proprietary fonts.

Use **Inter** throughout the prototype for clarity and implementation speed.

Optional future direction: pair Inter with a licensed editorial display typeface for marketing-only surfaces, not CRM screens.

Token scale:

```text
Display XL   36 / 42 / 700
Display L    30 / 36 / 700
Title XL     26 / 32 / 700
Title L      22 / 28 / 650
Title M      18 / 24 / 650
Body L       16 / 24 / 450
Body M       14 / 20 / 450
Label L      14 / 18 / 600
Label M      12 / 16 / 600
Caption      11 / 15 / 500
Metric XL    32 / 36 / 650 tabular
Metric L     24 / 30 / 650 tabular
```

Rules:

- Use tabular numerals for metrics, plot numbers, prices and counts.
- Avoid uppercase paragraphs.
- Uppercase can be used sparingly for micro-labels/status only.
- Use textSecondary rather than reducing opacity randomly.
- Never use more than three text weights on a single screen.

## 9.4 Spacing

Use a 4-point base.

```ts
space = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
};
```

Screen horizontal padding: **20px**.

Typical vertical section gap: **28–32px**.

## 9.5 Radius

```text
xs   8
sm   12
md   16
lg   20
xl   24
pill 999
```

Avoid making every container a giant rounded card.

## 9.6 Elevation / Tactility

Dark UI depth should come from:

- tonal surface changes
- 1px borders
- subtle top-edge highlight
- minimal shadow only on overlays
- pressed-state darkening/brightening
- haptics

Do not use heavy outer glow.

## 9.7 Motion

Motion should feel premium and controlled.

Tokens:

```text
instant     90ms
fast       140ms
standard   220ms
slow       320ms
```

Preferred behaviours:

- card press: 0.985 scale + light haptic
- modal/sheet: spring, no bounce exaggeration
- tab transition: native/default, minimal custom animation
- list item entrance: avoid cascading animation on every render
- metric updates: subtle opacity/translate, no slot-machine gimmick
- inventory selection: 140–180ms state transition
- successful action: haptic + concise toast

Respect Reduced Motion.

---

# 10. Core Component Library

Claude must build primitives before feature screens.

## Primitives

- `Screen`
- `AppText`
- `Stack`
- `Row`
- `Divider`
- `IconButton`
- `PressableSurface`
- `Card`
- `ElevatedCard`
- `Pill`
- `Button`
- `TextButton`
- `Input`
- `SearchField`
- `Avatar`
- `Skeleton`
- `EmptyState`
- `ErrorState`
- `Toast`
- `BottomSheet` abstraction
- `SectionHeader`
- `ScreenHeader`

## Domain components

- `LeadCard`
- `LeadPriorityPill`
- `LeadStageRail`
- `NextActionCard`
- `ProjectCard`
- `ProjectMetric`
- `InventorySummary`
- `PlotTile`
- `PlotStatusPill`
- `TaskRow`
- `VisitCard`
- `TimelineEvent`
- `ConversationRow`
- `MessageBubble`
- `NotificationRow`
- `MetricStrip`
- `QuickAction`
- `PropertyMatchCard`
- `WhatsAppTemplateSheet`

Rule: no feature screen should invent a one-off button/input/card style unless documented first.

---

# 11. Domain Schemas

Use Zod schemas plus inferred TypeScript types.

## 11.1 User

```ts
type UserRole = 'ASSOCIATE' | 'TEAM_LEAD';

type User = {
  id: string;
  role: UserRole;
  fullName: string;
  phone: string;
  email?: string;
  avatarUrl?: string;
  associateCode: string;
  designation: string;
  teamName?: string;
  reraRegistration?: string;
};
```

## 11.2 Lead

```ts
type LeadStage =
  | 'NEW'
  | 'CONTACTED'
  | 'QUALIFIED'
  | 'INTERESTED'
  | 'VISIT'
  | 'NEGOTIATION'
  | 'BOOKING'
  | 'WON'
  | 'LOST';

type LeadPriority = 'HOT' | 'WARM' | 'NORMAL' | 'COLD';

type LeadSource =
  | 'META_ADS'
  | 'GOOGLE_ADS'
  | 'WEBSITE'
  | 'WHATSAPP'
  | 'REFERRAL'
  | 'WALK_IN'
  | 'PORTAL'
  | 'MANUAL';

type Lead = {
  id: string;
  fullName: string;
  phone: string;
  email?: string;
  source: LeadSource;
  sourceLabel?: string;
  stage: LeadStage;
  priority: LeadPriority;
  assignedUserId: string;
  createdAt: string;
  updatedAt: string;
  lastActivityAt?: string;
  nextActionAt?: string;
  nextActionLabel?: string;
  requirement: LeadRequirement;
  tags: string[];
  notesCount: number;
  unreadMessages: number;
};
```

## 11.3 Lead Requirement

```ts
type LeadRequirement = {
  budgetMin?: number;
  budgetMax?: number;
  preferredLocations: string[];
  propertyTypes: Array<'PLOT' | 'VILLA' | 'APARTMENT'>;
  areaMinSqYd?: number;
  areaMaxSqYd?: number;
  preferredFacing?: Array<'NORTH' | 'SOUTH' | 'EAST' | 'WEST'>;
  purpose?: 'SELF_USE' | 'INVESTMENT';
  purchaseTimeline?: '0_30_DAYS' | '1_3_MONTHS' | '3_6_MONTHS' | '6_PLUS_MONTHS';
  loanRequired?: boolean;
};
```

## 11.4 Lead Timeline Event

```ts
type TimelineEventType =
  | 'LEAD_CREATED'
  | 'CALL'
  | 'WHATSAPP_SENT'
  | 'WHATSAPP_RECEIVED'
  | 'NOTE'
  | 'STAGE_CHANGED'
  | 'VISIT_SCHEDULED'
  | 'VISIT_COMPLETED'
  | 'PROJECT_SHARED'
  | 'PLOT_SHORTLISTED';

type TimelineEvent = {
  id: string;
  leadId: string;
  type: TimelineEventType;
  occurredAt: string;
  title: string;
  description?: string;
  actorName?: string;
  metadata?: Record<string, string | number | boolean>;
};
```

## 11.5 Project

```ts
type Project = {
  id: string;
  name: string;
  developerName: string;
  location: string;
  city: string;
  heroImageUrl: string;
  thumbnailUrl: string;
  startingPrice: number;
  maxPrice?: number;
  minPlotAreaSqYd: number;
  maxPlotAreaSqYd: number;
  availableUnits: number;
  totalUnits: number;
  reraNumber?: string;
  possessionLabel?: string;
  description: string;
  amenities: string[];
  highlights: string[];
};
```

## 11.6 Plot / Unit

```ts
type PlotStatus =
  | 'AVAILABLE'
  | 'ON_HOLD'
  | 'BOOKED'
  | 'BLOCKED'
  | 'NOT_FOR_SALE';

type Facing = 'NORTH' | 'SOUTH' | 'EAST' | 'WEST';

type Plot = {
  id: string;
  projectId: string;
  plotNumber: string;
  phase?: string;
  block?: string;
  status: PlotStatus;
  areaSqYd: number;
  facing: Facing;
  roadWidthFt: number;
  isCorner: boolean;
  baseRatePerSqYd: number;
  premiumAmount?: number;
  estimatedTotal: number;
  holdExpiresAt?: string;
};
```

## 11.7 Task

```ts
type TaskType = 'CALL' | 'WHATSAPP' | 'FOLLOW_UP' | 'SITE_VISIT' | 'NOTE';
type TaskStatus = 'OPEN' | 'DONE' | 'OVERDUE';

type Task = {
  id: string;
  type: TaskType;
  title: string;
  leadId?: string;
  projectId?: string;
  scheduledAt: string;
  status: TaskStatus;
  priority: 'HIGH' | 'NORMAL' | 'LOW';
  notes?: string;
};
```

## 11.8 Site Visit

```ts
type VisitStatus =
  | 'SCHEDULED'
  | 'CONFIRMED'
  | 'EN_ROUTE'
  | 'ARRIVED'
  | 'COMPLETED'
  | 'CANCELLED';

type SiteVisit = {
  id: string;
  leadId: string;
  projectId: string;
  associateId: string;
  scheduledAt: string;
  status: VisitStatus;
  shortlistedPlotIds: string[];
  outcome?: 'VERY_INTERESTED' | 'INTERESTED' | 'FOLLOW_UP' | 'NOT_INTERESTED';
  feedbackTags: string[];
  note?: string;
};
```

## 11.9 Notification

```ts
type NotificationType = 'ACTION_REQUIRED' | 'FOLLOW_UP' | 'INVENTORY' | 'UPDATE';

type AppNotification = {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
  deepLink?: string;
};
```

## 11.10 Conversation

```ts
type Conversation = {
  id: string;
  leadId: string;
  unreadCount: number;
  lastMessageAt: string;
  messages: Message[];
};

type Message = {
  id: string;
  direction: 'INBOUND' | 'OUTBOUND';
  kind: 'TEXT' | 'PROJECT_CARD' | 'COST_SHEET' | 'VISIT_CONFIRMATION';
  body: string;
  sentAt: string;
  status?: 'SENT' | 'DELIVERED' | 'READ';
};
```

---

# 12. Seed Data Specification

Seed data must be realistic, deterministic, internally consistent and demo-ready.

Do not use placeholder names like `John Doe`, `Project A`, `Lorem Ipsum`, or random UUIDs on every app restart.

## Seed volume

Create at minimum:

- 1 logged-in associate
- 18 leads
- 4 projects
- 120 plots distributed across projects
- 16 tasks
- 7 site visits
- 8 conversations
- 14 notifications
- 40+ lead timeline events

## Suggested associate

```text
K. V. Raghunath Reddy
Senior Associate
Associate ID: YH-APL2-1048
Team: YHIPL2
```

## Suggested projects

Use fictionalized but realistic demo projects:

1. Real Rise — Bangalore Highway
2. Aurelia Greens — Airport Corridor
3. Northgate County — Hyderabad Highway
4. Cedar Enclave — Outer Ring Growth Zone

Do not imply these are real regulated offerings.

## Seed diversity

Leads must represent:

- different stages
- different priorities
- different lead sources
- different budgets
- overdue and future follow-ups
- leads with and without site visits
- unread WhatsApp messages
- multiple project matches
- lost lead reason
- won lead example

Inventory must represent all statuses.

## Time determinism

Create a `Clock` service.

For demo mode, allow a fixed “Today” timestamp so tasks/site visits are always meaningful even when the prototype is opened later.

Add a developer setting:

```text
Use Real Clock / Use Demo Clock
```

---

# 13. Mock Repository Contracts

Create interfaces first.

Example:

```ts
export interface LeadRepository {
  list(input?: LeadListInput): Promise<Lead[]>;
  getById(id: string): Promise<Lead | null>;
  getTimeline(leadId: string): Promise<TimelineEvent[]>;
  updateStage(leadId: string, stage: LeadStage): Promise<Lead>;
  search(query: string): Promise<Lead[]>;
}
```

Also create:

- `ProjectRepository`
- `PlotRepository`
- `TaskRepository`
- `VisitRepository`
- `ConversationRepository`
- `NotificationRepository`
- `UserRepository`

Mock repositories should optionally simulate:

- 250–700ms latency
- empty data
- offline state
- 500/error state

Expose simulation through a dev menu or constants.

---

# 14. Screen Specifications

# 14.1 Login

Visual direction:

- black canvas
- strong wordmark/product name
- short statement
- one phone number field
- primary white button
- no gradients
- minimal legal copy

Prototype behaviour:

- any valid Indian-style 10-digit test number advances
- OTP screen accepts `123456`
- display “Prototype mode” discreetly

# 14.2 OTP

- six-digit input
- resend timer visual only
- haptic when accepted
- no fake network promises

# 14.3 Home / My Day

Order:

1. greeting + avatar
2. date / small context line
3. “Today” action summary
4. next action card
5. quick actions
6. pipeline strip
7. today’s visits
8. live prototype inventory summary
9. monthly performance snapshot
10. recent activity

The first viewport should answer **what should I do next?**, not show vanity metrics.

Example:

```text
GOOD MORNING
Raghunath

3 leads need attention
2 visits today
1 overdue follow-up

NEXT ACTION
Rahul Sharma
Follow up · 10:30 AM
Budget ₹40–55L

[CALL] [WHATSAPP] [OPEN]
```

# 14.4 Leads

Header:

- title
- search affordance
- add button can exist visually but opens a prototype-only form

Filter chips:

- All
- New
- Hot
- Follow-up
- Visit
- Negotiation

Lead card must show:

- name
- priority
- stage
- budget
- requirement shorthand
- preferred location
- source
- next action
- call action
- WhatsApp action

Avoid avatars unless they carry useful identity.

# 14.5 Lead Detail

Sections:

1. identity + priority + stage
2. sticky quick actions: Call / WhatsApp / Schedule / Note
3. next action
4. stage rail
5. requirements
6. property matches
7. upcoming/past visits
8. timeline

Top actions should remain reachable with one thumb.

# 14.6 Projects

Project list should be visual but restrained.

Each project card:

- image
- project name
- location
- starting price
- area range
- available plot count
- one primary CTA

Filters:

- Location
- Price
- Plot size
- Availability

# 14.7 Project Detail

Sections:

1. hero image
2. name / developer / location
3. price / size / availability summary
4. `View Inventory` primary CTA
5. highlights
6. overview
7. amenities
8. prototype location card
9. inventory snapshot
10. documents/marketing placeholders

No giant marketing carousel.

# 14.8 Inventory

Header:

- project
- availability count
- filter control

Use a compact adaptive grid of plot tiles.

Each tile:

```text
26
Available
240 sq yd
```

Filter/sort:

- status
- area
- facing
- corner
- price

Include persistent legend.

# 14.9 Plot Detail

Information:

- plot number
- status
- area
- facing
- road width
- corner status
- base rate
- premium
- estimated total

Actions:

- `Create Cost Preview`
- `Share on WhatsApp`
- `Shortlist for Lead`

Any “Hold” button in Phase 1 must clearly say **Prototype Hold** and only mutate local mock data.

# 14.10 Tasks

Segments:

- Today
- Upcoming
- Overdue
- Completed

Group by date/time.

Every task row should show who/what it belongs to.

Swipe gestures are optional; do not sacrifice discoverability.

# 14.11 Site Visits

Visit card:

- time
- customer
- project
- status
- call
- WhatsApp
- open

Visit detail prototype allows:

- mark confirmed
- mark arrived
- shortlist plots
- capture outcome
- add notes
- create follow-up task

All actions are local mock mutations.

# 14.12 Inbox

Phase 1 uses seeded conversations only.

Conversation list:

- customer
- project context
- last message
- time
- unread count

Conversation detail:

- lead context mini-header
- message history
- preset composer
- template picker
- outbound message mutation to local state

Clearly distinguish this prototype inbox from live WhatsApp Business integration.

# 14.13 WhatsApp Action

Implement a service abstraction:

```ts
interface WhatsAppService {
  openChat(phone: string, text?: string): Promise<void>;
  buildProjectMessage(projectId: string, leadId?: string): Promise<string>;
  buildVisitMessage(visitId: string): Promise<string>;
}
```

For outbound WhatsApp:

- generate prefilled text
- use `Linking.canOpenURL`
- if unsupported, show a copy/share fallback
- never silently fail

Templates:

- Initial response
- Share project
- Site visit confirmation
- Site visit reminder
- Follow-up
- Plot shortlist

# 14.14 Notifications

Use compact actionable rows.

Types:

- Action required
- Follow-up
- Inventory
- Update

Notification opens the correct prototype route.

# 14.15 Universal Search

Search local seed repositories across:

- leads
- projects
- plots
- tasks
- visits

Group results by entity type.

Debounce input.

# 14.16 Profile

Show:

- user
- associate code
- designation
- team
- demo RERA field
- contact details
- notification preference row
- appearance row (dark locked for Phase 1)
- prototype/reset seed data option
- support placeholder
- logout

---

# 15. Primary User Flows

## Flow A — Start the day

```text
Open app
→ Home
→ See overdue follow-up
→ Open lead
→ Review timeline
→ WhatsApp customer
→ Mark follow-up complete
→ Next action updates
```

## Flow B — Match a property

```text
Lead
→ Requirements
→ Property matches
→ Open project
→ Inventory
→ Plot
→ Shortlist
→ Share WhatsApp template
```

## Flow C — Site visit

```text
Home / Tasks
→ Site visit
→ Open visit
→ Confirm
→ Arrive
→ Shortlist plot(s)
→ Capture outcome
→ Create follow-up
```

## Flow D — Project-first discovery

```text
Projects
→ Project detail
→ Inventory
→ Filter east-facing under budget
→ Plot detail
→ Select lead to shortlist for
→ Share
```

## Flow E — Search

```text
Global search
→ “Rahul” / “Plot 26” / “Real Rise”
→ grouped result
→ detail
```

---

# 16. Home Dashboard Data Logic

The Home screen should be derived from repository data rather than hard-coded metrics.

Compute:

- leads requiring attention today
- overdue tasks
- visits today
- pipeline counts by stage
- available units across assigned projects
- recent timeline events
- prototype monthly booking count/value

Keep derived selectors outside the UI component.

---

# 17. UX Rules

1. Every screen must have one obvious primary job.
2. Every important entity must have a clear status.
3. Every lead should show a next action wherever possible.
4. Destructive actions require confirmation.
5. Do not rely on color alone.
6. Do not hide required information inside clever gestures.
7. Never put more than five primary items in bottom navigation.
8. Use bottom sheets for short contextual choices; full screens for workflows.
9. Do not use a card merely because there is content.
10. Avoid nested cards.
11. Avoid huge blank regions that force unnecessary scrolling.
12. Keep tap targets at least ~44pt.
13. Respect safe areas.
14. Build for Android first but test iOS layouts.
15. All critical actions must have loading/pressed/disabled states.
16. Prototype mutations need visible confirmation.
17. Seed data must never visually pretend to be live production data.

---

# 18. Copy / Content Guidelines

Tone:

- concise
- calm
- premium
- operational
- human

Use:

```text
2 visits today
Follow up by 4:30 PM
137 plots available
No next action scheduled
```

Avoid:

```text
Congratulations!!!
Amazing performance!!!
Click Here
Kindly do the needful
Your action is pending!
```

Button labels should describe actions:

```text
View inventory
Schedule visit
Open lead
Share project
Mark complete
Create follow-up
```

---

# 19. Accessibility Guidelines

Mandatory:

- text contrast suitable for dark theme
- meaningful accessibility labels
- 44pt minimum interactive area
- Dynamic Type tolerance where practical
- no status represented only by color
- support Reduce Motion
- icon-only actions need labels/tooltips/accessibility hints
- plot grid must remain usable at larger font sizes
- forms must provide error text, not only red borders

---

# 20. Prototype State Handling

Every major feature must demonstrate:

1. populated state
2. loading/skeleton state
3. empty state
4. error state
5. offline state where relevant

Add a hidden or developer-accessible **Prototype Controls** screen:

```text
Seed scenario
- Normal
- Busy day
- Empty CRM
- Offline
- Repository errors

Reset local prototype data
Use demo clock
Simulated latency
```

This makes the prototype useful for QA and stakeholder demos.

---

# 21. Performance Guidelines

Even though Phase 1 is local:

- memoize expensive derived calculations
- use performant lists for long datasets
- avoid unnecessary screen-wide re-renders
- size images appropriately
- use `expo-image`
- do not animate every item in a long list
- do not create giant context providers with all application state
- lazy-load detail routes naturally through Expo Router

---

# 22. Error Handling

Create centralized error primitives.

Repository error example:

```text
Couldn’t load leads
Your prototype data is still safe.

[Try again]
```

Offline example:

```text
You’re offline
Previously loaded prototype data is available.
```

Never show raw stack traces in UI.

---

# 23. Agent / Sub-Agent Working Model

Claude should use sub-agents where available. If the environment does not support sub-agents, execute the same responsibilities sequentially.

## Agent 1 — Product Architect

Owns:

- route architecture
- folder structure
- dependency choices
- domain boundaries
- repository contracts
- architecture docs

Must work first.

## Agent 2 — Design System Guardian

Owns:

- tokens
- typography
- spacing
- surfaces
- components
- haptics/motion rules
- accessibility consistency

Must approve primitives before feature agents duplicate styles.

## Agent 3 — Domain & Seed Data Agent

Owns:

- Zod schemas
- TypeScript types
- fixture integrity
- fake clock
- seed relationships
- repository mocks
- reset logic

Must ensure IDs and relationships are valid.

## Agent 4 — Navigation & Shell Agent

Owns:

- auth stack
- bottom tabs
- detail stacks
- global header actions
- safe area
- app shell

## Agent 5 — CRM Feature Agent

Owns:

- Home
- Leads
- Lead detail
- Timeline
- Tasks
- Site visits

## Agent 6 — Property Feature Agent

Owns:

- Projects
- Project detail
- Inventory
- Plot detail
- Property matches

## Agent 7 — Communication Agent

Owns:

- Inbox
- seeded conversations
- WhatsApp templates
- outbound deep-link service
- notifications
- universal search integration points

## Agent 8 — QA & Accessibility Agent

Owns:

- typecheck
- lint
- tests
- broken navigation
- contrast
- tap targets
- empty/error states
- seed consistency
- visual duplication

### Agent rules

- Agents must not create competing design tokens.
- Agents must not bypass repository contracts.
- Agents must not add dependencies without architect approval.
- Every handoff must update `docs/AGENT_HANDOFF.md`.
- Every feature must leave the project compiling.
- Do not merge a feature with TypeScript errors.

---

# 24. Implementation Order

Claude must follow this order.

## Stage 0 — Audit and plan

Before writing screens:

1. Read this entire file.
2. Restate the Phase 1 scope internally.
3. Identify contradictions.
4. Produce a concise implementation plan.
5. Confirm package choices are compatible with Expo SDK 57.

Do not ask the user unnecessary questions. Use sensible defaults documented here.

## Stage 1 — Architecture only

Create:

- project scaffold
- routing skeleton
- strict TS config
- folder architecture
- design-system token files
- domain schemas
- repository contracts
- mock repository implementations
- seed fixtures
- Zustand stores
- clock/storage/simulation services
- docs files
- test baseline

At the end of Stage 1:

- app must compile
- routes may use simple placeholders
- fixture schemas must validate
- tests must run
- no polished feature UI yet

Create `docs/ARCHITECTURE.md` documenting decisions.

## Stage 2 — Design system

Build primitives and create an internal component showcase route available only in development.

Verify:

- buttons
- cards
- inputs
- search
- pills
- headers
- sheets
- list rows
- status components
- loading/empty/error states

Only after this passes, start feature screens.

## Stage 3 — App shell + auth

Implement:

- login
- OTP
- onboarding shell
- tabs
- headers
- profile access
- notifications access

## Stage 4 — CRM flow

Implement:

- Home
- Leads
- Lead detail
- Timeline
- Tasks
- Visits

## Stage 5 — Projects and inventory

Implement:

- Projects
- Project detail
- Inventory
- Plot detail
- shortlisting

## Stage 6 — Inbox + WhatsApp prototype

Implement:

- conversation list
- conversation detail
- templates
- external WhatsApp action
- outbound local message state

## Stage 7 — Search + notification polish

Implement:

- universal search
- deep links
- actionable notifications

## Stage 8 — QA hardening

Run:

- typecheck
- lint
- tests
- Expo doctor
- navigation walkthrough
- Android small-screen test
- Android tall-screen test
- iPhone standard-size test
- accessibility audit
- reduced-motion check

---

# 25. Stage Gates

Claude must not proceed blindly.

## Gate A — Architecture

Pass when:

- zero direct fixture imports from screens
- repository contracts exist
- seed schemas validate
- route tree compiles
- design tokens are centralized

## Gate B — Design System

Pass when:

- no scattered hex colors in features
- no arbitrary spacing in feature components where a token exists
- all buttons use common primitives
- status semantics are consistent

## Gate C — Functional Prototype

Pass when:

- all required screens are reachable
- seeded flows work end to end
- mutations persist locally
- reset seed works
- WhatsApp fallback works

## Gate D — Demo Quality

Pass when:

- no placeholder copy
- no obvious layout bugs
- no inaccessible status-only colors
- no dead buttons
- no console errors
- no TypeScript errors

---

# 26. QA Checklist

Before calling Phase 1 complete:

## Build

- [ ] TypeScript strict passes
- [ ] ESLint passes
- [ ] Jest passes
- [ ] Expo Doctor passes or documented exception exists
- [ ] Android build launches
- [ ] iOS simulator build launches if environment permits

## Navigation

- [ ] all five tabs work
- [ ] lead detail back state works
- [ ] project → inventory → plot works
- [ ] notification deep links work
- [ ] search results open correct entities

## Data

- [ ] all seeds validate through Zod
- [ ] no orphan foreign keys
- [ ] task references resolve
- [ ] visit references resolve
- [ ] conversation lead references resolve
- [ ] plot project references resolve

## UX

- [ ] every screen has a clear primary action
- [ ] all lists have empty states
- [ ] all async mock calls have loading states
- [ ] errors are recoverable
- [ ] user can reset prototype
- [ ] no color-only status

## Visual

- [ ] 90%+ monochrome palette
- [ ] no decorative gradient
- [ ] no massive drop shadows
- [ ] no excessive card nesting
- [ ] consistent header height
- [ ] consistent 20px screen padding
- [ ] consistent radius tokens

## Accessibility

- [ ] minimum tap size
- [ ] labels on icon buttons
- [ ] contrast acceptable
- [ ] reduced motion respected

---

# 27. Definition of Done

Phase 1 is complete only when a stakeholder can install/open the prototype and complete this exact walkthrough without explanation:

```text
Login with demo OTP
→ Home identifies the next action
→ Open Rahul Sharma
→ Read his timeline and requirements
→ Open a recommended project
→ Check live-looking seed inventory
→ Open an available plot
→ Shortlist the plot for Rahul
→ Generate a WhatsApp message
→ Return to Tasks
→ Open today's site visit
→ Mark the visit complete
→ Add follow-up
→ Open Inbox and see Rahul's seeded thread
→ Open Notifications
→ Use Search for Plot 26
→ Open Profile
→ Reset demo data
```

If that works smoothly and visually feels like one product, Phase 1 is successful.

---

# 28. Future Backend Compatibility

Even though there is no backend now, keep these future endpoints in mind:

```text
/api/v1/auth/*
/api/v1/users/*
/api/v1/leads/*
/api/v1/projects/*
/api/v1/plots/*
/api/v1/tasks/*
/api/v1/visits/*
/api/v1/conversations/*
/api/v1/notifications/*
```

Mock repository method names should map cleanly to eventual HTTP operations.

Do not bake UI assumptions into data fixtures that would make migration difficult.

---

# 29. What Claude Must Create in the Repository

At minimum:

```text
README.md

docs/
  ARCHITECTURE.md
  DESIGN_SYSTEM.md
  DOMAIN_SCHEMA.md
  SCREEN_MAP.md
  PROTOTYPE_STATES.md
  AGENT_HANDOFF.md
  QA_CHECKLIST.md
```

`README.md` must contain:

- setup
- run commands
- demo credentials
- OTP
- reset instructions
- project architecture summary
- known limitations

---

# 30. Demo Credentials

Use deterministic prototype credentials:

```text
Phone: 9876543210
OTP: 123456
```

Never label these as secure or production-ready.

---

# 31. Initial Claude / Claude Code Master Prompt

Copy the prompt below into Claude after uploading this specification.

```text
You are the principal engineer, mobile product architect, design-system lead, and QA owner for a React Native frontend prototype.

I have uploaded a master specification named REAL_ESTATE_ASSOCIATE_PHASE1_CLAUDE_MASTER.md. Read the entire file before changing or creating code. Treat it as the source of truth.

Your mission is to build Phase 1 of a premium real-estate associate sales app using React Native + Expo + TypeScript and deterministic local seed data only.

IMPORTANT PRODUCT DIRECTION
This is not a generic real-estate listing app. It is an associate sales operating system focused on:
Lead → Follow-up → Property Match → WhatsApp → Site Visit → Plot Selection → Cost Preview → Activity History.

IMPORTANT VISUAL DIRECTION
Use a CRED-inspired premium monochrome design language without copying CRED branding, assets, proprietary fonts, or exact screens. The app must be black/white dominant, high-contrast, restrained, tactile, polished and operational. Use purposeful depth, strong typography, subtle haptics and small motion. Avoid gradients, huge shadows, colorful dashboard gimmicks, glassmorphism, generic AI-looking UI and excessive rounded cards.

TECHNICAL BASELINE
- React Native
- Expo SDK 57 stable; do not use SDK 58 beta
- Expo Router
- TypeScript strict
- Zustand
- Zod
- React Hook Form where forms are necessary
- React Native Reanimated
- React Native Gesture Handler
- expo-haptics
- expo-image
- lucide-react-native
- AsyncStorage behind a storage abstraction
- Jest + React Native Testing Library

CRITICAL ARCHITECTURE RULE
No screen may import seed fixture arrays directly. Screens consume feature hooks/view-models, which consume repository contracts, which are implemented by mock repositories backed by local seed fixtures. I need to swap those mock repositories for FastAPI repositories later without rewriting screens.

WORK MODE
Use sub-agents if your environment supports them. Delegate the responsibilities exactly as described in the uploaded specification: architecture, design system, domain/seed data, navigation shell, CRM features, property/inventory features, communication, and QA. If sub-agents are unavailable, perform the same roles sequentially.

DO NOT BUILD THE POLISHED SCREENS FIRST.

Execute Stage 1 only at first:
1. Inspect the specification completely.
2. Initialize/scaffold the project using an Expo SDK 57-compatible stable setup.
3. Install only justified dependencies compatible with the Expo version.
4. Create the folder architecture.
5. Create strict TypeScript config and path aliases.
6. Create Expo Router route skeletons with placeholder screens only.
7. Create the complete token-based design-system foundation.
8. Create Zod schemas and TypeScript domain types.
9. Create all repository contracts.
10. Create mock repository implementations with configurable latency/error/offline simulation.
11. Create realistic deterministic seed data with valid relationships.
12. Create the fake Clock, Storage and Prototype Simulation services.
13. Create Zustand stores only for app/session/preferences/client state; do not turn it into a database.
14. Create baseline tests proving seeds validate and core repositories work.
15. Create the docs required by the specification.
16. Run typecheck, lint, tests, and Expo Doctor.
17. Fix all issues before stopping.

At the end of Stage 1, do NOT continue automatically into the polished UI unless I ask you to continue. Give me:
- architecture summary
- final folder tree
- installed dependencies and why each exists
- repository contract summary
- seed data summary
- test/typecheck/lint status
- risks or decisions that may affect Stage 2

QUALITY RULES
- No `any` unless explicitly justified.
- No scattered hex colors in feature code.
- No scattered spacing constants where design tokens exist.
- No monolithic 500-line screens.
- No mock data inside screen files.
- No unused dependencies.
- No dead buttons presented as working.
- No fake backend server.
- No real customer data.
- No production claims.
- Every architecture decision should favor a later FastAPI integration.

Before coding, briefly inspect the specification and identify any contradictions. Resolve non-blocking ambiguity using the documented defaults instead of asking unnecessary questions.

Start now with Stage 1: ARCHITECTURE ONLY.
```

---

# 32. Stage 2 Prompt — Design System

Use only after Stage 1 is reviewed.

```text
Continue with Stage 2 only: build and validate the complete reusable design system described in REAL_ESTATE_ASSOCIATE_PHASE1_CLAUDE_MASTER.md.

Do not build full feature screens yet.

Create/refine:
- Screen
- AppText
- layout primitives
- Button variants
- IconButton
- Input
- SearchField
- Card / ElevatedCard
- PressableSurface
- Pills / status components
- Header / SectionHeader
- Avatar
- Divider
- Skeleton
- EmptyState
- ErrorState
- Toast
- BottomSheet abstraction
- LeadCard
- ProjectCard
- PlotTile
- TaskRow
- VisitCard
- TimelineEvent
- ConversationRow
- NotificationRow

Create a development-only component gallery route that shows every component, all states, long text, disabled state, loading state, and key status variations.

The visual system must stay 90%+ monochrome with black, white, greys and silver. Semantic colors are only for state. Do not add decorative gradients or heavy shadows.

Use subtle haptics and Reanimated motion according to the design tokens. Respect Reduce Motion.

Run typecheck, lint and tests. Stop after Stage 2 and report what is ready for feature construction.
```

---

# 33. Stage 3–8 Prompt — Complete Phase 1 UI

Use after Stage 2 is approved.

```text
Continue from the approved architecture and design system. Implement Stages 3 through 8 from REAL_ESTATE_ASSOCIATE_PHASE1_CLAUDE_MASTER.md.

Build the Phase 1 prototype end-to-end using repositories and seed data only.

Priority order:
1. Auth + app shell
2. Home / My Day
3. Leads + Lead Detail + Timeline
4. Tasks + Site Visits
5. Projects + Project Detail
6. Inventory + Plot Detail + Shortlist
7. Inbox + seeded conversations + WhatsApp templates/deep links
8. Notifications + Universal Search + Profile
9. Prototype controls / reset / latency / error / offline scenarios
10. QA hardening

Keep the CRED-inspired monochrome design discipline. The experience should feel premium because of hierarchy, spacing, typography, motion and tactility — not because of decorative effects.

Every screen must have loading, empty and error behaviour where applicable. Every seeded mutation should be locally persistent. No screen may import seed fixtures directly.

Complete the stakeholder walkthrough defined in the Definition of Done and fix anything that prevents it.

Then run:
- TypeScript
- ESLint
- unit/component tests
- Expo Doctor
- navigation walkthrough
- seed integrity validation

Finally update all docs and give me a concise implementation report with remaining Phase 2 backend integration points.
```

---

# 34. Research Basis / Reference Notes

Use these as principles, not as templates to clone:

- CRED public brand guidance: beauty + utility; rigorous craft; strong visual expression; honesty.
- CRED public site exposes design references including NeoPOP/manifesto links.
- CRED's public component playground historically lists foundation areas like Colors and Typography and components such as BottomSheet, Button, ElevatedCard, Header, InputField, SearchBar, Tags, Toasts and Toggle.
- Expo SDK 57 is the stable Expo baseline in this specification. Expo SDK 58 was beta as of September 2026, so this plan intentionally stays on SDK 57 for prototype stability.
- Expo Router is used for file-based navigation and future deep linking.

Official references:

- https://newsroom.cred.club/brand/
- https://cred.club/
- https://playground.cred.club/
- https://expo.dev/changelog/sdk-57
- https://docs.expo.dev/router/introduction/
- https://docs.expo.dev/versions/latest/sdk/router/

---

# 35. Final Product Principle

Do not rebuild the old app as a dark version of the same menu.

Build a system that continuously answers:

> **Who should this associate contact, what should they show, what needs action next, and what happened before?**

The UI is successful when it feels calm, premium and immediate while the architecture remains ready for a real backend.
