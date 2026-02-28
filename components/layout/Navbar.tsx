'use client';

import { useState } from 'react';
import { RefreshCw, CloudRain, Clock, Loader2, Satellite, Wifi } from 'lucide-react';

export default function Navbar() {
    const [fetchingLive, setFetchingLive] = useState(false);
    const [triggering, setTriggering] = useState(false);
    const [lastRun, setLastRun] = useState<string | null>(null);
    const [msg, setMsg] = useState('');
    const [msgType, setMsgType] = useState<'success' | 'error'>('success');

    const showMsg = (text: string, type: 'success' | 'error' = 'success') => {
        setMsg(text);
        setMsgType(type);
        setTimeout(() => setMsg(''), 7000);
    };

    // Fetch LIVE Open-Meteo weather → compute risk → write to MongoDB
    const handleFetchLive = async () => {
        setFetchingLive(true);
        setMsg('');
        try {
            const res = await fetch('/api/realtime/ingest-weather', {
                method: 'POST',
                cache: 'no-store',
            });
            const data = await res.json();

            if (data.success) {
                setLastRun(new Date().toLocaleTimeString('en-IN'));
                const topRisk = data.districts?.find((d: any) => d.riskLevel === 'CRITICAL') ??
                    data.districts?.find((d: any) => d.riskLevel === 'HIGH');
                showMsg(
                    `✓ Live data loaded · ${data.eventsCreated} districts · ` +
                    (topRisk ? `${topRisk.district}: ${topRisk.riskLevel} (${topRisk.riskScore})` : 'All OK'),
                    'success'
                );
                // Refresh the page data
                setTimeout(() => window.location.reload(), 1200);
            } else {
                showMsg(`✗ ${data.error}`, 'error');
            }
        } catch {
            showMsg('✗ Live fetch failed — check console', 'error');
        } finally {
            setFetchingLive(false);
        }
    };

    const handleTrigger = async () => {
        setTriggering(true);
        setMsg('');
        try {
            const res = await fetch('/api/pipeline/trigger', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ aoiName: 'assam_india' }),
            });
            const data = await res.json();
            setLastRun(new Date().toLocaleTimeString('en-IN'));
            showMsg(`✓ GEE pipeline queued · runId: ${data.runId?.slice(0, 8)}…`, 'success');
        } catch {
            showMsg('✗ Pipeline trigger failed', 'error');
        } finally {
            setTriggering(false);
        }
    };

    return (
        <header
            style={{
                background: 'white',
                borderBottom: '1px solid #E2E8F0',
                padding: '0 24px',
                height: 60,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexShrink: 0,
            }}
        >
            {/* Left */}
            <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#0A1628', letterSpacing: '-0.01em' }}>
                    Climate Risk Dashboard
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
                    <span style={{ fontSize: 11, color: '#94A3B8' }}>
                        Assam, India · Sentinel-1/2 · Open-Meteo Live Weather
                    </span>
                    <span
                        style={{
                            fontSize: 9, fontWeight: 700, letterSpacing: '0.08em',
                            background: '#F0FDF4', color: '#16A34A',
                            border: '1px solid #BBF7D0', borderRadius: 4,
                            padding: '1px 6px',
                        }}
                    >
                        LIVE
                    </span>
                </div>
            </div>

            {/* Right */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {msg && (
                    <div
                        style={{
                            fontSize: 12,
                            color: msgType === 'success' ? '#16A34A' : '#DC2626',
                            background: msgType === 'success' ? '#F0FDF4' : '#FEF2F2',
                            padding: '4px 12px', borderRadius: 6,
                            border: `1px solid ${msgType === 'success' ? '#BBF7D0' : '#FECACA'}`,
                            fontWeight: 500, maxWidth: 400,
                        }}
                    >
                        {msg}
                    </div>
                )}

                {lastRun && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#64748B' }}>
                        <Clock size={11} />
                        {lastRun}
                    </div>
                )}

                {/* Open-Meteo live data button */}
                <button
                    id="fetch-live-btn"
                    onClick={handleFetchLive}
                    disabled={fetchingLive}
                    title="Fetch real-time rainfall + weather from Open-Meteo and compute live risk scores"
                    style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        padding: '7px 16px',
                        background: fetchingLive
                            ? '#E0F2FE'
                            : 'linear-gradient(135deg, #0369A1, #0891B2)',
                        color: fetchingLive ? '#0369A1' : 'white',
                        border: 'none',
                        borderRadius: 8,
                        fontSize: 12, fontWeight: 600,
                        cursor: fetchingLive ? 'not-allowed' : 'pointer',
                        boxShadow: fetchingLive ? 'none' : '0 2px 8px rgba(3,105,161,0.3)',
                        transition: 'all 0.2s',
                    }}
                >
                    {fetchingLive
                        ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} />
                        : <CloudRain size={13} />
                    }
                    {fetchingLive ? 'Fetching Live…' : 'Fetch Live Data'}
                </button>

                {/* GEE pipeline trigger */}
                <button
                    id="trigger-pipeline-btn"
                    className="trigger-btn"
                    onClick={handleTrigger}
                    disabled={triggering}
                    title="Trigger Google Earth Engine satellite pipeline (requires Python service)"
                >
                    {triggering
                        ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
                        : <Satellite size={14} />
                    }
                    {triggering ? 'Queuing…' : 'GEE Pipeline'}
                </button>
            </div>
        </header>
    );
}
