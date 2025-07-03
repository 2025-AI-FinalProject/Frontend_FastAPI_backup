import React from "react";

const NotificationPanel: React.FC = () => {
    return (
        // 알림 패널 영역
        // 너비 300px, 화면 전체 높이(h-screen)
        // 흰색 배경, 왼쪽에 1px 테두리(border-l)
        // flex와 flex-col로 세로 정렬된 레이아웃 구성
        <aside className="w-[300px] h-screen bg-white shadow-sm flex flex-col">

            {/* 헤더 영역 : 높이 64px(h-16) / flex 박스 중앙 정렬 (수직, 수평) / 폰트 두껍게 (font-semibold) / 하단에 테두리 (border-b) */}
            <div className="h-16 flex items-center justify-center font-semibold shadow-sm">
                Notifications
            </div>

            {/* 알림 내용 영역 : flex-1: 헤더 제외 나머지 영역 모두 차지 / 세로 스크롤 가능 (overflow-y-auto) / 내부 여백(padding) 16px (p-4) */}
            <div className="flex-1 overflow-y-auto p-4">
                {/* 알림 리스트 : 알림 항목 간 간격 8px (space-y-2) / 폰트 크기 작게 (text-sm) */}

                <div className="space-y-2 text-sm">
                    {/* 각각 알림 박스 / 내부 여백 8px (p-2) / 테두리(border)와 둥근 모서리 (rounded) / 연한 회색 배경 (bg-gray-100) */}
                    <div className="p-2 border rounded bg-gray-100">🚨 트래픽 이상 감지 알림</div>
                    <div className="p-2 border rounded bg-gray-100">🆕 New user registered</div>
                    <div className="p-2 border rounded bg-gray-100">🐞 Bug detected</div>
                </div>

                {/* 알림 요약 섹션 : 상단 마진 16px (mt-4) */}
                <div className="mt-4">
                    {/* 제목 : 두꺼운 글씨 (font-semibold) / 작은 폰트 크기 (text-sm) / 아래 마진 4px (mb-1) */}
                    <h3 className="font-semibold text-sm mb-1">LLM 요약본</h3>

                    {/* 요약 내용 매우 작은 글씨 (text-xs) /회색 계열 텍스트 (text-gray-600) */}
                    <p className="text-xs text-gray-600">
                        특정 IP에서 비정상적 요청이 탐지되었습니다. 웹 서버 CPU 및 네트워크 모니터링을 권장합니다.
                    </p>
                </div>
            </div>
        </aside>
    );
};

export default NotificationPanel;
