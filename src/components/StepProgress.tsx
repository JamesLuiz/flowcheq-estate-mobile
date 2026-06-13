import { View, Text, StyleSheet } from 'react-native';
import { colors, radius, spacing } from '../lib/theme';

const STEPS = ['Select property', 'Capture', 'Review', 'Upload'] as const;

type StepProgressProps = {
  current: number;
};

export function StepProgress({ current }: StepProgressProps) {
  return (
    <View style={styles.row}>
      {STEPS.map((label, index) => {
        const stepNum = index + 1;
        const active = stepNum === current;
        const done = stepNum < current;
        return (
          <View key={label} style={styles.step}>
            <View
              style={[
                styles.dot,
                done && styles.dotDone,
                active && styles.dotActive,
              ]}
            >
              <Text style={[styles.dotText, (active || done) && styles.dotTextOn]}>
                {done ? '✓' : stepNum}
              </Text>
            </View>
            <Text style={[styles.label, active && styles.labelActive]} numberOfLines={1}>
              {label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.md,
    backgroundColor: colors.cardElevated,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  step: { flex: 1, alignItems: 'center', gap: 4 },
  dot: {
    width: 28,
    height: 28,
    borderRadius: radius.pill,
    backgroundColor: colors.muted,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  dotDone: { backgroundColor: colors.primaryDark, borderColor: colors.primaryDark },
  dotText: { fontSize: 12, fontWeight: '700', color: colors.mutedForeground },
  dotTextOn: { color: colors.primaryForeground },
  label: { fontSize: 10, color: colors.mutedForeground, textAlign: 'center' },
  labelActive: { color: colors.primary, fontWeight: '600' },
});
