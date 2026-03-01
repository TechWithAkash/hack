'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import useSWR from 'swr';
import { fetcher } from '@/lib/api/fetcher';
import {
    Droplets, SatelliteDish, Sun, Moon,
    RefreshCw, AlertTriangle, Activity, Users,
    TrendingUp, Shield, Map as MapIcon, Layers
} from 'lucide-react';
import toast from 'react-hot-toast';

/* ── Dynamic map import ── */
const FloodMap = dynamic(() => import('@/components/map/FloodMap'), {
    ssr: false,
    loading: () => (
        <div style={{
            height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: '#F8FAFC', color: '#64748B', fontSize: 13, gap: 10, flexDirection: 'column',
        }}>
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-slate-200 border-t-teal-600" />
            <span style={{ fontWeight: 600 }}>Initialising satellite flood telemetry…</span>
        </div>
    ),
});

type TileMode = 'dark' | 'satellite' | 'light';
type RiskFilter = 'ALL' | 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

const RISK_COLORS: Record<string, string> = {
    CRITICAL: '#EF4444', HIGH: '#F97316', MEDIUM: '#EAB308', LOW: '#22C55E',
};

function StatCard({ icon, label, value, sub, color }: {
    icon: React.ReactNode; label: string;
    value: string | number; sub?: string; color: string;
}) {
    return (
        <div style={{
            display: 'flex', alignItems: 'center', gap: 16,
            padding: '20px 24px', borderRadius: 20,
            background: '#FFFFFF', border: '1px solid #E2E8F0',
            boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
            transition: 'transform 0.2s'
        }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
            <div style={{
                width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                background: `${color}10`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
                {icon}
            </div>
            <div>
                <div style={{ fontSize: 10, color: '#94A3B8', fontWeight: 900, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>
                    {label}
                </div>
                <div style={{ fontSize: 22, fontWeight: 950, color: '#0F172A', lineHeight: 1 }}>{value}</div>
                {sub && <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 4, fontWeight: 500 }}>{sub}</div>}
            </div>
        </div>
    );
}

export default function FloodMapPage() {
    const { data: floodData, mutate } = useSWR(
        '/api/insights/latest?limit=50', fetcher,
        { refreshInterval: 120_000 },
    );
    const allEvents: any[] = floodData?.events ?? [];

    const [riskFilter, setRiskFilter] = useState<RiskFilter>('ALL');
    const [tileMode, setTileMode] = useState<TileMode>('light');
    const [refreshing, setRefreshing] = useState(false);
    const [showStudio, setShowStudio] = useState(false);
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

    const handleRunGEE = async () => {
        setGeeLoading(true);
        toast.loading('Initalizing GEE Cluster Pipeline...', { id: 'gee-pipeline' });

        try {
            const res = await fetch('/api/studio/run', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(cfg),
            });
            const data = await res.json();

            if (!data.success) {
                toast.error(`Pipeline Error: ${data.error}`, { id: 'gee-pipeline' });
            } else {
                setGeeTiles(data.tiles);
                toast.success('Distributed GEE Processing Complete!', { id: 'gee-pipeline' });
                setShowStudio(false);
                mutate();
            }
        } catch (e: any) {
            toast.error(`Fetch Failed: ${e.toString()}`, { id: 'gee-pipeline' });
        } finally {
            setGeeLoading(false);
        }
    };

    const events = riskFilter === 'ALL'
        ? allEvents
        : allEvents.filter((e: any) => e.riskLevel === riskFilter);

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
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: 22, fontWeight: 950, color: '#0F172A', letterSpacing: '-0.02em' }}>
                        Regional Risk Interface
                    </h1>
                    <p style={{ fontSize: 11, color: '#64748B', marginTop: 2, fontWeight: 500 }}>
                        Sentinel-1 SAR + Sentinel-2 MSI Multi-Temporal Insight Engine
                    </p>
                </div>

                <button
                    onClick={() => setShowStudio(!showStudio)}
                    style={{
                        background: '#0F172A', color: 'white', border: 'none',
                        padding: '10px 20px', borderRadius: 12, fontSize: 11, fontWeight: 900,
                        display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                        transition: 'all 0.3s'
                    }}
                >
                    <SatelliteDish size={14} />
                    GEE Studio
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 }}>
                <StatCard icon={<Droplets size={16} color="#0D7377" />} label="Active" value={allEvents.length} color="#0D7377" />
                <StatCard icon={<AlertTriangle size={16} color="#EF4444" />} label="Critical" value={criticalCount} color="#EF4444" />
                <StatCard icon={<TrendingUp size={16} color="#F97316" />} label="High Sev" value={highCount} color="#F97316" />
                <StatCard icon={<Activity size={16} color="#0369A1" />} label="Extent" value={`${totalFloodKm2.toFixed(0)} km²`} color="#0369A1" />
                <StatCard icon={<Users size={16} color="#7C3AED" />} label="Exposure" value={totalAffectedPop > 1000 ? `${(totalAffectedPop / 1000).toFixed(0)}K` : totalAffectedPop.toString()} color="#7C3AED" />
            </div>

            <div style={{
                background: '#FFFFFF', borderRadius: 20, overflow: 'hidden',
                border: '1px solid #E2E8F0', boxShadow: '0 8px 32px rgba(0,0,0,0.04)'
            }}>
                <div style={{
                    display: 'flex', alignItems: 'center', gap: 16, padding: '12px 20px',
                    borderBottom: '1px solid #F1F5F9', background: '#FFFFFF'
                }}>
                    <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                        <span style={{ fontSize: 9, fontWeight: 900, color: '#94A3B8', marginRight: 4 }}>FILTER</span>
                        {(['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as RiskFilter[]).map(level => (
                            <button
                                key={level}
                                onClick={() => setRiskFilter(level)}
                                style={{
                                    padding: '4px 10px', borderRadius: 6, fontSize: 10, fontWeight: 800,
                                    border: riskFilter === level ? `1px solid ${RISK_COLORS[level] || '#0D7377'}` : '1px solid #F1F5F9',
                                    background: riskFilter === level ? `${RISK_COLORS[level] || '#0D7377'}08` : 'transparent',
                                    color: riskFilter === level ? (RISK_COLORS[level] || '#0D7377') : '#94A3B8',
                                    cursor: 'pointer', transition: 'all 0.2s'
                                }}
                            >
                                {level}
                            </button>
                        ))}
                    </div>

                    <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
                        {(['light', 'satellite', 'dark'] as TileMode[]).map(t => (
                            <button
                                key={t}
                                onClick={() => setTileMode(t)}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 4, padding: '6px 10px', borderRadius: 6,
                                    fontSize: 10, fontWeight: 900, border: 'none', background: tileMode === t ? '#F1F5F9' : 'transparent',
                                    color: tileMode === t ? '#0F172A' : '#94A3B8', cursor: 'pointer'
                                }}
                            >
                                {t === 'light' ? <Sun size={10} /> : t === 'satellite' ? <SatelliteDish size={10} /> : <Moon size={10} />}
                                {t.toUpperCase()}
                            </button>
                        ))}
                        <div style={{ width: 1, height: 16, background: '#E2E8F0', margin: '0 4px' }} />
                        <button
                            onClick={handleRefresh}
                            disabled={refreshing}
                            style={{
                                display: 'flex', alignItems: 'center', gap: 6, padding: '6px 10px', borderRadius: 6,
                                fontSize: 10, fontWeight: 900, border: 'none', background: 'transparent',
                                color: refreshing ? '#0D7377' : '#94A3B8', cursor: 'pointer'
                            }}
                        >
                            <RefreshCw size={10} className={refreshing ? 'animate-spin' : ''} />
                            REFRESH
                        </button>
                    </div>
                </div>

                <div style={{ position: 'relative', height: 600, overflow: 'hidden' }}>
                    <FloodMap events={events} tileMode={tileMode} geeTiles={geeTiles} />

                    {/* Status Overlays */}
                    <div style={{ position: 'absolute', top: 20, left: 20, zIndex: 1000, display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <div style={{
                            background: 'rgba(255, 255, 255, 0.8)', padding: '8px 14px', borderRadius: 10, border: '1px solid rgba(226, 232, 240, 0.5)',
                            backdropFilter: 'blur(10px)',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: 8
                        }}>
                            <div className="h-1.5 w-1.5 rounded-full bg-teal-500 animate-pulse" />
                            <span style={{ fontSize: 10, fontWeight: 900, color: '#0F172A', letterSpacing: '0.05em' }}>
                                {geeTiles ? 'GEE PIPELINE ACTIVE' : 'LIVE STREAM'}
                            </span>
                        </div>
                    </div>

                    <div style={{
                        position: 'absolute', top: 20, right: 20, zIndex: 1000,
                        background: '#0F172A', color: '#FFF', padding: '10px 16px',
                        borderRadius: 12, boxShadow: '0 8px 24px rgba(0,0,0,0.2)', textAlign: 'center'
                    }}>
                        <div style={{ fontSize: 18, fontWeight: 950, color: '#5EEAD4', lineHeight: 1 }}>{events.length}</div>
                        <div style={{ fontSize: 8, fontWeight: 900, color: '#94A3B8', marginTop: 2, letterSpacing: '0.1em' }}>EVENTS</div>
                    </div>

                    {/* Studio Panel Overlay */}
                    <div style={{
                        position: 'absolute', top: 0, right: showStudio ? 0 : -320, width: 320, height: '100%',
                        background: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(20px)', borderLeft: '1px solid rgba(226, 232, 240, 0.5)', zIndex: 1100,
                        transition: 'right 0.4s cubic-bezier(0.4, 0, 0.2, 1)', padding: 24,
                        display: 'flex', flexDirection: 'column', boxShadow: '-8px 0 32px rgba(0,0,0,0.08)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                            <h3 style={{ fontSize: 11, fontWeight: 950, color: '#0F172A', display: 'flex', alignItems: 'center', gap: 8 }}>
                                <Layers size={14} className="text-teal-600" /> CLUSTER CONFIG
                            </h3>
                            <button onClick={() => setShowStudio(false)} style={{ background: '#F1F5F9', border: 'none', borderRadius: '50%', width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748B', fontSize: 16 }}>×</button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, flex: 1, overflowY: 'auto' }}>
                            {/* Algorithm Parameters */}
                            <div>
                                <div style={{ fontSize: 9, fontWeight: 900, color: '#94A3B8', marginBottom: 10, letterSpacing: '0.05em' }}>ALGORITHM PARAMETERS</div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                    {[
                                        { label: 'SAR Baseline Conf', key: 'sar_conf_base' as const },
                                        { label: 'Optical Baseline Conf', key: 'opt_conf_base' as const },
                                    ].map(t => (
                                        <div key={t.key}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, fontWeight: 700, color: '#475569', marginBottom: 6 }}>
                                                <span>{t.label}</span> <span style={{ color: '#0F172A' }}>{Number(cfg[t.key]).toFixed(2)}</span>
                                            </div>
                                            <input type="range" min="0.5" max="1.0" step="0.01" value={Number(cfg[t.key])} onChange={e => setCfg({ ...cfg, [t.key]: parseFloat(e.target.value) })} style={{ width: '100%', accentColor: '#0F172A' }} />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Temporal window */}
                            <div>
                                <div style={{ fontSize: 9, fontWeight: 900, color: '#94A3B8', marginBottom: 10, letterSpacing: '0.05em' }}>TEMPORAL WINDOW</div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                                    {['pre_start', 'pre_end', 'post_start', 'post_end'].map(key => (
                                        <div key={key}>
                                            <label style={{ fontSize: 8, color: '#64748B', fontWeight: 800, textTransform: 'uppercase', marginBottom: 2, display: 'block' }}>{key.replace('_', ' ')}</label>
                                            <input type="date" value={String(cfg[key as keyof typeof cfg])} onChange={e => setCfg({ ...cfg, [key]: e.target.value })} style={{ width: '100%', padding: '8px', fontSize: 11, borderRadius: 6, background: 'rgba(255,255,255,0.4)', border: '1px solid #E2E8F0', outline: 'none' }} />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Thresholds */}
                            <div>
                                <div style={{ fontSize: 9, fontWeight: 900, color: '#94A3B8', marginBottom: 10, letterSpacing: '0.05em' }}>ANALYTIC THRESHOLDS</div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                    {[
                                        { label: 'SAR Drop (dB)', key: 'threshold' as const, min: -6, max: 0, step: 0.1, color: '#EF4444' },
                                        { label: 'NDVI Mask', key: 'ndvi_thresh' as const, min: -0.5, max: 0, step: 0.01, color: '#10B981' },
                                        { label: 'Max Cloud (%)', key: 'cloud_pct' as const, min: 5, max: 80, step: 1, color: '#0D7377' },
                                    ].map(t => (
                                        <div key={t.key}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, fontWeight: 700, color: '#475569', marginBottom: 6 }}>
                                                <span>{t.label}</span> <span style={{ color: t.color }}>{t.key === 'cloud_pct' ? `${cfg[t.key]}%` : Number(cfg[t.key]).toFixed(2)}</span>
                                            </div>
                                            <input type="range" min={t.min} max={t.max} step={t.step} value={Number(cfg[t.key])} onChange={e => setCfg({ ...cfg, [t.key]: parseFloat(e.target.value) })} style={{ width: '100%', accentColor: t.color }} />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Execution Parameters */}
                            <div>
                                <div style={{ fontSize: 9, fontWeight: 900, color: '#94A3B8', marginBottom: 10, letterSpacing: '0.05em' }}>EXECUTION</div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, fontWeight: 700, color: '#475569', marginBottom: 6 }}>
                                    <span>Resolution (Scale)</span> <span style={{ color: '#0F172A' }}>{cfg.scale}m</span>
                                </div>
                                <input type="range" min="10" max="1000" step="10" value={cfg.scale} onChange={e => setCfg({ ...cfg, scale: parseInt(e.target.value) })} style={{ width: '100%', accentColor: '#0F172A' }} />
                            </div>
                        </div>

                        <button
                            onClick={handleRunGEE}
                            disabled={geeLoading}
                            style={{
                                width: '100%', padding: '14px', borderRadius: 12, background: '#0F172A', color: '#FFF',
                                fontWeight: 900, border: 'none', cursor: 'pointer', marginTop: 24, fontSize: 11,
                                boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                                textTransform: 'uppercase'
                            }}
                        >
                            {geeLoading ? 'COMMUNICATING...' : 'EXECUTE PIPELINE'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Context Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div style={{
                    background: 'rgba(255, 255, 255, 0.4)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(226, 232, 240, 0.5)',
                    padding: 16,
                    borderRadius: 16,
                    display: 'flex',
                    gap: 12
                }}>
                    <SatelliteDish size={14} className="text-teal-600 mt-0.5" />
                    <div>
                        <div style={{ fontSize: 12, fontWeight: 950, color: '#0F172A', marginBottom: 2 }}>Sentinel-1 SAR Radar</div>
                        <p style={{ fontSize: 10, color: '#64748B', lineHeight: 1.5, fontWeight: 500, margin: 0 }}>Penetrates cloud cover to detect specular reflection anomalies with pixel-level precision.</p>
                    </div>
                </div>
                <div style={{
                    background: 'rgba(255, 255, 255, 0.4)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(226, 232, 240, 0.5)',
                    padding: 16,
                    borderRadius: 16,
                    display: 'flex',
                    gap: 12
                }}>
                    <Activity size={14} className="text-indigo-600 mt-0.5" />
                    <div>
                        <div style={{ fontSize: 12, fontWeight: 950, color: '#0F172A', marginBottom: 2 }}>Open-Meteo Predictive</div>
                        <p style={{ fontSize: 10, color: '#64748B', lineHeight: 1.5, fontWeight: 500, margin: 0 }}>Synthesizes 72h accumulation forecasts with SRTM elevation vulnerability datasets.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
