'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard, Map, Building2, FileText,
    ScrollText, Settings, Satellite, Activity,
    ShieldAlert, BarChart2, AlignLeft, Cpu,
    MessageSquare, FileCheck
} from 'lucide-react';

const NAV_ITEMS = [
    { href: '/', icon: LayoutDashboard, label: 'Overview' },
    { href: '/map', icon: Map, label: 'Regional Map' },
    { href: '/districts', icon: Building2, label: 'Districts' },
    { href: '/reports', icon: FileText, label: 'Reports' },
    { href: '/logs', icon: ScrollText, label: 'System Logs' },
    { href: '/studio/spatial', icon: Satellite, label: 'Spatial Insights' },
    { href: '/studio/risk', icon: ShieldAlert, label: 'Risk Analysis' },
    { href: '/studio/confidence', icon: BarChart2, label: 'Model Reliability' },
    { href: '/studio/logs', icon: AlignLeft, label: 'Telemetry Stream' },
    { href: '/studio/api', icon: Cpu, label: 'Rest API' },
    { href: '/studio/ai', icon: MessageSquare, label: 'Generative AI' },
    { href: '/studio/pdf', icon: FileCheck, label: 'Assessment Report' },
];

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <aside
            className="flex flex-col"
            style={{
                width: 220,
                minWidth: 220,
                background: 'white',
                borderRight: '1px solid #E2E8F0',
                padding: '0',
                overflow: 'hidden',
            }}
        >
            {/* Logo */}
            <div
                style={{
                    padding: '20px 18px 16px',
                    borderBottom: '1px solid #F1F5F9',
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div
                        style={{
                            width: 36, height: 36,
                            borderRadius: 9,
                            background: 'linear-gradient(135deg, #0A1628, #0D7377)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            flexShrink: 0,
                        }}
                    >
                        <Satellite size={18} color="white" />
                    </div>
                    <div>
                        <div style={{ fontWeight: 800, fontSize: 14, color: '#0A1628', letterSpacing: '-0.02em' }}>
                            COSMEON
                        </div>
                        <div style={{ fontSize: 10, color: '#64748B', fontWeight: 500, letterSpacing: '0.06em' }}>
                            CLIMATE RISK ENGINE
                        </div>
                    </div>
                </div>
            </div>

            {/* Pipeline status indicator */}
            <div style={{ padding: '12px 18px', borderBottom: '1px solid #F1F5F9' }}>
                <div
                    style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        background: '#F0FDF4', borderRadius: 8,
                        padding: '8px 12px',
                        border: '1px solid #BBF7D0',
                    }}
                >
                    <Activity size={12} color="#22C55E" />
                    <span style={{ fontSize: 11, fontWeight: 600, color: '#16A34A' }}>Pipeline Online</span>
                    <div className="pulse-dot" style={{ background: '#22C55E', marginLeft: 'auto' }} />
                </div>
            </div>

            {/* Navigation */}
            <nav style={{ padding: '12px 10px', flex: 1 }}>
                <div style={{ fontSize: 10, color: '#94A3B8', fontWeight: 700, padding: '4px 8px 8px', letterSpacing: '0.1em' }}>
                    NAVIGATION
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
                        const isActive = pathname === href || (href !== '/' && pathname.startsWith(href));
                        return (
                            <Link key={href} href={href} className={`sidebar-link ${isActive ? 'active' : ''}`}>
                                <Icon size={15} />
                                {label}
                            </Link>
                        );
                    })}
                </div>
            </nav>

            {/* Footer */}
            <div style={{ padding: '12px 18px', borderTop: '1px solid #F1F5F9' }}>
                <div style={{ fontSize: 10, color: '#94A3B8', fontWeight: 500, textAlign: 'center' }}>
                    Sentinel-1 · Sentinel-2 · Landsat
                </div>
                <div style={{ fontSize: 10, color: '#CBD5E1', textAlign: 'center', marginTop: 2 }}>
                    Powered by Google Earth Engine
                </div>
            </div>
        </aside>
    );
}
