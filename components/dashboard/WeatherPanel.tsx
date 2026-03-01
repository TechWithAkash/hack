'use client';

import useSWR from 'swr';
import { fetcher } from '@/lib/api/fetcher';
import { formatDateTime } from '@/lib/utils/formatters';
import { CloudRain, Thermometer, Wind, Droplets, AlertTriangle, Wifi, Clock } from 'lucide-react';

const RISK_COLOR: Record<string, string> = {
    EXTREME: '#EF4444', HIGH: '#F97316', MEDIUM: '#EAB308', LOW: '#22C55E',
};

function WeatherConditionIcon({ code }: { code: number }) {
    if (code === 0) return <span title="Clear Sky">☀️</span>;
    if (code <= 3) return <span title="Mainly Clear / Partly Cloudy">⛅</span>;
    if (code <= 49) return <span title="Fog / Depositing Rime Fog">🌫️</span>;
    if (code <= 65) return <span title="Rain: Slight, Moderate and Heavy intensity">🌧️</span>;
    if (code <= 77) return <span title="Snow fall: Slight, moderate, and heavy intensity">❄️</span>;
    if (code <= 82) return <span title="Rain showers: Slight, moderate, and violent">🌦️</span>;
    if (code <= 99) return <span title="Thunderstorm: Slight or moderate">⛈️</span>;
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
                    <h3 style={{ fontSize: 14, fontWeight: 700, color: '#0A1628' }}>Real-time Hydrological Telemetry</h3>
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
                    Weather intelligence systems currently offline.
                </span>
            </div>
        );
    }

    const districts = data.districts ?? [];
    const { summary } = data;

    return (
        <div style={{
            background: 'rgba(255, 255, 255, 0.7)',
            backdropFilter: 'blur(22px)',
            border: '1px solid rgba(255, 255, 255, 0.8)',
            borderRadius: 24,
            padding: '24px 28px',
            boxShadow: '0 12px 48px rgba(15, 23, 42, 0.06)'
        }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                <div style={{ background: '#F0F9FF', borderRadius: 10, padding: 8, color: '#0369A1' }}>
                    <CloudRain size={18} />
                </div>
                <div>
                    <h3 style={{ fontSize: 16, fontWeight: 950, color: '#0F172A', letterSpacing: '-0.02em' }}>Precipitation Dashboard · Bihar Regions</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Clock size={12} className="text-slate-400" />
                        <span style={{ fontSize: 10, color: '#94A3B8', fontWeight: 600 }}>
                            Active Telemetry: {formatDateTime(data.timestamp)}
                        </span>
                    </div>
                </div>
                <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                    <span style={{ fontSize: 10, color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Last Telemetry: {new Date(data.fetchedAt).toLocaleTimeString()}
                    </span>
                </div>
            </div>

            {/* Summary row */}
            <div
                style={{
                    display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24,
                    background: 'rgba(240, 249, 255, 0.5)', borderRadius: 16, padding: '16px 20px',
                    border: '1px solid rgba(186, 230, 253, 0.3)',
                }}
            >
                {[
                    { label: 'Avg Rainfall (7d)', val: `${summary?.avgRainfall7dMm ?? '—'} mm`, icon: Droplets, color: '#0369A1', desc: 'Regional Bias' },
                    { label: 'Max Rainfall (24h)', val: `${summary?.maxRainfall24hMm ?? '—'} mm`, icon: CloudRain, color: '#0891B2', desc: 'Alert Peak' },
                    { label: 'Avg Ambient Temp', val: `${summary?.avgTempC ?? '—'} °C`, icon: Thermometer, color: '#F97316', desc: 'Thermal Drift' },
                ].map(({ label, val, icon: Icon, color, desc }) => (
                    <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ background: '#FFF', borderRadius: 10, padding: 8, color, boxShadow: '0 2px 8px rgba(186, 230, 253, 0.5)' }}>
                            <Icon size={16} />
                        </div>
                        <div>
                            <div style={{ fontSize: 14, fontWeight: 950, color: '#0F172A' }}>{val}</div>
                            <div style={{ fontSize: 10, color: '#64748B', fontWeight: 600 }}>{label} · <span style={{ opacity: 0.7 }}>{desc}</span></div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Per-district weather cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 }}>
                {districts.map((d: any) => {
                    const riskMod = d.rainfallRiskModifier;
                    const riskColor = RISK_COLOR[riskMod?.level ?? 'LOW'] ?? '#22C55E';
                    return (
                        <div
                            key={d.district}
                            style={{
                                background: 'rgba(255, 255, 255, 0.4)',
                                border: `1px solid ${riskColor}20`,
                                borderTop: `4px solid ${riskColor}`,
                                borderRadius: 16,
                                padding: '16px',
                                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                cursor: 'pointer'
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.transform = 'translateY(-4px)';
                                e.currentTarget.style.boxShadow = `0 8px 24px ${riskColor}10`;
                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.8)';
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = 'none';
                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.4)';
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                                <div style={{ fontSize: 14, fontWeight: 950, color: '#0F172A', letterSpacing: '-0.02em' }}>{d.district}</div>
                                <div style={{ fontSize: 18 }}><WeatherConditionIcon code={d.current?.weatherCode ?? 0} /></div>
                            </div>

                            <div style={{ fontSize: 11, color: '#64748B', fontWeight: 600, marginBottom: 12, textTransform: 'capitalize' }}>{d.current?.condition ?? '—'}</div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <Thermometer size={12} color="#F97316" />
                                        <span style={{ fontSize: 12, color: '#0F172A', fontWeight: 800 }}>{d.current?.tempC?.toFixed(1) ?? '—'}°</span>
                                    </div>
                                    <span style={{ fontSize: 10, color: '#94A3B8', fontWeight: 600 }}>{d.current?.humidity ?? '—'}% Humidity</span>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <div style={{ width: '100%', height: 4, background: '#E2E8F0', borderRadius: 2, overflow: 'hidden' }}>
                                        <div style={{ width: `${Math.min((d.rainfall?.last24h ?? 0) * 2, 100)}%`, height: '100%', background: '#0891B2', borderRadius: 2 }} />
                                    </div>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <CloudRain size={12} color="#0891B2" />
                                        <span style={{ fontSize: 11, color: '#475569', fontWeight: 700 }}>{d.rainfall?.last24h?.toFixed(1) ?? 0} mm</span>
                                    </div>
                                    <span style={{ fontSize: 9, color: '#94A3B8', fontWeight: 800, marginLeft: 'auto' }}>24H</span>
                                </div>
                            </div>

                            <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px solid rgba(226, 232, 240, 0.5)' }}>
                                <div style={{
                                    fontSize: 9, fontWeight: 950, letterSpacing: '0.08em',
                                    color: riskColor, background: riskColor + '10',
                                    border: `1px solid ${riskColor}25`,
                                    borderRadius: 6, padding: '4px 8px',
                                    textAlign: 'center',
                                    textTransform: 'uppercase'
                                }}>
                                    Precip Risk: {riskMod?.level ?? 'LOW'}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
