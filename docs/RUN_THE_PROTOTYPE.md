# Run and check the prototype

Vara Real Estates — associate app, Phase 1. Everything runs on **seeded demo data on your device**: no server, no account, nothing to sign up for. This page gets it running and tells you what to look at.

## 1. Start it

**You need:** Node 20 or newer (tested on Node 24) and npm. For a phone, the Expo Go app; for Android/iOS emulators, Android Studio / Xcode.

```bash
npm install          # once
npm start            # opens the Expo dev server
```

Then pick one:

| Where                 | How                                                                                                                                                                             |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Browser (fastest)** | Press `w` in the terminal, or run `npm run web`. Open the browser's device toolbar (F12 → Ctrl+Shift+M) and choose a phone, e.g. **390 × 844**.                                 |
| **Your phone**        | Install **Expo Go**, scan the QR code from the terminal (same Wi-Fi). This project targets **Expo SDK 57** — use an Expo Go build that supports SDK 57, or a development build. |
| **Android emulator**  | Start an emulator, then press `a` (or `npm run android`).                                                                                                                       |
| **iOS simulator**     | macOS only: press `i` (or `npm run ios`).                                                                                                                                       |

If something looks stale, restart with a clean cache: `npx expo start -c`.

> The browser preview is the quickest way to review layout and flow. Haptics, fonts on device, safe areas and gesture feel are only truly judged on a phone — and the app has **not yet been run on hardware** (see [QA_CHECKLIST.md](QA_CHECKLIST.md)).

## 2. Sign in

There are two ways in. Nothing is real: any valid mobile number is accepted, and the code is always **123456**.

| Home card        | What you get                                                    | Demo number                          |
| ---------------- | --------------------------------------------------------------- | ------------------------------------ |
| **Guest**        | Browse Our Projects. No sign-in.                                | —                                    |
| **Associate**    | The dashboard, team, bookings, sales, visits (dock navigation). | `9876543210` (K. V. Raghunath Reddy) |

Tap **Use demo number** on the login screen to fill it in.

## 3. A ten-minute walkthrough

1. **Home.** The dark card counts up to the total registered sq. yards; the three stats under it are completed / ongoing projects and available plots. Tap the three cards — the check springs in and the button changes (_Continue as guest_ / _Login_).
2. **Guest → Our Projects.** Filter Ongoing / Completed (counts on the chips). Open a project → **View inventory** → tap a plot. As a guest you see facts and a cost preview but no booking button. Each card also has **View Gallery**, below View inventory, for the project's photos.
3. **Back, then Associate login → OTP → Dashboard.** Watch the sections rise in one after another. Tap the **eye** on the dark card to mask the figures (it is remembered).
4. **The dock** (bottom): Home · Projects · Team · Profile. The selected item widens and shows its label. It disappears on pushed screens, which have a back button instead.
5. **Menu** (top-left round button): Profile, Settings, Prototype controls, Sign out.
6. Walk the **seven sections** on the dashboard:
   - **Our Projects** — the same list, with the dock.
   - **Live Booking** — pick a project, tap a plot (it turns green), **Continue** → enter a customer name → **Review and confirm** → **Confirm booking**. A success mark plays once. Then **View team sales**: the new sale is at the top of this month, and the progress bars have moved.
   - **Price Calculator** — pick a project and a plot to fill the numbers, or type them; the total counts as you type. It says it is not a quotation.
   - **Site Visits History** — your visits with status; filter Upcoming / Completed; open one for the outcome and shortlisted plots.
   - **Team Sales** — switch months; hatched green progress bars against the target; top sellers; sales list.
   - **Add Team Member** — leave it empty and press **Add member** to see the field errors; try `9876500017` (already used) for the duplicate message; then add a real one.
   - **My Team** — the new member is at Level 1; filter by level; open a member.
7. **Profile → Sign out** returns you to Home.

## 4. See every state (Prototype controls)

Dashboard menu → **Prototype controls** (or Settings → Prototype controls). The scenario changes the data or the connection, live:

| Scenario              | Look at                                                                                                                                                          |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Normal                | The default day.                                                                                                                                                 |
| Busy day              | More visits in Site Visits History.                                                                                                                              |
| **Empty CRM**         | Dashboard **My sales** and **Team site visits** read **Pending — Not yet added** (not 0); Team Sales shows 0% against target and "No sales recorded this month". |
| **Offline**           | Every screen shows the recoverable "You're offline" state with a retry. Home still lets you continue.                                                            |
| **Repository errors** | "Couldn't load …" with **Try again**. Switch back to Normal and the screen recovers by itself.                                                                   |

Also there: **Real clock** (off = frozen at 21 Sep 2026, 9:15 AM, so "Good morning" and relative dates make sense), **Simulated latency** (250–700 ms, to see the skeletons), and **Reset demo data** (also in Settings) — this discards bookings and members you added.

## 5. Check the micro-interactions

| Where                           | What to feel or watch                                                                               |
| ------------------------------- | --------------------------------------------------------------------------------------------------- |
| Any button, card, chip, row     | A short spring press (and a tap on a phone). Rows tint instead of shrinking.                        |
| Home and Dashboard              | Hero figure counts up; cards and rows stagger in (a quick, capped cascade).                         |
| Team Sales / Live Booking       | Progress bars fill with the knob riding the end; the success mark pops once and a ring fades out.   |
| Dock                            | The selected item widens with a spring; the label fades in.                                         |
| Login cards, toggles            | The check springs in; the switch thumb slides.                                                      |
| Menu, Confirm booking, Reset    | Bottom sheets spring up, drag down to dismiss; toasts rise and fade after ~3 s.                     |
| **Settings → Motion → Reduced** | Everything above is still correct but nothing slides or counts — figures and bars are simply there. |

## 6. Design system gallery (development builds)

Open `/dev/design-system` (type it in the browser address bar, or use the dev menu). It shows every component in every state on real seeded data, including the new **Vara blocks** section: brand mark, the whole icon set, hero card, summary tiles, navigation rows, dock, progress bar and success mark. It is not present in production builds.

## 7. Run the checks

```bash
npm run validate     # typecheck + lint + all tests (449 at the time of writing)
npm run doctor       # Expo environment check
```

## 8. If something goes wrong

| Symptom                                  | Try                                                                                                                     |
| ---------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Blank or old screen after edits          | `npx expo start -c` (clears the Metro cache).                                                                           |
| Phone can't reach the dev server         | Same Wi-Fi as the computer; allow Node through the firewall; or use the browser preview / an emulator.                  |
| Expo Go says the project is incompatible | This project needs SDK 57. Update Expo Go, or use a development build. Do **not** upgrade the project to SDK 58 (beta). |
| Signed in but the wrong screen           | Settings → Reset demo data, or sign out from Profile. In the browser you can also clear site data for the page.         |
| Port already in use                      | `npx expo start --port 8090`.                                                                                           |

## 9. What this prototype is not

Bookings are **prototype records**: no payment, no real inventory lock, nothing leaves the device. Sign-in is a demo (any valid number, fixed code) and is **not secure**. Project names, people and phone numbers are invented. See [AGENT_HANDOFF.md](AGENT_HANDOFF.md) for the current state and next steps.
