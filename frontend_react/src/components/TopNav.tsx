import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Bell, Menu, Star, LogOut, User, Home } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from '../context/useAppStore';
import { useFavoritesStore } from '../context/useFavoritesStore';

interface TopNavProps {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
}

const TopNav: React.FC<TopNavProps> = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const isCollapsed = useAppStore((s) => s.isSidebarCollapsed);
  const toggleSidebarCollapsed = useAppStore((s) => s.toggleSidebarCollapsed);

  const favorites = useFavoritesStore((s) => s.favorites);
  const toggleFavorite = useFavoritesStore((s) => s.toggleFavorite);

  const toggleNotificationOpen = useAppStore((s) => s.toggleNotificationOpen);
  const logoutZustand = useAppStore((s) => s.logout);
  const user = useAppStore((s) => s.user);
  const hasUnread = useAppStore((s) => s.hasUnread);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const yyyy = now.getFullYear();
      const mm = String(now.getMonth() + 1).padStart(2, "0");
      const dd = String(now.getDate()).padStart(2, "0");
      const hh = String(now.getHours()).padStart(2, "0");
      const min = String(now.getMinutes()).padStart(2, "0");
      const ss = String(now.getSeconds()).padStart(2, "0");

      const dayNames = ["일", "월", "화", "수", "목", "금", "토"];
      const day = dayNames[now.getDay()];

      const formatted = `${yyyy}.${mm}.${dd} (${day}) ${hh}.${min}.${ss}`;
      setCurrentTime(formatted);
      console.log("CurrentTime:", formatted); // ✅ 확인용
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleMyPage = () => {
    navigate("/mypage");
    setIsDropdownOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    logoutZustand();
    navigate("/login");
  };

  const pathParts = location.pathname.split("/").filter(Boolean);
  const currentPath = pathParts[0] ?? "home";
  const isFavorite = currentPath ? favorites.includes(currentPath) : false;

  const mainCategoryMap: Record<string, string> = {
    traffic: "실시간 모니터링",
    network: "실시간 모니터링",
    typeofNetworkTrafficAttack: "공격 유형별 요약",
    typeofSystemLogAttack: "공격 유형별 요약",
    attackIPBlocking: "공격 유형별 대응 정책",
    isolateInternalInfectedPC: "공격 유형별 대응 정책",
    blockingcertainports: "공격 유형별 대응 정책",
  };

  const labelMap: Record<string, string> = {
    home: "Main",
    traffic: "네트워크 트래픽 모니터링",
    network: "시스템 로그 모니터링",
    typeofNetworkTrafficAttack: "네트워크 트래픽 공격 유형",
    typeofSystemLogAttack: "시스템 로그 공격 유형",
    attackIPBlocking: "외부 공격 IP 차단",
    isolateInternalInfectedPC: "내부 감염 PC 관리",
    blockingcertainports: "특정 포트 차단",
    mypage: "My Page",
  };

  const mainCategory = mainCategoryMap[currentPath] || "";
  const subCategory =
    labelMap[currentPath] ??
    (currentPath ? currentPath.charAt(0).toUpperCase() + currentPath.slice(1) : "");

  const friendlyParts = mainCategory ? [mainCategory, subCategory] : [subCategory];
  const userInitial = user?.name?.charAt(0).toUpperCase() ?? "U";

  return (
    <header className="h-16 bg-white shadow-sm flex items-center justify-between px-4 z-30 relative">
      {/* 중앙 실시간 시간 */}
      <div className="absolute left-1/2 transform -translate-x-1/2 flex flex-col items-center text-sm text-gray-600 font-medium leading-tight">
        <span className="text-xs text-gray-500">Today</span>
        <span className="tracking-wide">{currentTime}</span>
      </div>

      {/* 왼쪽: 메뉴 & 경로 */}
      <div className="flex items-center gap-2">
        <button
          onClick={toggleSidebarCollapsed}
          title={isCollapsed ? "사이드바 열기" : "사이드바 접기"}
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center text-sm text-gray-600">
          <Link to="/">
            <Home className="w-4 h-4 mr-2" />
          </Link>
          {currentPath && (
            <button
              onClick={currentPath !== "home" ? () => toggleFavorite(currentPath) : undefined}
              disabled={currentPath === "home"}
              aria-disabled={currentPath === "home"}
              style={{ cursor: currentPath === "home" ? "default" : "pointer" }}
            >
              <Star
                className={`w-4 h-4 mr-2 transition ${
                  isFavorite ? "text-yellow-400 fill-yellow-400" : "text-gray-400"
                }`}
              />
            </button>
          )}
          {friendlyParts.map((part, idx) => (
            <span
              key={idx}
              className={
                idx === friendlyParts.length - 1
                  ? "text-black font-semibold"
                  : "text-gray-600"
              }
            >
              {part}
              {idx !== friendlyParts.length - 1 && (
                <span className="mx-1 text-gray-400">/</span>
              )}
            </span>
          ))}
        </div>
      </div>

      {/* 오른쪽: 유저, 알림 */}
      <div className="flex items-center gap-4">
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen((prev) => !prev)}
            className="w-8 h-8 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center hover:bg-gray-300"
            title="사용자 메뉴"
          >
            <span className="text-sm font-semibold">{userInitial}</span>
          </button>

          <AnimatePresence>
            {isDropdownOpen && (
              <motion.div
                key="dropdown"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded shadow-md z-40 py-2 origin-top-right"
              >
                {user?.name && (
                  <div className="px-4 py-2 text-xs text-gray-500 border-b border-gray-100">
                    {user.name} 님 안녕하세요 ^^
                  </div>
                )}
                <ul className="text-sm text-gray-700">
                  <li>
                    <button
                      onClick={handleMyPage}
                      className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-100"
                    >
                      <User size={16} />
                      마이페이지
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-100"
                    >
                      <LogOut size={16} />
                      로그아웃
                    </button>
                  </li>
                </ul>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="relative">
          <button onClick={toggleNotificationOpen} title="알림 토글">
            <Bell className="w-5 h-5 mt-1" />
            {hasUnread && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-400 rounded-full border border-white" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

export default TopNav;
