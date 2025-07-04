import React, { useState, useEffect } from "react";
import {
  Database,
  Cpu,
  Shield,
  Bot,
  Key,
  Check,
  Cog,
  Zap,
  Search,
  ShieldCheck,
} from "lucide-react";

const attackTypes = [
  { name: "SQL 인젝션", icon: Database, color: "bg-blue-200 text-blue-800" },
  {
    name: "분산 서비스 거부 공격",
    icon: Cpu,
    color: "bg-yellow-100 text-yellow-800",
  },
  {
    name: "크로스 사이트 스크립팅",
    icon: Shield,
    color: "bg-red-200 text-pink-800",
  },
  { name: "악성봇", icon: Bot, color: "bg-purple-200 text-purple-800" },
  {
    name: "무차별 대입 공격",
    icon: Key,
    color: "bg-orange-200 text-orange-800",
  },
];

const attackDetails: {
  [key: string]: {
    concept: string;
    behavior: string;
    damage: string[];
    detection: string;
    countermeasure: string;
  };
} = {
  "SQL 인젝션": {
    concept:
      "사용자가 입력하는 값을 조작하여, 원래 의도와 다른 데이터베이스 쿼리(SQL)를 실행하도록 만드는 공격입니다. 이를 통해 인증을 우회하거나 데이터베이스에 저장된 모든 정보에 접근할 수 있게 됩니다.",
    behavior:
      "해커는 로그인 창의 ID 입력란에 ' OR 1=1 -- 과 같은 특수 구문을 입력합니다. 만약 시스템이 이 입력을 제대로 거르지 못하면, 데이터베이스는 \"ID가 '' 이거나, 1=1인(항상 참) 사용자로 로그인시켜줘.\" 라는 명령으로 잘못 해석하여 관리자 권한을 포함한 계정 접근을 허용하게 됩니다.",
    damage: [
      "개인정보 대량 유출: 공격 성공 시, 데이터베이스에 저장된 모든 사용자의 ID, 암호화된 비밀번호, 연락처 등 민감한 개인정보가 유출될 수 있습니다.",
      "데이터 무결성 훼손: 해커가 데이터베이스에 직접 명령을 내릴 수 있게 되어, 중요 정보를 삭제하거나 악의적으로 변조할 수 있습니다.",
      "시스템 장악: 데이터베이스의 관리자 권한을 탈취하여, 데이터베이스를 넘어 시스템 전체의 제어권을 획득하는 발판으로 사용될 수 있습니다.",
    ],
    detection:
      "Fwd Pkt Len Mean, Fwd Pkt Len Max: 공격 구문이나 스크립트가 포함되어 평소보다 Forward 패킷의 평균/최대 길이가 비정상적으로 길어지는 패턴을 보조 지표로 활용할 수 있습니다.",
    countermeasure:
      "공격 패턴 탐지 시 즉시 관리자에게 알림을 발송하고, 공격을 시도한 출발지 IP를 방화벽에서 자동으로 차단합니다.",
  },
  "분산 서비스 거부 공격": {
    concept:
      "수많은 좀비 PC가 동시에 대상 서버에 요청을 보내 서비스를 마비시키는 공격입니다.",
    behavior: "감염된 봇이 대량의 요청을 보내 서버 자원을 고갈시킴.",
    damage: ["서비스 중단, 시스템 자원 고갈, 사용자의 정상 접속 불가."],
    detection: "Flow Pkts/s, Flow Bytes/s 등 갑작스러운 트래픽 변화 감지.",
    countermeasure: "트래픽 임계 초과 시 자동 차단, 이상 IP 실시간 블록.",
  },
  "크로스 사이트 스크립팅": {
    concept:
      "사용자가 입력한 악성 스크립트가 다른 사용자에게 실행되게 만드는 공격입니다.",
    behavior: "댓글, 게시글 등에 <script> 삽입해 쿠키 탈취 또는 리디렉션.",
    damage: ["세션 탈취, 피싱, 사용자 데이터 도용 등의 피해."],
    detection: "특정 패턴 스크립트 문자열 탐지.",
    countermeasure:
      "입력값 필터링, HTML escape 처리, Content Security Policy 적용.",
  },
  "악성봇": {
    concept:
      "자동화된 프로그램이 악의적인 목적을 위해 반복 요청을 보내는 공격입니다.",
    behavior: "로그인 시도, 게시글 스팸 등록, 크롤링 등 비정상 행동 반복.",
    damage: ["서버 과부하, 콘텐츠 도용, 서비스 품질 저하 등."],
    detection: "Flow INT Mean, Idle Min 등 요청 주기 이상 탐지.",
    countermeasure:
      "User-Agent 검증, 인증 강화, 속도 제한(rate limiting) 등.",
  },
  "무차별 대입 공격": {
    concept:
      "비밀번호를 맞힐 때까지 모든 조합을 시도하는 방식의 공격입니다.",
    behavior: "‘1234’, ‘password’ 등으로 계속 로그인 시도.",
    damage: ["계정 탈취, 내부 정보 유출, 불법 접근."],
    detection: "Dst Port: SSH, FTP, RDP 등 포트 스캐닝 탐지.",
    countermeasure: "계정 잠금, 2차 인증 적용, 접근 시도 IP 차단 등.",
  },
};

