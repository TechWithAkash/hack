import { Suspense } from 'react';
import StatsGrid from '@/components/dashboard/StatsGrid';
import RiskTable from '@/components/dashboard/RiskTable';
import TrendChart from '@/components/dashboard/TrendChart';
import AlertBanner from '@/components/dashboard/AlertBanner';
import WeatherPanel from '@/components/dashboard/WeatherPanel';
import ForecastPanel from '@/components/dashboard/ForecastPanel';
import { Cpu } from 'lucide-react';

export const metadata = {
    title: 'Dashboard · COSMEON Climate Risk Intelligence',
    description: 'Real-time flood risk intelligence dashboard for India — satellite + live weather data',
};

export default function DashboardPage() {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24, paddingBottom: 40 }}>

            {/* Section heading */}
            <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '8px 4px'
            }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
                        <div
                            style={{
                                width: 4, height: 28,
                                background: 'linear-gradient(180deg, #0D7377, #14A5AA)',
                                borderRadius: 4, flexShrink: 0,
                                boxShadow: '0 2px 8px rgba(13, 115, 119, 0.3)'
                            }}
                        />
                        <h1 style={{ fontSize: 24, fontWeight: 950, color: '#0F172A', letterSpacing: '-0.04em', lineHeight: 1 }}>
                            Overview · <span style={{ color: '#64748B', fontWeight: 600 }}>Command Center</span>
                        </h1>
                    </div>
                    <p style={{ fontSize: 13, color: '#94A3B8', fontWeight: 500, marginLeft: 16 }}>
                        Satellite-derived flood intelligence · Open-Meteo live weather · Multi-sensor ensemble
                    </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div
                        style={{
                            display: 'flex', alignItems: 'center', gap: 8,
                            background: 'rgba(255, 255, 255, 0.7)', backdropFilter: 'blur(8px)',
                            border: '1px solid rgba(13, 115, 119, 0.15)',
                            borderRadius: 12, padding: '8px 16px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
                        }}
                    >
                        <div className="pulse-dot" style={{ background: '#22C55E' }} />
                        <span style={{ fontSize: 11, fontWeight: 800, color: '#0D7377', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Pipeline Online · Live GEE Stream
                        </span>
                    </div>
                </div>
            </div>

            {/* KPI stats from DB */}
            <Suspense fallback={<div className="shimmer" style={{ height: 160, borderRadius: 24 }} />}>
                <StatsGrid />
            </Suspense>

            {/* Alert Center - Reimagined */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
                <Suspense fallback={<div className="shimmer" style={{ height: 100, borderRadius: 16 }} />}>
                    <AlertBanner />
                </Suspense>

                <div style={{
                    background: 'rgba(255, 255, 255, 0.6)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255, 255, 255, 0.8)',
                    borderRadius: 20,
                    padding: '16px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.02)'
                }}>
                    <div style={{ background: '#F0F9FF', borderRadius: 10, padding: 8, color: '#0369A1' }}>
                        <Cpu size={18} />
                    </div>
                    <div>
                        <div style={{ fontSize: 12, fontWeight: 900, color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Model Status</div>
                        <div style={{ fontSize: 11, color: '#64748B', fontWeight: 600 }}>Ensemble Fusion Engine v4.2</div>
                    </div>
                    <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                        <div style={{ fontSize: 14, fontWeight: 950, color: '#0D9488' }}>98.4%</div>
                        <div style={{ fontSize: 9, color: '#94A3B8', fontWeight: 700 }}>ACCURACY</div>
                    </div>
                </div>
            </div>

            {/* 🌦️ LIVE WEATHER PANEL — Open-Meteo real-time data */}
            <Suspense fallback={<div className="shimmer" style={{ height: 320, borderRadius: 24 }} />}>
                <WeatherPanel />
            </Suspense>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 20 }}>
                {/* Trend charts */}
                <Suspense fallback={<div className="shimmer" style={{ height: 320, borderRadius: 24 }} />}>
                    <TrendChart />
                </Suspense>

                {/* 🔮 72-HOUR FORECAST */}
                <Suspense fallback={<div className="shimmer" style={{ height: 320, borderRadius: 24 }} />}>
                    <ForecastPanel />
                </Suspense>
            </div>

            {/* Event table */}
            <Suspense fallback={<div className="shimmer" style={{ height: 400, borderRadius: 24 }} />}>
                <RiskTable />
            </Suspense>
        </div>
    );
}
