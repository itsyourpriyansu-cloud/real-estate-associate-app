# Domain schema

Zod schemas in `src/domain` are the **only** source of domain types (`z.infer`). Never redeclare a domain type. Everything is re-exported from `@/domain`. The same schemas validate seed fixtures, persisted prototype data and (later) API responses.

## Conventions

- **Ids** — opaque non-empty strings. Seed ids are readable (`lead_001`, `plot_rr_026`, `prj_real_rise`, `visit_002`, `task_001`, `conv_001`, `msg_001_003`, `notif_001`, `tl_001`, `usr_raghunath`); an API may return UUIDs. Code must never parse ids.
- **Timestamps** — ISO-8601 (`z.iso.datetime({ offset: true })`).
- **Phones** — E.164 (`+919876543210`). Formatting is a presentation concern. Seed leads use synthetic sequential numbers (`+919000000001…`) and `@example.com` emails.
- **Money** — whole-rupee integers (`inrAmountSchema`). Format as ₹40L / ₹1.2Cr in the UI. Area is square yards.
- **Images** — `heroImageUrl` / `thumbnailUrl` / `galleryImages[]` are strings: either a remote URL (a future API, or the seeded stock photography) or a `placeholder://projects/<key>/<hero|thumb>` key resolved to a drawn site-plan asset by `ProjectImage`. Never a `require()` result, so the field stays serialisable.

## Entities

| Entity (file)               | Key fields                                                                                                                                                                                                                                                                      |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `User` (`user.ts`)          | `id, role (ASSOCIATE\|TEAM_LEAD), fullName, phone, email?, avatarUrl?, associateCode, designation, teamName?, sponsorId?, joinedAt, status (ACTIVE\|INACTIVE), reraRegistration?` (demo label only). `sponsorId` is the direct upline; the chain is the My Team tree    |
| `Lead` (`lead.ts`)          | `id, fullName, phone, email?, source, sourceLabel?, stage, priority, assignedUserId, createdAt, updatedAt, lastActivityAt?, nextActionAt?, nextActionLabel?, requirement, tags[], notesCount, unreadMessages` **+ 3 extensions below**                                          |
| `LeadRequirement`           | `budgetMin?, budgetMax?, preferredLocations[], propertyTypes[], areaMinSqYd?, areaMaxSqYd?, preferredFacing[]?, purpose?, purchaseTimeline?, loanRequired?` — refined: min ≤ max                                                                                                |
| `TimelineEvent` (`lead.ts`) | `id, leadId, type (10 kinds), occurredAt, title, description?, actorName?, metadata?` — metadata may carry `projectId`, `plotId`, `visitId`, `fromStage`, `toStage`                                                                                                             |
| `Project` (`project.ts`)    | `id, name, developerName, location, city, status (ONGOING\|COMPLETED\|UPCOMING), hero/thumbnail/galleryImages[], startingPrice, maxPrice?, min/maxPlotAreaSqYd, availableUnits, totalUnits, reraNumber?, possessionLabel?, description, amenities[], highlights[]` — refined: available ≤ total |
| `Plot` (`plot.ts`)          | `id, projectId, plotNumber, phase?, block?, status, areaSqYd, facing, roadWidthFt, isCorner, baseRatePerSqYd, premiumAmount?, estimatedTotal, holdExpiresAt?`                                                                                                                   |
| `Task` (`task.ts`)          | `id, type, title, leadId?, projectId?, scheduledAt, status, priority, notes?`                                                                                                                                                                                                   |
| `SiteVisit` (`visit.ts`)    | `id, leadId, projectId, associateId, scheduledAt, status (6), shortlistedPlotIds[], outcome?, feedbackTags[], note?`                                                                                                                                                            |
| `Conversation` / `Message`  | `Conversation{ id, leadId, unreadCount, lastMessageAt, messages[] }`, `Message{ id, direction, kind, body, sentAt, status? }`                                                                                                                                                   |
| `AppNotification`           | `id, type, title, body, createdAt, read, deepLink?` (an in-app route)                                                                                                                                                                                                           |
| `Sale` (`sale.ts`)          | `id, plotId, projectId, associateId, customerName, customerPhone?, areaSqYd, amount, bookedAt, status (BOOKED\|REGISTERED\|CANCELLED)`. Area and amount are copied from the plot at booking time                                                                                |
| `SalesTarget` (`sale.ts`)   | `id, teamName, period (YYYY-MM), targetAreaSqYd, targetAmount`                                                                                                                                                                                                                  |
| `TeamMember` (`team.ts`)    | `User` + `level` (1 = direct). A view of the caller's downline, not a stored entity. Input: `addTeamMemberInputSchema`                                                                                                                                                          |
| Summaries (`summary.ts`)    | `PublicSummary` (Home) and `AssociateSummary` (dashboard). `mySales` and `teamSiteVisits` are `{state:'READY',value}` or `{state:'PENDING'}`. Aggregates, not stored                                                                                                            |
| Pricing (`pricing.ts`)      | `plotCostInputSchema` and the pure `calculatePlotCost` giving `{ baseAmount, premiumAmount, total }` (matches `Plot.estimatedTotal`, tested for every plot)                                                                                                                     |

