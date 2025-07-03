import React, { useEffect } from "react";
import { useAppStore } from "../context/useAppStore"; // ✅ 추가

const NotificationPanel: React.FC = () => {
  const isNotificationOpen = useAppStore((s) => s.isNotificationOpen);
  const markAllAsRead = useAppStore((s) => s.markAllAsRead); // ✅

  useEffect(() => {
    if (isNotificationOpen) {
      markAllAsRead(); // ✅ 열릴 때 읽음 처리
    }
  }, [isNotificationOpen]);

  return (
    <aside className="w-[300px] h-screen bg-white shadow-sm flex flex-col">
      <div className="h-16 flex items-center justify-center font-semibold shadow-sm">
        Notifications
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-2 text-sm">
          <div className="p-2 border rounded bg-gray-100">🚨 트래픽 이상 감지 알림</div>
          <div className="p-2 border rounded bg-gray-100">🆕 New user registered</div>
          <div className="p-2 border rounded bg-gray-100">🐞 Bug detected</div>
        </div>

        <div className="mt-4">
          <h3 className="font-semibold text-sm mb-1">LLM 요약본</h3>
          <p className="text-xs text-gray-600">
            특정 IP에서 비정상적 요청이 탐지되었습니다. 웹 서버 CPU 및 네트워크 모니터링을 권장합니다.
          </p>
        </div>
      </div>
    </aside>
  );
};

export default NotificationPanel;
