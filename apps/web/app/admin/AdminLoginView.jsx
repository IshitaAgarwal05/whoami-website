'use client';

import { useState } from 'react';

export default function AdminLoginView({ onLogin }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);

        try {
            const res = onLogin(username, password);
            if (!res.success) {
                setError(res.error || 'Authentication failed. Please verify credentials.');
            }
        } catch (err) {
            setError('An error occurred during authentication.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="admin-auth-screen">
            <div className="admin-auth-glow" />
            <div className="admin-auth-card">
                <div className="admin-auth-header">
                    <div className="admin-auth-brand-logo">
                        <img src="/whoami_logo.png" alt="WhoAmI Studios" />
                    </div>
                    <div className="admin-auth-badge">
                        <span>Protected Portal</span>
                    </div>
                    <h2>WhoAmI Admin Studio</h2>
                    <p>Enter administrative credentials to access visitor telemetry, announcements CMS, and design studio.</p>
                </div>

                <form onSubmit={handleSubmit} className="admin-auth-form">
                    {error && (
                        <div className="admin-auth-error">
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10"></circle>
                                <line x1="12" y1="8" x2="12" y2="12"></line>
                                <line x1="12" y1="16" x2="12.01" y2="16"></line>
                            </svg>
                            <span>{error}</span>
                        </div>
                    )}

                    <div className="admin-auth-field">
                        <label className="admin-auth-label" htmlFor="admin-username">Username</label>
                        <div className="admin-auth-input-wrap">
                            <input
                                id="admin-username"
                                type="text"
                                className="admin-auth-input"
                                placeholder="Enter username (e.g. admin)"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                autoFocus
                                required
                                autoComplete="username"
                            />
                        </div>
                    </div>

                    <div className="admin-auth-field">
                        <label className="admin-auth-label" htmlFor="admin-password">Password</label>
                        <div className="admin-auth-input-wrap">
                            <input
                                id="admin-password"
                                type={showPassword ? 'text' : 'password'}
                                className="admin-auth-input"
                                placeholder="Enter password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                autoComplete="current-password"
                            />
                            <button
                                type="button"
                                className="admin-auth-toggle-pwd"
                                onClick={() => setShowPassword(!showPassword)}
                                title={showPassword ? 'Hide password' : 'Show password'}
                            >
                                {showPassword ? (
                                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                                        <line x1="1" y1="1" x2="23" y2="23"></line>
                                    </svg>
                                ) : (
                                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                        <circle cx="12" cy="12" r="3"></circle>
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="admin-auth-btn"
                        disabled={submitting}
                    >
                        <span>{submitting ? 'Verifying...' : 'Sign In to Admin Portal'}</span>
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                            <polyline points="12 5 19 12 12 19"></polyline>
                        </svg>
                    </button>

                    <div className="admin-auth-hint">
                        <span>Authorized personnel only • Default: <code>admin</code> / <code>admin</code></span>
                    </div>
                </form>
            </div>
        </div>
    );
}
