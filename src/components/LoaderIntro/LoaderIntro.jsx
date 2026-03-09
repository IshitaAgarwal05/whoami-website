import { useState, useEffect, useRef, useCallback } from 'react';
import './LoaderIntro.css';

/*
 * 3-PHASE SEQUENTIAL INTRO:
 * 
 * Phase 1 — TYPEWRITER (~2s): "WHO AM I ?" types letter by letter  
 * Phase 2 — GOLDEN THREAD (~2.4s): SVG "WHOAMI" draws with gold stroke
 * Phase 3 — IDENTITY SCAN (~1.8s): Fingerprint + scan line  
 * Phase 4 — REVEAL (~1.2s): Overlay dissolves, site appears
 */

const TYPEWRITER_TEXT = 'WHO AM I ?';
const LETTER_DELAY = 120;
const PHASE1_HOLD = 600;
const THREAD_DRAW_MS = 1800;
const THREAD_HOLD_MS = 600;
const SCAN_DURATION = 1800;
const REVEAL_DURATION = 1200;

const LoaderIntro = ({ onComplete, onRevealStart }) => {
    const [phase, setPhase] = useState('typewriter');
    const [typed, setTyped] = useState('');
    const [cursorVisible, setCursorVisible] = useState(true);
    const [threadFilled, setThreadFilled] = useState(false);
    const timerRef = useRef(null);
    const svgTextRef = useRef(null);
    const animRef = useRef(null);

    // Prevent scroll
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = ''; };
    }, []);

    // ─── PHASE 1: TYPEWRITER ───
    useEffect(() => {
        if (phase !== 'typewriter') return;
        let i = 0;
        const type = () => {
            if (i < TYPEWRITER_TEXT.length) {
                setTyped(TYPEWRITER_TEXT.slice(0, i + 1));
                i++;
                timerRef.current = setTimeout(type, LETTER_DELAY);
            } else {
                timerRef.current = setTimeout(() => setPhase('scan'), PHASE1_HOLD);
            }
        };
        timerRef.current = setTimeout(type, 800);
        const cursorInterval = setInterval(() => setCursorVisible(v => !v), 530);
        return () => { clearTimeout(timerRef.current); clearInterval(cursorInterval); };
    }, [phase]);

    // ─── PHASE 2: GOLDEN THREAD (JS-driven stroke animation) ───
    /*
    useEffect(() => {
        if (phase !== 'thread') return;

        // Wait a frame for SVG ref to be ready
        requestAnimationFrame(() => {
            const textEl = svgTextRef.current;
            if (!textEl) return;

            let totalLen;
            try {
                totalLen = textEl.getTotalLength();
            } catch {
                totalLen = 2000;
            }

            // Set initial state
            textEl.style.strokeDasharray = totalLen;
            textEl.style.strokeDashoffset = totalLen;

            const startTime = performance.now();

            const animate = (now) => {
                const elapsed = now - startTime;
                const progress = Math.min(elapsed / THREAD_DRAW_MS, 1);
                // Ease-out cubic
                const eased = 1 - Math.pow(1 - progress, 3);
                const offset = totalLen * (1 - eased);

                textEl.style.strokeDashoffset = offset;

                if (progress >= 0.85 && !threadFilled) {
                    setThreadFilled(true);
                }

                if (progress < 1) {
                    animRef.current = requestAnimationFrame(animate);
                } else {
                    textEl.style.strokeDashoffset = '0';
                    setThreadFilled(true);
                    timerRef.current = setTimeout(() => setPhase('scan'), THREAD_HOLD_MS);
                }
            };

            animRef.current = requestAnimationFrame(animate);
        });

        return () => {
            cancelAnimationFrame(animRef.current);
            clearTimeout(timerRef.current);
        };
    }, [phase]);
    */

    // ─── PHASE 3: SCAN → REVEAL → DONE ───
    useEffect(() => {
        if (phase !== 'scan') return;
        timerRef.current = setTimeout(() => setPhase('reveal'), SCAN_DURATION);
        return () => clearTimeout(timerRef.current);
    }, [phase]);

    useEffect(() => {
        if (phase !== 'reveal') return;
        if (onRevealStart) onRevealStart();
        timerRef.current = setTimeout(() => {
            setPhase('done');
            onComplete();
        }, REVEAL_DURATION);
        return () => clearTimeout(timerRef.current);
    }, [phase, onComplete]);

    const handleSkip = () => { setPhase('done'); onComplete(); };

    if (phase === 'done') return null;

    return (
        <div className={`loader-v2 ${phase === 'reveal' ? 'loader-v2-reveal' : ''}`}>

            {/* ── PHASE 1: TYPEWRITER ── */}
            {phase === 'typewriter' && (
                <div className="loader-typewriter">
                    <span className="loader-typewriter-text">{typed}</span>
                    <span className={`loader-cursor ${cursorVisible ? '' : 'loader-cursor-hidden'}`}>|</span>
                </div>
            )}


            {/* ── PHASE 2: GOLDEN THREAD ── */}
            {/*
            {phase === 'thread' && (
                <div className="loader-thread-wrapper">
                    <svg className="loader-thread-svg" viewBox="0 0 600 100" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#e8b230" />
                                <stop offset="50%" stopColor="#fdd835" />
                                <stop offset="100%" stopColor="#e8b230" />
                            </linearGradient>
                        </defs>
                        // Main stroke - only element animated per-frame
                        <text
                            ref={svgTextRef}
                            className="loader-thread-stroke"
                            x="300" y="75" textAnchor="middle"
                            fontSize="72" fontFamily="'Playfair Display', Georgia, serif"
                            fontWeight="700" letterSpacing="12"
                            fill="none" stroke="url(#goldGrad)" strokeWidth="1.5"
                        >WHOAMI</text>
                        // Fill - fades in via CSS class toggle
                        <text
                            className={`loader-thread-text-fill ${threadFilled ? 'loader-thread-text-filled' : ''}`}
                            x="300" y="75" textAnchor="middle"
                            fontSize="72" fontFamily="'Playfair Display', Georgia, serif"
                            fontWeight="700" letterSpacing="12"
                            fill="url(#goldGrad)"
                        >WHOAMI</text>
                    </svg>
                    <p className="loader-thread-tagline">Identity, crafted.</p>
                </div>
            )}
            */} 

            {/* ── PHASE 3: FINGERPRINT SCAN ── */}
            {(phase === 'scan' || phase === 'reveal') && (
                <div className={`loader-scan-wrapper ${phase === 'reveal' ? 'loader-scan-fadeout' : ''}`}>
                    <div className="loader-fingerprint">
                        <svg className="loader-fingerprint-svg" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                            <defs>
                                <clipPath id="fpClip"><circle cx="100" cy="100" r="85" /></clipPath>
                            </defs>
                            <g clipPath="url(#fpClip)" fill="none" strokeWidth="1.5">
                                <path d="M100,30 Q140,30 155,60 Q170,90 155,120 Q140,150 100,160" className="fp-line fp-1" stroke="rgba(253, 216, 53, 0.5)" />
                                <path d="M100,40 Q130,40 142,65 Q155,90 142,115 Q130,140 100,148" className="fp-line fp-2" stroke="rgba(253, 216, 53, 0.45)" />
                                <path d="M100,50 Q125,50 133,70 Q142,90 133,110 Q125,130 100,136" className="fp-line fp-3" stroke="rgba(253, 216, 53, 0.4)" />
                                <path d="M100,60 Q118,60 124,75 Q130,90 124,105 Q118,120 100,125" className="fp-line fp-4" stroke="rgba(253, 216, 53, 0.35)" />
                                <path d="M100,70 Q112,70 116,80 Q120,90 116,100 Q112,110 100,114" className="fp-line fp-5" stroke="rgba(253, 216, 53, 0.3)" />
                                <path d="M100,80 Q108,80 110,86 Q112,90 110,95 Q108,100 100,103" className="fp-line fp-6" stroke="rgba(253, 216, 53, 0.25)" />
                                <path d="M100,30 Q60,30 45,60 Q30,90 45,120 Q60,150 100,160" className="fp-line fp-7" stroke="rgba(253, 216, 53, 0.5)" />
                                <path d="M100,40 Q70,40 58,65 Q45,90 58,115 Q70,140 100,148" className="fp-line fp-8" stroke="rgba(253, 216, 53, 0.45)" />
                                <path d="M100,50 Q75,50 67,70 Q58,90 67,110 Q75,130 100,136" className="fp-line fp-9" stroke="rgba(253, 216, 53, 0.4)" />
                                <path d="M100,60 Q82,60 76,75 Q70,90 76,105 Q82,120 100,125" className="fp-line fp-10" stroke="rgba(253, 216, 53, 0.35)" />
                                <path d="M100,70 Q88,70 84,80 Q80,90 84,100 Q88,110 100,114" className="fp-line fp-11" stroke="rgba(253, 216, 53, 0.3)" />
                                <path d="M100,80 Q92,80 90,86 Q88,90 90,95 Q92,100 100,103" className="fp-line fp-12" stroke="rgba(253, 216, 53, 0.25)" />
                            </g>
                            <circle cx="100" cy="100" r="88" fill="none" stroke="rgba(253, 216, 53, 0.15)" strokeWidth="1" className="fp-ring" />
                        </svg>
                        <span className="loader-scan-brand">WHOAMI</span>
                    </div>
                    <div className="loader-scan-line" />
                    <p className="loader-scan-status">Identity verified</p>
                </div>
            )}

            <button className="loader-skip" onClick={handleSkip} aria-label="Skip intro">Skip ›</button>
        </div>
    );
};

export default LoaderIntro;
