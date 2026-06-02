'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '../../context/CartContext';
import './Navbar.css';

const Navbar = () => {
    const pathname = usePathname();
    const { toggleDrawer, getItemCount } = useCart();
    const itemCount = getItemCount();

    const navLinks = [
        { path: '/', label: 'HOME' },
        { path: '/products', label: 'PRODUCTS' },
        { path: '/about', label: 'ABOUT' },
        { path: '/blog', label: 'JOURNAL' },
        { path: '/contact', label: 'CONTACT' },
    ];

    const isActive = (path) => {
        return pathname === path;
    };

    return (
        <nav className="navbar">
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
                            <li key={link.path}>
                                <Link
                                    href={link.path}
                                    className={`navbar-link ${isActive(link.path) ? 'active' : ''}`}
                                >
                                    {link.label}
                                </Link>
                            </li>
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
