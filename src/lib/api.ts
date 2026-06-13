import type { GpsCaptureSession } from '@nestin/capture';
import { getAuthToken } from './authToken';
import { API_BASE_URL } from './config';

export async function uploadGpsCaptureSession(
  propertyId: string,
  session: GpsCaptureSession,
  token?: string,
): Promise<unknown> {
  const authToken = token ?? (await getAuthToken());
  if (!authToken) {
    throw new Error(
      'Sign in or set EXPO_PUBLIC_AUTH_TOKEN (dev) / store a JWT via setAuthToken.',
    );
  }
  if (!propertyId) {
    throw new Error('propertyId is required. Open /nestin-capture?propertyId=YOUR_LISTING_ID');
  }

  const formData = new FormData();
  const tags: string[] = [];
  const descriptions: string[] = [];
  const gpsMeta: Array<{
    lat: number;
    lng: number;
    accuracy?: number;
    capturedAt: string;
  }> = [];

  session.photos.forEach((photo, index) => {
    formData.append('taggedPhotos', {
      uri: photo.uri,
      name: `gps-${index + 1}.jpg`,
      type: 'image/jpeg',
    } as unknown as Blob);
    tags.push(photo.metadata.tag || 'other');
    descriptions.push(photo.metadata.description ?? '');
    gpsMeta.push({
      lat: photo.metadata.lat,
      lng: photo.metadata.lng,
      accuracy: photo.metadata.accuracy,
      capturedAt: photo.metadata.capturedAt,
    });
  });

  formData.append('taggedPhotoTags', JSON.stringify(tags));
  formData.append('taggedPhotoDescriptions', JSON.stringify(descriptions));
  formData.append('taggedPhotoGps', JSON.stringify(gpsMeta));

  const response = await fetch(
    `${API_BASE_URL}/houses/${propertyId}/photos/gps-capture`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      body: formData,
    },
  );

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    const message =
      (err as { message?: string | string[] }).message ??
      `Upload failed (${response.status})`;
    throw new Error(Array.isArray(message) ? message.join(', ') : String(message));
  }

  return response.json();
}

export type ManagedProperty = {
  id: string;
  title: string;
  location: string;
  gpsVerifiedPhotos?: boolean;
  verificationStatus?: string;
};

export async function fetchAgentManagedProperties(token?: string): Promise<ManagedProperty[]> {
  const authToken = token ?? (await getAuthToken());
  if (!authToken) return [];

  const response = await fetch(`${API_BASE_URL}/agent/managed-properties`, {
    headers: { Authorization: `Bearer ${authToken}` },
  });

  if (!response.ok) return [];
  const data = await response.json();
  const list = Array.isArray(data) ? data : data?.data ?? [];
  return list.map((h: Record<string, unknown>) => ({
    id: String(h.id ?? h._id),
    title: String(h.title ?? 'Untitled'),
    location: String(h.location ?? ''),
    gpsVerifiedPhotos: Boolean(h.gpsVerifiedPhotos),
    verificationStatus: h.verificationStatus as string | undefined,
  }));
}
