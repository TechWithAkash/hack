'use client';

import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, GeoJSON, ZoomControl, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

/* ── Leaflet default icon fix ─────────────────────────── */
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

/* ── Risk colours ─────────────────────────────────────── */
const RISK: Record<string, { fill: string; border: string }> = {
    CRITICAL: { fill: '#EF4444', border: '#DC2626' },
    HIGH: { fill: '#F97316', border: '#EA580C' },
    MEDIUM: { fill: '#EAB308', border: '#CA8A04' },
    LOW: { fill: '#22C55E', border: '#16A34A' },
    UNKNOWN: { fill: '#94A3B8', border: '#64748B' },
};

/* ── Tile URLs ────────────────────────────────────────── */
const TILES = {
    dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    light: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
};

/* ── Is this a satellite-derived or weather-estimated event? ── */
function isSatellite(event: any): boolean {
    return event.detectionMethod === 'ENSEMBLE' || event.detectionMethod === 'SAR' || event.detectionMethod === 'UNET';
}

/* ── Inject global popup + dashed polygon styles ─────── */
function InjectStyles() {
    useEffect(() => {
        const id = 'cosmeon-flood-styles';
        if (document.getElementById(id)) return;
        const s = document.createElement('style');
        s.id = id;
        s.textContent = `
            .leaflet-popup-content-wrapper {
                background: #0D1B2A !important;
                border: 1px solid rgba(255,255,255,0.12) !important;
                border-radius: 12px !important;
                box-shadow: 0 20px 60px rgba(0,0,0,0.6) !important;
                color: #E2E8F0 !important;
                padding: 0 !important;
            }
            .leaflet-popup-tip { background: #0D1B2A !important; }
            .leaflet-popup-content { margin: 0 !important; }
            .cosmeon-flood-polygon { cursor: pointer; }
            /* Dashed style for weather-estimate polygons */
            .weather-estimate-polygon {
                stroke-dasharray: 8, 5;
            }
        `;
        document.head.appendChild(s);
    }, []);
    return null;
}

