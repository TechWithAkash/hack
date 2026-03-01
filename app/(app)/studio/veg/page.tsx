'use client';

import React from 'react';
import { useStudio } from '@/components/studio/StudioContext';
import dynamic from 'next/dynamic';
import { Layers, Info, Search, AlertCircle } from 'lucide-react';

const VegMap = dynamic<any>(() => import('@/components/studio/VegetationMap'), { ssr: false });

export default function VegetationNDVIPage() {
    const { results } = useStudio();

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div>
                <h2 style={{ fontSize: 24, fontWeight: 950, color: '#0F172A', letterSpacing: '-0.04em', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Layers size={24} className="text-teal-600" /> Vegetation Status (NDVI Change Map)
                </h2>
                <p style={{ fontSize: 13, color: '#64748B', marginTop: 4, fontWeight: 500 }}>
                    Sentinel-2 multi-spectral differencing for agricultural impact analysis and biomass monitoring.
                </p>
            </div>

            <div style={{
                height: 800, // Substantial, readable analytical height
                flexShrink: 0, // CRITICAL: Stop flex squashing
                borderRadius: 24,
                overflow: 'hidden',
                border: '1px solid rgba(0, 0, 0, 0.15)',
                boxShadow: '0 24px 64px rgba(0,0,0,0.15)',
                position: 'relative',
                background: '#0F172A'
            }}>
                <VegMap
                    bounds={results?.metrics?.bounds}
                    ndviTile={results?.tiles?.ndvi_diff}
                />

                {!results && (
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
                        <div style={{ background: '#F8FAFC', padding: 20, borderRadius: '50%', border: '1px solid #E2E8F0' }}>
                            <Search size={32} className="text-teal-600 opacity-40" />
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: 13, fontWeight: 800, color: '#0F172A' }}>Pipeline results required</div>
                            <div style={{ fontSize: 11, color: '#64748B', marginTop: 4 }}>Run the data ingestion from the sidebar to visualize NDVI anomalies.</div>
                        </div>
                    </div>
                )}
            </div>

            <div style={{
                background: '#FFFBEB',
                padding: '12px 20px',
                borderRadius: 16,
                display: 'flex',
                alignItems: 'start',
                gap: 12,
                border: '1px solid #FEF3C7'
            }}>
                <AlertCircle size={14} className="text-amber-600 mt-1" />
                <div style={{ fontSize: 10, color: '#92400E', lineHeight: 1.6 }}>
                    <span style={{ fontWeight: 800 }}>NDVI SENSITIVITY:</span> Red areas indicate major vegetation health crashes (-0.5 drop in index), while green areas indicate healthy or recovering biomass. This map is mathematically masked to ignore permanent bodies of water and sand, focusing purely on vegetative change.
                </div>
            </div>
        </div>
    );
}
