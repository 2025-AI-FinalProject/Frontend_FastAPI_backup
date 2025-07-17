// Mainpage.tsx
import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import {
  Plug,
  PlugZap,
  Link as LinkIcon,
  RefreshCw,
} from "lucide-react";
import TrafficChart from "../components/TrafficChart";
import SystemChart from "../components/SystemChart";

// --- API URL 상수 정의 ---
const API_DATADB_URL = import.meta.env.VITE_API_DATADB_URL;
const API_TRAFFIC_OVER_TIME_URL = `${API_DATADB_URL}/api/dashboard/traffic/traffic-over-time`;
const API_TRAFFIC_STATS_URL = `${API_DATADB_URL}/api/dashboard/traffic/stats`;
const API_LOGS_STATS_URL = `${API_DATADB_URL}/api/dashboard/logs/stats`;

// --- 인터페이스 정의 ---
interface TrafficHistoryItem {
  time: string;
  bytesPerSecond: number;
  packetsPerSecond: number;
}
interface PieDataItem {
  name: string;
  value: number;
}
interface LogStats {
  total_threats: number;
  top_threat_type: string;
  distribution: { type: string; count: number }[];
  threat_type_count: number;
}

const getCurrentTimeLabel = (baseDate?: Date): string => {
  const now = baseDate ?? new Date();
  const minutes = Math.floor(now.getMinutes() / 10) * 10;
  return `${now.getHours().toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}`;
};

