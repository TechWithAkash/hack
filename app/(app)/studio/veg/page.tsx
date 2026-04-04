'use client';

import React from 'react';
import { useStudio } from '@/components/studio/StudioContext';
import dynamic from 'next/dynamic';
import { Layers, AlertCircle, Search } from 'lucide-react';

const VegMap = dynamic<any>(() => import('@/components/studio/VegetationMap'), { ssr: false });

export default function VegetationNDVIPage() {
    const { results } = useStudio();

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Header */}
            <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 3 }}>
                    <Layers size={13} color="#10B981" />
                    <h2 style={{ fontSize: 15, fontWeight: 800, color: '#0F172A', letterSpacing: '-0.01em', margin: 0 }}>
                        Vegetation Status — NDVI Change Map
                    </h2>
                </div>
                <p style={{ fontSize: 11, color: '#94A3B8', fontWeight: 500, margin: 0 }}>
                    Sentinel-2 multi-spectral differencing for agricultural impact analysis and biomass monitoring
                </p>
            </div>

            {/* Veg map */}
            <div style={{
                position: 'relative', height: 520, flexShrink: 0,
                borderRadius: 16, overflow: 'hidden',
                border: '1px solid #E2E8F0', background: '#111827',
            }}>
                <VegMap
                    bounds={results?.metrics?.bounds}
                    ndviTile={results?.tiles?.ndvi_diff}
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
                            <div style={{ fontSize: 11, color: '#94A3B8' }}>Run the data ingestion from the sidebar to visualize NDVI anomalies.</div>
                        </div>
                    </div>
                )}
            </div>

            {/* Note */}
            <div style={{
                background: '#FFFBEB', border: '1px solid #FDE68A',
                borderRadius: 10, padding: '10px 14px',
                display: 'flex', gap: 10, alignItems: 'flex-start',
            }}>
                <AlertCircle size={12} color="#D97706" style={{ marginTop: 2, flexShrink: 0 }} />
                <p style={{ fontSize: 11, color: '#92400E', lineHeight: 1.6, margin: 0 }}>
                    <strong>NDVI Sensitivity:</strong> Red areas indicate major vegetation health crashes (−0.5 drop in index). Green areas indicate healthy or recovering biomass. Permanent water bodies and sand are masked out.
                </p>
            </div>
        </div>
    );
}
