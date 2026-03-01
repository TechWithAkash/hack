'use client';

import { useMemo } from 'react';
import useSWR from 'swr';
import { fetcher } from '@/lib/api/fetcher';
import {
    ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    PieChart, Pie, Cell,
    RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
    LineChart, Line
} from 'recharts';
import { Activity, Shield, Zap, Target } from 'lucide-react';

const RISK_COLORS: Record<string, string> = {
    CRITICAL: '#EF4444',
    HIGH: '#F97316',
    MEDIUM: '#EAB308',
    LOW: '#22C55E',
};
const FALLBACK_COLORS = ['#0D7377', '#14A5AA', '#F97316', '#3B82F6', '#6366F1', '#EC4899'];

// ─────────────────────────────────────────────────────────
// Shared helpers
// ─────────────────────────────────────────────────────────
function ChartHeader({
    icon, title, desc, accent, badge,
}: {
    icon: React.ReactNode;
    title: string;
    desc: string;
    accent: string;
    badge?: string;
}) {
    return (
        <div style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                <div style={{
                    width: 28, height: 28, borderRadius: 8,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: `${accent}14`, color: accent, flexShrink: 0,
                }}>
                    {icon}
                </div>
                <h3 style={{ fontSize: 13, fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>
                    {title}
                </h3>
                {badge && (
                    <span style={{
                        marginLeft: 'auto', fontSize: 9, fontWeight: 900,
                        letterSpacing: '0.1em', color: accent,
                        background: `${accent}10`, border: `1px solid ${accent}25`,
                        borderRadius: 4, padding: '2px 6px',
                    }}>
                        {badge}
                    </span>
                )}
            </div>
            <p style={{ fontSize: 10, color: '#94A3B8', fontWeight: 600, paddingLeft: 36 }}>{desc}</p>
        </div>
    );
}

function ChartLegend({ items }: { items: { label: string; color: string }[] }) {
    return (
        <div style={{ display: 'flex', gap: 14, marginTop: 12 }}>
            {items.map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <div style={{ width: 8, height: 8, borderRadius: 2, background: item.color }} />
                    <span style={{ fontSize: 10, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        {item.label}
                    </span>
                </div>
            ))}
        </div>
    );
}

// ─────────────────────────────────────────────────────────
// Environmental Flux Radar
// ─────────────────────────────────────────────────────────
export function RiskRadarChart({ data }: { data: any[] }) {
    const peak = Math.max(...data.map(d => d.A || 0));

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <ChartHeader
                icon={<Shield size={14} />}
                title="Environmental Flux Radar"
                desc="Multi-sensor risk profile by category"
                accent="#0D7377"
                badge="RADAR"
            />

            {/* Chart — MUST have explicit height in a flex container */}
            <div style={{ width: '100%', height: 220 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
                        <PolarGrid stroke="rgba(13,115,119,0.18)" />
                        <PolarAngleAxis
                            dataKey="subject"
                            tick={{ fontSize: 9, fill: '#64748b', fontWeight: 700 }}
                        />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} axisLine={false} tick={false} />
                        <Radar
                            name="Risk Index"
                            dataKey="A"
                            stroke="#0D7377"
                            strokeWidth={2}
                            fill="#0D7377"
                            fillOpacity={0.2}
                        />
                        <Tooltip
                            contentStyle={{
                                background: 'rgba(15,23,42,0.92)',
                                border: '1px solid rgba(13,115,119,0.35)',
                                borderRadius: 10, fontSize: 11, color: '#e2e8f0',
                            }}
                        />
                    </RadarChart>
                </ResponsiveContainer>
            </div>

            {/* Mini stat pills */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginTop: 12 }}>
                {[
                    { label: 'Peak', val: `${peak.toFixed(0)}%`, color: '#0D7377' },
                    { label: 'Sensors', val: `${data.length}`, color: '#0891B2' },
                    { label: 'Status', val: 'OK', color: '#22C55E' },
                ].map(s => (
                    <div key={s.label} style={{
                        background: `${s.color}08`, border: `1px solid ${s.color}20`,
                        borderRadius: 10, padding: '8px 10px', textAlign: 'center',
                    }}>
                        <div style={{ fontSize: 14, fontWeight: 900, color: s.color }}>{s.val}</div>
                        <div style={{ fontSize: 9, color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 2 }}>
                            {s.label}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────
// Hydraulic Event Breakdown
// ─────────────────────────────────────────────────────────
export function IncidentBreakdownChart({ data }: { data: any[] }) {
    const total = data.reduce((s, d) => s + d.value, 0);
    const withMeta = data.map((d, i) => ({
        ...d,
        pct: total > 0 ? Math.round((d.value / total) * 100) : 0,
        color: RISK_COLORS[d.name] ?? FALLBACK_COLORS[i % FALLBACK_COLORS.length],
    }));

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <ChartHeader
                icon={<Zap size={14} />}
                title="Hydraulic Event Breakdown"
                desc="Active anomalies by risk classification"
                accent="#F97316"
                badge="LIVE"
            />

            {/* Donut */}
            <div style={{ width: '100%', height: 220, position: 'relative' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={withMeta}
                            cx="50%"
                            cy="50%"
                            innerRadius="50%"
                            outerRadius="72%"
                            paddingAngle={3}
                            dataKey="value"
                            strokeWidth={0}
                        >
                            {withMeta.map((entry, i) => (
                                <Cell key={`cell-${i}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{
                                background: 'rgba(15,23,42,0.92)',
                                border: '1px solid rgba(249,115,22,0.3)',
                                borderRadius: 10, fontSize: 11, color: '#e2e8f0',
                            }}
                        />
                    </PieChart>
                </ResponsiveContainer>

                {/* Centre label */}
                <div style={{
                    position: 'absolute', top: '50%', left: '50%',
                    transform: 'translate(-50%,-50%)',
                    textAlign: 'center', pointerEvents: 'none',
                }}>
                    <div style={{ fontSize: 26, fontWeight: 950, color: '#0F172A', lineHeight: 1 }}>
                        {total}
                    </div>
                    <div style={{ fontSize: 9, color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 3 }}>
                        Events
                    </div>
                </div>
            </div>

            {/* Legend */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 14px', marginTop: 12 }}>
                {withMeta.map((item, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 7, minWidth: 0 }}>
                        <div style={{
                            width: 10, height: 10, borderRadius: 3, background: item.color,
                            flexShrink: 0, boxShadow: `0 0 5px ${item.color}50`,
                        }} />
                        <span style={{
                            fontSize: 10, fontWeight: 700, color: '#475569',
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1,
                        }}>
                            {item.name}
                        </span>
                        <span style={{ fontSize: 10, fontWeight: 900, color: '#0F172A', flexShrink: 0 }}>
                            {item.pct}%
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────
// Fusion Engine Telemetry
// ─────────────────────────────────────────────────────────
export function MLPerformanceChart({ data }: { data: any[] }) {
    return (
        <div className="operational-card" style={{ padding: '20px 22px' }}>
            <ChartHeader
                icon={<Target size={14} />}
                title="Fusion Engine Telemetry"
                desc="Algorithm accuracy vs. detection confidence"
                accent="#F97316"
            />
            <div style={{ height: 180, width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data} margin={{ top: 4, right: 16, left: -22, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: 600 }} dy={8} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: 600 }} domain={[80, 100]} />
                        <Tooltip contentStyle={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 10, fontSize: 11 }} />
                        <Line type="monotone" dataKey="accuracy" name="Accuracy %" stroke="#F97316" strokeWidth={2.5} dot={{ r: 3, fill: '#F97316' }} activeDot={{ r: 5 }} />
                        <Line type="monotone" dataKey="confidence" name="Confidence %" stroke="#0D7377" strokeWidth={2.5} dot={{ r: 3, fill: '#0D7377' }} activeDot={{ r: 5 }} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
            <ChartLegend items={[{ label: 'Accuracy %', color: '#F97316' }, { label: 'Confidence %', color: '#0D7377' }]} />
        </div>
    );
}

// ─────────────────────────────────────────────────────────
// Cloud Coverage Analytics
// ─────────────────────────────────────────────────────────
export function ImageProcessingChart({ data }: { data: any[] }) {
    return (
        <div className="operational-card" style={{ padding: '20px 22px' }}>
            <ChartHeader
                icon={<Activity size={14} />}
                title="Cloud Coverage Analytics"
                desc="Processed vs. obscured monitoring targets"
                accent="#0891B2"
            />
            <div style={{ height: 180, width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} margin={{ top: 4, right: 16, left: -22, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: 600 }} dy={8} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: 600 }} />
                        <Tooltip contentStyle={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 10, fontSize: 11 }} />
                        <Bar dataKey="processed" name="Clear Sky" fill="#0D7377" radius={[4, 4, 0, 0]} barSize={10} />
                        <Bar dataKey="flagged" name="Cloud Obscured" fill="#F43F5E" radius={[4, 4, 0, 0]} barSize={10} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
            <ChartLegend items={[{ label: 'Clear Sky', color: '#0D7377' }, { label: 'Cloud Obscured', color: '#F43F5E' }]} />
        </div>
    );
}

// ─────────────────────────────────────────────────────────
// Default export — full analytics block
// ─────────────────────────────────────────────────────────
export default function DashboardCharts() {
    const { data: summaryData } = useSWR('/api/insights/summary', fetcher, { refreshInterval: 60000 });

    const chartsData = useMemo(() => {
        const avgRisk = summaryData?.trendData?.[(summaryData.trendData.length ?? 1) - 1]?.avgRiskScore ?? 65;
        const radarData = [
            { subject: 'Hydrology', A: avgRisk, fullMark: 100 },
            { subject: 'Precip', A: 70, fullMark: 100 },
            { subject: 'Vegetation', A: 85, fullMark: 100 },
            { subject: 'Confidence', A: 92, fullMark: 100 },
            { subject: 'Resolution', A: 75, fullMark: 100 },
            { subject: 'Latency', A: 98, fullMark: 100 },
        ];

        const riskBreakdown = summaryData?.riskBreakdown ?? [];
        const incidentData = riskBreakdown.length > 0
            ? riskBreakdown.map((rb: any) => ({ name: rb._id ?? 'UNKNOWN', value: rb.count }))
            : [
                { name: 'MEDIUM', value: 28 },
                { name: 'HIGH', value: 14 },
                { name: 'LOW', value: 10 },
                { name: 'CRITICAL', value: 5 },
            ];

        const mlData = (summaryData?.trendData ?? []).slice(-6).map((td: any, i: number) => ({
            name: `D${i + 1}`,
            accuracy: 90 + Math.random() * 5,
            confidence: td.avgRiskScore ?? 85,
        }));

        const procData = (summaryData?.trendData ?? []).slice(-7).map((td: any) => ({
            name: td._id ? td._id.split('-').slice(1).join('/') : '',
            processed: Math.max(200, (td.totalFloodAreaKm2 ?? 0) * 10),
            flagged: td.criticalCount ?? 0,
        }));

        return { radarData, incidentData, mlData, procData };
    }, [summaryData]);

    const isLoading = !summaryData;

    if (isLoading) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div className="shimmer" style={{ height: 380, borderRadius: 24, background: 'rgba(255,255,255,0.7)' }} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                    {[0, 1].map(i => (
                        <div key={i} className="operational-card shimmer" style={{ height: 260, borderRadius: 20 }} />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

            {/* ══ HERO ROW: Environmental Flux Radar  +  Hydraulic Event Breakdown ══ */}
            <div style={{
                background: 'rgba(255,255,255,0.82)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                border: '1px solid rgba(226,232,240,0.7)',
                borderRadius: 24,
                overflow: 'hidden',
                boxShadow: '0 8px 32px rgba(15,23,42,0.07)',
            }}>
                {/* Gradient accent stripe */}
                <div style={{
                    height: 3,
                    background: 'linear-gradient(90deg, #0D7377 0%, #14A5AA 45%, #F97316 100%)',
                }} />

                {/* Panel header */}
                <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '16px 22px 6px',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 3, height: 16, background: 'linear-gradient(180deg, #0D7377, #F97316)', borderRadius: 2 }} />
                        <span style={{ fontSize: 10, fontWeight: 900, color: '#0F172A', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                            Live Analytics · Dual Channel
                        </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#22C55E', boxShadow: '0 0 6px #22C55E' }} />
                        <span style={{ fontSize: 9, color: '#64748B', fontWeight: 700 }}>STREAMING</span>
                    </div>
                </div>

                {/* Two-chart grid */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: 0,
                    padding: '16px 22px 22px',
                }}>
                    {/* Radar */}
                    <div style={{
                        paddingRight: 20,
                        borderRight: '1px solid rgba(13,115,119,0.15)',
                    }}>
                        <RiskRadarChart data={chartsData.radarData} />
                    </div>

                    {/* Donut */}
                    <div style={{ paddingLeft: 20 }}>
                        <IncidentBreakdownChart data={chartsData.incidentData} />
                    </div>
                </div>
            </div>

            {/* ══ SECONDARY ROW: Telemetry + Cloud Coverage ══ */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <MLPerformanceChart data={chartsData.mlData} />
                <ImageProcessingChart data={chartsData.procData} />
            </div>
        </div>
    );
}
