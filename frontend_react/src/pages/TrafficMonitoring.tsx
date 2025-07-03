import React, { useState } from "react";
import { Settings } from "lucide-react";
import IndicatorModal from "../components/IndicatorModal"; // 모달 컴포넌트
import TrafficCard from "../components/TrafficCard"; // 카드 UI 컴포넌트

const TrafficMonitoring: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="p-6">
      {/* 상단 타이틀 및 컨트롤 바 */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">네트워크 실시간 모니터링 📈</h1>
        <div className="flex items-center space-x-2">
          <select className="border text-sm rounded px-2 py-1">
            <option>최근 1시간</option>
            <option>최근 30분</option>
            <option>최근 24시간</option>
          </select>
          <button className="text-sm border rounded px-3 py-1">자동 새로고침: ON</button>
          <button
            className="flex items-center text-sm border rounded px-3 py-1"
            onClick={() => setIsModalOpen(true)}
          >
            <Settings className="w-4 h-4 mr-1" /> 지표 설정
          </button>
        </div>
      </div>

      {/* 지표 카드 영역 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 min-h-[680px]">
        <TrafficCard title="Flow Byts/s (초당 트래픽)" unit="Gbps" />
        <TrafficCard title="Flow Pkts/s (초당 패킷 수)" unit="Pkts/s" />
        <TrafficCard title="Top Dst Port (목적지 포트)" unit="" />
        <TrafficCard title="RST Flag Cnt (연결 초기화)" unit="개" />
      </div>

      {/* 지표 설정 모달 */}
      <IndicatorModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};

export default TrafficMonitoring;
