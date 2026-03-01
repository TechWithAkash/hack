'use client';

import React from 'react';
import { useStudio } from '@/components/studio/StudioContext';
import dynamic from 'next/dynamic';
import { useState, useMemo } from 'react';
import useSWR from 'swr';
import { fetcher } from '@/lib/api/fetcher';
import { formatArea, formatPopulation, formatScore } from '@/lib/utils/formatters';
import {
    Droplets, SatelliteDish, Sun, Moon,
    RefreshCw, AlertTriangle, Activity, Users,
    TrendingUp, Shield, Map as MapIcon, Layers,
    ChevronRight, Info, Crosshair
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
    PieChart, Pie, Cell, ResponsiveContainer,
    BarChart, Bar, XAxis, YAxis, Tooltip,
    AreaChart, Area
} from 'recharts';

/* ── Dynamic map import ── */
const FloodMap = dynamic(() => import('@/components/map/FloodMap'), {
    ssr: false,
    loading: () => (
        <div style={{
            height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: '#F8FAFC', color: '#64748B', fontSize: 13, gap: 10, flexDirection: 'column',
        }}>
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-slate-200 border-t-teal-600" />
            <span style={{ fontWeight: 600 }}>Syncing satellite uplink matrix…</span>
        </div>
    ),
});

type TileMode = 'dark' | 'satellite' | 'light';
type RiskFilter = 'ALL' | 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

const RISK_PALETTE: Record<string, string> = {
    CRITICAL: '#FF2E2E',
    HIGH: '#FF8A00',
    MEDIUM: '#FFD600',
    LOW: '#00FF85',
    ALL: '#64748B'
};

const CHART_COLORS = ['#EF4444', '#F97316', '#EAB308', '#22C55E'];

