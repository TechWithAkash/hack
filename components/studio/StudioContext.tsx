'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import toast from 'react-hot-toast';

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
}

const StudioContext = createContext<StudioContextType | undefined>(undefined);

export function StudioProvider({ children }: { children: ReactNode }) {
    const [cfg, setCfg] = useState({
        min_lon: 89.7, max_lon: 90.5,
        min_lat: 25.1, max_lat: 26.2,
        pre_start: '2022-05-01', pre_end: '2022-05-31',
        post_start: '2022-06-01', post_end: '2022-06-30',
        threshold: -2.0, ndvi_thresh: -0.12, cloud_pct: 25,
        sar_conf_base: 0.90, opt_conf_base: 0.80,
        scale: 150, run: true
    });

    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<any>(null);

    const [layerVisibility, setLayerVisibility] = useState({
        sarBase: true, flood: true, optWater: false, vegDamage: false, confidence: false
    });

    const [baseLayer, setBaseLayer] = useState<'light' | 'dark' | 'satellite' | 'terrain'>('satellite');
    const [aoiMode, setAoiMode] = useState<'draw' | 'manual'>('manual');

    const handleRun = async (overrideCfg?: any) => {
        setLoading(true);
        const currentCfg = overrideCfg || cfg;
        toast.loading('Ingesting GEE pipeline data...', { id: 'gee' });
        try {
            const res = await fetch('/api/studio/run', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(currentCfg),
            });
            const data = await res.json();
            if (data.success) {
                setResults(data);
                toast.success('Success! Memory-safe distributed computation complete.', { id: 'gee' });
            } else {
                toast.error(`Pipeline Failed: ${data.error}`, { id: 'gee' });
            }
        } catch (e: any) {
            toast.error(`Error: ${e.message}`, { id: 'gee' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <StudioContext.Provider value={{
            cfg, setCfg, results, loading, handleRun,
            layerVisibility, setLayerVisibility,
            baseLayer, setBaseLayer,
            aoiMode, setAoiMode
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
