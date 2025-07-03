import React from "react";

interface MembershipWithdrawalProps {
  onConfirm: () => void;
}

const MembershipWithdrawal: React.FC<MembershipWithdrawalProps> = ({ onConfirm }) => {
  return (
    <div className="text-sm text-gray-700 space-y-4">
      <div>
        <h4 className="text-base font-semibold text-red-600 mb-1">
          회원 탈퇴 안내
        </h4>
        <p className="mt-10">
          회원 탈퇴가 완료되었습니다. <br />
          그동안 이용해주셔서 감사합니다.
        </p>
      </div>

      <div className="text-gray-600">
        보다 편리한 서비스를 제공하기 위해 노력중이며 <br />
        다시 만나뵙길 기대합니다. <br />
        감사합니다.
      </div>

      <div className="pt-4">
        <button
          className="w-64 bg-red-100 text-white py-2 px-4 rounded-md hover:bg-red-200 transition"
          onClick={onConfirm}
        >
          회원 탈퇴 완료
        </button>
      </div>
    </div>
  );
};

export default MembershipWithdrawal;
