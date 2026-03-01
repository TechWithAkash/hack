'use client';

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useStudio } from './StudioContext';

function FitBounds({ bounds }: { bounds: number[] | undefined }) {
    const map = useMap();
    useEffect(() => {
        if (!bounds || bounds.length !== 4) return;
        const [w, s, e, n] = bounds;
        map.fitBounds([[s, w], [n, e]], { padding: [20, 20] });
    }, [bounds, map]);
    return null;
}

export default function VegetationMap({
    ndviTile,
    bounds
}: {
    ndviTile?: string,
    bounds?: number[]
}) {
    const { baseLayer } = useStudio();

    const layerUrl = baseLayer === 'satellite'
        ? "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        : baseLayer === 'dark'
            ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";

    return (
        <MapContainer
            center={[22.5, 82.5]}
            zoom={5}
            zoomControl={true}
            style={{ width: '100%', height: '100%', background: '#0F172A' }}
        >
            <TileLayer url={layerUrl} attribution="Tiles &copy; Esri/Carto" />
            {ndviTile && <TileLayer url={ndviTile} opacity={1.0} />}
            <FitBounds bounds={bounds} />
        </MapContainer>
    );
}
