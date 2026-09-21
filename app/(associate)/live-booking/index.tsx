import { PlaceholderLink, PlaceholderScreen } from '@/components/feedback';

/** Dashboard 2 · LIVE BOOKING — pick a project and plot. */
export default function LiveBookingScreen() {
  return (
    <PlaceholderScreen
      back
      title="Live Booking"
      route="/live-booking"
      description="Live plot booking: choose a project, then an available plot. Prototype hold and booking record only — no payments, no real inventory locking. Built in Stage F."
    >
      <PlaceholderLink
        href={{ pathname: '/live-booking/[plotId]', params: { plotId: 'preview' } }}
        label="Confirm step (route check)"
      />
    </PlaceholderScreen>
  );
}
