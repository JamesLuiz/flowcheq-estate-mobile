import { useEffect } from 'react';
import { router } from 'expo-router';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { EmailVerificationBanner } from '../src/components/EmailVerificationBanner';
import { BrandButton } from '../src/components/BrandButton';
import { Screen } from '../src/components/Screen';
import { useAuth } from '../src/context/AuthContext';
import {
  canUseAgentMobileApp,
  getPostLoginPath,
  isEmailVerified,
} from '../src/lib/roles';
import { colors, commonStyles, spacing, typography } from '../src/lib/theme';

export default function VerifyEmailScreen() {
  const { user, loading, isAuthenticated, refresh, logout } = useAuth();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace('/auth/login');
      return;
    }
    if (user && !canUseAgentMobileApp(user.role)) {
      void logout().then(() => router.replace('/auth/login'));
      return;
    }
    if (user && isEmailVerified(user)) {
      router.replace(getPostLoginPath(user));
    }
  }, [loading, isAuthenticated, user, logout]);

  if (loading || !user) {
    return (
      <Screen>
        <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.xl }} />
      </Screen>
    );
  }

  return (
    <Screen scroll>
      <View style={styles.hero}>
        <Text style={commonStyles.brandMark}>Flowcheq Agent</Text>
        <Text style={typography.title}>Check your inbox</Text>
        <Text style={typography.subtitle}>
          We sent a verification link to {user.email}. Open it on this device or any browser, then
          return here and tap refresh.
        </Text>
      </View>

      <EmailVerificationBanner user={user} />

      <BrandButton
        label="I verified — refresh"
        style={{ marginTop: spacing.lg }}
        onPress={() => void refresh()}
      />
      <BrandButton
        label="Sign out"
        variant="outline"
        style={{ marginTop: spacing.sm }}
        onPress={() => void logout().then(() => router.replace('/auth/login'))}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { ...commonStyles.heroBlock, marginBottom: spacing.lg },
});
