import { useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { validateGpsCaptureSession } from '@nestin/capture';
import { uploadGpsCaptureSession, type GpsCaptureUploadResult } from '../src/lib/api';
import { BrandButton } from '../src/components/BrandButton';
import { Screen } from '../src/components/Screen';
import { StepProgress } from '../src/components/StepProgress';
import { CaptureReviewGrid } from '../src/features/nestin-capture/CaptureReviewGrid';
import { NestinCameraScreen } from '../src/features/nestin-capture/NestinCameraScreen';
import { useGpsCaptureSession } from '../src/features/nestin-capture/useGpsCaptureSession';
import { colors, commonStyles, spacing, typography } from '../src/lib/theme';

type Step = 'intro' | 'camera' | 'review' | 'success';

function stepIndex(step: Step): number {
  if (step === 'intro') return 1;
  if (step === 'camera') return 2;
  if (step === 'review') return 3;
  if (step === 'success') return 4;
  return 1;
}

export default function NestinCaptureRoute() {
  const { propertyId, title } = useLocalSearchParams<{ propertyId?: string; title?: string }>();
  const resolvedPropertyId = typeof propertyId === 'string' ? propertyId : undefined;
  const propertyTitle = typeof title === 'string' ? decodeURIComponent(title) : undefined;

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
  const [uploadResult, setUploadResult] = useState<GpsCaptureUploadResult | null>(null);

  if (step === 'success') {
    return (
      <Screen>
        <StepProgress current={4} />
        <View style={styles.successBlock}>
          <Text style={styles.successEmoji}>✓</Text>
          <Text style={typography.title}>Upload complete</Text>
          <Text style={typography.subtitle}>
            GPS photos for {propertyTitle ?? 'this listing'} were submitted. The landlord and legal
            team can proceed with verification.
            {uploadResult?.coordinatesCorrection
              ? ` The map pin was adjusted by ${uploadResult.coordinatesCorrection.distanceMeters}m based on your on-site GPS.`
              : uploadResult?.coordinatesSource === 'agent_gps'
                ? ' Listing coordinates were set from your on-site GPS.'
                : ''}
          </Text>
          <BrandButton label="Back to assignments" onPress={() => router.replace('/')} />
        </View>
      </Screen>
    );
  }

  if (step === 'camera') {
    return (
      <>
        <StepProgress current={2} />
        <NestinCameraScreen
          sequence={photoCount + 1}
          onCaptured={(photo) => {
            addPhoto(photo);
            setStep('review');
          }}
          onCancel={() => setStep('review')}
        />
      </>
    );
  }

  if (step === 'review' && session) {
    const validation = validateGpsCaptureSession(session);
    return (
      <Screen scroll padded={false}>
        <StepProgress current={3} />
        <View style={styles.reviewHeader}>
          <Text style={typography.title}>Review photos</Text>
          <Text style={typography.caption}>
            {photoCount} of {maxPhotos} · minimum {minPhotos} required
          </Text>
        </View>

        {!resolvedPropertyId && (
          <View style={commonStyles.warnBanner}>
            <Text style={commonStyles.warnText}>
              Missing propertyId. Select a property from the home screen.
            </Text>
          </View>
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
          <Text style={[commonStyles.errorText, styles.errorPad]}>{validation.errors.join('\n')}</Text>
        )}
        {uploadError && <Text style={[commonStyles.errorText, styles.errorPad]}>{uploadError}</Text>}

        <View style={styles.actions}>
          {canAddMore && (
            <BrandButton
              label="Add another photo"
              variant="secondary"
              onPress={() => setStep('camera')}
            />
          )}
          <BrandButton
            label="Upload & confirm"
            loading={isUploading}
            disabled={!validation.valid || !resolvedPropertyId}
            onPress={async () => {
              setUploadError(null);
              setIsUploading(true);
              try {
                const result = await uploadGpsCaptureSession(resolvedPropertyId!, session);
                setUploadResult(result);
                setStep('success');
              } catch (e) {
                setUploadError(e instanceof Error ? e.message : 'Upload failed');
              } finally {
                setIsUploading(false);
              }
            }}
          />
          <BrandButton label="Start over" variant="outline" onPress={reset} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <StepProgress current={1} />
      <View style={styles.introHero}>
        <Text style={commonStyles.brandMark}>Flowcheq Capture</Text>
        <Text style={styles.introTitle}>On-site GPS photos</Text>
        <Text style={typography.subtitle}>
          Stand at the property. Take {minPhotos}–{maxPhotos} in-app photos — gallery uploads are not
          allowed.
        </Text>
      </View>

      {resolvedPropertyId ? (
        <View style={commonStyles.propertyChip}>
          <Text style={commonStyles.propertyChipText}>
            {propertyTitle ?? `Listing ${resolvedPropertyId.slice(-6)}`}
          </Text>
        </View>
      ) : (
        <View style={commonStyles.warnBanner}>
          <Text style={commonStyles.warnText}>Go back and select a property from assignments.</Text>
        </View>
      )}

      <View style={styles.checklist}>
        {['Allow camera & location', 'Wait for GPS lock', 'Capture each room', 'Tag & upload'].map(
          (item) => (
            <Text key={item} style={styles.checkItem}>
              • {item}
            </Text>
          ),
        )}
      </View>

      <BrandButton
        label="Start capture session"
        disabled={!resolvedPropertyId}
        onPress={() => setStep('camera')}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  introHero: { ...commonStyles.heroBlock, marginBottom: spacing.lg },
  introTitle: { ...typography.title, color: colors.primary, marginBottom: spacing.sm },
  reviewHeader: {
    padding: spacing.lg,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.cardElevated,
  },
  actions: { gap: spacing.md, padding: spacing.lg, paddingTop: spacing.md },
  errorPad: { paddingHorizontal: spacing.lg },
  checklist: { marginBottom: spacing.lg, gap: spacing.xs },
  checkItem: { ...typography.body, fontSize: 14, color: colors.mutedForeground },
  successBlock: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.md,
  },
  successEmoji: {
    fontSize: 56,
    color: colors.primary,
    backgroundColor: colors.primaryMuted,
    width: 88,
    height: 88,
    lineHeight: 88,
    textAlign: 'center',
    borderRadius: 44,
    overflow: 'hidden',
  },
});
