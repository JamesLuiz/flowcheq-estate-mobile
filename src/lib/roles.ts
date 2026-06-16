export const LISTING_OWNER_ROLES = ['landlord', 'real_estate_company', 'company'] as const;
export const AGENT_ROLES = ['agent'] as const;
export const HOUSE_HUNTER_ROLES = ['user', 'tenant', 'house_hunter'] as const;
export const LAWYER_ROLES = ['lawyer'] as const;
export const YOUVERIFY_ACCOUNT_ROLES = [
  ...LISTING_OWNER_ROLES,
  ...AGENT_ROLES,
  ...HOUSE_HUNTER_ROLES,
  ...LAWYER_ROLES,
] as const;

export function isAgentRole(role?: string | null): boolean {
  return role === 'agent';
}

export function requiresYouverifyAccount(role?: string | null): boolean {
  return YOUVERIFY_ACCOUNT_ROLES.includes(role as (typeof YOUVERIFY_ACCOUNT_ROLES)[number]);
}

export function isYouverifyVerified(user?: { youverifyStatus?: string | null } | null): boolean {
  return user?.youverifyStatus === 'verified';
}

export function getPostLoginPath(user?: {
  role?: string | null;
  youverifyStatus?: string | null;
} | null): string {
  if (user && requiresYouverifyAccount(user.role) && !isYouverifyVerified(user)) {
    return '/verify-account';
  }
  return '/';
}

export function canAccessWallet(role?: string | null): boolean {
  return requiresYouverifyAccount(role);
}
