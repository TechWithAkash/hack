'use client';

import useSWR from 'swr';
import { fetcher } from '@/lib/api/fetcher';
import {
    ResponsiveContainer, AreaChart, Area,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    BarChart, Bar,
} from 'recharts';

const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
        <div
            style={{
                background: 'white', border: '1px solid #E2E8F0',
                borderRadius: 8, padding: '10px 14px',
                boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                fontSize: 12,
            }}
        >
            <p style={{ fontWeight: 700, color: '#0A1628', marginBottom: 6 }}>{label}</p>
            {payload.map((p: any) => (
                <div key={p.dataKey} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: p.color, display: 'inline-block' }} />
                    <span style={{ color: '#64748B' }}>{p.name}:</span>
                    <span style={{ fontWeight: 600, color: '#0A1628' }}>{typeof p.value === 'number' ? p.value.toFixed(1) : p.value}</span>
                </div>
            ))}
        </div>
    );
};

export default function TrendChart() {
    const { data, isLoading } = useSWR('/api/insights/summary', fetcher, { refreshInterval: 60000 });

    if (isLoading) {
        return (
            <div className="glass-card shimmer" style={{ height: 280 }} />
        );
    }

    const trendData = (data?.trendData ?? []).map((d: any) => ({
        date: d._id?.slice(5),        // "MM-DD"
        riskScore: Math.round(d.avgRiskScore ?? 0),
        floodKm2: Math.round(d.totalFloodAreaKm2 ?? 0),
        critical: d.criticalCount ?? 0,
        affected: Math.round((d.totalAffectedPop ?? 0) / 1000),
    }));

    const breakdown = (data?.riskBreakdown ?? []).map((r: any) => ({
        name: r._id, count: r.count,
        fill: r._id === 'CRITICAL' ? '#EF4444' : r._id === 'HIGH' ? '#F97316' : r._id === 'MEDIUM' ? '#EAB308' : '#22C55E',
    }));

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
            {/* Area chart */}
            <div className="glass-card" style={{ padding: '18px 20px' }}>
                <div style={{ marginBottom: 16 }}>
                    <h3 style={{ fontSize: 14, fontWeight: 700, color: '#0A1628' }}>30-Day Risk Trend</h3>
                    <p style={{ fontSize: 11, color: '#94A3B8', marginTop: 2 }}>Avg risk score & flood coverage by day</p>
                </div>
                <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={trendData} margin={{ top: 0, right: 4, bottom: 0, left: -10 }}>
                        <defs>
                            <linearGradient id="riskGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#0D7377" stopOpacity={0.2} />
                                <stop offset="95%" stopColor="#0D7377" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="floodGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#F97316" stopOpacity={0.2} />
                                <stop offset="95%" stopColor="#F97316" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                        <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94A3B8' }} tickLine={false} axisLine={false} />
                        <YAxis yAxisId="left" tick={{ fontSize: 10, fill: '#94A3B8' }} tickLine={false} axisLine={false} />
                        <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10, fill: '#94A3B8' }} tickLine={false} axisLine={false} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                        <Area yAxisId="left" type="monotone" dataKey="riskScore" name="Avg Risk Score" stroke="#0D7377" fill="url(#riskGrad)" strokeWidth={2} dot={false} />
                        <Area yAxisId="right" type="monotone" dataKey="floodKm2" name="Flood Area km²" stroke="#F97316" fill="url(#floodGrad)" strokeWidth={2} dot={false} />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {/* Bar chart risk breakdown */}
            <div className="glass-card" style={{ padding: '18px 20px' }}>
                <div style={{ marginBottom: 16 }}>
                    <h3 style={{ fontSize: 14, fontWeight: 700, color: '#0A1628' }}>Risk Distribution</h3>
                    <p style={{ fontSize: 11, color: '#94A3B8', marginTop: 2 }}>Districts by risk level</p>
                </div>
                <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={breakdown} layout="vertical" margin={{ top: 0, right: 10, bottom: 0, left: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
                        <XAxis type="number" tick={{ fontSize: 10, fill: '#94A3B8' }} tickLine={false} axisLine={false} />
                        <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fontWeight: 600 }} tickLine={false} axisLine={false} width={65} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="count" name="Districts" radius={[0, 6, 6, 0]}>
                            {breakdown.map((entry: any, i: number) => (
                                <rect key={i} fill={entry.fill} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
