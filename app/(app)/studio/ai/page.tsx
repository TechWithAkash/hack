'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useStudio } from '@/components/studio/StudioContext';
import { Send, Bot, User, Sparkles, Zap, AlertTriangle, BarChart3, Shield, Loader2 } from 'lucide-react';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

const QUICK_PROMPTS = [
    { label: 'FULL RISK ANALYSIS', icon: <Sparkles size={10} />, prompt: 'Generate a comprehensive executive risk summary with all metrics, environmental analysis, and actionable recommendations.' },
    { label: 'FLOOD ASSESSMENT', icon: <AlertTriangle size={10} />, prompt: 'Analyze the flood detection results in detail. What do the SAR backscatter anomalies indicate about the severity and extent of flooding?' },
    { label: 'POPULATION IMPACT', icon: <BarChart3 size={10} />, prompt: 'Provide a detailed demographic impact analysis. How many people are at risk and what emergency response actions should be taken?' },
    { label: 'VEGETATION DAMAGE', icon: <Zap size={10} />, prompt: 'Analyze the NDVI vegetation loss data. What does the crop damage look like and what are the agricultural implications?' },
    { label: 'CONFIDENCE REPORT', icon: <Shield size={10} />, prompt: 'Evaluate the model confidence and data quality. How reliable are these findings and what are the limitations?' },
];

