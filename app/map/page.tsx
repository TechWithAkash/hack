'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import useSWR from 'swr';
import { fetcher } from '@/lib/api/fetcher';
import {
    Droplets, SatelliteDish, Sun, Moon,
    RefreshCw, AlertTriangle, Activity, Users,
    TrendingUp, Shield,
} from 'lucide-react';

/* ── Dynamic map import (no SSR — Leaflet needs window) ── */
const FloodMap = dynamic(() => import('@/components/map/FloodMap'), {
    ssr: false,
    loading: () => (
        <div style={{
            height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'linear-gradient(135deg, #0A1628 0%, #0D1B2A 100%)',
            color: '#64748B', fontSize: 13, gap: 10, flexDirection: 'column',
        }}>
            <div style={{
                width: 40, height: 40, border: '3px solid #1E3A5F',
                borderTopColor: '#0D7377', borderRadius: '50%',
                animation: 'spin 0.8s linear infinite',
            }} />
            <span>Initialising satellite flood map…</span>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
    ),
});

/* ── Types ────────────────────────────────────────────── */
type TileMode = 'dark' | 'satellite' | 'light';
type RiskFilter = 'ALL' | 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

const RISK_COLORS: Record<string, string> = {
    CRITICAL: '#EF4444', HIGH: '#F97316', MEDIUM: '#EAB308', LOW: '#22C55E',
};

/* ── Button helpers ───────────────────────────────────── */
const tileBtn = (active: boolean) => ({
    display: 'flex', alignItems: 'center', gap: 5,
    padding: '7px 14px', borderRadius: 8, fontSize: 11, fontWeight: 600,
    cursor: 'pointer', transition: 'all 0.18s',
    border: active ? '1.5px solid #0D7377' : '1.5px solid rgba(255,255,255,0.08)',
    background: active ? 'rgba(13,115,119,0.22)' : 'rgba(255,255,255,0.03)',
    color: active ? '#5EEAD4' : '#64748B',
} as React.CSSProperties);

const riskChip = (level: string, active: boolean) => ({
    display: 'flex', alignItems: 'center', gap: 6,
    padding: '5px 12px', borderRadius: 7, fontSize: 11, fontWeight: 700,
    cursor: 'pointer', transition: 'all 0.18s',
    border: `1.5px solid ${RISK_COLORS[level] ?? '#94A3B8'}${active ? '' : '50'}`,
    background: active ? `${RISK_COLORS[level] ?? '#94A3B8'}22` : 'transparent',
    color: active ? (RISK_COLORS[level] ?? '#94A3B8') : `${RISK_COLORS[level] ?? '#94A3B8'}70`,
} as React.CSSProperties);

/* ── Stat card ────────────────────────────────────────── */
function StatCard({ icon, label, value, sub, color }: {
    icon: React.ReactNode; label: string;
    value: string | number; sub?: string; color: string;
}) {
    return (
        <div style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '12px 16px', borderRadius: 12,
            background: '#FFFFFF', border: '1px solid #E2E8F0',
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
        }}>
            <div style={{
                width: 36, height: 36, borderRadius: 9, flexShrink: 0,
                background: `${color}15`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
                {icon}
            </div>
            <div>
                <div style={{ fontSize: 10, color: '#94A3B8', fontWeight: 500, letterSpacing: '0.04em' }}>
                    {label}
                </div>
                <div style={{ fontSize: 18, fontWeight: 800, color, lineHeight: 1.2 }}>{value}</div>
                {sub && <div style={{ fontSize: 10, color: '#CBD5E1', marginTop: 1 }}>{sub}</div>}
            </div>
        </div>
    );
}

import React from 'react';

/* ════════════════════════════════════════════════════════
   FLOOD MAP PAGE — PS-06 ALIGNED
   ════════════════════════════════════════════════════════ */
