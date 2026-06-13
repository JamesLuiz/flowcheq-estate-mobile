import { useEffect, useRef, useState } from 'react';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Location from 'expo-location';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { GpsCapturePhoto } from '@nestin/capture';
import { BrandButton } from '../../components/BrandButton';
import { colors, radius, spacing } from '../../lib/theme';
import { getShotHint } from './captureGuide';

interface NestinCameraScreenProps {
  sequence: number;
  onCaptured: (photo: GpsCapturePhoto) => void;
  onCancel: () => void;
}

export function NestinCameraScreen({ sequence, onCaptured, onCancel }: NestinCameraScreenProps) {
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [gpsReady, setGpsReady] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number; accuracy?: number } | null>(
    null,
  );
  const [capturing, setCapturing] = useState(false);

  useEffect(() => {
    let sub: Location.LocationSubscription | null = null;
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      sub = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.High, distanceInterval: 1 },
        (pos) => {
          setCoords({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: pos.coords.accuracy ?? undefined,
          });
          setGpsReady(true);
        },
      );
    })();
    return () => sub?.remove();
  }, []);

  if (!permission?.granted) {
    return (
      <SafeAreaView style={styles.permissionScreen}>
        <View style={styles.permissionCard}>
          <Text style={styles.permissionTitle}>Camera access needed</Text>
          <Text style={styles.permissionText}>
            Flowcheq Capture uses your camera to take GPS-verified listing photos on-site.
          </Text>
          <BrandButton label="Grant camera access" onPress={requestPermission} />
        </View>
      </SafeAreaView>
    );
  }

  const takePhoto = async () => {
    if (!cameraRef.current || !coords || capturing) return;
    setCapturing(true);
    try {
      const result = await cameraRef.current.takePictureAsync({ quality: 0.85 });
      if (!result?.uri) return;
      const guide = getShotHint(sequence);
      onCaptured({
        id: `photo_${Date.now()}`,
        uri: result.uri,
        metadata: {
          lat: coords.lat,
          lng: coords.lng,
          accuracy: coords.accuracy,
          capturedAt: new Date().toISOString(),
          tag: guide.tag,
          sequence,
        },
      });
    } finally {
      setCapturing(false);
    }
  };

  return (
    <View style={styles.container}>
      <CameraView ref={cameraRef} style={styles.camera} facing="back" />
      <SafeAreaView style={styles.topBar} edges={['top']}>
        <View style={[styles.badge, gpsReady ? styles.badgeOk : styles.badgeWarn]}>
          <Text style={styles.badgeText}>
            {gpsReady ? `GPS locked · ±${Math.round(coords?.accuracy ?? 0)}m` : 'Waiting for GPS…'}
          </Text>
        </View>
      </SafeAreaView>
      <SafeAreaView style={styles.overlay} edges={['bottom']}>
        <Text style={styles.counter}>Photo {sequence} of session</Text>
        <Text style={styles.hint}>{getShotHint(sequence).hint}</Text>
        <View style={styles.actions}>
          <Pressable style={styles.cancelBtn} onPress={onCancel}>
            <Text style={styles.cancelText}>Cancel</Text>
          </Pressable>
          <Pressable
            style={[styles.captureBtn, (!gpsReady || capturing) && styles.btnDisabled]}
            onPress={takePhoto}
            disabled={!gpsReady || capturing}
          >
            {capturing ? (
              <ActivityIndicator color={colors.primaryForeground} />
            ) : (
              <Text style={styles.captureText}>Capture</Text>
            )}
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.cameraBackground },
  camera: { flex: 1 },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingTop: spacing.sm,
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.lg,
    backgroundColor: colors.cameraOverlay,
  },
  badge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
  },
  badgeOk: { backgroundColor: colors.primary },
  badgeWarn: { backgroundColor: colors.warning },
  badgeText: { color: colors.primaryForeground, fontSize: 13, fontWeight: '600' },
  counter: {
    color: colors.primaryForeground,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  hint: {
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    fontSize: 14,
    marginBottom: spacing.md,
  },
  actions: { flexDirection: 'row', gap: spacing.md },
  cancelBtn: {
    flex: 1,
    padding: spacing.md,
    borderRadius: radius.md,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  cancelText: { color: colors.primaryForeground, fontWeight: '600' },
  captureBtn: {
    flex: 1,
    padding: spacing.md,
    borderRadius: radius.md,
    alignItems: 'center',
    backgroundColor: colors.primary,
  },
  captureText: { color: colors.primaryForeground, fontWeight: '700', fontSize: 16 },
  btnDisabled: { opacity: 0.5 },
  permissionScreen: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  permissionCard: {
    backgroundColor: colors.primaryMuted,
    borderRadius: radius.lg,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
  },
  permissionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.foreground,
    marginBottom: spacing.sm,
  },
  permissionText: {
    color: colors.mutedForeground,
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
});
