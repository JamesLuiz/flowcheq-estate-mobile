import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { colors } from '../src/lib/theme';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.primary },
          headerTintColor: colors.primaryForeground,
          headerTitleStyle: { fontWeight: '700', fontSize: 17 },
          headerShadowVisible: true,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="index" options={{ title: 'Flowcheq Estate' }} />
        <Stack.Screen
          name="nestin-capture"
          options={{ title: 'Flowcheq Capture', headerShown: false }}
        />
      </Stack>
    </SafeAreaProvider>
  );
}