export default function FloodMapPage() {
    // All flood events — both GEE ENSEMBLE (satellite) and WEATHER_ESTIMATE (Open-Meteo)
    // The map distinguishes them visually: solid polygons = satellite, dashed = weather estimate
    const { data: floodData, mutate } = useSWR(
        '/api/insights/latest?limit=50', fetcher,
        { refreshInterval: 120_000 },
    );
    const allEvents: any[] = floodData?.events ?? [];

    // Filter + tile state
    const [riskFilter, setRiskFilter] = useState<RiskFilter>('ALL');
    const [tileMode, setTileMode] = useState<TileMode>('dark');
    const [refreshing, setRefreshing] = useState(false);

    const events = riskFilter === 'ALL'
        ? allEvents
        : allEvents.filter((e: any) => e.riskLevel === riskFilter);

    // Aggregated stats from ALL events (not filtered)
    const totalFloodKm2 = allEvents.reduce((s, e) => s + (e.floodAreaKm2 ?? 0), 0);
    const totalAffectedPop = allEvents.reduce((s, e) => s + (e.affectedPopEst ?? 0), 0);
    const criticalCount = allEvents.filter((e: any) => e.riskLevel === 'CRITICAL').length;
    const highCount = allEvents.filter((e: any) => e.riskLevel === 'HIGH').length;

    const handleRefresh = async () => {
        setRefreshing(true);
        await mutate();
        setRefreshing(false);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* ── Page header ──────────────────────────────── */}
            <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <div style={{
                        width: 3, height: 22,
                        background: 'linear-gradient(180deg, #0D7377, #22C55E)',
                        borderRadius: 2,
                    }} />
                    <h1 style={{ fontSize: 18, fontWeight: 800, color: '#0A1628', letterSpacing: '-0.02em' }}>
                        Satellite Flood Detection Map
                    </h1>
                </div>
                <p style={{ fontSize: 12, color: '#94A3B8', marginLeft: 11 }}>
                    GEE Sentinel-1 SAR + Sentinel-2 NDWI · Open-Meteo Weather Estimates · India Nationwide Coverage
                </p>
            </div>

            {/* ── Stats bar ────────────────────────────────── */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
                gap: 10,
            }}>
                <StatCard
                    icon={<Droplets size={18} color="#0D7377" />}
                    label="Active Flood Zones"
                    value={allEvents.length}
                    sub="Districts tracked"
                    color="#0D7377"
                />
                <StatCard
                    icon={<AlertTriangle size={18} color="#EF4444" />}
                    label="Critical Risk Zones"
                    value={criticalCount}
                    sub="immediate action"
                    color="#EF4444"
                />
                <StatCard
                    icon={<TrendingUp size={18} color="#F97316" />}
                    label="High Risk Zones"
                    value={highCount}
                    sub="close monitoring"
                    color="#F97316"
                />
                <StatCard
                    icon={<Activity size={18} color="#0369A1" />}
                    label="Total Flood Area"
                    value={`${totalFloodKm2.toFixed(0)} km²`}
                    sub="GEE + Weather Estimates"
                    color="#0369A1"
                />
                <StatCard
                    icon={<Users size={18} color="#7C3AED" />}
                    label="Population at Risk"
                    value={totalAffectedPop > 1000
                        ? `${(totalAffectedPop / 1000).toFixed(0)}K`
                        : totalAffectedPop.toString()}
                    sub="WorldPop 2020"
                    color="#7C3AED"
                />
            </div>

            {/* ── Map card ─────────────────────────────────── */}
            <div style={{
                display: 'flex', flexDirection: 'column',
                background: 'linear-gradient(135deg, #060E1C 0%, #0A1628 100%)',
                borderRadius: 16, overflow: 'hidden',
                border: '1px solid rgba(13,115,119,0.25)',
                boxShadow: '0 24px 64px rgba(0,0,0,0.45)',
            }}>
                {/* Toolbar */}
                <div style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    flexWrap: 'wrap', padding: '12px 18px',
                    borderBottom: '1px solid rgba(255,255,255,0.06)',
                    background: 'rgba(6,14,28,0.96)', backdropFilter: 'blur(12px)',
                }}>
                    {/* Risk filter chips */}
                    <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
                        <Shield size={11} color="#64748B" />
                        <span style={{ fontSize: 10, color: '#64748B', fontWeight: 600, marginRight: 3 }}>RISK</span>
                        {(['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as RiskFilter[]).map(level => (
                            <button
                                key={level}
                                style={riskChip(level === 'ALL' ? '#94A3B8' : level, riskFilter === level)}
                                onClick={() => setRiskFilter(level)}
                            >
                                <div style={{
                                    width: 6, height: 6, borderRadius: '50%',
                                    background: level === 'ALL' ? '#94A3B8' : RISK_COLORS[level],
                                    display: level === 'ALL' ? 'none' : 'block',
                                }} />
                                {level === 'ALL'
                                    ? `All (${allEvents.length})`
                                    : `${level} (${allEvents.filter(e => e.riskLevel === level).length})`}
                            </button>
                        ))}
                    </div>

                    {/* Spacer */}
                    <div style={{ marginLeft: 'auto', display: 'flex', gap: 6, alignItems: 'center' }}>
                        {/* Tile switcher */}
                        {(['dark', 'satellite', 'light'] as TileMode[]).map(t => (
                            <button key={t} style={tileBtn(tileMode === t)} onClick={() => setTileMode(t)}>
                                {t === 'dark'
                                    ? <Moon size={11} />
                                    : t === 'satellite'
                                        ? <SatelliteDish size={11} />
                                        : <Sun size={11} />}
                                {t.charAt(0).toUpperCase() + t.slice(1)}
                            </button>
                        ))}
                        <div style={{ width: 1, height: 18, background: 'rgba(255,255,255,0.08)' }} />
                        <button
                            style={{
                                ...tileBtn(false),
                                color: refreshing ? '#5EEAD4' : '#64748B',
                            }}
                            onClick={handleRefresh}
                            disabled={refreshing}
                        >
                            <RefreshCw
                                size={11}
                                style={{ animation: refreshing ? 'spin 0.8s linear infinite' : 'none' }}
                            />
                            Refresh
                        </button>
                    </div>
                </div>

                {/* Map */}
                <div style={{ position: 'relative', height: 580, minHeight: 580 }}>
                    <FloodMap
                        events={events}
                        tileMode={tileMode}
                    />

                    {/* LIVE badge */}
                    <div style={{
                        position: 'absolute', top: 12, left: 12, zIndex: 800,
                        display: 'flex', flexDirection: 'column', gap: 6,
                    }}>
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: 6,
                            background: 'rgba(6,14,28,0.9)', backdropFilter: 'blur(8px)',
                            border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8,
                            padding: '6px 12px',
                        }}>
                            <div style={{
                                width: 7, height: 7, borderRadius: '50%',
                                background: '#22C55E', boxShadow: '0 0 8px #22C55E',
                                animation: 'fadePulse 2s ease-in-out infinite',
                            }} />
                            <span style={{ fontSize: 10, fontWeight: 700, color: '#22C55E', letterSpacing: '0.06em' }}>
                                LIVE FLOOD SITUATION
                            </span>
                        </div>
                        <div style={{
                            fontSize: 10, color: '#64748B', padding: '4px 10px',
                            background: 'rgba(6,14,28,0.85)', borderRadius: 6,
                            border: '1px solid rgba(255,255,255,0.07)',
                        }}>
                            Satellite Detections + Weather Estimates
                        </div>
                    </div>

                    {/* Zone count badge (top-right) */}
                    <div style={{
                        position: 'absolute', top: 12, right: 12, zIndex: 800,
                        background: 'rgba(6,14,28,0.92)', backdropFilter: 'blur(8px)',
                        border: '1px solid rgba(13,115,119,0.35)', borderRadius: 10,
                        padding: '10px 14px', textAlign: 'center' as const,
                    }}>
                        <div style={{ fontSize: 24, fontWeight: 900, color: '#5EEAD4', lineHeight: 1 }}>
                            {events.length}
                        </div>
                        <div style={{ fontSize: 9, color: '#94A3B8', marginTop: 2, letterSpacing: '0.05em' }}>
                            FLOOD ZONES
                        </div>
                        <div style={{ fontSize: 9, color: '#475569', marginTop: 1 }}>
                            {riskFilter === 'ALL' ? 'all risk levels' : riskFilter + ' only'}
                        </div>
                    </div>
                </div>

                {/* Legend */}
                <div style={{
                    display: 'flex', alignItems: 'center', gap: 16,
                    padding: '11px 18px', flexWrap: 'wrap' as const,
                    borderTop: '1px solid rgba(255,255,255,0.06)',
                    background: 'rgba(6,14,28,0.95)',
                }}>
                    <span style={{ fontSize: 10, color: '#0D7377', fontWeight: 700, letterSpacing: '0.06em' }}>
                        💧 FLOOD RISK
                    </span>
                    {(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as const).map(level => (
                        <div key={level} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <div style={{
                                width: 12, height: 12, borderRadius: 3,
                                background: `${RISK_COLORS[level]}35`,
                                border: `2px solid ${RISK_COLORS[level]}`,
                            }} />
                            <span style={{ fontSize: 10, color: '#94A3B8', fontWeight: 500 }}>{level}</span>
                        </div>
                    ))}
                    {/* Source legend */}
                    <div style={{ marginLeft: 12, display: 'flex', alignItems: 'center', gap: 14 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                            <div style={{
                                width: 22, height: 3, borderRadius: 2,
                                background: '#0D7377',
                            }} />
                            <span style={{ fontSize: 10, color: '#5EEAD4', fontWeight: 600 }}>🛰 GEE Satellite</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                            <div style={{
                                width: 22, height: 3, borderRadius: 2,
                                background: 'repeating-linear-gradient(90deg,#7C3AED 0,#7C3AED 5px,transparent 5px,transparent 9px)',
                            }} />
                            <span style={{ fontSize: 10, color: '#A78BFA', fontWeight: 600 }}>🌧 Weather Estimate</span>
                        </div>
                    </div>
                    <div style={{ marginLeft: 'auto', fontSize: 10, color: '#334155' }}>
                        Click any zone for detection details
                    </div>
                </div>
            </div>

            {/* ── Detection Method Info Cards ────────────────── */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {/* Satellite GEE card */}
                <div style={{
                    display: 'flex', alignItems: 'flex-start', gap: 12,
                    background: 'rgba(13,115,119,0.05)', border: '1px solid rgba(13,115,119,0.18)',
                    borderRadius: 12, padding: '14px 16px',
                }}>
                    <SatelliteDish size={15} color="#0D7377" style={{ marginTop: 1, flexShrink: 0 }} />
                    <div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: '#0D7377', marginBottom: 4 }}>
                            🛰 GEE · Sentinel-1 SAR + Sentinel-2 NDWI
                        </div>
                        <p style={{ fontSize: 11, color: '#64748B', lineHeight: 1.6, margin: 0 }}>
                            <strong>Solid polygons</strong> — VV backscatter decrease &gt;2 dB vs 30–60 day
                            reference period (SAR change detection) combined with NDWI &gt; 0.1 optical
                            water mask. High-confidence pixel-level flood boundary. Run GEE Pipeline to generate.
                        </p>
                    </div>
                </div>
                {/* Weather estimate card */}
                <div style={{
                    display: 'flex', alignItems: 'flex-start', gap: 12,
                    background: 'rgba(124,58,237,0.05)', border: '1px solid rgba(124,58,237,0.18)',
                    borderRadius: 12, padding: '14px 16px',
                }}>
                    <Activity size={15} color="#7C3AED" style={{ marginTop: 1, flexShrink: 0 }} />
                    <div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: '#7C3AED', marginBottom: 4 }}>
                            🌧 Open-Meteo Rainfall Risk Estimate
                        </div>
                        <p style={{ fontSize: 11, color: '#64748B', lineHeight: 1.6, margin: 0 }}>
                            <strong>Dashed polygons</strong> — Flood area estimated from 7-day accumulated
                            rainfall, elevation vulnerability index, and population density.
                            Available immediately via "Fetch Live Data". Lower confidence (72%) than satellite detection.
                        </p>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes fadePulse { 0%,100%{opacity:1} 50%{opacity:0.35} }
                @keyframes spin { to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
}
