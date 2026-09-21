import { useLocalSearchParams } from 'expo-router';

import { BookingConfirmScreen } from '@/features/booking/BookingConfirmScreen';

/** Live Booking confirm step for one plot. */
export default function LiveBookingConfirmRoute() {
  const { plotId } = useLocalSearchParams<{ plotId: string }>();
  return <BookingConfirmScreen plotId={plotId} />;
}
