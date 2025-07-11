import React, { useState, useEffect } from "react";
import { Settings } from "lucide-react"; // 설정 아이콘 임포트
import IndicatorModal from "../components/IndicatorModal"; // 지표 설정 모달 컴포넌트 임포트
import TrafficCard from "../components/TrafficCard"; // 트래픽 정보를 표시하는 카드 컴포넌트 임포트

// --- NetworkTrafficMonitoring 컴포넌트 정의 ---
// 네트워크 트래픽을 실시간으로 모니터링하는 페이지를 렌더링하는 함수형 컴포넌트입니다.
// 자동 새로고침, 시간 범위 선택, 지표 설정 등의 기능을 제공하며,
// 여러 TrafficCard 컴포넌트를 통해 다양한 네트워크 지표를 표시합니다.
const NetworkTrafficMonitoring: React.FC = () => {
    // 지표 설정 모달의 열림/닫힘 상태를 관리합니다.
    const [isModalOpen, setIsModalOpen] = useState(false);
    // 자동 새로고침 기능의 활성화/비활성화 상태를 관리합니다.
    const [autoRefresh, setAutoRefresh] = useState(true);
    // 데이터 새로고침을 트리거하는 상태입니다. 이 값이 변경될 때마다 TrafficCard가 데이터를 다시 로드합니다.
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    /**
     * `useEffect` 훅:
     * `autoRefresh` 상태가 true일 때, 2초마다 `refreshTrigger` 값을 증가시켜
     * 자식 컴포넌트(`TrafficCard`)의 데이터 새로고침을 유도합니다.
     * 컴포넌트 언마운트 시 인터벌을 클리어하여 메모리 누수를 방지합니다.
     */
    useEffect(() => {
        // 자동 새로고침이 비활성화되어 있으면 인터벌을 설정하지 않습니다.
        if (!autoRefresh) return;

        // 2초(2000ms)마다 `refreshTrigger`를 업데이트하는 인터벌을 설정합니다.
        const interval = setInterval(() => {
            setRefreshTrigger((prev) => prev + 1);
        }, 2000); // 2초

        // 컴포넌트가 언마운트되거나 `autoRefresh` 값이 변경될 때 인터벌을 정리합니다.
        return () => clearInterval(interval);
    }, [autoRefresh]); // `autoRefresh` 값이 변경될 때마다 이펙트가 재실행됩니다.

    return (
        <div className="p-6">
            {/* 상단 타이틀 및 컨트롤 바 영역 */}
            <div className="flex items-center justify-between mb-4">
                {/* 타이틀 영역 */}
                <div>
                    <h1 className="text-2xl font-semibold">네트워크 트래픽 실시간 모니터링 📈</h1>
                </div>

                {/* 컨트롤 버튼 영역 */}
                <div className="flex items-center space-x-2">
                    {/* 시간 범위 선택 드롭다운 */}
                    <select
                        className="appearance-none text-sm rounded px-3 py-2 h-9 border border-gray-300 bg-white
                           focus:outline-none focus:ring-1 focus:ring-gray-300 focus:border-gray-300
                           cursor-pointer"
                    >
                        <option>최근 1시간</option>
                        <option>최근 30분</option>
                        <option>최근 24시간</option>
                    </select>

                    {/* 자동 새로고침 토글 버튼 */}
                    <button
                        className={`w-36 text-sm rounded px-3 py-2 h-9 transition-colors duration-200 ${
                            autoRefresh ? "bg-blue-200" : "bg-gray-200" // `autoRefresh` 상태에 따라 배경색 변경
                        }`}
                        onClick={() => setAutoRefresh((prev) => !prev)} // 클릭 시 `autoRefresh` 상태 토글
                    >
                        자동 새로고침: {autoRefresh ? "ON" : "OFF"} {/* 현재 상태 텍스트 표시 */}
                    </button>

                    {/* 지표 설정 모달 열기 버튼 */}
                    <button
                        className="flex items-center text-sm bg-gray-200 hover:bg-gray-300 rounded px-3 py-2 h-9"
                        onClick={() => setIsModalOpen(true)} // 클릭 시 모달 열기
                    >
                        <Settings className="w-4 h-4 mr-1" /> 지표 설정
                    </button>
                </div>
            </div>

            {/* 지표 카드 영역 */}
            {/* 2열 그리드 레이아웃으로 TrafficCard 컴포넌트들을 배치합니다. */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 min-h-[680px]">
                {/* Flow Byts/s (초당 트래픽) 카드 */}
                <TrafficCard
                    refreshTrigger={refreshTrigger} // 새로고침 트리거 전달
                    title="Flow Byts/s (초당 트래픽)"
                    unit="Gbps"
                />
                {/* Flow Pkts/s (초당 패킷 수) 카드 */}
                <TrafficCard
                    refreshTrigger={refreshTrigger}
                    title="Flow Pkts/s (초당 패킷 수)"
                    unit="Pkts/s"
                />
                {/* Top Dst Port (목적지 포트) 카드 */}
                <TrafficCard
                    refreshTrigger={refreshTrigger}
                    title="Top Dst Port (목적지 포트)"
                    unit="" // 단위 없음
                />
                {/* RST Flag Cnt (연결 초기화) 카드 */}
                <TrafficCard
                    refreshTrigger={refreshTrigger}
                    title="RST Flag Cnt (연결 초기화)"
                    unit="개"
                />
            </div>

            {/* 지표 설정 모달 컴포넌트 */}
            <IndicatorModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </div>
    );
};

export default NetworkTrafficMonitoring;