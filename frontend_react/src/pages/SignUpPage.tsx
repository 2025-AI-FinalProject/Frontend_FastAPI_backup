import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm, type SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast"; // 토스트 알림 라이브러리
import DownloadAuthModal from "../components/DownloadAuthModal"; // 다운로드 인증 모달 컴포넌트
import { Eye, EyeOff } from "lucide-react"; // 비밀번호 보이기/숨기기 아이콘

// --- Zod 스키마 정의 ---
// 회원가입 폼의 유효성 검사를 위한 스키마입니다.
const signUpSchema = z.object({
    // 사번: 최소 4자, 최대 10자
    emp_number: z.string().min(4, "사번은 최소 4자 이상이어야 합니다.").max(10, "사번은 최대 10자 이하여야 합니다."),
    // 비밀번호: 최소 8자, 최대 20자, 영문, 숫자, 특수문자 포함
    password: z
        .string()
        .min(8, "비밀번호는 최소 8자 이상이어야 합니다.")
        .max(20, "비밀번호는 최대 20자 이하여야 합니다.")
        .regex(/[a-zA-Z]/, "비밀번호는 영문을 포함해야 합니다.")
        .regex(/[0-9]/, "비밀번호는 숫자를 포함해야 합니다.")
        .regex(/[^a-zA-Z0-9]/, "비밀번호는 특수문자를 포함해야 합니다."),
    // 비밀번호 확인 필드 (confirmPassword와 password가 일치해야 함)
    confirmPassword: z.string(),
    // 이름: 최소 2자, 최대 20자
    name: z.string().min(2, "이름은 최소 2자 이상이어야 합니다.").max(20, "이름은 최대 20자 이하여야 합니다."),
    // 이메일: 유효한 이메일 형식이며 필수 입력
    email: z.string().email("유효한 이메일 형식이 아닙니다.").min(1, "이메일은 필수 입력 사항입니다."),
    // 전화번호: 필수 입력
    phone: z.string().min(1, "전화번호는 필수 입력 사항입니다."),
}).refine((data) => data.password === data.confirmPassword, {
    // 비밀번호와 비밀번호 확인이 일치하는지 검증
    message: "비밀번호가 일치하지 않습니다.",
    path: ["confirmPassword"], // 오류 메시지가 표시될 필드
});

// Zod 스키마로부터 폼 데이터의 타입을 추론합니다.
type SignUpFormData = z.infer<typeof signUpSchema>;

