import { UserRole, WebTab } from '../types';

export interface RolePermissions {
  accessibleTabs: WebTab[];
  canEditSettings: boolean;
  canViewReports: boolean;
  canEditInventory: boolean;
  canEditMenu: boolean;
  canManageStaff: boolean;
  isPlatformAdmin: boolean;
  roleLabel: string;
  badgeClass: string;
  badgeDarkClass: string;
}

export const ROLE_CONFIGS: Record<UserRole, RolePermissions> = {
  superadmin: {
    accessibleTabs: ['pos', 'kds', 'orders', 'menu', 'inventory', 'tables', 'customers', 'offers', 'shifts', 'reports', 'settings'],
    canEditSettings: true,
    canViewReports: true,
    canEditInventory: true,
    canEditMenu: true,
    canManageStaff: true,
    isPlatformAdmin: true,
    roleLabel: 'Super Admin',
    badgeClass: 'bg-purple-100 text-purple-700 border-purple-200',
    badgeDarkClass: 'bg-purple-950 text-purple-300 border-purple-800',
  },
  owner: {
    accessibleTabs: ['pos', 'kds', 'orders', 'menu', 'inventory', 'tables', 'customers', 'offers', 'shifts', 'reports', 'settings'],
    canEditSettings: true,
    canViewReports: true,
    canEditInventory: true,
    canEditMenu: true,
    canManageStaff: true,
    isPlatformAdmin: false,
    roleLabel: 'Cafe Owner',
    badgeClass: 'bg-amber-100 text-amber-800 border-amber-300',
    badgeDarkClass: 'bg-amber-950 text-amber-300 border-amber-800',
  },
  manager: {
    accessibleTabs: ['pos', 'kds', 'orders', 'menu', 'inventory', 'tables', 'customers', 'offers', 'shifts', 'reports'],
    canEditSettings: false,
    canViewReports: true,
    canEditInventory: true,
    canEditMenu: true,
    canManageStaff: true,
    isPlatformAdmin: false,
    roleLabel: 'Store Manager',
    badgeClass: 'bg-blue-100 text-blue-800 border-blue-300',
    badgeDarkClass: 'bg-blue-950 text-blue-300 border-blue-800',
  },
  cashier: {
    accessibleTabs: ['pos', 'orders', 'tables', 'kds'],
    canEditSettings: false,
    canViewReports: false,
    canEditInventory: false,
    canEditMenu: false,
    canManageStaff: false,
    isPlatformAdmin: false,
    roleLabel: 'Counter Cashier',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    badgeDarkClass: 'bg-emerald-950 text-emerald-300 border-emerald-800',
  },
  barista: {
    accessibleTabs: ['kds', 'orders', 'pos', 'tables'],
    canEditSettings: false,
    canViewReports: false,
    canEditInventory: false,
    canEditMenu: false,
    canManageStaff: false,
    isPlatformAdmin: false,
    roleLabel: 'Barista',
    badgeClass: 'bg-orange-100 text-orange-800 border-orange-300',
    badgeDarkClass: 'bg-orange-950 text-orange-300 border-orange-800',
  },
  kitchen: {
    accessibleTabs: ['kds', 'orders', 'inventory'],
    canEditSettings: false,
    canViewReports: false,
    canEditInventory: true,
    canEditMenu: false,
    canManageStaff: false,
    isPlatformAdmin: false,
    roleLabel: 'Kitchen Staff',
    badgeClass: 'bg-rose-100 text-rose-800 border-rose-300',
    badgeDarkClass: 'bg-rose-950 text-rose-300 border-rose-800',
  },
  chef: {
    accessibleTabs: ['kds', 'orders', 'inventory', 'menu'],
    canEditSettings: false,
    canViewReports: false,
    canEditInventory: true,
    canEditMenu: true,
    canManageStaff: false,
    isPlatformAdmin: false,
    roleLabel: 'Head Chef',
    badgeClass: 'bg-red-100 text-red-800 border-red-300',
    badgeDarkClass: 'bg-red-950 text-red-300 border-red-800',
  },
  server: {
    accessibleTabs: ['pos', 'tables', 'orders'],
    canEditSettings: false,
    canViewReports: false,
    canEditInventory: false,
    canEditMenu: false,
    canManageStaff: false,
    isPlatformAdmin: false,
    roleLabel: 'Floor Server',
    badgeClass: 'bg-cyan-100 text-cyan-800 border-cyan-300',
    badgeDarkClass: 'bg-cyan-950 text-cyan-300 border-cyan-800',
  },
};

/**
 * Check if a role has access to a specific tab
 */
export function canAccessTab(role: UserRole | string | undefined, tab: WebTab): boolean {
  if (!role) return false;
  const normalized = (role === 'super_admin' ? 'superadmin' : role) as UserRole;
  const config = ROLE_CONFIGS[normalized];
  if (!config) return false;
  return config.accessibleTabs.includes(tab);
}

/**
 * Get role display metadata
 */
export function getRoleMeta(role: UserRole | string | undefined) {
  if (!role) return ROLE_CONFIGS.cashier;
  const normalized = (role === 'super_admin' ? 'superadmin' : role) as UserRole;
  return ROLE_CONFIGS[normalized] || ROLE_CONFIGS.cashier;
}
