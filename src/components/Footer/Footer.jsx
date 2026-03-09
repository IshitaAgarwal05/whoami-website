import { Link } from 'react-router-dom';
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
                            Artifacts for the quietly expressive. Crafted in Jaipur for those who
                            refuse to blend in. Not merchandise, your identity, made tangible.
                        </p>
                        <p className="footer-india">🇮🇳 Crafted in Jaipur, India</p>
                    </div>

                    {/* Quick Links */}
                    <div className="footer-column">
                        <h4 className="footer-heading">Quick Links</h4>
                        <ul className="footer-links">
                            <li><Link to="/" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>Home</Link></li>
                            <li><Link to="/products" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>Products</Link></li>
                            <li><Link to="/about" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>About</Link></li>
                            {/* <li><Link to="/blog">Journal</Link></li> */}
                            <li>
                                <Link
                                    to="/contact"
                                    onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                                >
                                    Contact
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Worlds */}
                    <div className="footer-column">
                        <h4 className="footer-heading">Worlds</h4>
                        <ul className="footer-links">
                            <li><Link to="/products?category=Desk Accessories">Desk Artifacts</Link></li>
                            <li><Link to="/products?category=Collectibles">Collectibles</Link></li>
                            <li><Link to="/products?category=Gifts">Wearables & Gifts</Link></li>
                            <li><Link to="/products?category=Puzzles">Puzzles & Games</Link></li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div className="footer-column">
                        <h4 className="footer-heading">Connect</h4>
                        <ul className="footer-links">
                            <li><a href="mailto:studios.whoami@gmail.com">studios.whoami@gmail.com</a></li>
                            <li><a href="https://www.instagram.com/whoami.studios" target="_blank" rel="noopener noreferrer">Instagram</a></li>
                            <li><a href="https://www.pinterest.com/studioswhoami/" target="_blank" rel="noopener noreferrer">Pinterest</a></li>
                        </ul>
                        <p className="footer-location">Jaipur, India 🇮🇳</p>
                    </div>
                </div>

                {/* Copyright */}
                <div className="footer-bottom">
                    <p className="footer-copyright">
                        © {currentYear} WhoAmI. Designed and crafted with ❤️ in Jaipur for the quietly expressive.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
