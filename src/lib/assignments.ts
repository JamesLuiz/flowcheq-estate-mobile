import { API_BASE_URL } from './config';
import { getAuthToken } from './authToken';

export type ManagedProperty = {
  id: string;
  title: string;
  location: string;
  gpsVerifiedPhotos?: boolean;
  verificationStatus?: string;
};

export async function fetchManagedProperties(): Promise<ManagedProperty[]> {
  const token = await getAuthToken();
  if (!token) return [];

  const response = await fetch(`${API_BASE_URL}/agent/managed-properties`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) return [];

  const data = await response.json();
  const list = Array.isArray(data) ? data : data?.data ?? [];
  return list.map((item: Record<string, unknown>) => ({
    id: String(item.id ?? item._id),
    title: String(item.title ?? 'Untitled'),
    location: String(item.location ?? ''),
    gpsVerifiedPhotos: Boolean(item.gpsVerifiedPhotos),
    verificationStatus: item.verificationStatus as string | undefined,
  }));
}
