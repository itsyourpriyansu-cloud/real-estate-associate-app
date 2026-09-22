import { useFonts } from 'expo-font';
import { Stack, useRouter, usePathname } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ToastProvider } from '@/components/feedback';
import { AssociateDock, DockContext } from '@/components/navigation';
import { colors } from '@/design-system';
import { interFontAssets } from '@/design-system/fonts';
import { accessFor } from '@/features/auth/sessionAccess';
import { DOCK_ITEMS, dockHref, dockKeyFor, type DockKey } from '@/features/navigation/dock';
import { selectSessionKind, useAuthStore } from '@/store/authStore';
import { useStoresHydrated } from '@/store/hydration';

SplashScreen.preventAutoHideAsync().catch(() => undefined);

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts(interFontAssets);
  const hydrated = useStoresHydrated();
  const access = accessFor(useAuthStore(selectSessionKind));
  const router = useRouter();
  const dockKey = dockKeyFor(usePathname());
  const showDock = access.associate && dockKey !== undefined;

  // A font failure must not brick the app: fall back to the system font and continue.
  const ready = (fontsLoaded || fontError !== null) && hydrated;

  useEffect(() => {
    if (ready) SplashScreen.hideAsync().catch(() => undefined);
  }, [ready]);

  if (!ready) return null;

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <ToastProvider>
          <StatusBar style="dark" />
          <DockContext.Provider value={showDock}>
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: colors.backgroundPrimary },
              }}
            >
              <Stack.Screen name="index" />

              {/* Session kind decides which group exists. See docs/SCREEN_MAP.md. */}
              <Stack.Protected guard={access.public}>
                <Stack.Screen name="(public)" />
              </Stack.Protected>

              <Stack.Protected guard={access.guest}>
                <Stack.Screen name="(guest)" />
              </Stack.Protected>

              <Stack.Protected guard={access.associate}>
                <Stack.Screen name="(associate)" />
              </Stack.Protected>

              {/* Shared by guest and associate: Our Projects and everything under it. */}
              <Stack.Protected guard={access.shared}>
                <Stack.Screen name="projects/index" />
                <Stack.Screen name="projects/[projectId]" />
                <Stack.Screen name="projects/[projectId]/inventory" />
                <Stack.Screen name="projects/[projectId]/gallery" />
                <Stack.Screen name="plots/[plotId]" />
                <Stack.Screen name="prototype-controls" />
              </Stack.Protected>

              {/* Developer tools: available signed in or out, and absent from production builds. */}
              <Stack.Protected guard={__DEV__}>
                <Stack.Screen name="dev/design-system" />
              </Stack.Protected>
            </Stack>
            {showDock ? (
              <AssociateDock
                items={DOCK_ITEMS}
                activeKey={dockKey}
                onSelect={(key) => router.navigate(dockHref(key as DockKey))}
              />
            ) : null}
          </DockContext.Provider>
        </ToastProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.backgroundPrimary },
});
