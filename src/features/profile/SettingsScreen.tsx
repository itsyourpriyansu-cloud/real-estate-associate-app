import { useRouter } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import {
  AppText,
  Button,
  ConfirmationSheet,
  DetailHeader,
  Divider,
  FilterChip,
  Reveal,
  ScreenLayout,
  SettingRow,
  SummaryPanel,
  icons,
  useToast,
} from '@/components';
import { space } from '@/design-system';
import { useAuthStore } from '@/store/authStore';
import { usePreferencesStore, type ReduceMotionPreference } from '@/store/preferencesStore';
import { usePrototypeStore } from '@/store/prototypeStore';

const MOTION: { value: ReduceMotionPreference; label: string }[] = [
  { value: 'system', label: 'System' },
  { value: 'on', label: 'Reduced' },
  { value: 'off', label: 'Full' },
];

/** Settings: preferences that change how the app feels, plus the demo-data reset. */
export function SettingsScreen() {
  const router = useRouter();
  const toast = useToast();
  const signOut = useAuthStore((state) => state.signOut);
  const preferences = usePreferencesStore();
  const resetData = usePrototypeStore((state) => state.resetData);
  const [confirmReset, setConfirmReset] = useState(false);
  const [resetting, setResetting] = useState(false);

  const reset = async () => {
    setResetting(true);
    await resetData();
    setResetting(false);
    setConfirmReset(false);
    toast.show({ tone: 'success', message: 'Demo data reset.' });
  };

  return (
    <ScreenLayout
      edges={['top', 'bottom']}
      header={<DetailHeader title="Settings" onBack={() => router.back()} />}
    >
      <Reveal index={0}>
        <SummaryPanel title="Preferences">
          <View>
            <SettingRow
              label="Notifications"
              description="Alerts about bookings and your team"
              icon={icons.notifications}
              switchValue={preferences.notificationsEnabled}
              onSwitchChange={preferences.setNotificationsEnabled}
            />
            <Divider />
            <SettingRow
              label="Haptics"
              description="Feel a tap on buttons and choices"
              icon={icons.check}
              switchValue={preferences.hapticsEnabled}
              onSwitchChange={preferences.setHapticsEnabled}
            />
            <Divider />
            <SettingRow label="Appearance" icon={icons.settings} value="Light" />
          </View>
        </SummaryPanel>
      </Reveal>

      <Reveal index={1}>
        <SummaryPanel title="Motion">
          <AppText tone="secondary">
            Reduced motion removes slides and count-ups. “System” follows your device setting.
          </AppText>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space[8] }}>
            {MOTION.map((option) => (
              <FilterChip
                key={option.value}
                label={option.label}
                selected={preferences.reduceMotion === option.value}
                onPress={() => preferences.setReduceMotion(option.value)}
              />
            ))}
          </View>
        </SummaryPanel>
      </Reveal>

      <Reveal index={2}>
        <SummaryPanel title="Help and data">
          <View>
            <SettingRow
              label="Support"
              description="Talk to the Vara team"
              icon={icons.support}
              onPress={() =>
                toast.show({ tone: 'info', message: 'Support chat arrives in a later phase.' })
              }
            />
            <Divider />
            <SettingRow
              label="Prototype controls"
              description="Scenarios, demo clock, simulated latency"
              icon={icons.filter}
              onPress={() => router.push('/prototype-controls')}
            />
            <Divider />
            <SettingRow
              label="Reset demo data"
              description="Discard your changes and start from the seed"
              icon={icons.alert}
              onPress={() => setConfirmReset(true)}
            />
          </View>
        </SummaryPanel>
      </Reveal>

      <Reveal index={3}>
        <Button
          label="Sign out"
          variant="secondary"
          icon={icons.signOut}
          onPress={signOut}
          fullWidth
        />
      </Reveal>

      <ConfirmationSheet
        visible={confirmReset}
        onClose={() => setConfirmReset(false)}
        onConfirm={reset}
        title="Reset demo data?"
        message="Bookings and team members you added will be removed. The seeded data comes back."
        confirmLabel="Reset"
        destructive
        loading={resetting}
      />
    </ScreenLayout>
  );
}
