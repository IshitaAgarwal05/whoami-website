import { useState } from 'react';
import config from '../../config';
import './Contact.css';

const Contact = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: '',
    });

    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const validateForm = () => {
        for (const [key, value] of Object.entries(formData)) {
            const trimmedValue = value.trim();
            if (!trimmedValue) {
                return `Please fill out the ${key} field.`;
            }
            if (trimmedValue === '.' || trimmedValue === '-') {
                return `The ${key} field cannot be just a "." or "-". Please provide meaningful information.`;
            }
        }
        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const validationError = validateForm();
        if (validationError) {
            setError(validationError);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // Submit to Google Sheets via Apps Script
            const response = await fetch(config.GOOGLE_SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors', // Important for Google Apps Script
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            // Note: no-cors mode doesn't allow reading the response
            // We assume success if no error is thrown
            console.log('Form submitted successfully:', formData);
            setSubmitted(true);

            // Reset form after 5 seconds
            setTimeout(() => {
                setFormData({ name: '', email: '', subject: '', message: '' });
                setSubmitted(false);
            }, 5000);

        } catch (err) {
            console.error('Error submitting form:', err);
            setError('Failed to submit form. Please try again or email us directly.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="contact-page">
            {/* Background Decorative Elements */}
            <div className="contact-bg-elements">
                <div className="blob blob-1"></div>
                <div className="blob blob-2"></div>
                <div className="blob blob-3"></div>
            </div>

            <div className="container">
                {/* Header */}
                <div className="contact-header">
                    <div className="contact-badge">Contact Us</div>
                    <h1>Get in Touch</h1>
                    <p className="contact-subtitle">
                        Have questions about our products or want to discuss a custom design?
                        We're here to help bring your vision to life.
                    </p>
                </div>

                <div className="contact-grid">
                    {/* Contact Form */}
                    <div className="contact-form-section">
                        <div className="glass-card form-container">
                            <div className="section-title">
                                <h2>Send us a Message</h2>
                                <p>Fill out the form below and we'll get back to you within 24 hours.</p>
                            </div>

                            {error && (
                                <div className="error-message">
                                    <p>{error}</p>
                                </div>
                            )}

                            {submitted ? (
                                <div className="success-message">
                                    <div className="success-glow"></div>
                                    <div className="success-icon">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                            <polyline points="20 6 9 17 4 12"></polyline>
                                        </svg>
                                    </div>
                                    <h3>Message Received!</h3>
                                    <p>Thank you for reaching out. We've received your inquiry and will be in touch shortly.</p>
                                    <button onClick={() => setSubmitted(false)} className="btn-secondary">Send Another</button>
                                </div>
                            ) : (
                                <form className="contact-form" onSubmit={handleSubmit}>
                                    <div className="form-row">
                                        <div className="form-group floating-label">
                                            <input
                                                type="text"
                                                id="name"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                required
                                                placeholder=" "
                                                disabled={loading}
                                            />
                                            <label htmlFor="name">Full Name</label>
                                        </div>

                                        <div className="form-group floating-label">
                                            <input
                                                type="email"
                                                id="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                required
                                                placeholder=" "
                                                disabled={loading}
                                            />
                                            <label htmlFor="email">Email Address</label>
                                        </div>
                                    </div>

                                    <div className="form-group floating-label">
                                        <input
                                            type="text"
                                            id="subject"
                                            name="subject"
                                            value={formData.subject}
                                            onChange={handleChange}
                                            required
                                            placeholder=" "
                                            disabled={loading}
                                        />
                                        <label htmlFor="subject">Subject</label>
                                    </div>

                                    <div className="form-group floating-label">
                                        <textarea
                                            id="message"
                                            name="message"
                                            value={formData.message}
                                            onChange={handleChange}
                                            required
                                            rows="5"
                                            placeholder=" "
                                            disabled={loading}
                                        ></textarea>
                                        <label htmlFor="message">Your Message</label>
                                    </div>

                                    <button type="submit" className="btn-primary" disabled={loading}>
                                        <span className="btn-text">{loading ? 'Sending...' : 'Send Message'}</span>
                                        <span className="btn-glow"></span>
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>

                    {/* Contact Info */}
                    <div className="contact-info-section">
                        <div className="section-title" style={{ textAlign: "left" }}>
                            <h2>Connect Directly</h2>
                            <p>Prefer other ways to reach out? Use the details below.</p>
                        </div>

                        <div className="contact-cards-stack">
                            <a href="mailto:studios.whoami@gmail.com" className="contact-info-card">
                                <div className="card-icon">✉</div>
                                <div className="card-content">
                                    <span className="card-label">Email Us</span>
                                    <span className="card-value">studios.whoami@gmail.com</span>
                                </div>
                                <div className="card-arrow">→</div>
                            </a>

                            <div className="contact-info-card">
                                <div className="card-icon">📍</div>
                                <div className="card-content">
                                    <span className="card-label">Our Base</span>
                                    <span className="card-value">Jaipur, India 🇮🇳</span>
                                </div>
                            </div>

                            <a href="https://www.instagram.com/whoami.studios" target="_blank" rel="noopener noreferrer" className="contact-info-card">
                                <div className="card-icon">📷</div>
                                <div className="card-content">
                                    <span className="card-label">Instagram</span>
                                    <span className="card-value">@whoami.studios</span>
                                </div>
                                <div className="card-arrow">→</div>
                            </a>
                        </div>

                        <div className="glass-card newsletter-teaser">
                            <h3>Stay Inspired</h3>
                            <p>Follow us for behind-the-scenes content and new limited-edition releases.</p>
                            <div className="social-links">
                                <span className="hashtag">#WhoAmIStudios</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Contact;
