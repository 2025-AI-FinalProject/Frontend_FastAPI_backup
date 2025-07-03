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

// 전체 Zustand 상태 타입
interface AppState {
  isLoggedIn: boolean;
  user: User | null;
  isSidebarCollapsed: boolean;
  hasHydrated: boolean;
  openSections: SectionOpenState;
  isNotificationOpen: boolean;

  // 알림 관련 상태
  hasUnread: boolean;
  unreadCount: number;

  // 액션
  login: (user: User) => void;
  logout: () => void;
  updateUser: (user: User) => void;
  toggleSidebarCollapsed: () => void;
  setHasHydrated: (v: boolean) => void;
  toggleSectionOpen: (key: keyof SectionOpenState) => void;
  toggleNotificationOpen: () => void;

  // 알림 관련 액션
  setUnreadCount: (count: number) => void;
  markAllAsRead: () => void;
}

// 동적으로 스토리지 타입을 결정하는 함수
const getDynamicStorage = (): StateStorage => {
  const keepLoggedIn = localStorage.getItem("keepLoggedIn");
  return keepLoggedIn === "true" ? localStorage : sessionStorage;
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      isLoggedIn: false,
      user: null,
      isSidebarCollapsed: false,
      hasHydrated: false,

      openSections: {
        favorites: true,
        summary: true,
        monitoring: true,
        attack: true,
      },
      isNotificationOpen: true,

      // 🔔 알림 상태 초기화
      hasUnread: true,
      unreadCount: 3, // 초기 더미 값

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
        set(() => ({
          isLoggedIn: false,
          user: null,
          isSidebarCollapsed: false,
          openSections: {
            favorites: true,
            summary: true,
            monitoring: true,
            attack: true,
          },
          isNotificationOpen: true,
          hasUnread: false,
          unreadCount: 0,
        }));
        localStorage.removeItem("keepLoggedIn");
        toast.success("로그아웃되었습니다.");
      },

      updateUser: (updatedUser: User) =>
        set((state) => ({
          user: { ...state.user, ...updatedUser },
        })),

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

      // ✅ 알림 수 설정
      setUnreadCount: (count: number) =>
        set(() => ({
          unreadCount: count,
          hasUnread: count > 0,
        })),

      // ✅ 전체 읽음 처리
      markAllAsRead: () =>
        set(() => ({
          unreadCount: 0,
          hasUnread: false,
        })),
    }),
    {
      name: "app-storage",
      storage: createJSONStorage(getDynamicStorage),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setHasHydrated(true);
        }
      },
    }
  )
);
