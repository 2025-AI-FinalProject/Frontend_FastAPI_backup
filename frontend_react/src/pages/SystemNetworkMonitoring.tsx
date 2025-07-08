import React, { useState, useEffect } from "react";
import { Link as LinkIcon, Plug, PlugZap, RefreshCw } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts";
import LogFeedModal from "../components/LogFeedModal";

const getCurrentTimeLabel = (baseDate?: Date) => {
  const now = baseDate ?? new Date();
  const minutes = Math.floor(now.getMinutes() / 10) * 10;
  return `${now.getHours().toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}`;
};

const pastelColors = [
  "#AEC6CF",
  "#FFD1DC",
  "#BFD8B8",
  "#FFFACD",
  "#CBAACB",
  "#FFB347",
  "#77DD77",
  "#F49AC2",
  "#C2B280",
];

function shadeColor(color: string, percent: number) {
  let R = parseInt(color.substring(1, 3), 16);
  let G = parseInt(color.substring(3, 5), 16);
  let B = parseInt(color.substring(5, 7), 16);

  R = Math.min(255, Math.max(0, R + (R * percent) / 100));
  G = Math.min(255, Math.max(0, G + (G * percent) / 100));
  B = Math.min(255, Math.max(0, B + (B * percent) / 100));

  const rHex = Math.round(R).toString(16).padStart(2, "0");
  const gHex = Math.round(G).toString(16).padStart(2, "0");
  const bHex = Math.round(B).toString(16).padStart(2, "0");

  return `#${rHex}${gHex}${bHex}`;
}

