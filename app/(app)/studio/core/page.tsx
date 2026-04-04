'use client';

import React from 'react';
import { useStudio } from '@/components/studio/StudioContext';
import dynamic from 'next/dynamic';
import { Cpu, Search } from 'lucide-react';

const DualMap = dynamic<any>(() => import('@/components/studio/SynchronizedDualMap'), { ssr: false });

export default function CoreAnalysisPage() {
    const { results } = useStudio();

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Header */}
            <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 3 }}>
                    <Cpu size={13} color="#0D7377" />
                    <h2 style={{ fontSize: 15, fontWeight: 800, color: '#0F172A', letterSpacing: '-0.01em', margin: 0 }}>
                        Before / After SAR Analysis
                    </h2>
                </div>
                <p style={{ fontSize: 11, color: '#94A3B8', fontWeight: 500, margin: 0 }}>
                    Synchronized Sentinel-1 backscatter comparison for rapid flood inundation mapping
                </p>
            </div>

            {/* Dual map */}
            <div style={{
                position: 'relative', height: 520, flexShrink: 0,
                borderRadius: 16, overflow: 'hidden',
                border: '1px solid #E2E8F0', background: '#111827',
            }}>
                <DualMap
                    bounds={results?.metrics?.bounds}
                    preTile={results?.tiles?.pre_s1}
                    postTile={results?.tiles?.post_s1}
                />
                {!results && (
                    <div style={{
                        position: 'absolute', inset: 0, zIndex: 1000,
                        background: 'rgba(255,255,255,0.88)', backdropFilter: 'blur(6px)',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12,
                    }}>
                        <div style={{ background: '#F8FAFC', padding: 16, borderRadius: 12, border: '1px solid #E2E8F0' }}>
                            <Search size={24} color="#94A3B8" />
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', marginBottom: 4 }}>Pipeline results required</div>
                            <div style={{ fontSize: 11, color: '#94A3B8' }}>Run the data ingestion from the sidebar to visualize SAR anomalies.</div>
                        </div>
                    </div>
                )}
            </div>

            {/* Note */}
            <div style={{
                background: '#F8FAFC', border: '1px solid #E2E8F0',
                borderRadius: 10, padding: '10px 14px',
                display: 'flex', gap: 10, alignItems: 'flex-start',
            }}>
                <Cpu size={12} color="#0D7377" style={{ marginTop: 2, flexShrink: 0 }} />
                <p style={{ fontSize: 11, color: '#64748B', lineHeight: 1.6, margin: 0 }}>
                    <strong style={{ color: '#0F172A' }}>Algorithm Note:</strong> Compares Sentinel-1 backscatter (dB) before and after triggered events. Mathematical locking ensures pixel-perfect change analysis.
                </p>
            </div>
        </div>
    );
}
