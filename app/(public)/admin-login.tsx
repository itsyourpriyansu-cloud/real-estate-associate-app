import { AdminLoginScreen } from '@/features/auth/AdminLoginScreen';

/** Hidden admin login — reached only by direct URL, never linked from Home. */
export default function AdminLoginRoute() {
  return <AdminLoginScreen />;
}
