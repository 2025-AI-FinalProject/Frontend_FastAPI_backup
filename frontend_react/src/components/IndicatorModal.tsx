import React, { useState, useEffect, useRef } from "react";
import { X, ArrowRight } from "lucide-react"; // X 아이콘 (닫기), ArrowRight 아이콘 (선택)을 Lucide React에서 가져옵니다.
import { toast } from "react-hot-toast"; // 사용자에게 알림 메시지를 표시하기 위한 토스트 라이브러리입니다.

// --- IndicatorModal 컴포넌트의 props 인터페이스 정의 ---
interface IndicatorModalProps {
    // 모달의 열림/닫힘 상태를 제어합니다. (true: 열림, false: 닫힘)
    isOpen: boolean;
    // 모달을 닫을 때 호출될 콜백 함수입니다.
    onClose: () => void;
}

// --- 지표명과 해당 설명 매핑 객체 정의 ---
// 각 지표에 대한 상세 설명을 제공하여 사용자 이해를 돕습니다.
const indicatorDescriptions: { [key: string]: string } = {
    "Flow Byts/s": "초당 전송된 데이터의 양으로, 네트워크 대역폭 사용량입니다.",
    "Flow Pkts/s": "초당 전송된 패킷의 개수입니다.",
    "Top Dst Port": "가장 빈번하게 사용된 목적지 포트입니다.",
    "RST Flag Cnt": "TCP RST 플래그 발생 횟수로, 비정상적인 종료 가능성을 의미합니다.",
    "Flow IAT Mean": "패킷 간 평균 간격으로, 네트워크 지연을 측정할 수 있습니다.",
    "Pkt Len Var": "패킷 길이의 분산 값입니다.",
};

