// src/features/admin/config.ts

// CHANGE THIS STRING whenever you want to move the admin portal
export const ADMIN_ROOT = '/portal-x45G1';

// Helper to generate full paths
export const adminPath = (path: string) => `${ADMIN_ROOT}${path}`;