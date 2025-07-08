import React from "react";
import { X } from "lucide-react";

interface LogFeedModalProps {
  isOpen: boolean;
  onClose: () => void;
  logFeedData: {
    time: string;
    status: string;
    result: string;
    ip: string;
    process: string;
    host: string;
  }[];
}

// 날짜 포맷팅 함수: yyyy.mm.dd HH.MM.SS
const formatDateTime = (dateStr: string) => {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const HH = String(date.getHours()).padStart(2, "0");
  const MM = String(date.getMinutes()).padStart(2, "0");
  const SS = String(date.getSeconds()).padStart(2, "0");
  return `${yyyy}.${mm}.${dd} ${HH}.${MM}.${SS}`;
};

const LogFeedModal: React.FC<LogFeedModalProps> = ({ isOpen, onClose, logFeedData }) => {
  if (!isOpen) return null;

  return (
    <>
      {/* 모달 전체 컨테이너: 배경 + 모달 */}
      <div
        className="fixed inset-0 z-[9999] flex items-center justify-center p-8 bg-black/40 backdrop-blur-sm"
        onClick={onClose} // ✅ 모달 외부 클릭 시 닫기
      >
        {/* 모달 박스 */}
        <div
          role="dialog"
          aria-modal="true"
          className="relative w-full max-w-5xl max-h-[80vh] bg-white rounded-t-xl rounded-b-xl shadow-lg flex flex-col"
          tabIndex={-1}
          onClick={(e) => e.stopPropagation()} // ✅ 내부 클릭 시 닫힘 방지
        >
          {/* 헤더 */}
          <header className="sticky top-0 z-20 bg-white flex justify-between items-center border-b border-gray-200 px-6 py-4 rounded-t-xl">
            <h2 className="text-lg font-semibold flex-1 text-center">실시간 로그 피드 전체 보기</h2>
            <button
              onClick={onClose}
              aria-label="닫기"
              className="p-1 rounded hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600"
            >
              <X className="w-5 h-5" />
            </button>
          </header>

          {/* 테이블 헤더 */}
          <div className="grid grid-cols-6 gap-4 px-6 py-3 font-semibold border-b border-gray-200 sticky top-[56px] bg-white z-10 text-sm">
            <div className="ml-10">수집 시각</div>
            <div>상태</div>
            <div>위협 결과</div>
            <div className="ml-6">발생 IP</div>
            <div className="ml-1">프로세스명</div>
            <div className="ml-1">호스트명</div>
          </div>

          {/* 데이터 리스트: 내부에 스크롤 */}
          <div className="overflow-auto flex-1 px-6 py-3 text-sm text-gray-700">
            {logFeedData.map((item, index) => (
              <div
                key={index}
                className={`grid grid-cols-6 gap-4 py-2 border-b border-gray-100 cursor-default
                  ${item.status === "위협" ? "text-red-600 font-semibold" : "text-gray-600"}`}
                title={`${item.time} / ${item.status} / ${item.result} / ${item.ip} / ${item.process} / ${item.host}`}
              >
                <div>{formatDateTime(item.time)}</div>
                <div>{item.status}</div>
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
