import { useMemo } from 'react';

export type Role = 'admin' | 'manager' | 'user';

export interface RBACContext {
  role: Role;
  canEdit: boolean;
  canDelete: boolean;
  canView: boolean;
}

export function useRBAC(role: Role): RBACContext {
  return useMemo(() => {
    switch (role) {
      case 'admin':
        return { role, canEdit: true, canDelete: true, canView: true };
      case 'manager':
        return { role, canEdit: true, canDelete: false, canView: true };
      default:
        return { role, canEdit: false, canDelete: false, canView: true };
    }
  }, [role]);
}
