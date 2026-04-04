'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useStudio } from '@/components/studio/StudioContext';
import { Send, Bot, User, Sparkles, Zap, AlertTriangle, BarChart3, Shield, Loader2, CheckCircle2 } from 'lucide-react';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

const QUICK_PROMPTS = [
    { label: 'RISK SUMMARY', icon: <Sparkles size={10} />, prompt: 'Generate a brief executive risk summary mentioning flood area and population at risk.' },
    { label: 'FLOOD IMPACT', icon: <AlertTriangle size={10} />, prompt: 'Analyze the flood detection results. How severe is the inundation?' },
    { label: 'POPULATION', icon: <BarChart3 size={10} />, prompt: 'What demographic impact is observed? Outline emergency priorities.' },
    { label: 'AGRI DAMAGE', icon: <Zap size={10} />, prompt: 'Analyze the vegetation loss. What are the agricultural implications?' },
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

    const renderContent = (content: string) => {
        let html = content
            .replace(/\*\*(.*?)\*\*/g, '<strong style="color:#0F172A">$1</strong>')
            .replace(/\*(.*?)\*/g, '<em style="color:#475569">$1</em>')
            .replace(/^###\s+(.*$)/gm, '<div style="font-size:12px;font-weight:800;margin:12px 0 4px;color:#0F172A;letter-spacing:-0.01em">$1</div>')
            .replace(/^##\s+(.*$)/gm, '<div style="font-size:13px;font-weight:800;margin:14px 0 6px;color:#0F172A;letter-spacing:-0.02em">$1</div>')
            .replace(/^#\s+(.*$)/gm, '<div style="font-size:14px;font-weight:900;margin:16px 0 8px;color:#0F172A;letter-spacing:-0.02em">$1</div>')
            .replace(/^[-*]\s+(.*$)/gm, '<div style="display:flex;align-items:flex-start;gap:6px;margin:4px 0;padding-left:2px"><span style="color:#0D7377;font-weight:900;font-size:14px;line-height:1.2;">•</span><span style="flex:1;line-height:1.5;color:#334155">$1</span></div>')
            .replace(/^(\d+)\.\s+(.*$)/gm, '<div style="display:flex;align-items:flex-start;gap:6px;margin:4px 0;padding-left:2px"><span style="color:#0D7377;font-weight:800;font-size:12px;line-height:1.5;min-width:14px;">$1.</span><span style="flex:1;line-height:1.5;color:#334155">$2</span></div>');

        html = html.replace(/<\/div>\s*\n+/g, '</div>');
        html = html.replace(/\n\n+/g, '<div style="height:10px"></div>');
        html = html.replace(/\n/g, '<br/>');

        return html;
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '20px 24px', gap: 16, boxSizing: 'border-box' }}>
            {/* Header */}
            <div style={{ flexShrink: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 3 }}>
                    <Bot size={13} color="#0D7377" />
                    <h2 style={{ fontSize: 15, fontWeight: 800, color: '#0F172A', letterSpacing: '-0.01em', margin: 0 }}>
                        Intelligence Engine
                    </h2>
                </div>
                <p style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#94A3B8', fontWeight: 500, margin: 0 }}>
                    Powered by GROQ · LLAMA 3.3 70B
                    {results && <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#10B981', background: '#F0FDF4', padding: '1px 6px', borderRadius: 4, border: '1px solid #BBF7D0', fontWeight: 700 }}><CheckCircle2 size={10} /> Data Context Loaded</span>}
                </p>
            </div>

            {/* Chat Container */}
            <div style={{
                position: 'relative', flex: 1, minHeight: 0,
                borderRadius: 16, overflow: 'hidden',
                border: '1px solid #E2E8F0', background: '#FFFFFF',
                display: 'flex', flexDirection: 'column'
            }}>
                {/* Header Strip inside chat container for streaming indicator/styling */}
                {streaming && (
                    <div style={{
                        position: 'absolute', top: 0, left: 0, right: 0, height: 2,
                        background: 'linear-gradient(90deg, #0D7377, #14B8A6, #0D7377)',
                        backgroundSize: '200% 100%',
                        animation: 'gradientMove 1.5s linear infinite',
                        zIndex: 10
                    }}>
                        <style>{`@keyframes gradientMove { 0% { background-position: 100% 0; } 100% { background-position: -100% 0; } }`}</style>
                    </div>
                )}
                
                {/* Scrollable Messages Area */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '24px 24px', display: 'flex', flexDirection: 'column', gap: 18 }}>
                    {messages.length === 0 ? (
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14 }}>
                            <div style={{
                                width: 48, height: 48, borderRadius: 12,
                                background: '#F8FAFC', border: '1px solid #E2E8F0',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: '#0D7377'
                            }}>
                                <Bot size={22} />
                            </div>
                            <div style={{ textAlign: 'center', maxWidth: 360 }}>
                                <p style={{ fontSize: 13, fontWeight: 800, color: '#0F172A', marginBottom: 4 }}>
                                    How can I help you analyze the data?
                                </p>
                                <p style={{ fontSize: 11, color: '#64748B', lineHeight: 1.6 }}>
                                    I am an AI assistant integrated with the pipeline results. 
                                    I can help synthesize damage reports and summarize metrics.
                                </p>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 8, width: '100%', maxWidth: 400 }}>
                                {QUICK_PROMPTS.map((qp, i) => (
                                    <button
                                        key={i}
                                        onClick={() => sendMessage(qp.prompt)}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: 6,
                                            background: '#FFFFFF',
                                            border: '1px solid #E2E8F0',
                                            borderRadius: 10, padding: '10px 12px',
                                            fontSize: 10, fontWeight: 700, color: '#475569',
                                            cursor: 'pointer', transition: 'all 0.15s',
                                            textAlign: 'left'
                                        }}
                                        onMouseEnter={e => {
                                            e.currentTarget.style.borderColor = '#0D7377';
                                            e.currentTarget.style.color = '#0D7377';
                                        }}
                                        onMouseLeave={e => {
                                            e.currentTarget.style.borderColor = '#E2E8F0';
                                            e.currentTarget.style.color = '#475569';
                                        }}
                                    >
                                        <div style={{ color: '#0D7377' }}>{qp.icon}</div>
                                        {qp.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        messages.map((msg, i) => (
                            <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
                                {msg.role === 'assistant' && (
                                    <div style={{
                                        width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
                                        background: '#0F172A', color: '#14B8A6',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                                    }}>
                                        <Bot size={13} />
                                    </div>
                                )}
                                <div style={{
                                    padding: '12px 14px',
                                    background: msg.role === 'assistant' ? '#FFFFFF' : '#0D7377',
                                    borderRadius: msg.role === 'assistant' ? '2px 14px 14px 14px' : '14px 2px 14px 14px',
                                    border: msg.role === 'assistant' ? '1px solid #E2E8F0' : 'none',
                                    fontSize: 12, lineHeight: 1.6, color: msg.role === 'assistant' ? '#1E293B' : '#FFFFFF',
                                    minWidth: 40,
                                    boxShadow: msg.role === 'assistant' ? '0 1px 3px rgba(0,0,0,0.02)' : '0 2px 5px rgba(13,115,119,0.2)'
                                }}>
                                    {msg.role === 'assistant' ? (
                                        msg.content ? (
                                            <div dangerouslySetInnerHTML={{ __html: renderContent(msg.content) }} />
                                        ) : (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#94A3B8', fontSize: 11 }}>
                                                <Loader2 size={12} className="animate-spin" /> Thinking...
                                            </div>
                                        )
                                    ) : (
                                        <span style={{ fontWeight: 500 }}>{msg.content}</span>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                    <div ref={chatEndRef} />
                </div>

                {/* Input Strip Pinned Bottom */}
                <div style={{ padding: '16px 20px', background: '#F8FAFC', borderTop: '1px solid #E2E8F0' }}>
                    <div style={{ display: 'flex', gap: 10, position: 'relative' }}>
                        <input
                            type="text"
                            placeholder={results ? "Ask a question about the analysis..." : "Load pipeline data to ask context-aware questions..."}
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && !streaming && sendMessage()}
                            disabled={streaming}
                            style={{
                                flex: 1, background: '#FFFFFF',
                                border: '1px solid #CBD5E1', borderRadius: 12,
                                padding: '10px 14px', paddingRight: 44,
                                fontSize: 12, outline: 'none',
                                color: '#0F172A',
                                boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
                                transition: 'border-color 0.2s'
                            }}
                            onFocus={e => e.target.style.borderColor = '#0D7377'}
                            onBlur={e => e.target.style.borderColor = '#CBD5E1'}
                        />
                        <button
                            onClick={() => sendMessage()}
                            disabled={streaming || !query.trim()}
                            style={{
                                position: 'absolute', right: 5, top: 5, bottom: 5, width: 32,
                                background: streaming || !query.trim() ? '#E2E8F0' : '#0F172A',
                                color: streaming || !query.trim() ? '#94A3B8' : '#FFFFFF', 
                                border: 'none', borderRadius: 8,
                                cursor: streaming || !query.trim() ? 'not-allowed' : 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                transition: 'all 0.2s'
                            }}
                        >
                            {streaming ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