const TypeofNetworkTrafficAttack: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState<string>(attackTypes[0].name);
  const [fadeKey, setFadeKey] = useState(0);

  const detail = attackDetails[selectedTab];

  useEffect(() => {
    setFadeKey((prev) => prev + 1);
  }, [selectedTab]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">네트워크 트래픽 공격 유형</h1>

      {/* 탭 */}
      <div className="flex mt-7 mb-4 gap-2">
        {attackTypes.map(({ name, icon: Icon, color }) => (
          <button
            key={name}
            onClick={() => setSelectedTab(name)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 font-medium text-sm rounded-md transition-colors duration-200
              ${
                selectedTab === name
                  ? `${color} shadow`
                  : "bg-transparent text-gray-600 hover:bg-gray-100"
              }`}
          >
            <Icon className="w-5 h-5" />
            {name}
          </button>
        ))}
      </div>

      {/* 설명 */}
      <div className="space-y-6 pt-4 text-sm">
        {/* 개념 */}
        <div className="min-h-[80px]">
          <div className="flex items-center gap-2 mb-1 text-gray-800">
            <Check className="w-4 h-4" />
            <strong>개념</strong>
          </div>
          <p
            key={`concept-${fadeKey}`}
            className="text-gray-700 leading-relaxed transition-opacity duration-300 opacity-100"
          >
            {detail.concept}
          </p>
        </div>

        {/* 동작 방식 */}
        <div className="min-h-[80px]">
          <div className="flex items-center gap-2 mb-1 text-gray-800">
            <Cog className="w-4 h-4" />
            <strong>동작 방식</strong>
          </div>
          <p
            key={`behavior-${fadeKey}`}
            className="text-gray-700 leading-relaxed transition-opacity duration-300 opacity-100"
          >
            {detail.behavior}
          </p>
        </div>

        {/* 주요 피해 */}
        <div className="min-h-[120px]">
          <div className="flex items-center gap-2 mb-1 text-gray-800">
            <Zap className="w-4 h-4" />
            <strong>주요 피해</strong>
          </div>
          <ul
            key={`damage-${fadeKey}`}
            className="list-disc list-inside ml-4 text-gray-700 leading-relaxed transition-opacity duration-300 opacity-100"
          >
            {detail.damage.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>

        {/* 탐지 방법 */}
        <div className="min-h-[64px]">
          <div className="flex items-center gap-2 mb-1 text-gray-800">
            <Search className="w-4 h-4" />
            <strong>탐지 방법</strong>
          </div>
          <p
            key={`detection-${fadeKey}`}
            className="text-gray-700 leading-relaxed transition-opacity duration-300 opacity-100"
          >
            {detail.detection}
          </p>
        </div>

        {/* 대응 방안 */}
        <div className="min-h-[64px]">
          <div className="flex items-center gap-2 mb-1 text-gray-800">
            <ShieldCheck className="w-4 h-4" />
            <strong>대응 방안</strong>
          </div>
          <p
            key={`countermeasure-${fadeKey}`}
            className="text-gray-700 leading-relaxed transition-opacity duration-300 opacity-100"
          >
            {detail.countermeasure}
          </p>
        </div>
      </div>
    </div>
  );
};

export default TypeofNetworkTrafficAttack;
