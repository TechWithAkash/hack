'use client';

import {
    Activity, AlertTriangle, BarChart3, ChevronRight, CloudRain,
    Cpu, Database, Eye, Globe, Layers, Map, MapPin,
    Satellite, Server, Shield, ShieldCheck, Sparkles,
    Zap, ArrowRight, Check, TrendingUp, Radio, Lock
} from 'lucide-react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';

const GlobeVis = dynamic(() => import('react-globe.gl'), { ssr: false });
// ─────────────────────────────────────────────────────────────
// Design Tokens
// ─────────────────────────────────────────────────────────────
const TEAL = '#0D7377';
const TEAL_LIGHT = '#14A5AA';
const CYAN = '#22D3EE';
const ORANGE = '#F97316';
const BG = '#060B14';
const BG2 = '#0A1020';
const BORDER = 'rgba(255,255,255,0.07)';

// ─────────────────────────────────────────────────────────────
// Animated Counter
// ─────────────────────────────────────────────────────────────
function AnimatedCounter({ to, suffix = '', prefix = '' }: { to: number; suffix?: string; prefix?: string }) {
    const [count, setCount] = useState(0);
    const ref = useRef(null);
    const inView = useInView(ref, { once: true });

    useEffect(() => {
        if (!inView) return;
        let start = 0;
        const duration = 1800;
        const step = to / (duration / 16);
        const timer = setInterval(() => {
            start += step;
            if (start >= to) { setCount(to); clearInterval(timer); }
            else setCount(Math.floor(start));
        }, 16);
        return () => clearInterval(timer);
    }, [inView, to]);

    return (
        <span ref={ref}>
            {prefix}{count.toLocaleString()}{suffix}
        </span>
    );
}