const Mainpage: React.FC = () => {
  // === 네트워크 트래픽 상태 ===
  const [apiLastSecondPackets, setApiLastSecondPackets] = useState<number>(0);
  const [apiLastSecondBytes, setApiLastSecondBytes] = useState<number>(0);
  const [trafficHistory, setTrafficHistory] = useState<TrafficHistoryItem[]>([]);
  const [graphType, setGraphType] = useState<"bytes" | "packets">("bytes");
  const [isConnected, setIsConnected] = useState<boolean | null>(null);

  // === 오른쪽 영역(시스템+위협 통계) 상태 ===
  const [pieData, setPieData] = useState<PieDataItem[]>([
    { name: "DCOM 공격", value: 0 },
    { name: "DLL 하이재킹", value: 0 },
    { name: "WMI 공격", value: 0 },
    { name: "방어 회피", value: 0 },
    { name: "원격 서비스 공격 (일반)", value: 0 },
    { name: "원격 서비스 공격 (WinRM)", value: 0 },
    { name: "원격 서비스 악용", value: 0 },
    { name: "지속성 (계정 생성)", value: 0 },
    { name: "스케줄 작업 공격", value: 0 },
  ]);

  const [logData, setLogData] = useState<{ time: string; value: number }[]>(
    Array.from({ length: 6 }).map((_, i) => {
      const date = new Date(new Date().getTime() - (5 - i) * 10 * 60 * 1000);
      return { time: getCurrentTimeLabel(date), value: 0 };
    })
  );

  const [rightIsConnected, setRightIsConnected] = useState<boolean | null>(null);

  // === 네트워크 관련 유틸 ===
  const bytesToLargestUnit = useCallback(
    (bytes: number, includeUnit: boolean = true): string => {
      if (bytes === 0) return includeUnit ? "0 B" : "0";
      const units = ["B", "KB", "MB", "GB", "TB"];
      const i = Math.floor(Math.log(bytes) / Math.log(1024));
      const value = (bytes / Math.pow(1024, i)).toFixed(1);
      return includeUnit ? `${value} ${units[i]}` : value;
    },
    []
  );

  const formatTimeOnly = useCallback((date: Date): string => {
    const pad = (n: number) => n.toString().padStart(2, "0");
    return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  }, []);

  const toggleGraphType = useCallback(() => {
    setGraphType((prev) => (prev === "bytes" ? "packets" : "bytes"));
  }, []);

  // === 오른쪽 영역 데이터 메모 ===
  const mostFrequentThreat = useMemo(() => {
    const totalValue = pieData.reduce((acc, item) => acc + item.value, 0);
    if (pieData.length === 0 || totalValue === 0) return "-";
    const maxThreat = pieData.reduce((prev, current) =>
      prev.value > current.value ? prev : current
    );
    if (maxThreat.value === 0) return "-";
    return maxThreat.name;
  }, [pieData]);

  const detectedThreatTypesCount = useMemo(() => {
    const activeThreats = pieData.filter((item) => item.value > 0);
    return activeThreats.length === 0 ? 0 : activeThreats.length;
  }, [pieData]);

  // === API 데이터 요청 함수 ===
  const fetchTrafficData = useCallback(async () => {
    try {
      if (!API_DATADB_URL) {
        console.error("API_DATADB_URL이 정의되지 않음");
        setIsConnected(false);
        return;
      }

      const [statsResponse, overTimeResponse] = await Promise.allSettled([
        fetch(API_TRAFFIC_STATS_URL),
        fetch(API_TRAFFIC_OVER_TIME_URL),
      ]);

      let connected = false;

      if (
        overTimeResponse.status === "fulfilled" &&
        overTimeResponse.value.ok
      ) {
        const overTimeData = await overTimeResponse.value.json();

        const newTrafficHistory: TrafficHistoryItem[] = overTimeData.timestamps.map(
          (ts: string, index: number) => ({
            time: formatTimeOnly(new Date(ts)),
            bytesPerSecond: overTimeData.bytes_per_second[index] || 0,
            packetsPerSecond: overTimeData.packets_per_second[index] || 0,
          })
        );

        setTrafficHistory((prev) => {
          const combined = [...prev, ...newTrafficHistory];
          return combined.slice(-9);
        });

        const lastIndex = overTimeData.timestamps.length - 1;
        if (lastIndex >= 0) {
          setApiLastSecondPackets(
            overTimeData.packets_per_second[lastIndex] || 0
          );
          setApiLastSecondBytes(overTimeData.bytes_per_second[lastIndex] || 0);
        } else {
          setApiLastSecondPackets(0);
          setApiLastSecondBytes(0);
        }

        connected = true;
      } else {
        console.error("traffic-over-time API 오류", overTimeResponse);
        setTrafficHistory([]);
        setApiLastSecondPackets(0);
        setApiLastSecondBytes(0);
      }

      if (statsResponse.status === "fulfilled" && statsResponse.value.ok) {
        connected = true;
      } else {
        console.error("traffic/stats API 오류", statsResponse);
      }

      setIsConnected(connected);
    } catch (err) {
      console.error("API 호출 실패", err);
      setIsConnected(false);
      setTrafficHistory([]);
      setApiLastSecondPackets(0);
      setApiLastSecondBytes(0);
    }
  }, [formatTimeOnly]);

  const fetchStatsAndChartData = useCallback(async () => {
    try {
      if (!API_DATADB_URL) {
        setRightIsConnected(false);
        return;
      }
      const res = await fetch(API_LOGS_STATS_URL);
      if (!res.ok) {
        setRightIsConnected(false);
        return;
      }
      const data: LogStats = await res.json();

      setPieData((prevPieData) => {
        const map = new Map(
          prevPieData.map((item) => [item.name, { ...item, value: 0 }])
        );
        data.distribution.forEach((apiItem) => {
          map.set(apiItem.type, { name: apiItem.type, value: apiItem.count });
        });
        const updated = Array.from(map.values());
        updated.sort((a, b) => b.value - a.value);
        return updated;
      });

      const now = new Date();
      setLogData((prevLogData) => {
        const updatedLogData = Array.from({ length: 6 }).map((_, i) => {
          const date = new Date(now.getTime() - (5 - i) * 10 * 60 * 1000);
          return {
            time: getCurrentTimeLabel(date),
            value: data.threat_type_count,
          };
        });

        // 깊은 비교
        const isSame =
          prevLogData.length === updatedLogData.length &&
          prevLogData.every(
            (item, idx) =>
              item.time === updatedLogData[idx].time && item.value === updatedLogData[idx].value
          );

        return isSame ? prevLogData : updatedLogData;
      });

      setRightIsConnected(true);
    } catch (error) {
      console.error("통계 및 차트 데이터 가져오기 실패:", error);
      setRightIsConnected(false);
      setPieData((prev) => prev.map((item) => ({ ...item, value: 0 })));
      setLogData(
        Array.from({ length: 6 }).map((_, i) => {
          const date = new Date(new Date().getTime() - (5 - i) * 10 * 60 * 1000);
          return { time: getCurrentTimeLabel(date), value: 0 };
        })
      );
    }
  }, []);

  // === 주기적 데이터 갱신 ===
  useEffect(() => {
    fetchTrafficData();
    const interval = setInterval(fetchTrafficData, 3000);
    return () => clearInterval(interval);
  }, [fetchTrafficData]);

  useEffect(() => {
    fetchStatsAndChartData();
    const interval = setInterval(fetchStatsAndChartData, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchStatsAndChartData]);

  // === 새로고침 버튼 핸들러 ===
  const handleRefresh = useCallback(() => {
    // 네트워크 쪽 초기화
    setApiLastSecondPackets(0);
    setApiLastSecondBytes(0);
    setTrafficHistory([]);
    setIsConnected(null);
    setGraphType("bytes");

    // 오른쪽 영역 초기화
    setPieData((prev) => prev.map((item) => ({ ...item, value: 0 })));
    setLogData(
      Array.from({ length: 6 }).map((_, i) => {
        const date = new Date(new Date().getTime() - (5 - i) * 10 * 60 * 1000);
        return { time: getCurrentTimeLabel(date), value: 0 };
      })
    );
    setRightIsConnected(null);

    fetchTrafficData();
    fetchStatsAndChartData();
  }, [fetchTrafficData, fetchStatsAndChartData]);

  // === 상태 아이콘 및 텍스트 ===
  const getStatusIcon = useCallback(() => {
    if (isConnected === true) return <Plug className="w-4 h-4 mr-1" />;
    if (isConnected === false) return <PlugZap className="w-4 h-4 mr-1" />;
    return <LinkIcon className="w-4 h-4 mr-1" />;
  }, [isConnected]);

  const getStatusText = useCallback(() => {
    if (isConnected === true) return "연결 됨";
    if (isConnected === false) return "연결 끊김";
    return "연결 상태";
  }, [isConnected]);

  const getRightStatusIcon = useCallback(() => {
    if (rightIsConnected === true) return <Plug className="w-4 h-4 mr-1" />;
    if (rightIsConnected === false) return <PlugZap className="w-4 h-4 mr-1" />;
    return <LinkIcon className="w-4 h-4 mr-1" />;
  }, [rightIsConnected]);

  const getRightStatusText = useCallback(() => {
    if (rightIsConnected === true) return "연결 됨";
    if (rightIsConnected === false) return "연결 끊김";
    return "연결 상태";
  }, [rightIsConnected]);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-2"> {/* flexbox 추가 */}
        <h1 className="text-2xl font-semibold">
          실시간 모니터링 요약을 알려드립니다🥳
        </h1>
        <button
          onClick={handleRefresh}
          className="flex items-center text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded px-3 py-2 h-9 shadow-sm"
        >
          <RefreshCw className="w-4 h-4 mr-1" /> 새로고침
        </button>
      </div>

      {/* 하단 요약 영역 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6 h-full">
        {/* 왼쪽 영역 */}
        <div className="bg-white rounded shadow-md p-4 flex flex-col gap-4 h-full">
          {/* 헤더 */}
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">네트워크 요약</h2>
            <div className="flex gap-2">
              <button className="flex items-center text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded px-3 py-2 h-9 shadow-sm">
                {getStatusIcon()}
                {getStatusText()}
              </button>
            </div>
          </div>

          {/* 카드 2개 */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded border border-gray-200 text-center">
              <div className="text-sm text-gray-600">초당 흐름</div>
              <div className="font-bold mt-2 text-xl">
                {apiLastSecondPackets.toLocaleString("ko-KR")} 개/s
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded border border-gray-200 text-center">
              <div className="text-sm text-gray-600">초당 바이트</div>
              <div className="font-bold mt-2 text-xl">
                {bytesToLargestUnit(apiLastSecondBytes)}
              </div>
            </div>
          </div>

          {/* 트래픽 그래프 */}
          <TrafficChart
            graphType={graphType}
            trafficHistory={trafficHistory}
            toggleGraphType={toggleGraphType}
            bytesToLargestUnit={bytesToLargestUnit}
          />
        </div>

        {/* 오른쪽 영역 */}
        <div className="bg-white rounded shadow-md p-4 flex flex-col gap-4 h-full">
          {/* 헤더 + 상태 */}
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">시스템 요약</h2>
            <div className="flex gap-2">
              <div className="flex items-center text-sm bg-gray-100 rounded px-3 py-2 h-9 shadow-sm text-gray-700">
                {getRightStatusIcon()}
                {getRightStatusText()}
              </div>
            </div>
          </div>

          {/* 상단 카드 */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded border border-gray-200 text-center">
              <div className="text-sm text-gray-600">최다 발생 위협 유형</div>
              <div className="font-bold mt-2 text-black text-lg">
                {mostFrequentThreat}
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded border border-gray-200 text-center">
              <div className="text-sm text-gray-600">탐지된 위협 종류</div>
              <div className="font-bold mt-2 text-black text-lg">
                {detectedThreatTypesCount}건
              </div>
            </div>
          </div>

          {/* 차트 */}
          <div className="flex-grow">
            <SystemChart data={logData} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Mainpage;