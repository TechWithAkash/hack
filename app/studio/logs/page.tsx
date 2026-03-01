'use client';

import React from 'react';
import { useStudio } from '@/components/studio/StudioContext';
import { Terminal, Activity, CheckCircle2, AlertTriangle, Clock } from 'lucide-react';

export default function PipelineLogsPage() {
    const { results } = useStudio();
    const metrics = results?.metrics || {};

    return (
        <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
                <div>
                    <h2 style={{ fontSize: 24, fontWeight: 950, color: '#0F172A', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: 12 }}>
                        <Terminal size={24} className="text-teal-600" /> Pipeline Telemetry Stream
                    </h2>
                    <p style={{ fontSize: 13, color: '#64748B', marginTop: 4, fontWeight: 500 }}>
                        Real-time backend execution logs from Distributed GEE Intelligence Engine
                    </p>
                </div>

                <div style={{
                    fontSize: 11, fontWeight: 900, background: results ? '#F0FDF4' : '#F1F5F9',
                    color: results ? '#16A34A' : '#64748B', borderRadius: 10, padding: '8px 16px',
                    display: 'flex', alignItems: 'center', gap: 10, border: '1px solid currentColor', borderOpacity: 0.1
                }}>
                    {results ? <CheckCircle2 size={14} /> : <Clock size={14} />}
                    {results ? 'TASK COMPLETE' : 'AWAITING RUN...'}
                </div>
            </div>

            <div style={{
                background: '#0F172A', padding: '12px', borderRadius: 24, border: '8px solid #E2E8F0',
                minHeight: 550, overflow: 'hidden', display: 'flex', flexDirection: 'column',
                boxShadow: '0 12px 48px rgba(0,0,0,0.12)'
            }}>
                {/* Terminal Header */}
                <div style={{ background: '#1E293B', padding: '12px 20px', borderRadius: '14px 14px 0 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #334155' }}>
                    <div style={{ display: 'flex', gap: 8 }}>
                        <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#EF4444' }} />
                        <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#F59E0B' }} />
                        <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#10B981' }} />
                    </div>
                    <div style={{ fontSize: 10, color: '#94A3B8', fontWeight: 700, letterSpacing: '0.1em' }}>COSMEON CLI v1.0.4</div>
                </div>

                <div style={{ flex: 1, padding: 32, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12, fontFamily: 'monospace', fontSize: 13, background: '#0F172A' }}>
                    {metrics.run_logs?.map((log: string, i: number) => {
                        const isError = log.includes('ERROR') || log.includes('Failed') || log.includes('KeyError');
                        const isSuccess = log.includes('Complete') || log.includes('SUCCESS') || log.includes('✅');
                        const isWarning = log.includes('WARN') || log.includes('⚠️');
                        const color = isError ? '#F87171' : isSuccess ? '#4ADE80' : isWarning ? '#FBBF24' : '#E2E8F0';

                        return (
                            <div key={i} style={{ display: 'flex', gap: 24, alignItems: 'flex-start', borderLeft: `2px solid ${color}40`, paddingLeft: 12 }}>
                                <div style={{ color: '#475569', flexShrink: 0, fontSize: 11 }}>[{new Date().toISOString().split('T')[1].replace('Z', '')}]</div>
                                <div style={{ color, wordBreak: 'break-all', lineHeight: 1.6 }}>
                                    <span style={{ color: '#475569', marginRight: 8 }}>$</span>
                                    {log}
                                </div>
                            </div>
                        );
                    }) ?? (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 400, gap: 24, color: '#475569' }}>
                                <Activity size={48} className="opacity-20 animate-pulse" />
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: 14, fontWeight: 700, color: '#94A3B8', marginBottom: 8 }}>TERMINAL IDLE</div>
                                    <div style={{ fontSize: 12, maxWidth: 300, lineHeight: 1.6 }}>Execute the GEE pipeline from the sidebar to initialize the telemetry stream.</div>
                                </div>
                            </div>
                        )}
                </div>
            </div>
        </div>
    );
}
