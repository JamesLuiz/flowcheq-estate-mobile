import type { GpsCaptureSession } from '@nestin/capture';
import { getAuthToken } from './authToken';
import { API_BASE_URL } from './config';
import type { AppUser } from '../types/user';

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  skipAuth?: boolean;
};

async function parseError(response: Response): Promise<string> {
  try {
    const err = await response.json();
    const message = (err as { message?: string | string[] }).message;
    if (Array.isArray(message)) return message.join(', ');
    if (typeof message === 'string') return message;
  } catch {
    // ignore
  }
  return response.statusText || `Request failed (${response.status})`;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = {
    Accept: 'application/json',
  };

  if (options.body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  if (!options.skipAuth) {
    const token = await getAuthToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method ?? 'GET',
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

const authApi = {
  login: (payload: { email: string; password: string }) =>
    request<{ accessToken: string; user: AppUser }>('/auth/login', {
      method: 'POST',
      body: payload,
      skipAuth: true,
    }),
  me: () => request<AppUser>('/auth/me'),
  resendEmailVerification: () =>
    request<{ success: boolean; message: string }>('/auth/resend-email-verification', {
      method: 'POST',
    }),
};

const youverifyApi = {
  getAccountStatus: () =>
    request<{
      required: boolean;
      youverifyStatus?: string;
      verificationFee?: number;
      feePaid?: boolean;
      paymentStatus?: string;
      walletBalance?: number;
      virtualAccount?: {
        accountNumber?: string;
        accountName?: string;
        bankName?: string;
      } | null;
      sdkReady?: boolean;
      sdkConfig?: {
        vFormId?: string;
        publicMerchantKey?: string;
        sandboxEnvironment?: boolean;
        metadata?: Record<string, unknown>;
      } | null;
    }>('/youverify/account/status'),
  payVerificationFee: (client: 'web' | 'mobile' = 'mobile') =>
    request<{
      success: boolean;
      alreadyPaid?: boolean;
      alreadyVerified?: boolean;
      paymentLink?: string;
      txRef?: string;
      amount?: number;
      message?: string;
    }>('/youverify/account/pay-fee', { method: 'POST', body: { client } }),
  completeSdkVerification: (payload: Record<string, unknown>) =>
    request<{ success: boolean; verified?: boolean; alreadyVerified?: boolean; message?: string }>(
      '/youverify/account/sdk-complete',
      { method: 'POST', body: payload },
    ),
};

const agentsApi = {
  getBankAccount: () =>
    request<{
      bankAccount?: {
        bankName: string;
        accountNumber: string;
        accountName: string;
        bankCode: string;
      } | null;
      virtualAccount?: {
        accountNumber?: string;
        accountName?: string;
        bankName?: string;
        bankCode?: string;
        status?: string;
      };
      walletBalance?: number;
    }>('/agents/me/bank-account'),
  updateBankAccount: (bankAccount: {
    bankName: string;
    accountNumber: string;
    accountName: string;
    bankCode: string;
  }) => request<AppUser>('/agents/me/bank-account', { method: 'PATCH', body: { bankAccount } }),
  fundWallet: (amount: number) =>
    request<{ success: boolean; paymentLink: string; txRef: string }>('/agents/me/fund-wallet', {
      method: 'POST',
      body: { amount },
    }),
  withdraw: (amount: number, transactionPin: string, otp: string) =>
    request<{
      success: boolean;
      transferId: string;
      reference: string;
      status: string;
      amount: number;
      message: string;
    }>('/agents/me/withdraw', {
      method: 'POST',
      body: { amount, transactionPin, otp: otp.toUpperCase() },
    }),
  requestWithdrawalOtp: () =>
    request<{ success: boolean; message: string; expiresAt: string }>(
      '/agents/me/withdraw/request-otp',
      { method: 'POST' },
    ),
  getWithdrawals: () => request<{ withdrawals: WithdrawalRecord[] }>('/agents/me/withdrawals'),
  setTransactionPin: (pin: string) =>
    request<{ success: boolean; message: string }>('/agents/me/transaction-pin', {
      method: 'POST',
      body: { pin },
    }),
  getTransactionPinStatus: () =>
    request<{ hasPin: boolean }>('/agents/me/transaction-pin/status'),
};

export type WithdrawalRecord = {
  id?: string;
  amount: number;
  status: string;
  reference?: string;
  createdAt?: string;
};

export const api = {
  auth: authApi,
  youverify: youverifyApi,
  agents: agentsApi,
};

export type GpsCaptureUploadResult = {
  id: string;
  coordinates?: { lat: number; lng: number };
  coordinatesSource?: 'places' | 'geocode' | 'agent_gps';
  coordinatesCorrection?: {
    previousLat: number;
    previousLng: number;
    distanceMeters: number;
    correctedAt: string;
  };
};

export async function uploadGpsCaptureSession(
  propertyId: string,
  session: GpsCaptureSession,
  token?: string,
): Promise<GpsCaptureUploadResult> {
  const authToken = token ?? (await getAuthToken());
  if (!authToken) {
    throw new Error('Sign in or set EXPO_PUBLIC_AUTH_TOKEN (dev) to upload captures.');
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

  const response = await fetch(`${API_BASE_URL}/houses/${propertyId}/photos/gps-capture`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${authToken}` },
    body: formData,
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return response.json() as Promise<GpsCaptureUploadResult>;
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
