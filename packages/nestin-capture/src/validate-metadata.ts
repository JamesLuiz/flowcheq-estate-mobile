import type { GpsCapturePhoto, GpsCaptureSession } from './types';

export const DEFAULT_MIN_PHOTOS = 5;
export const DEFAULT_MAX_PHOTOS = 6;

export function validateGpsCaptureSession(
  session: GpsCaptureSession,
  options?: { min?: number; max?: number },
): { valid: boolean; errors: string[] } {
  const min = options?.min ?? session.minPhotos ?? DEFAULT_MIN_PHOTOS;
  const max = options?.max ?? session.maxPhotos ?? DEFAULT_MAX_PHOTOS;
  const errors: string[] = [];

  if (session.photos.length < min) {
    errors.push(`At least ${min} GPS photos required (have ${session.photos.length}).`);
  }
  if (session.photos.length > max) {
    errors.push(`At most ${max} GPS photos allowed.`);
  }

  session.photos.forEach((photo, i) => {
    const e = validateSinglePhoto(photo, i);
    errors.push(...e);
  });

  return { valid: errors.length === 0, errors };
}

export function validateSinglePhoto(photo: GpsCapturePhoto, index: number): string[] {
  const errors: string[] = [];
  const { lat, lng, tag, capturedAt } = photo.metadata;

  if (lat == null || lng == null || Number.isNaN(lat) || Number.isNaN(lng)) {
    errors.push(`Photo ${index + 1}: missing GPS coordinates.`);
  } else if (Math.abs(lat) > 90 || Math.abs(lng) > 180) {
    errors.push(`Photo ${index + 1}: invalid coordinates.`);
  }

  if (!tag?.trim()) {
    errors.push(`Photo ${index + 1}: room tag required.`);
  }

  if (!capturedAt) {
    errors.push(`Photo ${index + 1}: capture timestamp required.`);
  }

  return errors;
}

/** Distance in metres between two WGS84 points */
export function haversineMeters(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function validateProximityToListing(
  photos: GpsCapturePhoto[],
  listingLat: number,
  listingLng: number,
  maxMetres = 200,
): string[] {
  const errors: string[] = [];
  photos.forEach((photo, i) => {
    const d = haversineMeters(
      photo.metadata.lat,
      photo.metadata.lng,
      listingLat,
      listingLng,
    );
    if (d > maxMetres) {
      errors.push(
        `Photo ${i + 1}: taken ${Math.round(d)}m from listing (max ${maxMetres}m).`,
      );
    }
  });
  return errors;
}
