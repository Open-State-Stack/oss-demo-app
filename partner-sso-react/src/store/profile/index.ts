import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export const useProfileStore = create()(
  persist(
    (set) => ({
      profile: null,
      isLoading: false,
      error: null,

      onPorfileSet: async ({}) => {
        set({ isLoading: true, error: null });
        try {
          set({
            profile: {},
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
          profile: null,
          isLoading: false,
          error: null,
        }),
    }),
    {
      name: "profile-store",
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
