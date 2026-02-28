'use client';

import useSWR from 'swr';
import { fetcher } from '@/lib/api/fetcher';
import { formatArea, formatPopulation } from '@/lib/utils/formatters';
import {
    AlertTriangle, Activity, TrendingUp, Users,
    Droplets, Cpu, Map, BarChart3,
} from 'lucide-react';

const RISK_CARDS = [
    { key: 'CRITICAL', label: 'Critical Zones', icon: AlertTriangle, iconColor: '#EF4444', bg: '#FEF2F2', accent: 'stat-accent-critical' },
    { key: 'HIGH', label: 'High Risk Zones', icon: Activity, iconColor: '#F97316', bg: '#FFF7ED', accent: 'stat-accent-high' },
    { key: 'MEDIUM', label: 'Medium Risk Zones', icon: TrendingUp, iconColor: '#EAB308', bg: '#FEFCE8', accent: 'stat-accent-medium' },
    { key: 'LOW', label: 'Low Risk Zones', icon: Droplets, iconColor: '#22C55E', bg: '#F0FDF4', accent: 'stat-accent-low' },
];

export default function StatsGrid() {
    const { data, isLoading } = useSWR('/api/insights/summary', fetcher, { refreshInterval: 60000 });

    const riskMap: Record<string, number> = {};
    (data?.riskBreakdown ?? []).forEach((r: any) => { riskMap[r._id] = r.count; });

    const totalFlood = data?.totals?.total ?? 0;
    const totalPop = data?.totals?.totalPop ?? 0;

    const extraCards = [
        { label: 'Total Flood Area', value: formatArea(totalFlood), icon: Map, iconColor: '#0D7377', bg: '#F0FDFA', accent: 'stat-accent-teal' },
        { label: 'Affected Population', value: formatPopulation(totalPop), icon: Users, iconColor: '#0D7377', bg: '#F0FDFA', accent: 'stat-accent-teal' },
    ];

    if (isLoading) {
        return (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 14 }}>
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="glass-card shimmer" style={{ height: 100 }} />
                ))}
            </div>
        );
    }

    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 14 }}>
            {RISK_CARDS.map(({ key, label, icon: Icon, iconColor, bg, accent }) => (
                <div
                    key={key}
                    className={`glass-card ${accent}`}
                    style={{ padding: '16px 18px' }}
                >
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                        <div>
                            <div style={{ fontSize: 11, color: '#64748B', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
                                {label}
                            </div>
                            <div style={{ fontSize: 28, fontWeight: 800, color: iconColor, lineHeight: 1 }}>
                                {riskMap[key] ?? 0}
                            </div>
                            <div style={{ fontSize: 10, color: '#94A3B8', marginTop: 4 }}>districts</div>
                        </div>
                        <div style={{ background: bg, borderRadius: 8, padding: 8 }}>
                            <Icon size={20} color={iconColor} />
                        </div>
                    </div>
                </div>
            ))}

            {extraCards.map(({ label, value, icon: Icon, iconColor, bg, accent }) => (
                <div key={label} className={`glass-card ${accent}`} style={{ padding: '16px 18px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                        <div>
                            <div style={{ fontSize: 11, color: '#64748B', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
                                {label}
                            </div>
                            <div style={{ fontSize: 22, fontWeight: 800, color: '#0A1628', lineHeight: 1 }}>
                                {value}
                            </div>
                            <div style={{ fontSize: 10, color: '#94A3B8', marginTop: 4 }}>live estimate</div>
                        </div>
                        <div style={{ background: bg, borderRadius: 8, padding: 8 }}>
                            <Icon size={20} color={iconColor} />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
