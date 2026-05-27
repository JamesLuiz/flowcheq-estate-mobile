import { useCallback, useState } from 'react';
import {
  addPhotoToSession,
  clearCaptureSession,
  createCaptureSession,
  getActiveSession,
  removePhotoFromSession,
  updatePhotoTagInSession,
  type GpsCapturePhoto,
  type GpsCaptureSession,
} from '@nestin/capture';

export function useGpsCaptureSession(propertyId?: string) {
  const [session, setSession] = useState<GpsCaptureSession | null>(
    () => getActiveSession() ?? createCaptureSession({ propertyId }),
  );

  const refresh = useCallback(() => {
    setSession(getActiveSession());
  }, []);

  const addPhoto = useCallback(
    (photo: GpsCapturePhoto) => {
      addPhotoToSession(photo);
      refresh();
    },
    [refresh],
  );

  const removePhoto = useCallback(
    (photoId: string) => {
      removePhotoFromSession(photoId);
      refresh();
    },
    [refresh],
  );

  const updatePhotoTag = useCallback(
    (photoId: string, tag: string) => {
      updatePhotoTagInSession(photoId, tag);
      refresh();
    },
    [refresh],
  );

  const reset = useCallback(() => {
    clearCaptureSession();
    setSession(createCaptureSession({ propertyId }));
  }, [propertyId]);

  return {
    session,
    addPhoto,
    removePhoto,
    updatePhotoTag,
    reset,
    canAddMore: (session?.photos.length ?? 0) < (session?.maxPhotos ?? 6),
    photoCount: session?.photos.length ?? 0,
    minPhotos: session?.minPhotos ?? 5,
    maxPhotos: session?.maxPhotos ?? 6,
  };
}
