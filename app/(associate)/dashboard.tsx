import { PlaceholderAction, PlaceholderLink, PlaceholderScreen } from '@/components/feedback';
import { useAuthStore } from '@/store/authStore';

/** 3 · ASSOCIATE DASHBOARD — two summary containers and the seven sections. */
export default function DashboardScreen() {
  const signOut = useAuthStore((state) => state.signOut);
  return (
    <PlaceholderScreen
      title="Dashboard"
      route="/dashboard"
      description="Summary container 1 (Total Registered Sq. Yards, Team Total Sales, Team Members, My Team), summary container 2 (My Sales, Team Site Visits — each may read “Pending / Not yet added”), then the seven section rows. The hamburger opens a menu sheet for Profile, Settings, Prototype controls and Sign out. Built in Stage C."
    >
      <PlaceholderLink href="/projects" label="1. Our Projects" />
      <PlaceholderLink href="/live-booking" label="2. Live Booking" />
      <PlaceholderLink href="/price-calculator" label="3. Price Calculator" />
      <PlaceholderLink href="/site-visits" label="4. Site Visits History" />
      <PlaceholderLink href="/team-sales" label="5. Team Sales" />
      <PlaceholderLink href="/team/add" label="6. Add Team Member" />
      <PlaceholderLink href="/team" label="7. My Team" />
      <PlaceholderLink href="/profile" label="Profile" />
      <PlaceholderLink href="/settings" label="Settings" />
      <PlaceholderAction label="Sign out" onPress={signOut} />
    </PlaceholderScreen>
  );
}
