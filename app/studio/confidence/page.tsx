'use client';

import React from 'react';
import { useStudio } from '@/components/studio/StudioContext';
import { Target, Zap, ShieldCheck, Database, BrainCircuit, Activity } from 'lucide-react';

export default function ConfidenceEnginePage() {
    const { results, cfg } = useStudio();
    const metrics = results?.metrics || {};

    const confidenceVal = (metrics.peak_confidence ?? 0) * 100;
    const confidenceColor = confidenceVal >= 90 ? '#10B981' : confidenceVal >= 70 ? '#F59E0B' : '#EF4444';

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: 32 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                <div style={{
                    background: 'rgba(255, 255, 255, 0.7)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.8)',
                    borderRadius: 32,
                    padding: 40,
                    boxShadow: '0 12px 48px rgba(0,0,0,0.06)',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    <div style={{ position: 'absolute', top: -40, right: -40, opacity: 0.05, pointerEvents: 'none' }}>
                        <BrainCircuit size={240} />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                        <Target size={16} className="text-teal-600" />
                        <h2 style={{ fontSize: 11, color: '#94A3B8', fontWeight: 950, letterSpacing: '0.15em', textTransform: 'uppercase' }}>PEAK ENSEMBLE CONFIDENCE</h2>
                    </div>
                    <div style={{ fontSize: 110, fontWeight: 950, color: confidenceColor, lineHeight: 1, letterSpacing: '-0.06em' }}>
                        {confidenceVal.toFixed(1)}<span style={{ fontSize: 32, fontWeight: 700, opacity: 0.6 }}>%</span>
                    </div>
                    <div style={{ display: 'inline-flex', background: `${confidenceColor}10`, color: confidenceColor, borderRadius: 12, padding: '10px 18px', fontSize: 13, fontWeight: 900, marginTop: 32, alignItems: 'center', gap: 8, border: `1px solid ${confidenceColor}15` }}>
                        <ShieldCheck size={16} /> Model Reliability: {confidenceVal >= 70 ? 'High' : 'Nominal'}
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                    <div style={{
                        background: 'rgba(255, 255, 255, 0.7)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(255, 255, 255, 0.8)',
                        borderRadius: 24,
                        padding: 28,
                        boxShadow: '0 8px 32px rgba(0,0,0,0.04)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                            <Zap size={16} className="text-teal-600" />
                            <span style={{ fontSize: 10, color: '#94A3B8', fontWeight: 950, letterSpacing: '0.1em' }}>SAR BIAS</span>
                        </div>
                        <div style={{ fontSize: 32, fontWeight: 950, color: '#0F172A' }}>{(cfg.sar_conf_base * 100).toFixed(1)}%</div>
                    </div>
                    <div style={{
                        background: 'rgba(255, 255, 255, 0.7)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(255, 255, 255, 0.8)',
                        borderRadius: 24,
                        padding: 28,
                        boxShadow: '0 8px 32px rgba(0,0,0,0.04)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                            <Activity size={16} className="text-teal-600" />
                            <span style={{ fontSize: 10, color: '#94A3B8', fontWeight: 950, letterSpacing: '0.1em' }}>OPTICAL BIAS</span>
                        </div>
                        <div style={{ fontSize: 32, fontWeight: 950, color: '#0F172A' }}>{(cfg.opt_conf_base * 100).toFixed(1)}%</div>
                    </div>
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                <h3 style={{ fontSize: 13, fontWeight: 950, color: '#0F172A', marginBottom: 4, letterSpacing: '0.02em', textTransform: 'uppercase' }}>Probabilistic Precision Metrics</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    {[
                        { title: 'Morphological Smoothing', icon: Database, color: '#0EA5E9', desc: 'Applied 30m focal filter for contiguous damage zones.' },
                        { title: 'Consensus Masking', icon: ShieldCheck, color: '#8B5CF6', desc: 'Cross-satellite binary consensus on orbital noise.' },
                        { title: 'Temporal Filter', icon: Activity, color: '#10B981', desc: 'baselines based on 5-year historical GSW datasets.' }
                    ].map((item, i) => (
                        <div key={i} style={{
                            background: 'rgba(255, 255, 255, 0.7)',
                            backdropFilter: 'blur(20px)',
                            border: '1px solid rgba(255, 255, 255, 0.8)',
                            padding: 28,
                            borderRadius: 24,
                            boxShadow: '0 4px 15px rgba(0,0,0,0.02)',
                            position: 'relative',
                            transition: 'all 0.3s'
                        }} onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                            <div style={{ position: 'absolute', top: 24, right: 24, color: `${item.color}30` }}>
                                <item.icon size={22} />
                            </div>
                            <h4 style={{ fontSize: 14, fontWeight: 950, color: '#0F172A', marginBottom: 10 }}>{item.title}</h4>
                            <p style={{ fontSize: 12, color: '#64748B', lineHeight: 1.6, fontWeight: 500, margin: 0 }}>{item.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
