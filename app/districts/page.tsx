'use client';

import useSWR from 'swr';
import { fetcher } from '@/lib/api/fetcher';
import RiskBadge from '@/components/shared/RiskBadge';
import { formatArea, formatDate, formatPopulation } from '@/lib/utils/formatters';
import { Building2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function DistrictsPage() {
    const { data, isLoading } = useSWR('/api/districts', fetcher, { refreshInterval: 60000 });
    const districts = data?.districts ?? [];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <div style={{ width: 3, height: 20, background: 'linear-gradient(180deg, #0D7377, #14A5AA)', borderRadius: 2 }} />
                    <h1 style={{ fontSize: 18, fontWeight: 800, color: '#0A1628', letterSpacing: '-0.02em' }}>Districts</h1>
                </div>
                <p style={{ fontSize: 12, color: '#94A3B8', marginLeft: 11 }}>
                    {districts.length} monitored districts · Assam flood zone coverage
                </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
                {isLoading
                    ? Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="glass-card shimmer" style={{ height: 140 }} />
                    ))
                    : districts.map((d: any) => (
                        <Link
                            key={d._id}
                            href={`/districts/${d._id}`}
                            style={{ textDecoration: 'none' }}
                        >
                            <div
                                className="glass-card"
                                style={{ padding: '18px 20px', cursor: 'pointer' }}
                            >
                                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
                                    <div>
                                        <div style={{ fontSize: 15, fontWeight: 700, color: '#0A1628', marginBottom: 2 }}>
                                            {d.districtName}
                                        </div>
                                        <div style={{ fontSize: 11, color: '#94A3B8' }}>{d.stateName}</div>
                                    </div>
                                    <RiskBadge level={d.currentRiskLevel} />
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 12 }}>
                                    {[
                                        { label: 'Area', val: formatArea(d.areaKm2 ?? 0) },
                                        { label: 'Population', val: formatPopulation(d.population2020 ?? 0) },
                                        { label: 'Events', val: String(d.totalEventsCount ?? 0) },
                                    ].map(({ label, val }) => (
                                        <div key={label}>
                                            <div style={{ fontSize: 10, color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>
                                                {label}
                                            </div>
                                            <div style={{ fontSize: 13, fontWeight: 700, color: '#0A1628' }}>{val}</div>
                                        </div>
                                    ))}
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <span style={{ fontSize: 10, color: '#CBD5E1' }}>
                                        {d.lastAssessedAt ? `Assessed ${formatDate(d.lastAssessedAt)}` : 'Not assessed'}
                                    </span>
                                    <ArrowRight size={13} color="#94A3B8" />
                                </div>
                            </div>
                        </Link>
                    ))}
                {!isLoading && districts.length === 0 && (
                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#94A3B8', fontSize: 13, padding: 40 }}>
                        No monitored districts found. Waiting for real-time risk data ingestion.
                    </div>
                )}
            </div>
        </div>
    );
}
