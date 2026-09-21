import { useLocalSearchParams } from 'expo-router';

import { PlaceholderScreen } from '@/components/feedback';

/** Live Booking confirm step for one plot. */
export default function LiveBookingConfirmScreen() {
  const { plotId } = useLocalSearchParams<{ plotId: string }>();
  return (
    <PlaceholderScreen
      back
      title="Confirm booking"
      route={`/live-booking/${plotId}`}
      description="Customer details, cost preview and confirmation; writes a Sale via SalesRepository.createBooking. Built in Stage F."
    />
  );
}
