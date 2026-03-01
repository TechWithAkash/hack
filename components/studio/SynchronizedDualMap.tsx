'use client';

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useStudio } from './StudioContext';

// Component to "leak" the map instance up to the parent
function MapWatcher({ setMap }: { setMap: (m: L.Map) => void }) {
    const map = useMap();
    useEffect(() => {
        if (map) setMap(map);
    }, [map, setMap]);
    return null;
}

// Fit bounds
function FitBounds({ bounds }: { bounds: number[] | undefined }) {
    const map = useMap();
    useEffect(() => {
        if (!bounds || bounds.length !== 4) return;
        const [w, s, e, n] = bounds;
        map.fitBounds([[s, w], [n, e]], { padding: [20, 20] });
    }, [bounds, map]);
    return null;
}

export default function SynchronizedDualMap({
    preTile,
    postTile,
    bounds
}: {
    preTile?: string,
    postTile?: string,
    bounds?: number[]
}) {
    const [map1, setMap1] = useState<L.Map | null>(null);
    const [map2, setMap2] = useState<L.Map | null>(null);
    const { baseLayer } = useStudio();

    // Side-by-side syncing with movement threshold to prevent loops
    useEffect(() => {
        if (!map1 || !map2) return;

        const onMove1 = () => {
            if (map2.getCenter().distanceTo(map1.getCenter()) > 1 || map2.getZoom() !== map1.getZoom()) {
                map2.setView(map1.getCenter(), map1.getZoom(), { animate: false });
            }
        };
        const onMove2 = () => {
            if (map1.getCenter().distanceTo(map2.getCenter()) > 1 || map1.getZoom() !== map2.getZoom()) {
                map1.setView(map2.getCenter(), map2.getZoom(), { animate: false });
            }
        };

        map1.on('move', onMove1);
        map2.on('move', onMove2);

        return () => {
            map1.off('move', onMove1);
            map2.off('move', onMove2);
        };
    }, [map1, map2]);

    const layerUrl = baseLayer === 'satellite'
        ? "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        : baseLayer === 'dark'
            ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";

    return (
        <div style={{ display: 'flex', width: '100%', height: '100%', gap: 4 }}>
            <div style={{ flex: 1, position: 'relative', borderRadius: 16, overflow: 'hidden', border: '1px solid rgba(0,0,0,0.1)' }}>
                <MapContainer
                    center={[22.5, 82.5]}
                    zoom={5}
                    zoomControl={true}
                    style={{ width: '100%', height: '100%', background: '#0F172A' }}
                >
                    <MapWatcher setMap={setMap1} />
                    <TileLayer url={layerUrl} attribution="Tiles &copy; Esri/Carto" />
                    {preTile && <TileLayer url={preTile} opacity={1.0} />}
                    <FitBounds bounds={bounds} />
                </MapContainer>
                <div style={{
                    position: 'absolute',
                    top: 24,
                    left: 60,
                    zIndex: 1000,
                    background: 'rgba(15, 23, 42, 0.9)',
                    backdropFilter: 'blur(15px)',
                    color: 'white',
                    padding: '8px 16px',
                    borderRadius: 10,
                    fontSize: 10,
                    fontWeight: 900,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
                }}>PRE-EVENT SAR</div>
            </div>

            <div style={{ flex: 1, position: 'relative', borderRadius: 16, overflow: 'hidden', border: '1px solid rgba(0,0,0,0.1)' }}>
                <MapContainer
                    center={[22.5, 82.5]}
                    zoom={5}
                    zoomControl={false}
                    style={{ width: '100%', height: '100%', background: '#0F172A' }}
                >
                    <MapWatcher setMap={setMap2} />
                    <TileLayer url={layerUrl} attribution="Tiles &copy; Esri/Carto" />
                    {postTile && <TileLayer url={postTile} opacity={1.0} />}
                    <FitBounds bounds={bounds} />
                </MapContainer>
                <div style={{
                    position: 'absolute',
                    top: 24,
                    left: 24,
                    zIndex: 1000,
                    background: 'rgba(15, 23, 42, 0.9)',
                    backdropFilter: 'blur(15px)',
                    color: 'white',
                    padding: '8px 16px',
                    borderRadius: 10,
                    fontSize: 10,
                    fontWeight: 900,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
                }}>POST-EVENT SAR</div>
            </div>
        </div>
    );
}
