import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
    LineChart,
    Line,
} from "recharts";
import { Link as LinkIcon, RefreshCw, Plug, PlugZap } from "lucide-react";

// --- 상수 정의 ---

// 차트 및 바 차트에 사용될 파스텔 색상 팔레트 (회색 계열 대체됨)
const PASTEL_COLORS: string[] = [
    "#bed2dfff", "#fff8dbff", "#dfcffdff", "#FFC0CB",
    "#bfddd7ff", "#E8DAEF", "#F9E79F", "#AED6F1",
    "#F5CBA7", "#ADD8E6",
    "#D6EAF8", "#FADBD8",
];

// 값이 0인 경우 사용할 회색 색상 (더 이상 프로토콜 바 차트에는 사용되지 않음)
const ZERO_VALUE_COLOR = "#E0E0E0";

// 프로토콜별 설명 객체 (더 이상 사용되지 않음)
const PROTOCOL_DESCRIPTIONS: { [key: string]: string } = {
    "HTTP/HTTPS": "웹 브라우징 (포트 80, 443)",
    DNS: "도메인 이름 해석 (포트 53)",
    "FTP/SFTP": "파일 전송 (포트 21, 22 등)",
    "SMTP/IMAP/POP3": "이메일 통신",
    SSH: "원격 접속 (포트 22)",
    TELNET: "텍스트 기반 원격 접속 (비추천)",
    SNMP: "네트워크 장비 모니터링",
    RDP: "원격 데스크탑 (포트 3389)",
    ICMP: "Ping/트래픽 진단용",
    QUIC: "UDP 기반의 빠른 HTTP/3",
    NTP: "시간 동기화 (포트 123)",
    Others: "나머지 비주류 또는 커스텀 프로토콜들",
};

// 바 차트의 고정된 전체 너비 (px) (포트 차트에만 사용)
const FIXED_BAR_CHART_WIDTH = 570;
// 각 바의 최소 너비 (더 이상 프로토콜 바 차트에는 사용되지 않음)
const MIN_BAR_WIDTH_PX = 2;

// 포트 차트 상수
const PORT_BAR_HEIGHT = 30; // 각 포트 바의 높이 (px)
const PORT_CHART_PADDING_TOP_BOTTOM = 40; // 포트 차트의 상하 여백 (px)

// --- 인터페이스 정의 ---
interface ProtocolDataItem {
    name: string;
    value: number;
}

interface PortDataItem {
    port: string;
    value: number;
}

interface AttackNotificationItem {
    time: string;
    type: string;
    sourceIp: string;
    targetPort: string;
    hostname: string;
    severity: string;
}

interface TrafficHistoryItem { // 실시간 트래픽 그래프를 위한 인터페이스
    time: string; // "hh:mm:ss" 형식의 시간
    bytesPerSecond: number; // 초당 바이트 값
}

// --- NetworkTrafficMonitoring 컴포넌트 정의 ---

