import { IRole } from "@/types/IRole";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
interface RoleState {
  role: IRole | null;
  isLoading: boolean;
  error: string | null;
  onRoleSet: (data: { role: IRole }) => Promise<void>;
  reset: () => void;
}

export const useRoleStore = create<RoleState>()(
  persist(
    (set) => ({
      role: null,
      isLoading: false,
      error: null,

      onRoleSet: async ({ role }) => {
        set({ isLoading: true, error: null });
        try {
          set({
            role,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "An unknown error occurred",
            isLoading: false,
          });
        }
      },

      reset: () =>
        set({
          role: null,
          isLoading: false,
          error: null,
        }),
    }),
    {
      name: "role-store",
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
