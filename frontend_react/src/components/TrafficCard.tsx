import React, { useState, useEffect } from "react";
import {
    LineChart,          // 선형 차트 컨테이너 컴포넌트
    Line,               // 실제 선 그래프를 그리는 컴포넌트
    XAxis,              // X축 (가로축)을 렌더링하는 컴포넌트
    YAxis,              // Y축 (세로축)을 렌더링하는 컴포넌트
    ResponsiveContainer, // 차트가 부모 요소의 크기에 맞춰 반응형으로 동작하도록 하는 컴포넌트
    Tooltip,            // 마우스 오버 시 데이터 정보를 표시하는 툴팁 컴포넌트
} from "recharts";      // Recharts 라이브러리에서 필요한 컴포넌트들을 임포트합니다.

// TrafficCard 컴포넌트의 props 타입을 정의합니다.
interface TrafficCardProps {
    refreshTrigger: number; // 데이터를 새로 고칠 시점을 알리는 트리거 (값이 변경될 때마다 useEffect 실행)
    title: string;          // 카드에 표시될 제목
    unit?: string;          // 데이터 값에 추가될 단위 (선택 사항, 기본값은 빈 문자열)
}

// 차트 데이터 포인트의 타입을 정의합니다.
interface DataPoint {
    time: string;   // 시간 (X축)
    value: number;  // 값 (Y축)
}

// 차트에 표시될 최대 데이터 포인트 개수를 상수로 정의합니다.
const MAX_DATA_LENGTH = 20;

// --- TrafficCard 컴포넌트 정의 ---
// 실시간 트래픽 데이터를 선형 차트로 시각화하여 보여주는 카드 컴포넌트입니다.
// `refreshTrigger` prop이 변경될 때마다 새로운 더미 데이터를 추가하고,
// `MAX_DATA_LENGTH`를 초과하면 가장 오래된 데이터를 제거하여 차트를 업데이트합니다.
const TrafficCard: React.FC<TrafficCardProps> = ({ refreshTrigger, title, unit = "" }) => {
    // `data` 상태: 차트에 표시될 데이터 포인트 배열을 관리합니다.
    // 초기에는 `MAX_DATA_LENGTH`만큼의 더미 데이터를 생성하여 설정합니다.
    const [data, setData] = useState<DataPoint[]>(() =>
        Array.from({ length: MAX_DATA_LENGTH }, (_, i) => ({
            time: `${i * 2}s`, // 각 데이터 포인트의 시간을 "0s", "2s", "4s"... 형식으로 설정
            value: Math.floor(Math.random() * 1000), // 0부터 999 사이의 랜덤 값 생성
        }))
    );

    /**
     * `refreshTrigger` prop이 변경될 때마다 새 데이터를 추가하는 `useEffect` 훅입니다.
     * 새로운 데이터를 차트의 끝에 추가하고, `MAX_DATA_LENGTH`를 초과하면
     * 가장 오래된 데이터를 배열의 앞에서 제거하여 차트가 계속 업데이트되도록 합니다 (슬라이딩 윈도우).
     */
    useEffect(() => {
        // 현재 데이터 배열의 마지막 시간 값을 가져옵니다. (없으면 0으로 초기화)
        const lastTime = data.length > 0 ? parseInt(data[data.length - 1].time) : 0;
        // 새로운 데이터 포인트를 생성합니다. (시간은 이전 시간 + 2초, 값은 랜덤)
        const newPoint: DataPoint = {
            time: `${lastTime + 2}s`,
            value: Math.floor(Math.random() * 1000),
        };

        // `setData` 함수에 함수형 업데이트를 사용하여 이전 상태를 기반으로 새 상태를 계산합니다.
        setData((prev) => {
            const updated = [...prev, newPoint]; // 기존 데이터에 새 포인트 추가
            // 데이터 길이가 `MAX_DATA_LENGTH`를 초과하면 가장 오래된 데이터(첫 번째 요소)를 제거합니다.
            if (updated.length > MAX_DATA_LENGTH) {
                updated.shift(); // 배열의 첫 번째 요소 제거
            }
            return updated; // 업데이트된 데이터 배열 반환
        });
    }, [refreshTrigger]); // `refreshTrigger` 값이 변경될 때마다 이 이펙트가 다시 실행됩니다.

    // 현재 차트의 가장 마지막 데이터 포인트의 값(value)을 가져옵니다. (데이터가 없으면 0)
    const lastValue = data[data.length - 1]?.value ?? 0;

    // --- TrafficCard UI 렌더링 ---
    return (
        <div className="bg-gray-50 border border-gray-200 rounded-md shadow-md hover:shadow-lg transition px-4 pt-4 pb-2 text-sm min-h-[260px] w-full flex flex-col justify-between">
            {/* 카드 헤더: 제목과 현재 값 표시 */}
            <div className="flex items-start justify-between mb-2">
                <div className="font-semibold">{title}</div> {/* 카드 제목 */}
                <div className="text-sm font-medium text-gray-600">
                    {lastValue.toLocaleString()} {unit} {/* 현재 값과 단위를 로케일 형식으로 표시 */}
                </div>
            </div>

            {/* 차트 영역: Flexbox를 사용하여 하단에 정렬 및 공간 활용 */}
            <div className="flex-1 flex items-end pr-5">
                {/* ResponsiveContainer: 차트가 부모 요소의 크기에 맞춰 크기를 조절하도록 합니다. */}
                <ResponsiveContainer width="100%" height="100%">
                    {/* LineChart: 실제 선형 차트를 그립니다. `data` prop으로 데이터를 전달합니다. */}
                    <LineChart data={data} margin={{ top: 10, right: 10, bottom: 0, left: -10 }}>
                        {/* XAxis: 시간(`dataKey="time"`)을 표시하는 X축입니다. 폰트 크기 조정. */}
                        <XAxis dataKey="time" tick={{ fontSize: 10 }} />
                        {/* YAxis: 값(`value`)을 표시하는 Y축입니다. 폰트 크기 조정. */}
                        <YAxis tick={{ fontSize: 10 }} />
                        {/* Tooltip: 마우스 오버 시 데이터 상세 정보를 보여줍니다. */}
                        <Tooltip />
                        {/* Line: 실제 선 그래프를 그립니다. */}
                        <Line
                            type="monotone" // 선의 종류 (부드러운 곡선)
                            dataKey="value" // 그래프에 사용할 데이터 키 (Y축 값)
                            stroke="#B9CDFF" // 선의 색상
                            strokeWidth={2} // 선의 두께
                            dot={false}     // 각 데이터 포인트에 점을 표시하지 않음
                            isAnimationActive={true} // 데이터 업데이트 시 애니메이션 활성화
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default TrafficCard;