export default function GeospatialMapPage() {
    const { data: floodData, mutate } = useSWR(
        '/api/insights/latest?limit=100', fetcher,
        { refreshInterval: 60_000 },
    );
    const allEvents: any[] = floodData?.events ?? [];

    const [riskFilter, setRiskFilter] = useState<RiskFilter>('ALL');
    const [tileMode, setTileMode] = useState<TileMode>('satellite');
    const [refreshing, setRefreshing] = useState(false);
    const [showStudio, setShowStudio] = useState(false);
    const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
    const [geeLoading, setGeeLoading] = useState(false);
    const [geeTiles, setGeeTiles] = useState<Record<string, string> | undefined>(undefined);

    const [cfg, setCfg] = useState({
        min_lon: 89.7, max_lon: 96.0,
        min_lat: 24.1, max_lat: 28.2,
        pre_start: '2022-05-01', pre_end: '2022-05-31',
        post_start: '2022-06-01', post_end: '2022-06-30',
        threshold: -2.0, ndvi_thresh: -0.12, cloud_pct: 25,
        sar_conf_base: 0.90, opt_conf_base: 0.80, scale: 150,
        run: true
    });

    const events = useMemo(() => {
        return riskFilter === 'ALL'
            ? allEvents
            : allEvents.filter((e: any) => e.riskLevel === riskFilter);
    }, [allEvents, riskFilter]);

    const selectedEvent = useMemo(() => {
        return allEvents.find(e => e._id === selectedEventId) || events[0];
    }, [allEvents, selectedEventId, events]);

    /* Stats Derivation */
    const stats = useMemo(() => {
        const counts = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 };
        let totalPop = 0;
        let totalArea = 0;

        allEvents.forEach(e => {
            if (counts[e.riskLevel as keyof typeof counts] !== undefined) {
                counts[e.riskLevel as keyof typeof counts]++;
            }
            totalPop += (e.affectedPopEst ?? 0);
            totalArea += (e.floodAreaKm2 ?? 0);
        });

        const pieData = Object.entries(counts).map(([name, value]) => ({ name, value }));
        const barData = allEvents.slice(0, 8).map(e => ({
            name: e.districtId?.districtName || 'Zone',
            conf: e.confidenceScore * 100
        })).sort((a, b) => b.conf - a.conf);

        return { counts, totalPop, totalArea, pieData, barData };
    }, [allEvents]);

    const handleRefresh = async () => {
        setRefreshing(true);
        await mutate();
        setRefreshing(false);
        toast.success('Geospatial telemetry updated');
    };

    const handleRunGEE = async () => {
        setGeeLoading(true);
        toast.loading('Initializing GEE Distributed Processing...', { id: 'gee' });
        try {
            const res = await fetch('/api/studio/run', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(cfg),
            });
            const data = await res.json();
            if (!data.success) {
                toast.error(`Pipeline Error: ${data.error}`, { id: 'gee' });
            } else {
                setGeeTiles(data.tiles);
                toast.success('Distributed processing complete!', { id: 'gee' });
                setShowStudio(false);
                mutate();
            }
        } catch (e: any) {
            toast.error('Sync failed', { id: 'gee' });
        } finally {
            setGeeLoading(false);
        }
    };

    return (
        <div style={{
            height: 'calc(100vh - 120px)',
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            background: '#F8FAFC',
            padding: '4px'
        }}>
            {/* Top Operational Header */}
            <div className="operational-card" style={{
                padding: '12px 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'white',
                borderRadius: 16
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{
                        width: 40, height: 40, borderRadius: 12, background: '#F0FDFA',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0D7377'
                    }}>
                        <MapIcon size={20} />
                    </div>
                    <div>
                        <h1 style={{ fontSize: 18, fontWeight: 950, color: '#0F172A', letterSpacing: '-0.02em', margin: 0 }}>
                            Geospatial Intelligence Matrix
                        </h1>
                        <p style={{ fontSize: 10, color: '#64748B', fontWeight: 700, margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Currently monitoring {allEvents.length} active flood anomalies
                        </p>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                    <button
                        onClick={handleRefresh}
                        className="operational-card"
                        style={{ padding: '8px 16px', fontSize: 11, fontWeight: 900, display: 'flex', gap: 8, alignItems: 'center', background: 'white', cursor: 'pointer' }}
                    >
                        <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
                        Update Telemetry
                    </button>
                </div>
            </div>

            {/* Main Content Area: 3-Column Layout */}
            <div style={{ display: 'flex', gap: 16, flex: 1, minHeight: 0 }}>

                {/* Left Intel Column */}
                <div style={{ width: 320, display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {/* Severity Summary Chips */}
                    <div className="grid grid-cols-2 gap-2">
                        {Object.entries(stats.counts).map(([level, count]) => (
                            <button
                                key={level}
                                onClick={() => setRiskFilter(level as RiskFilter)}
                                style={{
                                    padding: '12px', borderRadius: 12, border: '1px solid #E2E8F0',
                                    background: riskFilter === level ? RISK_PALETTE[level] : 'white',
                                    color: riskFilter === level ? 'white' : '#0F172A',
                                    textAlign: 'left', transition: 'all 0.2s', cursor: 'pointer'
                                }}
                            >
                                <div style={{ fontSize: 18, fontWeight: 950, lineHeight: 1 }}>{count}</div>
                                <div style={{ fontSize: 9, fontWeight: 800, opacity: 0.8, textTransform: 'uppercase', marginTop: 4 }}>{level}</div>
                            </button>
                        ))}
                    </div>

                    {/* Zone Navigator List */}
                    <div className="operational-card" style={{ flex: 1, padding: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                        <div style={{ padding: '16px', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: 10, fontWeight: 950, color: '#94A3B8', letterSpacing: '0.1em' }}>{events.length} ACTIVE CLASSIFICATIONS</span>
                            <Layers size={14} style={{ color: '#94A3B8' }} />
                        </div>
                        <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
                            {events.map((e) => (
                                <div
                                    key={e._id}
                                    onClick={() => setSelectedEventId(e._id)}
                                    style={{
                                        padding: '12px', borderRadius: 10, marginBottom: 4, cursor: 'pointer',
                                        background: selectedEventId === e._id ? '#F8FAFC' : 'transparent',
                                        border: selectedEventId === e._id ? '1px solid #E2E8F0' : '1px solid transparent',
                                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                        transition: 'all 0.2s'
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.background = '#F8FAFC'}
                                    onMouseLeave={e => { if (selectedEventId !== e.currentTarget.id) e.currentTarget.style.background = 'transparent' }}
                                >
                                    <div>
                                        <div style={{ fontSize: 12, fontWeight: 800, color: '#0F172A' }}>{e.districtId?.districtName || 'Zone'}</div>
                                        <div style={{ fontSize: 10, color: '#64748B', fontWeight: 600 }}>Flood Detection · {(e.confidenceScore * 100).toFixed(0)}% Conf</div>
                                    </div>
                                    <div style={{
                                        padding: '2px 6px', borderRadius: 4, fontSize: 8, fontWeight: 950,
                                        background: `${RISK_PALETTE[e.riskLevel as string]}15`,
                                        color: RISK_PALETTE[e.riskLevel as string],
                                        border: `1px solid ${RISK_PALETTE[e.riskLevel as string]}30`
                                    }}>
                                        {e.riskLevel}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Center Map Column */}
                <div style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div className="operational-card" style={{ flex: 1, padding: 0, overflow: 'hidden', position: 'relative', border: 'none', background: '#F1F5F9' }}>
                        <FloodMap
                            events={events}
                            tileMode={tileMode}
                            geeTiles={geeTiles}
                            onSelect={setSelectedEventId}
                            selectedId={selectedEventId}
                        />

                        {/* Map Controls Overlay */}
                        <div style={{ position: 'absolute', top: 16, right: 16, zIndex: 1000, display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {(['satellite', 'light', 'dark'] as TileMode[]).map(t => (
                                <button
                                    key={t}
                                    onClick={() => setTileMode(t)}
                                    style={{
                                        width: 36, height: 36, borderRadius: 10, background: 'white', border: '1px solid #E2E8F0',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', color: tileMode === t ? '#0F172A' : '#94A3B8',
                                        cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                    }}
                                >
                                    {t === 'satellite' ? <SatelliteDish size={16} /> : t === 'light' ? <Sun size={16} /> : <Moon size={16} />}
                                </button>
                            ))}
                        </div>

                        {/* Pulse Marker Indicator */}
                        <div style={{ position: 'absolute', top: 16, left: 16, zIndex: 1000 }}>
                            <div style={{
                                background: 'rgba(255,255,255,0.9)', padding: '8px 16px', borderRadius: 20,
                                display: 'flex', alignItems: 'center', gap: 8, border: '1px solid #E2E8F0',
                                backdropFilter: 'blur(10px)', boxShadow: '0 8px 24px rgba(0,0,0,0.1)'
                            }}>
                                <div className="pulse-dot" style={{ background: '#EF4444' }} />
                                <span style={{ fontSize: 10, fontWeight: 900, color: '#0F172A', letterSpacing: '0.05em' }}>Telemetry Downlink Active</span>
                            </div>
                        </div>
                    </div>

                    {/* Focus Details Card (Bottom Overlay) */}
                    {selectedEvent && (
                        <div className="operational-card" style={{
                            padding: '20px 24px', position: 'relative', background: 'white',
                            display: 'flex', gap: 32, alignItems: 'center'
                        }}>
                            <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                                <div style={{
                                    width: 48, height: 48, borderRadius: 14,
                                    background: `${RISK_PALETTE[selectedEvent.riskLevel as string]}15`,
                                    color: RISK_PALETTE[selectedEvent.riskLevel as string],
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}>
                                    <AlertTriangle size={24} />
                                </div>
                                <div>
                                    <h2 style={{ fontSize: 20, fontWeight: 950, color: '#0F172A', margin: 0 }}>
                                        {selectedEvent.districtId?.districtName || 'Zone Alpha'}
                                    </h2>
                                    <div style={{ fontSize: 11, color: '#64748B', fontWeight: 600, display: 'flex', gap: 8, marginTop: 4 }}>
                                        <span>{selectedEvent.districtId?.stateName || 'Bihar'}</span>
                                        <span style={{ color: '#CBD5E1' }}>•</span>
                                        <span style={{ color: RISK_PALETTE[selectedEvent.riskLevel as string], fontWeight: 900 }}>{selectedEvent.riskLevel} RISK</span>
                                    </div>
                                </div>
                            </div>

                            <div style={{ height: 40, width: 1, background: '#F1F5F9' }} />

                            <div style={{ display: 'flex', gap: 32, flex: 1 }}>
                                <div>
                                    <div style={{ fontSize: 18, fontWeight: 950, color: '#0F172A' }}>{formatArea(selectedEvent.floodAreaKm2 ?? 0)}</div>
                                    <div style={{ fontSize: 9, fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase' }}>Affected Surface</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: 18, fontWeight: 950, color: '#0F172A' }}>{formatPopulation(selectedEvent.affectedPopEst ?? 0)}</div>
                                    <div style={{ fontSize: 9, fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase' }}>Exposed Population</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: 18, fontWeight: 950, color: '#0F172A' }}>{formatScore(selectedEvent.confidenceScore * 100)}%</div>
                                    <div style={{ fontSize: 9, fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase' }}>Spatial Accuracy</div>
                                </div>
                            </div>

                            <button style={{
                                padding: '12px 24px', borderRadius: 12, background: '#F8FAFC', color: '#0F172A',
                                border: '1px solid #E2E8F0', fontWeight: 900, fontSize: 11, cursor: 'pointer'
                                // onClick={() => window.open(`/api/reports/generate?id=${selectedEvent._id}`, '_blank')}
                            }}>
                                Full Incident Report
                            </button>
                        </div>
                    )}
                </div>

            </div>

        </div>
    );
}
