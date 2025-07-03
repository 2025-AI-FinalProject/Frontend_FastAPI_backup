import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Bell, Menu, LayoutDashboard, Star, LogOut, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion"; // ✅ 추가
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

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const hasUnread = useAppStore((s) => s.hasUnread); // ✅ 추가

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
    preview: "요약 정리",
    chart: "요약 정리",
    traffic: "실시간 모니터링",
    network: "실시간 모니터링",
    sql: "공격유형별 요약",
    xss: "공격유형별 요약",
  };

  const labelMap: Record<string, string> = {
    home: "Main",
    overview: "Overview",
    chart: "Chart",
    preview: "Preview",
    monitoring: "Monitoring",
    traffic: "트래픽 모니터링",
    network: "시스템 네트워크 모니터링",
    sql: "SQL 인젝션",
    xss: "크로스사이트 스크립팅",
    summary: "요약 정리",
    realtime: "실시간 모니터링",
    mypage: "My Page",
  };

  const mainCategory = mainCategoryMap[currentPath] || "";
  const subCategory =
    labelMap[currentPath] ??
    (currentPath ? currentPath.charAt(0).toUpperCase() + currentPath.slice(1) : "");

  const friendlyParts = mainCategory ? [mainCategory, subCategory] : [subCategory];

  const userInitial = user?.name?.charAt(0).toUpperCase() ?? "U";

  return (
    <header className="h-16 bg-white shadow-sm flex items-center justify-between px-4 z-30">
      <div className="flex items-center gap-2">
        <button
          onClick={toggleSidebarCollapsed}
          title={isCollapsed ? "사이드바 열기" : "사이드바 접기"}
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center text-sm text-gray-600">
          <LayoutDashboard className="w-4 h-4 mr-2" />
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

      <div className="flex items-center gap-4">
        <input
          type="text"
          placeholder="Search"
          className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
        />

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
            {/* ✅ 알림 뱃지 */}
            {hasUnread && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border border-white" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

export default TopNav;