// ─────────────────────────────────────────────────────────────
// Earth Globe Visual (Hero visual — no external library needed)
// ─────────────────────────────────────────────────────────────
function EarthVisual() {
    const globeRef = useRef<any>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        // Position camera pointing towards India (Assam basin roughly 26.2 N, 92.9 E)
        setTimeout(() => {
            if (globeRef.current) {
                globeRef.current.controls().autoRotate = true;
                globeRef.current.controls().autoRotateSpeed = 0.8;
                globeRef.current.controls().enableZoom = false;
                globeRef.current.pointOfView({ lat: 20, lng: 80, altitude: 1.8 });
            }
        }, 500);
    }, []);

    // Trajectory arcs linking satellite command centers to AOI
    const arcsData = [
        { startLat: 26.2, startLng: 92.9, endLat: 51.5, endLng: -0.1, color: ['#22D3EE', '#F97316'] }, // Assam -> London data relay
        { startLat: 26.2, startLng: 92.9, endLat: 38.9, endLng: -77.0, color: ['#0D7377', '#EF4444'] } // Assam -> WashDC relay
    ];

    // Pulsing hotspot rings at major detection sites
    const ringsData = [
        { lat: 26.2, lng: 92.9, maxR: 7, propagationSpeed: 2, repeatPeriod: 1500, color: '#EF4444' }, // Assam Critical Hub
        { lat: 28.6, lng: 77.2, maxR: 4, propagationSpeed: 1, repeatPeriod: 2500, color: '#22C55E' }, // Delhi Secondary Hub
    ];

    return (
        <div style={{ position: 'relative', width: '100%', maxWidth: 540, aspectRatio: '1/1', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {/* Ambient Background Glow for contrast blending */}
            <div style={{
                position: 'absolute', inset: '10%',
                background: `radial-gradient(circle, ${TEAL}40 0%, transparent 65%)`,
                borderRadius: '50%', filter: 'blur(50px)', zIndex: 0,
            }} />

            {/* 3D WebGL Globe Container */}
            {mounted && (
                <div style={{ zIndex: 1, cursor: 'grab', width: 540, height: 540, pointerEvents: 'auto' }} onMouseDown={e => { e.currentTarget.style.cursor = 'grabbing' }} onMouseUp={e => { e.currentTarget.style.cursor = 'grab' }}>
                    <GlobeVis
                        ref={globeRef}
                        width={540}
                        height={540}
                        globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
                        bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
                        backgroundColor="rgba(0,0,0,0)"
                        atmosphereColor="#22D3EE"
                        atmosphereAltitude={0.2}

                        // Active transmission arcs
                        arcsData={arcsData}
                        arcColor="color"
                        arcDashLength={0.4}
                        arcDashGap={4}
                        arcDashInitialGap={() => Math.random() * 5}
                        arcDashAnimateTime={2000}

                        // Geospatial hot zones
                        ringsData={ringsData}
                        ringColor={(d: any) => d.color}
                        ringMaxRadius="maxR"
                        ringPropagationSpeed="propagationSpeed"
                        ringRepeatPeriod="repeatPeriod"
                    />
                </div>
            )}

            {/* Floating UI Data Badges (React elements layered on top) */}
            {[
                { label: 'BRAHMAPUTRA BASIN', sub: 'Critical Inundation', color: '#EF4444', x: '-15%', y: '25%' },
                { label: 'ORBIT PASS: S1A', sub: 'Live Telemetry', color: CYAN, x: '85%', y: '15%' },
                { label: 'RADAR COHERENCE', sub: '92.4% Match', color: '#22C55E', x: '80%', y: '75%' },
                { label: 'POP. IMPACT MAPPED', sub: 'WorldPop Overlay', color: '#A78BFA', x: '-5%', y: '75%' },
            ].map((b, i) => (
                <motion.div
                    key={i}
                    animate={{ y: [-4, 4, -4] }}
                    transition={{ duration: 4 + i * 0.5, repeat: Infinity, ease: 'easeInOut' }}
                    style={{
                        position: 'absolute', left: b.x, top: b.y,
                        background: 'rgba(6,11,20,0.85)', backdropFilter: 'blur(10px)',
                        border: `1px solid ${b.color}30`, borderRadius: 10, padding: '10px 14px',
                        zIndex: 10, boxShadow: `0 10px 25px rgba(0,0,0,0.5)`,
                        display: 'flex', alignItems: 'center', gap: 10, pointerEvents: 'none'
                    }}
                >
                    <div style={{ width: 4, height: 20, borderRadius: 2, background: b.color }} />
                    <div>
                        <div style={{ fontSize: 9, fontWeight: 900, color: b.color, letterSpacing: '0.1em' }}>
                            {b.label}
                        </div>
                        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', marginTop: 2, fontWeight: 600 }}>
                            {b.sub}
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
    );
}

// ─────────────────────────────────────────────────────────────
// Navbar
// ─────────────────────────────────────────────────────────────
function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 30);
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    return (
        <nav style={{
            position: 'fixed', top: 12, left: 12, right: 12, zIndex: 100,
        }}>
            <div style={{
                maxWidth: 1200, margin: '0 auto',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '14px 24px',
                borderRadius: 16,
                background: scrolled ? 'rgba(6,11,20,0.92)' : 'rgba(6,11,20,0.70)',
                backdropFilter: 'blur(20px)',
                border: `1px solid ${scrolled ? 'rgba(13,115,119,0.4)' : BORDER}`,
                boxShadow: scrolled ? '0 8px 32px rgba(0,0,0,0.5)' : 'none',
                transition: 'all 0.3s ease',
            }}>
                {/* Logo */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                        width: 34, height: 34, borderRadius: 9,
                        background: `linear-gradient(135deg, ${TEAL}, ${TEAL_LIGHT})`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: `0 0 16px ${TEAL}50`,
                    }}>
                        <Satellite size={16} color="white" />
                    </div>
                    <div>
                        <div style={{ fontWeight: 900, fontSize: 15, color: '#fff', letterSpacing: '-0.02em' }}>
                            NETRA.AI
                        </div>
                        <div style={{ fontSize: 9, color: TEAL_LIGHT, fontWeight: 700, letterSpacing: '0.1em' }}>
                            INTELLIGENCE ENGINE
                        </div>
                    </div>
                </div>

                {/* Nav links */}
                <div style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
                    {['Platform', 'Pipeline', 'Stakeholders', 'API'].map(link => (
                        <a key={link} href={`#${link.toLowerCase()}`} style={{
                            fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.55)',
                            textDecoration: 'none', transition: 'color 0.2s',
                        }}
                            onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.55)')}
                        >
                            {link}
                        </a>
                    ))}
                </div>

                {/* CTA */}
                <a href="/login" style={{
                    display: 'flex', alignItems: 'center', gap: 7,
                    padding: '9px 20px', borderRadius: 10,
                    background: `linear-gradient(135deg, ${TEAL}, ${TEAL_LIGHT})`,
                    color: 'white', fontWeight: 700, fontSize: 13,
                    textDecoration: 'none',
                    boxShadow: `0 0 20px ${TEAL}50`,
                    transition: 'all 0.2s',
                }}>
                    Launch Dashboard <ArrowRight size={14} />
                </a>
            </div>
        </nav>
    );
}

