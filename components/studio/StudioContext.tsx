import React, { createContext, useContext, useState, ReactNode } from 'react';
import toast from 'react-hot-toast';

// Compute AOI area in km² (flat-earth approximation)
function aoiKm2(minLon: number, minLat: number, maxLon: number, maxLat: number): number {
    const wKm = (maxLon - minLon) * 111 * Math.cos(((minLat + maxLat) / 2) * Math.PI / 180);
    const hKm = (maxLat - minLat) * 111;
    return wKm * hKm;
}

// Auto-scale resolution based on AOI size to prevent GEE timeout
function autoScale(areaKm2: number): number {
    if (areaKm2 > 100000) return 1000;
    if (areaKm2 > 50000) return 500;
    if (areaKm2 > 10000) return 300;
    if (areaKm2 > 1000) return 150;
    return 100;
}

interface StudioContextType {
    cfg: any;
    setCfg: (cfg: any) => void;
    results: any;
    loading: boolean;
    handleRun: (overrideCfg?: any) => Promise<void>;
    layerVisibility: any;
    setLayerVisibility: (v: any) => void;
    baseLayer: 'light' | 'dark' | 'satellite' | 'terrain';
    setBaseLayer: (l: 'light' | 'dark' | 'satellite' | 'terrain') => void;
    aoiMode: 'draw' | 'manual';
    setAoiMode: (m: 'draw' | 'manual') => void;
    drawnBounds: [number, number, number, number] | null;
    setDrawnBounds: (b: [number, number, number, number] | null) => void;
}

const StudioContext = createContext<StudioContextType | undefined>(undefined);

export function StudioProvider({ children }: { children: ReactNode }) {
    const [cfg, setCfg] = useState({
        min_lon: 0, max_lon: 0,
        min_lat: 0, max_lat: 0,
        pre_start: '2022-05-01', pre_end: '2022-05-31',
        post_start: '2022-06-01', post_end: '2022-06-30',
        threshold: -2.0, ndvi_thresh: -0.12, cloud_pct: 25,
        sar_conf_base: 0.90, opt_conf_base: 0.80,
        scale: 150, run: true
    });

    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<any>(null);
    const [drawnBounds, setDrawnBounds] = useState<[number, number, number, number] | null>(null);

    const [layerVisibility, setLayerVisibility] = useState({
        sarBase: true, flood: true, optWater: true, vegDamage: true, confidence: false
    });

    const [baseLayer, setBaseLayer] = useState<'light' | 'dark' | 'satellite' | 'terrain'>('satellite');
    const [aoiMode, setAoiMode] = useState<'draw' | 'manual'>('draw');

    const handleRun = async (overrideCfg?: any) => {
        const currentCfg = overrideCfg || cfg;

        // Validate AOI is set
        if (!currentCfg.min_lon && !currentCfg.max_lon && !currentCfg.min_lat && !currentCfg.max_lat) {
            toast.error('Please draw an AOI on the map or enter coordinates first.', { id: 'gee' });
            return;
        }

        // Calculate AOI area and auto-scale resolution
        const area = aoiKm2(currentCfg.min_lon, currentCfg.min_lat, currentCfg.max_lon, currentCfg.max_lat);

        if (area > 200000) {
            toast.error(`AOI too large (${Math.round(area).toLocaleString()} km²). Max ~200,000 km². Draw a smaller region.`, { id: 'gee' });
            return;
        }

        // Smart auto-scale: override resolution for large regions
        const smartScale = autoScale(area);
        if (smartScale > currentCfg.scale) {
            currentCfg.scale = smartScale;
            setCfg({ ...currentCfg });
            toast(`Resolution auto-adjusted to ${smartScale}m for ${Math.round(area).toLocaleString()} km² AOI`, { id: 'scale-info', icon: '📐' });
        }

        setLoading(true);
        toast.loading('Initializing Earth Engine Pipeline...', { id: 'gee' });
        try {
            const res = await fetch('/api/studio/run', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(currentCfg),
            });
            const data = await res.json();
            if (data.success) {
                setResults(data);
                toast.success('Analysis Synchronized Successfully', { id: 'gee' });
            } else {
                toast.error(`Ingestion Failed: ${data.error || 'Unknown'}`, { id: 'gee' });
            }
        } catch (e: any) {
            toast.error(`Operational Error: ${e.message || 'Unknown'}`, { id: 'gee' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <StudioContext.Provider value={{
            cfg, setCfg, results, loading, handleRun,
            layerVisibility, setLayerVisibility,
            baseLayer, setBaseLayer,
            aoiMode, setAoiMode,
            drawnBounds, setDrawnBounds
        }}>
            {children}
        </StudioContext.Provider>
    );
}

export function useStudio() {
    const context = useContext(StudioContext);
    if (!context) throw new Error('useStudio must be used within a StudioProvider');
    return context;
}
