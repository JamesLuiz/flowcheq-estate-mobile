export type AppUser = {
  id: string;
  name: string;
  email: string;
  role?: string;
  phone?: string;
  emailVerified?: boolean;
  youverifyStatus?: string | null;
  walletBalance?: number;
};
