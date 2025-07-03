import React, { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

interface Props {
  title: string;
  unit?: string; // ✅ 단위 props 추가
  chartAscii?: string;
}

const TrafficCard: React.FC<Props> = ({ title, unit = "" }) => {
  // 더미 데이터 생성 (최초 1회만)
  const dummyData = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => ({
      time: `${i * 5}s`,
      value: Math.floor(Math.random() * 1000),
    }));
  }, []);

  // 마지막 값 추출
  const lastValue = dummyData[dummyData.length - 1]?.value ?? 0;

  return (
    <div className="border rounded-md bg-white px-4 pt-4 pb-2 shadow text-sm min-h-[260px] w-full flex flex-col justify-between">
      {/* 타이틀 + 마지막 값 (우측 상단) */}
      <div className="flex items-start justify-between mb-2">
        <div className="font-semibold">{title}</div>
        <div className="text-sm font-medium text-gray-600">
          {lastValue.toLocaleString()} {unit}
        </div>
      </div>

      {/* 그래프 */}
      <div className="flex-1 flex items-end pr-5">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={dummyData}
            margin={{ top: 10, right: 10, bottom: 0, left: -10 }}
          >
            <XAxis dataKey="time" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip />
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
    </div>
  );
};

export default TrafficCard;
