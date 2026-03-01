import { FileText, Download } from 'lucide-react';
import { formatDate } from '@/lib/utils/formatters';

export const metadata = { title: 'Reports · NETRA.AI' };

// Static placeholder — real reports come from pipeline POST payloads
export default function ReportsPage() {
    const mockReports = [
        { id: 'RPT-2026-001', title: 'Assam Flood Assessment — Feb 2026', date: '2026-02-22', status: 'ready', districts: 5, critical: 1 },
        { id: 'RPT-2026-002', title: 'Brahmaputra Basin Risk Summary', date: '2026-02-15', status: 'ready', districts: 8, critical: 2 },
        { id: 'RPT-2026-003', title: 'Monthly Climate Risk Digest — Jan', date: '2026-01-31', status: 'ready', districts: 12, critical: 0 },
        { id: 'RPT-2026-004', title: 'Emergency Assessment — Dhubri Flood', date: '2026-01-18', status: 'generating', districts: 1, critical: 1 },
    ];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <div style={{ width: 3, height: 20, background: 'linear-gradient(180deg, #0D7377, #14A5AA)', borderRadius: 2 }} />
                    <h1 style={{ fontSize: 18, fontWeight: 800, color: '#0A1628' }}>Reports</h1>
                </div>
                <p style={{ fontSize: 12, color: '#94A3B8', marginLeft: 11 }}>
                    Auto-generated JSON & PDF reports from pipeline runs
                </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {mockReports.map((r) => (
                    <div key={r.id} className="glass-card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
                        <div style={{ background: '#F0FDFA', borderRadius: 10, padding: 12, flexShrink: 0 }}>
                            <FileText size={20} color="#0D7377" />
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 13, fontWeight: 700, color: '#0A1628', marginBottom: 4 }}>{r.title}</div>
                            <div style={{ display: 'flex', gap: 12, fontSize: 11, color: '#94A3B8' }}>
                                <span>{r.id}</span>
                                <span>·</span>
                                <span>{formatDate(r.date)}</span>
                                <span>·</span>
                                <span>{r.districts} districts</span>
                                {r.critical > 0 && (
                                    <>
                                        <span>·</span>
                                        <span style={{ color: '#EF4444', fontWeight: 700 }}>{r.critical} critical</span>
                                    </>
                                )}
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: 8, flexShrink: 0, alignItems: 'center' }}>
                            <span
                                style={{
                                    fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 6,
                                    background: r.status === 'ready' ? '#F0FDF4' : '#FFF7ED',
                                    color: r.status === 'ready' ? '#16A34A' : '#C2410C',
                                    border: `1px solid ${r.status === 'ready' ? '#BBF7D0' : '#FED7AA'}`,
                                }}
                            >
                                {r.status === 'ready' ? 'Ready' : 'Generating…'}
                            </span>
                            {r.status === 'ready' && (
                                <button
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: 5,
                                        padding: '6px 14px',
                                        background: '#F8FAFC', border: '1px solid #E2E8F0',
                                        borderRadius: 7, fontSize: 12, fontWeight: 600, color: '#475569',
                                        cursor: 'pointer',
                                    }}
                                >
                                    <Download size={12} />
                                    JSON
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
