import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { BrandButton } from '../src/components/BrandButton';
import { EmailVerificationBanner } from '../src/components/EmailVerificationBanner';
import { Screen } from '../src/components/Screen';
import { useAuth } from '../src/context/AuthContext';
import { fetchAgentManagedProperties } from '../src/lib/api';
import {
  canUseAgentMobileApp,
  getPostLoginPath,
  isEmailVerified,
  isYouverifyVerified,
  requiresYouverifyAccount,
} from '../src/lib/roles';
import { colors, commonStyles, spacing, typography } from '../src/lib/theme';

export default function HomeScreen() {
  const { user, loading: authLoading, logout, isAuthenticated, refresh } = useAuth();
  const [loading, setLoading] = useState(true);
  const [properties, setProperties] = useState<
    Awaited<ReturnType<typeof fetchAgentManagedProperties>>
  >([]);

  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated) {
      router.replace('/auth/login');
      return;
    }

    if (user && !canUseAgentMobileApp(user.role)) {
      void logout().then(() => router.replace('/auth/login'));
      return;
    }

    const nextPath = getPostLoginPath(user);
    if (nextPath !== '/') {
      router.replace(nextPath);
      return;
    }

    fetchAgentManagedProperties()
      .then(setProperties)
      .finally(() => setLoading(false));
  }, [authLoading, isAuthenticated, user, logout]);

  if (authLoading || !isAuthenticated || !user) {
    return (
      <Screen>
        <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.xl }} />
      </Screen>
    );
  }

  const needsCapture = properties.filter((p) => !p.gpsVerifiedPhotos);

  return (
    <Screen scroll>
      <View style={styles.topBar}>
        <Text style={typography.caption}>{user.name}</Text>
        <Pressable onPress={() => void logout().then(() => router.replace('/auth/login'))}>
          <Text style={styles.link}>Sign out</Text>
        </Pressable>
      </View>

      <EmailVerificationBanner user={user} onResent={() => void refresh()} />

      {requiresYouverifyAccount(user.role) && !isYouverifyVerified(user) ? (
        <View style={commonStyles.warnBanner}>
          <Text style={commonStyles.warnText}>
            Complete identity verification to unlock all agent features.
          </Text>
          <BrandButton
            label="Verify identity"
            style={{ marginTop: spacing.sm }}
            onPress={() => router.push('/verify-account')}
          />
        </View>
      ) : null}

      <View style={styles.hero}>
        <Text style={commonStyles.brandMark}>Field agent</Text>
        <Text style={styles.heroTitle}>On-site verification</Text>
        <Text style={typography.subtitle}>
          Capture GPS-stamped photos, manage your wallet, and verify assigned properties from the
          field.
        </Text>
      </View>

      <View style={styles.actions}>
        <BrandButton label="Agent wallet" variant="outline" onPress={() => router.push('/wallet')} />
        {!isEmailVerified(user) ? (
          <BrandButton
            label="Verify email"
            variant="secondary"
            style={{ marginTop: spacing.sm }}
            onPress={() => router.push('/verify-email')}
          />
        ) : null}
      </View>

      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statNum}>{properties.length}</Text>
          <Text style={styles.statLabel}>Assigned</Text>
        </View>
        <View style={styles.stat}>
          <Text style={[styles.statNum, { color: colors.warning }]}>{needsCapture.length}</Text>
          <Text style={styles.statLabel}>Need photos</Text>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator color={colors.primary} style={{ marginVertical: spacing.xl }} />
      ) : properties.length > 0 ? (
        <View style={styles.list}>
          <Text style={styles.sectionTitle}>Your assignments</Text>
          {properties.map((property) => (
            <Pressable
              key={property.id}
              style={styles.card}
              onPress={() =>
                router.push(
                  `/nestin-capture?propertyId=${property.id}&title=${encodeURIComponent(property.title)}`,
                )
              }
            >
              <View style={styles.cardBody}>
                <Text style={styles.cardTitle}>{property.title}</Text>
                <Text style={styles.cardLocation}>{property.location}</Text>
                <View style={styles.badges}>
                  {property.gpsVerifiedPhotos ? (
                    <Text style={styles.badgeOk}>GPS photos ✓</Text>
                  ) : (
                    <Text style={styles.badgePending}>Photos required</Text>
                  )}
                </View>
              </View>
              <Text style={styles.chevron}>›</Text>
            </Pressable>
          ))}
        </View>
      ) : (
        <View style={commonStyles.heroBlock}>
          <Text style={typography.body}>
            No managed properties yet. Accept a management request on the agent dashboard on the
            web, then reopen this app.
          </Text>
          <BrandButton
            label="Manual capture (enter ID)"
            variant="outline"
            style={{ marginTop: spacing.md }}
            onPress={() => router.push('/nestin-capture')}
          />
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  link: { color: colors.primary, fontWeight: '600', fontSize: 14 },
  hero: { ...commonStyles.heroBlock, marginBottom: spacing.lg },
  heroTitle: { ...typography.title, color: colors.primary, marginBottom: spacing.sm },
  actions: { marginBottom: spacing.md },
  statsRow: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.lg },
  stat: {
    flex: 1,
    backgroundColor: colors.cardElevated,
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  statNum: { fontSize: 28, fontWeight: '700', color: colors.primary },
  statLabel: { ...typography.caption, marginTop: 4 },
  list: { gap: spacing.sm },
  sectionTitle: { ...typography.label, marginBottom: spacing.sm },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  cardBody: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: '600', color: colors.foreground },
  cardLocation: { ...typography.caption, marginTop: 2 },
  badges: { marginTop: spacing.sm },
  badgeOk: {
    alignSelf: 'flex-start',
    fontSize: 11,
    fontWeight: '600',
    color: colors.primaryDark,
    backgroundColor: colors.primaryMuted,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  badgePending: {
    alignSelf: 'flex-start',
    fontSize: 11,
    fontWeight: '600',
    color: colors.warning,
    backgroundColor: colors.warningMuted,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  chevron: { fontSize: 24, color: colors.mutedForeground, paddingLeft: spacing.sm },
});
