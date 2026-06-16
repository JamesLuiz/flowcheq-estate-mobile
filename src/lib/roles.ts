/** Flowcheq Agent mobile — agents only. Other roles use web or the user PWA. */

export const AGENT_ROLE = 'agent' as const;

export function isAgentRole(role?: string | null): boolean {
  return role === AGENT_ROLE;
}

export function canUseAgentMobileApp(role?: string | null): boolean {
  return isAgentRole(role);
}

export function requiresYouverifyAccount(role?: string | null): boolean {
  return isAgentRole(role);
}

export function isYouverifyVerified(user?: { youverifyStatus?: string | null } | null): boolean {
  return user?.youverifyStatus === 'verified';
}

export function isEmailVerified(user?: { emailVerified?: boolean | null } | null): boolean {
  return Boolean(user?.emailVerified);
}

export function getPostLoginPath(user?: {
  role?: string | null;
  youverifyStatus?: string | null;
  emailVerified?: boolean | null;
} | null): '/' | '/verify-email' | '/verify-account' {
  if (!canUseAgentMobileApp(user?.role)) {
    return '/';
  }
  if (!isEmailVerified(user)) {
    return '/verify-email';
  }
  if (requiresYouverifyAccount(user?.role) && !isYouverifyVerified(user)) {
    return '/verify-account';
  }
  return '/';
}

export function canAccessWallet(role?: string | null): boolean {
  return isAgentRole(role);
}
