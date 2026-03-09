import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import './Hero.css';

const Hero = () => {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const heroRef = useRef(null);
    const logoRef = useRef(null);
    const throttleTimerRef = useRef(null);

    // Throttled mouse position tracking (update every 16ms instead of every mousemove)
    useEffect(() => {
        const handleMouseMove = (e) => {
            if (!heroRef.current || throttleTimerRef.current) return;

            const rect = heroRef.current.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width;
            const y = (e.clientY - rect.top) / rect.height;

            setMousePosition({ x, y });

            // Throttle to ~60fps
            throttleTimerRef.current = setTimeout(() => {
                throttleTimerRef.current = null;
            }, 16);
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            if (throttleTimerRef.current) clearTimeout(throttleTimerRef.current);
        };
    }, []);

    // Apply 3D transform to logo (only when needed)
    useEffect(() => {
        if (!logoRef.current) return;

        const tiltX = (mousePosition.y - 0.5) * 20;
        const tiltY = (mousePosition.x - 0.5) * -20;

        logoRef.current.style.transform = `
            perspective(1000px) 
            rotateX(${tiltX}deg) 
            rotateY(${tiltY}deg)
            translateZ(20px)
        `;
    }, [mousePosition]);

    // Reduce particles on initial load - only 10 instead of 20
    const particleCount = typeof window !== 'undefined' && window.innerWidth < 768 ? 5 : 10;

    return (
        <section className="hero-immersive" ref={heroRef}>
            {/* Animated gradient background */}
            <div className="hero-gradient-bg"></div>
            <div className="hero-grain-overlay"></div>

            <div className="hero-immersive-container">
                {/* Background giant text */}
                <div className="hero-bg-text">IDENTITY</div>

                {/* Main content */}
                <div className="hero-immersive-content">
                    {/* 3D Interactive Logo */}
                    <div className="hero-logo-container" ref={logoRef}>
                        <img
                            src="/whoami_logo.png"
                            alt="WhoAmI Logo"
                            className="hero-logo-immersive"
                        />
                        <div className="hero-logo-glow"></div>
                    </div>

                    {/* Dramatic Typography */}
                    <h1 className="hero-title-immersive">
                        Identity.
                    </h1>
                    <p className="hero-tagline-immersive">
                        Chosen. Worn. Lived.
                    </p>

                    <p className="hero-description-immersive">
                        You don't choose what you love, you discover who you've always been.
                        <br />
                        We craft artifacts for those who refuse to blend in.
                    </p>

                    {/* CTA Buttons */}
                    <div className="hero-cta-immersive">
                        <Link to="/products" className="btn-immersive btn-primary-glow">
                            Explore Products
                        </Link>
                        <Link to="/about" className="btn-immersive btn-secondary-glow">
                            Our Story
                        </Link>
                    </div>
                </div>

                {/* Glassmorphism Stats Bar */}
                <div className="hero-stats-glass">
                    <div className="stat-glass-item">
                        <div className="stat-glass-number">15+</div>
                        <div className="stat-glass-label">Artifacts Crafted</div>
                    </div>
                    <div className="stat-divider-glass"></div>
                    <div className="stat-glass-item">
                        <div className="stat-glass-number">🇮🇳</div>
                        <div className="stat-glass-label">Made in Jaipur</div>
                    </div>
                    <div className="stat-divider-glass"></div>
                    <div className="stat-glass-item">
                        <div className="stat-glass-number">100%</div>
                        <div className="stat-glass-label">Fan-Crafted</div>
                    </div>
                </div>
            </div>

            {/* Floating particles - REDUCED COUNT */}
            <div className="hero-particles">
                {[...Array(particleCount)].map((_, i) => (
                    <div key={i} className="particle" style={{
                        left: `${Math.random() * 100}%`,
                        animationDelay: `${Math.random() * 5}s`,
                        animationDuration: `${5 + Math.random() * 10}s`
                    }}></div>
                ))}
            </div>
        </section>
    );
};

export default Hero;