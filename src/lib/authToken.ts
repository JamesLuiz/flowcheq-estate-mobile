import * as SecureStore from 'expo-secure-store';
import { API_AUTH_TOKEN } from './config';

const AUTH_TOKEN_KEY = 'nestin_auth_token';

/** Prefer device secure storage; fall back to EXPO_PUBLIC_AUTH_TOKEN for local dev. */
export async function getAuthToken(): Promise<string> {
  try {
    const stored = await SecureStore.getItemAsync(AUTH_TOKEN_KEY);
    if (stored) return stored;
  } catch {
    // SecureStore unavailable (e.g. web) — use env fallback below
  }
  return API_AUTH_TOKEN;
}

export async function setAuthToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(AUTH_TOKEN_KEY, token);
}

export async function clearAuthToken(): Promise<void> {
  await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
}