/* ── Build popup HTML ─────────────────────────────────── */
function floodPopup(p: Record<string, any>): string {
    const rc = RISK[p.riskLevel] ?? RISK.UNKNOWN;
    const dn = p.districtName ?? p.districtId?.districtName ?? 'Unknown district';
    const st = p.stateName ?? p.districtId?.stateName ?? 'India';
    const score = typeof p.riskScore === 'number' ? p.riskScore.toFixed(1) : '—';
    const area = typeof p.floodAreaKm2 === 'number' ? `${p.floodAreaKm2.toFixed(1)} km²` : '—';
    const pop = typeof p.affectedPopEst === 'number' ? p.affectedPopEst.toLocaleString() : '—';
    const conf = typeof p.confidenceScore === 'number' ? `${Math.round(p.confidenceScore * 100)}%` : '—';
    const delta = typeof p.changeFromPrevKm2 === 'number' ? p.changeFromPrevKm2 : null;
    const sarDb = p.metadata?.sarChangeDb;
    const ndwi = p.metadata?.ndwiMean;
    const refWin = p.metadata?.referenceWindow ?? null;
    const curWin = p.metadata?.analysisWindow ?? null;
    const isEnsemble = isSatellite(p);

    /* Source badge */
    const sourceBadge = isEnsemble
        ? `<div style="display:inline-flex;align-items:center;gap:5px;background:#0D737722;
                       border:1px solid #0D737760;border-radius:5px;padding:2px 8px;
                       font-size:10px;font-weight:700;color:#5EEAD4;margin-bottom:8px;">
              🛰 GEE · Sentinel-1 SAR + Sentinel-2 NDWI
           </div>`
        : `<div style="display:inline-flex;align-items:center;gap:5px;background:#7C3AED22;
                       border:1px solid #7C3AED60;border-radius:5px;padding:2px 8px;
                       font-size:10px;font-weight:700;color:#A78BFA;margin-bottom:8px;">
              🌧 Open-Meteo Rainfall Estimate
           </div>`;

    const deltaHtml = delta !== null
        ? `<div style="color:#94A3B8">Δ vs Prev</div>
           <div style="color:${delta > 0 ? '#EF4444' : '#22C55E'};font-weight:700">
             ${delta > 0 ? '+' : ''}${(delta as number).toFixed(1)} km²
           </div>`
        : '';

    const sarHtml = sarDb !== undefined && sarDb !== 0
        ? `<div style="color:#94A3B8">SAR VV Δ</div>
           <div style="color:#fff;font-weight:600">${(sarDb as number).toFixed(3)} dB</div>`
        : '';

    const ndwiHtml = ndwi !== undefined && ndwi !== 0
        ? `<div style="color:#94A3B8">NDWI Index</div>
           <div style="color:#fff;font-weight:600">${(ndwi as number).toFixed(4)}</div>`
        : '';

    const windowHtml = (refWin && curWin)
        ? `<div style="margin-top:6px;padding-top:6px;border-top:1px solid rgba(255,255,255,0.07);
                       font-size:10px;color:#475569;line-height:1.6">
             Change detection: <span style="color:#64748B">${refWin}</span>
             → <span style="color:#64748B">${curWin}</span>
           </div>`
        : '';

    const estimateNote = !isEnsemble
        ? `<div style="margin-top:6px;font-size:10px;color:#6D28D9;line-height:1.5">
             ℹ Polygon = rainfall-area estimate. Run GEE Pipeline for
             satellite-pixel level flood boundary detection.
           </div>`
        : '';

    return `
    <div style="padding:16px 18px;min-width:250px;font-family:'Inter',system-ui,sans-serif">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
        <div style="width:10px;height:10px;border-radius:3px;
                    background:${rc.fill};box-shadow:0 0 8px ${rc.fill}80;flex-shrink:0"></div>
        <div style="font-weight:800;font-size:14px;color:#F8FAFC">${dn}</div>
      </div>
      <div style="font-size:11px;color:#64748B;margin-bottom:8px">${st}</div>
      ${sourceBadge}
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px 20px;font-size:12px">
        <div style="color:#94A3B8">Risk Level</div>
        <div style="color:${rc.fill};font-weight:800">${p.riskLevel ?? '—'}</div>
        <div style="color:#94A3B8">Risk Score</div>
        <div style="color:#fff;font-weight:600">${score} / 100</div>
        <div style="color:#94A3B8">Flood Area</div>
        <div style="color:#fff;font-weight:600">${area}</div>
        <div style="color:#94A3B8">Affected Pop</div>
        <div style="color:#fff;font-weight:600">${pop}</div>
        <div style="color:#94A3B8">Confidence</div>
        <div style="color:#fff;font-weight:600">${conf}</div>
        <div style="color:#94A3B8">Method</div>
        <div style="color:#5EEAD4;font-weight:600">${p.detectionMethod ?? 'ENSEMBLE'}</div>
        ${deltaHtml}${sarHtml}${ndwiHtml}
      </div>
      ${windowHtml}${estimateNote}
    </div>`;
}

/* ══════════════════════════════════════════════════════════
   SATELLITE FLOOD LAYER — GEE ENSEMBLE events (solid polygons)
   Higher confidence, pixel-level detection
══════════════════════════════════════════════════════════ */
function SatelliteFloodLayer({ events }: { events: any[] }) {
    const map = useMap();
    const ref = useRef<L.GeoJSON | null>(null);

    const satelliteEvents = events.filter(isSatellite);

    const features = satelliteEvents
        .filter(e => e.floodGeometry?.type === 'Polygon' || e.floodGeometry?.type === 'MultiPolygon')
        .map(e => ({
            type: 'Feature' as const,
            properties: {
                ...e,
                districtName: e.districtId?.districtName ?? e.districtName ?? 'Unknown',
                stateName: e.districtId?.stateName ?? e.stateName ?? 'Assam',
            },
            geometry: e.floodGeometry,
        }));

    if (!features.length) return null;

    const style = (feature: any) => {
        const rc = RISK[feature.properties.riskLevel] ?? RISK.UNKNOWN;
        return {
            fillColor: rc.fill,
            fillOpacity: 0.32,
            color: rc.border,
            weight: 2.5,
            opacity: 1.0,
            className: 'cosmeon-flood-polygon',
        };
    };

    const onEachFeature = (feature: any, layer: any) => {
        layer.bindPopup(floodPopup(feature.properties), { maxWidth: 310 });
        layer.on('mouseover', () => layer.setStyle({ fillOpacity: 0.58, weight: 3.5 }));
        layer.on('mouseout', () => layer.setStyle({ fillOpacity: 0.32, weight: 2.5 }));
    };

    return (
        <GeoJSON
            key={`sat-${features.length}-${features.map(f => f.properties.riskLevel).join('')}`}
            data={{ type: 'FeatureCollection' as const, features } as any}
            style={style}
            onEachFeature={onEachFeature}
        />
    );
}

