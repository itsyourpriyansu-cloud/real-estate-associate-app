import { PlaceholderLink, PlaceholderScreen } from '@/components/feedback';

export default function PrototypeControlsScreen() {
  return (
    <PlaceholderScreen
      back
      title="Prototype controls"
      route="/prototype-controls"
      description="Scenario (Normal, Busy day, Empty CRM, Offline, Repository errors), demo clock, simulated latency and reset. The state lives in prototypeStore; the controls UI is built in a later stage."
    >
      {__DEV__ ? (
        <PlaceholderLink href="/dev/design-system" label="Open the design-system gallery" />
      ) : null}
    </PlaceholderScreen>
  );
}
