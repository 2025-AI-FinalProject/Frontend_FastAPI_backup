import React from "react";

interface IndicatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const IndicatorModal: React.FC<IndicatorModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white w-[600px] max-w-[90%] rounded-md p-6 shadow-lg">
        <h2 className="text-lg font-semibold mb-4">📊 지표 설정</h2>

        <div className="flex space-x-4">
          {/* 전체 지표 */}
          <div className="w-1/2 text-sm">
            <p className="font-medium mb-1">선택 가능한 전체 지표</p>
            <ul className="space-y-1 border p-2 h-48 overflow-y-auto rounded">
              <li>▸ Flow Byts/s</li>
              <li>▸ Flow Pkts/s</li>
              <li>▸ Flow IAT Mean</li>
              <li>▸ Pkt Len Var</li>
              <li>▸ RST Flag Cnt</li>
              {/* ...스크롤 영역 */}
            </ul>
          </div>

          {/* 선택된 지표 */}
          <div className="w-1/2 text-sm">
            <p className="font-medium mb-1">✅ 내가 선택한 지표</p>
            <ul className="space-y-1 border p-2 h-48 overflow-y-auto rounded">
              <li>1. Flow Byts/s [drag] ❌</li>
              <li>2. Flow Pkts/s [drag] ❌</li>
              <li>3. Top Dst Port [drag] ❌</li>
              <li>4. RST Flag Cnt [drag] ❌</li>
            </ul>
          </div>
        </div>

        <div className="flex justify-end mt-6 space-x-2">
          <button className="px-4 py-1 border rounded" onClick={onClose}>
            취소
          </button>
          <button className="px-4 py-1 bg-blue-500 text-white rounded" onClick={onClose}>
            저장하고 닫기
          </button>
        </div>
      </div>
    </div>
  );
};

export default IndicatorModal;
