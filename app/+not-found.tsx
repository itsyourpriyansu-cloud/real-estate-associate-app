import { PlaceholderLink, PlaceholderScreen } from '@/components/feedback/PlaceholderScreen';

export default function NotFound() {
  return (
    <PlaceholderScreen
      title="Screen not found"
      route="+not-found"
      description="This link doesn’t match any screen in the prototype."
    >
      <PlaceholderLink href="/" label="Go to start" />
    </PlaceholderScreen>
  );
}
