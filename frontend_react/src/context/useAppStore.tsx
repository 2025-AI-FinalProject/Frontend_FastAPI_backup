import { create } from "zustand";
import { persist, createJSONStorage, type StateStorage } from "zustand/middleware";
import toast from "react-hot-toast";

// 사용자 정보 타입
interface User {
  emp_number: string;
  name: string;
  email?: string;
  phone?: string;
}

// 대분류 섹션 상태 타입
interface SectionOpenState {
  favorites: boolean;
  summary: boolean;
  monitoring: boolean;
  attack: boolean;
}

// 전체 Zustand 상태 타입 (favorites와 toggleFavorite 제거)
interface AppState {
  isLoggedIn: boolean;
  user: User | null;
  // favorites: string[]; // 이 줄을 제거합니다.
  isSidebarCollapsed: boolean;
  hasHydrated: boolean;
  openSections: SectionOpenState;
  isNotificationOpen: boolean;

  // 액션들 (toggleFavorite 제거)
  login: (user: User) => void;
  logout: () => void;
  updateUser: (user: User) => void;
  // toggleFavorite: (path: string) => void; // 이 줄을 제거합니다.
  toggleSidebarCollapsed: () => void;
  setHasHydrated: (v: boolean) => void;
  toggleSectionOpen: (key: keyof SectionOpenState) => void;
  toggleNotificationOpen: () => void;
}

// 동적으로 스토리지 타입을 결정하는 함수
const getDynamicStorage = (): StateStorage => {
  const keepLoggedIn = localStorage.getItem("keepLoggedIn");

  if (keepLoggedIn === "true") {
    return localStorage;
  } else {
    return sessionStorage;
  }
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // 초기 상태
      isLoggedIn: false,
      user: null,
      // favorites: [], // 이 줄을 제거합니다.
      isSidebarCollapsed: false,
      hasHydrated: false,

      openSections: {
        favorites: true,
        summary: true,
        monitoring: true,
        attack: true,
      },
      isNotificationOpen: false,

      // 액션 구현
      setHasHydrated: (v: boolean) => set({ hasHydrated: v }),

      login: (user: User) => {
        if (!user || typeof user.emp_number !== "string") {
          console.warn("유효하지 않은 사용자 정보입니다.");
          return;
        }
        set(() => ({ isLoggedIn: true, user }));
      },

      logout: () => {
        set((state) => ({
          isLoggedIn: false,
          user: null,
          isSidebarCollapsed: false,
          openSections: {
            favorites: true,
            summary: true,
            monitoring: true,
            attack: true,
          },
          isNotificationOpen: false,
        }));
        localStorage.removeItem("keepLoggedIn"); // 'keepLoggedIn' 설정도 초기화
        toast.success("로그아웃되었습니다.");
      },

      updateUser: (updatedUser: User) => {
        set((state) => ({
          user: { ...state.user, ...updatedUser }
        }));
      },

      // toggleFavorite: (path: string) => { /* 이 함수 전체를 제거합니다 */ },

      toggleSidebarCollapsed: () =>
        set((state) => ({
          isSidebarCollapsed: !state.isSidebarCollapsed,
        })),

      toggleSectionOpen: (key: keyof SectionOpenState) =>
        set((state) => ({
          openSections: {
            ...state.openSections,
            [key]: !state.openSections[key],
          },
        })),

      toggleNotificationOpen: () =>
        set((state) => ({
          isNotificationOpen: !state.isNotificationOpen,
        })),
    }),
    {
      name: "app-storage", // 스토리지에 저장될 때 사용될 키 이름
      storage: createJSONStorage(getDynamicStorage),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setHasHydrated(true);
        }
      },
    }
  )
);