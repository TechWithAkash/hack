'use client';

import React from 'react';
import { useStudio } from '@/components/studio/StudioContext';
import dynamic from 'next/dynamic';
import { Cpu, Info, Search } from 'lucide-react';

const DualMap = dynamic<any>(() => import('@/components/studio/SynchronizedDualMap'), { ssr: false });

export default function CoreAnalysisPage() {
    const { results } = useStudio();

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div>
                <h2 style={{ fontSize: 24, fontWeight: 950, color: '#0F172A', letterSpacing: '-0.04em', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Cpu size={24} className="text-teal-600" /> Synchronized Before / After SAR Detection
                </h2>
                <p style={{ fontSize: 13, color: '#64748B', marginTop: 4, fontWeight: 500 }}>
                    Dual-panel synthetic aperture radar (Sentinel-1) change comparison for rapid flood inundation mapping.
                </p>
            </div>

            <div style={{
                height: 800, // Professional analytical height
                flexShrink: 0, // Prevent squashing
                borderRadius: 24,
                overflow: 'hidden',
                border: '1px solid rgba(0, 0, 0, 0.15)',
                boxShadow: '0 24px 64px rgba(0,0,0,0.15)',
                position: 'relative',
                background: '#0F172A'
            }}>
                <DualMap
                    bounds={results?.metrics?.bounds}
                    preTile={results?.tiles?.pre_s1}
                    postTile={results?.tiles?.post_s1}
                />

                {!results && (
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
                        <div style={{ background: '#F8FAFC', padding: 20, borderRadius: '50%', border: '1px solid #E2E8F0' }}>
                            <Search size={32} className="text-teal-600 opacity-40" />
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: 13, fontWeight: 800, color: '#0F172A' }}>Pipeline results required</div>
                            <div style={{ fontSize: 11, color: '#64748B', marginTop: 4 }}>Run the data ingestion from the sidebar to visualize SAR anomalies.</div>
                        </div>
                    </div>
                )}
            </div>

            <div style={{
                background: '#F1F5F9',
                padding: '12px 20px',
                borderRadius: 16,
                display: 'flex',
                alignItems: 'start',
                gap: 12,
                border: '1px solid #E2E8F0'
            }}>
                <Info size={14} className="text-teal-600 mt-1" />
                <div style={{ fontSize: 10, color: '#475569', lineHeight: 1.6 }}>
                    <span style={{ fontWeight: 800 }}>ALGORITHM NOTE:</span> This view compares Sentinel-1 backscatter (dB) before and after the triggered events. Mathematical locking ensures that panning one panel automatically realigns the reference panel for pixel-perfect change analysis.
                </div>
            </div>
        </div>
    );
}
