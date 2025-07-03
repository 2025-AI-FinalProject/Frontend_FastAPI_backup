import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import toast from "react-hot-toast";

interface FavoritesState {
  favorites: string[];
  toggleFavorite: (path: string) => void;
  // 필요하다면 즐겨찾기를 비우는 액션 추가
  // clearFavorites: () => void;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favorites: [],
      toggleFavorite: (path: string) => {
        if (typeof path !== "string") {
          console.warn("즐겨찾기 경로는 문자열이어야 합니다.");
          return;
        }

        const currentFavorites = get().favorites.filter((f): f is string => typeof f === "string");
        const exists = currentFavorites.includes(path);

        if (exists) {
          set({ favorites: currentFavorites.filter((p) => p !== path) });
          toast("즐겨찾기에서 제거됨", { icon: "❌" });
        } else {
          if (currentFavorites.length >= 5) {
            toast.error("즐겨찾기는 최대 5개까지 등록 가능합니다.");
            return;
          }
          set({ favorites: [...currentFavorites, path] });
          toast("즐겨찾기에 추가됨", { icon: "⭐" });
        }
      },
      // clearFavorites: () => set({ favorites: [] }), // 필요시 주석 해제
    }),
    {
      name: "favorites-storage", // 즐겨찾기 저장을 위한 고유 키
      storage: createJSONStorage(() => localStorage), // 즐겨찾기는 항상 localStorage 사용
    }
  )
);