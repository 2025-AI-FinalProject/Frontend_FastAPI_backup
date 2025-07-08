import React from "react";
import { useAppStore } from "../context/useAppStore"; // useAppStore 임포트 확인
import { useFavoritesStore } from "../context/useFavoritesStore";
import { NavLink, useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";

import {
    X,
    Star,
    FileText,
    Activity,
    ShieldCheck,
    ChevronDown,
    ChevronRight,
} from "lucide-react";

// 라우트 키에 대응하는 한글/영문 라벨 매핑
const labelMap: Record<string, string> = {
    preview: "Preview",
    chart: "Chart",
    traffic: "트래픽 모니터링",
    network: "시스템 네트워크 모니터링",
    typeofNetworkTrafficAttack: "네트워크 트래픽 공격 유형",
    typeofSystemLogAttack: "시스템 로그 공격 유형",
    attackIPBlocking : "외부 공격 IP 차단",
    isolateInternalInfectedPC : "내부 감염 PC 격리",
    blockingcertainports : "특정 포트 차단",
    mypage: "My Page"
    // 필요 시 추가 가능
};

const Sidebar: React.FC = () => {
    // Zustand 전역 상태에서 즐겨찾기 배열 불러오기
    const favorites = useFavoritesStore((state) => state.favorites);
    // 즐겨찾기 토글 함수
    const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite);
    // 사이드바 접힘/펼침 여부
    const isCollapsed = useAppStore((state) => state.isSidebarCollapsed);
    // 열려있는 섹션 상태 (즐겨찾기, 요약, 모니터링, 공격 등)
    const openSections = useAppStore((state) => state.openSections);
    // 섹션 열림/닫힘 토글 함수
    const toggleSectionOpen = useAppStore((state) => state.toggleSectionOpen);
    // useAppStore에서 logout 액션 가져오기
    // ✨ 핵심 변경: useAppStore의 logout 액션을 가져옵니다.
    const logoutZustand = useAppStore((state) => state.logout); 

    const navigate = useNavigate();

    // 서브 메뉴 아이템 클래스 (사이드바 접힘 여부에 따라 마진 및 정렬 조절)
    const subItemClass = (base?: string) =>
        `${isCollapsed ? "flex justify-center text-center" : "ml-4"} ${
            base || ""
        }`;

    // 접힌 상태면 구분선 스타일 추가
    const dividerClass = isCollapsed ? "border-t pt-3 mt-3" : "";

    // 카테고리 라인 공통 클래스: 두껍고 회색, 커서 포인터
    // 접힌 상태면 중앙 정렬 및 구분선 추가
    const categoryLineClass = `font-semibold mt-4 flex items-center text-gray-500 cursor-pointer ${
        isCollapsed ? "justify-center" : ""
    } ${dividerClass}`;

    /**
     * 로그아웃 처리 함수.
     * 로컬 스토리지에서 인증 토큰을 제거하고, Zustand 상태를 초기화한 후 로그인 페이지로 리다이렉트합니다.
     */
    const handleLogout = () => {
        // 1. localStorage에서 토큰 제거
        // 실제 애플리케이션에서 토큰을 저장할 때 사용한 키 이름을 여기에 정확히 기재해야 합니다.
        // 예를 들어, 'access_token'이라는 키로 저장했다면 아래 코드를 사용합니다.
        localStorage.removeItem('access_token');
        // 만약 refresh token도 사용하고 있다면, 해당 토큰도 제거해야 합니다.
        localStorage.removeItem('refresh_token'); 

        // ✨ 핵심 변경: useAppStore의 logout 액션을 호출합니다.
        // 이 액션이 useAppStore의 isLoggedIn 상태를 false로 설정하고 user를 null로 만듭니다.
        // 또한, useAppStore의 logout 액션 내부에서 'keepLoggedIn' 플래그도 제거됩니다.
        logoutZustand(); 

        // 3. 로그인 페이지로 이동
        // useAppStore의 logout 액션이 실행된 후, ProtectedRoute가 isLoggedIn:false를 감지하고
        // /login으로 리디렉션할 것이므로, 이 navigate는 사실상 보조적인 역할이 됩니다.
        // 하지만 명시적으로 이동시키는 것이 사용자 경험에 좋습니다.
        navigate("/login");
    };

    return (
        <aside
            className={`${
                isCollapsed ? "w-14" : "w-[250px]"
            } h-screen bg-white shadow-sm flex flex-col transition-all duration-300 z-30`}
        >
            <div className="h-16 flex items-center justify-center font-bold text-lg shadow-sm">
                <NavLink to="/" className="truncate">
                    {isCollapsed ? "A" : "A_P"}
                </NavLink>
            </div>

            <nav className="flex-1 overflow-y-auto p-4">
                <ul className="space-y-2 text-sm">
                    {/* 즐겨찾기 섹션 제목 */}
                    <li
                        className={categoryLineClass}
                        onClick={() => toggleSectionOpen("favorites")}
                    >
                        <Star size={16} className={isCollapsed ? "" : "mr-2"} />
                        {!isCollapsed && (
                            <>
                                <span className="flex-1">즐겨찾기</span>
                                {openSections.favorites ? (
                                    <ChevronDown size={14} />
                                ) : (
                                    <ChevronRight size={14} />
                                )}
                            </>
                        )}
                    </li>
                    {/* 즐겨찾기 메뉴 아이템 리스트 */}
                    {openSections.favorites &&
                        favorites
                            .filter((fav): fav is string => typeof fav === "string")
                            .map((fav, idx) => {
                                const label = labelMap[fav] ?? fav;
                                const shortLabel = label.charAt(0).toUpperCase();

                                return (
                                    <li
                                        key={idx}
                                        className={`${
                                            isCollapsed
                                                ? "group text-gray-700"
                                                : "flex justify-between items-center group text-gray-700"
                                        } ${subItemClass()}`}
                                    >
                                        <button
                                            onClick={() => navigate(`/${fav}`)}
                                            title={label}
                                            className={`px-2 py-1 rounded transition hover:bg-gray-100 ${
                                                isCollapsed
                                                    ? "text-gray-700 block px-2 py-1 rounded transition"
                                                    : "flex-1 truncate text-left"
                                            }`}
                                        >
                                            {isCollapsed ? shortLabel : label}
                                        </button>

                                        {!isCollapsed && (
                                            <button
                                                onClick={() => toggleFavorite(fav)}
                                                className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"
                                                title="즐겨찾기 제거"
                                            >
                                                <X size={16} />
                                            </button>
                                        )}
                                    </li>
                            );
                        })}

                    {/* 실시간 모니터링 섹션 */}
                    <li
                        className={categoryLineClass}
                        onClick={() => toggleSectionOpen("monitoring")}
                    >
                        <Activity size={16} className={isCollapsed ? "" : "mr-2"} />
                        {!isCollapsed && (
                            <>
                                <span className="flex-1">실시간 모니터링</span>
                                {openSections.monitoring ? (
                                    <ChevronDown size={14} />
                                ) : (
                                    <ChevronRight size={14} />
                                )}
                            </>
                        )}
                    </li>
                    {/* 실시간 모니터링 하위 메뉴 */}
                    {openSections.monitoring && (
                        <>
                            <li className={subItemClass()}>
                                <NavLink
                                    to="/traffic"
                                    title="네트워크 트래픽 모니터링"
                                    className={({ isActive }) =>
                                        `text-gray-700 block px-2 py-1 rounded transition ${
                                            isActive
                                                ? "bg-blue-100 text-blue-600 font-medium"
                                                : "hover:bg-gray-100"
                                        }`
                                    }
                                >
                                    {isCollapsed ? "트" : "네트워크 트래픽 모니터링"}
                                </NavLink>
                            </li>
                            <li className={subItemClass()}>
                                <NavLink
                                    to="/network"
                                    title="시스템 로그 모니터링"
                                    className={({ isActive }) =>
                                        `text-gray-700 block px-2 py-1 rounded transition ${
                                            isActive
                                                ? "bg-blue-100 text-blue-600 font-medium"
                                                : "hover:bg-gray-100"
                                        }`
                                    }
                                >
                                    {isCollapsed ? "시" : "시스템 로그 모니터링"}
                                </NavLink>
                            </li>
                        </>
                    )}

                    {/* 공격유형별 요약 섹션 */}
                    <li
                        className={categoryLineClass}
                        onClick={() => toggleSectionOpen("attack")}
                    >
                        <ShieldCheck size={16} className={isCollapsed ? "" : "mr-2"} />
                        {!isCollapsed && (
                            <>
                                <span className="flex-1">공격 유형별 요약</span>
                                {openSections.attack ? (
                                    <ChevronDown size={14} />
                                ) : (
                                    <ChevronRight size={14} />
                                )}
                            </>
                        )}
                    </li>

                    {/* 공격유형별 요약 하위 메뉴 */}
                    {openSections.attack && (
                        <>
                            <li className={subItemClass()}>
                                <NavLink
                                    to="/typeofNetworkTrafficAttack"
                                    title="네트워크 트래픽 공격 유형"
                                    className={({ isActive }) =>
                                        `text-gray-700 block px-2 py-1 rounded transition ${
                                            isActive
                                                ? "bg-blue-100 text-blue-600 font-medium"
                                                : "hover:bg-gray-100"
                                        }`
                                    }
                                >
                                    {isCollapsed ? "트" : "네트워크 트래픽 공격 유형"}
                                </NavLink>
                            </li>
                            <li className={subItemClass()}>
                                <NavLink
                                    to="/typeofSystemLogAttack"
                                    title="시스템 로그 공격 유형"
                                    className={({ isActive }) =>
                                        `text-gray-700 block px-2 py-1 rounded transition ${
                                            isActive
                                                ? "bg-blue-100 text-blue-600 font-medium"
                                                : "hover:bg-gray-100"
                                        }`
                                    }
                                >
                                    {isCollapsed ? "시" : "시스템 로그 공격 유형"}
                                </NavLink>
                            </li>
                        </>
                    )}

                    {/* 요약 정리 섹션 */}
                    <li
                        className={categoryLineClass}
                        onClick={() => toggleSectionOpen("summary")}
                    >
                        <FileText size={16} className={isCollapsed ? "" : "mr-2"} />
                        {!isCollapsed && (
                            <>
                                <span className="flex-1">공격 유형별 대응 정책</span>
                                {openSections.summary ? (
                                    <ChevronDown size={14} />
                                ) : (
                                    <ChevronRight size={14} />
                                )}
                            </>
                        )}
                    </li>
                    {/* 요약 정리 하위 메뉴 */}
                    {openSections.summary && (
                        <>
                            <li className={subItemClass()}>
                                <NavLink
                                    to="/attackIPBlocking"
                                    title="AttackIPBlocking"
                                    className={({ isActive }) =>
                                        `text-gray-700 block px-2 py-1 rounded transition ${
                                            isActive
                                                ? "bg-blue-100 text-blue-600 font-medium"
                                                : "hover:bg-gray-100"
                                        }`
                                    }
                                >
                                    {isCollapsed ? "외" : "외부 공격 IP 차단"}
                                </NavLink>
                            </li>
                            <li className={subItemClass()}>
                                <NavLink
                                    to="/isolateInternalInfectedPC"
                                    title="IsolateInternalInfectedPC"
                                    className={({ isActive }) =>
                                        `text-gray-700 block px-2 py-1 rounded transition ${
                                            isActive
                                                ? "bg-blue-100 text-blue-600 font-medium"
                                                : "hover:bg-gray-100"
                                        }`
                                    }
                                >
                                    {isCollapsed ? "내" : "내부 감염 PC 관리"}
                                </NavLink>
                            </li>
                            <li className={subItemClass()}>
                                <NavLink
                                    to="/blockingcertainports"
                                    title="Blockingcertainports"
                                    className={({ isActive }) =>
                                        `text-gray-700 block px-2 py-1 rounded transition ${
                                            isActive
                                                ? "bg-blue-100 text-blue-600 font-medium"
                                                : "hover:bg-gray-100"
                                        }`
                                    }
                                >
                                    {isCollapsed ? "특" : "특정 포트 차단"}
                                </NavLink>
                            </li>
                        </>
                    )}

                </ul>
            </nav>

            {/* 로그아웃 버튼 추가 */}
            <div className="p-4">
                {isCollapsed ? (
                    <button
                        onClick={handleLogout} 
                        title="로그아웃"
                        className="w-full flex items-center justify-center text-red-500 hover:bg-red-50 p-2 rounded transition"
                    >
                        <LogOut size={16} />
                    </button>
                ) : (
                    <button
                        onClick={handleLogout} 
                        className="w-full flex items-center justify-center gap-2 text-sm text-red-500 hover:bg-red-50 p-2 rounded transition"
                    >
                        <LogOut size={16} />
                        <span>로그아웃</span>
                    </button>
                )}
            </div>

            {/* 접힌 상태가 아니면 하단 저작권 문구 표시 */}
            {!isCollapsed && (
                <div className="p-4 text-xs text-gray-500">© 2025 A_P</div>
            )}
        </aside>
    );
};

export default Sidebar;