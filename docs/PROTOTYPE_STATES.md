# Prototype states and simulation

Spec §20 requires every major feature to demonstrate **populated, loading, empty, error and offline** states and a Prototype Controls screen. Stage 1 builds the machinery; Stage 8 builds the controls UI. The state lives in `prototypeStore` (persisted) and is mirrored into the `simulation` and `clock` services that the data layer reads.

## Scenarios (the "Seed scenario" selector)

One selector drives two independent things — which **dataset** is built and which **network** condition is emulated:

| Scenario              | Dataset   | Network | What you see                                                                                             |
| --------------------- | --------- | ------- | -------------------------------------------------------------------------------------------------------- |
| **Normal** (default)  | Normal    | Online  | 18 leads, 7 visits (2 today), 3 overdue tasks, 8 conversations, 14 notifications, 120 plots              |
| **Busy day**          | Busy day  | Online  | +3 visits today (5 total), +9 tasks (incl. 2 more overdue), +2 notifications                             |
| **Empty CRM**         | Empty CRM | Online  | No leads, tasks, visits, messages, notifications or timeline. **Inventory remains** (it is not CRM data) |
| **Offline**           | Normal    | Offline | Every repository call rejects with `RepositoryError('OFFLINE')`                                          |
| **Repository errors** | Normal    | Errors  | Every repository call rejects with `RepositoryError('SERVER_ERROR')`                                     |

Also independent: **Simulated latency** (250–700 ms, deterministic sequence) and **Clock** (Demo / Real).

Switching scenario or clock mode rebuilds the database on the next repository call (the dataset fingerprint changes) and bumps `datasetRevision`, which makes every `useAsyncResource` refetch — no manual reload.

### Driving it today (before the Stage 8 UI)

```ts
import { usePrototypeStore } from '@/store/prototypeStore';

const s = usePrototypeStore.getState();
s.setScenario('OFFLINE'); // NORMAL | BUSY_DAY | EMPTY_CRM | OFFLINE | REPOSITORY_ERRORS
s.setLatencyEnabled(true);
s.setClockMode('REAL'); // 'DEMO' | 'REAL'
await s.resetData(); // discard local mutations, re-seed
```

Tests use isolated instances instead (`__tests__/helpers.ts → createTestRepositories`) so they never touch global state.

## The demo clock

`clock.now()` is the only source of "now". **Demo mode** is frozen at **Mon 21 Sep 2026, 09:15** (local time; built from local calendar parts, so it reads 09:15 in any timezone) — today's tasks and visits are meaningful whenever the app is opened. **Real mode** uses the device clock and _re-anchors the seed_ to today, so "follow up at 10:30 today" stays today.

Consequences to design around:

- Demo "now" is 09:15, so 09:30 is upcoming and 10:30 is the next action; three tasks are overdue (yesterday 18:00, yesterday 16:00, three days ago).
- Real mode: seeded "today" times may already be past (they are fixed clock times), which correctly shows as overdue. Mutations are discarded when the calendar day changes.
- Never call `new Date()` in features or repositories — ask the clock.

## Error model

Repositories throw `RepositoryError` (`src/repositories/contracts/errors.ts`):

| Code            | Trigger                                                                          | `retryable` | Screen behaviour                                                             |
| --------------- | -------------------------------------------------------------------------------- | ----------- | ---------------------------------------------------------------------------- |
| `OFFLINE`       | Offline scenario / no connectivity                                               | yes         | "You're offline — Previously loaded prototype data is available." (spec §22) |
| `SERVER_ERROR`  | Errors scenario / 5xx                                                            | yes         | "Couldn't load leads — Your prototype data is still safe." **[Try again]**   |
| `NOT_FOUND`     | Unknown id on a write / bad link                                                 | no          | Recover by navigating back or showing an empty state                         |
| `INVALID_INPUT` | Validation (blank title, plot not available to hold, plot from another project…) | no          | Inline error text                                                            |

`RepositoryError.message` is for logs only. **Never render `.message` or a stack trace** — a test asserts the profile screen shows friendly copy and not the simulated message. "Try again" calls `useAsyncResource(...).reload`.

Nuance: `OFFLINE` should show _previously loaded_ data where the screen has any. `useAsyncResource` currently drops data on error; a stale-while-revalidate option belongs to Stage 4 if the offline copy is to be truthful.

## State matrix (what each feature must show, and how to trigger it)

| Feature                                                  | Populated         | Loading (skeleton) | Empty                                                                                   | Error / Offline              |
| -------------------------------------------------------- | ----------------- | ------------------ | --------------------------------------------------------------------------------------- | ---------------------------- |
| Home, Leads, Tasks, Visits, Inbox, Notifications, Search | Normal / Busy day | Latency on         | **Empty CRM**                                                                           | Repository errors / Offline  |
| Projects, Inventory, Plot detail                         | Normal            | Latency on         | Filter that matches nothing (inventory is never empty in any scenario)                  | Repository errors / Offline  |
| Lead detail, Visit detail, Conversation                  | Normal            | Latency on         | Lead with no next action (`lead_015`, `lead_008`) or no visits (`lead_015`), unknown id | Repository errors / Offline  |
| Profile                                                  | Normal            | Latency on         | —                                                                                       | Repository errors (verified) |

Useful seeded edge cases: `lead_013` sparse requirement (no budget/timeline), `lead_015` no next action, `lead_008` won (booked plot), `lead_009` lost (reason), `lead_002` new with unread message, `lead_003` overdue.

## Persistence and reset

- The whole mock database is saved under one storage key after every mutation and rehydrated on the next launch, after Zod validation.
- Fingerprint = `seedVersion : scenario : calendar-day`. A mismatch rebuilds; corrupt JSON or invalid data also rebuilds (tested).
- `resetData()` deletes the stored database and re-seeds for the current scenario/clock. Signing out does not reset. Bump `SEED_VERSION` (`src/constants/prototype.ts`) whenever seed _shape or content_ changes so stale persisted databases rebuild.
- Prototype Holds only mutate local mock data and must always be labelled **Prototype Hold** in the UI (spec §14.9).

## Rules for building states

Every screen must label seeded data so it never pretends to be live (spec §17.17) — use `PROTOTYPE_BADGE_LABEL`. Every async call needs a loading state; every list needs an empty state; every error must be recoverable.
