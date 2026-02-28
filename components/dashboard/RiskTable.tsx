'use client';

import useSWR from 'swr';
import { fetcher } from '@/lib/api/fetcher';
import RiskBadge from '@/components/shared/RiskBadge';
import ConfidenceBar from '@/components/shared/ConfidenceBar';
import DataSourceTag from '@/components/shared/DataSourceTag';
import { formatArea, formatDate, formatPopulation, formatScore } from '@/lib/utils/formatters';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function RiskTable() {
    const { data, isLoading } = useSWR('/api/insights/latest?limit=20', fetcher, { refreshInterval: 60000 });

    if (isLoading) {
        return (
            <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid #F1F5F9' }}>
                    <div className="shimmer" style={{ height: 20, width: 200, borderRadius: 6 }} />
                </div>
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="shimmer" style={{ height: 52, margin: '8px 20px', borderRadius: 8 }} />
                ))}
            </div>
        );
    }

    const events = data?.events ?? [];

    return (
        <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
            {/* Header */}
            <div
                style={{
                    padding: '16px 20px',
                    borderBottom: '1px solid #F1F5F9',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}
            >
                <div>
                    <h2 style={{ fontSize: 14, fontWeight: 700, color: '#0A1628' }}>District Risk Events</h2>
                    <p style={{ fontSize: 11, color: '#94A3B8', marginTop: 2 }}>
                        {events.length} records · Auto-refreshes every 60s
                    </p>
                </div>
                <DataSourceTag source="ENSEMBLE" />
            </div>

            {/* Table */}
            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #F1F5F9' }}>
                            {['District', 'State', 'Risk Level', 'Score', 'Flood Area', 'Affected Pop.', 'Δ Change', 'Confidence', 'Method', 'Date'].map((h) => (
                                <th
                                    key={h}
                                    style={{
                                        padding: '10px 14px',
                                        textAlign: 'left',
                                        fontSize: 10, fontWeight: 700,
                                        color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.07em',
                                        whiteSpace: 'nowrap',
                                    }}
                                >
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {events.length === 0 ? (
                            <tr>
                                <td colSpan={10} style={{ padding: '32px', textAlign: 'center', color: '#94A3B8', fontSize: 13 }}>
                                    No active flood events. Awaiting next live scan.
                                </td>
                            </tr>
                        ) : events.map((e: any) => {
                            const delta = e.changeFromPrevKm2 ?? 0;
                            return (
                                <tr key={e._id} className="risk-table-row" style={{ borderBottom: '1px solid #F8FAFC' }}>
                                    <td style={{ padding: '12px 14px', fontSize: 13, fontWeight: 600, color: '#0F172A', whiteSpace: 'nowrap' }}>
                                        {e.districtId?.districtName ?? '—'}
                                    </td>
                                    <td style={{ padding: '12px 14px', fontSize: 12, color: '#64748B' }}>
                                        {e.districtId?.stateName ?? '—'}
                                    </td>
                                    <td style={{ padding: '12px 14px' }}>
                                        <RiskBadge level={e.riskLevel} />
                                    </td>
                                    <td style={{ padding: '12px 14px', fontSize: 13, fontWeight: 700, color: '#0A1628' }}>
                                        {formatScore(e.riskScore)}
                                    </td>
                                    <td style={{ padding: '12px 14px', fontSize: 12, color: '#475569', whiteSpace: 'nowrap' }}>
                                        {formatArea(e.floodAreaKm2)}
                                    </td>
                                    <td style={{ padding: '12px 14px', fontSize: 12, color: '#475569', whiteSpace: 'nowrap' }}>
                                        {formatPopulation(e.affectedPopEst)}
                                    </td>
                                    <td style={{ padding: '12px 14px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                            {delta > 5 ? <TrendingUp size={12} color="#EF4444" /> :
                                                delta < -5 ? <TrendingDown size={12} color="#22C55E" /> :
                                                    <Minus size={12} color="#94A3B8" />}
                                            <span style={{ fontSize: 11, fontWeight: 600, color: delta > 5 ? '#EF4444' : delta < -5 ? '#22C55E' : '#94A3B8' }}>
                                                {delta > 0 ? '+' : ''}{delta.toFixed(1)} km²
                                            </span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '12px 14px', minWidth: 120 }}>
                                        <ConfidenceBar score={e.confidenceScore ?? 0.8} />
                                    </td>
                                    <td style={{ padding: '12px 14px' }}>
                                        <DataSourceTag source={e.detectionMethod ?? 'S2'} />
                                    </td>
                                    <td style={{ padding: '12px 14px', fontSize: 11, color: '#64748B', whiteSpace: 'nowrap' }}>
                                        {formatDate(e.eventDate)}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
