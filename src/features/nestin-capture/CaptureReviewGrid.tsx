import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { PHOTO_TAGS, type GpsCapturePhoto } from '@nestin/capture';
import { colors, radius, spacing, typography } from '../../lib/theme';

interface CaptureReviewGridProps {
  photos: GpsCapturePhoto[];
  onRetake: (photoId: string) => void;
  onTagChange: (photoId: string, tag: string) => void;
}

export function CaptureReviewGrid({ photos, onRetake, onTagChange }: CaptureReviewGridProps) {
  return (
    <ScrollView contentContainerStyle={styles.grid} showsVerticalScrollIndicator={false}>
      {photos.map((photo, index) => (
        <View key={photo.id} style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.photoIndex}>Photo {index + 1}</Text>
            <Pressable onPress={() => onRetake(photo.id)} hitSlop={8}>
              <Text style={styles.retake}>Retake</Text>
            </Pressable>
          </View>
          <Image source={{ uri: photo.uri }} style={styles.thumb} />
          <Text style={styles.meta}>
            {photo.metadata.lat.toFixed(5)}, {photo.metadata.lng.toFixed(5)}
          </Text>
          <Text style={styles.tagLabel}>Room / area tag</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tags}>
            {PHOTO_TAGS.map((tag) => (
              <Pressable
                key={tag}
                style={[styles.tag, photo.metadata.tag === tag && styles.tagSelected]}
                onPress={() => onTagChange(photo.id, tag)}
              >
                <Text
                  style={[
                    styles.tagText,
                    photo.metadata.tag === tag && styles.tagTextSelected,
                  ]}
                >
                  {tag.replace('_', ' ')}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  grid: { padding: spacing.md, gap: spacing.md, paddingBottom: spacing.sm },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  photoIndex: {
    ...typography.label,
    color: colors.primary,
  },
  thumb: { width: '100%', height: 180, borderRadius: radius.sm, backgroundColor: colors.muted },
  meta: { ...typography.caption, marginTop: spacing.sm },
  tagLabel: { ...typography.label, marginTop: spacing.md, marginBottom: spacing.xs },
  tags: { flexDirection: 'row' },
  tag: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.muted,
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tagSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  tagText: { color: colors.foreground, fontSize: 12, fontWeight: '500' },
  tagTextSelected: { color: colors.primaryForeground },
  retake: { color: colors.destructive, fontWeight: '600', fontSize: 14 },
});
