// Jest global setup. AsyncStorage is replaced by the official in-memory mock so tests never touch
// native storage; the storage abstraction (src/services/storage.ts) is what production code uses.
import 'react-native-gesture-handler/jestSetup';

// jest.mock factories run before imports resolve, so they must use require().
jest.mock('@react-native-async-storage/async-storage', () =>
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

// Reanimated 4 needs its worklets runtime mocked outside a native runtime.
/* eslint-disable @typescript-eslint/no-require-imports -- jest.mock factories must use require() */
jest.mock('react-native-worklets', () => require('react-native-worklets/src/mock'));
jest.mock('react-native-reanimated', () => require('react-native-reanimated/mock'));

// expo-image's <Image> performs a real network fetch for a remote `uri`, which has no network to
// resolve against in the test environment and hangs every test that renders one (Avatar, ProjectImage
// with a stock photo URL) until it times out. Screens never assert on the Image element itself — the
// accessibility label lives on the wrapping View — so a plain View stand-in is a faithful mock.
jest.mock('expo-image', () => {
  const { View } = require('react-native');
  return { Image: View, ImageBackground: View };
});
