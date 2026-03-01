'use client';

import React from 'react';
import { useStudio } from '@/components/studio/StudioContext';
import dynamic from 'next/dynamic';
import { Map as MapIcon, Layers, Satellite as SatelliteIcon, Globe, MapPin } from 'lucide-react';

const StudioMap = dynamic<any>(() => import('@/components/studio/StudioMap'), { ssr: false });

export default function SpatialInsightsPage() {
    const { results, layerVisibility, setLayerVisibility, baseLayer, setBaseLayer } = useStudio();

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                    <h2 style={{ fontSize: 24, fontWeight: 950, color: '#0F172A', letterSpacing: '-0.04em', display: 'flex', alignItems: 'center', gap: 12 }}>
                        <Globe size={24} className="text-teal-600" /> Geospatial Pixel Inspector
                    </h2>
                    <p style={{ fontSize: 13, color: '#64748B', marginTop: 4, fontWeight: 500 }}>
                        Real-time Distributed Sentinel-1/2 multi-temporal fusion engine for high-resolution flood analysis.
                    </p>
                </div>

                {/* ... Base Layer Control (preserved) ... */}
                <div style={{
                    display: 'flex',
                    background: 'rgba(255, 255, 255, 0.6)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(226, 232, 240, 0.5)',
                    borderRadius: 12,
                    padding: 4,
                    gap: 4,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
                }}>
                    {[
                        { id: 'satellite', icon: SatelliteIcon, label: 'Sat' },
                        { id: 'light', icon: MapIcon, label: 'Light' },
                        { id: 'dark', icon: Layers, label: 'Dark' },
                        { id: 'terrain', icon: MapPin, label: 'Terrain' },
                    ].map(mode => (
                        <button
                            key={mode.id}
                            onClick={() => setBaseLayer(mode.id as any)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 6,
                                padding: '6px 12px',
                                borderRadius: 8,
                                fontSize: 10,
                                fontWeight: 900,
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                border: 'none',
                                background: baseLayer === mode.id ? '#0F172A' : 'transparent',
                                color: baseLayer === mode.id ? '#FFFFFF' : '#64748B'
                            }}
                        >
                            <mode.icon size={12} />
                            {mode.label}
                        </button>
                    ))}
                </div>
            </div>

            <div style={{
                position: 'relative',
                height: 800, // Massive analytical height
                flexShrink: 0, // CRITICAL: Stop flex squashing
                borderRadius: 32,
                overflow: 'hidden',
                border: '1px solid rgba(0, 0, 0, 0.15)',
                boxShadow: '0 24px 64px rgba(0,0,0,0.15)',
                background: '#0F172A'
            }}>
                <StudioMap
                    bounds={results?.metrics?.bounds}
                    tiles={results?.tiles}
                    visibility={layerVisibility}
                    baseLayer={baseLayer}
                />

                {/* Layer Control Legend */}
                <div style={{
                    position: 'absolute',
                    bottom: 32,
                    left: 32,
                    zIndex: 1000,
                    background: 'rgba(255, 255, 255, 0.85)',
                    backdropFilter: 'blur(25px)',
                    border: '1px solid rgba(255, 255, 255, 0.6)',
                    padding: 24,
                    borderRadius: 24,
                    boxShadow: '0 12px 40px rgba(15, 23, 42, 0.15)',
                    minWidth: 260
                }}>
                    <div style={{ fontSize: 10, fontWeight: 950, color: '#64748B', letterSpacing: '0.15em', marginBottom: 20, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 12, height: 2, background: '#0F172A', borderRadius: 2 }} />
                        DETECTION LAYERS
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        {[
                            { id: 'sarBase', label: 'SAR Baseline', color: '#6366F1', desc: 'S1 Backscatter' },
                            { id: 'flood', label: 'Flood Mask', color: '#0EA5E9', desc: 'Composite' },
                            { id: 'optWater', label: 'Optical Water', color: '#2DD4BF', desc: 'S2 Verification' },
                            { id: 'vegDamage', label: 'Vegetation loss', color: '#F43F5E', desc: 'NDVI Delta' },
                        ].map(layer => (
                            <label key={layer.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', transition: 'all 0.2s', padding: '2px 0' }} onMouseOver={(e) => e.currentTarget.style.opacity = '0.8'} onMouseOut={(e) => e.currentTarget.style.opacity = '1'}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <div style={{ width: 10, height: 10, borderRadius: 3, background: layer.color, boxShadow: `0 0 12px ${layer.color}60` }} />
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <span style={{ fontSize: 11, fontWeight: 900, color: '#0F172A' }}>{layer.label}</span>
                                        <span style={{ fontSize: 8, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase' }}>{layer.desc}</span>
                                    </div>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={layerVisibility[layer.id]}
                                    onChange={e => setLayerVisibility({ ...layerVisibility, [layer.id]: e.target.checked })}
                                    style={{ width: 16, height: 16, accentColor: '#0F172A', cursor: 'pointer' }}
                                />
                            </label>
                        ))}
                    </div>
                </div>

                {/* Status Badge */}
                <div style={{
                    position: 'absolute',
                    top: 24,
                    left: 24,
                    zIndex: 1000,
                    background: '#0F172A',
                    color: '#FFF',
                    padding: '6px 12px',
                    borderRadius: 10,
                    fontSize: 10,
                    fontWeight: 900,
                    boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    letterSpacing: '0.05em'
                }}>
                    <div className="h-1.5 w-1.5 rounded-full bg-teal-400 animate-pulse" />
                    RASTER STREAM ACTIVE
                </div>
            </div>
        </div>
    );
}
