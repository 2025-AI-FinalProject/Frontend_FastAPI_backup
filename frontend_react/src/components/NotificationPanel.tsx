import React, { useEffect, useState, useRef } from "react";
import { useAppStore } from "../context/useAppStore"; // 전역 상태 관리를 위한 zustand 스토어 임포트
import { Send, Trash2 } from 'lucide-react'; // 아이콘 임포트

// 채팅 메시지의 타입을 정의하는 인터페이스
interface ChatMessage {
    id: number; // 메시지 고유 ID
    text: string; // 메시지 내용
    sender: "user" | "bot"; // 메시지 발신자 ("user" 또는 "bot")
}

// NotificationPanel React 컴포넌트 정의
const NotificationPanel: React.FC = () => {
    // useAppStore 훅을 사용하여 전역 상태(알림 패널 열림 여부)를 가져옴
    const isNotificationOpen = useAppStore((s) => s.isNotificationOpen);
    // useAppStore 훅을 사용하여 모든 알림을 읽음으로 표시하는 함수를 가져옴
    const markAllAsRead = useAppStore((s) => s.markAllAsRead);

    // 채팅 메시지 목록을 관리하는 상태. 초기 메시지들을 포함.
    const [messages, setMessages] = useState<ChatMessage[]>([
        { id: 1, text: "최근 발생한 네트워크 이상 징후에 대한 LLM 요약본을 제공하고 있습니다.", sender: "bot" },
        { id: 1, text: "어떤 내용부터 확인하시겠어요?", sender: "bot" },
    ]);
    // 사용자가 입력 필드에 작성 중인 메시지를 관리하는 상태
    const [inputMessage, setInputMessage] = useState<string>("");
    // 대화 내역 삭제 확인 메시지 표시 여부를 관리하는 상태
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState<boolean>(false);

    // 메시지 목록의 스크롤을 가장 아래로 이동시키기 위한 ref
    const messagesEndRef = useRef<HTMLDivElement>(null);

    /**
     * isNotificationOpen 상태가 변경될 때마다 실행되는 useEffect 훅.
     * 알림 패널이 열리면 (isNotificationOpen이 true일 때) 모든 알림을 읽음으로 표시합니다.
    */
    useEffect(() => {
        if (isNotificationOpen) {
            markAllAsRead();
        }
    }, [isNotificationOpen, markAllAsRead]); // 의존성 배열: isNotificationOpen 또는 markAllAsRead가 변경될 때 재실행

    /**
     * messages 상태가 변경될 때마다 실행되는 useEffect 훅.
     * 새로운 메시지가 추가되면 메시지 목록의 스크롤을 가장 아래로 이동시켜 최신 메시지가 보이도록 합니다.
    */
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); // 부드러운 스크롤 적용
    }, [messages]); // 의존성 배열: messages가 변경될 때 재실행

    /**
     * 메시지 전송 버튼 클릭 또는 Enter 키 입력 시 호출되는 핸들러.
     * 사용자가 입력한 메시지를 메시지 목록에 추가하고, 봇의 응답을 시뮬레이션하여 추가합니다.
    */
    const handleSendMessage = () => {
        // 입력된 메시지가 비어있거나 공백만 있는 경우 전송하지 않음
        if (inputMessage.trim() === "") return;
        // 삭제 확인 메시지가 표시된 상태에서는 메시지 전송을 막음
        if (showDeleteConfirmation) {
            return;
        }

        // 새로운 사용자 메시지 객체 생성
        const newMessage: ChatMessage = {
            id: messages.length + 1, // 현재 메시지 개수 + 1로 ID 할당 (간단한 예시)
            text: inputMessage,
            sender: "user",
        };
        // 기존 메시지 목록에 새 메시지를 추가하여 상태 업데이트
        setMessages((prevMessages) => [...prevMessages, newMessage]);
        // 입력 필드 초기화
        setInputMessage("");

        // 0.5초 후에 봇 응답을 시뮬레이션하여 메시지 목록에 추가
        setTimeout(() => {
            const botResponse: ChatMessage = {
                id: messages.length + 2, // 현재 메시지 개수 + 2로 ID 할당 (간단한 예시)
                text: `(봇 응답): "${newMessage.text}"에 대한 답변을 준비 중입니다.`,
                sender: "bot",
            };
            setMessages((prevMessages) => [...prevMessages, botResponse]);
        }, 500);
    };

    /**
     * 대화 내역 삭제 요청 시 호출되는 핸들러.
     * 바로 삭제하지 않고 삭제 확인 메시지 UI를 표시하도록 상태를 변경합니다.
    */
    const handleDeleteChatHistoryRequest = () => {
        setShowDeleteConfirmation(true); // 삭제 확인 메시지를 표시하도록 상태 업데이트
    };

    /**
     * 대화 내역 삭제를 최종적으로 확인했을 때 호출되는 핸들러.
     * 메시지 배열을 초기화하여 모든 대화 내역을 삭제합니다.
    */
    const confirmDeleteChatHistory = () => {
        // 우선 메시지 초기화
        setMessages([]);
        setShowDeleteConfirmation(false);

        // 1초 후 첫 메시지 출력
        setTimeout(() => {
            setMessages([
                {
                    id: 1,
                    text: "최근 발생한 네트워크 이상 징후에 대한 LLM 요약본을 제공하고 있습니다.",
                    sender: "bot",
                },
            ]);
        }, 1000);

        // 1.5초 후 두 번째 메시지 추가 출력
        setTimeout(() => {
            setMessages((prev) => [
                ...prev,
                {
                    id: 1,
                    text: "어떤 내용부터 확인하시겠어요?",
                    sender: "bot",
                },
            ]);
        }, 1500);
    };


    /**
     * 대화 내역 삭제를 취소했을 때 호출되는 핸들러.
     * 삭제 확인 메시지 UI를 숨깁니다.
    */
    const cancelDeleteChatHistory = () => {
        setShowDeleteConfirmation(false); // 삭제 확인 메시지 숨김
    };

    /**
     * 메시지 입력 필드에서 키보드 이벤트 발생 시 호출되는 핸들러.
     * Enter 키가 눌렸을 때 메시지 전송 함수를 호출합니다.
    */
    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            handleSendMessage();
        }
    };

    // 컴포넌트 렌더링 부분
    return (
        // 전체 알림 패널 컨테이너
        <aside className="w-[300px] h-screen bg-white shadow-sm flex flex-col">
            {/* 알림 패널 헤더 */}
            <div className="h-16 flex items-center justify-center font-semibold shadow-sm flex-shrink-0">
                Notifications
            </div>

            {/* 메인 콘텐츠 영역 (상단 알림, LLM 요약본, 메시지 채팅) */}
            <div className="flex-1 flex flex-col overflow-hidden">

                {/* LLM 요약본 (채팅) 영역 */}
                <div className="mt-2 flex-1 flex flex-col min-h-0">
                    {/* LLM 요약본 제목과 대화 내역 삭제 버튼 */}
                    <div className="flex items-center justify-between mb-1 px-4">
                        <h3 className="mt-2 font-semibold text-sm">LLM 요약본</h3>
                        <button
                            onClick={handleDeleteChatHistoryRequest} // 클릭 시 삭제 확인 UI 표시 요청
                            className="text-gray-500 hover:text-red-400 p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-red-300 focus:"
                            aria-label="대화 내역 삭제"
                        >
                            <Trash2 size={16} /> {/* 휴지통 아이콘 */}
                        </button>
                    </div>

                    {/* 채팅 메시지 목록 영역 */}
                    <div className="flex-1 overflow-y-auto px-4 pb-2 mt-2">
                        <div className="space-y-3">
                            {/* messages 배열을 순회하며 각 메시지를 렌더링 */}
                            {messages.map((msg) => (
                                <div
                                    key={msg.id} // 고유 key prop
                                    // 발신자에 따라 메시지 정렬 (사용자: 오른쪽, 봇: 왼쪽)
                                    className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                                >
                                    <div
                                        className={`p-2 rounded-lg text-xs max-w-[80%] break-words ${
                                            // 발신자에 따라 배경색 및 텍스트 색상 변경
                                            msg.sender === "user"
                                                ? "bg-gray-200"
                                                : "bg-gray-500 text-white"
                                        }`}
                                    >
                                        {msg.text} {/* 메시지 내용 */}
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} /> {/* 스크롤을 맨 아래로 이동시키기 위한 빈 div */}
                        </div>

                        {/* 삭제 확인 메시지 UI 조건부 렌더링 */}
                        {showDeleteConfirmation && (
                            <div className="flex justify-center mt-4">
                                <div className="bg-gray-100 p-4 rounded-lg shadow-md text-center max-w-[90%]">
                                    <p className="mb-3 text-xs text-gray-700 font-medium">
										모든 대화 내역을 <br/>삭제하시겠습니까?
									</p>
                                    <p className="mb-3 text-xs text-gray-700 font-medium">대화 내역은 저장되지 않습니다.</p>
                                    <div className="flex justify-center gap-2">
                                        <button
                                            onClick={confirmDeleteChatHistory} // 삭제 확정 버튼
                                            className="bg-red-300 text-gray-800 px-3 py-1 rounded-md text-xs hover:bg-red-400"
                                        >
                                            네! <br/> 삭제합니다.
                                        </button>
                                        <button
                                            onClick={cancelDeleteChatHistory} // 삭제 취소 버튼
                                            className="bg-gray-300 text-gray-800 px-3 py-1 rounded-md text-xs hover:bg-gray-400"
                                        >
                                            아니요! <br/>취소합니다.
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* 메시지 입력 및 전송 구역 */}
                    <div className="mt-auto p-4 flex text-sm items-center gap-2 flex-shrink-0 bg-white">
                        <input
                            type="text"
                            placeholder="메시지를 입력하세요"
                            className="flex-1 p-2 text-sm rounded-lg focus:outline-none bg-gray-100"
                            value={inputMessage} // 입력 필드 값은 inputMessage 상태와 바인딩
                            onChange={(e) => setInputMessage(e.target.value)} // 입력 값 변경 시 상태 업데이트
                            onKeyPress={handleKeyPress} // Enter 키 입력 감지
                            disabled={showDeleteConfirmation} // 삭제 확인 메시지 표시 중에는 입력 필드 비활성화
                        />
                        <button
                            onClick={handleSendMessage} // 메시지 전송 버튼
                            className="bg-gray-200 text-white p-2 rounded-lg hover:bg-gray-300 flex items-center justify-center"
                            aria-label="메시지 전송"
                            disabled={showDeleteConfirmation} // 삭제 확인 메시지 표시 중에는 버튼 비활성화
                        >
                            <Send size={16} color="gray"/> {/* 전송 아이콘 */}
                        </button>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default NotificationPanel; // 컴포넌트 내보내기