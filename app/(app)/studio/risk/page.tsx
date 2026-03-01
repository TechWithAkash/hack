'use client';

import React from 'react';
import { useStudio } from '@/components/studio/StudioContext';
import { AlertCircle, TrendingUp, Users, ShieldCheck, Activity, Database } from 'lucide-react';

export default function RiskSeverityPage() {
    const { results } = useStudio();
    const metrics = results?.metrics || {};

    const riskState = metrics.severity_score >= 80 ? 'CRITICAL' : metrics.severity_score >= 60 ? 'HIGH' : metrics.severity_score >= 40 ? 'MODERATE' : metrics.severity_score >= 20 ? 'LOW' : 'MINIMAL';
    const riskColor = riskState === 'CRITICAL' ? '#EF4444' : riskState === 'HIGH' ? '#F97316' : riskState === 'MODERATE' ? '#F59E0B' : riskState === 'LOW' ? '#10B981' : '#3B82F6';

    const kpiData = [
        { label: 'FLOOD EXTENT', val: (metrics.flood_area ?? 0).toFixed(1), unit: 'km²', icon: Activity },
        { label: 'AGRI DAMAGE', val: (metrics.ndvi_loss_area ?? 0).toFixed(1), unit: 'km²', icon: Database },
        { label: 'POP EXPOSURE', val: Math.round(metrics.exposed_pop ?? 0).toLocaleString(), unit: 'ppl', icon: Users },
    ];

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: 32 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                {/* Main Risk Display */}
                <div style={{
                    background: 'rgba(255, 255, 255, 0.6)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: 24,
                    border: '1px solid rgba(255, 255, 255, 0.5)',
                    padding: 32,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.04)',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    {/* Background Pattern */}
                    <div style={{ position: 'absolute', top: -50, right: -50, opacity: 0.03, pointerEvents: 'none' }}>
                        <TrendingUp size={300} strokeWidth={1} />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, position: 'relative', zIndex: 1 }}>
                        <div>
                            <h2 style={{ fontSize: 11, fontWeight: 900, color: '#94A3B8', letterSpacing: '0.15em', marginBottom: 8 }}>COMPOSITE SEVERITY INDEX</h2>
                            <div style={{ fontSize: 96, fontWeight: 950, color: '#0F172A', lineHeight: 1, letterSpacing: '-0.04em' }}>
                                {(metrics.severity_score ?? 0).toFixed(1)}
                            </div>
                        </div>
                        <div style={{
                            background: `${riskColor}10`, color: riskColor, padding: '8px 16px',
                            borderRadius: 12, fontSize: 11, fontWeight: 900, border: `1px solid ${riskColor}20`,
                            display: 'flex', alignItems: 'center', gap: 8, letterSpacing: '0.05em'
                        }}>
                            <AlertCircle size={14} /> {riskState}
                        </div>
                    </div>
                    <div style={{ color: '#64748B', fontSize: 13, lineHeight: 1.6, fontWeight: 500, maxWidth: 480, borderTop: '1px solid rgba(226, 232, 240, 0.5)', paddingTop: 24, position: 'relative', zIndex: 1 }}>
                        Multi-dimensional risk synthesis factoring SAR micro-backscatter anomalies, multi-spectral vegetation loss indexes, and socio-economic exposure matrices.
                    </div>
                </div>

                {/* Sub-KPIs */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
                    {kpiData.map((kpi, i) => (
                        <div key={i} style={{
                            background: 'rgba(255, 255, 255, 0.6)',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(255, 255, 255, 0.5)',
                            borderRadius: 20,
                            padding: 24,
                            boxShadow: '0 4px 12px rgba(0,0,0,0.02)'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                                <kpi.icon size={14} className="text-teal-600" />
                                <span style={{ fontSize: 9, fontWeight: 900, color: '#94A3B8', letterSpacing: '0.1em' }}>{kpi.label}</span>
                            </div>
                            <div style={{ fontSize: 24, fontWeight: 950, color: '#0F172A', display: 'flex', alignItems: 'baseline', gap: 4 }}>
                                {kpi.val} <span style={{ fontSize: 10, color: '#94A3B8', fontWeight: 600 }}>{kpi.unit}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                {/* Breakdown Card */}
                <div style={{
                    background: 'rgba(255, 255, 255, 0.6)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.5)',
                    borderRadius: 24,
                    padding: 32,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.02)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
                        <TrendingUp size={16} className="text-teal-600" />
                        <h3 style={{ fontSize: 13, fontWeight: 950, color: '#0F172A' }}>Weighted Impact Metrics</h3>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                        {metrics.severity_breakdown && Object.entries(metrics.severity_breakdown).map(([key, val]: any) => (
                            <div key={key}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, marginBottom: 8 }}>
                                    <span style={{ color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 800 }}>{key.replace(/_/g, ' ')} Impact</span>
                                    <span style={{ color: '#0F172A', fontWeight: 950 }}>{(val).toFixed(2)}/10</span>
                                </div>
                                <div style={{ height: 6, width: '100%', background: '#F1F5F9', borderRadius: 10, overflow: 'hidden' }}>
                                    <div style={{ height: '100%', width: `${val * 10}%`, background: riskColor, borderRadius: 10, transition: 'width 1.2s cubic-bezier(0.1, 0.7, 1.0, 0.1)' }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Pro Analysis Box */}
                <div style={{
                    background: 'rgba(241, 245, 249, 0.6)',
                    border: '1px dashed #CBD5E1',
                    borderRadius: 20,
                    padding: 24,
                    display: 'flex',
                    gap: 16
                }}>
                    <ShieldCheck size={20} className="text-indigo-600 flex-shrink-0" />
                    <div>
                        <div style={{ fontSize: 10, fontWeight: 900, color: '#64748B', marginBottom: 4, letterSpacing: '0.05em' }}>AUTOMATED RISK ADVISORY</div>
                        <p style={{ fontSize: 12, color: '#64748B', lineHeight: 1.5, fontWeight: 500, margin: 0 }}>
                            Current intensity profile suggests {riskState.toLowerCase()} humanitarian requirements.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
