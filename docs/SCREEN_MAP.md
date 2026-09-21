# Screen map

**Status: the "Android APP Flow" wireframe is built and working on seed data.** Every route below renders a real screen (Home, logins, guest hub, dashboard, the seven sections, project/inventory/plot, profile, settings, prototype controls). Look and motion follow the Vara light design system ([DESIGN_SYSTEM.md](DESIGN_SYSTEM.md)); how to run and check it: [RUN_THE_PROTOTYPE.md](RUN_THE_PROTOTYPE.md).

The previous CRM shell (five tabs: Home · Leads · Projects · Tasks · Inbox) is **parked, not deleted** — see [Parked routes](#parked-routes-crm). Routes use domain ids (`projectId`, `plotId`, `visitId`, `memberId`) so they are deep-link friendly.

## The flow

```text
1 HOME (public) ──┬─ Guest Login ───────────────► 4 GUEST SCREEN ─► Our Projects
                  ├─ Simple Login ─► OTP ───────► 4 GUEST SCREEN ─► Our Projects   (client: projects only)
                  └─ Associate Login ─► OTP ────► 3 ASSOCIATE DASHBOARD ─► 7 sections
```

| Session kind | How you get it                                | Lands on      | Can reach                                                         |
| ------------ | --------------------------------------------- | ------------- | ----------------------------------------------------------------- |
| `none`       | first launch / signed out                     | `/home`       | `(public)` only                                                   |
| `guest`      | **Guest Login** (no credentials)              | `/guest-home` | `(guest)`, `/projects/**`, `/plots/**`, `/prototype-controls`     |
| `client`     | **Simple Login** (phone + OTP, client number) | `/guest-home` | same as guest                                                     |
| `associate`  | **Associate Login** (phone + OTP)             | `/dashboard`  | `(associate)`, `/projects/**`, `/plots/**`, `/prototype-controls` |

## Route tree

```text
app/
├── _layout.tsx                       root: fonts + store hydration under splash; Stack; one Stack.Protected per group
├── index.tsx                         redirect by session kind (table above)
├── +not-found.tsx
├── (public)/                         guard: kind === 'none'
│   ├── _layout.tsx
│   ├── home.tsx                      /home                 1  HOME PAGE
│   ├── associate-login.tsx           /associate-login      2  ASSOCIATE LOGIN (phone)
│   ├── simple-login.tsx              /simple-login            SIMPLE (client) LOGIN (phone)
│   └── otp.tsx                       /otp                     shared OTP; the store remembers which login it belongs to
├── (guest)/                          guard: kind === 'guest' | 'client'
│   ├── _layout.tsx
│   └── guest-home.tsx                /guest-home           4  GUEST SCREEN
├── (associate)/                      guard: kind === 'associate'
│   ├── _layout.tsx
│   ├── dashboard.tsx                 /dashboard            3  DASHBOARD (2 summary containers + 7 rows)
│   ├── live-booking/index.tsx        /live-booking            2. LIVE BOOKING
│   ├── live-booking/[plotId].tsx     /live-booking/:plotId    confirm step
│   ├── price-calculator.tsx          /price-calculator        3. PRICE CALCULATOR
│   ├── site-visits/index.tsx         /site-visits             4. SITE VISITS HISTORY
│   ├── site-visits/[visitId].tsx     /site-visits/:visitId
│   ├── team-sales.tsx                /team-sales              5. TEAM SALES
│   ├── team/index.tsx                /team                    7. MY TEAM
│   ├── team/add.tsx                  /team/add                6. ADD TEAM MEMBER
│   ├── team/[memberId].tsx           /team/:memberId
│   ├── profile.tsx                   /profile
│   └── settings.tsx                  /settings
├── projects/                         guard: kind !== 'none'
│   ├── index.tsx                     /projects                1. OUR PROJECTS
│   ├── [projectId].tsx               /projects/:projectId
│   └── [projectId]/inventory.tsx     /projects/:projectId/inventory
├── plots/[plotId].tsx                /plots/:plotId           guard: kind !== 'none'
├── prototype-controls.tsx            /prototype-controls      guard: kind !== 'none'
└── dev/design-system.tsx             /dev/design-system       (dev builds only)
```

Route-group parentheses add no URL segment. The dashboard's numbering (1–7) is the order shown in the wireframe.

## Parked routes (CRM)

Their **route files were removed from `app/`**; the feature code, components, repositories, domain and seed are untouched, so re-attaching is "add a route file that renders the existing screen".

| Was                       | Code that remains                                                 |
| ------------------------- | ----------------------------------------------------------------- |
| `(tabs)/home`             | `features/home/*` (`HomePreview`, `useHomeData`, `buildHomeData`) |
| `(tabs)/leads`            | `features/leads/*`, `LeadRepository`                              |
| `(tabs)/tasks`            | `features/tasks/*`, `TaskRepository`                              |
| `(tabs)/inbox`            | `features/inbox/*`, `ConversationRepository`                      |
| `(tabs)/_layout`          | `components/navigation/AppTabBar`                                 |
| `leads/[leadId]`          | placeholder only                                                  |
| `conversations/[id]`      | placeholder only                                                  |
| `notifications`, `search` | placeholders; `NotificationRepository`                            |
| `(auth)/onboarding`       | placeholder only                                                  |

## Navigation model

- **A floating dock, not a tab bar.** Signed-in associates get a charcoal pill dock — Home (`/dashboard`) · Projects (`/projects`) · Team (`/team`) · Profile (`/profile`) — shown **only on those four top-level routes** (`dockKeyFor`, tested); pushed screens have a back button. The seven dashboard rows remain the primary navigation (visible, not hidden). The round menu button in the header opens a **menu sheet** for secondary items: Profile · Settings · Prototype controls · Sign out. No drawer dependency was added.
- **Guarding:** every route group except `(public)` is inside `Stack.Protected` keyed on the session kind; `(public)` is only reachable signed out. Signing in/out flips the guards and Expo Router falls back to `index`, which redirects by kind. Tested (`__tests__/architecture.test.ts`, `__tests__/session.test.ts`).
- Detail routes push onto the root stack and return to the previous scroll/filter state.

## Routes → screen, data

| Route                                          | Screen (`src/features/…`)                                            | Reads (contracts)                                                      | Primary job                                                     |
| ---------------------------------------------- | -------------------------------------------------------------------- | ---------------------------------------------------------------------- | --------------------------------------------------------------- |
| `/home`                                        | `landing/PublicHome`                                                 | `SummaryRepository.getPublicSummary`                                   | Public numbers; choose Guest / Associate / Simple; Login        |
| `/associate-login`, `/simple-login`, `/otp`    | `auth/LoginScreen`, `OtpForm`                                        | — (`prototypeAuth`, `authStore`)                                       | Phone → OTP; a number on the wrong login gets an inline error   |
| `/guest-home`                                  | `guest/GuestHome`                                                    | —                                                                      | One row: Our Projects; way back                                 |
| `/projects`                                    | `projects/ProjectsScreen`                                            | `ProjectRepository.list`                                               | Browse projects; filter by status                               |
| `/projects/:id`                                | `projects/ProjectDetailScreen`                                       | `getById`, `getInventorySummary`                                       | Facts, price range, inventory, highlights, amenities            |
| `/projects/:id/inventory`                      | `projects/InventoryScreen`                                           | `PlotRepository.list`                                                  | Legend, status filters, plot grid                               |
| `/plots/:id`                                   | `projects/PlotDetailScreen`                                          | `PlotRepository.getById`                                               | Plot facts and cost preview; **Book this plot** (associates)    |
| `/dashboard`                                   | `dashboard/DashboardScreen`                                          | `SummaryRepository.getAssociateSummary`, `UserRepository`              | Hero card, performance (with **Pending**), the seven rows       |
| `/live-booking`, `/live-booking/:plotId`       | `booking/LiveBookingScreen`, `BookingConfirmScreen`                  | `ProjectRepository`, `PlotRepository`, `SalesRepository.createBooking` | Pick a plot → customer → confirm → success (**prototype only**) |
| `/price-calculator`                            | `calculator/PriceCalculatorScreen`                                   | `ProjectRepository`, `PlotRepository`, `calculatePlotCost` (domain)    | Cost preview (never a quotation)                                |
| `/site-visits`, `/site-visits/:id`             | `visits/SiteVisitsScreen`, `VisitDetailScreen`                       | `VisitRepository.list({associateIds})`, leads, projects, plots         | Visit log, filters, details, outcome                            |
| `/team-sales`                                  | `sales/TeamSalesScreen`                                              | `SalesRepository.listTeam`, `getTargets`                               | Month vs target (hatched progress), top sellers, sales          |
| `/team`, `/team/:id`, `/team/add`              | `team/MyTeamScreen`, `MemberDetailScreen`, `AddMemberScreen`         | `TeamRepository`                                                       | Downline by level, member detail, add a member                  |
| `/profile`, `/settings`, `/prototype-controls` | `profile/ProfileScreen`, `SettingsScreen`, `PrototypeControlsScreen` | `UserRepository.getCurrent`, stores                                    | Account, preferences, scenarios and demo clock, reset, sign out |

`/profile` is the reference for the pattern: screen → `useCurrentUser` → `userRepository` → mock → seed, with a test for its repository-error state.

## Adding a screen

No route uses `PlaceholderScreen` any more; `components/feedback/PlaceholderScreen.tsx` can be deleted. New screens follow the same recipe: a route file that renders a feature screen, a hook under `src/features/<module>/` that reads a repository, `ResourceBoundary` for loading / error / empty, and tokens for everything visual.
