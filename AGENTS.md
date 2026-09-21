# Agent rules — Real Estate Associate App (Phase 1)

Expo SDK 57 has changed from earlier SDKs. Read the versioned docs at https://docs.expo.dev/versions/v57.0.0/ before writing Expo code. Do **not** upgrade to Expo SDK 58 (beta).

The single source of truth is `docs/REAL_ESTATE_ASSOCIATE_PHASE1_CLAUDE_MASTER.md`. Project decisions and the list of deliberate deviations from it are in `docs/ARCHITECTURE.md`. Start with `docs/AGENT_HANDOFF.md`.

## Hard rules (enforced by ESLint and `__tests__/architecture.test.ts`)

1. **No screen, feature, component or hook imports `@/seed` or `@/repositories/mock`.** Read data through a feature hook that calls a repository contract from `@/repositories`.
2. **No raw hex colours** (or spacing / type / radius / shadow constants) outside `src/design-system`. Use `theme` tokens.
3. **No `any`.** Zod schemas in `src/domain` are the only source of domain types — do not redeclare them.
4. **Zustand holds session, preferences and prototype controls only.** Never entities. Entities live behind repositories.
5. **Dates come from the `Clock` service**, never `new Date()` in features/repositories. Seed timestamps are relative to the clock anchor.
6. **No new dependency without a reason recorded in `docs/ARCHITECTURE.md`.**
7. **Every handoff updates `docs/AGENT_HANDOFF.md`.** Every change leaves `npm run validate` green.

## Design-system rules (Stage 2, enforced by `__tests__/architecture.test.ts`)

- Use `AppText`, `Button`, `PressableScale`/`PressableCard`, `Icon`, `ScreenLayout` from `@/components`. Screens and features never import raw RN `Text`/`Pressable`/`Switch`/`TextInput`.
- No literal radius, spacing, font size, shadow or animation duration in UI code — use tokens. (Component _dimensions_ like a 44pt target are fine.)
- Never nest interactive elements. Cards with action buttons use `PressableCard` + `CardPressRegion`.
- Essential text uses `textSecondary` or brighter. `textTertiary` is 3.5–4.2:1 — placeholders/decorative only.
- Every new component goes in the gallery (`src/features/dev/sections/`) and gets a test.

## Commands

`npm run validate` (typecheck + lint + tests) · `npm run doctor` · `npm start` · `npm run web` (browser preview for visual QA)

## Gotchas discovered in Stage 1

- TypeScript 6 defaults `types` to `[]`; test/node types are declared explicitly in `tsconfig.json`.
- Import Inter weights from `@expo-google-fonts/inter/<weight>` subpaths — the package root bundles all 18 font files (~6 MB).
- `expo-asset` and `react-dom@19.2.3` are explicit dependencies for peer-resolution reasons (see ARCHITECTURE.md).
- `@testing-library/react-native` v14: `render`, `renderHook` and `fireEvent` are async — `await` them.
- RNTL 14's `act` is **async**: always `await act(async () => …)`. An un-awaited `act` leaves React's act scope open and silently stops all later updates from flushing.
- Reanimated shared values: use `sv.set(x)` (not `sv.value = x`) — the Expo lint config's React-Compiler rules flag the latter.
- Jest needs `react-native-gesture-handler/jestSetup`, the Reanimated + worklets mocks (see `jest.setup.ts`), and lucide mapped to its CJS build (`jest.config.js`).
- Bash `--` argument and inline-heredoc quoting on Windows is fragile; write scripts to files.
