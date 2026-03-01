'use client';

import React from 'react';
import { StudioProvider, useStudio } from '@/components/studio/StudioContext';
import { ShieldAlert, Layers, Cpu, Info, CheckCircle2, ChevronRight, Eye } from 'lucide-react';

function StudioSidebar() {
    const { cfg, setCfg, loading, handleRun, aoiMode, setAoiMode } = useStudio();

    const ParameterLabel = ({ label, info }: { label: string, info: string }) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
            <span style={{ fontSize: 10, color: '#64748B', fontWeight: 800 }}>{label}</span>
            <button
                onClick={() => alert(`PARAMETER INFO:\n\n${label}\n${info}`)}
                style={{
                    background: 'none', border: 'none', padding: 0, margin: 0,
                    color: '#94A3B8', cursor: 'pointer', display: 'flex', alignItems: 'center',
                    transition: 'color 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.color = '#0F172A'}
                onMouseOut={(e) => e.currentTarget.style.color = '#94A3B8'}
                title="Click for more information"
            >
                <Info size={10} />
            </button>
        </div>
    );

    return (
        <div style={{
            width: 320,
            background: 'rgba(255, 255, 255, 0.6)',
            backdropFilter: 'blur(30px)',
            borderRight: '1px solid rgba(226, 232, 240, 0.5)',
            padding: '24px 20px 120px', // Massive bottom padding to ensure button visibility
            display: 'flex',
            flexDirection: 'column',
            gap: 24, // Slightly reduced gap
            overflowY: 'auto',
            height: '100%',
            position: 'relative',
            zIndex: 10
        }}>
            {/* Algorithm Parameters */}
            <div>
                <h3 style={{ fontSize: 10, fontWeight: 900, color: '#0F172A', letterSpacing: '0.12em', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                    <Cpu size={14} className="text-teal-600" /> ALGORITHM PARAMETERS
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <ParameterLabel label="SAR BASELINE CONFIDENCE" info="Minimum statistical confidence required for SAR-based water detection anomalies." />
                            <span style={{ color: '#0F172A', fontWeight: 950, fontSize: 10 }}>{Number(cfg.sar_conf_base).toFixed(2)}</span>
                        </div>
                        <input
                            type="range" min="0.5" max="1.0" step="0.01"
                            value={Number(cfg.sar_conf_base)}
                            onChange={(e) => setCfg({ ...cfg, sar_conf_base: parseFloat(e.target.value) })}
                            style={{ width: '100%', accentColor: '#0F172A', cursor: 'pointer', height: 4 }}
                        />
                    </div>

                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <ParameterLabel label="OPTICAL BASELINE CONFIDENCE" info="Required confidence level for multi-spectral verification of flooded pixels." />
                            <span style={{ color: '#0F172A', fontWeight: 950, fontSize: 10 }}>{Number(cfg.opt_conf_base).toFixed(2)}</span>
                        </div>
                        <input
                            type="range" min="0.5" max="1.0" step="0.01"
                            value={Number(cfg.opt_conf_base)}
                            onChange={(e) => setCfg({ ...cfg, opt_conf_base: parseFloat(e.target.value) })}
                            style={{ width: '100%', accentColor: '#0F172A', cursor: 'pointer', height: 4 }}
                        />
                    </div>
                </div>
            </div>

            {/* Thresholds */}
            <div>
                <h3 style={{ fontSize: 10, fontWeight: 900, color: '#0F172A', letterSpacing: '0.12em', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                    <ShieldAlert size={14} className="text-teal-600" /> DETECTION THRESHOLDS
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <ParameterLabel label="SAR WATER THRESHOLD (DB)" info="Sentinel-1 backscatter drop (dB) threshold to classify standing water surface." />
                            <span style={{ color: '#EF4444', fontWeight: 950, fontSize: 10 }}>{Number(cfg.threshold).toFixed(2)}</span>
                        </div>
                        <input
                            type="range" min="-6" max="0" step="0.1"
                            value={Number(cfg.threshold)}
                            onChange={(e) => setCfg({ ...cfg, threshold: parseFloat(e.target.value) })}
                            style={{ width: '100%', accentColor: '#EF4444', cursor: 'pointer', height: 4 }}
                        />
                    </div>

                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <ParameterLabel label="NDVI AGRI LOSS THRESHOLD" info="NDVI variation coefficient for detecting submerged or damaged vegetation/crops." />
                            <span style={{ color: '#10B981', fontWeight: 950, fontSize: 10 }}>{(Number(cfg.ndvi_thresh) * 100).toFixed(0)}%</span>
                        </div>
                        <input
                            type="range" min="-0.5" max="0" step="0.01"
                            value={Number(cfg.ndvi_thresh)}
                            onChange={(e) => setCfg({ ...cfg, ndvi_thresh: parseFloat(e.target.value) })}
                            style={{ width: '100%', accentColor: '#10B981', cursor: 'pointer', height: 4 }}
                        />
                    </div>

                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <ParameterLabel label="MAX CLOUD COVER (%)" info="Automatic rejection of Sentinel-2 scenes exceeding this cloud percentage over AOI." />
                            <span style={{ color: '#0D7377', fontWeight: 950, fontSize: 10 }}>{cfg.cloud_pct}%</span>
                        </div>
                        <input
                            type="range" min="5" max="80" step="1"
                            value={Number(cfg.cloud_pct)}
                            onChange={(e) => setCfg({ ...cfg, cloud_pct: parseInt(e.target.value) })}
                            style={{ width: '100%', accentColor: '#0D7377', cursor: 'pointer', height: 4 }}
                        />
                    </div>
                </div>
            </div>

            {/* Geographic AOI */}
            <div>
                <h3 style={{ fontSize: 10, fontWeight: 900, color: '#0F172A', letterSpacing: '0.12em', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                    <Layers size={14} className="text-teal-600" /> GEOGRAPHIC AOI
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div style={{ display: 'flex', background: 'rgba(241, 245, 249, 0.5)', borderRadius: 10, padding: 4, gap: 4 }}>
                        <button
                            onClick={() => setAoiMode('draw')}
                            style={{ flex: 1, padding: '6px', fontSize: 10, fontWeight: 900, borderRadius: 7, border: 'none', cursor: 'pointer', transition: 'all 0.2s', background: aoiMode === 'draw' ? '#FFF' : 'transparent', color: aoiMode === 'draw' ? '#0F172A' : '#64748B', boxShadow: aoiMode === 'draw' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none' }}>
                            DRAW ON MAP
                        </button>
                        <button
                            onClick={() => setAoiMode('manual')}
                            style={{ flex: 1, padding: '6px', fontSize: 10, fontWeight: 900, borderRadius: 7, border: 'none', cursor: 'pointer', transition: 'all 0.2s', background: aoiMode === 'manual' ? '#FFF' : 'transparent', color: aoiMode === 'manual' ? '#0F172A' : '#64748B', boxShadow: aoiMode === 'manual' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none' }}>
                            COORDINATES
                        </button>
                    </div>

                    {aoiMode === 'manual' ? (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                            {[
                                { label: 'MIN LON', key: 'min_lon' },
                                { label: 'MAX LON', key: 'max_lon' },
                                { label: 'MIN LAT', key: 'min_lat' },
                                { label: 'MAX LAT', key: 'max_lat' },
                            ].map(field => (
                                <div key={field.key}>
                                    <label style={{ fontSize: 8, color: '#94A3B8', fontWeight: 900, display: 'block', marginBottom: 3 }}>{field.label}</label>
                                    <input
                                        type="number" step="0.1"
                                        value={Number(cfg[field.key as keyof typeof cfg])}
                                        onChange={e => setCfg({ ...cfg, [field.key]: parseFloat(e.target.value) })}
                                        style={{ width: '100%', background: 'rgba(255, 255, 255, 0.4)', border: '1px solid rgba(226, 232, 240, 0.4)', borderRadius: 8, padding: '7px 9px', color: '#0F172A', fontSize: 11, fontWeight: 800, outline: 'none' }}
                                    />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={{ background: 'rgba(241, 245, 249, 0.6)', border: '1px dashed #CBD5E1', borderRadius: 12, padding: 12, textAlign: 'center' }}>
                            <p style={{ fontSize: 10, color: '#64748B', fontWeight: 600, lineHeight: 1.5, margin: 0 }}>
                                📌 Draw a rectangle on the <b>Spatial Insights</b> map to set bounds automatically.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Execution Section */}
            <div style={{ paddingTop: 20, borderTop: '1px solid rgba(226, 232, 240, 0.5)', flexShrink: 0 }}>
                <div style={{ marginBottom: 18 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <ParameterLabel label="RESOLUTION" info="Spatial resolution (scale) for GEE processing. Lower values increase precision but require more computation data." />
                        <span style={{ color: '#0F172A', fontWeight: 950, fontSize: 10 }}>{cfg.scale}m</span>
                    </div>
                    <input type="range" min="10" max="1000" step="10" value={cfg.scale} onChange={(e) => setCfg({ ...cfg, scale: parseInt(e.target.value) })} style={{ width: '100%', accentColor: '#0F172A', cursor: 'pointer', height: 4 }} />
                </div>
                <button
                    onClick={handleRun} disabled={loading}
                    style={{
                        width: '100%', padding: '14px', background: loading ? '#0D172AB3' : '#0F172A',
                        border: 'none', borderRadius: 12, color: '#fff', fontWeight: 900, fontSize: 11, letterSpacing: '0.08em',
                        cursor: loading ? 'wait' : 'pointer', transition: 'all 0.3s',
                        boxShadow: '0 8px 24px rgba(15, 23, 42, 0.2)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        textTransform: 'uppercase'
                    }}
                >
                    {loading ? <div className="animate-spin rounded-full h-3 w-3 border-2 border-white/30 border-t-white" /> : <Cpu size={14} />}
                    {loading ? 'CALCULATING...' : 'INGEST & PROCESS DATA'}
                </button>
            </div>
        </div>
    );
}

function StudioHeader() {
    const { results } = useStudio();
    const metrics = results?.metrics || {};

    const riskState = metrics.severity_score >= 80 ? 'CRITICAL' : metrics.severity_score >= 60 ? 'HIGH' : metrics.severity_score >= 40 ? 'MODERATE' : metrics.severity_score >= 20 ? 'LOW' : 'MINIMAL';
    const riskColor = riskState === 'CRITICAL' ? '#EF4444' : riskState === 'HIGH' ? '#F97316' : riskState === 'MODERATE' ? '#F59E0B' : riskState === 'LOW' ? '#10B981' : '#3B82F6';

    const renderCard = (label: string, value: string, unit: string, color?: string) => (
        <div style={{
            flex: 1,
            background: 'rgba(255, 255, 255, 0.6)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.5)',
            borderRadius: 20,
            padding: '20px 24px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
            transition: 'all 0.3s'
        }}>
            <div style={{ fontSize: 9, color: '#94A3B8', fontWeight: 900, letterSpacing: '0.1em', marginBottom: 8, textTransform: 'uppercase' }}>{label}</div>
            <div style={{ fontSize: 24, fontWeight: 950, color: color || '#0F172A', display: 'flex', alignItems: 'baseline', gap: 4 }}>
                {value} <span style={{ fontSize: 11, color: '#94A3B8', fontWeight: 600 }}>{unit}</span>
            </div>
        </div>
    );

    return (
        <div style={{ marginBottom: 32 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                <div>
                    <div style={{ fontSize: 10, fontWeight: 800, color: '#16A34A', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4, background: '#F0FDF4', padding: '3px 10px', borderRadius: 12, width: 'fit-content', border: '1px solid #DCFCE7' }}>
                        <div className="h-1 w-1 rounded-full bg-green-500 animate-pulse" /> CLIMATE PIPELINE ONLINE
                    </div>
                    <h1 style={{ fontSize: 24, fontWeight: 950, color: '#0F172A', letterSpacing: '-0.03em' }}>
                        Cosmeon Intelligence Studio
                    </h1>
                </div>
                {results && (
                    <div style={{ background: '#0F172A', color: '#FFF', padding: '10px 20px', borderRadius: 12, fontSize: 11, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 10, boxShadow: '0 8px 24px rgba(15, 23, 42, 0.15)' }}>
                        <CheckCircle2 size={14} className="text-teal-400" />
                        SYSTEM: OPTIMAL
                    </div>
                )}
            </div>

            <div style={{ display: 'flex', gap: 20, marginBottom: 24 }}>
                {renderCard("FLOOD AREA", (metrics.flood_area ?? 0).toFixed(1), "km²")}
                {renderCard("VEG DAMAGE", (metrics.ndvi_loss_area ?? 0).toFixed(1), "km²")}
                {renderCard("POP EXPOSED", Math.round(metrics.exposed_pop ?? 0).toLocaleString(), "ppl", "#F59E0B")}
                {renderCard("CONFIDENCE", ((metrics.peak_confidence ?? 0) * 100).toFixed(1), "%", "#10B981")}
                {renderCard("SEVERITY", (metrics.severity_score ?? 0).toFixed(1), "/ 100", riskColor)}
            </div>

            <div style={{
                background: 'rgba(255, 255, 255, 0.6)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.5)',
                borderRadius: 20,
                padding: '16px 24px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <div style={{ fontSize: 10, fontWeight: 900, color: '#64748B', letterSpacing: '0.12em' }}>
                        COMPOSITE RISK ANALYTICS
                    </div>
                    <div style={{
                        fontSize: 11, fontWeight: 900, color: riskColor, letterSpacing: '0.05em',
                        background: `${riskColor}10`, padding: '4px 12px', borderRadius: 6, border: `1px solid ${riskColor}15`
                    }}>
                        {riskState}
                    </div>
                </div>
                <div style={{ height: 8, width: '100%', background: '#F1F5F9', borderRadius: 10, overflow: 'hidden', position: 'relative' }}>
                    <div style={{ height: '100%', width: `${Math.min(100, Math.max(0, metrics.severity_score ?? 0))}%`, background: `linear-gradient(90deg, #10B981, #F59E0B, #EF4444)`, transition: 'width 2s cubic-bezier(0.34, 1.56, 0.64, 1)', borderRadius: 10 }} />
                </div>
            </div>
        </div>
    );
}

function StudioLayoutContent({ children }: { children: React.ReactNode }) {
    return (
        <div style={{
            display: 'flex',
            height: '100%',
            background: 'linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Background Texture */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.1, pointerEvents: 'none', background: 'radial-gradient(circle at 2px 2px, #CBD5E1 1px, transparent 0)', backgroundSize: '24px 24px' }} />

            <StudioSidebar />

            <div style={{
                flex: 1,
                padding: '32px 48px',
                overflowY: 'auto',
                position: 'relative',
                zIndex: 1,
                display: 'flex',
                flexDirection: 'column'
            }}>
                <StudioHeader />
                <div style={{ flex: 1, minHeight: 0 }}>
                    {children}
                </div>
            </div>
        </div>
    );
}

export default function StudioLayout({ children }: { children: React.ReactNode }) {
    return (
        <StudioProvider>
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, height: '100%', minHeight: 0, position: 'relative', overflow: 'hidden' }}>
                <StudioLayoutContent>
                    {children}
                </StudioLayoutContent>
            </div>
        </StudioProvider>
    );
}
