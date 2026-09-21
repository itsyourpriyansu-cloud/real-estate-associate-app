import { useRouter } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import {
  AppText,
  Button,
  ChoiceChip,
  DetailHeader,
  Divider,
  Reveal,
  ScreenLayout,
  SettingRow,
  SummaryPanel,
  icons,
  useToast,
} from '@/components';
import { space } from '@/design-system';
import { SCENARIO_PROFILES, type PrototypeScenario } from '@/services/simulation';
import { usePrototypeStore } from '@/store/prototypeStore';

const SCENARIOS = Object.keys(SCENARIO_PROFILES) as PrototypeScenario[];

/**
 * Prototype controls (spec §20): pick a scenario, freeze or free the demo clock, add latency, and
 * reset. Everything here changes the demo data or transport, never the real app. Available to
 * every signed-in session so a reviewer can try Offline or Empty states from anywhere.
 */
export function PrototypeControlsScreen() {
  const router = useRouter();
  const toast = useToast();
  const state = usePrototypeStore();
  const [resetting, setResetting] = useState(false);

  const reset = async () => {
    setResetting(true);
    await state.resetData();
    setResetting(false);
    toast.show({ tone: 'success', message: 'Demo data reset.' });
  };

  return (
    <ScreenLayout
      edges={['top', 'bottom']}
      header={<DetailHeader title="Prototype controls" onBack={() => router.back()} />}
    >
      <Reveal index={0}>
        <SummaryPanel title="Scenario">
          <AppText tone="secondary">
            Changes the demo data or the connection, so you can see every state of every screen.
          </AppText>
          <View style={{ gap: space[8] }}>
            {SCENARIOS.map((scenario) => (
              <View key={scenario} style={{ gap: space[4] }}>
                <ChoiceChip
                  label={SCENARIO_PROFILES[scenario].label}
                  selected={state.scenario === scenario}
                  onPress={() => state.setScenario(scenario)}
                />
                {state.scenario === scenario ? (
                  <AppText
                    variant="bodySM"
                    tone="secondary"
                    style={{ paddingHorizontal: space[4] }}
                  >
                    {SCENARIO_PROFILES[scenario].description}
                  </AppText>
                ) : null}
              </View>
            ))}
          </View>
        </SummaryPanel>
      </Reveal>

      <Reveal index={1}>
        <SummaryPanel title="Time and speed">
          <View>
            <SettingRow
              label="Real clock"
              description="Off keeps the demo on 21 September, 9:15 AM"
              icon={icons.visit}
              switchValue={state.clockMode === 'REAL'}
              onSwitchChange={(on) => state.setClockMode(on ? 'REAL' : 'DEMO')}
            />
            <Divider />
            <SettingRow
              label="Simulated latency"
              description="Adds a 250–700 ms delay to every request"
              icon={icons.filter}
              switchValue={state.latencyEnabled}
              onSwitchChange={state.setLatencyEnabled}
            />
          </View>
        </SummaryPanel>
      </Reveal>

      <Reveal index={2}>
        <Button
          label="Reset demo data"
          variant="secondary"
          onPress={reset}
          loading={resetting}
          fullWidth
        />
      </Reveal>
    </ScreenLayout>
  );
}
