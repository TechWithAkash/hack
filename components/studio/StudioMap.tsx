'use client';

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, useMap, LayersControl } from 'react-leaflet';
import { useStudio } from './StudioContext';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix leaflet default icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Helper component to handle drawing Area of Interest (AOI)
function DrawingManager({ active, cfg, setCfg, handleRun }: { active: boolean, cfg: any, setCfg: (c: any) => void, handleRun: (oc?: any) => Promise<void> }) {
    const map = useMap();
    const [startPos, setStartPos] = React.useState<[number, number] | null>(null);
    const [tempRect, setTempRect] = React.useState<L.Rectangle | null>(null);

    useEffect(() => {
        if (!active) {
            if (tempRect) {
                tempRect.remove();
                setTempRect(null);
            }
            map.dragging.enable();
            return;
        }

        const onMouseDown = (e: L.LeafletMouseEvent) => {
            map.dragging.disable();
            const pos: [number, number] = [e.latlng.lat, e.latlng.lng];
            setStartPos(pos);
            const rect = L.rectangle([pos, pos], {
                color: "#14B8A6",
                weight: 2,
                fillOpacity: 0.1,
                dashArray: '5, 5'
            }).addTo(map);
            setTempRect(rect);
        };

        const onMouseMove = (e: L.LeafletMouseEvent) => {
            if (!startPos || !tempRect) return;
            const currentPos: [number, number] = [e.latlng.lat, e.latlng.lng];
            tempRect.setBounds([startPos, currentPos]);
        };

        const onMouseUp = (e: L.LeafletMouseEvent) => {
            if (!startPos) return;

            const currentPos: [number, number] = [e.latlng.lat, e.latlng.lng];
            const lat1 = startPos[0];
            const lon1 = startPos[1];
            const lat2 = currentPos[0];
            const lon2 = currentPos[1];

            const nextCfg = {
                ...cfg,
                min_lat: Math.min(lat1, lat2),
                max_lat: Math.max(lat1, lat2),
                min_lon: Math.min(lon1, lon2),
                max_lon: Math.max(lon1, lon2)
            };

            setCfg(nextCfg);
            handleRun(nextCfg); // Auto-trigger pipeline on selection

            setStartPos(null);
            if (tempRect) {
                tempRect.remove();
                setTempRect(null);
            }
            map.dragging.enable();
        };

        map.on('mousedown', onMouseDown);
        map.on('mousemove', onMouseMove);
        map.on('mouseup', onMouseUp);

        return () => {
            map.off('mousedown', onMouseDown);
            map.off('mousemove', onMouseMove);
            map.off('mouseup', onMouseUp);
        };
    }, [active, startPos, tempRect, map, cfg, setCfg, handleRun]);

    return null;
}

// Helper component to auto-fit to bounds
function FitBounds({ bounds }: { bounds: number[] | undefined }) {
    const map = useMap();
    useEffect(() => {
        if (!bounds || bounds.length !== 4) return;
        const [w, s, e, n] = bounds;
        map.fitBounds([[s, w], [n, e]], { padding: [20, 20] });
    }, [bounds, map]);
    return null;
}

interface LayerVisibility {
    sarBase: boolean;
    flood: boolean;
    optWater: boolean;
    vegDamage: boolean;
    confidence: boolean;
}

interface StudioMapProps {
    bounds?: number[]; // [min_lon, min_lat, max_lon, max_lat]
    tiles?: Record<string, string>;
    visibility: LayerVisibility;
    baseLayer?: 'light' | 'dark' | 'satellite' | 'terrain';
}

export default function StudioMap({ bounds, tiles, visibility, baseLayer = 'light' }: StudioMapProps) {
    const { aoiMode, cfg, setCfg, handleRun } = useStudio();

    return (
        <MapContainer
            center={[22.5, 82.5]}
            zoom={5}
            zoomControl={true}
            style={{ width: '100%', height: '100%', background: '#F8FAFC' }}
        >
            <FitBounds bounds={bounds} />
            <DrawingManager
                active={aoiMode === 'draw'}
                cfg={cfg}
                setCfg={setCfg}
                handleRun={handleRun}
            />

            {/* Base Layer Logic */}
            {baseLayer === 'light' && (
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                    attribution='&copy; CARTO'
                />
            )}
            {baseLayer === 'dark' && (
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    attribution='&copy; CARTO'
                />
            )}
            {baseLayer === 'satellite' && (
                <TileLayer
                    url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                    attribution='Tiles &copy; Esri'
                />
            )}
            {baseLayer === 'terrain' && (
                <TileLayer
                    url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
                    attribution='&copy; OpenTopoMap'
                />
            )}

            {/* GEE Computed Layers rendered in optimal stacking order */}
            {visibility.sarBase && tiles?.pre_s1 && (
                <TileLayer url={tiles.pre_s1} opacity={0.65} zIndex={4} />
            )}

            {visibility.sarBase && tiles?.post_s1 && (
                <TileLayer url={tiles.post_s1} opacity={1.0} zIndex={5} />
            )}

            {visibility.flood && tiles?.flood && (
                <TileLayer url={tiles.flood} opacity={0.9} zIndex={6} />
            )}

            {visibility.vegDamage && tiles?.ndvi_loss && (
                <TileLayer url={tiles.ndvi_loss} opacity={0.8} zIndex={7} />
            )}

            {visibility.optWater && tiles?.optical_flood && (
                <TileLayer url={tiles.optical_flood} opacity={0.7} zIndex={8} />
            )}

            {visibility.confidence && tiles?.confidence && (
                <TileLayer url={tiles.confidence} opacity={0.5} zIndex={9} />
            )}
        </MapContainer>
    );
}
