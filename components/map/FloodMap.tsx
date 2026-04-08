'use client';

import { useEffect, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, GeoJSON, ZoomControl, useMap, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { renderToStaticMarkup } from 'react-dom/server';

/* ── Leaflet default icon fix ─────────────────────────── */
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

/* ── Risk colours ─────────────────────────────────────── */
const RISK: Record<string, { fill: string; border: string }> = {
    CRITICAL: { fill: '#FF2E2E', border: '#991B1B' },
    HIGH: { fill: '#FF8A00', border: '#9A3412' },
    MEDIUM: { fill: '#FFD600', border: '#854D0E' },
    LOW: { fill: '#00FF85', border: '#166534' },
    UNKNOWN: { fill: '#64748B', border: '#334155' },
};

/* ── Tile URLs ────────────────────────────────────────── */
const TILES = {
    dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    hybrid: 'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
    light: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
};

/* ── Pulse Marker CSS ── */
const PULSE_STYLES = `
    .pulse-marker {
        border-radius: 50%;
        cursor: pointer;
        box-shadow: 0 0 0 rgba(0, 0, 0, 0.4);
        animation: pulse 2s infinite;
        transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    @keyframes pulse {
        0% { box-shadow: 0 0 0 0px rgba(0, 255, 133, 0.7); }
        70% { box-shadow: 0 0 0 15px rgba(0, 255, 133, 0); }
        100% { box-shadow: 0 0 0 0px rgba(0, 255, 133, 0); }
    }
    .pulse-critical { background: #FF2E2E; border: 2px solid white; }
    .pulse-high { background: #FF8A00; border: 2px solid white; animation-delay: 0.5s; }
    .pulse-medium { background: #FFD600; border: 2px solid white; animation-delay: 1s; }
    .pulse-low { background: #00FF85; border: 2px solid white; animation-delay: 1.5s; box-shadow: 0 0 15px rgba(0, 255, 133, 0.4); }
    .pulse-marker.selected {
        transform: scale(1.8);
        box-shadow: 0 0 40px rgba(255, 255, 255, 1), 0 0 0 6px rgba(15, 23, 42, 0.4) !important;
        z-index: 10000 !important;
    }
`;

function isSatellite(event: any): boolean {
    return event.detectionMethod === 'ENSEMBLE' || event.detectionMethod === 'SAR' || event.detectionMethod === 'UNET';
}

function getEventCenter(e: any): [number, number] | null {
    const geo = e.floodGeometry || e.districtId?.geometry;
    if (!geo || !geo.coordinates) return null;

    try {
        const type = geo.type;
        let coords: number[] | null = null;

        if (type === 'Point') {
            coords = geo.coordinates;
        } else if (type === 'Polygon') {
            // Find a point inside the first ring (usually the centroid or just the first point)
            coords = geo.coordinates[0][0];
        } else if (type === 'MultiPolygon') {
            // Drill down into the first polygon, first ring, first coordinate
            const poly = geo.coordinates[0];
            if (poly && poly[0] && poly[0][0]) {
                coords = poly[0][0];
            }
        }

        if (coords && coords.length >= 2) {
            // Map uses [lat, lng], GeoJSON uses [lng, lat]
            if (coords[1] !== 0 && coords[0] !== 0) {
                return [coords[1], coords[0]];
            }
        }
    } catch (err) {
        console.error('Tactical coordinate extraction failed:', err);
    }
    return null;
}

function MapUpdater({ events }: { events: any[] }) {
    const map = useMap();
    useEffect(() => {
        if (events.length > 0) {
            const group = new L.FeatureGroup(events.map(e => {
                const center = getEventCenter(e);
                if (center) return L.marker(center);
                if (e.floodGeometry) return L.geoJSON(e.floodGeometry);
                return L.marker([20, 78]); // Fallback center
            }));
            const bounds = group.getBounds();
            if (bounds.isValid()) {
                map.fitBounds(bounds, { padding: [100, 100], maxZoom: 10 });
            }
        }
    }, [events.length, map]); // Only fit on initial load/filter change
    return null;
}

function SelectionManager({ events, selectedId }: { events: any[], selectedId: string | null }) {
    const map = useMap();
    const lastSelectedId = useRef<string | null>(null);

    useEffect(() => {
        if (!selectedId || selectedId === lastSelectedId.current) return;
        lastSelectedId.current = selectedId;

        const event = events.find(e => e._id === selectedId);
        if (!event) return;

        const center = getEventCenter(event);
        if (center) {
            map.flyTo(center, 12, { duration: 1.5, easeLinearity: 0.25 });
        }
    }, [selectedId, events, map]);

    return null;
}

function InjectStyles() {
    useEffect(() => {
        const id = 'cosmeon-map-tactical-styles';
        if (document.getElementById(id)) return;
        const s = document.createElement('style');
        s.id = id;
        s.textContent = `
            ${PULSE_STYLES}
            .leaflet-popup-content-wrapper {
                background: rgba(255, 255, 255, 0.98) !important;
                backdrop-filter: blur(16px) !important;
                border: 1px solid rgba(15, 23, 42, 0.1) !important;
                border-radius: 14px !important;
                box-shadow: 0 24px 64px rgba(0,0,0,0.18) !important;
                color: #0F172A !important;
                padding: 0 !important;
            }
            .leaflet-popup-tip { background: #FFFFFF !important; }
            .leaflet-popup-content { margin: 0 !important; }
            .cosmeon-flood-polygon { cursor: pointer; transition: all 0.3s; }
            .weather-estimate-polygon { stroke-dasharray: 6, 4; }
            
            /* Add alert button styling */
            .popup-container .alert-btn { opacity: 0; pointer-events: none; transition: all 0.2s ease; margin-left: auto; }
            .popup-container:hover .alert-btn { opacity: 1; pointer-events: auto; }
        `;
        document.head.appendChild(s);
    }, []);
    return null;
}

if (typeof window !== 'undefined' && !(window as any).dispatchMapAlert) {
    (window as any).dispatchMapAlert = async (id: string, name: string, level: string, pop: number, lat: number, lng: number, btn: HTMLButtonElement) => {
        if (!btn || btn.disabled) return;
        
        const originalText = btn.innerText;
        const originalBg = btn.style.background;
        
        btn.disabled = true;
        btn.innerText = "Sending...";
        btn.style.background = "#94A3B8";
        btn.style.cursor = "wait";

        try {
            const res = await fetch('/api/alerts/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, name, level, pop, lat, lng })
            });
            
            if (!res.ok) throw new Error('API Error');
            
            btn.innerText = "Sent!";
            btn.style.background = "#10B981";
        } catch (err) {
            console.error(err);
            btn.innerText = "Error";
            btn.style.background = "#EF4444";
        } finally {
            setTimeout(() => {
                if (btn) {
                    btn.disabled = false;
                    btn.innerText = originalText;
                    btn.style.background = originalBg;
                    btn.style.cursor = "pointer";
                }
            }, 3000);
        }
    };
}

