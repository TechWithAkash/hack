'use client';

import { useMemo } from 'react';
import useSWR from 'swr';
import StatsGrid from '@/components/dashboard/StatsGrid';
import RiskTable from '@/components/dashboard/RiskTable';
import WeatherPanel from '@/components/dashboard/WeatherPanel';
import DashboardCharts from '@/components/dashboard/DashboardCharts';
import { Activity, RefreshCw } from 'lucide-react';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function Dashboard() {
    const { data: summaryData, mutate, isLoading } = useSWR('/api/insights/summary', fetcher, {
        refreshInterval: 60000,
    });

    const lastUpdated = useMemo(() => {
        return new Date().toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' });
    }, [summaryData]);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>

            {/* ── Page Header ─────────────────────────────── */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                        <div style={{
                            width: 8, height: 8, borderRadius: '50%',
                            background: '#22C55E',
                            boxShadow: '0 0 0 3px rgba(34,197,94,0.2)',
                        }} />
                        <span style={{ fontSize: 11, fontWeight: 700, color: '#22C55E', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                            Live · Updated {lastUpdated}
                        </span>
                    </div>
                    <h1 style={{
                        fontSize: 26, fontWeight: 800, color: '#0F172A',
                        letterSpacing: '-0.025em', lineHeight: 1.15, margin: 0,
                    }}>
                        Operational Intelligence
                    </h1>
                    <p style={{ color: '#64748B', marginTop: 4, fontSize: 13, fontWeight: 500 }}>
                        Multi-hazard monitoring & geospatial risk analytics — Bihar region
                    </p>
                </div>

                <button
                    onClick={() => mutate()}
                    style={{
                        display: 'flex', alignItems: 'center', gap: 7,
                        background: 'white', border: '1px solid #E2E8F0',
                        borderRadius: 10, padding: '8px 14px', cursor: 'pointer',
                        fontSize: 12, fontWeight: 600, color: '#475569',
                        transition: 'all 0.15s ease',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                    }}
                    onMouseEnter={e => {
                        e.currentTarget.style.borderColor = '#0D7377';
                        e.currentTarget.style.color = '#0D7377';
                        e.currentTarget.style.background = '#F0FDFA';
                    }}
                    onMouseLeave={e => {
                        e.currentTarget.style.borderColor = '#E2E8F0';
                        e.currentTarget.style.color = '#475569';
                        e.currentTarget.style.background = 'white';
                    }}
                >
                    <RefreshCw size={13} />
                    Refresh
                </button>
            </div>

            {/* ── KPI Stats ─────────────────────────────── */}
            <StatsGrid />

            {/* ── Main Content ─────────────────────────────── */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(0, 1fr) 300px',
                gap: 24,
                alignItems: 'start',
            }}>
                {/* Left — charts + risk table */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24, minWidth: 0 }}>
                    <DashboardCharts />
                    <RiskTable />
                </div>

                {/* Right sidebar */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16, position: 'sticky', top: 24 }}>
                    <WeatherPanel />
                    <SystemStatus />
                </div>
            </div>
        </div>
    );
}

function SystemStatus() {
    const metrics = [
        { label: 'API Latency', value: '142ms', status: 'good' },
        { label: 'Data Archive', value: '4.2 TB', status: 'good' },
        { label: 'Uptime SLA', value: '99.8%', status: 'good' },
        { label: 'Scenes Processed', value: '1,247', status: 'good' },
    ];

    const sources = ['S1-SAR', 'S2-OPT', 'L9', 'CHIRPS'];

    return (
        <div style={{
            background: 'white',
            border: '1px solid #E2E8F0',
            borderRadius: 16,
            overflow: 'hidden',
        }}>
            {/* Accent bar */}
            <div style={{ height: 3, background: 'linear-gradient(90deg, #0D7377, #22C55E)' }} />

            <div style={{ padding: '18px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                    <Activity size={14} color="#0D7377" />
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>System Status</span>
                    <div style={{
                        marginLeft: 'auto',
                        display: 'flex', alignItems: 'center', gap: 5,
                        background: '#F0FDF4', borderRadius: 6, padding: '3px 8px',
                        border: '1px solid #BBF7D0',
                    }}>
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22C55E' }} />
                        <span style={{ fontSize: 10, fontWeight: 700, color: '#15803D' }}>NOMINAL</span>
                    </div>
                </div>

                {/* Metrics */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
                    {metrics.map(m => (
                        <div key={m.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: 12, color: '#64748B', fontWeight: 500 }}>{m.label}</span>
                            <span style={{ fontSize: 12, fontWeight: 700, color: '#0F172A' }}>{m.value}</span>
                        </div>
                    ))}
                </div>

                {/* Divider */}
                <div style={{ height: 1, background: '#F1F5F9', marginBottom: 14 }} />

                {/* Data sources */}
                <p style={{ fontSize: 10, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
                    Data Sources
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {sources.map(src => (
                        <span key={src} style={{
                            fontSize: 10, fontWeight: 700, color: '#0D7377',
                            background: 'rgba(13,115,119,0.07)',
                            border: '1px solid rgba(13,115,119,0.2)',
                            borderRadius: 5, padding: '3px 8px',
                        }}>
                            {src}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
}
