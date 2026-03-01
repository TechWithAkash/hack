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
                    background: 'rgba(255, 255, 255, 0.6)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.5)',
                    borderRadius: 24,
                    padding: 32,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.04)',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    <div style={{ position: 'absolute', top: -40, right: -40, opacity: 0.05, pointerEvents: 'none' }}>
                        <BrainCircuit size={240} />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                        <Target size={14} className="text-teal-600" />
                        <h2 style={{ fontSize: 10, color: '#94A3B8', fontWeight: 900, letterSpacing: '0.15em', textTransform: 'uppercase' }}>PEAK ENSEMBLE CONFIDENCE</h2>
                    </div>
                    <div style={{ fontSize: 96, fontWeight: 950, color: confidenceColor, lineHeight: 1, letterSpacing: '-0.04em' }}>
                        {confidenceVal.toFixed(1)}<span style={{ fontSize: 32 }}>%</span>
                    </div>
                    <div style={{ display: 'inline-flex', background: `${confidenceColor}08`, color: confidenceColor, border: `1px solid ${confidenceColor}15`, borderRadius: 10, padding: '6px 14px', fontSize: 11, fontWeight: 800, marginTop: 24, alignItems: 'center', gap: 6 }}>
                        <ShieldCheck size={14} /> Model Reliability: {confidenceVal >= 70 ? 'High' : 'Nominal'}
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                    <div style={{
                        background: 'rgba(255, 255, 255, 0.6)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.5)',
                        borderRadius: 20,
                        padding: 24,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.02)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                            <Zap size={14} className="text-teal-600" />
                            <span style={{ fontSize: 9, color: '#94A3B8', fontWeight: 900, letterSpacing: '0.1em' }}>SAR BASELINE</span>
                        </div>
                        <div style={{ fontSize: 28, fontWeight: 950, color: '#0F172A' }}>{(cfg.sar_conf_base * 100).toFixed(1)}%</div>
                    </div>
                    <div style={{
                        background: 'rgba(255, 255, 255, 0.6)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.5)',
                        borderRadius: 20,
                        padding: 24,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.02)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                            <Activity size={14} className="text-teal-600" />
                            <span style={{ fontSize: 9, color: '#94A3B8', fontWeight: 900, letterSpacing: '0.1em' }}>OPTICAL BASE</span>
                        </div>
                        <div style={{ fontSize: 28, fontWeight: 950, color: '#0F172A' }}>{(cfg.opt_conf_base * 100).toFixed(1)}%</div>
                    </div>
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <h3 style={{ fontSize: 13, fontWeight: 950, color: '#0F172A', marginBottom: 4, letterSpacing: '0.02em' }}>Probabilistic Precision Metrics</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    {[
                        { title: 'Morphological Smoothing', icon: Database, color: '#0EA5E9', desc: 'Applied 30m focal filter for contiguous damage zones.' },
                        { title: 'Consensus Masking', icon: ShieldCheck, color: '#8B5CF6', desc: 'Cross-satellite binary consensus on orbital noise.' },
                        { title: 'Temporal Filter', icon: Activity, color: '#0D7377', desc: 'baselines based on 5-year historical GSW datasets.' }
                    ].map((item, i) => (
                        <div key={i} style={{
                            background: 'rgba(255, 255, 255, 0.6)',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(255, 255, 255, 0.5)',
                            padding: 24,
                            borderRadius: 20,
                            boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                            position: 'relative'
                        }}>
                            <div style={{ position: 'absolute', top: 20, right: 20, color: `${item.color}20` }}>
                                <item.icon size={18} />
                            </div>
                            <h4 style={{ fontSize: 13, fontWeight: 900, color: '#0F172A', marginBottom: 8 }}>{item.title}</h4>
                            <p style={{ fontSize: 11, color: '#64748B', lineHeight: 1.6, fontWeight: 500, margin: 0 }}>{item.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
