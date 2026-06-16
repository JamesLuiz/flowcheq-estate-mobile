export type AppUser = {
  id: string;
  name: string;
  email: string;
  role?: string;
  phone?: string;
  youverifyStatus?: string | null;
  walletBalance?: number;
};
