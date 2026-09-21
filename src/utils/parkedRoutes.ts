import type { Href } from 'expo-router';

type ParkedHref = string | { pathname: string; params?: Record<string, string> };

/**
 * The CRM shell (Home, Leads, Tasks, Inbox, Notifications, Search and the lead / conversation /
 * visit detail screens) is parked: its route files are no longer in `app/`, so typed routes do not
 * know those paths. Parked screens navigate through this cast to keep compiling. To re-attach a
 * route, add its file under `app/` and delete the `parked(...)` wrapper at each call site.
 */
export function parked(href: ParkedHref): Href {
  return href as Href;
}
