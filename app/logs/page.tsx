'use client';

import useSWR from 'swr';
import { fetcher } from '@/lib/api/fetcher';
import { Terminal, Info, AlertTriangle, XCircle, RefreshCw, CheckCircle, Clock } from 'lucide-react';
import { formatDateTime } from '@/lib/utils/formatters';

/* ── Level config ────────────────────────────────────────── */
const LEVEL: Record<string, { icon: any; color: string; bg: string; border: string }> = {
    INFO: { icon: Info, color: '#0369A1', bg: 'rgba(3,105,161,0.08)', border: 'rgba(3,105,161,0.18)' },
    WARN: { icon: AlertTriangle, color: '#C2410C', bg: 'rgba(194,65,12,0.08)', border: 'rgba(194,65,12,0.2)' },
    ERROR: { icon: XCircle, color: '#DC2626', bg: 'rgba(220,38,38,0.1)', border: 'rgba(220,38,38,0.3)' },
};

/* ── Stage badge colours ─────────────────────────────────── */
const STAGE_COLOR: Record<string, string> = {
    INIT: '#0D7377', GEE: '#7C3AED', INGEST: '#0369A1',
    DETECT: '#0891B2', ENRICH: '#C2410C', OUTPUT: '#16A34A',
    ERROR: '#DC2626',
};