function FloodPopupContent({ properties: p }: { properties: any }) {
    const rc = RISK[p.riskLevel] ?? RISK.UNKNOWN;
    const dn = p.districtName ?? p.districtId?.districtName ?? 'Field Observation';
    const score = typeof p.riskScore === 'number' ? p.riskScore.toFixed(0) : '—';
    const area = typeof p.floodAreaKm2 === 'number' ? `${p.floodAreaKm2.toFixed(1)} km²` : '—';
    const popRaw = typeof p.affectedPopEst === 'number' ? p.affectedPopEst : 0;
    const pop = popRaw > 0 ? (popRaw / 1000).toFixed(1) + 'k' : '—';
    const isEnsemble = isSatellite(p);
    const center = getEventCenter(p);
    const lat = center ? center[0] : 20.59;
    const lng = center ? center[1] : 78.96;

    return (
        <div className="popup-container" style={{ padding: '20px', minWidth: '260px', fontFamily: "'Inter', sans-serif" }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '4px', background: rc.fill, boxShadow: `0 0 10px ${rc.fill}60` }} />
                <div style={{ fontWeight: 950, fontSize: '15px', color: '#0F172A', textTransform: 'uppercase', letterSpacing: '-0.02em' }}>{dn}</div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                <div>
                    <div style={{ fontSize: '10px', color: '#94A3B8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Risk Level</div>
                    <div style={{ fontSize: '14px', fontWeight: 950, color: rc.fill }}>{p.riskLevel}</div>
                </div>
                <div>
                    <div style={{ fontSize: '10px', color: '#94A3B8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Intensity</div>
                    <div style={{ fontSize: '14px', fontWeight: 950, color: '#0F172A' }}>{score}%</div>
                </div>
                <div>
                    <div style={{ fontSize: '10px', color: '#94A3B8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Detection</div>
                    <div style={{ fontSize: '14px', fontWeight: 950, color: '#0F172A' }}>{area}</div>
                </div>
                <div>
                    <div style={{ fontSize: '10px', color: '#94A3B8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Exposure</div>
                    <div style={{ fontSize: '14px', fontWeight: 950, color: '#0F172A' }}>{pop}</div>
                </div>
            </div>

            <div style={{ padding: '12px', background: '#F8FAFC', borderRadius: '10px', fontSize: '11px', color: '#64748B', fontWeight: 600, lineHeight: 1.5, border: '1px solid #F1F5F9', display: 'flex', alignItems: 'center' }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                     <div>
                         {isEnsemble ? '🛰 Multispectral Analysis' : '🌧 Rainfall Accumulation'} ·
                         <span style={{ color: '#0D7377' }}> {p.detectionMethod || 'ENSEMBLE'}</span>
                     </div>
                </div>
                <div 
                    dangerouslySetInnerHTML={{ __html: `
                        <button 
                            class="alert-btn"
                            onclick="window.dispatchMapAlert('${p._id}', '${dn.replace(/'/g, "\\'")}', '${p.riskLevel}', ${popRaw}, ${lat}, ${lng}, event.currentTarget)"
                            style="background: #0F172A; color: white; border: none; border-radius: 6px; padding: 5px 12px; font-size: 10px; font-weight: 800; cursor: pointer; box-shadow: 0 4px 12px rgba(15,23,42,0.15); font-family: 'Inter', sans-serif;"
                        >
                            Send Alert
                        </button>
                    ` }}
                />
            </div>
        </div>
    );
}

interface FloodMapProps {
    events: any[];
    tileMode: string;
    geeTiles?: Record<string, string>;
    onSelect?: (id: string) => void;
    selectedId?: string | null;
}

export default function FloodMap({ events, tileMode, geeTiles, onSelect, selectedId }: FloodMapProps) {
    return (
        <MapContainer
            center={[20.59, 78.96]}
            zoom={5}
            zoomControl={false}
            style={{ width: '100%', height: '100%' }}
        >
            <InjectStyles />
            <MapUpdater events={events} />
            <SelectionManager events={events} selectedId={selectedId} />
            <ZoomControl position="bottomright" />

            <TileLayer
                key={tileMode}
                url={TILES[tileMode as keyof typeof TILES]}
                attribution='&copy; ESRI &copy; CARTO'
                maxZoom={19}
            />
            {tileMode === 'satellite' && (
                <TileLayer
                    url={TILES.hybrid}
                    opacity={0.8}
                    zIndex={2}
                />
            )}

            {/* GEE Pipeline Tiles */}
            {geeTiles?.flood && <TileLayer url={geeTiles.flood} opacity={0.8} zIndex={4} />}
            {geeTiles?.confidence && <TileLayer url={geeTiles.confidence} opacity={0.6} zIndex={5} />}

            <GeoJSON
                key={`sat-${events.length}-${selectedId}`}
                data={{
                    type: 'FeatureCollection',
                    features: events.filter(isSatellite).map(e => ({
                        type: 'Feature',
                        geometry: e.floodGeometry,
                        properties: e
                    }))
                } as any}
                style={(f: any) => ({
                    fillColor: RISK[f.properties.riskLevel]?.fill || '#94A3B8',
                    fillOpacity: f.properties._id === selectedId ? 0.7 : 0.4,
                    color: RISK[f.properties.riskLevel]?.border || '#334155',
                    weight: f.properties._id === selectedId ? 5 : 2,
                    className: 'cosmeon-flood-polygon'
                })}
                onEachFeature={(f, l) => {
                    const html = renderToStaticMarkup(<FloodPopupContent properties={f.properties} />);
                    l.bindPopup(html, { maxWidth: 300 });
                    l.on('click', () => onSelect?.(f.properties._id));
                }}
            />

            {/* Pulse Intel Markers */}
            {events.map((e, idx) => {
                const center = getEventCenter(e);
                if (!center) return null;

                const isSelected = selectedId === e._id;
                const icon = L.divIcon({
                    className: `pulse-marker pulse-${(e.riskLevel || 'LOW').toLowerCase()} ${isSelected ? 'selected' : ''}`,
                    iconSize: [isSelected ? 36 : 24, isSelected ? 36 : 24],
                    iconAnchor: [isSelected ? 18 : 12, isSelected ? 18 : 12]
                });

                return (
                    <Marker
                        key={`${e._id}-${idx}`}
                        position={center}
                        icon={icon}
                        zIndexOffset={isSelected ? 1000 : 0}
                        eventHandlers={{ click: () => onSelect?.(e._id) }}
                    >
                        <Popup maxWidth={300}>
                            <FloodPopupContent properties={e} />
                        </Popup>
                    </Marker>
                );
            })}
        </MapContainer>
    );
}
