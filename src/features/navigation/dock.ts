import type { Href } from 'expo-router';

import { icons, type DockItem } from '@/components';

export type DockKey = 'home' | 'projects' | 'team' | 'profile';

export const DOCK_ITEMS: (DockItem & { key: DockKey })[] = [
  { key: 'home', label: 'Home', icon: icons.home },
  { key: 'projects', label: 'Projects', icon: icons.projects },
  { key: 'team', label: 'Team', icon: icons.myTeam },
  { key: 'profile', label: 'Profile', icon: icons.profile },
];

const HREF: Record<DockKey, Href> = {
  home: '/dashboard',
  projects: '/projects',
  team: '/team',
  profile: '/profile',
};

export const dockHref = (key: DockKey): Href => HREF[key];

/**
 * Which dock item a route belongs to, or undefined when the dock should be hidden. The dock is
 * shown only on the four top-level destinations; pushed screens (a project, a plot, Add Member)
 * have a back button instead and keep the whole screen for their content.
 */
export function dockKeyFor(pathname: string): DockKey | undefined {
  const path = pathname.replace(/\/+$/, '') || '/';
  switch (path) {
    case '/dashboard':
      return 'home';
    case '/projects':
      return 'projects';
    case '/team':
      return 'team';
    case '/profile':
      return 'profile';
    default:
      return undefined;
  }
}