Enum arrays are exported (`leadStageSchema.options`, `plotStatusSchema.options`, …). `leadStageSchema.options` is the canonical pipeline order for the stage rail.

### Deviations from the spec's schemas (all additive)

| Field                     | Why                                                                                                   |
| ------------------------- | ----------------------------------------------------------------------------------------------------- |
| `Lead.shortlistedPlotIds` | "Shortlist for Lead" (§14.9) must work with no visit; the spec only stores shortlists on `SiteVisit`. |
| `Lead.lostReason?`        | Spec §12 requires "lost lead reason".                                                                 |
| `Lead.bookedPlotId?`      | Spec §16 requires a "monthly booking count/value"; needs a plot to price. Set on WON leads.           |

A real API must return these three fields too (or the API repository must synthesise them).

## Relationships

```text
User 1───* Lead 1───* TimelineEvent
             │ 1───0..1 Conversation 1───* Message
             │ 1───* Task ───0..1 Project
             │ 1───* SiteVisit ───1 Project        (SiteVisit.shortlistedPlotIds ⊂ that project's plots)
             │ *───* Plot   via Lead.shortlistedPlotIds ; 0..1 via Lead.bookedPlotId
Project 1───* Plot
User 0..1───* User            (sponsorId: the downline tree, same teamName)
User 1───* Sale *───1 Plot          (one Sale per BOOKED plot in the seed)
teamName 1───* SalesTarget
AppNotification.deepLink ──▶ a route + an existing entity id
```

All foreign keys resolve in every scenario (tested for Normal, Busy day and Empty CRM).

## Stored vs derived

| Value                                                         | Rule                                                                                                                                        |
| ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `Task.status = OVERDUE`                                       | **Derived** by repositories: `OPEN` and `scheduledAt < clock.now()`. Seed stores only `OPEN`/`DONE`. (`deriveTaskStatus`)                   |
| `Lead.nextActionAt/Label`                                     | Earliest not-done task for the lead; cleared when none. Refreshed by task create/complete and visit schedule/complete. (`deriveNextAction`) |
| `Lead.createdAt`, `lastActivityAt`, `updatedAt`, `notesCount` | From the timeline (`LEAD_CREATED` event, latest event, `NOTE` count). Appending an event updates them.                                      |
| `Lead.unreadMessages`                                         | Equals the lead's `Conversation.unreadCount`.                                                                                               |
| `Project.availableUnits / totalUnits`                         | Recomputed from the plot table on every read, so a Prototype Hold is reflected immediately.                                                 |
| `Plot.estimatedTotal`                                         | `areaSqYd × baseRatePerSqYd + premiumAmount`. A cost **preview**, never a legal quotation.                                                  |
| `Project.availableUnits` after a booking                      | Live Booking flips the plot to `BOOKED` and adds a `Sale`; unit counts, registered sq yds and sales totals all follow.                      |
| `PublicSummary.totalRegisteredSqYd`                           | Sum of `areaSqYd` over `BOOKED` plots.                                                                                                      |
| `AssociateSummary.myTeam` / `teamMembers`                     | `myTeam` is the caller's downline; `teamMembers` is every sales-role user with the same `teamName`.                                         |
| `Plot.premiumAmount`                                          | 5% corner + 2% north/east facing, rounded to ₹1,000 (seed formula; a real API supplies its own).                                            |

