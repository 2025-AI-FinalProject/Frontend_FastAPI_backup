import React, { useState, useEffect } from "react";
import { Settings } from "lucide-react";
import IndicatorModal from "../components/IndicatorModal";
import TrafficCard from "../components/TrafficCard";

const NetworkTrafficMonitoring: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0); // 새로고침 트리거

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      setRefreshTrigger((prev) => prev + 1);
    }, 2000); // 2초

    return () => clearInterval(interval);
  }, [autoRefresh]);

  return (
    <div className="p-6">
      {/* 상단 타이틀 및 컨트롤 바 */}
      <div className="flex items-center justify-between mb-4">
        {/* 타이틀 영역 */}
        <div>
          <h1 className="text-2xl font-semibold">네트워크 트래픽 실시간 모니터링 📈</h1>
        </div>

        {/* 컨트롤 버튼 영역 */}
        <div className="flex items-center space-x-2">
          <select
            className="appearance-none text-sm rounded px-3 py-2 border border-gray-300 bg-white
            focus:outline-none focus:ring-1 focus:ring-gray-300 focus:border-gray-300
            cursor-pointer"
          >
            <option>최근 1시간</option>
            <option>최근 30분</option>
            <option>최근 24시간</option>
          </select>

          <button
            className={`w-36 text-sm rounded px-3 py-2 transition-colors duration-200 ${
              autoRefresh ? "bg-blue-200" : "bg-gray-200"
            }`}
            onClick={() => setAutoRefresh((prev) => !prev)}
          >
            자동 새로고침: {autoRefresh ? "ON" : "OFF"}
          </button>

          <button
            className="flex items-center text-sm bg-gray-200 hover:bg-gray-300 rounded px-3 py-2"
            onClick={() => setIsModalOpen(true)}
          >
            <Settings className="w-4 h-4 mr-1" /> 지표 설정
          </button>
        </div>
      </div>


      {/* 지표 카드 영역 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 min-h-[680px]">
        <TrafficCard
          refreshTrigger={refreshTrigger}
          title="Flow Byts/s (초당 트래픽)"
          unit="Gbps"
        />
        <TrafficCard
          refreshTrigger={refreshTrigger}
          title="Flow Pkts/s (초당 패킷 수)"
          unit="Pkts/s"
        />
        <TrafficCard
          refreshTrigger={refreshTrigger}
          title="Top Dst Port (목적지 포트)"
          unit=""
        />
        <TrafficCard
          refreshTrigger={refreshTrigger}
          title="RST Flag Cnt (연결 초기화)"
          unit="개"
        />
      </div>

      <IndicatorModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};

export default NetworkTrafficMonitoring;