const SystemNetworkMonitoring: React.FC = () => {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [selectedThreat, setSelectedThreat] = useState<string | null>(null);

  const [logData, setLogData] = useState<{ time: string; value: number }[]>([
    { time: "00:00", value: 2 },
    { time: "00:10", value: 5 },
    { time: "00:20", value: 8 },
    { time: "00:30", value: 3 },
    { time: "00:40", value: 6 },
    { time: "00:50", value: 1 },
  ]);

  const [pieData, setPieData] = useState([
    { name: "DLL 하이재킹", value: 4 },
    { name: "키로깅", value: 2 },
    { name: "백도어 설치", value: 3 },
  ]);

  const [logFeedData, setLogFeedData] = useState(
    Array.from({ length: 100 }).map((_, i) => ({
      time: new Date(Date.now() - i * 1000 * 60).toISOString(), // ISO 8601 문자열
      status: "정상",
      result: "-",
      ip: `192.168.0.${i % 255}`,
      process: "svchost.exe",
      host: `host-${i}`,
    }))
  );

  const [baseTime, setBaseTime] = useState<Date>(new Date());
  const [activePieIndex, setActivePieIndex] = useState<number | null>(null);
  const [activeLineIndex, setActiveLineIndex] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setLogData((prev) => {
        let lastTimeStr = prev.length ? prev[prev.length - 1].time : getCurrentTimeLabel(baseTime);
        let [h, m] = lastTimeStr.split(":").map(Number);
        let newDate = new Date(baseTime);
        newDate.setHours(h);
        newDate.setMinutes(m + 10);
        const newTime = getCurrentTimeLabel(newDate);
        return [...prev.slice(-5), { time: newTime, value: Math.floor(Math.random() * 10) + 1 }];
      });

      setLogFeedData((prev) => {
        const newEntry = {
          time: new Date().toISOString(),
          status: Math.random() > 0.7 ? "위협" : "정상",
          result: Math.random() > 0.7 ? "의심행위 탐지" : "-",
          ip: `192.168.0.${Math.floor(Math.random() * 255)}`,
          process: "svchost.exe",
          host: `host-${prev.length}`,
        };
        return [newEntry, ...prev].slice(0, 100);
      });
    }, 10000);

    return () => clearInterval(interval);
  }, [baseTime]);

  const handleRefresh = () => {
    const now = new Date();
    setBaseTime(now);
    const initialLogData = [];
    for (let i = 5; i >= 0; i--) {
      const dt = new Date(now);
      dt.setMinutes(dt.getMinutes() - i * 10);
      initialLogData.push({ time: getCurrentTimeLabel(dt), value: Math.floor(Math.random() * 10) + 1 });
    }
    setLogData(initialLogData);

    setPieData([
      { name: "DLL 하이재킹", value: 4 },
      { name: "키로깅", value: 2 },
      { name: "백도어 설치", value: 3 },
    ]);

    const newLogs = [];
    for (let i = 0; i < 10; i++) {
      const dt = new Date(now);
      dt.setSeconds(dt.getSeconds() - i * 5);
      newLogs.push({
        time: dt.toISOString(),
        status: "정상",
        result: "-",
        ip: `192.168.0.${i}`,
        process: "svchost.exe",
        host: `host-${i}`,
      });
    }
    setLogFeedData(newLogs);
  };

  const getStatusIcon = () => {
    if (isConnected === true) return <Plug className="w-4 h-4 mr-1" />;
    if (isConnected === false) return <PlugZap className="w-4 h-4 mr-1" />;
    return <LinkIcon className="w-4 h-4 mr-1" />;
  };

  const getStatusText = () => {
    if (isConnected === true) return "연결 됨";
    if (isConnected === false) return "연결 끊김";
    return "연결 상태";
  };

  const threatDescriptions: { [key: string]: string } = {
    "DLL 하이재킹": "정상 DLL을 교체하여 악성 코드를 실행시키는 기법입니다.",
    키로깅: "사용자의 키보드 입력을 기록하여 정보를 탈취하는 공격입니다.",
    "백도어 설치": "외부에서 시스템에 비정상적으로 접근할 수 있도록 만드는 행위입니다.",
  };

  const pieTotal = pieData.reduce((acc, item) => acc + item.value, 0);
  const logTotal = logData.reduce((acc, item) => acc + item.value, 0);

  return (
    <div className="p-6 bg-white h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">
          시스템 로그 실시간 모니터링 📈
        </h1>
        <div className="flex gap-2">
          <button
            onClick={handleRefresh}
            className="flex items-center text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded px-3 py-2 h-9 shadow-sm"
            aria-label="새로고침"
            type="button"
          >
            <RefreshCw className="w-4 h-4 mr-1" />
            새로고침
          </button>
          <button className="flex items-center text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded px-3 py-2 h-9 shadow-sm">
            {getStatusIcon()}
            {getStatusText()}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: "수집된 로그 수 (24H)", value: "12348 개", valueClass: "text-black text-xl" },
          { label: "총 탐지된 위협", value: "0", valueClass: "text-green-500 text-2xl" },
          { label: "최다 발생 위협 유형", value: "DLL 하이재킹", valueClass: "text-black text-lg" },
          { label: "탐지된 위협 종류", value: "N건 / 없음", valueClass: "text-black text-lg" },
        ].map((card, idx) => (
          <div
            key={idx}
            className="bg-gray-50 p-4 rounded border border-gray-200 shadow-md hover:shadow-lg hover:border-gray-300 transition text-center"
          >
            <div className="text-sm text-gray-600">{card.label}</div>
            <div className={`font-bold mt-2 py-2 ${card.valueClass}`}>{card.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div
          className="bg-gray-50 p-4 rounded border border-gray-200 shadow-md hover:shadow-lg hover:border-gray-300 transition focus:outline-none relative"
          tabIndex={-1}
          onMouseLeave={() => setActiveLineIndex(null)}
          onMouseMove={(e) => {
            const boundingRect = e.currentTarget.getBoundingClientRect();
            const x = e.clientX - boundingRect.left - 40;
            const index = Math.round((x / 230) * (logData.length - 1));
            if (index >= 0 && index < logData.length) {
              setActiveLineIndex(index);
            } else {
              setActiveLineIndex(null);
            }
          }}
        >
          <div className="flex items-center justify-between mb-2 pb-1">
            <div className="text-blue-600 font-semibold">시간대별 위협 발생 추이</div>
            <div className="text-gray-400 text-xs">최근 1시간 내 위협 발생 추이입니다.</div>
          </div>
          <ResponsiveContainer width="100%" height={230}>
            <LineChart
              data={logData}
              margin={{ left: -20, right: 25, top: 10, bottom: 5 }}
            >
              <XAxis dataKey="time" stroke="#999" />
              <YAxis domain={[1, 10]} ticks={[2, 4, 6, 8, 10]} stroke="#999" />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#B9CDFF"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div
          className="bg-gray-50 p-4 rounded border border-gray-200 shadow-md hover:shadow-lg hover:border-gray-300 transition focus:outline-none flex flex-col justify-end"
          tabIndex={-1}
        >
          <div className="text-blue-600 font-semibold mb-2">위협 유형별 분포</div>
          <div className="grid grid-cols-2 gap-4 items-center">
            <div className="flex items-center justify-center">
              {pieData.length === 0 ? (
                <div className="flex items-center justify-center w-full h-[200px] bg-white rounded-full text-sm text-gray-500 border border-dashed border-gray-300">
                  탐지된 위협이 없습니다.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={70}
                      activeIndex={activePieIndex ?? undefined}
                      onMouseEnter={(_, index) => setActivePieIndex(index)}
                      onMouseLeave={() => setActivePieIndex(null)}
                      onClick={(data) => {
                        if (data && data.name) {
                          setSelectedThreat(data.name);
                        }
                      }}
                      isAnimationActive={true} // 실시간 변화 시 부드러운 애니메이션
                      labelLine={({ cx, cy, midAngle, outerRadius }) => {
                        const RADIAN = Math.PI / 180;
                        const sx = cx + outerRadius * Math.cos(-midAngle * RADIAN);
                        const sy = cy + outerRadius * Math.sin(-midAngle * RADIAN);
                        const mx = cx + (outerRadius + 20) * Math.cos(-midAngle * RADIAN);
                        const my = cy + (outerRadius + 20) * Math.sin(-midAngle * RADIAN);
                        return (
                          <polyline
                            points={`${sx},${sy} ${mx},${my}`}
                            stroke="#999"
                            fill="none"
                            strokeWidth={1}
                          />
                        );
                      }}
                      label={({ cx, cy, midAngle, outerRadius, index, name }) => {
                        const RADIAN = Math.PI / 180;
                        const distance = outerRadius + 33; // 👈 파이 조각에서 충분히 떨어뜨림
                        const x = cx + distance * Math.cos(-midAngle * RADIAN);
                        const y = cy + distance * Math.sin(-midAngle * RADIAN);

                        const baseColor = pastelColors[index % pastelColors.length];
                        const charWidth = 7; // 한 글자당 대략적인 폭(px)
                        const padding = 10;
                        const boxWidth = name.length * charWidth + padding * 2;

                        return (
                          <g>
                            <rect
                              x={x - boxWidth / 2}
                              y={y - 10}
                              width={boxWidth}
                              height={20}
                              fill={shadeColor(baseColor, -40)}
                              rx={10}
                              ry={10}
                              opacity={0.8}
                            />
                            <text
                              x={x}
                              y={y + 2}
                              fill="white"
                              fontWeight="600"
                              fontSize={11}
                              textAnchor="middle"
                              dominantBaseline="middle"
                              style={{ pointerEvents: "none", userSelect: "none" }}
                            >
                              {name}
                            </text>
                          </g>
                        );
                      }}
                    >
                      {pieData.map((_, index) => {
                        const baseColor = pastelColors[index % pastelColors.length];
                        const fillColor =
                          index === activePieIndex ? shadeColor(baseColor, -20) : baseColor;
                        return <Cell key={`cell-${index}`} fill={fillColor} />;
                      })}
                    </Pie>
                    <Tooltip
                      formatter={(value: number, name: string) => [
                        `${value} (${((value / pieTotal) * 100).toFixed(1)}%)`,
                        name,
                      ]}
                      cursor={{ fill: "rgba(0,0,0,0.1)" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="text-sm text-gray-700 min-h-[140px]">
              {activePieIndex !== null ? (
                <>
                  <div className="font-semibold text-blue-600">
                    {pieData[activePieIndex].name}
                  </div>
                  <div>{threatDescriptions[pieData[activePieIndex].name]}</div>
                  <div className="mt-1 text-xs text-gray-500">
                    값: {pieData[activePieIndex].value} (
                    {((pieData[activePieIndex].value / pieTotal) * 100).toFixed(1)}%)
                  </div>
                </>
              ) : selectedThreat ? (
                <div className="space-y-1">
                  <div className="font-semibold text-blue-600">{selectedThreat}</div>
                  <div>{threatDescriptions[selectedThreat]}</div>
                </div>
              ) : activeLineIndex !== null ? (
                <>
                  <div className="font-semibold text-blue-600">
                    시간: {logData[activeLineIndex]?.time}
                  </div>
                  <div>
                    값: {logData[activeLineIndex]?.value} (
                    {logTotal > 0
                      ? ((logData[activeLineIndex]?.value / logTotal) * 100).toFixed(1)
                      : 0}
                    %)
                  </div>
                </>
              ) : (
                <div className="text-gray-500">
                  차트 항목을 클릭하거나 마우스를 올리면 간단한 설명이 표시됩니다.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded border border-gray-200 shadow-md transition flex flex-col flex-grow overflow-hidden">
        <div className="shrink-0 flex items-center justify-between">
          <div className="text-blue-600 font-semibold mb-2 pl-1">실시간 로그 피드</div>
          <button
            className="text-xs text-blue-600 underline mb-2 mr-1"
            type="button"
            onClick={() => setIsModalOpen(true)}
          >
            더보기
          </button>
        </div>

        <div className="grid grid-cols-6 gap-2 text-sm font-semibold text-gray-700 border-b border-gray-200 pb-2">
          <div>수집 시각</div>
          <div>상태</div>
          <div>위협 결과</div>
          <div>발생 IP</div>
          <div>프로세스명</div>
          <div>호스트명</div>
        </div>

        <div className="overflow-y-auto flex-grow">
          {logFeedData.slice(0, 7).map((item, index) => (
            <div
              key={index}
              className={`grid grid-cols-6 gap-2 text-sm border-b border-gray-100 py-1.5 cursor-default
              ${
                item.status === "위협" ? "text-red-600 font-semibold" : "text-gray-600"
              }`}
            >
              <div title={item.time}>{new Date(item.time).toLocaleString()}</div>
              <div>{item.status}</div>
              <div>{item.result}</div>
              <div>{item.ip}</div>
              <div>{item.process}</div>
              <div>{item.host}</div>
            </div>
          ))}
        </div>
      </div>

      <LogFeedModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        logFeedData={logFeedData}
      />
    </div>
  );
};

export default SystemNetworkMonitoring;
