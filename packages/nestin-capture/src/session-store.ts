import type { GpsCapturePhoto, GpsCaptureSession } from './types';
import { DEFAULT_MAX_PHOTOS, DEFAULT_MIN_PHOTOS } from './validate-metadata';

let activeSession: GpsCaptureSession | null = null;

export function createCaptureSession(options?: {
  propertyId?: string;
  minPhotos?: number;
  maxPhotos?: number;
}): GpsCaptureSession {
  activeSession = {
    id: `cap_${Date.now()}`,
    propertyId: options?.propertyId,
    photos: [],
    minPhotos: options?.minPhotos ?? DEFAULT_MIN_PHOTOS,
    maxPhotos: options?.maxPhotos ?? DEFAULT_MAX_PHOTOS,
    createdAt: new Date().toISOString(),
  };
  return activeSession;
}

export function getActiveSession(): GpsCaptureSession | null {
  return activeSession;
}

export function addPhotoToSession(photo: GpsCapturePhoto): GpsCaptureSession {
  if (!activeSession) {
    createCaptureSession();
  }
  const session = activeSession!;
  if (session.photos.length >= session.maxPhotos) {
    throw new Error(`Maximum ${session.maxPhotos} photos per session`);
  }
  session.photos.push(photo);
  return session;
}

export function removePhotoFromSession(photoId: string): GpsCaptureSession | null {
  if (!activeSession) return null;
  activeSession.photos = activeSession.photos.filter((p) => p.id !== photoId);
  return activeSession;
}

export function updatePhotoTagInSession(photoId: string, tag: string): GpsCaptureSession | null {
  if (!activeSession) return null;
  activeSession = {
    ...activeSession,
    photos: activeSession.photos.map((p) =>
      p.id === photoId ? { ...p, metadata: { ...p.metadata, tag } } : p,
    ),
  };
  return activeSession;
}

export function clearCaptureSession(): void {
  activeSession = null;
}
