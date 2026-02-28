'use client';

import useSWR from 'swr';
import { fetcher } from '@/lib/api/fetcher';
import { CloudRain, Thermometer, Wind, Droplets, AlertTriangle, Wifi } from 'lucide-react';

const RISK_COLOR: Record<string, string> = {
    EXTREME: '#EF4444', HIGH: '#F97316', MEDIUM: '#EAB308', LOW: '#22C55E',
};

function WeatherConditionIcon({ code }: { code: number }) {
    if (code === 0) return <span title="Clear sky">☀️</span>;
    if (code <= 3) return <span title="Partly cloudy">⛅</span>;
    if (code <= 49) return <span title="Fog">🌫️</span>;
    if (code <= 65) return <span title="Rain">🌧️</span>;
    if (code <= 77) return <span title="Snow">❄️</span>;
    if (code <= 82) return <span title="Rain showers">🌦️</span>;
    if (code <= 99) return <span title="Thunderstorm">⛈️</span>;
    return <span>🌡️</span>;
}

export default function WeatherPanel() {
    const { data, isLoading, error } = useSWR('/api/realtime/weather', fetcher, {
        refreshInterval: 1800000, // 30 min
    });

    if (isLoading) {
        return (
            <div className="glass-card" style={{ padding: '18px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                    <CloudRain size={15} color="#0369A1" />
                    <h3 style={{ fontSize: 14, fontWeight: 700, color: '#0A1628' }}>Real-Time Weather</h3>
                    <span style={{ fontSize: 10, color: '#94A3B8', marginLeft: 'auto' }}>Open-Meteo API</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10 }}>
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="shimmer" style={{ height: 100, borderRadius: 10 }} />
                    ))}
                </div>
            </div>
        );
    }

    if (error || !data?.success) {
        return (
            <div
                style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    background: '#FEF2F2', border: '1px solid #FECACA',
                    borderRadius: 10, padding: '12px 16px',
                }}
            >
                <AlertTriangle size={14} color="#EF4444" />
                <span style={{ fontSize: 12, color: '#DC2626' }}>
                    Live weather unavailable — click <strong>Fetch Live Data</strong> to load real-time data
                </span>
            </div>
        );
    }

    const districts = data.districts ?? [];
    const { summary } = data;

    return (
        <div className="glass-card" style={{ padding: '18px 20px' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <CloudRain size={15} color="#0369A1" />
                <h3 style={{ fontSize: 14, fontWeight: 700, color: '#0A1628' }}>Real-Time Weather · Assam Districts</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginLeft: 'auto' }}>
                    <Wifi size={11} color="#22C55E" />
                    <span style={{ fontSize: 10, color: '#16A34A', fontWeight: 600 }}>Open-Meteo Live</span>
                </div>
                <span style={{ fontSize: 10, color: '#94A3B8' }}>
                    Updated {new Date(data.fetchedAt).toLocaleTimeString('en-IN')}
                </span>
            </div>

            {/* Summary row */}
            <div
                style={{
                    display: 'flex', gap: 10, marginBottom: 14,
                    background: '#F0F9FF', borderRadius: 8, padding: '8px 14px',
                    border: '1px solid #BAE6FD',
                }}
            >
                {[
                    { label: 'Avg Rainfall 7d', val: `${summary?.avgRainfall7dMm ?? '—'} mm`, icon: Droplets, color: '#0369A1' },
                    { label: 'Max Rainfall 24h', val: `${summary?.maxRainfall24hMm ?? '—'} mm`, icon: CloudRain, color: '#0891B2' },
                    { label: 'Avg Temperature', val: `${summary?.avgTempC ?? '—'} °C`, icon: Thermometer, color: '#F97316' },
                ].map(({ label, val, icon: Icon, color }) => (
                    <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1 }}>
                        <Icon size={13} color={color} />
                        <div>
                            <div style={{ fontSize: 10, color: '#64748B', fontWeight: 600 }}>{label}</div>
                            <div style={{ fontSize: 14, fontWeight: 800, color: '#0A1628' }}>{val}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Per-district weather cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10 }}>
                {districts.map((d: any) => {
                    const riskMod = d.rainfallRiskModifier;
                    const riskColor = RISK_COLOR[riskMod?.level ?? 'LOW'] ?? '#22C55E';
                    return (
                        <div
                            key={d.district}
                            style={{
                                background: '#FAFBFC',
                                border: `1px solid ${riskColor}30`,
                                borderTop: `3px solid ${riskColor}`,
                                borderRadius: 10,
                                padding: '12px 14px',
                            }}
                        >
                            {/* District name + condition icon */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                                <div style={{ fontSize: 12, fontWeight: 700, color: '#0A1628' }}>{d.district}</div>
                                <WeatherConditionIcon code={d.current?.weatherCode ?? 0} />
                            </div>

                            {/* Condition label */}
                            <div style={{ fontSize: 10, color: '#64748B', marginBottom: 8 }}>{d.current?.condition ?? '—'}</div>

                            {/* Key metrics */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                                    <Thermometer size={10} color="#F97316" />
                                    <span style={{ fontSize: 11, color: '#475569', fontWeight: 600 }}>
                                        {d.current?.tempC?.toFixed(1) ?? '—'}°C
                                    </span>
                                    <span style={{ fontSize: 10, color: '#94A3B8' }}>· {d.current?.humidity ?? '—'}%</span>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                                    <CloudRain size={10} color="#0891B2" />
                                    <span style={{ fontSize: 11, color: '#475569', fontWeight: 600 }}>
                                        {d.rainfall?.last24h?.toFixed(1) ?? 0} mm
                                    </span>
                                    <span style={{ fontSize: 10, color: '#94A3B8' }}>24h</span>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                                    <Droplets size={10} color="#0369A1" />
                                    <span style={{ fontSize: 11, color: '#475569', fontWeight: 600 }}>
                                        {d.rainfall?.last7dTotal ?? 0} mm
                                    </span>
                                    <span style={{ fontSize: 10, color: '#94A3B8' }}>7d total</span>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                                    <Wind size={10} color="#64748B" />
                                    <span style={{ fontSize: 11, color: '#475569', fontWeight: 600 }}>
                                        {d.current?.windKmh?.toFixed(0) ?? '—'} km/h
                                    </span>
                                </div>
                            </div>

                            {/* Rainfall risk modifier badge */}
                            <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid #F1F5F9' }}>
                                <span
                                    style={{
                                        fontSize: 9, fontWeight: 800, letterSpacing: '0.08em',
                                        color: riskColor, background: riskColor + '15',
                                        border: `1px solid ${riskColor}40`,
                                        borderRadius: 4, padding: '2px 6px',
                                    }}
                                >
                                    RAIN RISK: {riskMod?.level ?? 'LOW'}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
