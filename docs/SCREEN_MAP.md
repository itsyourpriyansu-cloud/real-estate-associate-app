# Screen map

**Status: restructured around the "Android APP Flow" wireframe (structure only).** The route tree, session model, guards, domain additions and repository contracts below are in place. Every _new_ route is a `PlaceholderScreen`; feature UI is built in the stages listed at the bottom. Login and OTP are real (`features/auth`); `/projects` still renders the Stage 2 `ProjectsPreview`.

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

- **No tab bar.** The associate's primary navigation _is_ the seven dashboard rows (visible, not hidden). The hamburger in the dashboard header opens a **menu sheet** for secondary items only: Profile · Settings · Prototype controls · Sign out. The profile icon opens `/profile`. No drawer dependency was added.
- **Guarding:** every route group except `(public)` is inside `Stack.Protected` keyed on the session kind; `(public)` is only reachable signed out. Signing in/out flips the guards and Expo Router falls back to `index`, which redirects by kind. Tested (`__tests__/architecture.test.ts`, `__tests__/session.test.ts`).
- Detail routes push onto the root stack and return to the previous scroll/filter state.

## Routes → owner, data, stage

| Route                                                                 | Feature hook reads (contracts)                                         | Primary job                                                         | Stage |
| --------------------------------------------------------------------- | ---------------------------------------------------------------------- | ------------------------------------------------------------------- | ----- |
| `/home`                                                               | `SummaryRepository.getPublicSummary`                                   | Show public numbers; choose Guest / Associate / Simple              | A     |
| `/associate-login`, `/simple-login`, `/otp`                           | — (`prototypeAuth`, `authStore`)                                       | Phone → OTP; wrong-role numbers get an inline error                 | A     |
| `/guest-home`                                                         | —                                                                      | One row: Our Projects; sign out / exit                              | A     |
| `/projects`, `/projects/:id`, `/projects/:id/inventory`, `/plots/:id` | `ProjectRepository`, `PlotRepository`                                  | Browse projects, inventory, plot detail                             | B     |
| `/dashboard`                                                          | `SummaryRepository.getAssociateSummary`                                | 2 summary containers (with **pending** state) + 7 section rows      | C     |
| `/site-visits`, `/site-visits/:id`                                    | `VisitRepository.list({associateIds})`, leads, projects                | Visit log, details, statuses; team total                            | D     |
| `/price-calculator`                                                   | `ProjectRepository`, `PlotRepository`, `calculatePlotCost` (domain)    | Cost preview (never a quotation)                                    | D     |
| `/team`, `/team/:id`, `/team/add`                                     | `TeamRepository`                                                       | Downline list, member detail, add member                            | E     |
| `/team-sales`                                                         | `SalesRepository.listTeam`, `getTargets`                               | Team performance vs targets                                         | E     |
| `/live-booking`, `/live-booking/:plotId`                              | `ProjectRepository`, `PlotRepository`, `SalesRepository.createBooking` | Pick plot → confirm booking (**prototype hold + sale record only**) | F     |
| `/profile`, `/settings`, `/prototype-controls`                        | `UserRepository.getCurrent`, `preferencesStore`, `prototypeStore`      | Account, preferences, reset demo data, sign out                     | C     |

`/profile` is wired end-to-end (screen → `useCurrentUser` → `userRepository` → mock → seed) and covered by a test, including its repository-error state. It is the reference implementation of the pattern.

## Placeholder → real screen checklist

When replacing a placeholder: use `ScreenLayout`/primitives, add the feature hook under `src/features/<module>/`, cover loading/empty/error/offline (see [PROTOTYPE_STATES.md](PROTOTYPE_STATES.md)), then remove the placeholder usage. Delete `components/feedback/PlaceholderScreen.tsx` once no route uses it.
