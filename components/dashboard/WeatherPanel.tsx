'use client';

import useSWR from 'swr';
import { fetcher } from '@/lib/api/fetcher';
import { formatDateTime } from '@/lib/utils/formatters';
import {
    CloudRain, Thermometer, Wind, Droplets, AlertTriangle, Clock,
    Sun, Cloud, CloudSnow, CloudLightning, CloudDrizzle, Eye
} from 'lucide-react';

const RISK_COLOR: Record<string, string> = {
    EXTREME: '#EF4444', HIGH: '#F97316', MEDIUM: '#EAB308', LOW: '#22C55E',
};

// Replace ALL emoji with proper Lucide icons
function WeatherIcon({ code, size = 16 }: { code: number; size?: number }) {
    const style = { flexShrink: 0 };
    if (code === 0) return <Sun size={size} color="#F59E0B" style={style} />;
    if (code <= 3) return <Cloud size={size} color="#94A3B8" style={style} />;
    if (code <= 49) return <Eye size={size} color="#64748B" style={style} />;          // Fog
    if (code <= 65) return <CloudRain size={size} color="#0891B2" style={style} />;
    if (code <= 77) return <CloudSnow size={size} color="#BAE6FD" style={style} />;
    if (code <= 82) return <CloudDrizzle size={size} color="#38BDF8" style={style} />;
    if (code <= 99) return <CloudLightning size={size} color="#6366F1" style={style} />;
    return <Thermometer size={size} color="#F97316" style={style} />;
}

export default function WeatherPanel() {
    const { data, isLoading, error } = useSWR('/api/realtime/weather', fetcher, {
        refreshInterval: 1800000,
    });

    if (isLoading) {
        return (
            <div className="operational-card" style={{ padding: '20px 22px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                    <CloudRain size={15} color="#0369A1" />
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#0A1628' }}>Hydrological Telemetry</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="shimmer" style={{ height: 70, borderRadius: 12 }} />
                    ))}
                </div>
            </div>
        );
    }

    if (error || !data?.success) {
        return (
            <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                background: '#FEF2F2', border: '1px solid #FECACA',
                borderRadius: 14, padding: '12px 16px',
            }}>
                <AlertTriangle size={14} color="#EF4444" />
                <span style={{ fontSize: 12, color: '#DC2626', fontWeight: 600 }}>
                    Weather intelligence currently offline.
                </span>
            </div>
        );
    }

    const districts = data.districts ?? [];
    const { summary } = data;

    return (
        <div style={{
            background: 'rgba(255,255,255,0.82)',
            backdropFilter: 'blur(22px)',
            WebkitBackdropFilter: 'blur(22px)',
            border: '1px solid rgba(226,232,240,0.7)',
            borderRadius: 24,
            overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(15,23,42,0.07)',
        }}>
            {/* Blue accent stripe */}
            <div style={{ height: 3, background: 'linear-gradient(90deg, #0369A1, #0891B2, #06B6D4)' }} />

            <div style={{ padding: '18px 20px' }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                    <div style={{ background: '#F0F9FF', borderRadius: 10, padding: 8 }}>
                        <CloudRain size={15} color="#0369A1" />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <h3 style={{ fontSize: 13, fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>
                            Precipitation Dashboard
                        </h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 2 }}>
                            <Clock size={10} color="#94A3B8" />
                            <span style={{ fontSize: 10, color: '#94A3B8', fontWeight: 600 }}>
                                {formatDateTime(data.timestamp)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Summary strip */}
                <div style={{
                    display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 16,
                    background: 'rgba(240,249,255,0.6)', borderRadius: 14, padding: '12px 14px',
                    border: '1px solid rgba(186,230,253,0.4)',
                }}>
                    {[
                        { label: '7d Avg Rain', val: `${summary?.avgRainfall7dMm ?? '—'} mm`, icon: Droplets, color: '#0369A1' },
                        { label: '24h Max Rain', val: `${summary?.maxRainfall24hMm ?? '—'} mm`, icon: CloudRain, color: '#0891B2' },
                        { label: 'Avg Temp', val: `${summary?.avgTempC ?? '—'} °C`, icon: Thermometer, color: '#F97316' },
                    ].map(({ label, val, icon: Icon, color }) => (
                        <div key={label} style={{ textAlign: 'center' }}>
                            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 4 }}>
                                <Icon size={13} color={color} />
                            </div>
                            <div style={{ fontSize: 13, fontWeight: 900, color: '#0F172A' }}>{val}</div>
                            <div style={{ fontSize: 9, color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 1 }}>
                                {label}
                            </div>
                        </div>
                    ))}
                </div>

                {/* District weather cards — 2-column compact grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    {districts.map((d: any) => {
                        const riskMod = d.rainfallRiskModifier;
                        const riskColor = RISK_COLOR[riskMod?.level ?? 'LOW'] ?? '#22C55E';
                        return (
                            <div
                                key={d.district}
                                style={{
                                    background: 'rgba(255,255,255,0.65)',
                                    border: `1px solid ${riskColor}22`,
                                    borderTop: `3px solid ${riskColor}`,
                                    borderRadius: 14,
                                    padding: '12px 12px 10px',
                                    transition: 'all 0.2s ease',
                                    cursor: 'default',
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                    e.currentTarget.style.boxShadow = `0 6px 18px ${riskColor}18`;
                                    e.currentTarget.style.background = 'rgba(255,255,255,0.95)';
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = 'none';
                                    e.currentTarget.style.background = 'rgba(255,255,255,0.65)';
                                }}
                            >
                                {/* District name + weather icon */}
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                                    <span style={{ fontSize: 11, fontWeight: 800, color: '#0F172A', letterSpacing: '-0.01em' }}>
                                        {d.district}
                                    </span>
                                    <WeatherIcon code={d.current?.weatherCode ?? 0} size={14} />
                                </div>

                                {/* Condition text */}
                                <div style={{ fontSize: 9, color: '#64748B', fontWeight: 600, marginBottom: 8, textTransform: 'capitalize' }}>
                                    {d.current?.condition ?? 'Unknown'}
                                </div>

                                {/* Temp + Humidity row */}
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                        <Thermometer size={10} color="#F97316" />
                                        <span style={{ fontSize: 11, fontWeight: 800, color: '#0F172A' }}>
                                            {d.current?.tempC?.toFixed(1) ?? '—'}°C
                                        </span>
                                    </div>
                                    <span style={{ fontSize: 9, color: '#94A3B8', fontWeight: 600 }}>
                                        {d.current?.humidity ?? '—'}% RH
                                    </span>
                                </div>

                                {/* Rainfall bar */}
                                <div style={{ height: 3, background: '#E2E8F0', borderRadius: 2, overflow: 'hidden', marginBottom: 6 }}>
                                    <div style={{
                                        width: `${Math.min((d.rainfall?.last24h ?? 0) * 2, 100)}%`,
                                        height: '100%', background: '#0891B2', borderRadius: 2,
                                    }} />
                                </div>

                                {/* Rain amount */}
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                        <CloudRain size={10} color="#0891B2" />
                                        <span style={{ fontSize: 10, color: '#475569', fontWeight: 700 }}>
                                            {d.rainfall?.last24h?.toFixed(1) ?? 0} mm
                                        </span>
                                    </div>
                                    <span style={{
                                        fontSize: 8, fontWeight: 900, color: riskColor,
                                        background: `${riskColor}12`, border: `1px solid ${riskColor}25`,
                                        borderRadius: 4, padding: '2px 6px', textTransform: 'uppercase',
                                        letterSpacing: '0.05em',
                                    }}>
                                        {riskMod?.level ?? 'LOW'}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
