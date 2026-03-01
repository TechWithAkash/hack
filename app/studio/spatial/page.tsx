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
                    <h2 style={{ fontSize: 20, fontWeight: 950, color: '#0F172A', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Globe size={18} className="text-teal-600" /> Pixel Inspector
                    </h2>
                    <p style={{ fontSize: 11, color: '#64748B', marginTop: 2, fontWeight: 500 }}>
                        Distributed Sentinel-1/2 multi-temporal fusion engine.
                    </p>
                </div>

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
                height: 600,
                borderRadius: 24,
                overflow: 'hidden',
                border: '1px solid rgba(226, 232, 240, 0.5)',
                boxShadow: '0 12px 48px rgba(0,0,0,0.08)'
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
                    bottom: 24,
                    left: 24,
                    zIndex: 1000,
                    background: 'rgba(255, 255, 255, 0.7)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.5)',
                    padding: 20,
                    borderRadius: 20,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                    minWidth: 220
                }}>
                    <div style={{ fontSize: 9, fontWeight: 900, color: '#94A3B8', letterSpacing: '0.12em', marginBottom: 16, textTransform: 'uppercase' }}>DETECTION LAYERS</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {[
                            { id: 'sarBase', label: 'SAR Baseline', color: '#6366F1' },
                            { id: 'flood', label: 'Flood Mask', color: '#0EA5E9' },
                            { id: 'optWater', label: 'Optical Water', color: '#2DD4BF' },
                            { id: 'vegDamage', label: 'Vegetation loss', color: '#F43F5E' },
                        ].map(layer => (
                            <label key={layer.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <div style={{ width: 8, height: 8, borderRadius: 2, background: layer.color, boxShadow: `0 0 10px ${layer.color}40` }} />
                                    <span style={{ fontSize: 11, fontWeight: 800, color: '#0F172A' }}>{layer.label}</span>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={layerVisibility[layer.id]}
                                    onChange={e => setLayerVisibility({ ...layerVisibility, [layer.id]: e.target.checked })}
                                    style={{ width: 14, height: 14, accentColor: '#0D7377', cursor: 'pointer' }}
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