export default function LogsPage() {
    const { data, isLoading, mutate } = useSWR('/api/pipeline/logs?limit=200', fetcher, {
        refreshInterval: 30_000,
    });

    const hasRealLogs = (data?.totalLogs ?? 0) > 0;
    const runs: any[] = data?.runs ?? [];
    const allLogs: any[] = data?.logs ?? [];

    /* Aggregate stats */
    const infoCount = allLogs.filter(l => l.level === 'INFO').length;
    const warnCount = allLogs.filter(l => l.level === 'WARN').length;
    const errorCount = allLogs.filter(l => l.level === 'ERROR').length;
    const maxMs = allLogs.reduce((m, l) => Math.max(m, l.durationMs ?? 0), 0);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* ── Header ──────────────────────────────────────── */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <div style={{ width: 3, height: 20, background: 'linear-gradient(180deg, #0D7377, #14A5AA)', borderRadius: 2 }} />
                        <h1 style={{ fontSize: 18, fontWeight: 800, color: '#0A1628', letterSpacing: '-0.02em' }}>
                            Pipeline Logs
                        </h1>
                    </div>
                    <p style={{ fontSize: 12, color: '#94A3B8', marginLeft: 11 }}>
                        {!isLoading && !hasRealLogs
                            ? 'No logs recorded. Trigger the GEE Pipeline or Fetch Live Data.'
                            : `${data?.totalLogs ?? 0} log entries · ${data?.uniqueRuns ?? 0} pipeline run(s) — real-time from MongoDB`}
                    </p>
                </div>

                <button
                    onClick={() => mutate()}
                    style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        padding: '7px 14px', borderRadius: 8,
                        background: '#F8FAFC', border: '1px solid #E2E8F0',
                        fontSize: 12, fontWeight: 600, color: '#475569', cursor: 'pointer',
                    }}
                >
                    <RefreshCw size={12} />
                    Refresh
                </button>
            </div>

            {/* ── Source badge ─────────────────────────────────── */}
            {!hasRealLogs && !isLoading && (
                <div style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    background: '#FFF7ED', border: '1px solid #FED7AA',
                    borderRadius: 10, padding: '10px 16px',
                }}>
                    <AlertTriangle size={14} color="#C2410C" />
                    <span style={{ fontSize: 12, color: '#92400E' }}>
                        No pipeline runs found in the database.
                        Trigger the <strong>GEE Pipeline</strong> or <strong>Fetch Live Data</strong> from the top bar to ingest new data.
                    </span>
                </div>
            )}

            {/* ── Stats strip ──────────────────────────────────── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 }}>
                {[
                    { label: 'Total Logs', val: allLogs.length, color: '#0A1628' },
                    { label: 'Unique Runs', val: hasRealLogs ? data.uniqueRuns : 1, color: '#0D7377' },
                    { label: 'Info Steps', val: infoCount, color: '#0369A1' },
                    { label: 'Warnings', val: warnCount, color: '#C2410C' },
                    { label: 'Errors', val: errorCount, color: '#DC2626' },
                ].map(({ label, val, color }) => (
                    <div key={label} className="glass-card" style={{ padding: '12px 16px' }}>
                        <div style={{ fontSize: 10, color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
                            {label}
                        </div>
                        <div style={{ fontSize: 22, fontWeight: 800, color }}>{val}</div>
                    </div>
                ))}
            </div>

            {/* ── Run grouping (only when real logs present) ──── */}
            {hasRealLogs && runs.length > 0 && (
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    {runs.slice(0, 5).map((run: any) => (
                        <div
                            key={run.runId}
                            style={{
                                display: 'flex', alignItems: 'center', gap: 8,
                                background: '#F0FDFA', border: '1px solid #CCFBF1',
                                borderRadius: 8, padding: '6px 14px',
                            }}
                        >
                            <CheckCircle size={11} color="#0D7377" />
                            <span style={{ fontSize: 11, fontWeight: 600, color: '#0A1628', fontFamily: 'monospace' }}>
                                {run.runId.slice(0, 8)}…
                            </span>
                            <span style={{ fontSize: 10, color: '#64748B' }}>
                                {run.stages.join(' → ')}
                            </span>
                            {run.errors > 0 && (
                                <span style={{ fontSize: 10, fontWeight: 700, color: '#DC2626' }}>
                                    {run.errors} error(s)
                                </span>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* ── Log terminal ─────────────────────────────────── */}
            <div
                className="glass-card"
                style={{
                    padding: 0, overflow: 'hidden',
                    background: '#060E1C',
                    border: '1px solid rgba(13,115,119,0.3)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
                }}
            >
                {/* Terminal header */}
                <div style={{
                    padding: '12px 20px',
                    borderBottom: '1px solid rgba(255,255,255,0.07)',
                    display: 'flex', alignItems: 'center', gap: 10,
                    background: 'rgba(0,0,0,0.3)',
                }}>
                    <div style={{ display: 'flex', gap: 6 }}>
                        <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#EF4444' }} />
                        <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#EAB308' }} />
                        <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#22C55E' }} />
                    </div>
                    <Terminal size={13} color="#0D7377" />
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#64748B', fontFamily: 'monospace' }}>
                        cosmeon-pipeline — {hasRealLogs ? 'live db logs' : 'demo mode'}
                    </span>
                    <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Clock size={10} color="#475569" />
                        <span style={{ fontSize: 10, color: '#475569' }}>
                            {maxMs > 0 ? `${(maxMs / 1000).toFixed(1)}s total` : 'N/A'}
                        </span>
                        <div
                            className="pulse-dot"
                            style={{ background: hasRealLogs ? '#22C55E' : '#EAB308', marginLeft: 4 }}
                        />
                    </div>
                </div>

                {/* Log stream */}
                <div style={{
                    padding: '14px 20px',
                    display: 'flex', flexDirection: 'column', gap: 6,
                    maxHeight: 520, overflowY: 'auto',
                }}>
                    {isLoading
                        ? Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="shimmer" style={{
                                height: 52, borderRadius: 8,
                                background: 'rgba(255,255,255,0.04)',
                            }} />
                        ))
                        : allLogs.map((log: any, i: number) => {
                            const lvl = LEVEL[log.level] ?? LEVEL.INFO;
                            const LvlIcon = lvl.icon;
                            const stageColor = STAGE_COLOR[log.stage] ?? '#64748B';

                            return (
                                <div
                                    key={i}
                                    style={{
                                        display: 'flex', alignItems: 'flex-start', gap: 12,
                                        padding: '9px 13px',
                                        borderRadius: 8,
                                        background: lvl.bg,
                                        border: `1px solid ${lvl.border}`,
                                        transition: 'opacity 0.2s',
                                    }}
                                >
                                    <LvlIcon size={13} color={lvl.color} style={{ marginTop: 1, flexShrink: 0 }} />

                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                                            <span style={{
                                                fontSize: 10, fontWeight: 800,
                                                color: stageColor,
                                                fontFamily: 'monospace',
                                                background: `${stageColor}18`,
                                                padding: '1px 7px', borderRadius: 4,
                                                border: `1px solid ${stageColor}30`,
                                            }}>
                                                {log.stage}
                                            </span>
                                            <span style={{ fontSize: 10, color: '#334155', fontFamily: 'monospace' }}>
                                                +{(log.durationMs ?? 0).toLocaleString()}ms
                                            </span>
                                            {log.runId && log.runId !== 'run-demo' && (
                                                <span style={{ fontSize: 9, color: '#334155', fontFamily: 'monospace' }}>
                                                    run:{log.runId.slice(0, 8)}
                                                </span>
                                            )}
                                        </div>
                                        <div style={{
                                            fontSize: 12, color: '#CBD5E1',
                                            fontFamily: 'monospace',
                                            lineHeight: 1.5,
                                            wordBreak: 'break-word',
                                        }}>
                                            {log.message}
                                        </div>
                                    </div>

                                    <div style={{ flexShrink: 0, textAlign: 'right' }}>
                                        <div style={{ fontSize: 10, color: '#334155', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>
                                            {log.timestamp
                                                ? new Date(log.timestamp).toLocaleTimeString('en-IN')
                                                : '—'}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                </div>
            </div>

            {/* ── PS-06 Compliance note ─────────────────────────── */}
            <div style={{
                display: 'flex', alignItems: 'flex-start', gap: 12,
                background: 'rgba(13,115,119,0.05)',
                border: '1px solid rgba(13,115,119,0.15)',
                borderRadius: 10, padding: '12px 16px',
            }}>
                <CheckCircle size={14} color="#0D7377" style={{ marginTop: 1, flexShrink: 0 }} />
                <div style={{ fontSize: 11, color: '#64748B', lineHeight: 1.7 }}>
                    <strong style={{ color: '#0D7377' }}>PS-06 R6 — Pipeline Log Compliance:</strong> All ingestion,
                    detection, and enrichment steps are stored as structured{' '}
                    <code style={{ fontSize: 10, background: '#F1F5F9', padding: '1px 5px', borderRadius: 3 }}>
                        ProcessingLog
                    </code>{' '}
                    documents in MongoDB with stage, level, durationMs, and runId.
                    The GEE pipeline (<code style={{ fontSize: 10, background: '#F1F5F9', padding: '1px 5px', borderRadius: 3 }}>gee_runner.py</code>) logs every step:
                    INIT → GEE → INGEST → DETECT → ENRICH → OUTPUT.
                    Available via <code style={{ fontSize: 10, background: '#F1F5F9', padding: '1px 5px', borderRadius: 3 }}>
                        GET /api/pipeline/logs
                    </code>.
                </div>
            </div>
        </div>
    );
}
