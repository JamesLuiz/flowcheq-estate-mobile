export const PHOTO_TAGS = [
  'exterior',
  'sitting_room',
  'bedroom',
  'kitchen',
  'bathroom',
  'toilet',
  'compound',
  'lobby',
  'balcony',
  'full-photo',
  'other',
] as const;

export type PhotoTag = (typeof PHOTO_TAGS)[number];

export interface GpsPhotoMetadata {
  lat: number;
  lng: number;
  accuracy?: number;
  capturedAt: string;
  deviceId?: string;
  tag: PhotoTag | string;
  description?: string;
  sequence: number;
}

export interface GpsCapturePhoto {
  id: string;
  uri: string;
  metadata: GpsPhotoMetadata;
}

export interface GpsCaptureSession {
  id: string;
  propertyId?: string;
  photos: GpsCapturePhoto[];
  minPhotos: number;
  maxPhotos: number;
  createdAt: string;
}
