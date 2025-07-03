import React from "react";

const SQLInjection: React.FC = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-2">SQL 인젝션</h1>
      <p className="text-gray-600">SQL 삽입 공격 관련 로그와 탐지 정보를 표시합니다.</p>
    </div>
  );
};

export default SQLInjection;
