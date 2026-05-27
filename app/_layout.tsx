import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="auto" />
      <Stack>
        <Stack.Screen name="index" options={{ title: 'Nestin Estate' }} />
        <Stack.Screen name="nestin-capture" options={{ title: 'Nestin Capture', headerShown: false }} />
      </Stack>
    </>
  );
}
