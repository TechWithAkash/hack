'use client';

import { useMemo } from 'react';
import useSWR from 'swr';
import { fetcher } from '@/lib/api/fetcher';
import { formatArea, formatPopulation } from '@/lib/utils/formatters';
import {
    AlertCircle, Activity, TrendingUp, Users,
    Droplets, Map, ShieldAlert, Cpu
} from 'lucide-react';

export default function StatsGrid() {
    const { data, isLoading } = useSWR('/api/insights/summary', fetcher, { refreshInterval: 60000 });

    const RISK_CARDS = [
        { key: 'CRITICAL', label: 'Critical Alert', icon: AlertCircle, iconColor: '#EF4444', gradient: 'linear-gradient(135deg, #FEF2F2, #FEE2E2)' },
        { key: 'HIGH', label: 'High Severity', icon: ShieldAlert, iconColor: '#F97316', gradient: 'linear-gradient(135deg, #FFF7ED, #FFEDD5)' },
        { key: 'MEDIUM', label: 'Medium Risk', icon: TrendingUp, iconColor: '#EAB308', gradient: 'linear-gradient(135deg, #FEFCE8, #FEF9C3)' },
        { key: 'LOW', label: 'Low Impact', icon: Droplets, iconColor: '#10B981', gradient: 'linear-gradient(135deg, #F0FDF4, #DCFCE7)' },
    ];

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
                        background: 'rgba(255, 255, 255, 0.7)',
                        backdropFilter: 'blur(16px)',
                        border: '1px solid rgba(255, 255, 255, 0.8)',
                        borderRadius: 24,
                        padding: '24px',
                        boxShadow: '0 8px 32px rgba(15, 23, 42, 0.04)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        minHeight: 160,
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        cursor: 'pointer',
                        position: 'relative',
                        overflow: 'hidden'
                    }}
                    onMouseEnter={e => {
                        e.currentTarget.style.transform = 'translateY(-6px) scale(1.02)';
                        e.currentTarget.style.boxShadow = '0 12px 48px rgba(15, 23, 42, 0.08)';
                        e.currentTarget.style.borderColor = iconColor + '40';
                    }}
                    onMouseLeave={e => {
                        e.currentTarget.style.transform = 'translateY(0) scale(1)';
                        e.currentTarget.style.boxShadow = '0 8px 32px rgba(15, 23, 42, 0.04)';
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.8)';
                    }}
                >
                    <div style={{ position: 'absolute', top: -10, right: -10, opacity: 0.03, pointerEvents: 'none' }}>
                        <Icon size={120} />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, position: 'relative' }}>
                        <div style={{ background: gradient, borderRadius: 12, padding: 10, color: iconColor, boxShadow: `0 4px 12px ${iconColor}20` }}>
                            <Icon size={20} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Districts</span>
                            {riskMap[key] > 0 && <div className="pulse-dot" style={{ background: iconColor, marginTop: 4 }} />}
                        </div>
                    </div>
                    <div style={{ position: 'relative' }}>
                        <div style={{ fontSize: 48, fontWeight: 950, color: '#0F172A', lineHeight: 1, letterSpacing: '-0.04em' }}>
                            {riskMap[key] ?? 0}
                        </div>
                        <div style={{ fontSize: 11, color: '#64748B', fontWeight: 800, marginTop: 12, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'flex', alignItems: 'center', gap: 6 }}>
                            {label}
                        </div>
                    </div>
                </div>
            ))}

            {extraCards.map(({ label, value, icon: Icon, color, bg }) => (
                <div
                    key={label}
                    style={{
                        background: 'rgba(255, 255, 255, 0.7)',
                        backdropFilter: 'blur(16px)',
                        border: '1px solid rgba(255, 255, 255, 0.8)',
                        borderRadius: 24,
                        padding: '24px',
                        boxShadow: '0 8px 32px rgba(15, 23, 42, 0.04)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        minHeight: 160,
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        cursor: 'pointer',
                        position: 'relative',
                        overflow: 'hidden'
                    }}
                    onMouseEnter={e => {
                        e.currentTarget.style.transform = 'translateY(-6px) scale(1.02)';
                        e.currentTarget.style.boxShadow = '0 12px 48px rgba(15, 23, 42, 0.08)';
                        e.currentTarget.style.borderColor = color + '40';
                    }}
                    onMouseLeave={e => {
                        e.currentTarget.style.transform = 'translateY(0) scale(1)';
                        e.currentTarget.style.boxShadow = '0 8px 32px rgba(15, 23, 42, 0.04)';
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.8)';
                    }}
                >
                    <div style={{ position: 'absolute', top: -10, right: -10, opacity: 0.03, pointerEvents: 'none' }}>
                        <Icon size={120} />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, position: 'relative' }}>
                        <div style={{ background: bg, borderRadius: 12, padding: 10, color, boxShadow: `0 4px 12px ${color}20` }}>
                            <Icon size={20} />
                        </div>
                        <div style={{ fontSize: 9, fontWeight: 950, color: '#94A3B8', letterSpacing: '0.15em', textTransform: 'uppercase' }}>Metric</div>
                    </div>
                    <div style={{ position: 'relative' }}>
                        <div style={{ fontSize: 32, fontWeight: 950, color: '#0F172A', lineHeight: 1, letterSpacing: '-0.02em' }}>
                            {value}
                        </div>
                        <div style={{ fontSize: 11, color: '#64748B', fontWeight: 800, marginTop: 12, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                            {label}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
