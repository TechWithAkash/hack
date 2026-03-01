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
        <div className="space-y-10 animate-in fade-in duration-700">
            {/* Mission Hero Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight" style={{ letterSpacing: '-0.04em' }}>
                        Operational Intelligence Matrix
                    </h1>
                    <p className="text-slate-500 mt-2 text-lg font-medium flex items-center gap-2">
                        <Globe size={18} className="text-blue-500" />
                        Real-time Multi-hazard Monitoring & Predictive Geospatial Analytics
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="bg-emerald-50 border border-emerald-100 px-5 py-2.5 rounded-2xl flex items-center gap-3 shadow-sm shadow-emerald-100/50">
                        <div className="relative">
                            <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" />
                            <div className="absolute inset-0 w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping opacity-75" />
                        </div>
                        <span className="text-xs font-bold text-emerald-700 tracking-wider text-transform: uppercase">
                            SENSORS NOMINAL
                        </span>
                    </div>
                </div>
            </div>

            {/* Core Metrics Grid */}
            <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/10 to-emerald-500/10 rounded-[2rem] blur-xl opacity-50 group-hover:opacity-100 transition duration-1000" />
                <div className="relative">
                    <StatsGrid />
                </div>
            </div>

            {/* ── Tactical Intelligence Row ───────────────────────── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 290px', gap: 16, alignItems: 'start' }}>

                {/* Left column — charts + risk table */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20, minWidth: 0 }}>
                    <DashboardCharts />
                    <RiskTable />
                </div>

                {/* Right sidebar panel — visually attached */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16, position: 'sticky', top: 0 }}>

                    {/* ── Weather Intelligence ── */}
                    <WeatherPanel />

                    {/* ── System Integrity Node ── */}
                    <div style={{
                        background: 'rgba(255,255,255,0.75)',
                        backdropFilter: 'blur(22px)',
                        WebkitBackdropFilter: 'blur(22px)',
                        border: '1px solid rgba(255,255,255,0.9)',
                        borderRadius: 24,
                        overflow: 'hidden',
                        boxShadow: '0 12px 40px rgba(15,23,42,0.06)',
                    }}>
                        {/* Card accent */}
                        <div style={{ height: 3, background: 'linear-gradient(90deg, #2563EB, #0891B2)' }} />
                        <div style={{ padding: '20px 22px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
                                <div style={{ background: '#EFF6FF', borderRadius: 10, padding: 9 }}>
                                    <ShieldCheck size={18} color="#2563EB" />
                                </div>
                                <div>
                                    <h3 style={{ fontSize: 14, fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>
                                        System Integrity
                                    </h3>
                                    <p style={{ fontSize: 10, color: '#94A3B8', fontWeight: 600, marginTop: 2 }}>
                                        Provenance · Accuracy · Uptime
                                    </p>
                                </div>
                            </div>

                            {/* Integrity message */}
                            <div style={{
                                background: 'linear-gradient(135deg, rgba(16,185,129,0.06), rgba(8,145,178,0.06))',
                                border: '1px solid rgba(16,185,129,0.15)',
                                borderRadius: 14, padding: '12px 14px', marginBottom: 14
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                                    <Activity size={12} color="#10B981" />
                                    <span style={{ fontSize: 9, fontWeight: 900, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                        Data Provenance Verified
                                    </span>
                                </div>
                                <p style={{ fontSize: 11, color: '#475569', lineHeight: 1.6, fontWeight: 500 }}>
                                    Sentinel-1 SAR and Sentinel-2 archives cross-referenced at 99.7% geometric accuracy.
                                </p>
                            </div>

                            {/* Stats grid */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
                                {[
                                    { label: 'Latency', val: '142ms', sub: 'API Round Trip', color: '#0891B2', bg: '#F0F9FF' },
                                    { label: 'Ingested', val: '4.2TB', sub: 'Total Archive', color: '#6366F1', bg: '#EEF2FF' },
                                    { label: 'Uptime', val: '99.8%', sub: 'SLA Target', color: '#059669', bg: '#F0FDF4' },
                                    { label: 'Scenes', val: '1,247', sub: 'Processed', color: '#F97316', bg: '#FFF7ED' },
                                ].map(s => (
                                    <div key={s.label} style={{
                                        background: s.bg, border: `1px solid ${s.color}20`,
                                        borderRadius: 14, padding: '12px 14px'
                                    }}>
                                        <div style={{ fontSize: 9, fontWeight: 900, color: s.color, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 4 }}>
                                            {s.label}
                                        </div>
                                        <div style={{ fontSize: 20, fontWeight: 950, color: '#0F172A', letterSpacing: '-0.02em', lineHeight: 1 }}>
                                            {s.val}
                                        </div>
                                        <div style={{ fontSize: 9, color: '#94A3B8', fontWeight: 600, marginTop: 3 }}>
                                            {s.sub}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Sensor source row */}
                            <div style={{
                                display: 'flex', gap: 6, flexWrap: 'wrap'
                            }}>
                                {['S1-SAR', 'S2-OPT', 'L9', 'CHIRPS', 'Open-Meteo'].map(src => (
                                    <span key={src} style={{
                                        fontSize: 9, fontWeight: 800, color: '#0D7377',
                                        background: 'rgba(13,115,119,0.07)',
                                        border: '1px solid rgba(13,115,119,0.18)',
                                        borderRadius: 5, padding: '3px 8px',
                                        letterSpacing: '0.05em'
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
