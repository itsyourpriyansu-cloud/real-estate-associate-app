import { LoginScreen } from '@/features/auth/LoginScreen';

/** SIMPLE LOGIN — client number, phone → OTP → Our Projects only. */
export default function SimpleLoginScreen() {
  return <LoginScreen as="client" />;
}
