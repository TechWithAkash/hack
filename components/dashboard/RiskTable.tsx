'use client';

import useSWR from 'swr';
import { fetcher } from '@/lib/api/fetcher';
import RiskBadge from '@/components/shared/RiskBadge';
import ConfidenceBar from '@/components/shared/ConfidenceBar';
import DataSourceTag from '@/components/shared/DataSourceTag';
import { formatArea, formatDate, formatPopulation, formatScore } from '@/lib/utils/formatters';
import { TrendingUp, TrendingDown, Minus, Activity } from 'lucide-react';

export default function RiskTable() {
    const { data, isLoading } = useSWR('/api/insights/latest?limit=20', fetcher, { refreshInterval: 60000 });

    if (isLoading) {
        return (
            <div style={{
                background: 'rgba(255, 255, 255, 0.7)',
                backdropFilter: 'blur(22px)',
                borderRadius: 24,
                padding: 0,
                overflow: 'hidden'
            }} className="shimmer">
                <div style={{ height: 400 }} />
            </div>
        );
    }

    const events = data?.events ?? [];

    return (
        <div style={{
            background: 'rgba(255, 255, 255, 0.7)',
            backdropFilter: 'blur(22px)',
            border: '1px solid rgba(255, 255, 255, 0.8)',
            borderRadius: 24,
            padding: 0,
            overflow: 'hidden',
            boxShadow: '0 12px 48px rgba(15, 23, 42, 0.06)'
        }}>
            {/* Header */}
            <div
                style={{
                    padding: '24px 28px',
                    borderBottom: '1px solid rgba(226, 232, 240, 0.5)',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ background: '#F8FAFC', borderRadius: 10, padding: 8, color: '#64748B' }}>
                        <Activity size={18} />
                    </div>
                    <div>
                        <h2 style={{ fontSize: 18, fontWeight: 950, color: '#0F172A', letterSpacing: '-0.02em' }}>District Risk Intelligence Registry</h2>
                        <p style={{ fontSize: 11, color: '#94A3B8', fontWeight: 700, marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            {events.length} ACTIVE OPERATIONAL RECORDS · REAL-TIME SYNC
                        </p>
                    </div>
                </div>
                <DataSourceTag source="ENSEMBLE" />
            </div>

            {/* Table */}
            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: 'rgba(248, 250, 252, 0.5)', borderBottom: '1px solid rgba(226, 232, 240, 0.5)' }}>
                            {['District', 'State', 'Risk Level', 'Score', 'Flood Area', 'Affected Pop.', 'Δ Change', 'Confidence', 'Method', 'Date'].map((h) => (
                                <th
                                    key={h}
                                    style={{
                                        padding: '16px 20px',
                                        textAlign: 'left',
                                        fontSize: 10, fontWeight: 950,
                                        color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.12em',
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
                                <td colSpan={10} style={{ padding: '60px', textAlign: 'center', color: '#94A3B8' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                                        <Activity size={32} opacity={0.2} />
                                        <span style={{ fontSize: 14, fontWeight: 600 }}>No active flood events. Awaiting next live scan.</span>
                                    </div>
                                </td>
                            </tr>
                        ) : events.map((e: any) => {
                            const delta = e.changeFromPrevKm2 ?? 0;
                            return (
                                <tr
                                    key={e._id}
                                    className="risk-table-row"
                                    style={{
                                        borderBottom: '1px solid rgba(241, 245, 249, 0.5)',
                                        transition: 'all 0.1s ease'
                                    }}
                                >
                                    <td style={{ padding: '16px 20px', fontSize: 14, fontWeight: 800, color: '#0F172A', whiteSpace: 'nowrap' }}>
                                        {e.districtId?.districtName ?? '—'}
                                    </td>
                                    <td style={{ padding: '16px 20px', fontSize: 12, color: '#64748B', fontWeight: 600 }}>
                                        {e.districtId?.stateName ?? '—'}
                                    </td>
                                    <td style={{ padding: '16px 20px' }}>
                                        <RiskBadge level={e.riskLevel} />
                                    </td>
                                    <td style={{ padding: '16px 20px', fontSize: 14, fontWeight: 950, color: '#0F172A' }}>
                                        {formatScore(e.riskScore)}
                                    </td>
                                    <td style={{ padding: '16px 20px', fontSize: 13, color: '#475569', fontWeight: 700, whiteSpace: 'nowrap' }}>
                                        {formatArea(e.floodAreaKm2)}
                                    </td>
                                    <td style={{ padding: '16px 20px', fontSize: 13, color: '#475569', fontWeight: 700, whiteSpace: 'nowrap' }}>
                                        {formatPopulation(e.affectedPopEst)}
                                    </td>
                                    <td style={{ padding: '16px 20px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                            {delta > 5 ? <TrendingUp size={14} color="#EF4444" /> :
                                                delta < -5 ? <TrendingDown size={14} color="#22C55E" /> :
                                                    <Minus size={14} color="#94A3B8" />}
                                            <span style={{ fontSize: 12, fontWeight: 800, color: delta > 5 ? '#EF4444' : delta < -5 ? '#22C55E' : '#94A3B8' }}>
                                                {delta > 0 ? '+' : ''}{delta.toFixed(1)} km²
                                            </span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '16px 20px', minWidth: 140 }}>
                                        <ConfidenceBar score={e.confidenceScore ?? 0.8} />
                                    </td>
                                    <td style={{ padding: '16px 20px' }}>
                                        <DataSourceTag source={e.detectionMethod ?? 'S2'} />
                                    </td>
                                    <td style={{ padding: '16px 20px', fontSize: 11, color: '#94A3B8', fontWeight: 700, whiteSpace: 'nowrap' }}>
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
