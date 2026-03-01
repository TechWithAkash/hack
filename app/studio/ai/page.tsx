'use client';

import React, { useState } from 'react';
import { useStudio } from '@/components/studio/StudioContext';
import { MessageSquare, Send, Bot, User, Sparkles } from 'lucide-react';

export default function GenerativeAIPage() {
    const { results } = useStudio();
    const [query, setQuery] = useState('');
    const [responses, setResponses] = useState<any[]>([]);

    const generateResponse = () => {
        if (!query.trim()) return;

        const userMsg = { role: 'user', content: query };

        // Mocking the AI logic from cosmeon.py
        let aiContent = '';
        if (!results) {
            aiContent = "I'm sorry, I don't have enough data yet. Please process the study area first using the sidebar.";
        } else {
            const r = results;
            const metrics = r.metrics || {};

            aiContent = `
                <div style="font-family: inherit;">
                    <p style="margin-bottom: 20px;"><strong>EXECUTIVE RISK SUMMARY</strong></p>
                    
                    <p style="margin-bottom: 16px;"><strong>Overall Environmental Conditions:</strong><br/>
                    The system has processed an Area of Interest covering ${(r.aoi_km2 || 0).toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })} km². 
                    Recent temporal trends indicate a severe inundation event resulting in <strong>${(metrics.flood_area || 0).toFixed(1)} km² of standing floodwater</strong>. 
                    Leveraging JRC predictive mapping, ${(metrics.new_flood_anomaly || 0).toFixed(1)} km² of this is anomalous surface water. 
                    The radar backscatter delta highlights persistent water pooling, indicative of sustained drainage failures.</p>
                    
                    <p style="margin-bottom: 16px;"><strong>Demographic & Economic Impact:</strong><br/>
                    Multispectral analysis reveals <strong>${(metrics.ndvi_loss_area || 0).toFixed(1)} km² of critical vegetation damage</strong>, signaling severe crop submergence. 
                    Integration with WorldPop demographic rasters indicates that <strong>${Math.round(metrics.exposed_pop || 0).toLocaleString()} individuals</strong> are directly exposed within the inundation footprint.</p>
                    
                    <p style="margin-bottom: 16px;"><strong>Model Confidence & Telemetry:</strong><br/>
                    The dual-sensor ensemble fusion, reinforced by SRTM slope masking to remove terrain shadows, confirms these findings with a peak probabilistic confidence of <strong>${((metrics.peak_confidence || 0) * 100).toFixed(1)}%</strong>. 
                    The event has been assigned a Severity Index of <strong>${(metrics.severity_score || 0).toFixed(1)}/100</strong> and securely logged in the programmatic State Table for backend retrieval.</p>
                </div>
            `;
        }

        const aiMsg = { role: 'assistant', content: aiContent };
        setResponses([...responses, userMsg, aiMsg]);
        setQuery('');
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 32, height: '100%', minHeight: 0 }}>
            <div>
                <h2 style={{ fontSize: 24, fontWeight: 950, color: '#0F172A', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <MessageSquare size={24} className="text-teal-600" /> Generative Risk Analyst
                </h2>
                <p style={{ fontSize: 13, color: '#64748B', marginTop: 4, fontWeight: 500 }}>
                    Translates satellite metrics into actionable text for rapid stakeholder briefing.
                </p>
            </div>

            <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                background: 'rgba(255, 255, 255, 0.4)',
                borderRadius: 24,
                border: '1px solid rgba(226, 232, 240, 0.6)',
                overflow: 'hidden',
                backdropFilter: 'blur(10px)'
            }}>
                {/* Chat Area */}
                <div style={{ flex: 1, overflowY: 'auto', padding: 32, display: 'flex', flexDirection: 'column', gap: 24 }}>
                    {responses.length === 0 ? (
                        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.5 }}>
                            <Bot size={48} style={{ marginBottom: 16 }} />
                            <p style={{ fontSize: 14, fontWeight: 600 }}>Awaiting your query...</p>
                            <p style={{ fontSize: 12 }}>Try asking: "Generate a full descriptive analysis of the current trends"</p>
                        </div>
                    ) : (
                        responses.map((msg, i) => (
                            <div key={i} style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                                <div style={{
                                    width: 36, height: 36, borderRadius: 12,
                                    background: msg.role === 'assistant' ? '#0F172A' : '#F1F5F9',
                                    color: msg.role === 'assistant' ? '#FFF' : '#0F172A',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    flexShrink: 0
                                }}>
                                    {msg.role === 'assistant' ? <Bot size={18} /> : <User size={18} />}
                                </div>
                                <div style={{
                                    padding: '16px 20px',
                                    background: msg.role === 'assistant' ? '#FFFFFF' : 'rgba(15, 23, 42, 0.03)',
                                    borderRadius: 16,
                                    border: msg.role === 'assistant' ? '1px solid #E2E8F0' : 'none',
                                    fontSize: 14,
                                    lineHeight: 1.6,
                                    color: '#1E293B',
                                    maxWidth: '80%'
                                }}>
                                    <div dangerouslySetInnerHTML={{ __html: msg.content }} />
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Input Area */}
                <div style={{ padding: 24, background: '#FFF', borderTop: '1px solid #F1F5F9' }}>
                    <div style={{ display: 'flex', gap: 12, position: 'relative' }}>
                        <input
                            type="text"
                            placeholder="Ask for insights (e.g., 'Generate a full descriptive analysis of the current trends')"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && generateResponse()}
                            style={{
                                flex: 1,
                                background: '#F8FAFC',
                                border: '1px solid #E2E8F0',
                                borderRadius: 14,
                                padding: '14px 20px',
                                paddingRight: 60,
                                fontSize: 13,
                                fontWeight: 600,
                                outline: 'none'
                            }}
                        />
                        <button
                            onClick={generateResponse}
                            style={{
                                position: 'absolute', right: 8, top: 8, bottom: 8, width: 40,
                                background: '#0F172A', color: '#FFF', border: 'none', borderRadius: 10,
                                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                transition: 'all 0.2s'
                            }}
                        >
                            <Send size={16} />
                        </button>
                    </div>
                    <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
                        <button
                            onClick={() => setQuery("Generate a full descriptive analysis of the current trends")}
                            style={{ background: 'rgba(13, 115, 119, 0.05)', border: '1px solid rgba(13, 115, 119, 0.1)', borderRadius: 8, padding: '6px 12px', fontSize: 10, fontWeight: 800, color: '#0D7377', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
                        >
                            <Sparkles size={10} /> SUGGESTED: FULL ANALYSIS
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
