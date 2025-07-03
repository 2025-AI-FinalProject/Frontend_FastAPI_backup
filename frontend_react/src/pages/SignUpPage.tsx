import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm, type SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";

// 회원가입 폼 데이터 유효성 검사를 위한 Zod 스키마 정의
const signUpSchema = z.object({
    emp_number: z.string().min(4, "사번은 최소 4자 이상이어야 합니다.").max(10, "사번은 최대 10자 이하여야 합니다."),
    password: z
        .string()
        .min(8, "비밀번호는 최소 8자 이상이어야 합니다.")
        .max(20, "비밀번호는 최대 20자 이하여야 합니다.")
        .regex(/[a-zA-Z]/, "비밀번호는 영문을 포함해야 합니다.")
        .regex(/[0-9]/, "비밀번호는 숫자를 포함해야 합니다.")
        .regex(/[^a-zA-Z0-9]/, "비밀번호는 특수문자를 포함해야 합니다."),
    confirmPassword: z.string(), // 비밀번호 확인 필드
    name: z.string().min(2, "이름은 최소 2자 이상이어야 합니다.").max(20, "이름은 최대 20자 이하여야 합니다."),
    email: z.string().email("유효한 이메일 형식이 아닙니다.").min(1, "이메일은 필수 입력 사항입니다."), 
    phone: z.string().min(1, "전화번호는 필수 입력 사항입니다."), 
}).refine((data) => data.password === data.confirmPassword, {
    message: "비밀번호가 일치하지 않습니다.",
    path: ["confirmPassword"], 
});

// Zod 스키마로부터 타입 추론
type SignUpFormData = z.infer<typeof signUpSchema>;

const SignUpPage: React.FC = () => {
    const navigate = useNavigate();
    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
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

        // 🚨 클라이언트 측에서 전송될 데이터와 JSON 문자열 확인
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
                toast.success("회원가입이 완료되었습니다! 로그인해 주세요.");
                navigate("/login");
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

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-2xl">
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
                        <label htmlFor="empNumber" className="sr-only">
                            사번
                        </label>
                        <input
                            id="empNumber"
                            type="text"
                            autoComplete="username" 
                            required
                            className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${
                                errors.emp_number ? "border-red-500" : "border-gray-300"
                            } placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm`}
                            placeholder="6자리 사번 입력"
                            {...register("emp_number")}
                        />
                        {errors.emp_number && (
                            <p className="mt-1 text-red-500 text-xs">{errors.emp_number.message}</p>
                        )}
                    </div>

                    {/* 비밀번호 (password) 필드 */}
                    <div>
                        <label htmlFor="password" className="sr-only">
                            비밀번호
                        </label>
                        <input
                            id="password"
                            type="password"
                            autoComplete="new-password"
                            required
                            className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${
                                errors.password ? "border-red-500" : "border-gray-300"
                            } placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm`}
                            placeholder="비밀번호 (영문, 숫자, 특수문자 포함 8-20자)"
                            {...register("password")}
                        />
                        {errors.password && (
                            <p className="mt-1 text-red-500 text-xs">{errors.password.message}</p>
                        )}
                    </div>

                    {/* 비밀번호 확인 (confirmPassword) 필드 */}
                    <div>
                        <label htmlFor="confirmPassword" className="sr-only">
                            비밀번호 확인
                        </label>
                        <input
                            id="confirmPassword"
                            type="password"
                            autoComplete="new-password"
                            required
                            className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${
                                errors.confirmPassword ? "border-red-500" : "border-gray-300"
                            } placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm`}
                            placeholder="비밀번호 확인"
                            {...register("confirmPassword")}
                        />
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
                        <label htmlFor="name" className="sr-only">
                            이름
                        </label>
                        <input
                            id="name"
                            type="text"
                            autoComplete="name"
                            required
                            className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${
                                errors.name ? "border-red-500" : "border-gray-300"
                            } placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm`}
                            placeholder="이름 (최소 2자)"
                            {...register("name")}
                        />
                        {errors.name && (
                            <p className="mt-1 text-red-500 text-xs">{errors.name.message}</p>
                        )}
                    </div>

                    {/* 이메일 (email) 필드 - 필수 사항으로 변경 */}
                    <div>
                        <label htmlFor="email" className="sr-only">
                            이메일
                        </label>
                        <input
                            id="email"
                            type="email"
                            autoComplete="email"
                            required 
                            className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${
                                errors.email ? "border-red-500" : "border-gray-300"
                            } placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm`}
                            placeholder="이메일 (sample@email.com)" 
                            {...register("email")}
                        />
                        {errors.email && (
                            <p className="mt-1 text-red-500 text-xs">{errors.email.message}</p>
                        )}
                    </div>

                    {/* 전화번호 (phone) 필드 - 필수 사항으로 변경 */}
                    <div>
                        <label htmlFor="phone" className="sr-only">
                            전화번호
                        </label>
                        <input
                            id="phone"
                            type="tel"
                            autoComplete="tel"
                            required 
                            className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${
                                errors.phone ? "border-red-500" : "border-gray-300"
                            } placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm`}
                            placeholder="숫자만 입력 (01012345678)" 
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
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-gray-600 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            회원가입
                        </button>
                    </div>
                </form>

                {/* 로그인 페이지로 이동 링크 */}
                <div className="text-sm text-center">
                    <Link
                        to="/login"
                        className="font-medium text-blue-600 hover:text-blue-500"
                    >
                        이미 계정이 있으신가요? 로그인하기
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default SignUpPage;