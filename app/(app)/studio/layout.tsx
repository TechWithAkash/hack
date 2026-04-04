'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { StudioProvider, useStudio } from '@/components/studio/StudioContext';
import {
    ShieldAlert, Layers, Cpu, Info, CheckCircle2,
    Satellite as SatelliteIcon, AlertTriangle, Crosshair,
} from 'lucide-react';

/* ─────────────────────────────────────────────────────────
   Sidebar
───────────────────────────────────────────────────────── */
function StudioSidebar() {
    const { cfg, setCfg, loading, handleRun, aoiMode, setAoiMode, drawnBounds, setDrawnBounds } = useStudio();

    function SliderRow({
        label, info, value, min, max, step, accent, display, onChange,
    }: {
        label: string; info: string; value: number;
        min: string; max: string; step: string;
        accent: string; display: string;
        onChange: (v: number) => void;
    }) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <span style={{ fontSize: 10, fontWeight: 700, color: '#64748B' }}>{label}</span>
                        <button
                            onClick={() => alert(`${label}\n\n${info}`)}
                            title={info}
                            style={{
                                background: 'none', border: 'none', padding: 0,
                                color: '#CBD5E1', cursor: 'pointer', lineHeight: 0,
                                transition: 'color 0.15s',
                            }}
                            onMouseEnter={e => e.currentTarget.style.color = '#64748B'}
                            onMouseLeave={e => e.currentTarget.style.color = '#CBD5E1'}
                        >
                            <Info size={10} />
                        </button>
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 800, color: accent }}>{display}</span>
                </div>
                <input
                    type="range" min={min} max={max} step={step} value={value}
                    onChange={e => onChange(parseFloat(e.target.value))}
                    style={{ width: '100%', accentColor: accent, cursor: 'pointer', height: 3 }}
                />
            </div>
        );
    }

    function SectionLabel({ icon: Icon, label }: { icon: any; label: string }) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                <Icon size={12} color="#0D7377" />
                <span style={{ fontSize: 9, fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                    {label}
                </span>
            </div>
        );
    }

    return (
        <div style={{
            width: 288, flexShrink: 0,
            background: 'white',
            borderRight: '1px solid #E2E8F0',
            display: 'flex', flexDirection: 'column',
            overflowY: 'auto', height: '100%',
        }}>
            {/* Sidebar header */}
            <div style={{
                padding: '16px 18px', borderBottom: '1px solid #F1F5F9',
                display: 'flex', alignItems: 'center', gap: 8,
            }}>
                <div style={{
                    width: 28, height: 28, borderRadius: 8,
                    background: 'rgba(13,115,119,0.08)', color: '#0D7377',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                    <Cpu size={13} />
                </div>
                <div>
                    <div style={{ fontSize: 12, fontWeight: 800, color: '#0F172A' }}>Pipeline Controls</div>
                    <div style={{ fontSize: 9, fontWeight: 500, color: '#94A3B8' }}>GEE Processing Config</div>
                </div>
            </div>

            <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 20, flex: 1 }}>

                {/* Algorithm params */}
                <div>
                    <SectionLabel icon={Cpu} label="Algorithm Parameters" />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        <SliderRow
                            label="SAR Baseline Confidence"
                            info="Minimum statistical confidence required for SAR-based water detection anomalies."
                            value={Number(cfg.sar_conf_base)} min="0.5" max="1.0" step="0.01"
                            accent="#0D7377" display={Number(cfg.sar_conf_base).toFixed(2)}
                            onChange={v => setCfg({ ...cfg, sar_conf_base: v })}
                        />
                        <SliderRow
                            label="Optical Baseline Confidence"
                            info="Required confidence level for multi-spectral verification of flooded pixels."
                            value={Number(cfg.opt_conf_base)} min="0.5" max="1.0" step="0.01"
                            accent="#0369A1" display={Number(cfg.opt_conf_base).toFixed(2)}
                            onChange={v => setCfg({ ...cfg, opt_conf_base: v })}
                        />
                    </div>
                </div>

                <div style={{ height: 1, background: '#F1F5F9' }} />

                {/* Detection thresholds */}
                <div>
                    <SectionLabel icon={ShieldAlert} label="Detection Thresholds" />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        <SliderRow
                            label="SAR Water Threshold (dB)"
                            info="Sentinel-1 backscatter drop (dB) threshold to classify standing water surface."
                            value={Number(cfg.threshold)} min="-6" max="0" step="0.1"
                            accent="#EF4444" display={Number(cfg.threshold).toFixed(2)}
                            onChange={v => setCfg({ ...cfg, threshold: v })}
                        />
                        <SliderRow
                            label="NDVI Agri Loss Threshold"
                            info="NDVI variation coefficient for detecting submerged or damaged vegetation/crops."
                            value={Number(cfg.ndvi_thresh)} min="-0.5" max="0" step="0.01"
                            accent="#10B981" display={`${(Number(cfg.ndvi_thresh) * 100).toFixed(0)}%`}
                            onChange={v => setCfg({ ...cfg, ndvi_thresh: v })}
                        />
                        <SliderRow
                            label="Max Cloud Cover"
                            info="Automatic rejection of Sentinel-2 scenes exceeding this cloud percentage over AOI."
                            value={Number(cfg.cloud_pct)} min="5" max="80" step="1"
                            accent="#D97706" display={`${cfg.cloud_pct}%`}
                            onChange={v => setCfg({ ...cfg, cloud_pct: Math.round(v) })}
                        />
                    </div>
                </div>

                <div style={{ height: 1, background: '#F1F5F9' }} />

                {/* Geographic AOI */}
                <div>
                    <SectionLabel icon={Layers} label="Geographic AOI" />

                    {/* AOI mode pills */}
                    <div style={{
                        display: 'flex', gap: 4,
                        background: '#F8FAFC', border: '1px solid #E2E8F0',
                        borderRadius: 9, padding: 3, marginBottom: 12,
                    }}>
                        {[
                            { id: 'draw',   label: 'Draw AOI' },
                            { id: 'manual', label: 'Lat / Lon' },
                        ].map(m => (
                            <button
                                key={m.id}
                                onClick={() => setAoiMode(m.id as any)}
                                style={{
                                    flex: 1, padding: '7px', fontSize: 10, fontWeight: 700,
                                    borderRadius: 7, border: 'none', cursor: 'pointer',
                                    transition: 'all 0.15s',
                                    background: aoiMode === m.id ? 'white' : 'transparent',
                                    color: aoiMode === m.id ? '#0F172A' : '#94A3B8',
                                    boxShadow: aoiMode === m.id ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                                }}
                            >
                                {m.label}
                            </button>
                        ))}
                    </div>

                    {aoiMode === 'manual' ? (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                            {[
                                { label: 'Min Lon', key: 'min_lon' },
                                { label: 'Max Lon', key: 'max_lon' },
                                { label: 'Min Lat', key: 'min_lat' },
                                { label: 'Max Lat', key: 'max_lat' },
                            ].map(f => (
                                <div key={f.key}>
                                    <label style={{ fontSize: 9, color: '#94A3B8', fontWeight: 700, display: 'block', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                                        {f.label}
                                    </label>
                                    <input
                                        type="number" step="0.1"
                                        value={Number(cfg[f.key as keyof typeof cfg])}
                                        onChange={e => setCfg({ ...cfg, [f.key]: parseFloat(e.target.value) })}
                                        style={{
                                            width: '100%', background: 'white',
                                            border: '1px solid #E2E8F0', borderRadius: 7,
                                            padding: '6px 8px', color: '#0F172A',
                                            fontSize: 11, fontWeight: 700, outline: 'none',
                                        }}
                                    />
                                </div>
                            ))}
                        </div>
                    ) : drawnBounds ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            <div style={{
                                background: '#F0FDF4', border: '1px solid #BBF7D0',
                                borderRadius: 10, padding: '10px 12px',
                            }}>
                                <div style={{ fontSize: 9, fontWeight: 800, color: '#15803D', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                                    ✓ AOI Selected
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                                    {[
                                        { label: 'Min Lon', val: drawnBounds[0].toFixed(4) },
                                        { label: 'Min Lat', val: drawnBounds[1].toFixed(4) },
                                        { label: 'Max Lon', val: drawnBounds[2].toFixed(4) },
                                        { label: 'Max Lat', val: drawnBounds[3].toFixed(4) },
                                    ].map(f => (
                                        <div key={f.label} style={{ background: 'white', borderRadius: 6, padding: '4px 8px' }}>
                                            <div style={{ fontSize: 7, color: '#94A3B8', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{f.label}</div>
                                            <div style={{ fontSize: 11, fontWeight: 800, color: '#0F172A' }}>{f.val}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <button
                                onClick={() => { setDrawnBounds(null); setCfg({ ...cfg, min_lon: 0, max_lon: 0, min_lat: 0, max_lat: 0 }); }}
                                style={{
                                    padding: '7px', fontSize: 10, fontWeight: 700,
                                    background: '#FEF2F2', color: '#EF4444',
                                    border: '1px solid #FCA5A5', borderRadius: 8, cursor: 'pointer',
                                }}
                            >
                                Reset — Draw Again
                            </button>
                        </div>
                    ) : (
                        <div style={{
                            background: '#F8FAFC', border: '1px dashed #CBD5E1',
                            borderRadius: 10, padding: '12px 14px', textAlign: 'center',
                        }}>
                            <Crosshair size={16} color="#CBD5E1" style={{ marginBottom: 6 }} />
                            <p style={{ fontSize: 10, color: '#64748B', fontWeight: 600, lineHeight: 1.5, margin: 0 }}>
                                Click & drag on the map to select your area of interest.
                            </p>
                        </div>
                    )}
                </div>

                <div style={{ height: 1, background: '#F1F5F9' }} />

                {/* Resolution + Run */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <SliderRow
                        label="Resolution"
                        info="Spatial resolution (scale) for GEE processing. Lower values increase precision but require more computation."
                        value={cfg.scale} min="10" max="1000" step="10"
                        accent="#0D7377" display={`${cfg.scale}m`}
                        onChange={v => setCfg({ ...cfg, scale: Math.round(v) })}
                    />
                    <button
                        onClick={() => handleRun()} disabled={loading}
                        style={{
                            width: '100%', padding: '11px',
                            background: loading ? '#94A3B8' : '#0F172A',
                            border: 'none', borderRadius: 10, color: 'white',
                            fontWeight: 800, fontSize: 11, letterSpacing: '0.06em',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                            transition: 'background 0.15s',
                        }}
                    >
                        {loading
                            ? <><div style={{ width: 12, height: 12, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', animation: 'spin 0.8s linear infinite' }} /> Processing…</>
                            : <><Cpu size={13} /> Run Pipeline</>}
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ─────────────────────────────────────────────────────────
   Header (metrics bar)
───────────────────────────────────────────────────────── */
function StudioHeader() {
    const { results } = useStudio();
    const m = results?.metrics || {};

    const severity = m.severity_score ?? 0;
    const riskLabel = severity >= 80 ? 'Critical' : severity >= 60 ? 'High' : severity >= 40 ? 'Moderate' : severity >= 20 ? 'Low' : 'Minimal';
    const riskColor = severity >= 80 ? '#EF4444' : severity >= 60 ? '#F97316' : severity >= 40 ? '#D97706' : severity >= 20 ? '#10B981' : '#0D7377';

    const metrics = [
        { label: 'Flood Area',   val: `${(m.flood_area ?? 0).toFixed(1)} km²`,              color: '#0369A1' },
        { label: 'Veg Damage',   val: `${(m.ndvi_loss_area ?? 0).toFixed(1)} km²`,          color: '#10B981' },
        { label: 'Pop Exposed',  val: Math.round(m.exposed_pop ?? 0).toLocaleString(),       color: '#D97706' },
        { label: 'Confidence',   val: `${((m.peak_confidence ?? 0) * 100).toFixed(1)}%`,    color: '#0D7377' },
    ];

    return (
        <div style={{ padding: '14px 20px', borderBottom: '1px solid #F1F5F9', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>

                {/* Title */}
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                        <SatelliteIcon size={13} color="#0D7377" />
                        <span style={{ fontSize: 14, fontWeight: 800, color: '#0F172A', letterSpacing: '-0.01em' }}>
                            Intelligence Studio
                        </span>
                        <span style={{
                            fontSize: 9, fontWeight: 700, color: '#10B981',
                            background: '#F0FDF4', border: '1px solid #BBF7D0',
                            borderRadius: 5, padding: '1px 7px',
                        }}>LIVE</span>
                    </div>
                    <p style={{ fontSize: 11, color: '#94A3B8', fontWeight: 500, margin: 0 }}>
                        GEE Distributed Fusion v1.2.4 · Pixel-perfect climate intelligence
                    </p>
                </div>

                {/* Metric chips */}
                {results && (
                    <div style={{ display: 'flex', gap: 8 }}>
                        {metrics.map(m => (
                            <div key={m.label} style={{
                                background: 'white', border: '1px solid #E2E8F0',
                                borderRadius: 10, padding: '8px 12px', textAlign: 'center',
                            }}>
                                <div style={{ fontSize: 12, fontWeight: 800, color: m.color, whiteSpace: 'nowrap' }}>{m.val}</div>
                                <div style={{ fontSize: 9, color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 1 }}>{m.label}</div>
                            </div>
                        ))}

                        {/* Risk bar */}
                        <div style={{
                            background: 'white', border: '1px solid #E2E8F0',
                            borderRadius: 10, padding: '8px 14px',
                            display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 4,
                            minWidth: 140,
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: 9, color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Severity</span>
                                <span style={{ fontSize: 9, fontWeight: 800, color: riskColor }}>{riskLabel.toUpperCase()}</span>
                            </div>
                            <div style={{ height: 5, background: '#F1F5F9', borderRadius: 6, overflow: 'hidden' }}>
                                <div style={{
                                    height: '100%', width: `${Math.min(100, Math.max(0, severity))}%`,
                                    background: `linear-gradient(90deg, #10B981, #D97706, #EF4444)`,
                                    borderRadius: '6px 0 0 6px',
                                    transition: 'width 1.5s cubic-bezier(0.16,1,0.3,1)',
                                }} />
                            </div>
                        </div>
                    </div>
                )}

                {!results && (
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        background: '#F8FAFC', border: '1px solid #E2E8F0',
                        borderRadius: 10, padding: '8px 14px',
                    }}>
                        <AlertTriangle size={12} color="#D97706" />
                        <span style={{ fontSize: 11, fontWeight: 600, color: '#64748B' }}>No results yet — run pipeline to see metrics</span>
                    </div>
                )}
            </div>
        </div>
    );
}

/* ─────────────────────────────────────────────────────────
   Tabs
───────────────────────────────────────────────────────── */
const TABS = [
    { id: 'spatial',    label: 'Spatial',    icon: SatelliteIcon, path: '/studio/spatial'    },
    { id: 'core',       label: 'Core',       icon: Cpu,           path: '/studio/core'       },
    { id: 'veg',        label: 'Vegetation', icon: Layers,        path: '/studio/veg'        },
    { id: 'risk',       label: 'Risk',       icon: ShieldAlert,   path: '/studio/risk'       },
    { id: 'confidence', label: 'Confidence', icon: Info,          path: '/studio/confidence' },
    { id: 'logs',       label: 'Logs',       icon: CheckCircle2,  path: '/studio/logs'       },
];

function StudioTabs() {
    const pathname = usePathname();
    return (
        <div style={{
            display: 'flex', gap: 2, padding: '10px 20px',
            borderBottom: '1px solid #F1F5F9', flexShrink: 0,
            background: 'white',
        }}>
            {TABS.map(tab => {
                const active = pathname === tab.path;
                return (
                    <Link
                        key={tab.id} href={tab.path}
                        style={{
                            display: 'flex', alignItems: 'center', gap: 6,
                            padding: '7px 14px', borderRadius: 8,
                            fontSize: 11, fontWeight: 700, textDecoration: 'none',
                            transition: 'all 0.15s',
                            background: active ? '#0F172A' : 'transparent',
                            color: active ? 'white' : '#64748B',
                        }}
                        onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => {
                            if (!active) {
                                e.currentTarget.style.background = '#F8FAFC';
                                e.currentTarget.style.color = '#0F172A';
                            }
                        }}
                        onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => {
                            if (!active) {
                                e.currentTarget.style.background = 'transparent';
                                e.currentTarget.style.color = '#64748B';
                            }
                        }}
                    >
                        <tab.icon size={12} />
                        {tab.label}
                    </Link>
                );
            })}
        </div>
    );
}

/* ─────────────────────────────────────────────────────────
   Layout shell
───────────────────────────────────────────────────────── */
function StudioLayoutContent({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isFullPage = ['/studio/ai', '/studio/pdf'].includes(pathname);

    return (
        <div style={{ display: 'flex', height: '100%', background: '#F8FAFC' }}>
            {/* Left sidebar */}
            {!isFullPage && <StudioSidebar />}

            {/* Right content */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
                {!isFullPage && (
                    <>
                        <StudioHeader />
                        <StudioTabs />
                    </>
                )}
                <div style={{
                    flex: 1, overflowY: isFullPage ? 'hidden' : 'auto',
                    padding: isFullPage ? 0 : '20px 24px',
                    minHeight: 0,
                }}>
                    {children}
                </div>
            </div>
        </div>
    );
}

export default function StudioLayout({ children }: { children: React.ReactNode }) {
    return (
        <StudioProvider>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column' }}>
                <StudioLayoutContent>
                    {children}
                </StudioLayoutContent>
            </div>
        </StudioProvider>
    );
}
