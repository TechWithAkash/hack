'use client';

import { use } from 'react';
import useSWR from 'swr';
import { fetcher } from '@/lib/api/fetcher';
import RiskBadge from '@/components/shared/RiskBadge';
import ConfidenceBar from '@/components/shared/ConfidenceBar';
import { formatArea, formatDate, formatPopulation, formatScore } from '@/lib/utils/formatters';
import { ArrowLeft, Droplets, Users, TrendingUp, Cloud } from 'lucide-react';
import Link from 'next/link';

export default function DistrictDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { data, isLoading } = useSWR(`/api/districts/${id}?days=60`, fetcher);

    if (isLoading) return <div className="shimmer" style={{ height: 400, borderRadius: 12 }} />;
    if (!data?.district) return <div style={{ color: '#94A3B8', textAlign: 'center', padding: 40 }}>District not found.</div>;

    const { district, history } = data;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 900 }}>
            <div>
                <Link href="/districts" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#0D7377', textDecoration: 'none', marginBottom: 12 }}>
                    <ArrowLeft size={13} /> Back to Districts
                </Link>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0A1628' }}>{district.districtName}</h1>
                    <RiskBadge level={district.currentRiskLevel} />
                </div>
                <p style={{ fontSize: 12, color: '#94A3B8', marginTop: 4 }}>{district.stateName} · GADM ID: {district.gadmLevel2Id}</p>
            </div>

            {/* District stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
                {[
                    { icon: Droplets, label: 'Area', val: formatArea(district.areaKm2 ?? 0), color: '#0D7377' },
                    { icon: Users, label: 'Population', val: formatPopulation(district.population2020 ?? 0), color: '#0369A1' },
                    { icon: TrendingUp, label: 'Events', val: String(district.totalEventsCount ?? 0), color: '#7C3AED' },
                    { icon: Cloud, label: 'Last Check', val: formatDate(district.lastAssessedAt ?? new Date()), color: '#64748B' },
                ].map(({ icon: Icon, label, val, color }) => (
                    <div key={label} className="glass-card stat-accent-teal" style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                            <Icon size={13} color={color} />
                            <span style={{ fontSize: 10, color: '#64748B', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em' }}>{label}</span>
                        </div>
                        <div style={{ fontSize: 16, fontWeight: 800, color: '#0A1628' }}>{val}</div>
                    </div>
                ))}
            </div>

            {/* Event history */}
            <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid #F1F5F9' }}>
                    <h2 style={{ fontSize: 14, fontWeight: 700, color: '#0A1628' }}>Event History (60 days)</h2>
                    <p style={{ fontSize: 11, color: '#94A3B8', marginTop: 2 }}>{history?.length ?? 0} events</p>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #F1F5F9' }}>
                            {['Date', 'Risk Level', 'Score', 'Flood Area', 'Affected Pop.', 'Rainfall 7d', 'Confidence', 'Status'].map((h) => (
                                <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.07em', whiteSpace: 'nowrap' }}>
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {(history ?? []).map((e: any) => (
                            <tr key={e._id} className="risk-table-row" style={{ borderBottom: '1px solid #F8FAFC' }}>
                                <td style={{ padding: '11px 14px', fontSize: 12, color: '#475569', whiteSpace: 'nowrap' }}>{formatDate(e.eventDate)}</td>
                                <td style={{ padding: '11px 14px' }}><RiskBadge level={e.riskLevel} /></td>
                                <td style={{ padding: '11px 14px', fontSize: 13, fontWeight: 700 }}>{formatScore(e.riskScore)}</td>
                                <td style={{ padding: '11px 14px', fontSize: 12, color: '#475569' }}>{formatArea(e.floodAreaKm2)}</td>
                                <td style={{ padding: '11px 14px', fontSize: 12, color: '#475569' }}>{formatPopulation(e.affectedPopEst)}</td>
                                <td style={{ padding: '11px 14px', fontSize: 12, color: '#475569' }}>{e.enrichment?.rainfallMm7d?.toFixed(0) ?? '—'} mm</td>
                                <td style={{ padding: '11px 14px', minWidth: 110 }}><ConfidenceBar score={e.confidenceScore ?? 0.8} /></td>
                                <td style={{ padding: '11px 14px' }}>
                                    <span style={{
                                        fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 4,
                                        background: e.status === 'active' ? '#FEF2F2' : '#F0FDF4',
                                        color: e.status === 'active' ? '#DC2626' : '#16A34A',
                                        border: `1px solid ${e.status === 'active' ? '#FECACA' : '#BBF7D0'}`,
                                    }}>
                                        {e.status?.toUpperCase()}
                                    </span>
                                </td>
                            </tr>
                        ))}
                        {(!history || history.length === 0) && (
                            <tr><td colSpan={8} style={{ padding: 32, textAlign: 'center', color: '#94A3B8' }}>No event history.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
