import { PlaceholderAction, PlaceholderLink, PlaceholderScreen } from '@/components/feedback';
import { useAuthStore } from '@/store/authStore';

/** 1 · HOME PAGE — the only screen a signed-out user lands on. */
export default function PublicHomeScreen() {
  const continueAsGuest = useAuthStore((state) => state.continueAsGuest);
  return (
    <PlaceholderScreen
      title="Home"
      route="/home"
      description="Public landing: logo, summary container (Total Registered Sq. Yards, Completed Projects, Ongoing Projects, Available Plots), then Guest / Associate / Simple login cards and a LOGIN button. Built in Stage A."
    >
      <PlaceholderAction label="Guest login" onPress={continueAsGuest} />
      <PlaceholderLink href="/associate-login" label="Associate login" />
      <PlaceholderLink href="/simple-login" label="Simple login" />
    </PlaceholderScreen>
  );
}
