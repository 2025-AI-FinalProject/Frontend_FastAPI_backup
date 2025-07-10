import React, { useState, useEffect, useMemo } from "react";
import { Link as LinkIcon, Plug, PlugZap, RefreshCw } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from "recharts";
import LogFeedModal from "../components/LogFeedModal";

// 현재 시각을 기준으로 10분 단위 라벨 생성
const getCurrentTimeLabel = (baseDate?: Date): string => {
  const now = baseDate ?? new Date();
  const minutes = Math.floor(now.getMinutes() / 10) * 10;
  return `${now.getHours().toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}`;
};

// 파스텔 색상
const pastelColors: string[] = [
  "#CEDBD9",
  "#FFCCBC",
  "#D9D1D9",
  "#D4EDDA",
  "#BED7DD",
  "#FFF5CC",
  "#C3B1C5",
  "#BBDCDC",
  "#FFB3A7",
];

interface PieDataItem {
  name: string;
  value: number;
}

const SystemNetworkMonitoring: React.FC = () => {
  const [logData, setLogData] = useState<{ time: string; value: number }[]>([
    { time: "00:00", value: 2 },
    { time: "00:10", value: 5 },
    { time: "00:20", value: 8 },
    { time: "00:30", value: 3 },
    { time: "00:40", value: 6 },
    { time: "00:50", value: 1 },
  ]);

  const [pieData, setPieData] = useState<PieDataItem[]>([
    { name: "DCOM공격", value: 1 },
    { name: "DLL 하이재킹", value: 1 },
    { name: "WMI 공격", value: 1 },
    { name: "방어 회피", value: 1 },
    { name: "원격 서비스 공격(일반)", value: 1 },
    { name: "원격 서비스 공격(WinRM)", value: 1 },
    { name: "원격 서비스 악용", value: 1 },
    { name: "지속성(계정 생성)", value: 1 },
    { name: "스케줄 작업 공격", value: 1 },
  ]);

  const [logFeedData, setLogFeedData] = useState(
    Array.from({ length: 100 }).map((_, i) => ({
      time: new Date(Date.now() - i * 1000 * 60).toISOString(),
      status: "정상",
      result: "-",
      ip: `192.168.0.${i % 255}`,
      process: "svchost.exe",
      host: `host-${i}`,
    }))
  );

  const [baseTime, setBaseTime] = useState<Date>(new Date());
  const [activeLineIndex, setActiveLineIndex] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConnected, setIsConnected] = useState<boolean | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setLogData((prev) => {
        const lastTimeStr = prev.length
          ? prev[prev.length - 1].time
          : getCurrentTimeLabel(baseTime);
        const [h, m] = lastTimeStr.split(":").map(Number);
        const newDate = new Date(baseTime);
        newDate.setHours(h);
        newDate.setMinutes(m + 10);
        const newTime = getCurrentTimeLabel(newDate);
        return [
          ...prev.slice(-5),
          { time: newTime, value: Math.floor(Math.random() * 10) + 1 },
        ];
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

      setPieData((prev) =>
        prev.map((item, idx) => ({
          ...item,
          // pieData 값을 0이 될 수도 있도록 수정 (테스트용: 모든 값이 0이 될 가능성 포함)
          // 20% 확률로 0, 80% 확률로 1~10 사이 값
          value: Math.random() < 0.2 ? 0 : Math.floor(Math.random() * 10) + 1,
        }))
      );
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
      initialLogData.push({
        time: getCurrentTimeLabel(dt),
        value: Math.floor(Math.random() * 10) + 1,
      });
    }
    setLogData(initialLogData);

    // 새로고침 시 pieData 값을 모두 1로 초기화 (테스트를 위해 모든 값이 0이 되는 상황을 리셋)
    setPieData([
      { name: "DCOM공격", value: 1 },
      { name: "DLL 하이재킹", value: 1 },
      { name: "WMI 공격", value: 1 },
      { name: "방어 회피", value: 1 },
      { name: "원격 서비스 공격(일반)", value: 1 },
      { name: "원격 서비스 공격(WinRM)", value: 1 },
      { name: "원격 서비스 악용", value: 1 },
      { name: "지속성(계정 생성)", value: 1 },
      { name: "스케줄 작업 공격", value: 1 },
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
    "DCOM공격": "DCOM 취약점을 이용한 공격입니다.",
    "DLL 하이재킹": "정상 DLL을 교체하여 악성 코드를 실행시키는 기법입니다.",
    "WMI 공격": "WMI를 이용한 원격 명령 실행 또는 정보 수집입니다.",
    "방어 회피": "탐지 우회를 위한 다양한 기술입니다.",
    "원격 서비스 공격(일반)": "RDP 등 일반 서비스의 원격 공격입니다.",
    "원격 서비스 공격(WinRM)": "WinRM을 활용한 명령 실행 공격입니다.",
    "원격 서비스 악용": "기존 원격 서비스를 악용하는 행위입니다.",
    "지속성(계정 생성)": "계정 생성을 통한 시스템 지속 접근 시도입니다.",
    "스케줄 작업 공격": "스케줄러 등록을 통한 악성코드 실행입니다.",
  };

  const pieTotal = pieData.reduce((acc, item) => acc + item.value, 0);

  const calculateRoundedWidths = useMemo(() => (
    (data: PieDataItem[], totalContainerPixels: number, minPixelWidth: number = 2): number[] => { // minPixelWidth 인자 추가
      // pieTotal이 0이거나 데이터가 없을 때, 각 아이템에 minPixelWidth를 할당
      if (pieTotal === 0 || data.length === 0) {
        // totalContainerPixels를 각 아이템에 균등하게 분배 (minPixelWidth 이상이 되도록)
        const baseWidth = Math.max(minPixelWidth, totalContainerPixels / Math.max(1, data.length));
        return data.map(() => baseWidth);
      }

      let rawPixels = data.map(item => (item.value / pieTotal) * totalContainerPixels);
      let roundedPixels = rawPixels.map(p => Math.round(p));

      // 0으로 반올림된 값들에 minPixelWidth 적용
      roundedPixels = roundedPixels.map(p => p === 0 ? minPixelWidth : p);

      let currentSum = roundedPixels.reduce((acc, width) => acc + width, 0);
      let difference = totalContainerPixels - currentSum;

      // minPixelWidth 적용 후에도 총합이 달라질 수 있으므로, 재조정 필요
      // 다만, 여기서는 차이가 크게 나지 않는 한도 내에서 처리 (모든 항목에 minWidth 적용하면 총합이 크게 늘어날 수 있음)

      // 이 부분은 전체 너비를 넘지 않도록 조정하는 로직
      // minPixelWidth가 적용되어 실제 합계가 totalContainerPixels를 초과할 가능성이 있습니다.
      // 이를 방지하려면 minPixelWidth 적용 로직을 더 복잡하게 가져가거나,
      // 단순히 시각적인 최소 너비로만 사용하고 실제 계산은 rawPixels 기반으로 하는 것이 좋습니다.
      // 여기서는 시각적인 목적을 위해 `finalBarPixelWidths`가 0일 때 `minWidth`를 강제 적용하는 방식으로 가겠습니다.
      // 따라서 calculateRoundedWidths는 원래대로 0을 반환할 수 있도록 유지합니다.
      
      // 원래 로직 유지: 0으로 반올림되는 경우 그대로 0을 반환
      // minWidth 적용은 렌더링 단계에서 진행 (아래 finalBarPixelWidths 계산 후)
      rawPixels = data.map(item => (item.value / pieTotal) * totalContainerPixels);
      roundedPixels = rawPixels.map(p => Math.round(p));

      currentSum = roundedPixels.reduce((acc, width) => acc + width, 0);
      difference = totalContainerPixels - currentSum;

      let sortedIndices = rawPixels
        .map((value, index) => ({ value: value, index: index }))
        .sort((a, b) => b.value - a.value);

      if (sortedIndices.length === 0) {
        return data.map(() => 0); // 데이터가 없으므로 0 반환
      }

      const numAdjustments = Math.abs(difference);
      for (let i = 0; i < numAdjustments; i++) {
        const targetIndex = sortedIndices[i % sortedIndices.length].index;
        if (difference > 0) {
          roundedPixels[targetIndex]++;
        } else {
          roundedPixels[targetIndex] = Math.max(0, roundedPixels[targetIndex] - 1);
        }
      }

      return roundedPixels;
    }
  ), [pieData, pieTotal]); // pieData와 pieTotal에 의존함을 명시

  const FIXED_BAR_CHART_WIDTH = 570;
  const rawPixelWidths = calculateRoundedWidths(pieData, FIXED_BAR_CHART_WIDTH);

  // 렌더링 시점에 최소 너비 적용
  const finalBarPixelWidths = useMemo(() => {
    if (pieTotal === 0 || pieData.length === 0) {
      // 총합이 0이거나 데이터가 없을 경우, 모든 바에 균등하게 최소 너비 할당
      const minWidthPerItem = Math.max(2, Math.floor(FIXED_BAR_CHART_WIDTH / Math.max(1, pieData.length)));
      const widths = pieData.map(() => minWidthPerItem);
      // 총 너비를 넘지 않도록 마지막 요소만 조정 (약간의 오차는 감수)
      const currentTotal = widths.reduce((sum, w) => sum + w, 0);
      if (currentTotal > FIXED_BAR_CHART_WIDTH && widths.length > 0) {
        widths[widths.length - 1] = Math.max(2, widths[widths.length - 1] - (currentTotal - FIXED_BAR_CHART_WIDTH));
      }
      return widths;
    } else {
      // 데이터가 있을 경우, calculateRoundedWidths 결과 사용 (0px인 경우 minWidth 적용)
      return rawPixelWidths.map(px => px === 0 ? 2 : px); // 여기서 2px를 최소 너비로 강제 적용
    }
  }, [rawPixelWidths, pieTotal, pieData.length]);


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
          { label: "총 탐지된 위협", value: "0", valueClass: "text-red-400 text-2xl" },
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
            <div className="text-gray-600 font-semibold">시간대별 위협 발생 추이</div>
            <div className="text-gray-400 text-xs">최근 1시간 내 위협 발생 추이입니다.</div>
          </div>
          <ResponsiveContainer width="100%" height={230}>
            <LineChart data={logData} margin={{ left: -20, right: 25, top: 10, bottom: -10 }}>
              <XAxis dataKey="time" stroke="#999" />
              <YAxis domain={[1, 10]} ticks={[2, 4, 6, 8, 10]} stroke="#999" />
              <Line type="monotone" dataKey="value" stroke="#B9CDFF" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-gray-50 p-4 rounded border border-gray-200 shadow-md hover:shadow-lg hover:border-gray-300 transition focus:outline-none flex flex-col" tabIndex={-1}>
          <div className="mt-[1px] text-gray-600 font-semibold leading-tight">위협 유형별 분포</div>
          <div
            className="h-[30px] w-[570px] rounded overflow-hidden mt-5 flex"
          >
            {pieData.map((item, index) => {
              // pieTotal이 0이 아닌 경우에만 개별 값 표시, 0일 경우 minWidth 적용된 값 사용
              const pixelWidth = finalBarPixelWidths[index];
              const barTitle = pieTotal === 0 ? "데이터 없음" : `${item.name}: ${item.value}`;
              return (
                <div
                  key={item.name}
                  style={{
                    width: `${pixelWidth}px`,
                    // pieTotal이 0일 경우 모든 바를 회색조로 표시하여 데이터 없음 상태 시각화
                    backgroundColor: pieTotal === 0 ? "#E0E0E0" : pastelColors[index % pastelColors.length],
                    flexShrink: 0, // flex 아이템이 축소되지 않도록 함
                  }}
                  title={barTitle}
                />
              );
            })}
          </div>
          <div className="mt-6 h-[180px] text-sm text-gray-700 space-y-2 border border-gray-200 p-3 rounded overflow-y-auto">
            {pieTotal === 0 ? (
              <div className="text-center text-gray-500 py-4">
                탐지된 위협 데이터가 없습니다.
              </div>
            ) : (
              pieData.map((item, idx) => (
                <div key={item.name} className="flex items-start gap-2">
                  <div className="w-3 h-3 mt-1 rounded-sm shrink-0" style={{ backgroundColor: pastelColors[idx % pastelColors.length] }} />
                  <div>
                    <span className="font-semibold">{item.name}</span>:{" "}
                    {threatDescriptions[item.name] ?? "설명이 없습니다."}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded border border-gray-200 shadow-md transition flex flex-col flex-grow overflow-hidden">
        <div className="shrink-0 flex items-center justify-between">
          <div className="text-gray-600 font-semibold mb-2 pl-1">실시간 로그 피드</div>
          <button className="text-xs text-gray-600 underline mb-2 mr-1" type="button" onClick={() => setIsModalOpen(true)}>
            더보기
          </button>
        </div>
        <div className="grid grid-cols-6 gap-2 text-sm font-semibold text-gray-700 border-b border-gray-200 pb-2">
          <div className="ml-13">수집 시각</div>
          <div className="ml-13">상태</div>
          <div className="ml-3">위협 결과</div>
          <div className="ml-6">발생 IP</div>
          <div className="ml-1">프로세스명</div>
          <div className="ml-1">호스트명</div>
        </div>
        <div className="overflow-y-auto flex-grow">
          {logFeedData.slice(0, 7).map((item, index) => (
            <div
              key={index}
              className={`grid grid-cols-6 gap-2 text-sm border-b border-gray-100 py-1.5 cursor-default ${
                item.status === "위협" ? "text-red-400 font-semibold" : "text-gray-600"
              }`}
            >
              <div title={item.time}>{new Date(item.time).toLocaleString()}</div>
              <div className="ml-13">{item.status}</div>
              <div>{item.result}</div>
              <div>{item.ip}</div>
              <div>{item.process}</div>
              <div>{item.host}</div>
            </div>
          ))}
        </div>
      </div>

      <LogFeedModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} logFeedData={logFeedData} />
    </div>
  );
};

export default SystemNetworkMonitoring;