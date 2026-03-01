'use client';

import { useState, useMemo } from 'react';
import useSWR from 'swr';
import { fetcher } from '@/lib/api/fetcher';
import RiskBadge from '@/components/shared/RiskBadge';
import { formatArea, formatDate, formatPopulation } from '@/lib/utils/formatters';
import {
    Search, Filter, SlidersHorizontal, ArrowRight,
    Droplets, Users, ShieldAlert, Activity, LayoutGrid, List
} from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

export default function DistrictsPage() {
    const { data, isLoading } = useSWR('/api/districts', fetcher, {
        refreshInterval: 15000,
        revalidateOnFocus: true
    });
    const districts = data?.districts ?? [];

    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [riskFilter, setRiskFilter] = useState<string | null>(null);

    // Aggregate stats
    const stats = useMemo(() => {
        const counts = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 };
        districts.forEach((d: any) => {
            if (counts.hasOwnProperty(d.currentRiskLevel)) {
                counts[d.currentRiskLevel as keyof typeof counts]++;
            }
        });
        return counts;
    }, [districts]);

    const filteredDistricts = useMemo(() => {
        return districts.filter((d: any) => {
            const dName = d.districtName || '';
            const sName = d.stateName || '';
            const matchesQuery = dName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                sName.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesRisk = riskFilter ? d.currentRiskLevel === riskFilter : true;
            return matchesQuery && matchesRisk;
        });
    }, [districts, searchQuery, riskFilter]);

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.05 }
        }
    };

    const itemVariants = {
        hidden: { y: 10, opacity: 0 },
        show: { y: 0, opacity: 1 }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24, paddingBottom: 40 }}>
            {/* ── Intelligence Header ─────────────────────────────────────── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                        width: 4, height: 24,
                        background: 'linear-gradient(180deg, #0D7377, #14A5AA)',
                        borderRadius: 2,
                        boxShadow: '0 0 10px rgba(13, 115, 119, 0.4)'
                    }} />
                    <h1 style={{ fontSize: 24, fontWeight: 900, color: '#0F172A', letterSpacing: '-0.03em' }}>
                        District Intelligence
                    </h1>
                </div>
                <p style={{ fontSize: 13, color: '#64748B', marginLeft: 14, fontWeight: 500 }}>
                    Real-time situational awareness across {districts.length} districts in India.
                </p>
            </div>

            {/* ── Tactical Stats Bar ────────────────────────────────────────── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                {[
                    { label: "Critical Alert", count: stats.CRITICAL, color: '#EF4444', level: 'CRITICAL' },
                    { label: "High Priority", count: stats.HIGH, color: '#F97316', level: 'HIGH' },
                    { label: "Active Monitor", count: stats.MEDIUM, color: '#EAB308', level: 'MEDIUM' },
                    { label: "Baseline (Low)", count: stats.LOW, color: '#22C55E', level: 'LOW' },
                ].map((s) => (
                    <motion.div
                        key={s.label}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setRiskFilter(riskFilter === s.level ? null : s.level)}
                        className={`operational-card ${riskFilter === s.level ? 'active-filter' : ''}`}
                        style={{
                            padding: '16px 20px',
                            cursor: 'pointer',
                            borderLeft: `4px solid ${s.color}`,
                            background: riskFilter === s.level ? `${s.color}08` : 'rgba(255,255,255,0.7)',
                            borderColor: riskFilter === s.level ? s.color : 'rgba(255,255,255,0.8)'
                        }}
                    >
                        <div style={{ fontSize: 10, fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
                            {s.label}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                            <div style={{ fontSize: 24, fontWeight: 950, color: '#0F172A' }}>{s.count}</div>
                            <div style={{ fontSize: 12, fontWeight: 600, color: '#94A3B8' }}>Districts</div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* ── Tactical Filter Bar ────────────────────────────────────────── */}
            <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                gap: 16, padding: '0 4px'
            }}>
                <div style={{ position: 'relative', flex: 1, maxWidth: 400 }}>
                    <Search
                        size={16}
                        style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }}
                    />
                    <input
                        type="text"
                        placeholder="Search district or state..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '12px 16px 12px 42px',
                            background: 'white',
                            border: '1px solid #E2E8F0',
                            borderRadius: '14px',
                            fontSize: 14,
                            fontWeight: 500,
                            color: '#0F172A',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                            outline: 'none',
                            transition: 'all 0.2s'
                        }}
                    />
                    {searchQuery && (
                        <div
                            style={{
                                position: 'absolute', right: 14, top: '50%',
                                transform: 'translateY(-50%)', background: '#F1F5F9',
                                color: '#64748B', fontSize: 10, fontWeight: 700,
                                padding: '2px 6px', borderRadius: 4, cursor: 'pointer'
                            }}
                            onClick={() => setSearchQuery('')}
                        >
                            ESC
                        </div>
                    )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ display: 'flex', background: '#F1F5F9', padding: 4, borderRadius: 10 }}>
                        <button
                            onClick={() => setViewMode('grid')}
                            style={{
                                padding: 8, borderRadius: 8, border: 'none', cursor: 'pointer',
                                background: viewMode === 'grid' ? 'white' : 'transparent',
                                boxShadow: viewMode === 'grid' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                                color: viewMode === 'grid' ? '#0D7377' : '#94A3B8',
                                transition: 'all 0.2s'
                            }}
                        >
                            <LayoutGrid size={16} />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            style={{
                                padding: 8, borderRadius: 8, border: 'none', cursor: 'pointer',
                                background: viewMode === 'list' ? 'white' : 'transparent',
                                boxShadow: viewMode === 'list' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                                color: viewMode === 'list' ? '#0D7377' : '#94A3B8',
                                transition: 'all 0.2s'
                            }}
                        >
                            <List size={16} />
                        </button>
                    </div>
                </div>
            </div>

            {/* ── District Grid/List ─────────────────────────────────────────── */}
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                style={{
                    display: 'grid',
                    gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill, minmax(310px, 1fr))' : '1fr',
                    gap: 16
                }}
            >
                {isLoading
                    ? Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="glass-card shimmer" style={{ height: 160, borderRadius: 20 }} />
                    ))
                    : filteredDistricts.map((d: any) => (
                        <Link
                            key={d._id}
                            href={`/districts/${d._id}`}
                            style={{ textDecoration: 'none' }}
                        >
                            <motion.div
                                variants={itemVariants}
                                whileHover={{ y: -4, boxShadow: '0 20px 40px rgba(15, 23, 42, 0.1)' }}
                                className="operational-card"
                                style={{
                                    padding: '24px',
                                    cursor: 'pointer',
                                    border: '1px solid rgba(148, 163, 184, 0.15)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'space-between',
                                    minHeight: 180
                                }}
                            >
                                <div style={{ marginBottom: 20 }}>
                                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 6 }}>
                                        <div style={{
                                            fontSize: 18, fontWeight: 950, color: '#0F172A',
                                            letterSpacing: '-0.03em', lineHeight: 1.1
                                        }}>
                                            {d.districtName}
                                        </div>
                                        <RiskBadge level={d.currentRiskLevel} />
                                    </div>
                                    <div style={{
                                        display: 'flex', alignItems: 'center', gap: 6,
                                        fontSize: 12, color: '#64748B', fontWeight: 600
                                    }}>
                                        <ShieldAlert size={12} />
                                        {d.stateName}
                                    </div>
                                </div>

                                <div style={{
                                    display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
                                    gap: 12, padding: '12px 0', borderTop: '1px solid #F1F5F9'
                                }}>
                                    {[
                                        { label: "Area", val: formatArea(d.areaKm2 ?? 0), icon: Droplets },
                                        { label: "Expos.", val: formatPopulation(d.population2020 ?? 0), icon: Users },
                                        { label: "Events", val: String(d.totalEventsCount ?? 0), icon: Activity },
                                    ].map((m) => (
                                        <div key={m.label}>
                                            <div style={{ fontSize: 9, color: '#94A3B8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2 }}>
                                                {m.label}
                                            </div>
                                            <div style={{ fontSize: 13, fontWeight: 800, color: '#0F172A' }}>{m.val}</div>
                                        </div>
                                    ))}
                                </div>

                                <div style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    marginTop: 12, paddingTop: 12, borderTop: '1px solid #F1F5F9'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                        <div style={{
                                            width: 6, height: 6, borderRadius: '50%',
                                            background: '#CBD5E1'
                                        }} />
                                        <span style={{ fontSize: 10, color: '#94A3B8', fontWeight: 600 }}>
                                            {d.lastAssessedAt ? `Ingested ${formatDate(d.lastAssessedAt, 'en')}` : "Standby"}
                                        </span>
                                    </div>
                                    <div style={{
                                        width: 28, height: 28, borderRadius: 8,
                                        background: '#F8FAFC', display: 'flex', alignItems: 'center',
                                        justifyContent: 'center', transition: 'all 0.2s'
                                    }}>
                                        <ArrowRight size={14} color="#0D7377" />
                                    </div>
                                </div>
                            </motion.div>
                        </Link>
                    ))}
            </motion.div>

            {/* ── Empty State ─────────────────────────────────────────────── */}
            {!isLoading && filteredDistricts.length === 0 && (
                <div style={{
                    padding: '80px 40px', textAlign: 'center',
                    background: 'rgba(248, 250, 252, 0.5)', borderRadius: 24,
                    border: '2px dashed #E2E8F0'
                }}>
                    <Search size={48} color="#CBD5E1" style={{ marginBottom: 16 }} />
                    <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0F172A', marginBottom: 8 }}>
                        No tactical reports found
                    </h3>
                    <p style={{ fontSize: 14, color: '#64748B', maxWidth: 300, margin: '0 auto' }}>
                        No districts match your current filter criteria or tactical search.
                    </p>
                    <button
                        onClick={() => { setSearchQuery(''); setRiskFilter(null); }}
                        style={{
                            marginTop: 20, padding: '8px 20px', background: '#0D7377',
                            color: 'white', border: 'none', borderRadius: 10,
                            fontWeight: 700, cursor: 'pointer'
                        }}
                    >
                        Reset Filters
                    </button>
                </div>
            )}
        </div>
    );
}
