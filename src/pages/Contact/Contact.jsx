import { useState } from 'react';
import './Contact.css';

// IMPORTANT: Replace this URL with your deployed Google Apps Script Web App URL
// Get it from: Extensions > Apps Script > Deploy > New deployment > Web app URL
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbztif46bJmM11JFhEZTTbB3F07cVR0wnja4f_soFYLLcUWB3_5nft5ytRa853BBI18t/exec';

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // Submit to Google Sheets via Apps Script
            const response = await fetch(GOOGLE_SCRIPT_URL, {
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
            <div className="container">
                {/* Header */}
                <div className="contact-header">
                    <h1>Get in Touch</h1>
                    <p className="contact-subtitle">
                        Have questions about our products? Want to discuss custom designs?
                        We'd love to hear from you.
                    </p>
                </div>

                <div className="contact-grid">
                    {/* Contact Form */}
                    <div className="contact-form-section">
                        <h2>Send us a Message</h2>

                        {error && (
                            <div className="error-message" style={{
                                padding: '1rem',
                                marginBottom: '1rem',
                                backgroundColor: '#fee',
                                border: '1px solid #fcc',
                                borderRadius: '8px',
                                color: '#c33'
                            }}>
                                <p>{error}</p>
                            </div>
                        )}

                        {submitted ? (
                            <div className="success-message">
                                <div className="success-icon">✓</div>
                                <h3>Thank you!</h3>
                                <p>
                                    Your message has been received. We'll get back to you shortly.
                                </p>
                            </div>
                        ) : (
                            <form className="contact-form" onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <label htmlFor="name">Name</label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        placeholder="Your full name"
                                        disabled={loading}
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="email">Email</label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        placeholder="your.email@example.com"
                                        disabled={loading}
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="subject">Subject</label>
                                    <input
                                        type="text"
                                        id="subject"
                                        name="subject"
                                        value={formData.subject}
                                        onChange={handleChange}
                                        required
                                        placeholder="What's this about?"
                                        disabled={loading}
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="message">Message</label>
                                    <textarea
                                        id="message"
                                        name="message"
                                        value={formData.message}
                                        onChange={handleChange}
                                        required
                                        rows="6"
                                        placeholder="Tell us more..."
                                        disabled={loading}
                                    ></textarea>
                                </div>

                                <button type="submit" className="btn-primary" disabled={loading}>
                                    {loading ? 'Sending...' : 'Send Message'}
                                </button>
                            </form>
                        )}
                    </div>

                    {/* Contact Info */}
                    <div className="contact-info-section">
                        <h2>Contact Information</h2>

                        <div className="contact-details">
                            <div className="contact-item">
                                <div className="contact-icon">✉</div>
                                <div className="contact-content">
                                    <h3>Email</h3>
                                    <a href="mailto:studios.whoami@gmail.com">studios.whoami@gmail.com</a>
                                </div>
                            </div>

                            <div className="contact-item">
                                <div className="contact-icon">📍</div>
                                <div className="contact-content">
                                    <h3>Location</h3>
                                    <p>Jaipur, India 🇮🇳</p>
                                </div>
                            </div>

                            <div className="contact-item">
                                <div className="contact-icon">📷</div>
                                <div className="contact-content">
                                    <h3>Instagram</h3>
                                    <a href="https://www.instagram.com/whoami.studios" target="_blank" rel="noopener noreferrer">@whoami.studios</a>
                                </div>
                            </div>
                        </div>

                        <div className="contact-note">
                            <h3>Connect with Us</h3>
                            <p>
                                Follow us on Instagram <strong>@whoami.studios</strong> for behind-the-scenes
                                content and new product releases. Or find us on Pinterest for design inspiration.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Contact;
