import React from "react";
import { ShieldCheck, Bug, Bot, Lock, CloudLightning, Code } from "lucide-react";

const stats = [
  {
    label: "SQL 인젝션",
    percent: "1%",
    count: "32건",
    change: "+11.01%",
    icon: ShieldCheck,
    desc: "데이터베이스 쿼리 조작 시도"
  },
  {
    label: "XSS 공격",
    percent: "2%",
    count: "60건",
    change: "+11.01%",
    icon: Bug,
    desc: "악성 스크립트 삽입"
  },
  {
    label: "악성 봇",
    percent: "7%",
    count: "152건",
    change: "+11.01%",
    icon: Bot,
    desc: "자동화된 악성 트래픽"
  },
  {
    label: "무차별대입 공격",
    percent: "23%",
    count: "320건",
    change: "+6.08%",
    icon: Lock,
    desc: "비밀번호 대입 시도"
  },
  {
    label: "DDoS 공격",
    percent: "37%",
    count: "540건",
    change: "-0.03%",
    icon: CloudLightning,
    desc: "서비스 거부 공격"
  },
  {
    label: "API 공격",
    percent: "1.15%",
    count: "44건",
    change: "+15.03%",
    icon: Code,
    desc: "API 취약점 공략"
  },
];

const AttackStats: React.FC = () => {
  return (
    <div className="p-6">
      <div className="text-sm mb-4 text-gray-500">Today (2025-06-24)</div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              className="group relative rounded-2xl p-4 bg-white border border-gray-100 shadow-md transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl hover:bg-blue-50 flex flex-col justify-between h-40"
            >
              <div className="flex items-center mb-2 space-x-2">
                <Icon className="w-5 h-5 text-blue-500" />
                <div className="text-sm text-gray-600">{s.label}</div>
              </div>
              <div className="flex items-baseline space-x-2 mb-2">
                <span className="text-2xl font-bold">{s.percent}</span>
                <span className="text-2xl font-bold">{s.count}</span>
              </div>
              <div className="flex items-center justify-end space-x-1 text-xs">
                <span
                  className={
                    s.change.startsWith("-") ? "text-red-500" : "text-green-500"
                  }
                >
                  {s.change}
                </span>
                <span>{s.change.startsWith("-") ? "↘" : "↗"}</span>
              </div>

              {/* Tooltip */}
              <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 hidden group-hover:block bg-gray-700 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10 shadow">
                {s.desc}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AttackStats;
