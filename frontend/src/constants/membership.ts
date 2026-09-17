export const MEMBERSHIP = {
  FREE: 0,
  STANDARD: 1,
  PREMIUM: 2,
  ADMIN: 3,
} as const;

export const MEMBERSHIP_NAMES: Record<number, string> = {
  0: "Gratis",
  1: "Standard",
  2: "Premium",
  3: "Admin",
};