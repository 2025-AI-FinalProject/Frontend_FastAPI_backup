import React from "react";
import { X } from "lucide-react"; // X 아이콘 (닫기)을 Lucide React에서 가져옵니다.

// --- LogFeedModal 컴포넌트의 props 인터페이스 정의 ---
interface LogFeedModalProps {
    // 모달의 열림/닫힘 상태를 제어합니다. (true: 열림, false: 닫힘)
    isOpen: boolean;
    // 모달을 닫을 때 호출될 콜백 함수입니다.
    onClose: () => void;
    // 모달에 표시될 로그 피드 데이터 배열입니다.
    logFeedData: {
        time: string; // 로그 발생 시각
        status: string; // 로그 상태 (예: "정상", "위협")
        result: string; // 위협 결과 또는 상세 내용
        ip: string; // 발생 IP 주소
        process: string; // 관련 프로세스명
        host: string; // 발생 호스트명
    }[];
}

// --- 날짜 및 시간 포맷팅 유틸리티 함수 ---
// 주어진 날짜 문자열을 "yyyy.mm.dd HH.MM.SS" 형식으로 변환합니다.
const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    // 유효하지 않은 날짜인 경우 원본 문자열을 반환합니다.
    if (isNaN(date.getTime())) return dateStr;

    // 연, 월, 일, 시, 분, 초를 추출하고 두 자리 숫자로 패딩합니다.
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0"); // 월은 0부터 시작하므로 1을 더합니다.
    const dd = String(date.getDate()).padStart(2, "0");
    const HH = String(date.getHours()).padStart(2, "0");
    const MM = String(date.getMinutes()).padStart(2, "0");
    const SS = String(date.getSeconds()).padStart(2, "0");

    // 포맷팅된 문자열을 반환합니다.
    return `${yyyy}.${mm}.${dd} ${HH}.${MM}.${SS}`;
};

// --- LogFeedModal 컴포넌트 정의 ---
// 실시간 로그 피드의 전체 내용을 보여주는 모달 컴포넌트입니다.
const LogFeedModal: React.FC<LogFeedModalProps> = ({ isOpen, onClose, logFeedData }) => {
    // `isOpen` prop이 false일 경우 모달을 렌더링하지 않습니다 (null 반환).
    if (!isOpen) return null;

    // --- 모달 UI 렌더링 ---
    return (
        <>
            {/* 모달 전체 컨테이너: 배경 오버레이 및 모달 박스 포함 */}
            <div
                // fixed: 뷰포트에 고정, inset-0: 전체 화면 차지
                // z-[9999]: 가장 높은 z-index로 다른 요소 위에 표시
                // flex items-center justify-center: 내용을 중앙에 배치
                // p-8: 내부 여백, bg-black/40: 반투명 검은색 배경, backdrop-blur-sm: 뒤 배경 흐림 효과
                className="fixed inset-0 z-[9999] flex items-center justify-center p-8 bg-black/40 backdrop-blur-sm"
                // ✅ 모달 외부를 클릭하면 `onClose` 함수를 호출하여 모달을 닫습니다.
                onClick={onClose}
            >
                {/* 모달 박스 본체 */}
                <div
                    // role="dialog" aria-modal="true": 접근성(스크린 리더)을 위한 역할 및 상태 정의
                    // relative: 자식 요소의 absolute 위치 기준
                    // w-full max-w-5xl max-h-[80vh]: 너비, 최대 너비, 최대 높이 설정 (뷰포트 높이의 80%)
                    // bg-white rounded-t-xl rounded-b-xl shadow-lg: 배경색, 둥근 모서리, 그림자 효과
                    // flex flex-col: flexbox를 사용하여 내부 요소를 세로로 배치
                    // tabIndex={-1}: 키보드 탐색에서 제외하지만, 스크립트로 포커스 가능
                    className="relative w-full max-w-5xl max-h-[80vh] bg-white rounded-t-xl rounded-b-xl shadow-lg flex flex-col"
                    tabIndex={-1}
                    // ✅ 모달 박스 내부를 클릭할 때 이벤트 버블링을 막아 모달이 닫히지 않도록 합니다.
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* 모달 헤더 섹션 */}
                    <header className="sticky top-0 z-20 bg-white flex justify-between items-center border-b border-gray-200 px-6 py-4 rounded-t-xl">
                        {/* 모달 제목 */}
                        <h2 className="text-lg font-semibold flex-1 text-center">실시간 로그 피드 전체 보기</h2>
                        {/* 닫기 버튼 */}
                        <button
                            onClick={onClose} // 버튼 클릭 시 모달 닫기
                            aria-label="닫기" // 접근성을 위한 레이블
                            className="p-1 rounded hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600"
                        >
                            <X className="w-5 h-5" /> {/* 닫기 아이콘 */}
                        </button>
                    </header>

                    {/* 테이블 헤더 섹션 */}
                    {/* sticky: 스크롤 시 상단에 고정, top-[56px]: 헤더 아래에 위치 (상단 헤더의 높이만큼) */}
                    {/* grid grid-cols-6 gap-4: 6개 열의 그리드 레이아웃, 열 간 간격 4 */}
                    <div className="grid grid-cols-6 gap-4 px-6 py-3 font-semibold border-b border-gray-200 sticky top-[56px] bg-white z-10 text-sm">
                        {/* 각 열의 제목. ml- 값은 디자인에 맞춰 조정된 것으로 보입니다. */}
                        <div className="ml-10">수집 시각</div>
                        <div className="ml-13">상태</div>
                        <div className="ml-3">위협 결과</div>
                        <div className="ml-6">발생 IP</div>
                        <div className="ml-1">프로세스명</div>
                        <div className="ml-1">호스트명</div>
                    </div>

                    {/* 데이터 리스트 섹션: 실제 로그 데이터가 표시되는 스크롤 가능한 영역 */}
                    <div className="overflow-auto flex-1 px-6 py-3 text-sm text-gray-700">
                        {/* `logFeedData` 배열을 순회하며 각 로그 항목을 렌더링합니다. */}
                        {logFeedData.map((item, index) => (
                            <div
                                key={index} // 리스트 렌더링을 위한 고유 key (여기서는 index 사용, 실제 앱에서는 고유 ID 권장)
                                // grid grid-cols-6 gap-4: 위 테이블 헤더와 동일한 그리드 레이아웃
                                // py-2 border-b border-gray-100: 상하 패딩, 하단 테두리
                                // cursor-default: 마우스 커서 기본값
                                // ✅ `status`가 "위협"일 경우 텍스트 색상과 굵기를 변경하여 강조합니다.
                                className={`grid grid-cols-6 gap-4 py-2 border-b border-gray-100 cursor-default
                                    ${item.status === "위협" ? "text-red-400 font-semibold" : "text-gray-600"}`}
                                // 전체 내용을 tooltip으로 보여주어 잘린 내용도 확인 가능하게 합니다.
                                title={`${item.time} / ${item.status} / ${item.result} / ${item.ip} / ${item.process} / ${item.host}`}
                            >
                                {/* 각 로그 데이터 필드를 렌더링합니다. */}
                                <div>{formatDateTime(item.time)}</div> {/* 시간은 포매팅 함수 적용 */}
                                <div className="ml-13">{item.status}</div>
                                <div>{item.result}</div>
                                <div>{item.ip}</div>
                                <div>{item.process}</div>
                                <div>{item.host}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
};

export default LogFeedModal;