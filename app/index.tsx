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
import { Screen } from '../src/components/Screen';
import { fetchAgentManagedProperties } from '../src/lib/api';
import { colors, commonStyles, spacing, typography } from '../src/lib/theme';

export default function HomeScreen() {
  const [loading, setLoading] = useState(true);
  const [properties, setProperties] = useState<
    Awaited<ReturnType<typeof fetchAgentManagedProperties>>
  >([]);

  useEffect(() => {
    fetchAgentManagedProperties()
      .then(setProperties)
      .finally(() => setLoading(false));
  }, []);

  const needsCapture = properties.filter((p) => !p.gpsVerifiedPhotos);

  return (
    <Screen scroll>
      <View style={styles.hero}>
        <Text style={commonStyles.brandMark}>Field agent</Text>
        <Text style={styles.heroTitle}>On-site verification</Text>
        <Text style={typography.subtitle}>
          Select a property, capture GPS-stamped photos on location, and upload for listing
          verification.
        </Text>
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
                router.push(`/nestin-capture?propertyId=${property.id}&title=${encodeURIComponent(property.title)}`)
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
            No managed properties yet. Sign in as an agent on the web, accept a management request,
            then reopen this app.
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
  hero: { ...commonStyles.heroBlock, marginBottom: spacing.lg },
  heroTitle: { ...typography.title, color: colors.primary, marginBottom: spacing.sm },
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
