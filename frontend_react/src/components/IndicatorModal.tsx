import React, { useState, useEffect, useRef } from "react";
import { X, ArrowRight } from "lucide-react";
import { toast } from "react-hot-toast";

interface IndicatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const indicatorDescriptions: { [key: string]: string } = {
  "Flow Byts/s": "초당 전송된 데이터의 양으로, 네트워크 대역폭 사용량입니다.",
  "Flow Pkts/s": "초당 전송된 패킷의 개수입니다.",
  "Top Dst Port": "가장 빈번하게 사용된 목적지 포트입니다.",
  "RST Flag Cnt": "TCP RST 플래그 발생 횟수로, 비정상적인 종료 가능성을 의미합니다.",
  "Flow IAT Mean": "패킷 간 평균 간격으로, 네트워크 지연을 측정할 수 있습니다.",
  "Pkt Len Var": "패킷 길이의 분산 값입니다.",
};

const IndicatorModal: React.FC<IndicatorModalProps> = ({ isOpen, onClose }) => {
  const [selectedIndicators, setSelectedIndicators] = useState<string[]>([]);
  const [selectedIndicator, setSelectedIndicator] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false); // 애니메이션 상태

  useEffect(() => {
    if (isOpen) {
      setVisible(true);
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleClickOutside = (e: MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      handleClose();
    }
  };

  const handleSelect = (name: string) => {
    if (selectedIndicators.includes(name)) return;

    if (selectedIndicators.length >= 4) {
      toast.error("4개까지만 선택할 수 있습니다.", { id: "max-4" });
      return;
    }

    setSelectedIndicators([...selectedIndicators, name]);
    setSelectedIndicator(name);
  };

  const handleRemove = (name: string) => {
    setSelectedIndicators(selectedIndicators.filter((item) => item !== name));
  };

  const handleClose = () => {
    setVisible(false); // 닫기 애니메이션 시작
    setSelectedIndicator(null);
    setTimeout(onClose, 200); // 애니메이션 시간 후 실제 닫기
  };

  const handleSave = () => {
    if (selectedIndicators.length !== 4) {
      toast.error("지표를 4개 모두 선택해야 저장할 수 있습니다.", { id: "need-4" });
      return;
    }
    handleClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center z-50 transition-opacity duration-200 ${
        visible ? "opacity-100" : "opacity-0"
      } bg-black/30`}
    >
      <div
        ref={modalRef}
        className={`bg-white w-[600px] max-w-[90%] rounded-md p-6 shadow-lg transform transition-all duration-200 ${
          visible ? "opacity-100 scale-100" : "opacity-0 scale-95"
        }`}
      >
        <h2 className="text-lg font-semibold mb-4">📊 지표 설정 (반드시 4개 선택)</h2>

        <div className="flex space-x-4">
          {/* 전체 지표 */}
          <div className="w-1/2 text-sm">
            <p className="font-medium mb-1">✅ 선택 가능한 전체 지표</p>
            <ul className="space-y-1 border p-2 h-48 overflow-y-auto rounded">
              {Object.keys(indicatorDescriptions)
                .filter((indicator) => !selectedIndicators.includes(indicator))
                .map((indicator) => (
                  <li
                    key={indicator}
                    className="flex justify-between items-center px-2 py-1 hover:bg-gray-100 rounded"
                  >
                    <span
                      className="cursor-pointer"
                      onClick={() => setSelectedIndicator(indicator)}
                    >
                      ▸ {indicator}
                    </span>
                    <button
                      onClick={() => handleSelect(indicator)}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </li>
                ))}
            </ul>
          </div>

          {/* 선택된 지표 */}
          <div className="w-1/2 text-sm">
            <p className="font-medium mb-1">
              ✅ 내가 선택한 지표{" "}
              <span className="text-xs text-gray-500">({selectedIndicators.length} / 4)</span>
            </p>
            <ul className="space-y-1 border p-2 h-48 overflow-y-auto rounded">
              {selectedIndicators.map((indicator, idx) => (
                <li
                  key={indicator}
                  className="flex justify-between items-center px-2 py-1 hover:bg-gray-100 rounded"
                >
                  <span
                    className="cursor-pointer"
                    onClick={() => setSelectedIndicator(indicator)}
                  >
                    {idx + 1}. {indicator}
                  </span>
                  <button
                    className="text-red-500 ml-2"
                    onClick={() => handleRemove(indicator)}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* 지표 설명 */}
        <div className="mt-6 pt-4 text-sm text-gray-700 min-h-[90px]">
          <p className="font-semibold mb-1">📘 지표 상세 설명</p>
          {selectedIndicator ? (
            <>
              <p>
                <strong>지표명:</strong> {selectedIndicator}
              </p>
              <p>
                <strong>설명:</strong> {indicatorDescriptions[selectedIndicator]}
              </p>
              <p>
                <strong>추천 시각화:</strong> 라인 차트
              </p>
            </>
          ) : (
            <p className="text-gray-500">
              원하는 지표를 선택하면 간단한 설명이 이곳에 표시됩니다.
            </p>
          )}
        </div>

        <div className="flex justify-between items-center mt-6">
          <p className="text-xs text-red-500">
            ※ 지표는 반드시 4개 선택해야 저장할 수 있습니다.
          </p>
          <div className="space-x-2">
            <button
              className="px-4 py-1 bg-red-50 hover:bg-red-100 rounded"
              onClick={handleClose}
            >
              취소
            </button>
            <button
              className={`px-4 py-1 rounded text-white ${
                selectedIndicators.length === 4
                  ? "bg-blue-100 hover:bg-blue-200"
                  : "bg-gray-200"
              }`}
              onClick={handleSave}
              disabled={selectedIndicators.length !== 4}
            >
              저장하고 닫기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IndicatorModal;
