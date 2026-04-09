'use client';

import { useMemo } from 'react';
import useSWR from 'swr';
import { fetcher } from '@/lib/api/fetcher';
import { formatArea, formatPopulation } from '@/lib/utils/formatters';
import { AlertCircle, ShieldAlert, TrendingUp, Droplets, Map, Users } from 'lucide-react';

const RISK_CONFIG = [
    { key: 'CRITICAL', label: 'Critical', icon: AlertCircle, color: '#EF4444', bg: '#FEF2F2' },
    { key: 'HIGH',     label: 'High',     icon: ShieldAlert,  color: '#F97316', bg: '#FFF7ED' },
    { key: 'MEDIUM',   label: 'Medium',   icon: TrendingUp,   color: '#D97706', bg: '#FFFBEB' },
    { key: 'LOW',      label: 'Low',      icon: Droplets,     color: '#10B981', bg: '#F0FDF4' },
];

function StatCard({
    label, value, icon: Icon, color, bg, sub,
}: {
    label: string; value: string | number; icon: any;
    color: string; bg: string; sub?: string;
}) {
    return (
        <div style={{
            background: 'white',
            border: '1px solid #E5E7EB',
            borderRadius: 16,
            padding: '18px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            transition: 'all 0.15s ease',
            cursor: 'default',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
        }}
            onMouseEnter={e => {
                e.currentTarget.style.borderColor = color + '40';
                e.currentTarget.style.boxShadow = `0 8px 24px ${color}10`;
                e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={e => {
                e.currentTarget.style.borderColor = '#E5E7EB';
                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.02)';
                e.currentTarget.style.transform = 'translateY(0)';
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 10, fontWeight: 600, color: '#64748B' }}>{label}</span>
                <div style={{
                    width: 26, height: 26, borderRadius: 7, background: bg,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color,
                }}>
                    <Icon size={13} />
                </div>
            </div>
            <div>
                <div style={{ fontSize: 24, fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em', lineHeight: 1 }}>
                    {value}
                </div>
                {sub && (
                    <div style={{ fontSize: 9, color: '#64748B', fontWeight: 600, marginTop: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        {sub}
                    </div>
                )}
            </div>
        </div>
    );
}

function SkeletonCard() {
    return (
        <div style={{
            background: '#F8FAFC', border: '1px solid #E2E8F0',
            borderRadius: 12, padding: '14px 16px', height: 78,
            animation: 'pulse 1.5s ease-in-out infinite',
        }} />
    );
}

export default function StatsGrid() {
    const { data, isLoading } = useSWR('/api/insights/summary', fetcher, { refreshInterval: 60000 });

    const riskMap: Record<string, number> = {};
    (data?.riskBreakdown ?? []).forEach((r: any) => { riskMap[r._id] = r.count; });

    const totalFlood = data?.totals?.total ?? 0;
    const totalPop = data?.totals?.totalPop ?? 0;

    if (isLoading) {
        return (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 12 }}>
                {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
        );
    }

    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 12 }}>
            {RISK_CONFIG.map(({ key, label, icon, color, bg }) => (
                <StatCard
                    key={key}
                    label={label}
                    value={riskMap[key] ?? 0}
                    icon={icon}
                    color={color}
                    bg={bg}
                    sub="districts"
                />
            ))}

            <StatCard
                label="Flood Area"
                value={formatArea(totalFlood)}
                icon={Map}
                color="#0D7377"
                bg="#F0FDFA"
                sub="total affected"
            />
            <StatCard
                label="At-Risk Population"
                value={formatPopulation(totalPop)}
                icon={Users}
                color="#0369A1"
                bg="#F0F9FF"
                sub="estimated exposure"
            />
        </div>
    );
}
