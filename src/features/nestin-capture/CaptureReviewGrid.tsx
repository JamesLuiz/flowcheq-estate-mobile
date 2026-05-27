import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { PHOTO_TAGS, type GpsCapturePhoto } from '@nestin/capture';

interface CaptureReviewGridProps {
  photos: GpsCapturePhoto[];
  onRetake: (photoId: string) => void;
  onTagChange: (photoId: string, tag: string) => void;
}

export function CaptureReviewGrid({ photos, onRetake, onTagChange }: CaptureReviewGridProps) {
  return (
    <ScrollView contentContainerStyle={styles.grid}>
      {photos.map((photo) => (
        <View key={photo.id} style={styles.card}>
          <Image source={{ uri: photo.uri }} style={styles.thumb} />
          <Text style={styles.meta}>
            {photo.metadata.lat.toFixed(5)}, {photo.metadata.lng.toFixed(5)}
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tags}>
            {PHOTO_TAGS.map((tag) => (
              <Pressable
                key={tag}
                style={[
                  styles.tag,
                  photo.metadata.tag === tag && styles.tagSelected,
                ]}
                onPress={() => onTagChange(photo.id, tag)}
              >
                <Text style={styles.tagText}>{tag.replace('_', ' ')}</Text>
              </Pressable>
            ))}
          </ScrollView>
          <Pressable onPress={() => onRetake(photo.id)}>
            <Text style={styles.retake}>Retake</Text>
          </Pressable>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  grid: { padding: 16, gap: 16 },
  card: { backgroundColor: '#1e293b', borderRadius: 12, padding: 12 },
  thumb: { width: '100%', height: 180, borderRadius: 8 },
  meta: { color: '#94a3b8', fontSize: 12, marginTop: 8 },
  tags: { marginTop: 8, flexDirection: 'row' },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#334155',
    marginRight: 8,
  },
  tagSelected: { backgroundColor: '#2563eb' },
  tagText: { color: '#f1f5f9', fontSize: 12 },
  retake: { color: '#f87171', marginTop: 8, fontWeight: '600' },
});
