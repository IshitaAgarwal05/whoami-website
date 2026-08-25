'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '../../context/CartContext';
import config from '../../config';
import './Navbar.css';

const Navbar = () => {
    const pathname = usePathname();
    const { toggleDrawer, getItemCount } = useCart();
    const itemCount = getItemCount();

    const navLinks = [
        { path: '/', label: 'HOME' },
        { path: '/products', label: 'PRODUCTS' },
        { 
            label: 'ABOUT', 
            dropdown: [
                { path: '/about', label: 'OUR STORY' },
                { path: '/blog', label: 'JOURNAL' },
                { path: '/careers', label: 'CAREERS' }
            ] 
        },
        { path: '/contact', label: 'CONTACT' },
    ];

    const isActive = (path) => {
        return pathname === path;
    };

    const showAnnouncement = pathname === '/products' || pathname.startsWith('/products/');

    return (
        <nav className="navbar">
            {showAnnouncement && (
                <div className="announcement-bar">
                    <Link href={`https://wa.me/${config.WHATSAPP_NUMBER}?text=${encodeURIComponent('Hi, I am interested in bulk orders / wholesale rates.')}`} target="_blank" rel="noopener noreferrer">
                        BULK ORDERS? GET SPECIAL WHOLESALE RATES — CONTACT US ON WHATSAPP
                    </Link>
                </div>
            )}
            <div className="navbar-container container">
                <Link href="/" className="navbar-logo">
                    <img
                        src="/whoami_logo.png"
                        alt="WhoAmI Logo"
                        className="logo-image"
                        width="43"
                        height="43"
                    />
                    <div className="logo-text-container">
                        <span className="logo-text">WhoAmI</span>
                        <span className="logo-subtitle">Identity, crafted.</span>
                    </div>
                </Link>

                <div className="navbar-content">
                    <ul className="navbar-menu">
                        {navLinks.map((link) => (
                            link.dropdown ? (
                                <li key={link.label} className="navbar-dropdown-wrapper">
                                    <span className="navbar-link navbar-dropdown-trigger">
                                        {link.label} <span className="navbar-dropdown-caret">▼</span>
                                    </span>
                                    <ul className="navbar-dropdown-menu">
                                        {link.dropdown.map((subLink) => (
                                            <li key={subLink.path}>
                                                <Link
                                                    href={subLink.path}
                                                    className={`navbar-dropdown-link ${isActive(subLink.path) ? 'active' : ''}`}
                                                >
                                                    {subLink.label}
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                </li>
                            ) : (
                                <li key={link.path}>
                                    <Link
                                        href={link.path}
                                        className={`navbar-link ${isActive(link.path) ? 'active' : ''}`}
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            )
                        ))}
                    </ul>

                    <button className="navbar-cart-toggle" onClick={toggleDrawer} aria-label="Toggle Cart">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"></path>
                            <line x1="3" y1="6" x2="21" y2="6"></line>
                            <path d="M16 10a4 4 0 0 1-8 0"></path>
                        </svg>
                        {itemCount > 0 && (
                            <span className="cart-badge">{itemCount}</span>
                        )}
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
