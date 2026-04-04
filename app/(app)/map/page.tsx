'use client';

import React, { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import useSWR from 'swr';
import { fetcher } from '@/lib/api/fetcher';
import { formatArea, formatPopulation, formatScore } from '@/lib/utils/formatters';
import {
    RefreshCw, AlertTriangle, Map as MapIcon, Layers,
    SatelliteDish, Sun, Moon, Users, Activity,
} from 'lucide-react';
import toast from 'react-hot-toast';

/* ── Dynamic map (SSR-off) ─────────────────────────────── */
const FloodMap = dynamic(() => import('@/components/map/FloodMap'), {
    ssr: false,
    loading: () => (
        <div style={{
            height: '100%', display: 'flex', alignItems: 'center',
            justifyContent: 'center', background: '#F8FAFC',
            flexDirection: 'column', gap: 12, color: '#64748B',
        }}>
            <div style={{
                width: 32, height: 32, borderRadius: '50%',
                border: '3px solid #E2E8F0', borderTopColor: '#0D7377',
                animation: 'spin 0.8s linear infinite',
            }} />
            <span style={{ fontSize: 12, fontWeight: 600 }}>Loading map…</span>
        </div>
    ),
});

type TileMode   = 'satellite' | 'light' | 'dark';
type RiskFilter = 'ALL' | 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

const RISK_COLOR: Record<string, string> = {
    CRITICAL: '#EF4444',
    HIGH:     '#F97316',
    MEDIUM:   '#D97706',
    LOW:      '#10B981',
    ALL:      '#64748B',
};

const RISK_BG: Record<string, string> = {
    CRITICAL: '#FEF2F2',
    HIGH:     '#FFF7ED',
    MEDIUM:   '#FFFBEB',
    LOW:      '#F0FDF4',
    ALL:      '#F8FAFC',
};

const TILE_ICONS: Record<TileMode, React.ReactNode> = {
    satellite: <SatelliteDish size={14} />,
    light:     <Sun size={14} />,
    dark:      <Moon size={14} />,
};

/* ── Risk filter chip ──────────────────────────────────── */
function FilterChip({
    level, count, active, onClick,
}: { level: string; count: number; active: boolean; onClick: () => void }) {
    const color = RISK_COLOR[level];
    return (
        <button
            onClick={onClick}
            style={{
                padding: '8px 12px', borderRadius: 10, cursor: 'pointer',
                border: `1px solid ${active ? color : '#E2E8F0'}`,
                background: active ? color : 'white',
                color: active ? 'white' : '#0F172A',
                display: 'flex', flexDirection: 'column', gap: 2,
                transition: 'all 0.15s ease', textAlign: 'left',
            }}
            onMouseEnter={e => {
                if (!active) {
                    e.currentTarget.style.borderColor = color;
                    e.currentTarget.style.background = RISK_BG[level];
                }
            }}
            onMouseLeave={e => {
                if (!active) {
                    e.currentTarget.style.borderColor = '#E2E8F0';
                    e.currentTarget.style.background = 'white';
                }
            }}
        >
            <span style={{ fontSize: 16, fontWeight: 800, lineHeight: 1 }}>{count}</span>
            <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', opacity: 0.8 }}>
                {level}
            </span>
        </button>
    );
}

/* ── Event list row ────────────────────────────────────── */
function EventRow({
    event, selected, onSelect,
}: { event: any; selected: boolean; onSelect: (id: string) => void }) {
    const color = RISK_COLOR[event.riskLevel] ?? '#64748B';
    return (
        <div
            onClick={() => onSelect(event._id)}
            style={{
                padding: '10px 12px', borderRadius: 10, marginBottom: 4,
                cursor: 'pointer', transition: 'all 0.12s',
                background: selected ? '#F8FAFC' : 'transparent',
                border: `1px solid ${selected ? '#E2E8F0' : 'transparent'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
            }}
            onMouseEnter={e => { if (!selected) e.currentTarget.style.background = '#F8FAFC'; }}
            onMouseLeave={e => { if (!selected) e.currentTarget.style.background = 'transparent'; }}
        >
            <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#0F172A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {event.districtId?.districtName || 'Unknown Zone'}
                </div>
                <div style={{ fontSize: 10, color: '#94A3B8', fontWeight: 500, marginTop: 1 }}>
                    {(event.confidenceScore * 100).toFixed(0)}% confidence
                </div>
            </div>
            <span style={{
                fontSize: 8, fontWeight: 800, color, background: `${color}12`,
                border: `1px solid ${color}30`, borderRadius: 5,
                padding: '2px 6px', textTransform: 'uppercase', letterSpacing: '0.05em', flexShrink: 0,
            }}>
                {event.riskLevel}
            </span>
        </div>
    );
}

/* ── Selected event detail bar ─────────────────────────── */
function EventDetailBar({ event }: { event: any }) {
    const color = RISK_COLOR[event.riskLevel] ?? '#64748B';
    const metrics = [
        { label: 'Flood Area',  value: formatArea(event.floodAreaKm2 ?? 0) },
        { label: 'Population',  value: formatPopulation(event.affectedPopEst ?? 0) },
        { label: 'Confidence',  value: `${formatScore(event.confidenceScore * 100)}%` },
    ];
    return (
        <div style={{
            background: 'white', border: '1px solid #E2E8F0',
            borderRadius: 14, padding: '14px 20px',
            display: 'flex', alignItems: 'center', gap: 24,
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        }}>
            {/* Identity */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                <div style={{
                    width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                    background: `${color}12`, color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                    <AlertTriangle size={18} />
                </div>
                <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 800, color: '#0F172A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {event.districtId?.districtName || 'Zone Alpha'}
                    </div>
                    <div style={{ fontSize: 11, color: '#94A3B8', fontWeight: 500, marginTop: 1 }}>
                        {event.districtId?.stateName || 'Bihar'} ·{' '}
                        <span style={{ color, fontWeight: 700 }}>{event.riskLevel} Risk</span>
                    </div>
                </div>
            </div>

            <div style={{ width: 1, alignSelf: 'stretch', background: '#F1F5F9', flexShrink: 0 }} />

            {/* Metrics */}
            <div style={{ display: 'flex', gap: 28, flex: 1 }}>
                {metrics.map(m => (
                    <div key={m.label}>
                        <div style={{ fontSize: 15, fontWeight: 800, color: '#0F172A' }}>{m.value}</div>
                        <div style={{ fontSize: 9, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 2 }}>
                            {m.label}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

/* ── Main Page ─────────────────────────────────────────── */
export default function GeospatialMapPage() {
    const { data: floodData, mutate } = useSWR(
        '/api/insights/latest?limit=100', fetcher,
        { refreshInterval: 60_000 },
    );
    const allEvents: any[] = floodData?.events ?? [];

    const [riskFilter, setRiskFilter]       = useState<RiskFilter>('ALL');
    const [tileMode, setTileMode]           = useState<TileMode>('satellite');
    const [refreshing, setRefreshing]       = useState(false);
    const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
    const [geeTiles]                        = useState<Record<string, string> | undefined>(undefined);

    const events = useMemo(() =>
        riskFilter === 'ALL' ? allEvents : allEvents.filter(e => e.riskLevel === riskFilter),
        [allEvents, riskFilter],
    );

    const selectedEvent = useMemo(() =>
        allEvents.find(e => e._id === selectedEventId) || events[0],
        [allEvents, selectedEventId, events],
    );

    const counts = useMemo(() => {
        const c = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 };
        allEvents.forEach(e => { if (e.riskLevel in c) c[e.riskLevel as keyof typeof c]++; });
        return c;
    }, [allEvents]);

    const handleRefresh = async () => {
        setRefreshing(true);
        await mutate();
        setRefreshing(false);
        toast.success('Map data refreshed');
    };

    return (
        <div style={{
            height: 'calc(100vh - 120px)',
            display: 'flex', flexDirection: 'column', gap: 14,
        }}>
            {/* ── Header ─────────────────────────────────────── */}
            <div style={{
                display: 'flex', alignItems: 'center',
                justifyContent: 'space-between', gap: 16,
            }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <MapIcon size={15} color="#0D7377" />
                        <h1 style={{ fontSize: 18, fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em', margin: 0 }}>
                            Geospatial Intelligence
                        </h1>
                    </div>
                    <p style={{ fontSize: 12, color: '#64748B', fontWeight: 500, margin: 0 }}>
                        {allEvents.length} active flood anomalies · Bihar region
                    </p>
                </div>

                {/* Tile controls + Refresh */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {/* Tile mode pills */}
                    <div style={{
                        display: 'flex', gap: 4,
                        background: '#F8FAFC', border: '1px solid #E2E8F0',
                        borderRadius: 10, padding: 4,
                    }}>
                        {(['satellite', 'light', 'dark'] as TileMode[]).map(t => (
                            <button
                                key={t}
                                onClick={() => setTileMode(t)}
                                title={t.charAt(0).toUpperCase() + t.slice(1)}
                                style={{
                                    width: 30, height: 30, borderRadius: 7,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    background: tileMode === t ? 'white' : 'transparent',
                                    border: tileMode === t ? '1px solid #E2E8F0' : '1px solid transparent',
                                    color: tileMode === t ? '#0F172A' : '#94A3B8',
                                    cursor: 'pointer', transition: 'all 0.15s',
                                    boxShadow: tileMode === t ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                                }}
                            >
                                {TILE_ICONS[t]}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={handleRefresh}
                        style={{
                            display: 'flex', alignItems: 'center', gap: 6,
                            background: 'white', border: '1px solid #E2E8F0',
                            borderRadius: 10, padding: '8px 14px', cursor: 'pointer',
                            fontSize: 12, fontWeight: 600, color: '#475569',
                            transition: 'all 0.15s',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                        }}
                        onMouseEnter={e => {
                            e.currentTarget.style.borderColor = '#0D7377';
                            e.currentTarget.style.color = '#0D7377';
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.borderColor = '#E2E8F0';
                            e.currentTarget.style.color = '#475569';
                        }}
                    >
                        <RefreshCw size={13} style={{ animation: refreshing ? 'spin 0.8s linear infinite' : 'none' }} />
                        Refresh
                    </button>
                </div>
            </div>

            {/* ── Body: Sidebar + Map ─────────────────────────── */}
            <div style={{ display: 'flex', gap: 14, flex: 1, minHeight: 0 }}>

                {/* Left sidebar */}
                <div style={{ width: 280, display: 'flex', flexDirection: 'column', gap: 12, flexShrink: 0 }}>

                    {/* Risk filter chips */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                        {(Object.entries(counts) as [string, number][]).map(([level, count]) => (
                            <FilterChip
                                key={level} level={level} count={count}
                                active={riskFilter === level}
                                onClick={() => setRiskFilter(riskFilter === level ? 'ALL' : level as RiskFilter)}
                            />
                        ))}
                    </div>

                    {/* Events list */}
                    <div style={{
                        flex: 1, background: 'white', border: '1px solid #E2E8F0',
                        borderRadius: 14, overflow: 'hidden',
                        display: 'flex', flexDirection: 'column', minHeight: 0,
                    }}>
                        {/* List header */}
                        <div style={{
                            padding: '12px 14px', borderBottom: '1px solid #F1F5F9',
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <Layers size={12} color="#94A3B8" />
                                <span style={{ fontSize: 11, fontWeight: 700, color: '#0F172A' }}>
                                    Active Zones
                                </span>
                            </div>
                            <span style={{
                                fontSize: 10, fontWeight: 700, color: '#0D7377',
                                background: 'rgba(13,115,119,0.08)',
                                border: '1px solid rgba(13,115,119,0.2)',
                                borderRadius: 5, padding: '1px 6px',
                            }}>
                                {events.length}
                            </span>
                        </div>

                        {/* Scrollable events */}
                        <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
                            {events.length === 0 ? (
                                <div style={{
                                    display: 'flex', flexDirection: 'column',
                                    alignItems: 'center', justifyContent: 'center',
                                    height: 120, gap: 8, color: '#CBD5E1',
                                }}>
                                    <Activity size={24} />
                                    <span style={{ fontSize: 11, fontWeight: 600, color: '#94A3B8' }}>
                                        No events in this filter
                                    </span>
                                </div>
                            ) : events.map(e => (
                                <EventRow
                                    key={e._id} event={e}
                                    selected={selectedEventId === e._id}
                                    onSelect={setSelectedEventId}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Summary strip */}
                    <div style={{
                        background: 'white', border: '1px solid #E2E8F0',
                        borderRadius: 14, padding: '12px 14px',
                        display: 'flex', gap: 16,
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1 }}>
                            <Users size={13} color="#0369A1" />
                            <div>
                                <div style={{ fontSize: 12, fontWeight: 800, color: '#0F172A' }}>
                                    {formatPopulation(allEvents.reduce((s, e) => s + (e.affectedPopEst ?? 0), 0))}
                                </div>
                                <div style={{ fontSize: 9, color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase' }}>At Risk</div>
                            </div>
                        </div>
                        <div style={{ width: 1, background: '#F1F5F9' }} />
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1 }}>
                            <Activity size={13} color="#0D7377" />
                            <div>
                                <div style={{ fontSize: 12, fontWeight: 800, color: '#0F172A' }}>
                                    {formatArea(allEvents.reduce((s, e) => s + (e.floodAreaKm2 ?? 0), 0))}
                                </div>
                                <div style={{ fontSize: 9, color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase' }}>Flood Area</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Map + detail */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12, minWidth: 0 }}>

                    {/* Map canvas */}
                    <div style={{
                        flex: 1, borderRadius: 16, overflow: 'hidden',
                        border: '1px solid #E2E8F0', position: 'relative',
                        background: '#F1F5F9', minHeight: 0,
                    }}>
                        <FloodMap
                            events={events}
                            tileMode={tileMode}
                            geeTiles={geeTiles}
                            onSelect={setSelectedEventId}
                            selectedId={selectedEventId}
                        />

                        {/* Live indicator */}
                        <div style={{
                            position: 'absolute', top: 14, left: 14, zIndex: 1000,
                            background: 'rgba(255,255,255,0.92)',
                            backdropFilter: 'blur(8px)',
                            border: '1px solid #E2E8F0',
                            borderRadius: 20, padding: '6px 14px',
                            display: 'flex', alignItems: 'center', gap: 8,
                            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                        }}>
                            <div style={{
                                width: 7, height: 7, borderRadius: '50%',
                                background: '#EF4444',
                                boxShadow: '0 0 0 2px rgba(239,68,68,0.25)',
                                animation: 'ping 1.5s ease-in-out infinite',
                            }} />
                            <span style={{ fontSize: 10, fontWeight: 700, color: '#0F172A', letterSpacing: '0.04em' }}>
                                Live Telemetry
                            </span>
                        </div>
                    </div>

                    {/* Detail bar */}
                    {selectedEvent && <EventDetailBar event={selectedEvent} />}
                </div>
            </div>
        </div>
    );
}
