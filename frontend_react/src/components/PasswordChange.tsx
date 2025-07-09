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
  isError?: boolean; // isError prop이 이미 있다고 가정합니다.
}

const PasswordInput: React.FC<PasswordInputProps> = ({
  label,
  value,
  setValue,
  show,
  onToggleShow,
  showStrength = false,
  pwStrength,
  isError = false, // isError prop이 있다고 가정하고 기본값 설정
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
        // 이 className은 변경하지 않고 기존대로 유지됩니다.
        // 하지만 isError prop을 받아서 내부적으로 색상 로직이 구현되어 있다고 가정합니다.
        className={`w-full rounded-lg border px-4 py-2 pr-10 text-sm text-gray-900 focus:outline-none focus:ring-2 transition
          ${isError ? "border-red-300 focus:ring-red-200 focus:border-red-600" : "border-gray-300 focus:ring-blue-200 focus:border-blue-300"}
        `}
      />
      <button
        type="button"
        onClick={onToggleShow}
        className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-500"
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

  // 새 비밀번호와 확인 비밀번호 불일치에 대한 오류 상태
  const [isConfirmPwMismatch, setIsConfirmPwMismatch] = useState(false);
  // 현재 비밀번호와 새 비밀번호가 같은 경우에 대한 오류 상태
  const [isNewPwSameAsCurrentError, setIsNewPwSameAsCurrentError] = useState(false);

  const getPasswordStrength = (pw: string) => {
    if (!pw) return "";
    const backendStrong = /^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@#$%^&*]).{10,}$/; 
    if (backendStrong.test(pw)) return "강함";
    if (pw.length >= 6) return "보통";
    return "약함";
  };

  const pwStrength = getPasswordStrength(newPw);

  // 현재 비밀번호 입력 시 실행될 함수
  const handleCurrentPwChange = (v: string) => {
    setCurrentPw(v);
    // 현재 비밀번호와 새 비밀번호가 같으면 오류 상태로 설정
    // 현재 비밀번호 칸에도 오류 표시를 위해 추가
    setIsNewPwSameAsCurrentError(v === newPw && v !== "");
  };

  // 새 비밀번호 입력 시 실행될 함수
  const handleNewPwChange = (v: string) => {
    setNewPw(v);
    // 새 비밀번호가 입력될 때마다 확인 비밀번호와 비교하여 오류 상태 업데이트
    setIsConfirmPwMismatch(v !== confirmPw && confirmPw !== "");
    // 현재 비밀번호와 새 비밀번호가 같은지 확인하여 오류 상태 업데이트
    // 새 비밀번호 칸에도 오류 표시를 위해 추가
    setIsNewPwSameAsCurrentError(currentPw === v && v !== "");
  };

  // 새 비밀번호 확인 입력 시 실행될 함수
  const handleConfirmPwChange = (v: string) => {
    setConfirmPw(v);
    // 확인 비밀번호가 입력될 때마다 새 비밀번호와 비교하여 오류 상태 업데이트
    setIsConfirmPwMismatch(newPw !== v); // 입력값이 다르면 true
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 입력 필드 유효성 검사 및 UI 업데이트
    if (!currentPw || !newPw || !confirmPw) {
      toast.error("모든 항목을 입력해주세요.");
      return;
    }

    const backendStrongRegex = /^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@#$%^&*]).{10,}$/;
    if (!backendStrongRegex.test(newPw)) {
      toast.error("새 비밀번호는 영문, 숫자, 특수문자를 포함하고 10자 이상이어야 합니다.");
      return;
    }

    // 새 비밀번호와 확인 비밀번호 불일치 검사 (제출 시)
    if (newPw !== confirmPw) {
      toast.error("새 비밀번호와 확인 비밀번호가 일치하지 않습니다.");
      setIsConfirmPwMismatch(true); // 불일치 시 오류 상태 설정
      return;
    } else {
      setIsConfirmPwMismatch(false); // 일치하면 오류 상태 해제
    }

    // 새 비밀번호가 현재 비밀번호와 같은지 검사 (제출 시)
    if (newPw === currentPw) {
      toast.error("새 비밀번호는 현재 비밀번호와 달라야 합니다.");
      setIsNewPwSameAsCurrentError(true); // 현재 비밀번호와 같으면 오류 상태 설정
      return;
    } else {
      setIsNewPwSameAsCurrentError(false); // 다르면 오류 상태 해제
    }

    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        toast.error("로그인 정보가 없습니다. 다시 로그인해주세요.");
        return;
      }

      const response = await fetch("http://localhost:8000/auth/change-password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          current_password: currentPw,
          new_password: newPw,
          confirm_password: confirmPw,
        }),
      });

      if (response.ok) {
        toast.success("비밀번호가 성공적으로 변경되었습니다. 다시 로그인해주세요.");
        // 비밀번호 변경 성공 후 입력 필드 및 오류 상태 초기화
        setCurrentPw("");
        setNewPw("");
        setConfirmPw("");
        setIsConfirmPwMismatch(false);
        setIsNewPwSameAsCurrentError(false);
      } else {
        const errorData = await response.json();
        toast.error(errorData.detail || "비밀번호 변경 중 오류가 발생했습니다.");
        // 백엔드에서 특정 오류를 반환할 경우, 해당 필드에 isError를 설정할 수 있습니다.
        // 예: 백엔드에서 현재 비밀번호가 틀렸다고 알려주면, currentPw 필드에 오류 표시
        // if (errorData.detail === "현재 비밀번호가 올바르지 않습니다.") {
        //   setIsCurrentPwError(true); // 이런 식으로 새로운 상태를 만들어 사용
        // }
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
              setValue={handleCurrentPwChange}
              show={showCurrentPw}
              onToggleShow={() => setShowCurrentPw((v) => !v)}
              isError={isNewPwSameAsCurrentError} // 현재 비밀번호와 새 비밀번호가 같을 때 오류 표시
            />
            <PasswordInput
              label="새 비밀번호"
              value={newPw}
              setValue={handleNewPwChange}
              show={showNewPw}
              onToggleShow={() => setShowNewPw((v) => !v)}
              showStrength
              pwStrength={pwStrength}
              isError={isNewPwSameAsCurrentError} // 새 비밀번호가 현재 비밀번호와 같을 때 오류 표시
            />
            <PasswordInput
              label="새 비밀번호 확인"
              value={confirmPw}
              setValue={handleConfirmPwChange}
              show={showConfirmPw}
              onToggleShow={() => setShowConfirmPw((v) => !v)}
              isError={isConfirmPwMismatch} // 새 비밀번호와 확인 비밀번호가 다를 때 오류 표시
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
                className="px-6 py-2 bg-blue-100 text-gray-600 font-semibold rounded-md text-sm hover:bg-blue-200 transition"
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