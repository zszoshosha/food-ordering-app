export const AUTH_ROLES = {
  GUEST: "GUEST",
  CUSTOMER: "CUSTOMER",
  ADMIN: "ADMIN",
} as const;

export type AuthRole = (typeof AUTH_ROLES)[keyof typeof AUTH_ROLES];

/**
 * Maps current persisted DB roles to the app-level RBAC model.
 * - USER/DELIVERY => CUSTOMER
 * - ADMIN => ADMIN
 * - unknown/empty => GUEST
 */
export const mapDatabaseRoleToAuthRole = (dbRole?: string | null): AuthRole => {
  if (dbRole === AUTH_ROLES.ADMIN) {
    return AUTH_ROLES.ADMIN;
  }

  if (dbRole === "USER" || dbRole === "DELIVERY") {
    return AUTH_ROLES.CUSTOMER;
  }

  return AUTH_ROLES.GUEST;
};

export const isAdminRole = (role?: string | null): boolean =>
  role === AUTH_ROLES.ADMIN;
