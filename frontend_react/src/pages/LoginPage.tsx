import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react";
import { images } from "../assets/assets";
import { useNavigate, useLocation } from "react-router-dom";
import { useAppStore } from "../context/useAppStore";

const LoginPage: React.FC = () => {
    // 🔐 로그인 관련 상태
    const [employeeId, setEmployeeId] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [saveId, setSaveId] = useState(false);
    const [keepLoggedIn, setKeepLoggedIn] = useState(false);
    const [error, setError] = useState("");

    // 🔄 라우터 관련 훅
    const navigate = useNavigate();
    const location = useLocation(); // ✅ 현재 경로 정보를 얻기 위해 사용

    // 🔧 전역 상태(store)
    const login = useAppStore((state) => state.login);
    const hasHydrated = useAppStore((state) => state.hasHydrated);
    const isLoggedIn = useAppStore((state) => state.isLoggedIn);

    // ✅ 로그인 상태가 true이고 현재 경로가 '/'가 아니라면 메인 페이지로 리다이렉트
    useEffect(() => {
        if (isLoggedIn && location.pathname !== '/') {
            navigate("/");
        }
    }, [isLoggedIn, navigate, location]);

    // ✅ 로그인 페이지 진입 시 localStorage 정보 복원
    useEffect(() => {
        if (hasHydrated) {
            const savedId = localStorage.getItem("savedEmployeeId");
            if (savedId) {
                setEmployeeId(savedId);
                setSaveId(true);
            }
            const savedKeepLoggedIn = localStorage.getItem("keepLoggedIn");
            if (savedKeepLoggedIn === "true") {
                setKeepLoggedIn(true);
            }
        }
    }, [hasHydrated]);

    // ✅ 로그인 시도 함수
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        // 필수 입력 체크
        if (!employeeId || password.length < 6) {
            const message = "사원번호와 6자리 이상의 비밀번호를 입력해주세요.";
            setError(message);
            toast.error(message);
            return;
        }

        // 로그인 진행 중 토스트 표시
        const loadingToastId = toast.loading("로그인 중입니다...");

        try {
            // 🔐 로그인 API 호출
            const response = await fetch("http://localhost:8000/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    emp_number: employeeId,
                    password: password,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                let errorMessage = "로그인 실패";
                if (Array.isArray(errorData.detail)) {
                    errorMessage = errorData.detail.map((e: any) => e.msg).join(", ");
                } else if (typeof errorData.detail === "string") {
                    errorMessage = errorData.detail;
                }

                setError(errorMessage);
                toast.error(errorMessage, { id: loadingToastId });
                return;
            }

            const data = await response.json();
            localStorage.setItem("accessToken", data.access_token);

            // 🔎 사용자 정보 요청
            const userRes = await fetch("http://localhost:8000/auth/mypage", {
                headers: {
                    Authorization: `Bearer ${data.access_token}`,
                },
            });

            if (!userRes.ok) {
                const msg = "사용자 정보를 불러오지 못했습니다.";
                setError(msg);
                toast.error(msg, { id: loadingToastId });
                return;
            }

            const userData = await userRes.json();
            console.log("마이페이지에서 받아온 사용자 데이터:", userData);

            // 전역 로그인 상태 저장
            login({
                emp_number: userData.emp_number,
                name: userData.name,
                email: userData.email,
                phone: userData.phone,
            });

            // 설정 정보 저장
            localStorage.setItem("keepLoggedIn", String(keepLoggedIn));
            if (saveId) {
                localStorage.setItem("savedEmployeeId", employeeId);
            } else {
                localStorage.removeItem("savedEmployeeId");
            }

            toast.success("로그인 성공!", {
                id: loadingToastId
            });

            // 메인 페이지로 이동
            navigate("/");

        } catch (error) {
            console.error("로그인 처리 중 오류 발생:", error);
            toast.error("서버와 통신 중 오류가 발생했습니다.", { id: loadingToastId });
            setError("서버와 통신 중 오류가 발생했습니다.");
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
            <div className="flex flex-col md:flex-row w-full max-w-[1300px] md:h-[880px] bg-white rounded-2xl overflow-hidden">
                {/* 왼쪽 이미지 영역 */}
                <div className="w-full md:w-1/2 flex items-center justify-center">
                    <div className="w-[80%] aspect-[16/9] md:h-[80%] rounded-2xl overflow-hidden shadow">
                        <img
                            src={images.main}
                            alt="Main visual"
                            className="w-full h-full object-cover"
                        />
                    </div>
                </div>

                {/* 오른쪽 로그인 폼 */}
                <div className="w-full md:w-1/2 flex items-center justify-center p-8">
                    <div className="w-full max-w-sm">
                        <h1 className="text-3xl font-semibold text-gray-900 text-center mb-2">
                            👋 Welcome Back 👋
                        </h1>
                        <p className="text-center text-gray-500 mb-6 text-sm">
                            오늘도 좋은 하루입니다.
                            <br />
                            네트워크 보안 관리를 시작하세요!
                        </p>

                        <form onSubmit={handleLogin} className="space-y-4">
                            {/* 사원번호 입력 */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    사원번호
                                </label>
                                <input
                                    type="text"
                                    value={employeeId}
                                    onChange={(e) => setEmployeeId(e.target.value)}
                                    placeholder="사원번호 6자리"
                                    className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-gray-500 text-sm"
                                    required
                                />
                            </div>

                            {/* 비밀번호 입력 */}
                            <div className="relative">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    비밀번호
                                </label>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="비밀번호 6자리 이상"
                                    className="w-full border border-gray-300 rounded-lg p-3 pr-10 focus:outline-none focus:ring-2 focus:ring-gray-500 text-sm"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-9.5 text-gray-400"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>

                            {/* 토글 스위치들 */}
                            <div className="flex justify-between items-center">
                                <div className="flex items-center">
                                    <button
                                        type="button"
                                        onClick={() => setSaveId(!saveId)}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                            saveId ? "bg-gray-500" : "bg-gray-300"
                                        }`}
                                    >
                                        <span
                                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                                saveId ? "translate-x-6" : "translate-x-1"
                                            }`}
                                        />
                                    </button>
                                    <span className="ml-2 text-sm text-gray-700">아이디 저장</span>
                                </div>

                                <div className="flex items-center">
                                    <button
                                        type="button"
                                        onClick={() => setKeepLoggedIn(!keepLoggedIn)}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                            keepLoggedIn ? "bg-gray-500" : "bg-gray-300"
                                        }`}
                                    >
                                        <span
                                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                                keepLoggedIn ? "translate-x-6" : "translate-x-1"
                                            }`}
                                        />
                                    </button>
                                    <span className="ml-2 text-sm text-gray-700">로그인 유지</span>
                                </div>
                            </div>

                            {/* 에러 메시지 */}
                            {error && <div className="text-sm text-red-500">{error}</div>}

                            {/* 비밀번호 찾기 링크 */}
                            <div className="text-right text-sm">
                                <a href="#" className="text-gray-500 hover:underline">
                                    비밀번호를 잊으셨나요?
                                </a>
                            </div>

                            {/* 로그인 버튼 */}
                            <button
                                type="submit"
                                className="w-full bg-gray-500 py-3 rounded-lg font-medium hover:bg-gray-700 transition text-white text-sm"
                            >
                                로그인
                            </button>
                        </form>

                        {/* 회원가입 링크 */}
                        <p className="mt-6 text-center text-sm text-gray-500">
                            계정이 없으신가요?{" "}
                            <a href="/signup" className="text-[#4A4A4A] hover:underline">
                                회원가입
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
