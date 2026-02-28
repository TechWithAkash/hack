'use client';

import useSWR from 'swr';
import { fetcher } from '@/lib/api/fetcher';
import { AlertTriangle, Wind } from 'lucide-react';
import { formatPopulation, formatArea } from '@/lib/utils/formatters';

export default function AlertBanner() {
    const { data } = useSWR('/api/insights/latest?limit=10', fetcher, { refreshInterval: 60000 });

    const criticalEvents = (data?.events ?? []).filter((e: any) => e.riskLevel === 'CRITICAL' && e.status === 'active');

    if (!criticalEvents.length) return null;

    return (
        <div className="alert-critical" style={{ borderRadius: 10, padding: '12px 18px', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            <div style={{ flexShrink: 0, marginTop: 2 }}>
                <AlertTriangle size={18} color="#EF4444" />
            </div>
            <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#991B1B', marginBottom: 4 }}>
                    🚨 {criticalEvents.length} CRITICAL Zone{criticalEvents.length > 1 ? 's' : ''} Active
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {criticalEvents.slice(0, 4).map((e: any) => (
                        <span
                            key={e._id}
                            style={{
                                fontSize: 11, fontWeight: 600, color: '#B91C1C',
                                background: '#FEE2E2', padding: '2px 10px', borderRadius: 6,
                                border: '1px solid #FECACA',
                            }}
                        >
                            {e.districtId?.districtName ?? 'District'} · {formatArea(e.floodAreaKm2)} flooded · {formatPopulation(e.affectedPopEst)} affected
                        </span>
                    ))}
                    {criticalEvents.length > 4 && (
                        <span style={{ fontSize: 11, color: '#EF4444', fontWeight: 600 }}>
                            +{criticalEvents.length - 4} more
                        </span>
                    )}
                </div>
            </div>
            <div className="pulse-dot" style={{ background: '#EF4444', flexShrink: 0, marginTop: 6 }} />
        </div>
    );
}
