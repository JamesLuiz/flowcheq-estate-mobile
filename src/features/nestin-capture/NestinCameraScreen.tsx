import { useEffect, useRef, useState } from 'react';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Location from 'expo-location';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import type { GpsCapturePhoto } from '@nestin/capture';

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
      <View style={styles.centered}>
        <Text style={styles.text}>Camera permission required for Nestin Capture</Text>
        <Pressable style={styles.btn} onPress={requestPermission}>
          <Text style={styles.btnText}>Grant access</Text>
        </Pressable>
      </View>
    );
  }

  const takePhoto = async () => {
    if (!cameraRef.current || !coords || capturing) return;
    setCapturing(true);
    try {
      const result = await cameraRef.current.takePictureAsync({ quality: 0.85 });
      if (!result?.uri) return;
      onCaptured({
        id: `photo_${Date.now()}`,
        uri: result.uri,
        metadata: {
          lat: coords.lat,
          lng: coords.lng,
          accuracy: coords.accuracy,
          capturedAt: new Date().toISOString(),
          tag: '',
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
      <View style={styles.overlay}>
        <View style={[styles.badge, gpsReady ? styles.badgeOk : styles.badgeWarn]}>
          <Text style={styles.badgeText}>
            {gpsReady ? `GPS locked · ±${Math.round(coords?.accuracy ?? 0)}m` : 'Waiting for GPS…'}
          </Text>
        </View>
        <Text style={styles.counter}>Photo {sequence}</Text>
        <View style={styles.actions}>
          <Pressable style={styles.secondaryBtn} onPress={onCancel}>
            <Text style={styles.btnText}>Cancel</Text>
          </Pressable>
          <Pressable
            style={[styles.btn, (!gpsReady || capturing) && styles.btnDisabled]}
            onPress={takePhoto}
            disabled={!gpsReady || capturing}
          >
            {capturing ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.btnText}>Capture</Text>
            )}
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  camera: { flex: 1 },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  badge: { alignSelf: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, marginBottom: 8 },
  badgeOk: { backgroundColor: '#166534' },
  badgeWarn: { backgroundColor: '#b45309' },
  badgeText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  counter: { color: '#fff', textAlign: 'center', fontSize: 18, marginBottom: 16 },
  actions: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  btn: { flex: 1, backgroundColor: '#2563eb', padding: 16, borderRadius: 12, alignItems: 'center' },
  secondaryBtn: { flex: 1, backgroundColor: '#475569', padding: 16, borderRadius: 12, alignItems: 'center' },
  btnDisabled: { opacity: 0.5 },
  btnText: { color: '#fff', fontWeight: '600' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: '#0f172a' },
  text: { color: '#e2e8f0', marginBottom: 16, textAlign: 'center' },
});