/* ══════════════════════════════════════════════════════════
   WEATHER ESTIMATE LAYER — Open-Meteo derived events (dashed polygons)
   Lower confidence, rainfall-area bounding boxes
══════════════════════════════════════════════════════════ */
function WeatherEstimateLayer({ events }: { events: any[] }) {
    const weatherEvents = events.filter(e => !isSatellite(e));

    const features = weatherEvents
        .filter(e => {
            const hasGeom = e.floodGeometry?.type === 'Polygon' || e.floodGeometry?.type === 'MultiPolygon';
            const hasBbox = e.metadata?.floodBbox?.length === 4;
            return hasGeom || hasBbox;
        })
        .map(e => {
            let geom: any;
            if (e.floodGeometry?.type === 'Polygon' || e.floodGeometry?.type === 'MultiPolygon') {
                geom = e.floodGeometry;
            } else {
                const [w, s, east, n] = e.metadata.floodBbox as number[];
                geom = { type: 'Polygon', coordinates: [[[w, s], [east, s], [east, n], [w, n], [w, s]]] };
            }
            return {
                type: 'Feature' as const,
                properties: {
                    ...e,
                    districtName: e.districtId?.districtName ?? e.districtName ?? 'Unknown',
                    stateName: e.districtId?.stateName ?? e.stateName ?? 'Assam',
                },
                geometry: geom,
            };
        });

    if (!features.length) return null;

    /**
     * Dashed border style distinguishes weather estimates from satellite detections.
     * Lower fillOpacity signals lower confidence. A dash pattern is applied via SVG pathOptions.
     */
    const style = (feature: any) => {
        const rc = RISK[feature.properties.riskLevel] ?? RISK.UNKNOWN;
        return {
            fillColor: rc.fill,
            fillOpacity: 0.12,       // Noticeably lighter than satellite layer
            color: rc.border,
            weight: 2,
            opacity: 0.75,
            dashArray: '8 5',      // Dashed border = weather estimate
            className: 'cosmeon-flood-polygon weather-estimate-polygon',
        };
    };

    const onEachFeature = (feature: any, layer: any) => {
        layer.bindPopup(floodPopup(feature.properties), { maxWidth: 310 });
        layer.on('mouseover', () => layer.setStyle({ fillOpacity: 0.28, weight: 3 }));
        layer.on('mouseout', () => layer.setStyle({ fillOpacity: 0.12, weight: 2 }));
    };

    return (
        <GeoJSON
            key={`wx-${features.length}-${features.map(f => f.properties.riskLevel).join('')}`}
            data={{ type: 'FeatureCollection' as const, features } as any}
            style={style}
            onEachFeature={onEachFeature}
        />
    );
}

/* ── Props ────────────────────────────────────────────── */
interface FloodMapProps {
    events: any[];
    tileMode: keyof typeof TILES;
}

/* ════════════════════════════════════════════════════════
   MAIN MAP EXPORT
   Two GeoJSON layers: satellite events (solid) + weather estimates (dashed)
════════════════════════════════════════════════════════ */
export default function FloodMap({ events, tileMode }: FloodMapProps) {
    return (
        <MapContainer
            center={[20.59, 78.96]}
            zoom={5}
            zoomControl={false}
            style={{ width: '100%', height: '580px', minHeight: '580px' }}
        >
            <InjectStyles />
            <ZoomControl position="bottomright" />

            <TileLayer
                key={tileMode}
                url={TILES[tileMode]}
                attribution='&copy; <a href="https://carto.com">CARTO</a> &copy; <a href="https://openstreetmap.org">OSM</a>'
                maxZoom={19}
            />

            {/* Dashed: Open-Meteo rainfall estimates (lower layer) */}
            <WeatherEstimateLayer events={events} />

            {/* Solid: GEE satellite detections (render on top) */}
            <SatelliteFloodLayer events={events} />
        </MapContainer>
    );
}
