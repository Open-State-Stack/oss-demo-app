import { Action, Page, permissionsMap } from "@/config/permissions";
import { useRoleStore } from "@/store/role";
import { IRole } from "@/types/IRole";
import { useMemo } from "react";

export const useAccessControl = () => {
  const { role } = useRoleStore();

  return useMemo(() => {
    const currentRole = (role as IRole) || "super_admin";

    const canViewNavItem = (page: Page) => {
      return permissionsMap[currentRole]?.[page] !== undefined;
    };

    const canPerformAction = (page: Page, action: Action) => {
      const actions = permissionsMap[currentRole]?.[page] || [];
      return actions.includes(action);
    };

    return {
      canViewNavItem,
      canPerformAction,
      isSuperAdmin: currentRole === "super_admin",
      isAdmin: currentRole === "admin",
      isUser: currentRole === "user",
    };
  }, [role]);
};
