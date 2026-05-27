import { useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { validateGpsCaptureSession } from '@nestin/capture';
import { uploadGpsCaptureSession } from '../src/lib/api';
import { CaptureReviewGrid } from '../src/features/nestin-capture/CaptureReviewGrid';
import { NestinCameraScreen } from '../src/features/nestin-capture/NestinCameraScreen';
import { useGpsCaptureSession } from '../src/features/nestin-capture/useGpsCaptureSession';

type Step = 'intro' | 'camera' | 'review';

export default function NestinCaptureRoute() {
  const { propertyId } = useLocalSearchParams<{ propertyId?: string }>();
  const resolvedPropertyId = typeof propertyId === 'string' ? propertyId : undefined;

  const {
    session,
    addPhoto,
    removePhoto,
    updatePhotoTag,
    reset,
    canAddMore,
    photoCount,
    minPhotos,
    maxPhotos,
  } = useGpsCaptureSession(resolvedPropertyId);
  const [step, setStep] = useState<Step>('intro');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  if (step === 'camera') {
    return (
      <NestinCameraScreen
        sequence={photoCount + 1}
        onCaptured={(photo) => {
          addPhoto(photo);
          setStep('review');
        }}
        onCancel={() => setStep('review')}
      />
    );
  }

  if (step === 'review' && session) {
    const validation = validateGpsCaptureSession(session);
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Review ({photoCount}/{maxPhotos})</Text>
        {!resolvedPropertyId && (
          <Text style={styles.warn}>
            Missing propertyId. Pass ?propertyId=LISTING_ID when opening capture.
          </Text>
        )}
        <CaptureReviewGrid
          photos={session.photos}
          onRetake={(id) => {
            removePhoto(id);
            setStep('camera');
          }}
          onTagChange={(id, tag) => updatePhotoTag(id, tag)}
        />
        {!validation.valid && (
          <Text style={styles.errors}>{validation.errors.join('\n')}</Text>
        )}
        {uploadError && <Text style={styles.errors}>{uploadError}</Text>}
        <View style={styles.actions}>
          {canAddMore && (
            <Pressable style={styles.btn} onPress={() => setStep('camera')}>
              <Text style={styles.btnText}>Add another photo</Text>
            </Pressable>
          )}
          <Pressable
            style={[styles.btn, styles.btnPrimary, (!validation.valid || isUploading) && styles.btnDisabled]}
            disabled={!validation.valid || isUploading || !resolvedPropertyId}
            onPress={async () => {
              setUploadError(null);
              setIsUploading(true);
              try {
                await uploadGpsCaptureSession(resolvedPropertyId!, session);
                router.back();
              } catch (e) {
                setUploadError(e instanceof Error ? e.message : 'Upload failed');
              } finally {
                setIsUploading(false);
              }
            }}
          >
            {isUploading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.btnText}>Upload & confirm</Text>
            )}
          </Pressable>
          <Pressable style={styles.btnSecondary} onPress={reset}>
            <Text style={styles.btnTextMuted}>Start over</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Nestin Capture</Text>
      <Text style={styles.subtitle}>
        In-app camera only — no gallery. Take {minPhotos}–{maxPhotos} GPS-stamped photos at the
        property.
      </Text>
      {resolvedPropertyId ? (
        <Text style={styles.propertyId}>Listing: {resolvedPropertyId}</Text>
      ) : (
        <Text style={styles.warn}>Open with ?propertyId=YOUR_LISTING_ID to enable upload.</Text>
      )}
      <Pressable style={[styles.btn, styles.btnPrimary]} onPress={() => setStep('camera')}>
        <Text style={styles.btnText}>Start capture session</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a', padding: 20 },
  title: { fontSize: 24, fontWeight: '700', color: '#f8fafc', marginBottom: 8 },
  subtitle: { color: '#94a3b8', marginBottom: 12, lineHeight: 22 },
  propertyId: { color: '#64748b', fontSize: 12, marginBottom: 24 },
  warn: { color: '#fbbf24', marginBottom: 16, fontSize: 13 },
  actions: { gap: 12, marginTop: 16 },
  btn: { padding: 14, borderRadius: 10, backgroundColor: '#334155', alignItems: 'center' },
  btnPrimary: { backgroundColor: '#2563eb' },
  btnSecondary: { padding: 12, alignItems: 'center' },
  btnDisabled: { opacity: 0.5 },
  btnText: { color: '#fff', fontWeight: '600' },
  btnTextMuted: { color: '#94a3b8' },
  errors: { color: '#f87171', marginVertical: 8, fontSize: 13 },
});
