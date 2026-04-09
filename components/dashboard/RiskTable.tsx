'use client';

import useSWR from 'swr';
import { fetcher } from '@/lib/api/fetcher';
import RiskBadge from '@/components/shared/RiskBadge';
import ConfidenceBar from '@/components/shared/ConfidenceBar';
import { formatArea, formatDate, formatPopulation, formatScore } from '@/lib/utils/formatters';
import { TrendingUp, TrendingDown, Minus, List } from 'lucide-react';

const COLUMNS = [
    { key: 'district',    label: 'District'     },
    { key: 'riskLevel',   label: 'Risk'         },
    { key: 'floodArea',   label: 'Flood Area'   },
    { key: 'affectedPop', label: 'Population'   },
    { key: 'delta',       label: 'Δ Change'     },
    { key: 'confidence',  label: 'Confidence'   },
    { key: 'date',        label: 'Date'         },
];

export default function RiskTable() {
    const { data, isLoading } = useSWR('/api/insights/latest?limit=20', fetcher, { refreshInterval: 60000 });

    if (isLoading) {
        return (
            <div style={{
                background: 'white', border: '1px solid #E2E8F0',
                borderRadius: 16, overflow: 'hidden',
            }}>
                <div style={{ height: 3, background: '#0D7377' }} />
                <div style={{ height: 340, animation: 'pulse 1.5s ease-in-out infinite', background: '#F8FAFC' }} />
            </div>
        );
    }

    const events = data?.events ?? [];

    return (
        <div style={{
            background: 'white',
            border: '1px solid #E5E7EB',
            borderRadius: 20,
            overflow: 'hidden',
            boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
        }}>
            {/* Header */}
            <div style={{
                padding: '24px 24px 16px 24px',
                borderBottom: '1px solid #F1F5F9',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                        width: 32, height: 32, borderRadius: 10,
                        background: '#0D737712', color: '#0D7377',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <List size={16} />
                    </div>
                    <span style={{ fontSize: 15, fontWeight: 800, color: '#0F172A', letterSpacing: '-0.01em' }}>Live Event Registry</span>
                    <span style={{
                        marginLeft: 6, fontSize: 10, fontWeight: 700, color: '#0D7377',
                        background: 'rgba(13,115,119,0.08)', border: '1px solid rgba(13,115,119,0.2)',
                        borderRadius: 5, padding: '2px 7px',
                    }}>
                        {events.length} anomalies
                    </span>
                </div>
                <span style={{ fontSize: 10, color: '#94A3B8', fontWeight: 600 }}>Refreshes every 60s</span>
            </div>

            {/* Table */}
            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: '#FAFAFA' }}>
                            {COLUMNS.map(col => (
                                <th key={col.key} style={{
                                    padding: '10px 16px', textAlign: 'left',
                                    fontSize: 10, fontWeight: 700, color: '#94A3B8',
                                    textTransform: 'uppercase', letterSpacing: '0.08em',
                                    whiteSpace: 'nowrap', borderBottom: '1px solid #F1F5F9',
                                }}>
                                    {col.label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {events.length === 0 ? (
                            <tr>
                                <td colSpan={7} style={{ padding: '48px', textAlign: 'center', color: '#CBD5E1' }}>
                                    <List size={28} style={{ margin: '0 auto 8px' }} />
                                    <p style={{ fontSize: 13, fontWeight: 600, color: '#94A3B8', margin: 0 }}>
                                        No active anomalies detected.
                                    </p>
                                </td>
                            </tr>
                        ) : events.map((e: any) => {
                            const delta = e.changeFromPrevKm2 ?? 0;
                            return (
                                <tr key={e._id}
                                    style={{ borderBottom: '1px solid #F8FAFC', transition: 'background 0.12s' }}
                                    onMouseEnter={el => el.currentTarget.style.background = '#FAFBFD'}
                                    onMouseLeave={el => el.currentTarget.style.background = 'transparent'}
                                >
                                    <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 700, color: '#0F172A', whiteSpace: 'nowrap' }}>
                                        {e.districtId?.districtName ?? '—'}
                                        {e.districtId?.stateName && (
                                            <div style={{ fontSize: 10, color: '#94A3B8', fontWeight: 500, marginTop: 1 }}>
                                                {e.districtId.stateName}
                                            </div>
                                        )}
                                    </td>
                                    <td style={{ padding: '12px 16px' }}>
                                        <RiskBadge level={e.riskLevel} />
                                    </td>
                                    <td style={{ padding: '12px 16px', fontSize: 12, color: '#475569', fontWeight: 600, whiteSpace: 'nowrap' }}>
                                        {formatArea(e.floodAreaKm2)}
                                    </td>
                                    <td style={{ padding: '12px 16px', fontSize: 12, color: '#475569', fontWeight: 600, whiteSpace: 'nowrap' }}>
                                        {formatPopulation(e.affectedPopEst)}
                                    </td>
                                    <td style={{ padding: '12px 16px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                                            {delta > 5
                                                ? <TrendingUp size={12} color="#EF4444" />
                                                : delta < -5
                                                    ? <TrendingDown size={12} color="#10B981" />
                                                    : <Minus size={12} color="#CBD5E1" />}
                                            <span style={{
                                                fontSize: 11, fontWeight: 700,
                                                color: delta > 5 ? '#EF4444' : delta < -5 ? '#10B981' : '#94A3B8',
                                            }}>
                                                {delta > 0 ? '+' : ''}{delta.toFixed(1)} km²
                                            </span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '12px 16px', minWidth: 130 }}>
                                        <ConfidenceBar score={e.confidenceScore ?? 0.8} />
                                    </td>
                                    <td style={{ padding: '12px 16px', fontSize: 11, color: '#94A3B8', fontWeight: 600, whiteSpace: 'nowrap' }}>
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