export default function GenerativeAIPage() {
    const { results } = useStudio();
    const [messages, setMessages] = useState<Message[]>([]);
    const [query, setQuery] = useState('');
    const [streaming, setStreaming] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const sendMessage = async (text?: string) => {
        const input = text || query.trim();
        if (!input || streaming) return;

        const userMsg: Message = { role: 'user', content: input };
        const newMessages = [...messages, userMsg];
        setMessages(newMessages);
        setQuery('');
        setStreaming(true);

        // Add empty assistant message for streaming
        const assistantMsg: Message = { role: 'assistant', content: '' };
        setMessages([...newMessages, assistantMsg]);

        try {
            const res = await fetch('/api/studio/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: newMessages,
                    results: results || null,
                }),
            });

            if (!res.ok) {
                const err = await res.json();
                setMessages(prev => {
                    const updated = [...prev];
                    updated[updated.length - 1] = {
                        role: 'assistant',
                        content: `⚠️ Error: ${err.error || 'Failed to get response'}`,
                    };
                    return updated;
                });
                setStreaming(false);
                return;
            }

            const reader = res.body?.getReader();
            const decoder = new TextDecoder();
            let fullContent = '';

            if (reader) {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    const chunk = decoder.decode(value, { stream: true });
                    const lines = chunk.split('\n').filter(l => l.startsWith('data: '));

                    for (const line of lines) {
                        const data = line.slice(6);
                        if (data === '[DONE]') break;
                        try {
                            const parsed = JSON.parse(data);
                            fullContent += parsed.content;
                            setMessages(prev => {
                                const updated = [...prev];
                                updated[updated.length - 1] = {
                                    role: 'assistant',
                                    content: fullContent,
                                };
                                return updated;
                            });
                        } catch { }
                    }
                }
            }
        } catch (err: any) {
            setMessages(prev => {
                const updated = [...prev];
                updated[updated.length - 1] = {
                    role: 'assistant',
                    content: `⚠️ Network error: ${err.message}`,
                };
                return updated;
            });
        } finally {
            setStreaming(false);
        }
    };

    // Simple markdown-like rendering
    const renderContent = (content: string) => {
        let html = content
            .replace(/\*\*(.*?)\*\*/g, '<strong style="color:#0F172A">$1</strong>')
            .replace(/\*(.*?)\*/g, '<em style="color:#475569">$1</em>')
            .replace(/^###\s+(.*$)/gm, '<div style="font-size:14px;font-weight:800;margin:18px 0 6px;color:#0F172A;letter-spacing:-0.01em">$1</div>')
            .replace(/^##\s+(.*$)/gm, '<div style="font-size:16px;font-weight:800;margin:22px 0 8px;color:#0F172A;letter-spacing:-0.02em">$1</div>')
            .replace(/^#\s+(.*$)/gm, '<div style="font-size:18px;font-weight:900;margin:26px 0 10px;color:#0F172A;letter-spacing:-0.02em">$1</div>')
            .replace(/^[-*]\s+(.*$)/gm, '<div style="display:flex;align-items:flex-start;gap:8px;margin:8px 0;padding-left:4px"><span style="color:#0EA5E9;font-weight:900;font-size:16px;line-height:1.2;">•</span><span style="flex:1;line-height:1.6;color:#334155">$1</span></div>')
            .replace(/^(\d+)\.\s+(.*$)/gm, '<div style="display:flex;align-items:flex-start;gap:8px;margin:8px 0;padding-left:4px"><span style="color:#0EA5E9;font-weight:800;font-size:13px;line-height:1.6;min-width:16px;">$1.</span><span style="flex:1;line-height:1.6;color:#334155">$2</span></div>');

        // Clean up newlines immediately following our custom divs to prevent empty <br/> injections
        html = html.replace(/<\/div>\s*\n+/g, '</div>');

        // Handle double newlines as paragraph breaks
        html = html.replace(/\n\n+/g, '<div style="height:12px"></div>');

        // Handle single newlines as line breaks
        html = html.replace(/\n/g, '<br/>');

        return html;
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
            <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                background: '#FFFFFF',
                overflow: 'hidden',
                minHeight: 0
            }}>
                {/* Header */}
                <div style={{
                    padding: '16px 24px',
                    borderBottom: '1px solid rgba(226, 232, 240, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    background: 'rgba(255, 255, 255, 0.6)'
                }}>
                    <div style={{
                        width: 32, height: 32, borderRadius: 10,
                        background: '#0F172A', color: '#14B8A6',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        <Bot size={16} />
                    </div>
                    <div>
                        <div style={{ fontSize: 13, fontWeight: 900, color: '#0F172A' }}>
                            NETRA.AI Intelligence Engine
                        </div>
                        <div style={{ fontSize: 9, fontWeight: 700, color: '#64748B', letterSpacing: '0.05em' }}>
                            GROQ · LLAMA 3.3 70B · {results ? '● PIPELINE DATA LOADED' : '○ AWAITING PIPELINE DATA'}
                        </div>
                    </div>
                    {streaming && (
                        <div style={{
                            marginLeft: 'auto',
                            display: 'flex', alignItems: 'center', gap: 6,
                            fontSize: 10, fontWeight: 800, color: '#14B8A6',
                            background: 'rgba(20, 184, 166, 0.08)',
                            padding: '4px 10px', borderRadius: 8,
                            border: '1px solid rgba(20, 184, 166, 0.15)'
                        }}>
                            <Loader2 size={10} className="animate-spin" /> STREAMING
                        </div>
                    )}
                </div>

                {/* Chat Area */}
                <div style={{ flex: 1, overflowY: 'auto', padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
                    {messages.length === 0 ? (
                        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
                            <div style={{
                                width: 64, height: 64, borderRadius: 20,
                                background: 'linear-gradient(135deg, #0F172A, #1E293B)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                boxShadow: '0 12px 32px rgba(15, 23, 42, 0.15)'
                            }}>
                                <Bot size={28} style={{ color: '#14B8A6' }} />
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <p style={{ fontSize: 16, fontWeight: 900, color: '#0F172A', marginBottom: 4 }}>
                                    Climate Risk Intelligence Assistant
                                </p>
                                <p style={{ fontSize: 12, color: '#64748B', maxWidth: 400, lineHeight: 1.6 }}>
                                    Ask me anything about the satellite analysis results — flood assessment,
                                    population impact, vegetation damage, or risk recommendations.
                                </p>
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginTop: 8 }}>
                                {QUICK_PROMPTS.map((qp, i) => (
                                    <button
                                        key={i}
                                        onClick={() => sendMessage(qp.prompt)}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: 6,
                                            background: 'rgba(13, 115, 119, 0.05)',
                                            border: '1px solid rgba(13, 115, 119, 0.12)',
                                            borderRadius: 10, padding: '8px 14px',
                                            fontSize: 10, fontWeight: 800, color: '#0D7377',
                                            cursor: 'pointer', transition: 'all 0.2s'
                                        }}
                                        onMouseOver={e => { e.currentTarget.style.background = 'rgba(13,115,119,0.1)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                                        onMouseOut={e => { e.currentTarget.style.background = 'rgba(13,115,119,0.05)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                                    >
                                        {qp.icon} {qp.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        messages.map((msg, i) => (
                            <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                                <div style={{
                                    width: 32, height: 32, borderRadius: 10, flexShrink: 0,
                                    background: msg.role === 'assistant' ? '#0F172A' : '#F1F5F9',
                                    color: msg.role === 'assistant' ? '#14B8A6' : '#0F172A',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}>
                                    {msg.role === 'assistant' ? <Bot size={16} /> : <User size={16} />}
                                </div>
                                <div style={{
                                    padding: '14px 18px',
                                    background: msg.role === 'assistant' ? '#FFFFFF' : 'rgba(15, 23, 42, 0.03)',
                                    borderRadius: 14,
                                    border: msg.role === 'assistant' ? '1px solid #E2E8F0' : '1px solid rgba(15, 23, 42, 0.06)',
                                    fontSize: 13, lineHeight: 1.7, color: '#1E293B',
                                    maxWidth: '85%', minWidth: 60,
                                    boxShadow: msg.role === 'assistant' ? '0 2px 8px rgba(0,0,0,0.03)' : 'none'
                                }}>
                                    {msg.role === 'assistant' ? (
                                        msg.content ? (
                                            <div dangerouslySetInnerHTML={{ __html: renderContent(msg.content) }} />
                                        ) : (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#94A3B8', fontSize: 12 }}>
                                                <Loader2 size={14} className="animate-spin" /> Thinking...
                                            </div>
                                        )
                                    ) : (
                                        <span style={{ fontWeight: 600 }}>{msg.content}</span>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                    <div ref={chatEndRef} />
                </div>

                {/* Input Area */}
                <div style={{ padding: '16px 24px', background: '#FFF', borderTop: '1px solid #F1F5F9' }}>
                    <div style={{ display: 'flex', gap: 10, position: 'relative' }}>
                        <input
                            type="text"
                            placeholder="Ask about flood risk, vegetation damage, population impact..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && !streaming && sendMessage()}
                            disabled={streaming}
                            style={{
                                flex: 1, background: '#F8FAFC',
                                border: '1px solid #E2E8F0', borderRadius: 14,
                                padding: '12px 18px', paddingRight: 52,
                                fontSize: 13, fontWeight: 600, outline: 'none',
                                opacity: streaming ? 0.6 : 1
                            }}
                        />
                        <button
                            onClick={() => sendMessage()}
                            disabled={streaming || !query.trim()}
                            style={{
                                position: 'absolute', right: 6, top: 6, bottom: 6, width: 36,
                                background: streaming ? '#94A3B8' : '#0F172A',
                                color: '#FFF', border: 'none', borderRadius: 10,
                                cursor: streaming ? 'wait' : 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                transition: 'all 0.2s'
                            }}
                        >
                            {streaming ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                        </button>
                    </div>
                    {messages.length > 0 && (
                        <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
                            {QUICK_PROMPTS.slice(0, 3).map((qp, i) => (
                                <button
                                    key={i}
                                    onClick={() => sendMessage(qp.prompt)}
                                    disabled={streaming}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: 5,
                                        background: 'rgba(13, 115, 119, 0.04)',
                                        border: '1px solid rgba(13, 115, 119, 0.1)',
                                        borderRadius: 8, padding: '5px 10px',
                                        fontSize: 9, fontWeight: 800, color: '#0D7377',
                                        cursor: streaming ? 'not-allowed' : 'pointer',
                                        opacity: streaming ? 0.5 : 1
                                    }}
                                >
                                    {qp.icon} {qp.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
