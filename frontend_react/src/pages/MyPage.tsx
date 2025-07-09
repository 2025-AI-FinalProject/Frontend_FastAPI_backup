import React, { useState, useEffect, useRef } from "react";
import { useAppStore } from "../context/useAppStore";
import { KeyRound, PhoneCall, AlertTriangle, Clock3, Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";

import PasswordChange from "../components/PasswordChange";
import MembershipWithdrawal from "../components/MembershipWithdrawal";

import toast from "react-hot-toast";

const MyPage: React.FC = () => {
    const user = useAppStore((state) => state.user);
    const [selectedMenu, setSelectedMenu] = useState("password");

    // ✅ 비밀번호 확인 관련 상태
    const [isVerified, setIsVerified] = useState(false);
    const [password, setPassword] = useState("");
    const [showPw, setShowPw] = useState(false);
    const [isError, setIsError] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();
    const modalRef = useRef<HTMLDivElement>(null);

    // 바깥 클릭 시 메인화면 이동
    const handleClickOutside = (e: MouseEvent) => {
        if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
            navigate("/");
        }
    };

    useEffect(() => {
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // 비밀번호 확인 모달용 입력 컴포넌트
    const PasswordInputModal: React.FC<{
        label: string;
        value: string;
        setValue: (val: string) => void;
        show: boolean;
        onToggleShow: () => void;
        isError?: boolean;
        isLoading?: boolean;
        onSubmit: () => void;
    }> = ({ label, value, setValue, show, onToggleShow, isError, isLoading, onSubmit }) => {
        return (
            <div
                ref={modalRef}
                className="bg-white rounded-xl shadow-xl p-8 w-full max-w-md"
                onClick={(e) => e.stopPropagation()} // 모달 내부 클릭 시 상위 이벤트 전파 방지
            >
                <form
                    onSubmit={(e) => {
                        e.preventDefault(); // 기본 제출 방지
                        onSubmit(); // 커스텀 확인 함수 호출
                    }}
                >
                    <h2 className="text-xl font-semibold text-gray-900 mb-3 text-center">
                        비밀번호 확인
                    </h2>
                    <p className="text-gray-600 mb-6 text-center text-sm">
                        마이페이지에 접근하려면 비밀번호를 입력해주세요.
                    </p>

                    <label htmlFor="password-input" className="block text-gray-700 font-medium mb-2">
                        {label}
                    </label>
                    <div className="relative">
                        <input
                            id="password-input"
                            type={show ? "text" : "password"}
                            className={`w-full border rounded-md px-4 py-2 pr-10 focus:outline-none focus:ring-1 ${
                                isError ? "border-red-500 focus:ring-red-400" : "border-gray-300 focus:ring-blue-300"
                            }`}
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            autoComplete="current-password"
                            spellCheck={false}
                            autoFocus
                        />
                        <button
                            type="button"
                            onClick={onToggleShow}
                            className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                            aria-label={show ? "비밀번호 숨기기" : "비밀번호 보기"}
                        >
                            {show ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>
                    {isError && (
                        <p className="mt-2 text-sm text-red-600">비밀번호가 올바르지 않습니다.</p>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="mt-6 w-full px-4 py-2 rounded-lg transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed bg-blue-100 text-gray-600 hover:bg-blue-200"
                    >
                        {isLoading ? "확인 중..." : "비밀번호 확인"}
                    </button>
                </form>
            </div>
        );
    };

    // 비밀번호 확인 요청 함수
    const handlePasswordCheck = async () => {
        if (!password) {
            toast.error("비밀번호를 입력해주세요.");
            return;
        }

        setIsLoading(true);    // 요청 시작, 버튼 로딩 상태 활성화
        setIsError(false);     // 이전 에러 초기화

        try {
            const token = localStorage.getItem("accessToken");
            if (!token) {
                toast.error("로그인 정보가 없습니다. 다시 로그인해주세요.");
                setIsLoading(false);
                return;
            }

            const res = await fetch("http://localhost:8000/auth/verify-password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ password }),
            });

            if (res.ok) {
                toast.success("비밀번호 확인 완료");
                setIsVerified(true);   // 인증 성공 상태로 전환
                // 입력창 초기화는 모달 닫히면서 자연스럽게 처리되므로 삭제
                setIsError(false);
            } else {
                const err = await res.json();
                toast.error(err.detail || "비밀번호가 일치하지 않습니다.");
                setIsError(true);    // 에러 상태 활성화하여 UI 반영
            }
        } catch (e) {
            toast.error("서버 연결 중 오류가 발생했습니다.");
        } finally {
            setIsLoading(false);     // 요청 종료, 버튼 활성화
        }
    };

    // 날짜 차이 계산 함수
    const getDaysSince = (dateStr?: string): number | null => {
        if (!dateStr) return null;
        const lastChanged = new Date(dateStr);
        const now = new Date();
        const diff = Math.floor((+now - +lastChanged) / (1000 * 60 * 60 * 24));
        return diff;
    };

    const daysSincePwChange = getDaysSince(user?.lastPasswordChange);

    // ✅ 비밀번호 확인 단계 - 모달 표시
    if (!isVerified) {
        return (
            <div className="fixed inset-0 bg-gray-50 flex items-center justify-center z-50 p-6">
                <PasswordInputModal
                    label="비밀번호"
                    value={password}
                    setValue={setPassword}
                    show={showPw}
                    onToggleShow={() => setShowPw((v) => !v)}
                    isError={isError}
                    isLoading={isLoading}
                    onSubmit={handlePasswordCheck}
                />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="p-6 text-center text-gray-500">로그인이 필요합니다.</div>
        );
    }

    return (
        <div className="p-7 max-w-7xl mx-auto space-y-6">
            {/* 상단 유저 정보 카드 - 4등분 레이아웃 */}
            <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6 grid grid-cols-1 sm:grid-cols-4 gap-6">
                {/* 1번 칸: 유저 이미지 + 함께한 날짜 */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:justify-start">
                    <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center text-gray-600 text-2xl font-bold shadow-inner">
                        {user.name?.charAt(0) ?? "U"}
                    </div>
                    <div className="text-sm text-gray-700 text-center sm:text-left">
                        <div className="font-semibold text-gray-900">{user.name}님 과</div>
                        <div>
                            함께한 지 <span className="text-gray-600 font-medium">228일째</span> 입니다
                        </div>
                    </div>
                </div>

                {/* 2번 칸: 사번, 이메일, 휴대폰 */}
                <div className="text-sm text-gray-700 space-y-1 flex flex-col justify-center items-center sm:items-start">
                    <div>
                        <span className="font-medium text-gray-600">사번 : </span>
                        {user.emp_number ?? "없음"}
                    </div>
                    <div>
                        <span className="font-medium text-gray-600">이메일 : </span>
                        {user.email ?? "없음"}
                    </div>
                    <div>
                        <span className="font-medium text-gray-600">휴대폰 : </span>
                        {user.phone ? user.phone.replace(/(\d{3})\d{4}(\d{2})/, "$1-****-$2") : "없음"}
                    </div>
                </div>

                {/* 3번 칸: 비밀번호 변경 알림 */}
                <div className="bg-blue-50 border border-blue-300 rounded-md p-4 text-gray-600 text-xs flex flex-col justify-center">
                    {daysSincePwChange === null ? (
                        <>
                            <div className="font-semibold mb-1">비밀번호 변경 기록 없음</div>
                            <div>처음 로그인 이후 비밀번호를 변경한 기록이 없습니다.</div>
                        </>
                    ) : daysSincePwChange >= 90 ? (
                        <>
                            <div className="font-semibold mb-1">비밀번호 변경 필요</div>
                            <div>
                                최근 비밀번호 변경이 {daysSincePwChange}일 전입니다. <br />
                                보안을 위해 변경해주세요.
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="font-semibold mb-1">최근 비밀번호 변경</div>
                            <div>{daysSincePwChange}일 전에 비밀번호를 변경하셨습니다.</div>
                        </>
                    )}
                </div>

                {/* 4번 칸: 업무 관련 간단 알림 */}
                <div className="bg-yellow-50 border border-yellow-300 rounded-md p-4 text-gray-600 text-xs flex flex-col justify-center">
                    <div className="font-semibold mb-1">업무 알림</div>
                    <div>
                        다음 휴가일이 <span className="font-semibold">10일</span> 남았습니다.<br />
                        다음 결재 대기 문서가 있습니다.<br />
                        월간 업무 보고서 제출을 잊지 마세요.
                    </div>
                </div>
            </div>

            {/* 중단 - 메뉴 + 컨텐츠 */}
            <div className="grid grid-cols-1 sm:grid-cols-[240px_1fr] gap-6">
                {/* 왼쪽 메뉴 */}
                <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-4 min-h-[360px]">
                    <h3 className="text-base font-semibold text-gray-900 mb-4">마이페이지 메뉴</h3>
                    <ul className="space-y-2">
                        <li>
                            <button
                                className={`flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm transition ${
                                    selectedMenu === "password"
                                        ? "bg-blue-100 text-gray-600 font-medium"
                                        : "hover:bg-gray-100 text-gray-700"
                                }`}
                                onClick={() => setSelectedMenu("password")}
                            >
                                <KeyRound size={16} /> 비밀번호 변경
                            </button>
                        </li>
                        <li>
                            <button
                                className={`flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm transition ${
                                    selectedMenu === "emergency"
                                        ? "bg-blue-100 text-gray-600 font-medium"
                                        : "hover:bg-gray-100 text-gray-700"
                                }`}
                                onClick={() => setSelectedMenu("emergency")}
                            >
                                <PhoneCall size={16} /> 비상연락망
                            </button>
                        </li>
                        <li className="pt-2 border-t mt-2">
                            <button
                                className={`flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm transition ${
                                    selectedMenu === "withdraw"
                                        ? "bg-red-100 text-red-600 font-medium"
                                        : "text-red-600 hover:bg-red-50"
                                }`}
                                onClick={() => setSelectedMenu("withdraw")}
                            >
                                <AlertTriangle size={16} /> 회원 탈퇴
                            </button>
                        </li>
                    </ul>
                </div>

                {/* 오른쪽 컨텐츠 */}
                <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6 h-[360px] overflow-y-auto">
                    {selectedMenu === "password" && <PasswordChange />}

                    {selectedMenu === "emergency" && (
                        <>
                            <h4 className="text-base font-semibold mb-2 text-gray-900">비상연락망</h4>
                            <p className="text-sm text-gray-600">비상 시 연락받을 정보를 설정하세요.</p>
                        </>
                    )}

                    {selectedMenu === "withdraw" && (
                        <MembershipWithdrawal
                            onConfirm={() => {
                                toast.success("회원 탈퇴가 완료되었습니다.");
                                // TODO: 실제 탈퇴 처리 API 호출 등 구현
                            }}
                        />
                    )}
                </div>
            </div>

            {/* 하단 - 최근 활동 기록 */}
            <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-200">
                <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Clock3 size={18} className="text-blue-500" /> 최근 활동 기록
                </h3>
                <ul className="text-sm text-gray-600 space-y-2 list-disc list-inside">
                    <li>최근 비밀번호 변경: {user.lastPasswordChange ?? "기록 없음"}</li>
                    <li>최근 로그인: {user.lastLogin ?? "기록 없음"}</li>
                    <li>비상연락망 정보 수정: {user.lastEmergencyContactUpdate ?? "기록 없음"}</li>
                </ul>
            </div>
        </div>
    );
};

export default MyPage;
