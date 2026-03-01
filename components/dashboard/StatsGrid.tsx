'use client';

import useSWR from 'swr';
import { fetcher } from '@/lib/api/fetcher';
import { formatArea, formatPopulation } from '@/lib/utils/formatters';
import {
    AlertCircle, Activity, TrendingUp, Users,
    Droplets, Map, ShieldAlert, Cpu
} from 'lucide-react';

const RISK_CARDS = [
    { key: 'CRITICAL', label: 'Critical Alert', icon: AlertCircle, iconColor: '#EF4444', gradient: 'linear-gradient(135deg, #FEF2F2, #FEE2E2)' },
    { key: 'HIGH', label: 'High Severity', icon: ShieldAlert, iconColor: '#F97316', gradient: 'linear-gradient(135deg, #FFF7ED, #FFEDD5)' },
    { key: 'MEDIUM', label: 'Medium Risk', icon: TrendingUp, iconColor: '#EAB308', gradient: 'linear-gradient(135deg, #FEFCE8, #FEF9C3)' },
    { key: 'LOW', label: 'Low Impact', icon: Droplets, iconColor: '#10B981', gradient: 'linear-gradient(135deg, #F0FDF4, #DCFCE7)' },
];

export default function StatsGrid() {
    const { data, isLoading } = useSWR('/api/insights/summary', fetcher, { refreshInterval: 60000 });

    const riskMap: Record<string, number> = {};
    (data?.riskBreakdown ?? []).forEach((r: any) => { riskMap[r._id] = r.count; });

    const totalFlood = data?.totals?.total ?? 0;
    const totalPop = data?.totals?.totalPop ?? 0;

    const extraCards = [
        { label: 'Total Flood Area', value: formatArea(totalFlood), icon: Map, color: '#0D7377', bg: '#F0FDFA' },
        { label: 'Exposed Population', value: formatPopulation(totalPop), icon: Users, color: '#0369A1', bg: '#F0F9FF' },
    ];

    if (isLoading) {
        return (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 16 }}>
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="glass-card shimmer" style={{ height: 120, borderRadius: 20 }} />
                ))}
            </div>
        );
    }

    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 16 }}>
            {RISK_CARDS.map(({ key, label, icon: Icon, iconColor, gradient }) => (
                <div
                    key={key}
                    style={{
                        background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 24, padding: '24px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column',
                        justifyContent: 'space-between', minHeight: 140, transition: 'transform 0.2s', cursor: 'default'
                    }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                        <div style={{ background: gradient, borderRadius: 10, padding: 8, color: iconColor }}>
                            <Icon size={18} />
                        </div>
                        <div style={{ fontSize: 10, fontWeight: 900, color: '#94A3B8', letterSpacing: '0.1em' }}>DISTRICTS</div>
                    </div>
                    <div>
                        <div style={{ fontSize: 36, fontWeight: 950, color: '#0F172A', lineHeight: 1 }}>
                            {riskMap[key] ?? 0}
                        </div>
                        <div style={{ fontSize: 11, color: '#64748B', fontWeight: 800, marginTop: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            {label}
                        </div>
                    </div>
                </div>
            ))}

            {extraCards.map(({ label, value, icon: Icon, color, bg }) => (
                <div
                    key={label}
                    style={{
                        background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 24, padding: '24px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column',
                        justifyContent: 'space-between', minHeight: 140, transition: 'transform 0.2s', cursor: 'default'
                    }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                        <div style={{ background: bg, borderRadius: 10, padding: 8, color }}>
                            <Icon size={18} />
                        </div>
                        <div style={{ fontSize: 10, fontWeight: 900, color: '#64748B', letterSpacing: '0.1em' }}>METRIC</div>
                    </div>
                    <div>
                        <div style={{ fontSize: 24, fontWeight: 950, color: '#0F172A', lineHeight: 1 }}>
                            {value}
                        </div>
                        <div style={{ fontSize: 11, color: '#64748B', fontWeight: 800, marginTop: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            {label}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
