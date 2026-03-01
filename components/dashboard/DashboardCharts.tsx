'use client';

import React from 'react';
import {
    ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
    LineChart, Line
} from 'recharts';
import { Activity, Shield, Zap, Target, MapPin } from 'lucide-react';

const COLORS = ['#0D7377', '#14A5AA', '#F97316', '#3B82F6', '#6366F1', '#EC4899'];

// --- Image Processing (Bar Chart) ---
export function ImageProcessingChart({ data }: { data: any[] }) {
    return (
        <div className="operational-card" style={{ padding: '24px' }}>
            <ChartHeader icon={<Activity size={18} />} title="Cloud Coverage Analytics" desc="Processed vs. obscured monitoring targets" />
            <div style={{ height: 220, width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} margin={{ top: 20, right: 30, left: -20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }} />
                        <Tooltip contentStyle={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }} />
                        <Bar dataKey="processed" name="Clear Sky" fill="#0D7377" radius={[4, 4, 0, 0]} barSize={12} />
                        <Bar dataKey="flagged" name="Cloud Obscured" fill="#F43F5E" radius={[4, 4, 0, 0]} barSize={12} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
            <ChartLegend items={[{ label: 'Clear Sky', color: '#0D7377' }, { label: 'Cloud Obscured', color: '#F43F5E' }]} />
        </div>
    );
}

// --- Incident Breakdown (Pie Chart) ---
export function IncidentBreakdownChart({ data }: { data: any[] }) {
    return (
        <div className="operational-card" style={{ padding: '24px' }}>
            <ChartHeader icon={<Zap size={18} />} title="Hydraulic Event Breakdown" desc="Active anomalies by classification" />
            <div style={{ height: 220, width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip contentStyle={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 12 }} />
                    </PieChart>
                </ResponsiveContainer>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 12 }}>
                {data.map((item, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: COLORS[i % COLORS.length] }} />
                        <span style={{ fontSize: 11, fontWeight: 700, color: '#0F172A' }}>{item.name} {item.percentage}%</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

// --- Risk Radar (Radar Chart) ---
export function RiskRadarChart({ data }: { data: any[] }) {
    return (
        <div className="operational-card" style={{ padding: '24px' }}>
            <ChartHeader icon={<Shield size={18} />} title="Environmental Flux Radar" desc="Multi-sensor risk profile by category" />
            <div style={{ height: 220, width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
                        <PolarGrid stroke="#e2e8f0" />
                        <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: '#64748b', fontWeight: 700 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} axisLine={false} tick={false} />
                        <Radar name="Risk" dataKey="A" stroke="#0D7377" fill="#0D7377" fillOpacity={0.3} />
                    </RadarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

// --- ML Performance (Line Chart) ---
export function MLPerformanceChart({ data }: { data: any[] }) {
    return (
        <div className="operational-card" style={{ padding: '24px' }}>
            <ChartHeader icon={<Target size={18} />} title="Fusion Engine Telemetry" desc="Algorithm accuracy vs. detection confidence" />
            <div style={{ height: 220, width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data} margin={{ top: 20, right: 30, left: -20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }} domain={[80, 100]} />
                        <Tooltip contentStyle={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 12 }} />
                        <Line type="monotone" dataKey="accuracy" name="Accuracy %" stroke="#F97316" strokeWidth={3} dot={{ r: 4, fill: '#F97316' }} activeDot={{ r: 6 }} />
                        <Line type="monotone" dataKey="confidence" name="Confidence %" stroke="#0D7377" strokeWidth={3} dot={{ r: 4, fill: '#0D7377' }} activeDot={{ r: 6 }} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
            <ChartLegend items={[{ label: 'Accuracy %', color: '#F97316' }, { label: 'Confidence %', color: '#0D7377' }]} />
        </div>
    );
}

// --- Helpers ---

function ChartHeader({ icon, title, desc }: any) {
    return (
        <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                <div style={{ color: '#0D7377' }}>{icon}</div>
                <h3 style={{ fontSize: 15, fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>{title}</h3>
            </div>
            <p style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>{desc}</p>
        </div>
    );
}

function ChartLegend({ items }: { items: { label: string, color: string }[] }) {
    return (
        <div style={{ display: 'flex', gap: 16, marginTop: 16 }}>
            {items.map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 8, height: 8, borderRadius: 2, background: item.color }} />
                    <span style={{ fontSize: 10, fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>{item.label}</span>
                </div>
            ))}
        </div>
    );
}
