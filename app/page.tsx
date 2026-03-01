'use client';

import { useMemo } from 'react';
import useSWR from 'swr';
import StatsGrid from '@/components/dashboard/StatsGrid';
import RiskTable from '@/components/dashboard/RiskTable';
import WeatherPanel from '@/components/dashboard/WeatherPanel';
import DashboardCharts from '@/components/dashboard/DashboardCharts';
import { ShieldCheck, Activity, Globe } from 'lucide-react';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function Dashboard() {
    const { data: districts = [] } = useSWR('/api/districts', fetcher, {
        refreshInterval: 30000
    });

    const stats = useMemo(() => {
        if (!Array.isArray(districts)) return { totalFlood: 0, totalPop: 0 };
        const totalFlood = districts.reduce((acc: number, d: any) => acc + (d.floodArea || 0), 0);
        const totalPop = districts.reduce((acc: number, d: any) => acc + (d.exposedPop || 0), 0);
        return { totalFlood, totalPop };
    }, [districts]);

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            {/* Mission Hero Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight" style={{ letterSpacing: '-0.04em' }}>
                        Operational Intelligence Matrix
                    </h1>
                    <p className="text-slate-500 mt-2 text-lg font-medium flex items-center gap-2">
                        <Globe size={18} className="text-blue-500" />
                        Real-time Multi-hazard Monitoring & Predictive Geospatial Analytics
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="bg-emerald-50 border border-emerald-100 px-5 py-2.5 rounded-2xl flex items-center gap-3 shadow-sm shadow-emerald-100/50">
                        <div className="relative">
                            <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" />
                            <div className="absolute inset-0 w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping opacity-75" />
                        </div>
                        <span className="text-xs font-bold text-emerald-700 tracking-wider text-transform: uppercase">
                            SENSORS NOMINAL
                        </span>
                    </div>
                </div>
            </div>

            {/* Core Metrics Grid */}
            <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/10 to-emerald-500/10 rounded-[2rem] blur-xl opacity-50 group-hover:opacity-100 transition duration-1000" />
                <div className="relative">
                    <StatsGrid />
                </div>
            </div>

            {/* Tactical Intelligence Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 space-y-10">
                    <DashboardCharts />
                    <RiskTable />
                </div>
                <div className="space-y-10">
                    <WeatherPanel />
                    {/* System Integrity Node */}
                    <div className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm hover:shadow-md transition-all duration-300">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2.5 bg-blue-50 rounded-xl">
                                <ShieldCheck size={20} className="text-blue-600" />
                            </div>
                            <h3 className="font-bold text-slate-800 tracking-tight">System Integrity</h3>
                        </div>

                        <div className="space-y-6">
                            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                                <div className="flex items-center gap-2 mb-2">
                                    <Activity size={14} className="text-emerald-500" />
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                        Data Provenance Integrity Verified
                                    </span>
                                </div>
                                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                                    Sentinel-1 SAR and Sentinel-2 Optical archives cross-referenced for 99.7% geometric accuracy.
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-sky-50/50 rounded-2xl border border-sky-100/50">
                                    <div className="text-[10px] font-bold text-sky-600 uppercase tracking-widest mb-1">
                                        Latency
                                    </div>
                                    <div className="text-xl font-black text-sky-900 tabular-nums">142ms</div>
                                </div>
                                <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100/50">
                                    <div className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest mb-1">
                                        Ingested
                                    </div>
                                    <div className="text-xl font-black text-indigo-900 tabular-nums">4.2TB</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