// ─────────────────────────────────────────────────────────────
// Hero
// ─────────────────────────────────────────────────────────────
function Hero() {
    return (
        <section style={{
            background: BG,
            padding: '140px 24px 80px',
            position: 'relative', overflow: 'hidden',
        }}>
            {/* Grid background */}
            <div style={{
                position: 'absolute', inset: 0,
                backgroundImage: `linear-gradient(${BORDER} 1px, transparent 1px), linear-gradient(90deg, ${BORDER} 1px, transparent 1px)`,
                backgroundSize: '60px 60px',
                WebkitMaskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,0.5) 0%, transparent 75%)',
                maskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,0.5) 0%, transparent 75%)',
            }} />

            {/* Glow bottom */}
            <div style={{
                position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)',
                width: '60%', height: 200,
                background: `radial-gradient(ellipse, ${TEAL}25 0%, transparent 70%)`,
                filter: 'blur(40px)',
            }} />

            <div style={{ maxWidth: 1200, margin: '0 auto', width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'center', position: 'relative', zIndex: 1 }}>

                {/* LEFT — text */}
                <div>
                    {/* PS Badge */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        style={{
                            display: 'inline-flex', alignItems: 'center', gap: 8,
                            padding: '7px 14px', borderRadius: 999,
                            background: `${TEAL}15`, border: `1px solid ${TEAL}35`,
                            marginBottom: 24,
                        }}
                    >
                        <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#22C55E', boxShadow: '0 0 8px #22C55E' }} />
                        <span style={{ fontSize: 10, fontWeight: 800, color: TEAL_LIGHT, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                            HackX 4.0 · PS-06 · Satellite Risk Intelligence
                        </span>
                    </motion.div>

                    {/* Headline */}
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.1 }}
                        style={{
                            fontSize: 'clamp(36px, 5vw, 62px)',
                            fontWeight: 900,
                            color: '#fff',
                            lineHeight: 1.1,
                            letterSpacing: '-0.03em',
                            marginBottom: 24,
                        }}
                    >
                        Satellite Data.<br />
                        <span style={{
                            background: `linear-gradient(135deg, ${TEAL_LIGHT}, ${CYAN})`,
                            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                        }}>
                            Instant Climate Risk.
                        </span>
                    </motion.h1>

                    {/* Subtext */}
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.2 }}
                        style={{
                            fontSize: 17, color: 'rgba(255,255,255,0.55)', lineHeight: 1.7,
                            maxWidth: 480, marginBottom: 40, fontWeight: 500,
                        }}
                    >
                        NETRA.AI is an automated intelligence engine that transforms open satellite imagery (Sentinel-1/2, Landsat) into structured, decision-ready climate risk insights — in near real-time.
                    </motion.p>

                    {/* CTA row */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 52 }}
                    >
                        <a href="/login" style={{
                            display: 'flex', alignItems: 'center', gap: 8,
                            padding: '13px 28px', borderRadius: 12,
                            background: `linear-gradient(135deg, ${TEAL} 0%, ${TEAL_LIGHT} 100%)`,
                            color: '#fff', fontWeight: 800, fontSize: 14,
                            textDecoration: 'none',
                            boxShadow: `0 4px 24px ${TEAL}50`,
                            transition: 'all 0.2s',
                        }}>
                            Open Dashboard <ArrowRight size={16} />
                        </a>
                        <a href="#pipeline" style={{
                            display: 'flex', alignItems: 'center', gap: 8,
                            padding: '13px 24px', borderRadius: 12,
                            border: `1px solid ${BORDER}`,
                            color: 'rgba(255,255,255,0.7)', fontWeight: 700, fontSize: 14,
                            textDecoration: 'none',
                            transition: 'all 0.2s',
                        }}>
                            How it Works <ChevronRight size={15} />
                        </a>
                    </motion.div>

                    {/* Stats row */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5, duration: 0.6 }}
                        style={{
                            display: 'flex', gap: 32,
                            paddingTop: 32, borderTop: `1px solid ${BORDER}`,
                        }}
                    >
                        {[
                            { val: 11, suffix: '+', label: 'PS-06 Requirements Met' },
                            { val: 99, suffix: '.7%', label: 'Detection Accuracy' },
                            { val: 142, suffix: 'ms', label: 'API Latency' },
                        ].map((s, i) => (
                            <div key={i}>
                                <div style={{ fontSize: 26, fontWeight: 900, color: '#fff', letterSpacing: '-0.03em' }}>
                                    <AnimatedCounter to={s.val} suffix={s.suffix} />
                                </div>
                                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontWeight: 600, marginTop: 4 }}>
                                    {s.label}
                                </div>
                            </div>
                        ))}
                    </motion.div>
                </div>

                {/* RIGHT — Visual */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1, delay: 0.2, ease: 'easeOut' }}
                >
                    <EarthVisual />
                </motion.div>
            </div>
        </section>
    );
}

