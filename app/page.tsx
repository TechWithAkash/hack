import { Suspense } from 'react';
import StatsGrid from '@/components/dashboard/StatsGrid';
import RiskTable from '@/components/dashboard/RiskTable';
import TrendChart from '@/components/dashboard/TrendChart';
import AlertBanner from '@/components/dashboard/AlertBanner';
import WeatherPanel from '@/components/dashboard/WeatherPanel';
import ForecastPanel from '@/components/dashboard/ForecastPanel';

export const metadata = {
    title: 'Dashboard · COSMEON Climate Risk Intelligence',
    description: 'Real-time flood risk intelligence dashboard for Assam, India — satellite + live weather data',
};

export default function DashboardPage() {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Section heading */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <div
                            style={{
                                width: 3, height: 20,
                                background: 'linear-gradient(180deg, #0D7377, #14A5AA)',
                                borderRadius: 2, flexShrink: 0,
                            }}
                        />
                        <h1 style={{ fontSize: 18, fontWeight: 800, color: '#0A1628', letterSpacing: '-0.02em' }}>
                            Overview
                        </h1>
                    </div>
                    <p style={{ fontSize: 12, color: '#94A3B8', marginLeft: 11 }}>
                        Satellite-derived flood intelligence · Open-Meteo live weather · Assam, India AOI
                    </p>
                </div>

                <div
                    style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        background: '#F0FDFA', border: '1px solid #CCFBF1',
                        borderRadius: 8, padding: '6px 12px',
                    }}
                >
                    <div className="pulse-dot" style={{ background: '#22C55E' }} />
                    <span style={{ fontSize: 11, fontWeight: 600, color: '#0D9488' }}>
                        Live · Open-Meteo + GEE
                    </span>
                </div>
            </div>

            {/* KPI stats from DB */}
            <Suspense fallback={<div className="shimmer" style={{ height: 100, borderRadius: 12 }} />}>
                <StatsGrid />
            </Suspense>

            {/* Critical alert banner */}
            <Suspense fallback={null}>
                <AlertBanner />
            </Suspense>

            {/* 🌦️ LIVE WEATHER PANEL — Open-Meteo real-time data */}
            <Suspense fallback={<div className="shimmer" style={{ height: 240, borderRadius: 12 }} />}>
                <WeatherPanel />
            </Suspense>

            {/* 🔮 72-HOUR FORECAST — PS-06 R8 Predictive Modeling */}
            <Suspense fallback={<div className="shimmer" style={{ height: 220, borderRadius: 12 }} />}>
                <ForecastPanel />
            </Suspense>

            {/* Trend charts */}
            <Suspense fallback={<div className="shimmer" style={{ height: 280, borderRadius: 12 }} />}>
                <TrendChart />
            </Suspense>

            {/* Event table */}
            <Suspense fallback={<div className="shimmer" style={{ height: 320, borderRadius: 12 }} />}>
                <RiskTable />
            </Suspense>
        </div>
    );
}
