/**
 * TIPE DATA MODUL MANAJEMEN PERAN & HAK AKSES (RBAC) — SALAM LMS
 */

export interface SystemPermissionItem {
  id: string;
  moduleCategory: string;
  name: string;
  description: string;
}

export interface ModulePermissionCategory {
  categoryName: string;
  permissions: SystemPermissionItem[];
}

export interface PermissionsCatalogResponse {
  total: number;
  categories: ModulePermissionCategory[];
}

export interface SystemRoleItem {
  id: string;
  name: string;
  description: string;
  isSystemRole: boolean;
  isActive: boolean;
  usersCount: number;
  permissionsCount: number;
  permissions: string[];
  updatedAt?: string;
}

export interface RoleAssignedUser {
  id: string;
  name: string;
  identityNumber: string;
  email: string;
  isActive: boolean;
}

export interface RoleDetailItem {
  id: string;
  name: string;
  description: string;
  isSystemRole: boolean;
  isActive: boolean;
  permissions: SystemPermissionItem[];
  users: RoleAssignedUser[];
}

export interface RoleSummaryStats {
  totalRoles: number;
  systemRolesCount: number;
  totalPermissions: number;
  totalUsersMapped: number;
  securityHealth: string;
}

export interface CreateRolePayload {
  id: string;
  name: string;
  description: string;
  permissions: string[];
}

export interface UpdateRolePayload {
  name: string;
  description: string;
  permissions: string[];
}

export interface CloneRolePayload {
  newRoleId: string;
  newRoleName: string;
  description: string;
}
