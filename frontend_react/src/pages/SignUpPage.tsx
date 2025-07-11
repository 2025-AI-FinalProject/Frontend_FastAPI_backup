import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm, type SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import DownloadAuthModal from "../components/DownloadAuthModal";
import { Eye, EyeOff } from "lucide-react";

// (이전과 동일한 Zod 스키마 정의 및 타입 추론)
const signUpSchema = z.object({
    emp_number: z.string().min(4, "사번은 최소 4자 이상이어야 합니다.").max(10, "사번은 최대 10자 이하여야 합니다."),
    password: z
        .string()
        .min(8, "비밀번호는 최소 8자 이상이어야 합니다.")
        .max(20, "비밀번호는 최대 20자 이하여야 합니다.")
        .regex(/[a-zA-Z]/, "비밀번호는 영문을 포함해야 합니다.")
        .regex(/[0-9]/, "비밀번호는 숫자를 포함해야 합니다.")
        .regex(/[^a-zA-Z0-9]/, "비밀번호는 특수문자를 포함해야 합니다."),
    confirmPassword: z.string(),
    name: z.string().min(2, "이름은 최소 2자 이상이어야 합니다.").max(20, "이름은 최대 20자 이하여야 합니다."),
    email: z.string().email("유효한 이메일 형식이 아닙니다.").min(1, "이메일은 필수 입력 사항입니다."), 
    phone: z.string().min(1, "전화번호는 필수 입력 사항입니다."), 
}).refine((data) => data.password === data.confirmPassword, {
    message: "비밀번호가 일치하지 않습니다.",
    path: ["confirmPassword"], 
});

type SignUpFormData = z.infer<typeof signUpSchema>;

const SignUpPage: React.FC = () => {
    const navigate = useNavigate();
    const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<SignUpFormData>({
        resolver: zodResolver(signUpSchema),
        defaultValues: {
            emp_number: "",
            password: "",
            confirmPassword: "",
            name: "",
            email: "",
            phone: "",
        },
    });

    const onSubmit: SubmitHandler<SignUpFormData> = async (data) => {
        const { confirmPassword, ...signUpData } = data;

        console.log("Client: Data to be sent:", signUpData);
        console.log("Client: JSON string:", JSON.stringify(signUpData));

        try {
            const response = await fetch("http://localhost:8000/auth/signup", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(signUpData),
            });

            if (response.ok) {
                toast.success("회원가입이 완료되었습니다! 이제 애플리케이션을 다운로드하여 로그인해 주세요.");
            } else {
                const errorData = await response.json();
                console.error("Client: Server response error (JSON):", errorData);
                
                let errorMessage = "회원가입에 실패했습니다. 서버 오류입니다.";

                if (Array.isArray(errorData.detail)) {
                    errorMessage = errorData.detail.map((e: any) => e.msg).join(", ");
                } else if (typeof errorData.detail === "string") {
                    errorMessage = errorData.detail;
                } else if (typeof errorData.detail === 'object' && errorData.detail !== null) {
                    errorMessage = JSON.stringify(errorData.detail); 
                }
                
                toast.error(errorMessage);
            }
        } catch (error) {
            console.error("Client: 회원가입 요청 중 오류 발생 (네트워크 등):", error);
            toast.error("네트워크 오류가 발생했습니다. 서버에 연결할 수 없습니다.");
        }
    };

    const handleDownloadButtonClick = () => {
        setIsDownloadModalOpen(true);
    };

    // 🚨 이 함수가 수정되었습니다.
    const handleAuthenticateAndDownload = async (empNumber: string, password: string) => {
        setIsDownloadModalOpen(false); // 모달 닫기

        // 🚨 1. 인증 확인 로딩 토스트 시작
        const loadingAuthToastId = toast.loading("인증 확인 중...");

        try {
            // FastAPI 로그인 API 호출 (인증)
            const response = await fetch("http://localhost:8000/auth/login", { 
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ emp_number: empNumber, password: password }), 
            });

            if (response.ok) {
                // 🚨 2. 인증 성공 시 로딩 토스트 업데이트 (성공 메시지로 변경)
                toast.success("인증 성공! 다운로드를 준비합니다.", { id: loadingAuthToastId });
                
                // 🚨 3. 다운로드 시작 로딩 토스트 새로 시작 (다운로드 진행을 알림)
                const downloadingToastId = toast.loading("애플리케이션 다운로드 중...");

                try {
                    // 파일 다운로드 로직
                    const downloadResponse = await fetch("http://localhost:8000/downloads/hello.exe");
                    if (!downloadResponse.ok) {
                        throw new Error("파일 다운로드에 실패했습니다.");
                    }
                    const blob = await downloadResponse.blob();
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = "hello.exe";
                    document.body.appendChild(a);
                    a.click();
                    a.remove();
                    window.URL.revokeObjectURL(url);

                    // 🚨 4. 다운로드 성공 시 다운로드 토스트 업데이트
                    toast.success("애플리케이션 다운로드가 시작됩니다!", { id: downloadingToastId });

                } catch (downloadError) {
                    console.error("다운로드 오류:", downloadError);
                    // 🚨 5. 다운로드 실패 시 다운로드 토스트 업데이트
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
                // 🚨 6. 인증 실패 시 초기 로딩 토스트를 에러 토스트로 업데이트
                toast.error(errorMessage, { id: loadingAuthToastId });
            }
        } catch (error) {
            console.error("Client: 로그인 요청 중 오류 발생 (네트워크 등):", error);
            // 🚨 7. 네트워크 오류 등 예외 발생 시 초기 로딩 토스트를 에러 토스트로 업데이트
            toast.error("네트워크 오류가 발생했습니다. 서버에 연결할 수 없습니다.", { id: loadingAuthToastId });
        }
    };

    // (이전과 동일한 JSX 리턴 부분)
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
                                    type={showPassword ? "text" : "password"}
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
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
                                >
                                    {showPassword ? (
                                        <EyeOff className="w-5 h-5 text-gray-500" />
                                    ) : (
                                        <Eye className="w-5 h-5 text-gray-500" />
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
                                    type={showConfirmPassword ? "text" : "password"} 
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
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
                                >
                                    {showConfirmPassword ? (
                                        <EyeOff className="w-5 h-5 text-gray-500" />
                                    ) : (
                                        <Eye className="w-5 h-5 text-gray-500" />
                                    )}
                                </button>
                                {errors.confirmPassword && (
                                    <p className="mt-1 text-red-500 text-xs">
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
                                    inputMode="numeric"
                                    pattern="[0-9]*"
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
                            아래 버튼을 클릭하여 설치 파일을 다운로드하고<br/> 화면의 안내에 따라 설치를 진행해주세요.
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
            {/* 다운로드 인증 모달 */}
            <DownloadAuthModal
                isOpen={isDownloadModalOpen}
                onClose={() => setIsDownloadModalOpen(false)}
                onAuthenticate={handleAuthenticateAndDownload}
            />
        </div>
    );
};

export default SignUpPage;