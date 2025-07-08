import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

interface TrafficCardProps {
  refreshTrigger: number;
  title: string;
  unit?: string;
}

interface DataPoint {
  time: string;
  value: number;
}

const MAX_DATA_LENGTH = 20;

const TrafficCard: React.FC<TrafficCardProps> = ({ refreshTrigger, title, unit = "" }) => {
  // 초기 더미 데이터 20개 생성 (시간 1초 간격)
  const [data, setData] = useState<DataPoint[]>(() =>
    Array.from({ length: MAX_DATA_LENGTH }, (_, i) => ({
      time: `${i * 2}s`,
      value: Math.floor(Math.random() * 1000),
    }))
  );

  useEffect(() => {
    // refreshTrigger가 바뀔 때마다 새 데이터 추가
    const lastTime = data.length > 0 ? parseInt(data[data.length - 1].time) : 0;
    const newPoint: DataPoint = {
      time: `${lastTime + 2}s`,
      value: Math.floor(Math.random() * 1000),
    };

    setData((prev) => {
      const updated = [...prev, newPoint];
      if (updated.length > MAX_DATA_LENGTH) {
        updated.shift();
      }
      return updated;
    });
  }, [refreshTrigger]);

  const lastValue = data[data.length - 1]?.value ?? 0;

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-md shadow-md hover:shadow-lg transition px-4 pt-4 pb-2 text-sm min-h-[260px] w-full flex flex-col justify-between">
      <div className="flex items-start justify-between mb-2">
        <div className="font-semibold">{title}</div>
        <div className="text-sm font-medium text-gray-600">
          {lastValue.toLocaleString()} {unit}
        </div>
      </div>

      <div className="flex-1 flex items-end pr-5">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, bottom: 0, left: -10 }}>
            <XAxis dataKey="time" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#B9CDFF"
              strokeWidth={2}
              dot={false}
              isAnimationActive={true}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default TrafficCard;
