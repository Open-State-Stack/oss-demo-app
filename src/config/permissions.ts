import { IRole } from "@/types/IRole";

export type Page =
  | "Dashboard"
  | "Projects"
  | "Categories"
  | "Users"
  | "Designations"
  | "Activity Log"
  | "Profile";

export type Action = "create" | "read" | "update" | "delete";

export type Permissions = Partial<Record<Page, Action[]>>;

export const permissionsMap: Record<IRole, Permissions> = {
  super_admin: {
    Dashboard: ["create", "read", "update", "delete"],
    Projects: ["create", "read", "update", "delete"],
    Categories: ["create", "read", "update", "delete"],
    Users: ["create", "read", "update", "delete"],
    Designations: ["create", "read", "update", "delete"],
    "Activity Log": ["read"],
    Profile: ["create", "read", "update", "delete"],
  },
  admin: {
    Dashboard: ["read"],
    Projects: ["create", "read", "update", "delete"],
    Categories: ["read"],
    Users: ["read"],
    Designations: ["read"],
    "Activity Log": ["read"],
    Profile: ["read", "update"],
  },
  user: {
    Dashboard: ["read"],
    Profile: ["read", "update"],
  },
};
