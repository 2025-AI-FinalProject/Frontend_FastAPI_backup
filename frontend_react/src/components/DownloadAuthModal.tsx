import React from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';

// 모달 내 폼 데이터 유효성 검사를 위한 Zod 스키마 정의
const downloadAuthSchema = z.object({
    emp_number: z.string().min(4, "사번은 최소 4자 이상이어야 합니다."),
    password: z.string().min(8, "비밀번호는 최소 8자 이상이어야 합니다."),
});

type DownloadAuthFormData = z.infer<typeof downloadAuthSchema>;

interface DownloadAuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAuthenticate: (empNumber: string, password: string) => void;
}

const DownloadAuthModal: React.FC<DownloadAuthModalProps> = ({ isOpen, onClose, onAuthenticate }) => {
    const {
        register,
        handleSubmit,
        formState: { errors },
        reset, // 폼 초기화를 위해 reset 추가
    } = useForm<DownloadAuthFormData>({
        resolver: zodResolver(downloadAuthSchema),
        defaultValues: {
            emp_number: "",
            password: "",
        },
    });

    const onSubmit: SubmitHandler<DownloadAuthFormData> = (data) => {
        onAuthenticate(data.emp_number, data.password);
        reset(); // 인증 시도 후 폼 필드 초기화
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 shadow-xl max-w-md w-full relative">
                <h3 className="text-2xl font-bold text-gray-600 mb-6 text-center">다운로드 인증</h3>
                <p className="text-gray-600 mb-4 text-center">
                    애플리케이션 다운로드를 위해<br/> 사번과 비밀번호를 다시 입력해주세요.
                </p>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <label htmlFor="modal-empNumber" className="sr-only">사번</label>
                        <input
                            id="modal-empNumber"
                            type="text"
                            required
                            className={`appearance-none relative block w-full px-3 py-2 border ${
                                errors.emp_number ? "border-red-500" : "border-gray-300"
                            } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm`}
                            placeholder="사번"
                            {...register("emp_number")}
                        />
                        {errors.emp_number && (
                            <p className="mt-1 text-red-500 text-xs">{errors.emp_number.message}</p>
                        )}
                    </div>
                    <div>
                        <label htmlFor="modal-password" className="sr-only">비밀번호</label>
                        <input
                            id="modal-password"
                            type="password"
                            required
                            className={`appearance-none relative block w-full px-3 py-2 border ${
                                errors.password ? "border-red-500" : "border-gray-300"
                            } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm`}
                            placeholder="비밀번호"
                            {...register("password")}
                        />
                        {errors.password && (
                            <p className="mt-1 text-red-500 text-xs">{errors.password.message}</p>
                        )}
                    </div>
                    <div className="flex justify-end space-x-3 mt-6">
                        <button
                            type="button"
                            onClick={() => { onClose(); reset(); }} // 닫기 버튼 클릭 시 폼 초기화
                            className="flex-1 justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                        >
                            취소
                        </button>
                        <button
                            type="submit"
                            className="flex-1 justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-500 hover:bg-gray-600"
                        >
                            확인
                        </button>
                    </div>
                </form>
                <button
                    onClick={() => { onClose(); reset(); }}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                >
                    <span className="sr-only">닫기</span>
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        </div>
    );
};

export default DownloadAuthModal;