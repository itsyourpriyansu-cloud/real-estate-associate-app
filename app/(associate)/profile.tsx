import { PlaceholderAction, PlaceholderScreen } from '@/components/feedback';
import { useCurrentUser } from '@/features/profile/useCurrentUser';
import { useAuthStore } from '@/store/authStore';

export default function ProfileScreen() {
  const user = useCurrentUser();
  const signOut = useAuthStore((state) => state.signOut);

  // Wiring proof: this text travels screen → feature hook → repository contract → mock → seed.
  const summary =
    user.status === 'success' && user.data
      ? `${user.data.fullName} · ${user.data.designation} · ${user.data.associateCode}`
      : user.status === 'error'
        ? 'Couldn’t load your profile.'
        : 'Loading…';

  return (
    <PlaceholderScreen back title="Profile" route="/profile" description={summary}>
      <PlaceholderAction label="Sign out" onPress={signOut} />
    </PlaceholderScreen>
  );
}