const NetworkTrafficMonitoring: React.FC = () => {
    // --- 상태 관리 ---

    // 프로토콜별 트래픽 데이터 초기값 (초당 바이트 계산을 위해 값은 유지)
    const initialProtocolData: ProtocolDataItem[] = useMemo(() => ([
        { name: "HTTP/HTTPS", value: 0 },
        { name: "DNS", value: 0 },
        { name: "FTP/SFTP", value: 0 },
        { name: "SMTP/IMAP/POP3", value: 0 },
        { name: "SSH", value: 0 },
        { name: "TELNET", value: 0 },
        { name: "SNMP", value: 0 },
        { name: "RDP", value: 0 },
        { name: "ICMP", value: 0 },
        { name: "QUIC", value: 0 },
        { name: "NTP", value: 0 },
        { name: "Others", value: 0 },
    ]), []);
    const [protocolData, setProtocolData] = useState<ProtocolDataItem[]>(initialProtocolData);

    // 상위 목적지 포트 데이터 초기값
    const initialPortData: PortDataItem[] = useMemo(() => ([
        { port: "443 (HTTPS)", value: 0 },
        { port: "80 (HTTP)", value: 0 },
        { port: "22 (SSH)", value: 0 },
        { port: "3389 (RDP)", value: 0 },
        { port: "기타", value: 0 },
        { port: "53 (DNS)", value: 0 },
        { port: "21 (FTP)", value: 0 },
        { port: "23 (TELNET)", value: 0 },
        { port: "123 (NTP)", value: 0 },
        { port: "161 (SNMP)", value: 0 },
    ]).sort((a, b) => b.value - a.value), []);
    const [portData, setPortData] = useState<PortDataItem[]>(initialPortData);

    // 실시간 공격 탐지 알림 데이터
    const [attackAlerts, setAttackAlerts] = useState<AttackNotificationItem[]>([]);

    // 시스템 연결 상태 (true: 연결 됨, false: 연결 끊김, null: 알 수 없음)
    const [isConnected, setIsConnected] = useState<boolean | null>(null);

    // --- 실시간 트래픽 기록 (선 그래프용) ---
    // 최초 렌더링 시 6개의 데이터로 초기화 (값은 0)
    const initialTrafficHistory: TrafficHistoryItem[] = useMemo(() => {
        const now = new Date();
        const history = [];
        for (let i = 5; i >= 0; i--) { // 과거 5초 전부터 현재까지의 시간으로 6개 데이터 생성
            const d = new Date(now.getTime() - i * 1000); // 3초 간격 (업데이트 주기와 동일)
            history.push({
                time: `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`,
                bytesPerSecond: 0, // 모든 초기값은 0으로 설정
            });
        }
        return history;
    }, []);

    const [trafficHistory, setTrafficHistory] = useState<TrafficHistoryItem[]>(initialTrafficHistory);


    // --- 파생 상태 (useMemo) ---

    // 프로토콜 데이터 총합 계산
    const protocolTotal = useMemo(
        () => protocolData.reduce((sum, item) => sum + item.value, 0),
        [protocolData]
    );

    // 현재 초당 바이트 값 계산 (초당 흐름 * 1024.5 / 5초 업데이트 주기)
    const currentBytesPerSecond = useMemo(() => {
        return parseFloat(((protocolTotal * 1024.5) / 1).toFixed(1));
    }, [protocolTotal]);

    // 포트 데이터의 개수에 따라 동적으로 차트 높이 계산
    const calculatedPortChartHeight = useMemo(() => {
        return Math.max(230, portData.length * PORT_BAR_HEIGHT + PORT_CHART_PADDING_TOP_BOTTOM);
    }, [portData.length]);


    // --- 유틸리티 함수: 시간 형식 변환 (`useCallback`으로 메모이제이션) ---
    const formatDateTime = useCallback((date: Date): string => {
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        let hours = date.getHours();
        const minutes = date.getMinutes();
        const seconds = date.getSeconds();
        const ampm = hours >= 12 ? '오후' : '오전';
        hours = hours % 12;
        hours = hours ? hours : 12;

        const pad = (num: number) => num.toString().padStart(2, '0');

        return `${year}. ${month}. ${day}. ${ampm} ${hours}:${pad(minutes)}:${pad(seconds)}`;
    }, []);

    const formatTimeOnly = useCallback((date: Date): string => {
        const hours = date.getHours();
        const minutes = date.getMinutes();
        const seconds = date.getSeconds();
        const pad = (num: number) => num.toString().padStart(2, '0');
        return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    }, []);

    // --- useEffect 훅: 데이터 업데이트 로직 ---
    useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date();

            // 프로토콜 데이터 업데이트
            setProtocolData(prevData =>
                prevData.map(item => ({
                    ...item,
                    value: Math.max(0, Math.min(100, Math.floor(item.value + (Math.random() * 10 - 5)))),
                }))
            );

            // 포트 데이터 업데이트 및 정렬 로직 추가
            setPortData(prevData => {
                const updatedData = prevData.map(item => ({
                    ...item,
                    value: Math.max(5, Math.min(150, Math.floor(item.value + (Math.random() * 15 - 7)))),
                }));
                return updatedData.sort((a, b) => b.value - a.value);
            });

            // 공격 알림 업데이트 로직
            setAttackAlerts(prevAlerts => {
                const isAttack = Math.random() > 0.6;

                if (!isAttack) {
                    return prevAlerts;
                }

                const newAlert: AttackNotificationItem = {
                    time: formatDateTime(now),
                    type: "SQL Injection",
                    sourceIp: `192.168.1.${Math.floor(Math.random() * 254) + 1}`,
                    targetPort: "80/443",
                    hostname: `Server-${Math.floor(Math.random() * 5) + 1}`,
                    severity: Math.random() > 0.5 ? "Critical" : "High",
                };
                return [newAlert, ...prevAlerts].slice(0, 5);
            });

            // 연결 상태 랜덤 업데이트
            setIsConnected(Math.random() > 0.5);

            // 초당 바이트 그래프 데이터 업데이트
            setTrafficHistory(prevHistory => {
                const newHistory = [...prevHistory, { time: formatTimeOnly(now), bytesPerSecond: currentBytesPerSecond }];
                // 최근 6개 데이터만 유지
                return newHistory.slice(-6);
            });

        }, 3000); // 3초마다 업데이트

        return () => clearInterval(interval);
    }, [formatDateTime, formatTimeOnly, currentBytesPerSecond]);

    // --- 이벤트 핸들러 ---

    // "새로고침" 버튼 클릭 시 호출되는 핸들러
    const handleRefresh = useCallback(() => {
        setProtocolData(initialProtocolData);
        setPortData(initialPortData);
        setAttackAlerts([]);
        setIsConnected(null);
        setTrafficHistory(initialTrafficHistory); // 트래픽 기록 초기화 시에도 0으로 채워진 초기 데이터 사용
    }, [initialProtocolData, initialPortData, initialTrafficHistory]);

    // 연결 상태에 따라 다른 아이콘을 반환하는 함수
    const getStatusIcon = useCallback(() => {
        if (isConnected === true) return <Plug className="w-4 h-4 mr-1" />;
        if (isConnected === false) return <PlugZap className="w-4 h-4 mr-1" />;
        return <LinkIcon className="w-4 h-4 mr-1" />;
    }, [isConnected]);

    // 연결 상태에 따라 다른 텍스트를 반환하는 함수
    const getStatusText = useCallback(() => {
        if (isConnected === true) return "연결 됨";
        if (isConnected === false) return "연결 끊김";
        return "연결 상태";
    }, [isConnected]);

    // --- 컴포넌트 렌더링 ---
    return (
        <div className="p-6 bg-white h-full flex flex-col">
            {/* 헤더 섹션: 제목 및 버튼 */}
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-semibold text-gray-800">실시간 네트워크 트래픽 모니터링 📈</h1>
                <div className="flex gap-2">
                    <button
                        onClick={handleRefresh}
                        className="flex items-center text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded px-3 py-2 h-9 shadow-sm"
                    >
                        <RefreshCw className="w-4 h-4 mr-1" /> 새로고침
                    </button>
                    <button className="flex items-center text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded px-3 py-2 h-9 shadow-sm">
                        {getStatusIcon()}
                        {getStatusText()}
                    </button>
                </div>
            </div>

            {/* 통계 카드 섹션 */}
            <div className="grid grid-cols-4 gap-4 mb-6">
                {[
                    { label: "총 흐름", value: protocolTotal, unit: "개" },
                    { label: "총 바이트", value: Math.floor(protocolTotal * 1024.5), unit: "KB" },
                    { label: "초당 흐름", value: (protocolTotal / 5).toFixed(1), unit: "개/s" },
                    { label: "초당 바이트", value: currentBytesPerSecond, unit: "KB/s" },
                ].map((card, idx) => (
                    <div key={idx} className="bg-gray-50 p-4 rounded border border-gray-200 shadow-md hover:shadow-lg hover:border-gray-300 transition text-center">
                        <div className="text-sm text-gray-600">{card.label}</div>
                        <div className="font-bold mt-2 py-2 text-xl text-black">{card.value} {card.unit}</div>
                    </div>
                ))}
            </div>

            {/* 차트 섹션: 실시간 트래픽 그래프 및 상위 목적지 포트 */}
            <div className="grid grid-cols-2 gap-4 mb-6">
                {/* 실시간 트래픽 그래프 */}
                <div className="bg-gray-50 p-4 rounded border border-gray-200 shadow-md hover:shadow-lg hover:border-gray-300 transition focus:outline-none flex flex-col" tabIndex={-1}>
                    <div className="text-gray-600 font-semibold mb-2">실시간 초당 트래픽 (KB/s)</div>
                    <ResponsiveContainer width="100%" height={240}>
                        <LineChart
                            data={trafficHistory}
                            margin={{ top: 5, right: 30, left: 10, bottom: 0 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="time" />
                            <YAxis domain={[0, 100]} />
                            <Tooltip />
                            <Line type="monotone" dataKey="bytesPerSecond" stroke="#8884d8" activeDot={{ r: 8 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* 상위 목적지 포트 바 차트 - 스크롤 및 동적 높이 적용 */}
                <div className="bg-gray-50 p-4 rounded border border-gray-200 shadow-md hover:shadow-lg transition focus:outline-none flex flex-col" tabIndex={-1}>
                    <div className="text-gray-600 font-semibold mb-2">상위 목적지 포트</div>
                    <div className={`max-h-[240px] overflow-y-auto w-full`}>
                        <BarChart
                            width={FIXED_BAR_CHART_WIDTH}
                            height={calculatedPortChartHeight}
                            data={portData}
                            layout="vertical"
                        >
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis type="number" hide domain={[0, 150]} />
                            <YAxis dataKey="port" type="category" stroke="#999" width={90} />
                            <Tooltip />
                            <Bar dataKey="value" fill="#a388caff" barSize={PORT_BAR_HEIGHT - 10} />
                        </BarChart>
                    </div>
                </div>
            </div>

            {/* 실시간 공격 탐지 알림 섹션 */}
            <div className="bg-gray-50 min-h-[120px] p-4 rounded border border-gray-200 shadow-md transition flex flex-col flex-grow overflow-hidden">
                <div className="text-gray-600 font-bold mb-2">실시간 공격 탐지 알림</div>
                <div className="grid grid-cols-6 text-sm font-semibold text-gray-700 border-b border-gray-200 pb-2">
                    <div className="ml-13">수집 시간</div>
                    <div className="ml-4">공격 유형</div>
                    <div className="ml-7">소스 IP</div>
                    <div>대상 포트</div>
                    <div className="ml-2">호스트명</div>
                    <div className="ml-1">심각도</div>
                </div>
                <div className="overflow-y-auto mt-1 flex-grow">
                    {/* 공격 알림 데이터가 없을 때 표시 */}
                    {attackAlerts.length === 0 ? (
                        <div className="grid grid-cols-6 text-sm text-gray-500 py-2">
                            <div>-</div><div>-</div><div>-</div><div>-</div><div>-</div><div>-</div>
                        </div>
                    ) : (
                        // 공격 알림 데이터가 있을 때 매핑하여 표시
                        attackAlerts.map((alert, index) => (
                            <div
                                key={index}
                                className={`grid grid-cols-6 gap-2 text-sm border-b border-gray-100 py-1.5 cursor-default ${
                                    alert.type !== "정상" ? "text-red-400 font-semibold" : "text-gray-600"
                                }`}
                            >
                                <div title={alert.time}>{alert.time}</div>
                                <div>{alert.type}</div>
                                <div>{alert.sourceIp}</div>
                                <div>{alert.targetPort}</div>
                                <div>{alert.hostname}</div>
                                <div className={`${alert.severity === "Critical" ? "text-red-400" : alert.severity === "High" ? "text-orange-500" : ""}`}>
                                    {alert.severity}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default NetworkTrafficMonitoring;