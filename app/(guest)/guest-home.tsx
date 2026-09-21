import { PlaceholderAction, PlaceholderLink, PlaceholderScreen } from '@/components/feedback';
import { useAuthStore } from '@/store/authStore';

/** 4 · GUEST SCREEN — header "Our Projects" and one row. Shared by guest and client sessions. */
export default function GuestHomeScreen() {
  const signOut = useAuthStore((state) => state.signOut);
  return (
    <PlaceholderScreen
      title="Our Projects"
      route="/guest-home"
      description="Guest hub: a single OUR PROJECTS row (project details, status, locations) and a way back to Home. Built in Stage A."
    >
      <PlaceholderLink href="/projects" label="Our Projects" />
      <PlaceholderAction label="Back to Home" onPress={signOut} />
    </PlaceholderScreen>
  );
}