// --- SignUpPage 컴포넌트 정의 ---
// 회원가입 페이지를 렌더링하고 사용자 입력 및 서버 통신을 처리하는 함수형 컴포넌트입니다.
const SignUpPage: React.FC = () => {
    const navigate = useNavigate(); // 페이지 이동을 위한 훅
    const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false); // 다운로드 인증 모달의 열림/닫힘 상태
    const [showPassword, setShowPassword] = useState(false); // 비밀번호 필드의 텍스트 표시 여부
    const [showConfirmPassword, setShowConfirmPassword] = useState(false); // 비밀번호 확인 필드의 텍스트 표시 여부

    // `react-hook-form`을 사용하여 폼 상태 및 유효성 검사를 관리합니다.
    const {
        register, // input 엘리먼트를 폼에 등록하는 함수
        handleSubmit, // 폼 제출을 처리하는 함수
        formState: { errors }, // 폼 유효성 검사 오류 객체
    } = useForm<SignUpFormData>({
        resolver: zodResolver(signUpSchema), // Zod 스키마를 유효성 검사기로 사용
        defaultValues: { // 폼 필드의 기본값 설정
            emp_number: "",
            password: "",
            confirmPassword: "",
            name: "",
            email: "",
            phone: "",
        },
    });

    /**
     * 폼 제출 시 실행되는 비동기 함수입니다.
     * 사용자 입력 데이터를 서버의 회원가입 API로 전송하고 결과를 처리합니다.
     * @param data 폼에서 입력된 데이터 (SignUpFormData 타입)
     */
    const onSubmit: SubmitHandler<SignUpFormData> = async (data) => {
        // `confirmPassword` 필드는 서버로 보낼 필요 없으므로 분리합니다.
        const { confirmPassword, ...signUpData } = data;

        console.log("Client: Data to be sent:", signUpData);
        console.log("Client: JSON string:", JSON.stringify(signUpData));

        try {
            // 서버의 회원가입 API에 POST 요청을 보냅니다.
            const response = await fetch("http://localhost:8000/auth/signup", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json", // JSON 형식으로 데이터 전송
                },
                body: JSON.stringify(signUpData), // JavaScript 객체를 JSON 문자열로 변환하여 전송
            });

            // 응답이 성공적(HTTP 상태 코드 2xx)인 경우
            if (response.ok) {
                toast.success("회원가입이 완료되었습니다! 이제 애플리케이션을 다운로드하여 로그인해 주세요.");
            } else {
                // 응답이 실패한 경우 (HTTP 상태 코드 4xx, 5xx 등)
                const errorData = await response.json(); // 서버에서 보낸 에러 메시지를 JSON 형태로 파싱
                console.error("Client: Server response error (JSON):", errorData);

                let errorMessage = "회원가입에 실패했습니다. 서버 오류입니다."; // 기본 에러 메시지

                // 서버 응답의 `detail` 필드에 따라 에러 메시지를 설정합니다.
                if (Array.isArray(errorData.detail)) {
                    // `detail`이 배열인 경우 (예: FastAPI 유효성 검사 오류)
                    errorMessage = errorData.detail.map((e: any) => e.msg).join(", ");
                } else if (typeof errorData.detail === "string") {
                    // `detail`이 문자열인 경우
                    errorMessage = errorData.detail;
                } else if (typeof errorData.detail === 'object' && errorData.detail !== null) {
                    // `detail`이 객체인 경우
                    errorMessage = JSON.stringify(errorData.detail);
                }

                toast.error(errorMessage); // 사용자에게 에러 메시지 표시
            }
        } catch (error) {
            // 네트워크 오류 등 요청 자체에 문제가 발생한 경우
            console.error("Client: 회원가입 요청 중 오류 발생 (네트워크 등):", error);
            toast.error("네트워크 오류가 발생했습니다. 서버에 연결할 수 없습니다.");
        }
    };

    // "애플리케이션 다운로드" 버튼 클릭 시 다운로드 인증 모달을 엽니다.
    const handleDownloadButtonClick = () => {
        setIsDownloadModalOpen(true);
    };

    /**
     * 다운로드 인증 모달에서 사용자 인증 정보를 제출했을 때 실행되는 함수입니다.
     * 입력된 사번과 비밀번호로 로그인 API를 호출하여 인증을 시도하고,
     * 성공 시 애플리케이션 파일을 다운로드합니다.
     * @param empNumber 인증에 사용할 사번
     * @param password 인증에 사용할 비밀번호
     */
    const handleAuthenticateAndDownload = async (empNumber: string, password: string) => {
        setIsDownloadModalOpen(false); // 모달 닫기

        // 1. 인증 확인 로딩 토스트 시작
        const loadingAuthToastId = toast.loading("인증 확인 중...");

        try {
            // FastAPI 로그인 API 호출 (인증 시도)
            const response = await fetch("http://localhost:8000/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ emp_number: empNumber, password: password }),
            });

            if (response.ok) {
                // 2. 인증 성공 시 로딩 토스트 업데이트 (성공 메시지로 변경)
                toast.success("인증 성공! 다운로드를 준비합니다.", { id: loadingAuthToastId });

                // 3. 다운로드 시작 로딩 토스트 새로 시작 (다운로드 진행을 알림)
                const downloadingToastId = toast.loading("애플리케이션 다운로드 중...");

                try {
                    // 파일 다운로드 로직
                    const downloadResponse = await fetch("http://localhost:8000/downloads/hello.exe");
                    if (!downloadResponse.ok) {
                        throw new Error("파일 다운로드에 실패했습니다.");
                    }
                    const blob = await downloadResponse.blob(); // 응답을 Blob 형태로 받음
                    const url = window.URL.createObjectURL(blob); // Blob URL 생성
                    const a = document.createElement("a"); // <a> 엘리먼트 생성
                    a.href = url; // 다운로드 링크 설정
                    a.download = "hello.exe"; // 다운로드될 파일 이름 설정
                    document.body.appendChild(a); // 엘리먼트를 문서에 추가 (클릭을 위해 필요)
                    a.click(); // 프로그램적으로 클릭하여 다운로드 시작
                    a.remove(); // 엘리먼트 제거
                    window.URL.revokeObjectURL(url); // Blob URL 해제하여 메모리 정리

                    // 4. 다운로드 성공 시 다운로드 토스트 업데이트
                    toast.success("애플리케이션 다운로드가 시작됩니다!", { id: downloadingToastId });

                } catch (downloadError) {
                    console.error("다운로드 오류:", downloadError);
                    // 5. 다운로드 실패 시 다운로드 토스트 업데이트
                    toast.error("파일 다운로드 중 오류가 발생했습니다.", { id: downloadingToastId });
                }

            } else {
                // 인증 실패 처리
                const errorData = await response.json();
                console.error("Client: Login server response error (JSON):", errorData);
                let errorMessage = "인증에 실패했습니다. 사번 또는 비밀번호를 확인해주세요.";
                if (errorData.detail) {
                    errorMessage = errorData.detail;
                }
                // 6. 인증 실패 시 초기 로딩 토스트를 에러 토스트로 업데이트
                toast.error(errorMessage, { id: loadingAuthToastId });
            }
        } catch (error) {
            console.error("Client: 로그인 요청 중 오류 발생 (네트워크 등):", error);
            // 7. 네트워크 오류 등 예외 발생 시 초기 로딩 토스트를 에러 토스트로 업데이트
            toast.error("네트워크 오류가 발생했습니다. 서버에 연결할 수 없습니다.", { id: loadingAuthToastId });
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
            <div className="flex flex-col md:flex-row w-full max-w-[1300px] md:h-[880px] bg-white rounded-2xl overflow-hidden">
                {/* 왼쪽 영역: 회원가입 폼 */}
                <div className="w-full md:w-1/2 flex items-center justify-center p-8">
                    <div className="w-full max-w-sm">
                        <div>
                            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                                회원가입
                            </h2>
                            <p className="mt-2 text-center text-sm text-gray-600">
                                환영합니다! 계정을 생성해주세요.
                            </p>
                        </div>
                        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
                            {/* 사번 (emp_number) 필드 */}
                            <div>
                                <label htmlFor="empNumber" className="sr-only">사번</label>
                                <input
                                    id="empNumber"
                                    type="text"
                                    autoComplete="username"
                                    required
                                    className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${
                                        errors.emp_number ? "border-red-500" : "border-gray-300"
                                    } placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-gray-500 focus:border-gray-500 focus:z-10 sm:text-sm`}
                                    placeholder="6자리 사번 입력"
                                    {...register("emp_number")}
                                />
                                {errors.emp_number && (
                                    <p className="mt-1 text-red-500 text-xs">{errors.emp_number.message}</p>
                                )}
                            </div>

                            {/* 비밀번호 (password) 필드 */}
                            <div className="relative">
                                <label htmlFor="password" className="sr-only">비밀번호</label>
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"} // showPassword 상태에 따라 타입 변경
                                    autoComplete="new-password"
                                    required
                                    className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${
                                        errors.password ? "border-red-500" : "border-gray-300"
                                    } placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-gray-500 focus:border-gray-500 focus:z-10 sm:text-sm pr-10`}
                                    placeholder="비밀번호 (영문, 숫자, 특수문자 포함 8-20자)"
                                    {...register("password")}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)} // 클릭 시 showPassword 상태 토글
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
                                >
                                    {showPassword ? (
                                        <EyeOff className="w-5 h-5 text-gray-500" /> // 비밀번호 숨기기 아이콘
                                    ) : (
                                        <Eye className="w-5 h-5 text-gray-500" /> // 비밀번호 보이기 아이콘
                                    )}
                                </button>
                                {errors.password && (
                                    <p className="mt-1 text-red-500 text-xs">{errors.password.message}</p>
                                )}
                            </div>

                            {/* 비밀번호 확인 (confirmPassword) 필드 */}
                            <div className="relative">
                                <label htmlFor="confirmPassword" className="sr-only">비밀번호 확인</label>
                                <input
                                    id="confirmPassword"
                                    type={showConfirmPassword ? "text" : "password"} // showConfirmPassword 상태에 따라 타입 변경
                                    autoComplete="new-password"
                                    required
                                    className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${
                                        errors.confirmPassword ? "border-red-500" : "border-gray-300"
                                    } placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-gray-500 focus:border-gray-500 focus:z-10 sm:text-sm pr-10`}
                                    placeholder="비밀번호 확인"
                                    {...register("confirmPassword")}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)} // 클릭 시 showConfirmPassword 상태 토글
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
                                >
                                    {showConfirmPassword ? (
                                        <EyeOff className="w-5 h-5 text-gray-500" /> // 비밀번호 숨기기 아이콘
                                    ) : (
                                        <Eye className="w-5 h-5 text-gray-500" /> // 비밀번호 보이기 아이콘
                                    )}
                                </button>
                                {errors.confirmPassword && (
                                    <p className="mt-1 text-red-500 text-xs">
                                        {/* 오류 메시지가 문자열이면 그대로 표시, 아니면 기본 메시지 */}
                                        {typeof errors.confirmPassword.message === 'string'
                                            ? errors.confirmPassword.message
                                            : '비밀번호가 일치하지 않습니다.'
                                        }
                                    </p>
                                )}
                            </div>

                            {/* 이름 (name) 필드 */}
                            <div className="mt-6">
                                <label htmlFor="name" className="sr-only">이름</label>
                                <input
                                    id="name"
                                    type="text"
                                    autoComplete="name"
                                    required
                                    className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${
                                        errors.name ? "border-red-500" : "border-gray-300"
                                    } placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-gray-500 focus:border-gray-500 focus:z-10 sm:text-sm`}
                                    placeholder="이름 (최소 2자)"
                                    {...register("name")}
                                />
                                {errors.name && (
                                    <p className="mt-1 text-red-500 text-xs">{errors.name.message}</p>
                                )}
                            </div>

                            {/* 이메일 (email) 필드 */}
                            <div>
                                <label htmlFor="email" className="sr-only">이메일</label>
                                <input
                                    id="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${
                                        errors.email ? "border-red-500" : "border-gray-300"
                                    } placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-gray-500 focus:border-gray-500 focus:z-10 sm:text-sm`}
                                    placeholder="이메일 (sample@email.com)"
                                    {...register("email")}
                                />
                                {errors.email && (
                                    <p className="mt-1 text-red-500 text-xs">{errors.email.message}</p>
                                )}
                            </div>

                            {/* 전화번호 (phone) 필드 */}
                            <div>
                                <label htmlFor="phone" className="sr-only">전화번호</label>
                                <input
                                    id="phone"
                                    type="tel"
                                    inputMode="numeric" // 숫자 키보드 표시
                                    pattern="[0-9]*" // 숫자만 입력 허용
                                    autoComplete="tel"
                                    required
                                    placeholder="숫자만 입력 (01012345678)"
                                    className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${
                                        errors.phone ? "border-red-500" : "border-gray-300"
                                    } placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-gray-500 focus:border-gray-500 focus:z-10 sm:text-sm`}
                                    {...register("phone")}
                                />
                                {errors.phone && (
                                    <p className="mt-1 text-red-500 text-xs">{errors.phone.message}</p>
                                )}
                            </div>

                            {/* 회원가입 버튼 */}
                            <div>
                                <button
                                    type="submit"
                                    className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-gray-500 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                                >
                                    회원가입
                                </button>
                            </div>
                        </form>

                        {/* 로그인 페이지로 이동 링크 */}
                        <div className="text-sm text-center mt-6">
                            <Link
                                to="/login"
                                className="font-medium text-gray-600 hover:text-gray-500"
                            >
                                이미 계정이 있으신가요? 로그인하기
                            </Link>
                        </div>
                    </div>
                </div>

                {/* 오른쪽 영역: EXE 파일 다운로드 가이드 */}
                <div className="w-full md:w-1/2 flex items-center justify-center p-8">
                    <div className="w-full max-w-sm text-center space-y-4">
                        <h2 className="text-2xl font-semibold text-gray-800">
                            <span className="text-red-400">애플리케이션을 설치</span>할 시간입니다!
                        </h2>
                        <p className="text-gray-600">
                            회원가입이 완료되면, 보안 네트워크 관리 시스템을 위한 전용 애플리케이션을 다운로드하여 설치해야 합니다.
                        </p>
                        <p className="text-gray-500 text-sm">
                            아래 버튼을 클릭하여 설치 파일을 다운로드하고<br /> 화면의 안내에 따라 설치를 진행해주세요.
                        </p>

                        {/* 다운로드 버튼 */}
                        <button
                            onClick={handleDownloadButtonClick}
                            className="w-full bg-gray-500 py-3 rounded-lg font-medium hover:bg-gray-700 transition text-white text-sm mt-4"
                        >
                            애플리케이션 다운로드
                        </button>

                        <div className="text-gray-400 text-xs mt-4">
                            설치 중 문제가 발생하면 관리자에게 문의해주세요.
                        </div>
                    </div>
                </div>
            </div>
            {/* 다운로드 인증 모달 컴포넌트 */}
            <DownloadAuthModal
                isOpen={isDownloadModalOpen} // 모달 열림 상태 전달
                onClose={() => setIsDownloadModalOpen(false)} // 모달 닫기 함수 전달
                onAuthenticate={handleAuthenticateAndDownload} // 인증 및 다운로드 처리 함수 전달
            />
        </div>
    );
};

export default SignUpPage;