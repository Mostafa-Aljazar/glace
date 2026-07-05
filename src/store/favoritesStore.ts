import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface FavoritesState {
  ids: string[];
  toggle: (id: string) => void;
  isFavorite: (id: string) => boolean;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      ids: [],

      toggle: (id: string) =>
        set((state) => {
          const ids = state.ids.includes(id)
            ? state.ids.filter((fid) => fid !== id)
            : [...state.ids, id];
          return { ids };
        }),

      isFavorite: (id: string) => get().ids.includes(id),
    }),
    {
      name: "glace-favorites",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
