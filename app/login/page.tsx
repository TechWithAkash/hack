'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Satellite, Eye, EyeOff, ArrowRight, Shield, Lock, Sparkles } from 'lucide-react';

const DEMO_EMAIL = 'admin@netra.ai';
const DEMO_PASS = 'netra2026';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const fillDemo = () => {
        setEmail(DEMO_EMAIL);
        setPassword(DEMO_PASS);
        setError('');
    };

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        setTimeout(() => {
            if (email === DEMO_EMAIL && password === DEMO_PASS) {
                router.push('/dashboard');
            } else {
                setError('Invalid credentials. Use the demo account below.');
                setLoading(false);
            }
        }, 1200);
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: '#060B14',
            display: 'flex',
            position: 'relative',
            overflow: 'hidden',
            fontFamily: "'Inter', sans-serif",
        }}>
            {/* Background grid */}
            <div style={{
                position: 'absolute', inset: 0,
                backgroundImage: `linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`,
                backgroundSize: '50px 50px',
            }} />

            {/* Glow effects */}
            <div style={{
                position: 'absolute', top: '20%', left: '30%',
                width: 400, height: 400,
                background: 'radial-gradient(circle, rgba(13,115,119,0.15) 0%, transparent 70%)',
                filter: 'blur(60px)',
            }} />
            <div style={{
                position: 'absolute', bottom: '10%', right: '20%',
                width: 300, height: 300,
                background: 'radial-gradient(circle, rgba(34,211,238,0.1) 0%, transparent 70%)',
                filter: 'blur(50px)',
            }} />

            {/* Left Panel — Branding */}
            <div style={{
                flex: 1,
                display: 'flex', flexDirection: 'column', justifyContent: 'center',
                padding: '60px 60px 60px 80px',
                position: 'relative', zIndex: 1,
            }}>
                {/* Logo */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 48 }}>
                    <div style={{
                        width: 44, height: 44, borderRadius: 12,
                        background: 'linear-gradient(135deg, #0D7377, #14A5AA)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 0 24px rgba(13,115,119,0.4)',
                    }}>
                        <Satellite size={20} color="white" />
                    </div>
                    <div>
                        <div style={{ fontWeight: 900, fontSize: 20, color: '#fff', letterSpacing: '-0.02em' }}>
                            NETRA<span style={{ color: '#14A5AA' }}>.AI</span>
                        </div>
                        <div style={{ fontSize: 10, color: '#14A5AA', fontWeight: 700, letterSpacing: '0.12em' }}>
                            INTELLIGENCE ENGINE
                        </div>
                    </div>
                </div>

                <h1 style={{
                    fontSize: 'clamp(32px, 4vw, 48px)',
                    fontWeight: 900, color: '#fff',
                    lineHeight: 1.15, letterSpacing: '-0.03em',
                    margin: '0 0 20px 0',
                }}>
                    Satellite-Derived<br />
                    <span style={{
                        background: 'linear-gradient(135deg, #14A5AA, #22D3EE)',
                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                    }}>
                        Climate Risk Intelligence
                    </span>
                </h1>

                <p style={{
                    fontSize: 16, color: 'rgba(255,255,255,0.45)',
                    lineHeight: 1.7, maxWidth: 420, margin: 0,
                }}>
                    Real-time flood detection powered by Sentinel-1 SAR, Google Earth Engine, and Bayesian risk scoring — built for PS-06.
                </p>

                {/* Trust badges */}
                <div style={{ display: 'flex', gap: 24, marginTop: 48 }}>
                    {[
                        { icon: Shield, label: 'SAR + Optical Fusion' },
                        { icon: Lock, label: 'Audit-Grade Provenance' },
                        { icon: Sparkles, label: 'AI Risk Scoring' },
                    ].map((b, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <b.icon size={14} color="#14A5AA" />
                            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>
                                {b.label}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Right Panel — Login Form */}
            <div style={{
                width: 480, display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '40px 48px',
                position: 'relative', zIndex: 1,
            }}>
                <div style={{
                    width: '100%', maxWidth: 380,
                    background: 'rgba(255,255,255,0.04)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 24, padding: '40px 32px',
                    boxShadow: '0 25px 50px rgba(0,0,0,0.4)',
                }}>
                    <h2 style={{
                        fontSize: 22, fontWeight: 800, color: '#fff',
                        letterSpacing: '-0.02em', margin: '0 0 6px 0',
                    }}>
                        Welcome back
                    </h2>
                    <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', margin: '0 0 32px 0', fontWeight: 500 }}>
                        Sign in to access the dashboard
                    </p>

                    <form onSubmit={handleLogin}>
                        {/* Email */}
                        <div style={{ marginBottom: 16 }}>
                            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.5)', marginBottom: 8, letterSpacing: '0.05em' }}>
                                EMAIL
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="admin@netra.ai"
                                required
                                style={{
                                    width: '100%', padding: '12px 16px',
                                    background: 'rgba(255,255,255,0.06)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: 12, color: '#fff', fontSize: 14,
                                    outline: 'none', transition: 'border 0.2s',
                                    boxSizing: 'border-box',
                                }}
                                onFocus={e => e.currentTarget.style.borderColor = '#0D7377'}
                                onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}
                            />
                        </div>

                        {/* Password */}
                        <div style={{ marginBottom: 24 }}>
                            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.5)', marginBottom: 8, letterSpacing: '0.05em' }}>
                                PASSWORD
                            </label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type={showPass ? 'text' : 'password'}
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    style={{
                                        width: '100%', padding: '12px 44px 12px 16px',
                                        background: 'rgba(255,255,255,0.06)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: 12, color: '#fff', fontSize: 14,
                                        outline: 'none', transition: 'border 0.2s',
                                        boxSizing: 'border-box',
                                    }}
                                    onFocus={e => e.currentTarget.style.borderColor = '#0D7377'}
                                    onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPass(!showPass)}
                                    style={{
                                        position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                                        background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                                    }}
                                >
                                    {showPass
                                        ? <EyeOff size={16} color="rgba(255,255,255,0.35)" />
                                        : <Eye size={16} color="rgba(255,255,255,0.35)" />
                                    }
                                </button>
                            </div>
                        </div>

                        {/* Error */}
                        {error && (
                            <div style={{
                                fontSize: 12, color: '#EF4444', fontWeight: 600,
                                background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
                                borderRadius: 10, padding: '10px 14px', marginBottom: 16,
                            }}>
                                {error}
                            </div>
                        )}

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                width: '100%', padding: '13px 0',
                                background: loading
                                    ? 'rgba(13,115,119,0.5)'
                                    : 'linear-gradient(135deg, #0D7377, #14A5AA)',
                                color: '#fff', border: 'none', borderRadius: 12,
                                fontSize: 14, fontWeight: 800, cursor: loading ? 'not-allowed' : 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                boxShadow: '0 4px 20px rgba(13,115,119,0.3)',
                                transition: 'all 0.2s',
                            }}
                        >
                            {loading ? (
                                <div style={{
                                    width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)',
                                    borderTopColor: '#fff', borderRadius: '50%',
                                    animation: 'spin 0.6s linear infinite',
                                }} />
                            ) : (
                                <>Sign In <ArrowRight size={16} /></>
                            )}
                        </button>
                    </form>

                    {/* Demo credentials */}
                    <div style={{
                        marginTop: 24, padding: '16px 18px',
                        background: 'rgba(13,115,119,0.08)',
                        border: '1px solid rgba(13,115,119,0.2)',
                        borderRadius: 14,
                    }}>
                        <div style={{
                            fontSize: 9, fontWeight: 900, color: '#14A5AA',
                            letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 10,
                        }}>
                            🔑 Demo Credentials
                        </div>
                        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginBottom: 4 }}>
                            <strong style={{ color: 'rgba(255,255,255,0.8)' }}>Email:</strong> {DEMO_EMAIL}
                        </div>
                        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginBottom: 12 }}>
                            <strong style={{ color: 'rgba(255,255,255,0.8)' }}>Password:</strong> {DEMO_PASS}
                        </div>
                        <button
                            type="button"
                            onClick={fillDemo}
                            style={{
                                width: '100%', padding: '9px 0',
                                background: 'rgba(13,115,119,0.15)',
                                border: '1px solid rgba(13,115,119,0.3)',
                                borderRadius: 10, color: '#14A5AA',
                                fontSize: 12, fontWeight: 700, cursor: 'pointer',
                                transition: 'all 0.15s',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(13,115,119,0.25)'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(13,115,119,0.15)'; }}
                        >
                            Click to Insert Demo Credentials
                        </button>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                input::placeholder { color: rgba(255,255,255,0.2); }
            `}</style>
        </div>
    );
}