## Seed data (Normal scenario)

| Table         | Count | Notes                                                                                                                                                                                                                                                                |
| ------------- | ----- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| users         | 18    | Associate _K. V. Raghunath Reddy_ (Senior Associate, YH-APL2-1048, YHIPL2), a team lead, 14 YHIPL2 members (9 in the associate's downline: 4 direct, 4 at level 2, 1 at level 3) and 2 in another team. Team = 16, My Team = 9              |
| leads         | 18    | All 9 stages, 4 priorities, 8 sources; budgets ₹20L–₹1.3Cr; overdue and future follow-ups; leads with/without visits; 4 with unread messages; a lost lead with reason; a won lead with a booked plot; leads with no next action; one deliberately sparse requirement |
| projects      | 4     | Sunrise Meadows (Bangalore Highway), Emerald Hills (Airport Corridor), Silver Creek (Hyderabad Highway), Maple Ridge (Outer Ring Growth Zone) — fictional, all developed by Vara Real Estates, with `DEMO-RERA-*` labels and seeded stock photography              |
| plots         | 120   | 36 / 30 / 30 / 24. Every status appears in every project (74 available). Varied sizes, facings, road widths, corners                                                                                                                                                 |
| tasks         | 18    | 6 today, 3 overdue, 7 upcoming, 2 done                                                                                                                                                                                                                               |
| visits        | 7     | 2 today (Rohit 12:00, Rahul 15:30), 1 tomorrow, 4 completed                                                                                                                                                                                                          |
| conversations | 8     | 4 unread; kinds `TEXT`, `PROJECT_CARD`, `COST_SHEET`, `VISIT_CONFIRMATION`                                                                                                                                                                                           |
| sales         | 20    | One per booked plot; sold by the associate, the downline, other YHIPL2 members and another team. Kavitha Menon's plot is the associate's                                                                                                                             |
| salesTargets  | 3     | YHIPL2 monthly targets for this month and the previous two                                                                                                                                                                                                           |
| notifications | 14    | All four types; every `deepLink` resolves to a real route and entity                                                                                                                                                                                                 |
| timeline      | 68    | Every lead has a `LEAD_CREATED` event; no event is in the future of demo "now"                                                                                                                                                                                       |

**Scenario variants:** _Busy day_ adds 3 visits today, 9 tasks (incl. 2 more overdue) and 2 notifications. _Empty CRM_ empties leads, timeline, tasks, visits, conversations, notifications and sales and keeps users (the team), projects, plots and targets, so the dashboard's My Sales and Team Site Visits read _pending_.

Project statuses: Sunrise Meadows and Silver Creek are `COMPLETED`; Emerald Hills and Maple Ridge are `ONGOING`.

### Walkthrough anchors (spec §27)

| Step                              | Data                                                                                                                                       |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Home names the next action        | Rahul Sharma — "Follow up on Real Rise shortlist", 10:30 (`task_001`), budget ₹40–55L                                                      |
| Rahul's recommended plot          | Real Rise · **Plot 26** · 240 sq yd · East · 40 ft · Available · ₹44.06L (`plot_rr_026`) — fits his budget, size and facing (tested)       |
| Today's site visit                | `visit_001` Rahul @ Real Rise 15:30 (Confirmed); `visit_002` Rohit @ Cedar Enclave 12:00 (Scheduled)                                       |
| Rahul's seeded thread             | `conv_001` — 6 messages, 2 unread                                                                                                          |
| "Search Plot 26"                  | Matches Plot 26 in Real Rise, Aurelia Greens and Northgate County — three results, grouped (word-prefix search: "26" does not match "260") |
| Held / booked / blocked inventory | Arjun's hold `plot_ce_010` (ends tomorrow 20:00); a hold ending today `plot_ag_019`; Kavitha's booked plot `plot_rr_008`                   |
