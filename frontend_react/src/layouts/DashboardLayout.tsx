import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import TopNav from "../components/TopNav";
import Footer from "../components/Footer";
import NotificationPanel from "../components/NotificationPanel";
import { Outlet } from "react-router-dom";
import { useAppStore } from "../context/useAppStore";

const DashboardLayout: React.FC = () => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const isNotificationOpen = useAppStore((s) => s.isNotificationOpen);

    return (
        <div className="h-screen overflow-hidden flex bg-gray-50">
            {/* 사이드바 영역 */}
            <div
                className={`transition-all duration-300 h-full ${
                    sidebarOpen ? "w-auto" : "w-0"
                }`}
            >
                <Sidebar />
            </div>

            {/* 메인 컨텐츠 영역 */}
            <div className="flex flex-col flex-1 h-full">
                <TopNav
                    sidebarOpen={sidebarOpen}
                    toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
                />

                <main className="flex-1 p-4 overflow-y-auto">
                    <Outlet />
                </main>

                <div>
                    <Footer />
                </div>
            </div>

            {/* 알림 패널 영역 */}
            <div
                className={`overflow-hidden transition-all duration-300 ${
                    isNotificationOpen ? "w-[300px]" : "w-0"
                }`}
            >
                <NotificationPanel />
            </div>
        </div>
    );
};

export default DashboardLayout;
