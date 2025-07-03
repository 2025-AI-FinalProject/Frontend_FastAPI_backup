import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from "recharts";

const data = [
  { name: "Linux", value: 20 },
  { name: "Mac", value: 23 },
  { name: "iOS", value: 21 },
  { name: "Windows", value: 25 },
  { name: "Android", value: 12 },
  { name: "Other", value: 23 }
];

const colors = [
  "#6366F1", // Linux - indigo-500
  "#86EFAC", // Mac - green-300
  "#A3A3A3", // iOS - neutral-400
  "#7DD3FC", // Windows - sky-300
  "#93C5FD", // Android - blue-300
  "#6EE7B7"  // Other - emerald-300
];

const AttackChart: React.FC = () => {
  const [activeIndex, setActiveIndex] = React.useState<number | null>(null);

  return (
    <div className="w-full p-4 rounded-lg bg-gray-50">
      <h2 className="text-lg font-semibold mb-4">위협 통계 분석</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={data}
          barCategoryGap="60%" // 막대 사이 여백을 크게 → 막대 가늘게
          onMouseLeave={() => setActiveIndex(null)}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="name" tick={{ fill: "#9CA3AF" }} />
          <YAxis
            tick={{ fill: "#9CA3AF" }}
            domain={[0, 30]}
            ticks={[0, 10, 20, 30]}
            unit="M"
          />
          <Tooltip
            cursor={{ fill: "rgba(156, 163, 175, 0.1)" }}
            formatter={(value: number) => `${value}M`}
          />
          <Bar
            dataKey="value"
            isAnimationActive
            radius={[4, 4, 0, 0]} // 위쪽 모서리 둥글게
            onMouseOver={(_, index) => setActiveIndex(index)}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={
                  activeIndex === index
                    ? `${colors[index % colors.length]}`
                    : `${colors[index % colors.length]}80` // hover 아닌 막대는 반투명
                }
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AttackChart;
