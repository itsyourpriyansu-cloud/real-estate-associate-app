import { Redirect } from 'expo-router';

import { landingFor } from '@/features/auth/sessionAccess';
import { selectSessionKind, useAuthStore } from '@/store/authStore';

/** Entry route: send the user to the landing screen for the persisted session. */
export default function Index() {
  const kind = useAuthStore(selectSessionKind);
  return <Redirect href={landingFor(kind)} />;
}
