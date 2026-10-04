'use client';

import Link from 'next/link';
import './Footer.css';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="footer">
            <div className="footer-container container">
                <div className="footer-grid">

                    {/* Brand Column */}
                    <div className="footer-column brand-column">
                        <div className="footer-brand-container">
                            <img src="/whoami_logo.png" alt="WhoAmI Logo" className="footer-logo" />
                            <div>
                                <h3 className="footer-brand">WhoAmI</h3>
                                <p className="footer-tagline">Identity. Chosen. Worn. Lived.</p>
                            </div>
                        </div>
                        <p className="footer-description">
                            3D Printed Artifacts for the quietly expressive. Crafted for those who refuse
                            to blend in. Not merchandise, your identity, made tangible.
                        </p>
                        
                        <div className="social-icons">
                            <a href="mailto:studios.whoami@gmail.com" title="Email Us">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                                    <polyline points="22,6 12,13 2,6"></polyline>
                                </svg>
                            </a>
                            <a href="https://www.instagram.com/whoami.studios" target="_blank" rel="noopener noreferrer" title="Instagram">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                                </svg>
                            </a>
                            <a href="https://www.facebook.com/people/Whoami-Studios/61588942346952/" target="_blank" rel="noopener noreferrer" title="Facebook">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                                </svg>
                            </a>
                        </div>
                    </div>

                    {/* Shop Links */}
                    <div className="footer-column">
                        <h4 className="footer-heading">Shop</h4>
                        <ul className="footer-links-list">
                            <li><Link href="/products">All Products</Link></li>
                            <li><Link href="/products">Combos</Link></li>
                            <li><Link href="/products">Decor</Link></li>
                            <li><Link href="/products">Bookmarks</Link></li>
                            <li><Link href="/products">Charms</Link></li>
                        </ul>
                    </div>

                    {/* Company Links */}
                    <div className="footer-column">
                        <h4 className="footer-heading">Explore</h4>
                        <ul className="footer-links-list">
                            <li><Link href="/about">About Us</Link></li>
                            <li><Link href="/blog">Journal</Link></li>
                            <li><Link href="/careers">Careers</Link></li>
                            <li><Link href="/contact">Contact</Link></li>
                        </ul>
                    </div>

                    {/* Custom Orders CTA */}
                    <div className="footer-column">
                        <h4 className="footer-heading">Custom Orders</h4>
                        <p className="footer-text">
                            Looking for something uniquely yours? We craft personalized 3D identity artifacts.
                        </p>
                        <a 
                            href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '917891063938'}?text=Hi%2C%20I%20want%20to%20place%20a%20custom%20order!`}
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="footer-cta-btn"
                        >
                            Request Custom Piece
                        </a>
                        <p className="footer-india">🇮🇳 Crafted in Jaipur, India</p>
                    </div>

                </div>

                {/* Copyright */}
                <div className="footer-bottom">
                    <p className="footer-copyright">
                        © {currentYear} WhoAmI. Designed and crafted with ❤️
                    </p>
                    <p className="footer-made-by">
                        By <a href="https://github.com/ishitaAgarwal05/" target="_blank" rel="noopener noreferrer">Ishita Agarwal</a> & <a href="https://github.com/MayurSoni2003" target="_blank" rel="noopener noreferrer">Mayur Soni</a>
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;