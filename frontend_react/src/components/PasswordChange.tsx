import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";

interface PasswordInputProps {
  label: string;
  value: string;
  setValue: (v: string) => void;
  show: boolean;
  onToggleShow: () => void;
  showStrength?: boolean;
  pwStrength?: string;
}

const PasswordInput: React.FC<PasswordInputProps> = ({
  label,
  value,
  setValue,
  show,
  onToggleShow,
  showStrength = false,
  pwStrength,
}) => (
  <div className="space-y-1">
    <label className="block text-sm font-medium text-gray-800">{label}</label>
    <div className="relative w-64">
      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          console.log(label, e.target.value);
        }}
        autoComplete="off"
        className="w-full rounded-lg border border-gray-300 px-4 py-2 pr-10 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300 transition"
      />
      <button
        type="button"
        onClick={onToggleShow}
        className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 hover:text-blue-600"
      >
        {show ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
    {showStrength && value && (
      <p
        className={`text-xs font-medium mt-1 ${
          pwStrength === "강함"
            ? "text-green-600"
            : pwStrength === "보통"
            ? "text-yellow-600"
            : "text-red-600"
        }`}
      >
        비밀번호 강도: {pwStrength}
      </p>
    )}
  </div>
);

const PasswordChange: React.FC = () => {
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");

  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  const getPasswordStrength = (pw: string) => {
    if (!pw) return "";
    const strong = /^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@#$%^&*]).{10,}$/;
    const medium = /^(?=.*[a-zA-Z])(?=.*[0-9]).{6,}$/; // 이 부분은 백엔드의 10자 이상, 특수문자 포함 규칙과 맞추는 게 좋습니다.
    
    // 백엔드와 동일하게 10자 이상, 영문, 숫자, 특수문자 포함 규칙 적용
    const backendStrong = /^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@#$%^&*]).{10,}$/; 
    if (backendStrong.test(pw)) return "강함";
    // 여기에 더 약한 규칙을 넣을 수 있지만, 백엔드와 맞춰서 "약함" 처리
    if (pw.length >= 6) return "보통"; // 6자 이상만 해도 보통으로 일단 표시
    return "약함";
  };

  const pwStrength = getPasswordStrength(newPw);

  const handleSubmit = async (e: React.FormEvent) => { // async 추가
    e.preventDefault();

    if (!currentPw || !newPw || !confirmPw) {
      toast.error("모든 항목을 입력해주세요.");
      return;
    }

    // 백엔드 유효성 검사와 일치하도록 변경 (최소 6자 -> 최소 10자 및 복잡도)
    // if (newPw.length < 6) { 
    //   toast.error("새 비밀번호는 최소 6자 이상이어야 합니다.");
    //   return;
    // }

    // 비밀번호 강도 검사를 백엔드 규칙과 일치시킵니다.
    // 백엔드 규칙: 영문, 숫자, 특수문자 포함, 10자 이상
    const backendStrongRegex = /^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@#$%^&*]).{10,}$/;
    if (!backendStrongRegex.test(newPw)) {
        toast.error("새 비밀번호는 영문, 숫자, 특수문자를 포함하고 10자 이상이어야 합니다.");
        return;
    }

    if (newPw !== confirmPw) {
      toast.error("새 비밀번호와 확인 비밀번호가 일치하지 않습니다.");
      return;
    }

    if (newPw === currentPw) {
        toast.error("새 비밀번호는 현재 비밀번호와 달라야 합니다.");
        return;
    }

    // if (pwStrength === "약함") { // 이 부분은 위 backendStrongRegex 검사로 대체
    //   toast.error("비밀번호가 너무 약합니다.");
    //   return;
    // }

    try {
      // 1. 로컬 스토리지 또는 Context/Redux에서 JWT 토큰 가져오기
      const token = localStorage.getItem("accessToken"); // 또는 sessionStorage.getItem("accessToken")
      if (!token) {
        toast.error("로그인 정보가 없습니다. 다시 로그인해주세요.");
        // 로그인 페이지로 리다이렉트하는 로직 추가
        return;
      }

      // 2. 백엔드 API에 비밀번호 변경 요청 보내기
      const response = await fetch("http://localhost:8000/auth/change-password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`, // JWT 토큰을 Authorization 헤더에 추가
        },
        body: JSON.stringify({
          current_password: currentPw,
          new_password: newPw,
          confirm_password: confirmPw,
        }),
      });

      // 3. 응답 처리
      if (response.ok) {
        toast.success("비밀번호가 성공적으로 변경되었습니다. 다시 로그인해주세요.");
        // 비밀번호 변경 성공 후 입력 필드 초기화
        setCurrentPw("");
        setNewPw("");
        setConfirmPw("");
        // 사용자가 다시 로그인하도록 유도 (예: 로그인 페이지로 리다이렉트)
        // window.location.href = "/login"; // 또는 React Router의 navigate 함수 사용
      } else {
        const errorData = await response.json();
        // 백엔드에서 보낸 에러 메시지를 사용자에게 표시
        toast.error(errorData.detail || "비밀번호 변경 중 오류가 발생했습니다.");
      }
    } catch (error) {
      console.error("비밀번호 변경 요청 중 에러 발생:", error);
      toast.error("비밀번호 변경 요청 중 네트워크 오류가 발생했습니다.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full h-full flex flex-col">
      <h4 className="text-base font-semibold text-gray-900 mb-4">비밀번호 변경</h4>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
        {/* 왼쪽 비밀번호 입력 칸 */}
        <div className="flex justify-center md:justify-start md:ml-24">
          <div className="space-y-5 w-full max-w-full md:max-w-md mx-auto md:mx-0 mt-2">
            <PasswordInput
              label="현재 비밀번호"
              value={currentPw}
              setValue={setCurrentPw}
              show={showCurrentPw}
              onToggleShow={() => setShowCurrentPw((v) => !v)}
            />
            <PasswordInput
              label="새 비밀번호"
              value={newPw}
              setValue={setNewPw}
              show={showNewPw}
              onToggleShow={() => setShowNewPw((v) => !v)}
              showStrength
              pwStrength={pwStrength}
            />
            <PasswordInput
              label="새 비밀번호 확인"
              value={confirmPw}
              setValue={setConfirmPw}
              show={showConfirmPw}
              onToggleShow={() => setShowConfirmPw((v) => !v)}
            />
          </div>
        </div>

        {/* 오른쪽 안내 및 버튼 */}
        <div className="flex flex-col justify-between">
          <div className="mt-11">
            <div className="text-sm text-gray-600 bg-gray-50 border border-gray-200 rounded-lg p-4 w-80 max-w-full">
              <p className="mb-1 font-medium text-gray-800">🔐 비밀번호 설정 규칙</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>영문 + 숫자 필수</li>
                <li>특수문자 1개 이상 반드시 포함</li>
                <li>최소 6자 이상 권장</li>
              </ul>
            </div>

            <div className="flex mt-6">
              <button
                type="submit"
                className="px-6 py-2 bg-blue-100 text-blue-700 font-semibold rounded-md text-sm hover:bg-blue-200 transition"
              >
                네, 모두 확인했습니다. 비밀번호를 변경합니다.
              </button>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};

export default PasswordChange;