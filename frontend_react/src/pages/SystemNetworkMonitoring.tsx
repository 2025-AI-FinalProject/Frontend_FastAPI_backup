import React, { useState, useEffect, useMemo } from "react";
import { Link as LinkIcon, Plug, PlugZap, RefreshCw } from "lucide-react"; // 아이콘 임포트
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    ResponsiveContainer,
    Tooltip, // Tooltip 컴포넌트 임포트: 차트 데이터 포인트에 대한 정보 표시
} from "recharts";
import LogFeedModal from "../components/LogFeedModal"; // 로그 상세 정보를 보여주는 모달 컴포넌트

// 현재 시각을 기준으로 10분 단위의 시간 레이블을 생성하는 헬퍼 함수
const getCurrentTimeLabel = (baseDate?: Date): string => {
    const now = baseDate ?? new Date(); // 기본값은 현재 시간
    const minutes = Math.floor(now.getMinutes() / 10) * 10; // 분을 10분 단위로 반올림
    // 시간을 "HH:MM" 형식으로 포맷팅 (예: "14:30")
    return `${now.getHours().toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}`;
};

// 차트 및 바 차트에 사용될 파스텔 색상 팔레트
const pastelColors: string[] = [
    "#CEDBD9", // 연한 민트
    "#FFCCBC", // 연한 오렌지
    "#D9D1D9", // 연한 보라
    "#D4EDDA", // 연한 녹색
    "#ADC3B8", // 회색빛 녹색
    "#FFF5CC", // 연한 노랑
    "#C3B1C5", // 보라빛 회색
    "#DDD7BD", // 베이지
    "#FFB3A7", // 연한 빨강
];

// 파이 차트 (여기서는 바 차트로 표현됨) 데이터 항목의 인터페이스 정의
interface PieDataItem {
    name: string; // 위협 유형 이름
    value: number; // 해당 위협 유형의 발생 횟수
}

