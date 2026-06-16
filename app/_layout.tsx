import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from '../src/context/AuthContext';
import { colors } from '../src/lib/theme';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
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
          <Stack.Screen name="index" options={{ title: 'Flowcheq Agent' }} />
          <Stack.Screen name="auth/login" options={{ title: 'Agent sign in' }} />
          <Stack.Screen name="verify-email" options={{ title: 'Verify email' }} />
          <Stack.Screen name="verify-account" options={{ title: 'Identity verification' }} />
          <Stack.Screen name="wallet" options={{ title: 'Agent wallet' }} />
          <Stack.Screen
            name="nestin-capture"
            options={{ title: 'Flowcheq Capture', headerShown: false }}
          />
        </Stack>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