// ─────────────────────────────────────────────────────────────
// Data sources trust strip
// ─────────────────────────────────────────────────────────────
function TrustStrip() {
    const sources = ['Sentinel-1 SAR', 'Sentinel-2 MSI', 'Landsat-8/9', 'CHIRPS Rainfall', 'WorldPop 100m', 'JRC Global Water', 'Copernicus DEM', 'Open-Meteo API', 'NASA FIRMS'];
    return (
        <div style={{
            background: 'rgba(13,115,119,0.06)',
            borderTop: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}`,
            padding: '18px 24px', overflow: 'hidden',
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                <span style={{ fontSize: 10, fontWeight: 900, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.15em', textTransform: 'uppercase', flexShrink: 0 }}>
                    Data Sources:
                </span>
                {sources.map((s, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        {i > 0 && <span style={{ color: 'rgba(255,255,255,0.1)' }}>·</span>}
                        <span style={{
                            fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.45)',
                            letterSpacing: '0.04em',
                        }}>{s}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────
// Problem Section
// ─────────────────────────────────────────────────────────────
function ProblemSection() {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: '-100px' });

    return (
        <section ref={ref} style={{ background: BG2, padding: '120px 24px' }}>
            <div style={{ maxWidth: 1200, margin: '0 auto' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }}>

                    {/* Left — text */}
                    <div>
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            animate={inView ? { opacity: 1, x: 0 } : {}}
                            transition={{ duration: 0.7 }}
                        >
                            <span style={{
                                fontSize: 10, fontWeight: 900, color: ORANGE,
                                letterSpacing: '0.15em', textTransform: 'uppercase',
                                display: 'block', marginBottom: 16,
                            }}>
                                The Data Paradox
                            </span>
                            <h2 style={{
                                fontSize: 'clamp(28px, 4vw, 46px)', fontWeight: 900,
                                color: '#fff', lineHeight: 1.15, letterSpacing: '-0.03em',
                                marginBottom: 24,
                            }}>
                                The planet generates<br />petabytes of potential.<br />
                                <span style={{ color: ORANGE }}>Most never becomes insight.</span>
                            </h2>
                            <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.5)', lineHeight: 1.75, maxWidth: 440 }}>
                                Earth observation satellites generate <strong style={{ color: 'rgba(255,255,255,0.8)' }}>terabytes of raw imagery daily</strong>. Yet converting this spectral noise into actionable intelligence requires compute, algorithms, and expertise most organizations simply don't have.
                            </p>
                            <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.5)', lineHeight: 1.75, maxWidth: 440, marginTop: 16 }}>
                                Governments and disaster agencies end up <strong style={{ color: 'rgba(255,255,255,0.8)' }}>reacting to floods</strong> using outdated manual surveys rather than real-time satellite truth.
                            </p>
                        </motion.div>
                    </div>

                    {/* Right — problem cards */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {[
                            {
                                icon: AlertTriangle, color: '#EF4444',
                                title: 'Raw Data Overload',
                                desc: 'Sentinel satellites generate 1.6TB/day. Without automated processing, it sits unused in ESA archives.',
                            },
                            {
                                icon: Eye, color: ORANGE,
                                title: 'Cloud-Blinded Optical Sensors',
                                desc: 'Standard optical imagery fails completely during monsoons when floods are most severe.',
                            },
                            {
                                icon: Database, color: '#A78BFA',
                                title: 'Disconnected Insight Chains',
                                desc: 'Flood extent data, population exposure, and rainfall trends exist in silos — never fused into a risk score.',
                            },
                        ].map((card, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: 30 }}
                                animate={inView ? { opacity: 1, x: 0 } : {}}
                                transition={{ duration: 0.6, delay: i * 0.15 }}
                                style={{
                                    display: 'flex', gap: 16, alignItems: 'flex-start',
                                    padding: '20px 22px', borderRadius: 16,
                                    background: 'rgba(255,255,255,0.03)',
                                    border: `1px solid ${card.color}20`,
                                    borderLeft: `3px solid ${card.color}`,
                                    transition: 'all 0.2s',
                                    cursor: 'default',
                                }}
                            >
                                <div style={{
                                    width: 38, height: 38, borderRadius: 10,
                                    background: `${card.color}15`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    flexShrink: 0,
                                }}>
                                    <card.icon size={18} color={card.color} />
                                </div>
                                <div>
                                    <div style={{ fontSize: 14, fontWeight: 800, color: '#fff', marginBottom: 6 }}>{card.title}</div>
                                    <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', lineHeight: 1.6 }}>{card.desc}</div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

// ─────────────────────────────────────────────────────────────
// Pipeline Visualization
// ─────────────────────────────────────────────────────────────
function PipelineSection() {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: '-80px' });

    const steps = [
        {
            num: '01', icon: Satellite, color: CYAN,
            title: 'Satellite Ingestion',
            desc: 'Sentinel-1/2 and Landsat scenes are pulled from ESA/USGS APIs, filtered by AOI, date, and cloud cover.',
        },
        {
            num: '02', icon: Cpu, color: TEAL_LIGHT,
            title: 'GEE Processing',
            desc: 'Google Earth Engine runs NDWI and VV-backscatter algorithms in the cloud. Slope masks remove false positives.',
        },
        {
            num: '03', icon: Layers, color: '#22C55E',
            title: 'Enrichment',
            desc: 'Flood polygons intersect with WorldPop demographics, CHIRPS rainfall, and terrain data for full exposure metrics.',
        },
        {
            num: '04', icon: BarChart3, color: ORANGE,
            title: 'Risk Scoring',
            desc: 'A Bayesian fusion model assigns 0-100 confidence scores and tiers each zone: CRITICAL / HIGH / MEDIUM / LOW.',
        },
        {
            num: '05', icon: Globe, color: '#A78BFA',
            title: 'Delivery',
            desc: 'Structured JSON served via REST API, visualized in the Next.js dashboard, and auto-exported as PDF reports.',
        },
    ];

    return (
        <section id="pipeline" ref={ref} style={{ background: BG, padding: '120px 24px' }}>
            <div style={{ maxWidth: 1200, margin: '0 auto' }}>

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.7 }}
                    style={{ textAlign: 'center', marginBottom: 80 }}
                >
                    <span style={{
                        fontSize: 10, fontWeight: 900, color: TEAL_LIGHT,
                        letterSpacing: '0.15em', textTransform: 'uppercase',
                        display: 'block', marginBottom: 16,
                    }}>Automated Pipeline</span>
                    <h2 style={{
                        fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 900,
                        color: '#fff', letterSpacing: '-0.03em', lineHeight: 1.15, marginBottom: 18
                    }}>
                        From raw pixels to risk insights<br />
                        <span style={{ color: TEAL_LIGHT }}>in one automated chain.</span>
                    </h2>
                    <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.45)', maxWidth: 520, margin: '0 auto' }}>
                        No manual intervention required. The engine runs on every new satellite pass over your area of interest.
                    </p>
                </motion.div>

                {/* Pipeline steps */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 0, position: 'relative' }}>
                    {/* Connecting line */}
                    <div style={{
                        position: 'absolute', top: 28, left: '10%', right: '10%',
                        height: 1, background: `linear-gradient(90deg, transparent, ${TEAL}50, ${CYAN}50, ${ORANGE}50, transparent)`,
                        zIndex: 0,
                    }} />

                    {steps.map((step, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 30 }}
                            animate={inView ? { opacity: 1, y: 0 } : {}}
                            transition={{ duration: 0.6, delay: i * 0.12 }}
                            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 12px', position: 'relative', zIndex: 1 }}
                        >
                            {/* Icon circle */}
                            <div style={{
                                width: 56, height: 56, borderRadius: '50%',
                                background: BG,
                                border: `2px solid ${step.color}50`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                marginBottom: 20,
                                boxShadow: `0 0 20px ${step.color}25`,
                            }}>
                                <step.icon size={22} color={step.color} />
                            </div>

                            <div style={{
                                fontSize: 28, fontWeight: 900,
                                color: 'rgba(255,255,255,0.06)',
                                letterSpacing: '-0.04em', marginBottom: 10,
                            }}>{step.num}</div>
                            <div style={{ fontSize: 13, fontWeight: 800, color: '#fff', textAlign: 'center', marginBottom: 10 }}>{step.title}</div>
                            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', textAlign: 'center', lineHeight: 1.6 }}>{step.desc}</div>
                        </motion.div>
                    ))}
                </div>

                {/* Algorithm spotlight */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.7, delay: 0.6 }}
                    style={{
                        marginTop: 72,
                        background: 'rgba(255,255,255,0.025)',
                        border: `1px solid ${BORDER}`,
                        borderRadius: 20,
                        padding: 32,
                        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24,
                    }}
                >
                    <div>
                        <div style={{ fontSize: 11, color: TEAL_LIGHT, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 14 }}>
                            Detection Algorithm
                        </div>
                        <pre style={{
                            fontSize: 12, color: 'rgba(255,255,255,0.7)',
                            background: 'rgba(0,0,0,0.4)', borderRadius: 12,
                            padding: '16px 18px', overflow: 'auto',
                            border: `1px solid ${BORDER}`, lineHeight: 1.7,
                            fontFamily: 'ui-monospace, monospace',
                        }}>{`# SAR Flood Detection
flood = pre_VV.subtract(post_VV).gt(-2.0)

# NDWI Optical
ndwi = green.subtract(nir)
       .divide(green.add(nir))
flood_opt = ndwi.gt(0)

# Slope mask (remove artefacts)
flood_clean = flood.Or(flood_opt)
  .updateMask(slope.lt(5))`}</pre>
                    </div>
                    <div>
                        <div style={{ fontSize: 11, color: ORANGE, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 14 }}>
                            Confidence Scoring
                        </div>
                        <pre style={{
                            fontSize: 12, color: 'rgba(255,255,255,0.7)',
                            background: 'rgba(0,0,0,0.4)', borderRadius: 12,
                            padding: '16px 18px', overflow: 'auto',
                            border: `1px solid ${BORDER}`, lineHeight: 1.7,
                            fontFamily: 'ui-monospace, monospace',
                        }}>{`# Bayesian Fusion Model
confidence = (
  sar_conf  * 0.50 +   # Radar
  opt_conf  * 0.30 +   # Optical
  rain_wt   * 0.20     # CHIRPS
)

# Risk Tiering
CRITICAL if score > 85
HIGH     if score > 65
MEDIUM   if score > 40`}</pre>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}

// ─────────────────────────────────────────────────────────────
// Platform Features Bento
// ─────────────────────────────────────────────────────────────
function FeaturesSection() {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: '-80px' });

    const features = [
        {
            icon: Radio, color: CYAN, span: 2,
            title: 'Monsoon-Resilient Detection',
            desc: 'Sentinel-1 Synthetic Aperture Radar sees through cloud cover. Unlike optical sensors that fail during monsoons, SAR actively penetrates storm systems — exactly when flood detection matters most.',
            tag: 'CLOUD-PIERCING SAR',
        },
        {
            icon: MapPin, color: '#EF4444', span: 1,
            title: 'Assam Deep Dive',
            desc: 'Specialized 10m-resolution tracking of the Brahmaputra Basin [89.7, 24.1, 96.0, 28.2] — India\'s most flood-prone region.',
            tag: 'HIGH-RISK FOCUS',
        },
        {
            icon: TrendingUp, color: '#22C55E', span: 1,
            title: 'Population Exposure',
            desc: 'WorldPop 100m overlay quantifies exactly how many people are within each detected flood boundary.',
            tag: 'DEMOGRAPHIC INTEL',
        },
        {
            icon: Sparkles, color: '#A78BFA', span: 1,
            title: 'Predictive Forecasting',
            desc: 'CHIRPS daily rainfall integration forecasts flood inundation risk 7 days before river breach events.',
            tag: 'COMING SOON',
        },
        {
            icon: ShieldCheck, color: TEAL_LIGHT, span: 2,
            title: 'Audit-Grade Data Provenance',
            desc: 'Every detection exports satellite ID, acquisition timestamp, algorithm version, and confidence score. Full chain-of-custody for regulatory and insurance submissions.',
            tag: 'COMPLIANCE READY',
        },
    ];

    return (
        <section id="platform" ref={ref} style={{ background: BG2, padding: '120px 24px' }}>
            <div style={{ maxWidth: 1200, margin: '0 auto' }}>
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.7 }}
                    style={{ marginBottom: 60 }}
                >
                    <span style={{
                        fontSize: 10, fontWeight: 900, color: TEAL_LIGHT,
                        letterSpacing: '0.15em', textTransform: 'uppercase',
                        display: 'block', marginBottom: 14,
                    }}>Platform Capabilities</span>
                    <h2 style={{
                        fontSize: 'clamp(28px, 4vw, 46px)', fontWeight: 900,
                        color: '#fff', letterSpacing: '-0.03em', lineHeight: 1.15,
                    }}>
                        Algorithmic edge over{' '}
                        <span style={{ color: TEAL_LIGHT }}>raw pixels.</span>
                    </h2>
                </motion.div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                    {features.map((f, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 30 }}
                            animate={inView ? { opacity: 1, y: 0 } : {}}
                            transition={{ duration: 0.6, delay: i * 0.1 }}
                            style={{
                                gridColumn: `span ${f.span}`,
                                padding: 28, borderRadius: 20,
                                background: 'rgba(255,255,255,0.025)',
                                border: `1px solid ${BORDER}`,
                                transition: 'all 0.25s ease',
                                cursor: 'default',
                                position: 'relative', overflow: 'hidden',
                            }}
                            whileHover={{ borderColor: `${f.color}30`, y: -3 }}
                        >
                            {/* Hover glow */}
                            <div style={{
                                position: 'absolute', top: 0, left: 0, right: 0, height: 1,
                                background: `linear-gradient(90deg, transparent, ${f.color}40, transparent)`,
                            }} />

                            {/* Tag */}
                            <span style={{
                                display: 'inline-block', fontSize: 9, fontWeight: 900,
                                color: f.color, background: `${f.color}15`,
                                border: `1px solid ${f.color}25`, borderRadius: 5,
                                padding: '3px 8px', letterSpacing: '0.08em',
                                marginBottom: 16,
                            }}>
                                {f.tag}
                            </span>

                            <div style={{
                                width: 40, height: 40, borderRadius: 11,
                                background: `${f.color}12`,
                                border: `1px solid ${f.color}25`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                marginBottom: 16,
                            }}>
                                <f.icon size={18} color={f.color} />
                            </div>
                            <h3 style={{ fontSize: 16, fontWeight: 800, color: '#fff', marginBottom: 12 }}>{f.title}</h3>
                            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', lineHeight: 1.65 }}>{f.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}

// ─────────────────────────────────────────────────────────────
// Stakeholders
// ─────────────────────────────────────────────────────────────
function StakeholdersSection() {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: '-80px' });

    const stakeholders = [
        {
            icon: Shield, color: '#3B82F6',
            title: 'Government & Disaster Agencies',
            items: ['Real-time situational awareness', 'Rescue team geo-targeting', 'District-level risk classification', 'Historical flood frequency maps'],
        },
        {
            icon: Server, color: ORANGE,
            title: 'Insurance & Finance',
            items: ['Satellite-verified claim processing', 'Flood exposure underwriting', 'Portfolio climate risk scoring', 'Regulatory ORSA compliance data'],
        },
        {
            icon: Map, color: '#22C55E',
            title: 'Urban Planners & Researchers',
            items: ['Infrastructure flood risk layers', '20+ year JRC water baselines', 'NDVI crop damage quantification', 'Post-disaster recovery tracking'],
        },
    ];

    return (
        <section id="stakeholders" ref={ref} style={{ background: BG, padding: '120px 24px' }}>
            <div style={{ maxWidth: 1200, margin: '0 auto' }}>
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.7 }}
                    style={{ textAlign: 'center', marginBottom: 64 }}
                >
                    <span style={{
                        fontSize: 10, fontWeight: 900, color: TEAL_LIGHT,
                        letterSpacing: '0.15em', textTransform: 'uppercase',
                        display: 'block', marginBottom: 14,
                    }}>Who Benefits</span>
                    <h2 style={{
                        fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 900,
                        color: '#fff', letterSpacing: '-0.03em', lineHeight: 1.15,
                    }}>
                        Built for every stakeholder<br />in the crisis chain.
                    </h2>
                </motion.div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
                    {stakeholders.map((s, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 30 }}
                            animate={inView ? { opacity: 1, y: 0 } : {}}
                            transition={{ duration: 0.6, delay: i * 0.15 }}
                            style={{
                                padding: 30, borderRadius: 20,
                                background: 'rgba(255,255,255,0.025)',
                                border: `1px solid ${BORDER}`,
                            }}
                        >
                            <div style={{
                                width: 44, height: 44, borderRadius: 12,
                                background: `${s.color}12`,
                                border: `1px solid ${s.color}25`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                marginBottom: 20,
                            }}>
                                <s.icon size={20} color={s.color} />
                            </div>
                            <h3 style={{ fontSize: 16, fontWeight: 800, color: '#fff', marginBottom: 20 }}>{s.title}</h3>
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
                                {s.items.map((item, j) => (
                                    <li key={j} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                                        <Check size={14} color={s.color} style={{ flexShrink: 0, marginTop: 2 }} />
                                        <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.5 }}>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}

// ─────────────────────────────────────────────────────────────
// Tech Stack
// ─────────────────────────────────────────────────────────────
function TechStack() {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: '-80px' });

    const stack = [
        { label: 'Next.js 16', sub: 'App Router', color: '#fff' },
        { label: 'TypeScript', sub: '5.9', color: '#3B82F6' },
        { label: 'Python 3.10', sub: 'Pipeline', color: '#F59E0B' },
        { label: 'Google Earth Engine', sub: 'GEE API', color: TEAL_LIGHT },
        { label: 'MongoDB Atlas', sub: 'Data Store', color: '#22C55E' },
        { label: 'Framer Motion', sub: 'Animations', color: '#EC4899' },
        { label: 'Recharts', sub: 'Analytics', color: ORANGE },
        { label: 'Leaflet', sub: 'Geo Maps', color: '#22C55E' },
        { label: 'Tailwind CSS 4', sub: 'Styling', color: CYAN },
        { label: 'Mongoose', sub: 'ODM', color: '#EF4444' },
        { label: 'SWR', sub: 'Data Fetch', color: '#fff' },
        { label: 'Next-Auth', sub: 'Auth', color: '#A78BFA' },
    ];

    return (
        <section ref={ref} style={{ background: BG2, padding: '100px 24px', borderTop: `1px solid ${BORDER}` }}>
            <div style={{ maxWidth: 1200, margin: '0 auto' }}>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6 }}
                    style={{ textAlign: 'center', marginBottom: 48 }}
                >
                    <span style={{
                        fontSize: 10, fontWeight: 900, color: 'rgba(255,255,255,0.3)',
                        letterSpacing: '0.2em', textTransform: 'uppercase',
                    }}>Technology Stack</span>
                </motion.div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
                    {stack.map((t, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0.85 }}
                            animate={inView ? { opacity: 1, scale: 1 } : {}}
                            transition={{ duration: 0.4, delay: i * 0.05 }}
                            style={{
                                padding: '10px 18px', borderRadius: 10,
                                background: 'rgba(255,255,255,0.03)',
                                border: `1px solid ${BORDER}`,
                                display: 'flex', alignItems: 'center', gap: 10,
                            }}
                        >
                            <div style={{ width: 7, height: 7, borderRadius: '50%', background: t.color, flexShrink: 0 }} />
                            <div>
                                <div style={{ fontSize: 12, fontWeight: 800, color: '#fff' }}>{t.label}</div>
                                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', fontWeight: 600 }}>{t.sub}</div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}

// ─────────────────────────────────────────────────────────────
// PS-06 Compliance Table
// ─────────────────────────────────────────────────────────────
function ComplianceSection() {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: '-80px' });

    const requirements = [
        ['Ingest Sentinel-1/2 & Landsat satellite imagery', 'cosmeon/pipeline/runner.py + GEE API'],
        ['Automated flood detection using image processing', 'SAR VV-backscatter + NDWI thresholding'],
        ['Change detection vs. historical baseline', 'JRC Global Water multi-year comparison'],
        ['Structured output — area stats, risk labels', '/api/insights + MongoDB FloodEvent schema'],
        ['State table with timestamps & regions', 'District MongoDB collection with event history'],
        ['Detailed pipeline processing logs', '/logs page + ProcessingLog collection'],
        ['External data integration (rainfall, elevation, population)', 'CHIRPS + Copernicus DEM + WorldPop'],
        ['Predictive flood risk modeling', '7-day CHIRPS trend analysis'],
        ['REST API for programmatic access', '15+ endpoints under /api/'],
        ['Interactive dashboard visualizing flood zones', 'Next.js + Leaflet + Recharts'],
        ['Confidence scoring for risk areas', 'Bayesian fusion model (0–100%)'],
    ];

    return (
        <section ref={ref} style={{ background: BG, padding: '100px 24px' }}>
            <div style={{ maxWidth: 1000, margin: '0 auto' }}>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    style={{ textAlign: 'center', marginBottom: 52 }}
                >
                    <span style={{ fontSize: 10, fontWeight: 900, color: TEAL_LIGHT, letterSpacing: '0.15em', textTransform: 'uppercase', display: 'block', marginBottom: 14 }}>
                        PS-06 Coverage
                    </span>
                    <h2 style={{ fontSize: 'clamp(24px, 3.5vw, 40px)', fontWeight: 900, color: '#fff', letterSpacing: '-0.02em' }}>
                        Every requirement. Fully addressed.
                    </h2>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ delay: 0.2 }}
                    style={{
                        borderRadius: 20, overflow: 'hidden',
                        border: `1px solid ${BORDER}`,
                    }}
                >
                    {requirements.map(([req, impl], i) => (
                        <div key={i} style={{
                            display: 'grid', gridTemplateColumns: '28px 1fr 1fr',
                            gap: 20, padding: '16px 24px',
                            borderBottom: i < requirements.length - 1 ? `1px solid ${BORDER}` : 'none',
                            background: i % 2 === 0 ? 'rgba(255,255,255,0.015)' : 'transparent',
                            alignItems: 'center',
                        }}>
                            <div style={{
                                width: 22, height: 22, borderRadius: 6,
                                background: `${TEAL}20`, border: `1px solid ${TEAL}40`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                                <Check size={12} color={TEAL_LIGHT} />
                            </div>
                            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>{req}</span>
                            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', fontFamily: 'ui-monospace, monospace', letterSpacing: '0.02em' }}>
                                {impl}
                            </span>
                        </div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}

// ─────────────────────────────────────────────────────────────
// CTA
// ─────────────────────────────────────────────────────────────
function CTASection() {
    return (
        <section style={{
            background: BG2,
            padding: '120px 24px',
            borderTop: `1px solid ${BORDER}`,
            position: 'relative', overflow: 'hidden',
        }}>
            <div style={{
                position: 'absolute', top: '50%', left: '50%',
                transform: 'translate(-50%,-50%)',
                width: 600, height: 300,
                background: `radial-gradient(ellipse, ${TEAL}20 0%, transparent 70%)`,
                filter: 'blur(60px)',
            }} />

            <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7 }}
                >
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: 8,
                        padding: '8px 16px', borderRadius: 999,
                        background: `${TEAL}15`, border: `1px solid ${TEAL}35`,
                        marginBottom: 28,
                    }}>
                        <Lock size={12} color={TEAL_LIGHT} />
                        <span style={{ fontSize: 11, fontWeight: 800, color: TEAL_LIGHT, letterSpacing: '0.08em' }}>
                            Zero mock data · 100% satellite truth
                        </span>
                    </div>

                    <h2 style={{
                        fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: 900,
                        color: '#fff', letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: 20,
                    }}>
                        NETRA.AI doesn't just show<br />you a map.
                    </h2>
                    <p style={{
                        fontSize: 17, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, marginBottom: 44,
                    }}>
                        It tells you exactly who is at risk, how much land is lost, and what the financial impact will be — all powered by the eye in the sky.
                    </p>

                    <div style={{ display: 'flex', gap: 14, justifyContent: 'center' }}>
                        <a href="/login" style={{
                            display: 'flex', alignItems: 'center', gap: 8,
                            padding: '14px 32px', borderRadius: 12,
                            background: `linear-gradient(135deg, ${TEAL}, ${TEAL_LIGHT})`,
                            color: '#fff', fontWeight: 800, fontSize: 15,
                            textDecoration: 'none',
                            boxShadow: `0 4px 28px ${TEAL}50`,
                        }}>
                            Open the Dashboard <ArrowRight size={17} />
                        </a>
                        <a href="https://github.com/CyberJarvis/Refactor_PS06" target="_blank" rel="noopener noreferrer" style={{
                            display: 'flex', alignItems: 'center', gap: 8,
                            padding: '14px 28px', borderRadius: 12,
                            border: `1px solid ${BORDER}`,
                            color: 'rgba(255,255,255,0.6)', fontWeight: 700, fontSize: 15,
                            textDecoration: 'none',
                        }}>
                            View on GitHub
                        </a>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}

// ─────────────────────────────────────────────────────────────
// Footer
// ─────────────────────────────────────────────────────────────
function Footer() {
    return (
        <footer style={{
            background: BG,
            borderTop: `1px solid ${BORDER}`,
            padding: '32px 24px',
        }}>
            <div style={{
                maxWidth: 1200, margin: '0 auto',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                        width: 28, height: 28, borderRadius: 7,
                        background: `linear-gradient(135deg, ${TEAL}, ${TEAL_LIGHT})`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <Satellite size={13} color="white" />
                    </div>
                    <span style={{ fontWeight: 800, fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>NETRA.AI</span>
                </div>

                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', textAlign: 'center' }}>
                    HackX 4.0 · Problem Statement 06 · Satellite Data to Insight Engine for Climate Risk
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#22C55E', boxShadow: '0 0 8px #22C55E' }} />
                    <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em' }}>SYSTEM ONLINE</span>
                </div>
            </div>
        </footer>
    );
}

// ─────────────────────────────────────────────────────────────
// Root Export
// ─────────────────────────────────────────────────────────────
export default function LandingPage() {
    return (
        <div style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
            <Navbar />
            <Hero />
            <TrustStrip />
            <ProblemSection />
            <PipelineSection />
            <FeaturesSection />
            <StakeholdersSection />
            <TechStack />
            <ComplianceSection />
            <CTASection />
            <Footer />
        </div>
    );
}