// SystemNetworkMonitoring 컴포넌트 정의
const SystemNetworkMonitoring: React.FC = () => {
    // 시간대별 로그 데이터를 저장하는 상태. 초기값은 10분 간격의 0 값 데이터
    const [logData, setLogData] = useState<{ time: string; value: number }[]>([
        { time: "00:00", value: 0 },
        { time: "00:10", value: 0 },
        { time: "00:20", value: 0 },
        { time: "00:30", value: 0 },
        { time: "00:40", value: 0 },
        { time: "00:50", value: 0 },
    ]);

    // 위협 유형별 분포 데이터를 저장하는 상태. 초기값은 모든 위협 유형에 대해 0
    const [pieData, setPieData] = useState<PieDataItem[]>([
        { name: "DCOM공격", value: 0 },
        { name: "DLL 하이재킹", value: 0 },
        { name: "WMI 공격", value: 0 },
        { name: "방어 회피", value: 0 },
        { name: "원격 서비스 공격(일반)", value: 0 },
        { name: "원격 서비스 공격(WinRM)", value: 0 },
        { name: "원격 서비스 악용", value: 0 },
        { name: "지속성(계정 생성)", value: 0 },
        { name: "스케줄 작업 공격", value: 0 },
    ]);

    // 실시간 로그 피드 데이터를 저장하는 상태. 초기값으로 100개의 더미 데이터 생성
    const [logFeedData, setLogFeedData] = useState(
        Array.from({ length: 100 }).map((_, i) => ({
            time: new Date(Date.now() - i * 1000 * 60).toISOString(), // 현재 시각에서 과거로 갈수록 시간 감소
            status: "정상", // 기본 상태는 "정상"
            result: "-", // 기본 결과는 "-"
            ip: `192.168.0.${i % 255}`, // 랜덤 IP 주소
            process: "svchost.exe", // 더미 프로세스명
            host: `host-${i}`, // 더미 호스트명
        }))
    );

    // 차트 시간 동기화를 위한 기준 시간 상태
    const [baseTime, setBaseTime] = useState<Date>(new Date());
    // 로그 피드 모달의 열림/닫힘 상태
    const [isModalOpen, setIsModalOpen] = useState(false);
    // 시스템 연결 상태 (true: 연결 됨, false: 연결 끊김, null: 알 수 없음)
    const [isConnected, setIsConnected] = useState<boolean | null>(null);

    // useMemo를 사용하여 pieData가 변경될 때만 최다 발생 위협 유형을 계산
    const mostFrequentThreat = useMemo(() => {
        const totalValue = pieData.reduce((acc, item) => acc + item.value, 0); // 전체 위협 발생 횟수
        if (pieData.length === 0 || totalValue === 0) {
            return "-"; // 데이터가 없거나 총 발생 횟수가 0이면 "-" 반환
        }
        // 가장 큰 value를 가진 위협 유형 찾기
        const maxThreat = pieData.reduce((prev, current) =>
            prev.value > current.value ? prev : current
        );
        if (maxThreat.value === 0) {
            return "-"; // 가장 많이 발생한 위협도 0이면 "-" 반환
        }
        return maxThreat.name; // 최다 발생 위협 유형 이름 반환
    }, [pieData]);

    // useMemo를 사용하여 logData가 변경될 때만 총 탐지된 위협 수를 계산
    const totalDetectedThreats = useMemo(() => {
        return logData.reduce((acc, item) => acc + item.value, 0); // 모든 시간대의 value 합산
    }, [logData]);

    // useMemo를 사용하여 pieData가 변경될 때만 탐지된 위협 종류 개수를 계산
    const detectedThreatTypesCount = useMemo(() => {
        const activeThreats = pieData.filter(item => item.value > 0); // value가 0보다 큰 위협만 필터링
        if (activeThreats.length === 0) {
            return "없음"; // 탐지된 위협이 없으면 "없음" 반환
        }
        return `${activeThreats.length}건`; // 탐지된 위협 종류의 개수 반환
    }, [pieData]);

    // 5초마다 데이터를 업데이트하는 useEffect 훅
    useEffect(() => {
        const interval = setInterval(() => {
            // logData (시간대별 위협 발생 추이) 업데이트
            setLogData((prev) => {
                // 이전 데이터의 마지막 시간 또는 현재 기준 시간으로 새로운 시간 계산
                const lastTimeStr = prev.length
                    ? prev[prev.length - 1].time
                    : getCurrentTimeLabel(baseTime);
                const [h, m] = lastTimeStr.split(":").map(Number);
                const newDate = new Date(baseTime);
                newDate.setHours(h);
                newDate.setMinutes(m + 10); // 10분 추가
                const newTime = getCurrentTimeLabel(newDate); // 새로운 시간 레이블 생성
                // 최신 5개 데이터 유지하고 새 데이터 추가
                return [
                    ...prev.slice(-5),
                    { time: newTime, value: Math.floor(Math.random() * 10) + 1 }, // 1~10 사이의 랜덤 값
                ];
            });

            // logFeedData (실시간 로그 피드) 업데이트
            setLogFeedData((prev) => {
                const newEntry = {
                    time: new Date().toISOString(), // 현재 시각
                    status: Math.random() > 0.7 ? "위협" : "정상", // 30% 확률로 "위협"
                    result: Math.random() > 0.7 ? "의심행위 탐지" : "-", // 30% 확률로 "의심행위 탐지"
                    ip: `192.168.0.${Math.floor(Math.random() * 255)}`, // 랜덤 IP
                    process: "svchost.exe",
                    host: `host-${prev.length}`,
                };
                // 새로운 로그를 맨 앞에 추가하고 총 100개만 유지
                return [newEntry, ...prev].slice(0, 100);
            });

            // pieData (위협 유형별 분포) 업데이트
            setPieData((prev) =>
                prev.map((item) => ({
                    ...item,
                    // 20% 확률로 0, 80% 확률로 1~10 사이의 랜덤 값
                    value: Math.random() < 0.2 ? 0 : Math.floor(Math.random() * 10) + 1,
                }))
            );
        }, 5000); // 5초마다 실행

        // 컴포넌트 언마운트 시 인터벌 정리
        return () => clearInterval(interval);
    }, [baseTime]); // baseTime이 변경될 때만 이펙트 재실행

    // "새로고침" 버튼 클릭 시 호출되는 핸들러
    const handleRefresh = () => {
        const now = new Date(); // 현재 시각으로 기준 시간 재설정
        setBaseTime(now);
        // logData를 초기값(모두 0)으로 재설정하며, 현재 시간 기준으로 10분 간격으로 과거 시간들을 설정
        setLogData([
            { time: getCurrentTimeLabel(new Date(now.getTime() - 50 * 60 * 1000)), value: 0 },
            { time: getCurrentTimeLabel(new Date(now.getTime() - 40 * 60 * 1000)), value: 0 },
            { time: getCurrentTimeLabel(new Date(now.getTime() - 30 * 60 * 1000)), value: 0 },
            { time: getCurrentTimeLabel(new Date(now.getTime() - 20 * 60 * 1000)), value: 0 },
            { time: getCurrentTimeLabel(new Date(now.getTime() - 10 * 60 * 1000)), value: 0 },
            { time: getCurrentTimeLabel(now), value: 0 },
        ]);

        // pieData도 초기값(모두 0)으로 재설정
        setPieData([
            { name: "DCOM공격", value: 0 },
            { name: "DLL 하이재킹", value: 0 },
            { name: "WMI 공격", value: 0 },
            { name: "방어 회피", value: 0 },
            { name: "원격 서비스 공격(일반)", value: 0 },
            { name: "원격 서비스 공격(WinRM)", value: 0 },
            { name: "원격 서비스 악용", value: 0 },
            { name: "지속성(계정 생성)", value: 0 },
            { name: "스케줄 작업 공격", value: 0 },
        ]);

        // logFeedData도 초기화된 더미 데이터로 재설정 (최근 10개만)
        const newLogs = [];
        for (let i = 0; i < 10; i++) {
            const dt = new Date(now);
            dt.setSeconds(dt.getSeconds() - i * 5); // 5초 간격으로 과거 시간 설정
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

    // 연결 상태에 따라 다른 아이콘을 반환하는 함수
    const getStatusIcon = () => {
        if (isConnected === true) return <Plug className="w-4 h-4 mr-1" />; // 연결 됨
        if (isConnected === false) return <PlugZap className="w-4 h-4 mr-1" />; // 연결 끊김
        return <LinkIcon className="w-4 h-4 mr-1" />; // 기본 (알 수 없음)
    };

    // 연결 상태에 따라 다른 텍스트를 반환하는 함수
    const getStatusText = () => {
        if (isConnected === true) return "연결 됨";
        if (isConnected === false) return "연결 끊김";
        return "연결 상태"; // 기본 (알 수 없음)
    };

    // 각 위협 유형에 대한 설명을 담고 있는 객체
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

    // pieData의 모든 value 합계 (바 차트 너비 계산에 사용)
    const pieTotal = pieData.reduce((acc, item) => acc + item.value, 0);

    // 전체 너비를 기준으로 각 바의 픽셀 너비를 계산하고 반올림 오차를 조정하는 함수
    // useMemo를 사용하여 pieData 또는 pieTotal이 변경될 때만 다시 계산
    const calculateRoundedWidths = useMemo(() => (
        (data: PieDataItem[], totalContainerPixels: number): number[] => {
            if (pieTotal === 0 || data.length === 0) {
                return data.map(() => 0); // 데이터가 없으면 모든 너비를 0으로 반환
            }

            // 각 항목의 비율에 따른 원시 픽셀 너비 계산
            let rawPixels = data.map(item => (item.value / pieTotal) * totalContainerPixels);
            // 소수점을 반올림하여 정수 픽셀 너비 계산
            let roundedPixels = rawPixels.map(p => Math.round(p));

            // 현재 반올림된 픽셀 너비의 합계와 목표 너비(totalContainerPixels)의 차이 계산
            let currentSum = roundedPixels.reduce((acc, width) => acc + width, 0);
            let difference = totalContainerPixels - currentSum; // 양수이면 부족, 음수이면 초과

            // 원시 픽셀 너비가 큰 순서대로 정렬하여 오차를 분배할 인덱스를 찾음
            let sortedIndices = rawPixels
                .map((value, index) => ({ value: value, index: index }))
                .sort((a, b) => b.value - a.value);

            if (sortedIndices.length === 0) {
                return data.map(() => 0); // 정렬할 항목이 없으면 0으로 반환
            }

            // 차이만큼 픽셀을 조정 (양수이면 더하고, 음수이면 뺌)
            const numAdjustments = Math.abs(difference);
            for (let i = 0; i < numAdjustments; i++) {
                const targetIndex = sortedIndices[i % sortedIndices.length].index; // 순환하며 조정
                if (difference > 0) {
                    roundedPixels[targetIndex]++; // 픽셀 추가
                } else {
                    roundedPixels[targetIndex] = Math.max(0, roundedPixels[targetIndex] - 1); // 픽셀 감소 (최소 0 유지)
                }
            }

            return roundedPixels;
        }
    ), [pieTotal]); // pieTotal이 변경될 때만 calculateRoundedWidths 함수 재생성

    const FIXED_BAR_CHART_WIDTH = 570; // 바 차트의 고정된 전체 너비 (px)
    // 계산된 원시 픽셀 너비 (오차 조정 전)
    const rawPixelWidths = calculateRoundedWidths(pieData, FIXED_BAR_CHART_WIDTH);

    // 최소 너비(MIN_BAR_WIDTH_PX)를 고려하여 최종 바의 픽셀 너비를 결정하는 useMemo
    const finalBarPixelWidths = useMemo(() => {
        const MIN_BAR_WIDTH_PX = 2; // 각 바의 최소 너비

        if (pieTotal === 0 || pieData.length === 0) {
            // 데이터가 없거나 총합이 0인 경우, 모든 바에 최소 너비를 할당
            // 단, 전체 너비를 초과하지 않도록 마지막 아이템 조정
            const minWidthPerItem = Math.max(MIN_BAR_WIDTH_PX, Math.floor(FIXED_BAR_CHART_WIDTH / Math.max(1, pieData.length)));
            const widths = pieData.map(() => minWidthPerItem);

            const currentTotal = widths.reduce((sum, w) => sum + w, 0);
            if (currentTotal > FIXED_BAR_CHART_WIDTH && widths.length > 0) {
                widths[widths.length - 1] = Math.max(MIN_BAR_WIDTH_PX, widths[widths.length - 1] - (currentTotal - FIXED_BAR_CHART_WIDTH));
            }
            return widths;
        } else {
            // 데이터가 있는 경우, 0픽셀로 계산된 바를 최소 너비로 조정
            return rawPixelWidths.map(px => px === 0 ? MIN_BAR_WIDTH_PX : px);
        }
    }, [rawPixelWidths, pieTotal, pieData.length]); // rawPixelWidths, pieTotal, pieData.length가 변경될 때만 재계산

    // 컴포넌트 렌더링
    return (
        <div className="p-6 bg-white h-full flex flex-col">
            {/* 헤더 섹션: 제목 및 버튼 */}
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-semibold text-gray-800">
                    시스템 로그 실시간 모니터링 📈
                </h1>
                <div className="flex gap-2">
                    {/* 새로고침 버튼 */}
                    <button
                        onClick={handleRefresh}
                        className="flex items-center text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded px-3 py-2 h-9 shadow-sm"
                    >
                        <RefreshCw className="w-4 h-4 mr-1" />
                        새로고침
                    </button>
                    {/* 연결 상태 버튼 */}
                    <button className="flex items-center text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded px-3 py-2 h-9 shadow-sm">
                        {getStatusIcon()} {/* 연결 상태에 따른 아이콘 */}
                        {getStatusText()} {/* 연결 상태에 따른 텍스트 */}
                    </button>
                </div>
            </div>

            {/* 통계 카드 섹션 */}
            <div className="grid grid-cols-4 gap-4 mb-6">
                {[
                    { label: "수집된 로그 수 (24H)", value: "12348 개", valueClass: "text-black text-xl" },
                    { label: "총 탐지된 위협", value: totalDetectedThreats, valueClass: "text-red-400 text-2xl" },
                    { label: "최다 발생 위협 유형", value: mostFrequentThreat, valueClass: "text-black text-lg" },
                    { label: "탐지된 위협 종류", value: detectedThreatTypesCount, valueClass: "text-black text-lg" },
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

            {/* 차트 섹션: 시간대별 위협 발생 추이 및 위협 유형별 분포 */}
            <div className="grid grid-cols-2 gap-4 mb-6">
                {/* 시간대별 위협 발생 추이 라인 차트 */}
                <div
                    className="bg-gray-50 p-4 rounded border border-gray-200 shadow-md hover:shadow-lg hover:border-gray-300 transition focus:outline-none relative"
                    tabIndex={-1} // 포커스 가능하도록 설정 (접근성)
                >
                    <div className="flex items-center justify-between mb-2 pb-1">
                        <div className="text-gray-600 font-semibold">시간대별 위협 발생 추이</div>
                        <div className="text-gray-400 text-xs">최근 1시간 내 위협 발생 추이입니다.</div>
                    </div>
                    <ResponsiveContainer width="100%" height={230}>
                        <LineChart data={logData} margin={{ left: -20, right: 25, top: 10, bottom: -10 }}>
                            <XAxis dataKey="time" stroke="#999" /> {/* X축 (시간) */}
                            <YAxis domain={[0, 10]} ticks={[2, 4, 6, 8, 10]} stroke="#999" /> {/* Y축 (값), 도메인과 틱 설정 */}
                            <Tooltip /> {/* Tooltip 컴포넌트: 호버 시 데이터 값 표시 */}
                            <Line type="monotone" dataKey="value" stroke="#B9CDFF" strokeWidth={2} dot={false} /> {/* 라인 그래프 */}
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* 위협 유형별 분포 바 차트 및 설명 */}
                <div className="bg-gray-50 p-4 rounded border border-gray-200 shadow-md hover:shadow-lg hover:border-gray-300 transition focus:outline-none flex flex-col" tabIndex={-1}>
                    <div className="mt-[1px] text-gray-600 font-semibold leading-tight">위협 유형별 분포</div>
                    {/* 실제 바 차트 렌더링 영역 */}
                    <div
                        className="h-[30px] w-[570px] rounded overflow-hidden mt-5 flex"
                    >
                        {pieData.map((item, index) => {
                            const pixelWidth = finalBarPixelWidths[index]; // 계산된 최종 픽셀 너비
                            // 바의 title 속성에 마우스 오버 시 표시될 정보 설정
                            const barTitle = item.value === 0 ? `${item.name}: 데이터 없음` : `${item.name}: ${item.value}`;
                            return (
                                <div
                                    key={item.name}
                                    style={{
                                        width: `${pixelWidth}px`, // 각 바의 너비
                                        backgroundColor: item.value === 0 ? "#E0E0E0" : pastelColors[index % pastelColors.length], // 값이 0이면 회색, 아니면 파스텔 색상
                                        flexShrink: 0, // flex 아이템이 줄어들지 않도록
                                        transition: 'width 0.5s ease-out, background-color 0.5s ease-out', // 부드러운 전환 효과
                                    }}
                                    title={barTitle} // 마우스 오버 시 툴팁 텍스트
                                />
                            );
                        })}
                    </div>
                    {/* 위협 유형별 설명 목록 */}
                    <div className="mt-6 h-[180px] text-sm text-gray-700 space-y-2 border border-gray-200 p-3 rounded overflow-y-auto">
                        {pieData.map((item, idx) => (
                            <div key={item.name} className="flex items-start gap-2">
                                {/* 색상 인디케이터 (바 차트 색상과 동일) */}
                                <div
                                    className="w-3 h-3 mt-1 rounded-sm shrink-0"
                                    style={{ backgroundColor: item.value === 0 ? "#E0E0E0" : pastelColors[idx % pastelColors.length] }}
                                />
                                <div>
                                    <span className="font-semibold">{item.name}</span>:{" "}
                                    {item.value === 0 ? (
                                        <span className="text-gray-500">탐지된 위협 데이터가 없습니다.</span>
                                    ) : (
                                        threatDescriptions[item.name] ?? "설명이 없습니다." // 위협 설명 표시
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* 실시간 로그 피드 섹션 */}
            <div className="bg-gray-50 min-h-[230px] p-4 rounded border border-gray-200 shadow-md transition flex flex-col flex-grow overflow-hidden">
                <div className="shrink-0 flex items-center justify-between">
                    <div className="text-gray-600 font-semibold mb-2 pl-1">실시간 로그 피드</div>
                    {/* 상세보기 버튼 */}
                    <button className="text-xs text-gray-600 underline mb-2 mr-1" type="button" onClick={() => setIsModalOpen(true)}>
                        상세보기
                    </button>
                </div>
                {/* 로그 피드 테이블 헤더 */}
                <div className="grid grid-cols-6 mt-1 gap-2 text-sm font-semibold text-gray-700 border-b border-gray-200 pb-2">
                    <div className="ml-13">수집 시각</div>
                    <div className="ml-13">상태</div>
                    <div className="ml-3">위협 결과</div>
                    <div className="ml-6">발생 IP</div>
                    <div className="ml-1">프로세스명</div>
                    <div className="ml-1">호스트명</div>
                </div>
                {/* 로그 피드 데이터 목록 */}
                <div className="overflow-y-auto mt-1 flex-grow">
                    {logFeedData.slice(0, 7).map((item, index) => ( // 최신 7개 로그만 표시
                        <div
                            key={index}
                            className={`grid grid-cols-6 gap-2 text-sm border-b border-gray-100 py-1.5 cursor-default ${
                                item.status === "위협" ? "text-red-400 font-semibold" : "text-gray-600" // 위협 상태에 따라 색상 변경
                            }`}
                        >
                            <div title={item.time}>{new Date(item.time).toLocaleString()}</div> {/* 전체 시간을 툴팁으로 표시 */}
                            <div className="ml-13">{item.status}</div>
                            <div>{item.result}</div>
                            <div>{item.ip}</div>
                            <div>{item.process}</div>
                            <div>{item.host}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* 로그 피드 상세보기 모달 컴포넌트 */}
            <LogFeedModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} logFeedData={logFeedData} />
        </div>
    );
};

export default SystemNetworkMonitoring;