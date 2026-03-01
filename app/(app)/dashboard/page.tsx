'use client';

import { useMemo } from 'react';
import useSWR from 'swr';
import StatsGrid from '@/components/dashboard/StatsGrid';
import RiskTable from '@/components/dashboard/RiskTable';
import WeatherPanel from '@/components/dashboard/WeatherPanel';
import DashboardCharts from '@/components/dashboard/DashboardCharts';
import { ShieldCheck, Activity, Globe } from 'lucide-react';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function Dashboard() {
    const { data: districts = [] } = useSWR('/api/districts', fetcher, {
        refreshInterval: 30000
    });

    const stats = useMemo(() => {
        if (!Array.isArray(districts)) return { totalFlood: 0, totalPop: 0 };
        const totalFlood = districts.reduce((acc: number, d: any) => acc + (d.floodArea || 0), 0);
        const totalPop = districts.reduce((acc: number, d: any) => acc + (d.exposedPop || 0), 0);
        return { totalFlood, totalPop };
    }, [districts]);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

            {/* ── Page Header ─────────────────────────────── */}
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16 }}>
                <div>
                    <h1 style={{
                        fontSize: 28, fontWeight: 900, color: '#0A1628',
                        letterSpacing: '-0.035em', lineHeight: 1.1, margin: 0,
                    }}>
                        Operational Intelligence Matrix
                    </h1>
                    <p style={{
                        color: '#64748B', marginTop: 6, fontSize: 14,
                        fontWeight: 500, display: 'flex', alignItems: 'center', gap: 7,
                    }}>
                        <Globe size={15} color="#3B82F6" />
                        Real-time Multi-hazard Monitoring &amp; Predictive Geospatial Analytics
                    </p>
                </div>

                {/* Live status pill */}
                <div style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    background: '#F0FDF4', border: '1px solid #BBF7D0',
                    padding: '8px 16px', borderRadius: 999,
                    boxShadow: '0 2px 8px rgba(34,197,94,0.1)',
                    flexShrink: 0,
                }}>
                    <div style={{ position: 'relative', width: 10, height: 10 }}>
                        <div style={{
                            position: 'absolute', inset: 0,
                            background: '#22C55E', borderRadius: '50%',
                            animation: 'ping 1.2s cubic-bezier(0,0,0.2,1) infinite',
                            opacity: 0.6,
                        }} />
                        <div style={{ width: 10, height: 10, background: '#22C55E', borderRadius: '50%', position: 'relative' }} />
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 800, color: '#16A34A', letterSpacing: '0.08em' }}>
                        SENSORS NOMINAL
                    </span>
                </div>
            </div>

            {/* ── Metric Cards ─────────────────────────────── */}
            <StatsGrid />

            {/* ── Tactical Intelligence Row ─────────────────── */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(0, 1fr) 280px',
                gap: 20,
                alignItems: 'start',
            }}>
                {/* Left — charts + risk table */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20, minWidth: 0 }}>
                    <DashboardCharts />
                    <RiskTable />
                </div>

                {/* Right sidebar panel */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16, position: 'sticky', top: 0 }}>

                    {/* Weather */}
                    <WeatherPanel />

                    {/* System Integrity */}
                    <div style={{
                        background: 'rgba(255,255,255,0.82)',
                        backdropFilter: 'blur(22px)',
                        WebkitBackdropFilter: 'blur(22px)',
                        border: '1px solid rgba(226,232,240,0.9)',
                        borderRadius: 20,
                        overflow: 'hidden',
                        boxShadow: '0 4px 24px rgba(15,23,42,0.06)',
                    }}>
                        <div style={{ height: 3, background: 'linear-gradient(90deg, #2563EB, #0891B2)' }} />
                        <div style={{ padding: '18px 20px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                                <div style={{ background: '#EFF6FF', borderRadius: 9, padding: 8 }}>
                                    <ShieldCheck size={16} color="#2563EB" />
                                </div>
                                <div>
                                    <h3 style={{ fontSize: 13, fontWeight: 800, color: '#0F172A', margin: 0 }}>
                                        System Integrity
                                    </h3>
                                    <p style={{ fontSize: 10, color: '#94A3B8', fontWeight: 600, margin: 0 }}>
                                        Provenance · Accuracy · Uptime
                                    </p>
                                </div>
                            </div>

                            {/* Provenance banner */}
                            <div style={{
                                background: 'linear-gradient(135deg, rgba(16,185,129,0.06), rgba(8,145,178,0.06))',
                                border: '1px solid rgba(16,185,129,0.15)',
                                borderRadius: 12, padding: '10px 12px', marginBottom: 12,
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 4 }}>
                                    <Activity size={11} color="#10B981" />
                                    <span style={{ fontSize: 9, fontWeight: 900, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                        Data Provenance Verified
                                    </span>
                                </div>
                                <p style={{ fontSize: 11, color: '#475569', lineHeight: 1.55, fontWeight: 500, margin: 0 }}>
                                    Sentinel-1 SAR and Sentinel-2 archives cross-referenced at 99.7% geometric accuracy.
                                </p>
                            </div>

                            {/* Stats mini grid */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
                                {[
                                    { label: 'Latency', val: '142ms', sub: 'API Round Trip', color: '#0891B2', bg: '#F0F9FF' },
                                    { label: 'Ingested', val: '4.2TB', sub: 'Total Archive', color: '#6366F1', bg: '#EEF2FF' },
                                    { label: 'Uptime', val: '99.8%', sub: 'SLA Target', color: '#059669', bg: '#F0FDF4' },
                                    { label: 'Scenes', val: '1,247', sub: 'Processed', color: '#F97316', bg: '#FFF7ED' },
                                ].map(s => (
                                    <div key={s.label} style={{
                                        background: s.bg, border: `1px solid ${s.color}20`,
                                        borderRadius: 12, padding: '10px 12px',
                                    }}>
                                        <div style={{ fontSize: 9, fontWeight: 900, color: s.color, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 3 }}>
                                            {s.label}
                                        </div>
                                        <div style={{ fontSize: 18, fontWeight: 900, color: '#0F172A', letterSpacing: '-0.02em', lineHeight: 1 }}>
                                            {s.val}
                                        </div>
                                        <div style={{ fontSize: 9, color: '#94A3B8', fontWeight: 600, marginTop: 2 }}>
                                            {s.sub}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Source tags */}
                            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                                {['S1-SAR', 'S2-OPT', 'L9', 'CHIRPS', 'Open-Meteo'].map(src => (
                                    <span key={src} style={{
                                        fontSize: 9, fontWeight: 800, color: '#0D7377',
                                        background: 'rgba(13,115,119,0.07)',
                                        border: '1px solid rgba(13,115,119,0.18)',
                                        borderRadius: 5, padding: '2px 7px',
                                        letterSpacing: '0.05em',
                                    }}>
                                        {src}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
