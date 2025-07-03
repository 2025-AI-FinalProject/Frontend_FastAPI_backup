import { Navigate } from "react-router-dom";
import { useAppStore } from "./context/useAppStore";
import type { ReactNode } from "react";

interface ProtectedRouteProps {
    children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
    const isLoggedIn = useAppStore((s) => s.isLoggedIn);
    const hasHydrated = useAppStore((s) => s.hasHydrated);

    // Zustand 스토어의 상태가 로컬 스토리지에서 아직 복원되지 않았다면 아무것도 렌더링하지 않습니다.
    // 이 시간 동안 로딩 스피너 등을 보여줄 수 있습니다.
    if (!hasHydrated) return null;

    // 로그인되어 있지 않다면 로그인 페이지로 리디렉션합니다.
    // ✨ 수정: Navigate to "/" (루트) 대신 "/login"으로 변경
    if (!isLoggedIn) {
        return <Navigate to="/login" replace />;
    }

    // 로그인되어 있고 상태가 복원되었다면 자식 컴포넌트들을 렌더링합니다.
    return <>{children}</>;
};

export default ProtectedRoute;