// --- IndicatorModal 컴포넌트 정의 ---
// 사용자에게 데이터 지표를 선택하도록 하는 모달 컴포넌트입니다.
// 반드시 4개의 지표를 선택해야 저장할 수 있도록 강제합니다.
const IndicatorModal: React.FC<IndicatorModalProps> = ({ isOpen, onClose }) => {
    // 사용자가 선택한 지표들의 목록을 관리하는 상태입니다.
    const [selectedIndicators, setSelectedIndicators] = useState<string[]>([]);
    // 현재 마우스 오버되거나 선택되어 상세 설명이 표시될 지표를 관리하는 상태입니다.
    const [selectedIndicator, setSelectedIndicator] = useState<string | null>(null);
    // 모달 외부 클릭 감지를 위한 ref입니다.
    const modalRef = useRef<HTMLDivElement>(null);
    // 모달의 가시성 및 애니메이션을 제어하는 상태입니다. (fade-in/out 효과)
    const [visible, setVisible] = useState(false);

    // --- useEffect 훅을 사용하여 모달 열림/닫힘 및 외부 클릭 이벤트 처리 ---
    useEffect(() => {
        if (isOpen) {
            // 모달이 열리면 `visible` 상태를 true로 설정하여 fade-in 애니메이션을 시작합니다.
            setVisible(true);
            // 모달 외부 클릭을 감지하는 이벤트 리스너를 추가합니다.
            document.addEventListener("mousedown", handleClickOutside);
        }
        // 컴포넌트 언마운트 또는 `isOpen`이 변경될 때 이벤트 리스너를 정리합니다.
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen]); // `isOpen` 상태가 변경될 때마다 이 효과를 다시 실행합니다.

    // --- 모달 외부 클릭 처리 함수 ---
    const handleClickOutside = (e: MouseEvent) => {
        // 모달 ref가 존재하고, 클릭된 요소가 모달 내부가 아니라면 모달을 닫습니다.
        if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
            handleClose();
        }
    };

    // --- 지표 선택 처리 함수 ---
    const handleSelect = (name: string) => {
        // 이미 선택된 지표라면 아무것도 하지 않습니다.
        if (selectedIndicators.includes(name)) return;

        // 선택된 지표의 개수가 4개 이상이면 에러 토스트 메시지를 표시하고 더 이상 선택하지 못하게 합니다.
        if (selectedIndicators.length >= 4) {
            toast.error("4개까지만 선택할 수 있습니다.", { id: "max-4" }); // 동일한 토스트가 중복으로 뜨는 것을 방지하기 위해 id를 사용합니다.
            return;
        }

        // 선택된 지표 목록에 새 지표를 추가합니다.
        setSelectedIndicators([...selectedIndicators, name]);
        // 선택된 지표로 설정하여 상세 설명을 표시합니다.
        setSelectedIndicator(name);
    };

    // --- 지표 제거 처리 함수 ---
    const handleRemove = (name: string) => {
        // 선택된 지표 목록에서 해당 지표를 제거합니다.
        setSelectedIndicators(selectedIndicators.filter((item) => item !== name));
    };

    // --- 모달 닫기 처리 함수 (애니메이션 포함) ---
    const handleClose = () => {
        // `visible` 상태를 false로 설정하여 fade-out 애니메이션을 시작합니다.
        setVisible(false);
        // 선택된 지표 상세 설명을 초기화합니다.
        setSelectedIndicator(null);
        // 애니메이션이 완료될 시간(200ms) 후에 실제 `onClose` 콜백 함수를 호출하여 모달을 완전히 닫습니다.
        setTimeout(onClose, 200);
    };

    // --- 지표 저장 처리 함수 ---
    const handleSave = () => {
        // 선택된 지표의 개수가 4개가 아니면 에러 토스트 메시지를 표시하고 저장을 막습니다.
        if (selectedIndicators.length !== 4) {
            toast.error("지표를 4개 모두 선택해야 저장할 수 있습니다.", { id: "need-4" });
            return;
        }
        // 모든 조건이 충족되면 모달을 닫습니다. (저장 로직은 이 컴포넌트 외부에서 처리될 것으로 예상됩니다.)
        handleClose();
    };

    // `isOpen` prop이 false일 경우 모달을 렌더링하지 않습니다 (null 반환).
    if (!isOpen) return null;

    // --- 모달 UI 렌더링 ---
    return (
        // 모달 오버레이: 배경을 어둡게 처리하고 모달을 중앙에 배치합니다.
        // `visible` 상태에 따라 투명도(opacity)와 배경색(bg-black/30)이 전환됩니다.
        <div
            className={`fixed inset-0 flex items-center justify-center z-50 transition-opacity duration-200 ${
                visible ? "opacity-100" : "opacity-0"
            } bg-black/30`}
        >
            {/* 모달 내용 컨테이너 */}
            <div
                ref={modalRef} // 외부 클릭 감지를 위해 ref를 연결합니다.
                // Tailwind CSS를 이용한 스타일링 및 `visible` 상태에 따른 transform 애니메이션 적용
                className={`bg-white w-[600px] max-w-[90%] rounded-md p-6 shadow-lg transform transition-all duration-200 ${
                    visible ? "opacity-100 scale-100" : "opacity-0 scale-95" // 모달 열릴 때 확대 효과
                }`}
            >
                {/* 모달 제목 */}
                <h2 className="text-lg font-semibold mb-4">📊 지표 설정 (반드시 4개 선택)</h2>

                {/* 지표 선택 섹션 (전체 지표와 선택된 지표) */}
                <div className="flex space-x-4">
                    {/* 전체 지표 목록 */}
                    <div className="w-1/2 text-sm">
                        <p className="font-medium mb-1">✅ 선택 가능한 전체 지표</p>
                        {/* 스크롤 가능한 지표 목록 컨테이너 */}
                        <ul className="space-y-1 border p-2 h-48 overflow-y-auto rounded">
                            {/* indicatorDescriptions 객체의 키(지표명)를 순회하며 렌더링합니다. */}
                            {/* 이미 선택된 지표는 전체 목록에서 제외하여 표시합니다. */}
                            {Object.keys(indicatorDescriptions)
                                .filter((indicator) => !selectedIndicators.includes(indicator))
                                .map((indicator) => (
                                    <li
                                        key={indicator} // React 리스트 렌더링을 위한 고유 key
                                        className="flex justify-between items-center px-2 py-1 hover:bg-gray-100 rounded"
                                    >
                                        {/* 지표명 클릭 시 상세 설명 표시를 위해 `selectedIndicator` 상태 업데이트 */}
                                        <span
                                            className="cursor-pointer"
                                            onClick={() => setSelectedIndicator(indicator)}
                                        >
                                            ▸ {indicator}
                                        </span>
                                        {/* 지표를 선택된 목록으로 추가하는 버튼 */}
                                        <button
                                            onClick={() => handleSelect(indicator)}
                                            className="text-blue-500 hover:text-blue-700"
                                        >
                                            <ArrowRight className="w-4 h-4" /> {/* 오른쪽 화살표 아이콘 */}
                                        </button>
                                    </li>
                                ))}
                        </ul>
                    </div>

                    {/* 선택된 지표 목록 */}
                    <div className="w-1/2 text-sm">
                        <p className="font-medium mb-1">
                            ✅ 내가 선택한 지표{" "}
                            {/* 현재 선택된 지표 개수와 최대 선택 가능 개수 표시 */}
                            <span className="text-xs text-gray-500">({selectedIndicators.length} / 4)</span>
                        </p>
                        {/* 스크롤 가능한 지표 목록 컨테이너 */}
                        <ul className="space-y-1 border p-2 h-48 overflow-y-auto rounded">
                            {/* 선택된 지표 목록을 순회하며 렌더링합니다. */}
                            {selectedIndicators.map((indicator, idx) => (
                                <li
                                    key={indicator} // React 리스트 렌더링을 위한 고유 key
                                    className="flex justify-between items-center px-2 py-1 hover:bg-gray-100 rounded"
                                >
                                    {/* 순번과 지표명 표시 */}
                                    <span
                                        className="cursor-pointer"
                                        onClick={() => setSelectedIndicator(indicator)}
                                    >
                                        {idx + 1}. {indicator}
                                    </span>
                                    {/* 선택된 지표를 제거하는 버튼 */}
                                    <button
                                        className="text-red-500 ml-2"
                                        onClick={() => handleRemove(indicator)}
                                    >
                                        <X className="w-4 h-4" /> {/* X 아이콘 */}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* 지표 상세 설명 섹션 */}
                <div className="mt-6 pt-4 text-sm text-gray-700 min-h-[90px]">
                    <p className="font-semibold mb-1">📘 지표 상세 설명</p>
                    {/* `selectedIndicator` 상태에 따라 설명 내용을 조건부 렌더링합니다. */}
                    {selectedIndicator ? (
                        <>
                            <p>
                                <strong>지표명:</strong> {selectedIndicator}
                            </p>
                            <p>
                                <strong>설명:</strong> {indicatorDescriptions[selectedIndicator]}
                            </p>
                            {/* (예시) 추천 시각화 정보 추가 */}
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

                {/* 하단 버튼 및 안내 메시지 섹션 */}
                <div className="flex justify-between items-center mt-6">
                    {/* 안내 메시지 */}
                    <p className="text-xs text-red-500">
                        ※ 지표는 반드시 4개 선택해야 저장할 수 있습니다.
                    </p>
                    {/* 버튼 그룹 (취소, 저장하고 닫기) */}
                    <div className="space-x-2">
                        {/* 취소 버튼 */}
                        <button
                            className="px-4 py-1 text-gray-600 bg-red-50 hover:bg-red-100 rounded"
                            onClick={handleClose}
                        >
                            취소
                        </button>
                        {/* 저장하고 닫기 버튼 */}
                        <button
                            // 선택된 지표 개수가 4개가 아니면 버튼을 비활성화합니다.
                            disabled={selectedIndicators.length !== 4}
                            // 버튼 활성화/비활성화 상태에 따라 배경색을 변경합니다.
                            className={`px-4 py-1 rounded text-gray-600 ${
                                selectedIndicators.length === 4
                                    ? "bg-blue-100 hover:bg-blue-200"
                                    : "bg-gray-200"
                            }`}
                            onClick={handleSave}
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