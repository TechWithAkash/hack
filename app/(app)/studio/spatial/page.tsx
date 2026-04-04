'use client';

import React from 'react';
import { useStudio } from '@/components/studio/StudioContext';
import dynamic from 'next/dynamic';
import { Map as MapIcon, Layers, Satellite as SatelliteIcon, MapPin, Eye } from 'lucide-react';

const StudioMap = dynamic<any>(() => import('@/components/studio/StudioMap'), { ssr: false });

const LAYER_DEFS = [
    { id: 'sarBase',  label: 'SAR Baseline',        desc: 'S1 Backscatter',   color: '#6366F1' },
    { id: 'flood',    label: 'Flood Mask',           desc: 'Composite',        color: '#0EA5E9' },
    { id: 'optWater', label: 'Optical Verification', desc: 'S2 Verification',  color: '#2DD4BF' },
    { id: 'vegDamage',label: 'Vegetation Impact',    desc: 'NDVI Delta',       color: '#F43F5E' },
];

const BASE_LAYERS = [
    { id: 'satellite', icon: SatelliteIcon, label: 'Satellite' },
    { id: 'light',     icon: MapIcon,       label: 'Light'     },
    { id: 'dark',      icon: Layers,        label: 'Dark'      },
    { id: 'terrain',   icon: MapPin,        label: 'Terrain'   },
];

export default function SpatialInsightsPage() {
    const { results, layerVisibility, setLayerVisibility, baseLayer, setBaseLayer } = useStudio();

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, height: '100%' }}>

            {/* ── Toolbar ─────────────────────────────────── */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexShrink: 0 }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 3 }}>
                        <SatelliteIcon size={13} color="#0D7377" />
                        <h2 style={{ fontSize: 15, fontWeight: 800, color: '#0F172A', letterSpacing: '-0.01em', margin: 0 }}>
                            Geospatial Analysis
                        </h2>
                    </div>
                    <p style={{ fontSize: 11, color: '#94A3B8', fontWeight: 500, margin: 0 }}>
                        High-fidelity spectral decomposition of regional hydrological anomalies
                    </p>
                </div>

                {/* Base layer pills */}
                <div style={{
                    display: 'flex', gap: 3,
                    background: '#F8FAFC', border: '1px solid #E2E8F0',
                    borderRadius: 10, padding: 4,
                }}>
                    {BASE_LAYERS.map(mode => (
                        <button
                            key={mode.id}
                            onClick={() => setBaseLayer(mode.id as any)}
                            style={{
                                display: 'flex', alignItems: 'center', gap: 5,
                                padding: '6px 11px', borderRadius: 7, fontSize: 11,
                                fontWeight: 700, cursor: 'pointer', border: 'none',
                                transition: 'all 0.15s',
                                background: baseLayer === mode.id ? '#0F172A' : 'transparent',
                                color: baseLayer === mode.id ? 'white' : '#94A3B8',
                                boxShadow: baseLayer === mode.id ? '0 1px 4px rgba(0,0,0,0.15)' : 'none',
                            }}
                        >
                            <mode.icon size={11} />
                            {mode.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Map canvas ──────────────────────────────── */}
            <div style={{
                position: 'relative', flex: 1, minHeight: 480,
                borderRadius: 16, overflow: 'hidden',
                border: '1px solid #E2E8F0', background: '#111827',
                flexShrink: 0,
            }}>
                <StudioMap
                    bounds={results?.metrics?.bounds}
                    tiles={results?.tiles}
                    visibility={layerVisibility}
                    baseLayer={baseLayer}
                />

                {/* Live badge */}
                <div style={{
                    position: 'absolute', top: 14, left: 14, zIndex: 1000,
                    background: 'rgba(15,23,42,0.85)', backdropFilter: 'blur(8px)',
                    color: 'white', padding: '6px 12px', borderRadius: 20,
                    display: 'flex', alignItems: 'center', gap: 7,
                    fontSize: 10, fontWeight: 700, letterSpacing: '0.04em',
                    border: '1px solid rgba(255,255,255,0.1)',
                }}>
                    <div style={{
                        width: 6, height: 6, borderRadius: '50%', background: '#2DD4BF',
                        animation: 'ping 1.5s ease-in-out infinite',
                    }} />
                    Raster Downlink Active
                </div>

                {/* Layer legend */}
                <div style={{
                    position: 'absolute', bottom: 16, left: 16, zIndex: 1000,
                    background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(12px)',
                    border: '1px solid #E2E8F0', borderRadius: 14,
                    padding: '14px 16px', minWidth: 220,
                    boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                }}>
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        marginBottom: 12,
                    }}>
                        <Eye size={11} color="#94A3B8" />
                        <span style={{ fontSize: 9, fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                            Operational Layers
                        </span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {LAYER_DEFS.map(layer => (
                            <label key={layer.id} style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                cursor: 'pointer', gap: 10,
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                                    <div style={{
                                        width: 8, height: 8, borderRadius: 2,
                                        background: layer.color,
                                        boxShadow: `0 0 6px ${layer.color}80`,
                                        flexShrink: 0,
                                    }} />
                                    <div>
                                        <div style={{ fontSize: 11, fontWeight: 700, color: '#0F172A' }}>{layer.label}</div>
                                        <div style={{ fontSize: 9, color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{layer.desc}</div>
                                    </div>
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
            </div>
        </div>
    );
}
