'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import config from '../../config';

const OPEN_POSITIONS = [
    {
        id: '3d-modelling',
        title: '3D Modelling Intern',
        desc: 'Help us sculpt the future. Design high-fidelity, geometric collectibles of characters and vehicles from legendary universes.'
    },
    {
        id: 'crocheter',
        title: 'Crocheter',
        desc: 'Combine vintage handcrafted textile arts with modern pop-culture icons. Bring tactile softness to high-fantasy figurines.'
    },
    {
        id: 'robotics',
        title: 'Robotics Intern',
        desc: 'Infuse motion and automation. Work on micro-servos, custom lighting components, and interactive mechanical desk accessories.'
    }
];

export default function CareersClient() {
    const [selectedRole, setSelectedRole] = useState(null);
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        contactNumber: '',
        portfolioLink: '',
        resumeLink: ''
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
        if (!formData.fullName.trim() || formData.fullName.trim() === '.' || formData.fullName.trim() === '-') {
            return 'Please provide a valid Full Name.';
        }
        if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) {
            return 'Please provide a valid Email Address.';
        }
        if (!formData.contactNumber.trim() || formData.contactNumber.trim().length < 8) {
            return 'Please provide a valid Contact Number.';
        }
        if (!formData.portfolioLink.trim() || !formData.portfolioLink.trim().startsWith('http')) {
            return 'Please provide a valid Portfolio URL starting with http:// or https://.';
        }
        if (!formData.resumeLink.trim() || !formData.resumeLink.trim().startsWith('http')) {
            return 'Please provide a valid Resume URL starting with http:// or https://.';
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

        const messageString = `Role: ${selectedRole.title}\n\nContact Number:\n${formData.contactNumber.trim()}\n\nPortfolio:\n${formData.portfolioLink.trim()}\n\nResume:\n${formData.resumeLink.trim()}`;

        const payload = {
            name: formData.fullName.trim(),
            email: formData.email.trim(),
            subject: `Application for ${selectedRole.title}`,
            message: messageString
        };

        if (!config.GOOGLE_SCRIPT_URL) {
            console.warn('Google Script URL is not configured. Please check NEXT_PUBLIC_GOOGLE_SCRIPT_URL in .env.local.');
            setError('Failed to submit application: Submission endpoint is not configured.');
            setLoading(false);
            return;
        }

        try {
            await fetch(config.GOOGLE_SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });

            console.log('Application submitted successfully:', payload);
            setSubmitted(true);

            setTimeout(() => {
                setFormData({
                    fullName: '',
                    email: '',
                    contactNumber: '',
                    portfolioLink: '',
                    resumeLink: ''
                });
                setSubmitted(false);
                setSelectedRole(null);
            }, 5000);

        } catch (err) {
            console.warn('Error submitting application:', err);
            setError('Failed to submit application. Please check your internet connection and try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="careers-page">
            <div className="careers-bg-elements">
                <div className="blob blob-1"></div>
                <div className="blob blob-2"></div>
                <div className="blob blob-3"></div>
            </div>

            <div className="container">
                <div className="careers-header">
                    <div className="careers-badge">Careers</div>
                    <h1>Careers at WhoAmI</h1>
                    <p className="careers-subtitle">
                        Help us bring people's favorite universes to life. Join our creative tribe.
                    </p>
                </div>

                <div className="roles-grid">
                    {OPEN_POSITIONS.map((role) => (
                        <motion.div
                            key={role.id}
                            className="role-card"
                            whileHover={{ y: -5 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                        >
                            <div className="role-card-content">
                                <h2>{role.title}</h2>
                                <p>{role.desc}</p>
                            </div>
                            <button
                                onClick={() => setSelectedRole(role)}
                                className="btn-primary"
                            >
                                Apply Now
                            </button>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Application Modal */}
            <AnimatePresence>
                {selectedRole && (
                    <motion.div
                        className="modal-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => {
                            if (!loading) {
                                setSelectedRole(null);
                                setError(null);
                            }
                        }}
                    >
                        <motion.div
                            className="modal-content"
                            initial={{ scale: 0.95, y: 15 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 15 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Close button is outside modal-inner so it never scrolls away */}
                            <button
                                className="modal-close-btn"
                                onClick={() => {
                                    if (!loading) {
                                        setSelectedRole(null);
                                        setError(null);
                                    }
                                }}
                                disabled={loading}
                                aria-label="Close"
                            >
                                &times;
                            </button>

                            <div className="modal-inner">
                                {submitted ? (
                                    <div className="success-message">
                                        <div className="success-icon">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                                <polyline points="20 6 9 17 4 12"></polyline>
                                            </svg>
                                        </div>
                                        <h3>Application Received!</h3>
                                        <p>Thank you for applying. We have received your application for the {selectedRole.title} position and our team will review it shortly.</p>
                                    </div>
                                ) : (
                                    <>
                                        <h2>Apply to Join Us</h2>
                                        <p className="modal-desc">Complete the form below to submit your application for the position of <strong>{selectedRole.title}</strong>.</p>

                                        {error && (
                                            <div className="error-message">
                                                <p>{error}</p>
                                            </div>
                                        )}

                                        <form className="app-form" onSubmit={handleSubmit}>
                                            <div className="form-group-read-only">
                                                <label>Subject</label>
                                                <div className="read-only-subject-box">
                                                    Application for {selectedRole.title}
                                                </div>
                                            </div>

                                            <div className="floating-label">
                                                <input
                                                    type="text"
                                                    id="fullName"
                                                    name="fullName"
                                                    value={formData.fullName}
                                                    onChange={handleChange}
                                                    required
                                                    placeholder=" "
                                                    disabled={loading}
                                                />
                                                <label htmlFor="fullName">Full Name</label>
                                            </div>

                                            <div className="floating-label">
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

                                            <div className="floating-label">
                                                <input
                                                    type="tel"
                                                    id="contactNumber"
                                                    name="contactNumber"
                                                    value={formData.contactNumber}
                                                    onChange={handleChange}
                                                    required
                                                    placeholder=" "
                                                    disabled={loading}
                                                />
                                                <label htmlFor="contactNumber">Contact Number</label>
                                            </div>

                                            <div className="floating-label">
                                                <input
                                                    type="url"
                                                    id="portfolioLink"
                                                    name="portfolioLink"
                                                    value={formData.portfolioLink}
                                                    onChange={handleChange}
                                                    required
                                                    placeholder=" "
                                                    disabled={loading}
                                                />
                                                <label htmlFor="portfolioLink">Portfolio Link (e.g. Behance, GitHub, Dribbble)</label>
                                            </div>

                                            <div className="floating-label">
                                                <input
                                                    type="url"
                                                    id="resumeLink"
                                                    name="resumeLink"
                                                    value={formData.resumeLink}
                                                    onChange={handleChange}
                                                    required
                                                    placeholder=" "
                                                    disabled={loading}
                                                />
                                                <label htmlFor="resumeLink">Resume Link (e.g. Google Drive, Dropbox, PDF URL)</label>
                                            </div>

                                            <button type="submit" className="btn-primary" disabled={loading}>
                                                {loading ? 'Submitting...' : 'Submit Application'}
                                            </button>
                                        </form>
                                    </>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
