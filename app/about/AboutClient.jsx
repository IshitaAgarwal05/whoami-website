'use client';

import { useEffect, useRef } from 'react';
import ValuesCarousel from '../../components/ValuesCarousel/ValuesCarousel';
import '../../styles/About.css';

const AboutClient = () => {
    const heroRef = useRef(null);

    useEffect(() => {
        const handleScroll = () => {
            if (!heroRef.current) return;
            const scrolled = window.pageYOffset;
            heroRef.current.style.transform = `translateY(${scrolled * 0.3}px)`;
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="about-page">
            {/* Immersive Hero */}
            <section className="about-hero-immersive">
                <div className="about-hero-parallax" ref={heroRef}></div>
                <div className="about-hero-overlay"></div>

                <div className="container">
                    <div className="about-hero-content">
                        <div className="about-hero-bg-text">ORIGIN</div>
                        <div className="about-hero-text-card">
                            <h1 className="reveal-text">Identity, Crafted.</h1>
                            <p className="about-tagline reveal-text-delay">
                                Where rebellion is subtle and artifacts speak volumes.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Split Story Section */}
            <section className="about-story-split">
                <div className="container">
                    <div className="split-grid">
                        <div className="story-text">
                            <span className="section-label">Our Story</span>
                            <h2>The Question</h2>
                            <p>
                                WHOAMI started with a simple question: <strong>Who are you, really?</strong>
                            </p>
                            <p>
                                In a world of mass-produced noise, we felt something was missing — objects that actually mean something.
                                We are a student-led startup built on the belief that the things we keep around us should reflect who we are becoming.
                            </p>
                            <p>
                                Every piece we craft in our Jaipur workshop is designed to be more than an object; it's a reminder of the worlds and ideas that shape us.
                            </p>
                            <p>
                                We're starting small, experimenting, building in public, and learning as we go. But our vision is simple,
                            </p>
                            <p><b>
                                To build a brand where identity, creativity, and collectibles meet.
                            </b></p>
                        </div>
                        <div className="story-visual">
                            <div className="visual-frame">
                                <img src="/about-vibe.png" alt="WhoAmI Workshop" className="cinematic-img" />
                                <div className="visual-glow"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Worlds Section */}
            <section className="about-worlds">
                <div className="container">
                    <div className="section-header-centered">
                        <span className="section-label">Inspiration</span>
                        <h2>Worlds We Translate</h2>
                    </div>

                    <div className="fandoms-staggered-grid">
                        <div className="fandom-card">
                            <span className="fandom-icon">⚡</span>
                            <h3>The Wizarding World</h3>
                            <p>Ancient symbols for modern desks.</p>
                        </div>
                        <div className="fandom-card">
                            <span className="fandom-icon">🛡️</span>
                            <h3>Superhero Universes</h3>
                            <p>Gaming realms and Icons of resilience and power.</p>
                        </div>
                        <div className="fandom-card">
                            <span className="fandom-icon">🚀</span>
                            <h3>Galactic Sagas</h3>
                            <p>Artifacts from far, far away.</p>
                        </div>
                        <div className="fandom-card">
                            <span className="fandom-icon">⚔️</span>
                            <h3>Fantasy Epics</h3>
                            <p>Mythology in the palm of your hand.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Philosophy Section - Values Carousel */}
            <section className="about-philosophy">
                <div className="container">
                    <div className="section-header-centered">
                        <span className="section-label">Philosophy</span>
                        <ValuesCarousel />
                    </div>
                </div>
            </section>

            {/* Audience Section - Glassmorphic */}
            <section className="about-audience">
                <div className="container">
                    <div className="section-header-centered">
                        <span className="section-label">Community</span>
                        <h2>Who We Create For</h2>
                    </div>

                    <div className="audience-glass-grid">
                        <div className="audience-glass-card">
                            <h3>Students & Creators</h3>
                            <p>Dorm rooms and studios that deserve artifacts of who you're becoming.</p>
                        </div>
                        <div className="audience-glass-card">
                            <h3>Young Professionals</h3>
                            <p>Subtle symbols that say "I refuse to be ordinary" to those who understand.</p>
                        </div>
                        <div className="audience-glass-card">
                            <h3>Gift Seekers</h3>
                            <p>For those who want to say "I see who you really are" without words.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Process Section - Threaded */}
            <section className="about-process">
                <div className="container">
                    <div className="section-header-centered">
                        <span className="section-label">Execution</span>
                        <h2>The Craft Process</h2>
                    </div>

                    <div className="process-threaded-grid">
                        <div className="process-step-premium">
                            <div className="step-count">01</div>
                            <h3>Translate</h3>
                            <p>Universes researched and distilled into tangible geometric forms.</p>
                        </div>
                        <div className="process-step-premium">
                            <div className="step-count">02</div>
                            <h3>Craft</h3>
                            <p>Precision 3D printing with premium materials.</p>
                        </div>
                        <div className="process-step-premium">
                            <div className="step-count">03</div>
                            <h3>Refine</h3>
                            <p>Hand-finished artifacts inspected for quality and soul.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Made in Jaipur Final Banner */}
            <section className="about-jaipur-banner">
                <div className="container">
                    <div className="jaipur-content">
                        <div className="jaipur-badge">Designed & Crafted in Jaipur</div>
                        <h3>Indian Creativity. Global Standards.</h3>
                        <p>From the pink city to desks across the globe.</p>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default AboutClient;
