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
                    <div className="footer-column">
                        <div className="footer-brand-container">
                            <img src="/whoami_logo.png" alt="WhoAmI Logo" className="footer-logo" />
                            <div>
                                <h3 className="footer-brand">WhoAmI</h3>
                                <p className="footer-tagline">Identity. Chosen. Worn. Lived.</p>
                            </div>
                        </div>
                        <p className="footer-description">
                            3D Printed Artifacts for the quietly expressive. Crafted for those who refuse
                            to blend in. Kidults Focused. Not merchandise, your identity, made tangible.
                        </p>
                        <p className="footer-india">🇮🇳 Crafted in Jaipur, India</p>
                    </div>

                    {/* Contact Info */}
                    <div className="footer-column">
                        <h4 className="footer-heading">Connect with Us</h4>
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