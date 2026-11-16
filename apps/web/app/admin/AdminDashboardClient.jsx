'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import config, { getApiUrl } from '../../config';
import { useAdminAuth } from '../../context/AdminAuthContext';
import AdminLoginView from './AdminLoginView';
import CssGeneratorTab from './css-generator/CssGeneratorTab';
import './admin.css';

export default function AdminDashboardClient() {
    const { user, isAuthenticated, isLoading: authLoading, login, logout } = useAdminAuth();

    // Active navigation tab: 'analytics' | 'announcements' | 'css-generator' | 'strapi'
    const [activeTab, setActiveTab] = useState('analytics');

    // Analytics state
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [simulating, setSimulating] = useState(false);
    const [timeRange, setTimeRange] = useState('all');
    const [toastMessage, setToastMessage] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [countrySearch, setCountrySearch] = useState('');

    // Announcements state (Strapi sync)
    const [announcements, setAnnouncements] = useState([]);
    const [announcementsLoading, setAnnouncementsLoading] = useState(false);
    const [newText, setNewText] = useState('');
    const [newType, setNewType] = useState('promo');
    const [newIsActive, setNewIsActive] = useState(true);
    const [submittingAnnouncement, setSubmittingAnnouncement] = useState(false);
    const [editingItem, setEditingItem] = useState(null);

    const showToast = (msg) => {
        setToastMessage(msg);
        setTimeout(() => {
            setToastMessage(null);
        }, 3500);
    };

    // ----------------------------------------------------
    // Fetch Analytics Data
    // ----------------------------------------------------
    const fetchStats = async (range = timeRange) => {
        try {
            setLoading(true);
            const endpoint = getApiUrl(`/api/v1/analytics/stats?timeRange=${range}`);
            const res = await fetch(endpoint);
            const json = await res.json();
            if (json.success) {
                setStats(json.data);
            }
        } catch (err) {
            console.error('Failed to fetch analytics:', err);
            showToast('⚠️ Could not connect to analytics backend.');
        } finally {
            setLoading(false);
        }
    };

    // ----------------------------------------------------
    // Fetch Announcements from Strapi
    // ----------------------------------------------------
    const fetchAnnouncements = async () => {
        try {
            setAnnouncementsLoading(true);
            const endpoint = getApiUrl('/api/v1/announcements');
            const res = await fetch(endpoint);
            const json = await res.json();
            if (json.success) {
                setAnnouncements(json.data || []);
            }
        } catch (err) {
            console.error('Failed to fetch announcements:', err);
            showToast('⚠️ Could not connect to Strapi announcements.');
        } finally {
            setAnnouncementsLoading(false);
        }
    };

    useEffect(() => {
        if (isAuthenticated) {
            fetchStats(timeRange);
            fetchAnnouncements();
        }
    }, [isAuthenticated, timeRange]);

    // ----------------------------------------------------
    // Analytics Simulation & Reset
    // ----------------------------------------------------
    const handleSimulate = async (count = 35) => {
        try {
            setSimulating(true);
            const endpoint = getApiUrl('/api/v1/analytics/simulate');
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ count })
            });
            const json = await res.json();
            if (json.success) {
                showToast(`Simulated ${count} visits across global IPs`);
                await fetchStats(timeRange);
            } else {
                showToast('Simulation failed: ' + (json.error || 'Unknown error'));
            }
        } catch (err) {
            console.error('Simulation error:', err);
            showToast('Could not reach backend');
        } finally {
            setSimulating(false);
        }
    };

    const handleReset = async () => {
        if (!window.confirm('Reset all visitor analytics logs?')) return;
        try {
            setLoading(true);
            const endpoint = getApiUrl('/api/v1/analytics/reset');
            const res = await fetch(endpoint, { method: 'DELETE' });
            const json = await res.json();
            if (json.success) {
                showToast('Analytics logs cleared');
                await fetchStats(timeRange);
            }
        } catch (err) {
            console.error('Reset error:', err);
            showToast('Failed to clear analytics');
        } finally {
            setLoading(false);
        }
    };

    // ----------------------------------------------------
    // Announcements CRUD Handlers
    // ----------------------------------------------------
    const handleCreateAnnouncement = async (e) => {
        e.preventDefault();
        if (!newText.trim()) return;

        try {
            setSubmittingAnnouncement(true);
            const endpoint = getApiUrl('/api/v1/announcements');
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text: newText.trim(),
                    type: newType,
                    is_active: newIsActive
                })
            });
            const json = await res.json();
            if (json.success) {
                showToast('Announcement published to Strapi');
                setNewText('');
                fetchAnnouncements();
            } else {
                showToast('Failed to save announcement');
            }
        } catch (err) {
            showToast('Failed to reach Strapi');
        } finally {
            setSubmittingAnnouncement(false);
        }
    };

    const handleToggleActive = async (item) => {
        const nextStatus = !item.is_active;
        try {
            const endpoint = getApiUrl(`/api/v1/announcements/${item.documentId}`);
            const res = await fetch(endpoint, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ is_active: nextStatus })
            });
            const json = await res.json();
            if (json.success) {
                showToast(`Announcement set to ${nextStatus ? 'Active' : 'Inactive'}`);
                setAnnouncements(prev => prev.map(a => a.documentId === item.documentId ? { ...a, is_active: nextStatus } : a));
            }
        } catch (err) {
            showToast('Could not update status');
        }
    };

    const handleDeleteAnnouncement = async (documentId) => {
        if (!window.confirm('Delete this announcement?')) return;
        try {
            const endpoint = getApiUrl(`/api/v1/announcements/${documentId}`);
            const res = await fetch(endpoint, { method: 'DELETE' });
            const json = await res.json();
            if (json.success) {
                showToast('Announcement deleted');
                setAnnouncements(prev => prev.filter(a => a.documentId !== documentId));
            }
        } catch (err) {
            showToast('Failed to delete');
        }
    };

    const handleSaveEdit = async () => {
        if (!editingItem || !editingItem.text.trim()) return;
        try {
            const endpoint = getApiUrl(`/api/v1/announcements/${editingItem.documentId}`);
            const res = await fetch(endpoint, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text: editingItem.text.trim(),
                    type: editingItem.type,
                    is_active: editingItem.is_active
                })
            });
            const json = await res.json();
            if (json.success) {
                showToast('Announcement updated');
                setEditingItem(null);
                fetchAnnouncements();
            }
        } catch (err) {
            showToast('Could not save changes');
        }
    };

    // Filter recent visits by search query
    const filteredRecentVisits = useMemo(() => {
        if (!stats?.recentVisits) return [];
        if (!searchQuery.trim()) return stats.recentVisits;
        const q = searchQuery.toLowerCase();
        return stats.recentVisits.filter(v =>
            (v.ip_address && v.ip_address.toLowerCase().includes(q)) ||
            (v.country_name && v.country_name.toLowerCase().includes(q)) ||
            (v.country_code && v.country_code.toLowerCase().includes(q)) ||
            (v.city && v.city.toLowerCase().includes(q)) ||
            (v.os && v.os.toLowerCase().includes(q)) ||
            (v.path && v.path.toLowerCase().includes(q))
        );
    }, [stats?.recentVisits, searchQuery]);

    // Filter countries by search
    const filteredCountries = useMemo(() => {
        if (!stats?.countries) return [];
        if (!countrySearch.trim()) return stats.countries;
        const q = countrySearch.toLowerCase();
        return stats.countries.filter(c =>
            (c.country_name && c.country_name.toLowerCase().includes(q)) ||
            (c.country_code && c.country_code.toLowerCase().includes(q))
        );
    }, [stats?.countries, countrySearch]);

    // Active announcement for live preview banner
    const activeAnnouncement = useMemo(() => {
        return announcements.find(a => a.is_active) || null;
    }, [announcements]);

    // Max visits for timeline bar scaling
    const maxTimelineVisits = useMemo(() => {
        if (!stats?.timeline || stats.timeline.length === 0) return 1;
        return Math.max(...stats.timeline.map(t => t.total_visits), 1);
    }, [stats?.timeline]);

    const formatTimestamp = (iso) => {
        if (!iso) return '-';
        try {
            const date = new Date(iso);
            return date.toLocaleString('en-IN', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return iso;
        }
    };

    const getOsIcon = (os = '') => {
        const o = os.toLowerCase();
        if (o.includes('mac') || o === 'ios') return '🍏';
        if (o.includes('win')) return '🪟';
        if (o.includes('android')) return '🤖';
        if (o.includes('linux')) return '🐧';
        return '💻';
    };

    if (authLoading) {
        return (
            <div className="admin-auth-screen">
                <div className="admin-loading">
                    <div className="admin-spinner"></div>
                    <span style={{ color: '#a1a1aa', fontSize: '0.9rem' }}>Verifying authorization...</span>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <AdminLoginView onLogin={login} />;
    }

    return (
        <div className="admin-container">
            {/* Header */}
            <header className="admin-header">
                <div className="admin-title-area">
                    <h1>
                        WhoAmI Admin Portal
                        <span className="admin-badge-live">
                            <span className="admin-live-dot"></span>
                            Live System
                        </span>
                    </h1>
                    <p className="admin-subtitle">
                        Storefront traffic telemetry, announcements, and design system controls
                    </p>
                </div>

                <div className="admin-actions">
                    {activeTab === 'analytics' && (
                        <>
                            <div className="admin-time-filters">
                                <button
                                    className={`time-btn ${timeRange === 'all' ? 'active' : ''}`}
                                    onClick={() => setTimeRange('all')}
                                >
                                    All Time
                                </button>
                                <button
                                    className={`time-btn ${timeRange === 'today' ? 'active' : ''}`}
                                    onClick={() => setTimeRange('today')}
                                >
                                    Today
                                </button>
                                <button
                                    className={`time-btn ${timeRange === '7d' ? 'active' : ''}`}
                                    onClick={() => setTimeRange('7d')}
                                >
                                    7D
                                </button>
                                <button
                                    className={`time-btn ${timeRange === '30d' ? 'active' : ''}`}
                                    onClick={() => setTimeRange('30d')}
                                >
                                    30D
                                </button>
                            </div>

                            <button
                                className="btn-secondary-action"
                                onClick={() => handleSimulate(30)}
                                disabled={simulating}
                                title="Simulate 30 requests from global IP addresses"
                            >
                                <span>{simulating ? 'Simulating...' : '+ Simulate Traffic'}</span>
                            </button>

                            <button
                                className="btn-secondary-action"
                                onClick={() => fetchStats(timeRange)}
                                title="Refresh"
                            >
                                ⟳
                            </button>

                            <button
                                className="btn-secondary-action btn-danger-action"
                                onClick={handleReset}
                                title="Clear logs"
                            >
                                Clear
                            </button>
                        </>
                    )}

                    {activeTab === 'announcements' && (
                        <>
                            <button
                                className="btn-secondary-action"
                                onClick={fetchAnnouncements}
                                title="Refresh announcements from Strapi"
                            >
                                ⟳ Refresh
                            </button>
                            <a
                                href="http://localhost:1337/admin/content-manager/collection-types/api::announcement.announcement?page=1&pageSize=10&sort=text:ASC"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn-secondary-action"
                            >
                                Strapi Admin ↗
                            </a>
                        </>
                    )}

                    {/* Admin User Info & Logout Button */}
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginLeft: '6px', borderLeft: '1px solid #262626', paddingLeft: '12px' }}>
                        <div className="admin-user-pill" title="Super Administrator">
                            <span className="admin-user-dot"></span>
                            <span>admin</span>
                        </div>
                        <button
                            onClick={logout}
                            className="btn-admin-logout"
                            title="Sign out of Admin Portal"
                        >
                            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                                <polyline points="16 17 21 12 16 7"></polyline>
                                <line x1="21" y1="12" x2="9" y2="12"></line>
                            </svg>
                            <span>Logout</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Navigation Tabs */}
            <nav className="admin-nav-tabs">
                <button
                    className={`admin-nav-tab ${activeTab === 'analytics' ? 'active' : ''}`}
                    onClick={() => setActiveTab('analytics')}
                >
                    <span>Visitor Analytics</span>
                    <span className="admin-tab-count">{stats?.totalVisits ?? 0}</span>
                </button>

                <button
                    className={`admin-nav-tab ${activeTab === 'announcements' ? 'active' : ''}`}
                    onClick={() => setActiveTab('announcements')}
                >
                    <span>Announcements</span>
                    <span className="admin-tab-count">{announcements.length}</span>
                </button>

                <button
                    className={`admin-nav-tab ${activeTab === 'css-generator' ? 'active' : ''}`}
                    onClick={() => setActiveTab('css-generator')}
                >
                    <span>CSS Generator</span>
                </button>

                <button
                    className={`admin-nav-tab ${activeTab === 'strapi' ? 'active' : ''}`}
                    onClick={() => setActiveTab('strapi')}
                >
                    <span>Strapi CMS</span>
                </button>
            </nav>

            {/* TAB 1: VISITOR ANALYTICS & OS RECOGNITION */}
            {activeTab === 'analytics' && (
                <>
                    {loading && !stats ? (
                        <div className="admin-loading">
                            <div className="admin-spinner"></div>
                            <p>Loading analytics data...</p>
                        </div>
                    ) : (
                        <>
                            {/* Key Performance Indicators */}
                            <section className="kpi-grid">
                                <div className="kpi-card">
                                    <div className="kpi-header">
                                        <span className="kpi-title">Total Visits</span>
                                        <span className="kpi-icon">📈</span>
                                    </div>
                                    <div className="kpi-value">{stats?.totalVisits ?? 0}</div>
                                    <div className="kpi-footer">
                                        <span>Total page hits</span>
                                    </div>
                                </div>

                                <div className="kpi-card">
                                    <div className="kpi-header">
                                        <span className="kpi-title">Unique Visitors</span>
                                        <span className="kpi-icon">👤</span>
                                    </div>
                                    <div className="kpi-value">{stats?.uniqueVisitors ?? 0}</div>
                                    <div className="kpi-footer">
                                        <span className="kpi-trend">
                                            {stats?.totalVisits > 0
                                                ? `${((stats.uniqueVisitors / stats.totalVisits) * 100).toFixed(0)}%`
                                                : '0%'}
                                        </span>
                                        <span>unique IP ratio</span>
                                    </div>
                                </div>

                                <div className="kpi-card">
                                    <div className="kpi-header">
                                        <span className="kpi-title">Countries Reached</span>
                                        <span className="kpi-icon">🌐</span>
                                    </div>
                                    <div className="kpi-value">{stats?.countries?.length ?? 0}</div>
                                    <div className="kpi-footer">
                                        <span>Geolocated nations</span>
                                    </div>
                                </div>

                                <div className="kpi-card">
                                    <div className="kpi-header">
                                        <span className="kpi-title">Top Operating System</span>
                                        <span className="kpi-icon">💻</span>
                                    </div>
                                    <div className="kpi-value" style={{ fontSize: '1.6rem' }}>
                                        {stats?.operatingSystems?.[0]?.os || 'Awaiting Data'}
                                    </div>
                                    <div className="kpi-footer">
                                        <span>
                                            {stats?.operatingSystems?.[0]
                                                ? `${stats.operatingSystems[0].count} visits (${stats.totalVisits > 0 ? ((stats.operatingSystems[0].count / stats.totalVisits) * 100).toFixed(0) : 0}%)`
                                                : 'No visits yet'}
                                        </span>
                                    </div>
                                </div>
                            </section>

                            {/* 2-Column Section: Countries & Traffic/Systems */}
                            <div className="admin-grid-2col">
                                {/* Left: Country Audience */}
                                <div className="admin-card">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
                                        <h2 className="admin-section-title" style={{ margin: 0 }}>
                                            <span>Audience by Country</span>
                                            <span className="section-tag">{stats?.countries?.length ?? 0}</span>
                                        </h2>
                                        <input
                                            type="text"
                                            placeholder="Filter country..."
                                            value={countrySearch}
                                            onChange={(e) => setCountrySearch(e.target.value)}
                                            style={{
                                                background: '#161616',
                                                border: '1px solid #242424',
                                                color: '#faf9f6',
                                                padding: '4px 10px',
                                                borderRadius: '6px',
                                                fontSize: '0.78rem',
                                                outline: 'none'
                                            }}
                                        />
                                    </div>

                                    {filteredCountries.length === 0 ? (
                                        <div className="admin-empty-state">
                                            <p>No country visits recorded yet.</p>
                                        </div>
                                    ) : (
                                        <div className="countries-list">
                                            {filteredCountries.map((c, idx) => (
                                                <div className="country-row" key={`${c.country_code}-${idx}`}>
                                                    <div className="country-info">
                                                        <div className="country-main">
                                                            <span className="country-flag">{c.flag}</span>
                                                            <span className="country-name">{c.country_name}</span>
                                                            <span className="country-code-pill">{c.country_code}</span>
                                                        </div>
                                                        <div className="country-stats-nums">
                                                            <span className="country-unique-count">{c.unique_visitors} unique</span>
                                                            <span className="country-visits-count">{c.total_visits} ({c.percentage}%)</span>
                                                        </div>
                                                    </div>
                                                    <div className="country-progress-bar">
                                                        <div
                                                            className="country-progress-fill"
                                                            style={{ width: `${Math.max(Number(c.percentage), 3)}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Right: Traffic Trend & OS/Device Breakdown */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                    {/* Daily Traffic Histogram */}
                                    <div className="admin-card">
                                        <h2 className="admin-section-title">
                                            <span>Traffic Trend</span>
                                            <span className="section-tag">Daily</span>
                                        </h2>
                                        {(!stats?.timeline || stats.timeline.length === 0) ? (
                                            <div className="admin-empty-state" style={{ padding: '20px' }}>
                                                <p>No timeline data yet</p>
                                            </div>
                                        ) : (
                                            <div className="chart-container">
                                                <div className="bars-chart">
                                                    {stats.timeline.slice(-8).map((t, idx) => {
                                                        const heightPct = Math.max((t.total_visits / maxTimelineVisits) * 100, 8);
                                                        return (
                                                            <div className="bar-column" key={idx}>
                                                                <span className="bar-value">{t.total_visits}</span>
                                                                <div
                                                                    className="bar-pillar"
                                                                    style={{ height: `${heightPct}%` }}
                                                                    title={`${t.date}: ${t.total_visits} visits (${t.unique_visitors} unique)`}
                                                                ></div>
                                                                <span className="bar-label">{t.date.slice(5)}</span>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Operating Systems & Devices Side-by-Side */}
                                    <div className="admin-card">
                                        <h2 className="admin-section-title">
                                            <span>Platforms & Systems</span>
                                        </h2>
                                        <div className="platform-grid">
                                            {/* OS List */}
                                            <div>
                                                <span style={{ fontSize: '0.75rem', color: '#71717a', textTransform: 'uppercase', fontWeight: 600 }}>
                                                    Operating Systems
                                                </span>
                                                <div className="device-bars">
                                                    {stats?.operatingSystems?.map((item, idx) => {
                                                        const pct = stats.totalVisits > 0 ? ((item.count / stats.totalVisits) * 100).toFixed(0) : 0;
                                                        return (
                                                            <div className="device-item" key={idx}>
                                                                <div className="device-info">
                                                                    <span>{getOsIcon(item.os)}</span>
                                                                    <span>{item.os}</span>
                                                                </div>
                                                                <div className="device-count">{item.count} ({pct}%)</div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>

                                            {/* Devices List */}
                                            <div>
                                                <span style={{ fontSize: '0.75rem', color: '#71717a', textTransform: 'uppercase', fontWeight: 600 }}>
                                                    Devices
                                                </span>
                                                <div className="device-bars">
                                                    {stats?.devices?.map((item, idx) => {
                                                        const pct = stats.totalVisits > 0 ? ((item.count / stats.totalVisits) * 100).toFixed(0) : 0;
                                                        return (
                                                            <div className="device-item" key={idx}>
                                                                <div className="device-info">
                                                                    <span>{item.device === 'Mobile' ? '📱' : item.device === 'Tablet' ? '📟' : '💻'}</span>
                                                                    <span>{item.device}</span>
                                                                </div>
                                                                <div className="device-count">{item.count} ({pct}%)</div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Recent Visitors Table with OS Column */}
                            <div className="admin-card">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
                                    <h2 className="admin-section-title" style={{ margin: 0 }}>
                                        <span>Recent Visitor Activity</span>
                                        <span className="section-tag">{filteredRecentVisits.length} Records</span>
                                    </h2>
                                    <input
                                        type="text"
                                        placeholder="Search by IP, Country, OS, or Page..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        style={{
                                            background: '#161616',
                                            border: '1px solid #242424',
                                            color: '#faf9f6',
                                            padding: '5px 12px',
                                            borderRadius: '6px',
                                            fontSize: '0.8rem',
                                            minWidth: '260px',
                                            outline: 'none'
                                        }}
                                    />
                                </div>

                                {filteredRecentVisits.length === 0 ? (
                                    <div className="admin-empty-state">
                                        <p>No matching visitor activity found.</p>
                                    </div>
                                ) : (
                                    <div className="admin-table-container">
                                        <table className="admin-table">
                                            <thead>
                                                <tr>
                                                    <th>Time</th>
                                                    <th>IP Address</th>
                                                    <th>Country</th>
                                                    <th>City / Region</th>
                                                    <th>Page</th>
                                                    <th>Device</th>
                                                    <th>OS</th>
                                                    <th>Referrer</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filteredRecentVisits.map((v) => (
                                                    <tr key={v.id}>
                                                        <td className="time-cell">{formatTimestamp(v.created_at)}</td>
                                                        <td>
                                                            <span className="ip-badge">{v.ip_address}</span>
                                                        </td>
                                                        <td>
                                                            <span style={{ marginRight: '6px' }}>{v.flag}</span>
                                                            <span>{v.country_name}</span>
                                                        </td>
                                                        <td>{v.city ? `${v.city}${v.region ? `, ${v.region}` : ''}` : '-'}</td>
                                                        <td>
                                                            <span className="path-badge">{v.path}</span>
                                                        </td>
                                                        <td>
                                                            <span className="device-badge">{v.device || 'Desktop'}</span>
                                                        </td>
                                                        <td>
                                                            <span className="os-badge">
                                                                {getOsIcon(v.os)} {v.os || 'Unknown'}
                                                            </span>
                                                        </td>
                                                        <td style={{ color: '#71717a', fontSize: '0.75rem' }}>
                                                            {v.referrer ? v.referrer.replace('https://', '').replace('http://', '').slice(0, 22) : 'Direct'}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </>
            )}

            {/* TAB 2: ANNOUNCEMENTS MANAGEMENT */}
            {activeTab === 'announcements' && (
                <div>
                    {/* Live Preview */}
                    <div className="announcement-preview-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.75rem', color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
                                Live Storefront Banner Preview
                            </span>
                            <span style={{ fontSize: '0.72rem', color: activeAnnouncement ? '#4ade80' : '#71717a' }}>
                                {activeAnnouncement ? '● Active banner visible on whoamistudios.in' : '○ No active banner'}
                            </span>
                        </div>

                        {activeAnnouncement ? (
                            <div className={`preview-banner ${activeAnnouncement.type || 'promo'}`}>
                                <span>{activeAnnouncement.type === 'promo' ? '✨' : activeAnnouncement.type === 'critical' ? '⚠️' : '📢'}</span>
                                <span>{activeAnnouncement.text}</span>
                            </div>
                        ) : (
                            <div className="preview-banner inactive">
                                <span>No active announcement. Activate or create one below to display across store pages.</span>
                            </div>
                        )}
                    </div>

                    {/* Create Announcement Form */}
                    <div className="admin-card" style={{ marginBottom: '24px' }}>
                        <h2 className="admin-section-title">
                            <span>Create Announcement</span>
                            <span className="section-tag">Strapi Sync</span>
                        </h2>

                        <form onSubmit={handleCreateAnnouncement}>
                            <div className="announcement-form-grid">
                                <div className="form-group">
                                    <label className="form-label">Message *</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Free shipping on all custom orders above ₹499"
                                        value={newText}
                                        onChange={(e) => setNewText(e.target.value)}
                                        className="form-input"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Theme Type</label>
                                    <select
                                        value={newType}
                                        onChange={(e) => setNewType(e.target.value)}
                                        className="form-select"
                                    >
                                        <option value="promo">Promo (Amber Gold)</option>
                                        <option value="info">Info (Ocean Blue)</option>
                                        <option value="critical">Critical (Crimson Red)</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <button
                                        type="submit"
                                        className="btn-primary-action"
                                        disabled={submittingAnnouncement}
                                        style={{ height: '38px', whiteSpace: 'nowrap' }}
                                    >
                                        {submittingAnnouncement ? 'Publishing...' : '+ Publish to Strapi'}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>

                    {/* Announcements List */}
                    <div className="admin-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <h2 className="admin-section-title" style={{ margin: 0 }}>
                                <span>All Announcements</span>
                                <span className="section-tag">{announcements.length}</span>
                            </h2>
                            <span style={{ fontSize: '0.75rem', color: '#71717a' }}>
                                Strapi: <code>api::announcement.announcement</code>
                            </span>
                        </div>

                        {announcementsLoading ? (
                            <div className="admin-loading" style={{ minHeight: '140px' }}>
                                <div className="admin-spinner"></div>
                            </div>
                        ) : announcements.length === 0 ? (
                            <div className="admin-empty-state">
                                <p>No announcements found.</p>
                            </div>
                        ) : (
                            <div>
                                {announcements.map((item) => (
                                    <div className="announcement-card-item" key={item.documentId || item.id}>
                                        <div className="announcement-content-left">
                                            <span className={`announcement-badge ${item.type || 'promo'}`}>
                                                {item.type}
                                            </span>
                                            <div>
                                                <div className="announcement-text">{item.text}</div>
                                                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '3px' }}>
                                                    <span className={`status-indicator-pill ${item.is_active ? 'active' : 'inactive'}`}>
                                                        <span className={`status-dot-sm ${item.is_active ? 'active' : 'inactive'}`}></span>
                                                        {item.is_active ? 'Active' : 'Inactive'}
                                                    </span>
                                                    <span style={{ fontSize: '0.72rem', color: '#71717a' }}>
                                                        {formatTimestamp(item.createdAt)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="announcement-actions">
                                            <button
                                                className={`btn-toggle-switch ${item.is_active ? 'is-active-btn' : ''}`}
                                                onClick={() => handleToggleActive(item)}
                                            >
                                                {item.is_active ? 'Active' : 'Enable'}
                                            </button>

                                            <button
                                                className="btn-secondary-action"
                                                onClick={() => setEditingItem({ ...item })}
                                                style={{ padding: '5px 9px', fontSize: '0.75rem' }}
                                            >
                                                Edit
                                            </button>

                                            <button
                                                className="btn-icon-danger"
                                                onClick={() => handleDeleteAnnouncement(item.documentId)}
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* TAB 3: CSS GENERATOR & THEME STUDIO (FROM NAMAN BRANCH) */}
            {activeTab === 'css-generator' && (
                <CssGeneratorTab />
            )}

            {/* TAB 4: STRAPI STUDIO */}
            {activeTab === 'strapi' && (
                <div>
                    <div className="strapi-launch-banner">
                        <div>
                            <span className="strapi-meta-badge">Strapi v5 CMS</span>
                            <h2 style={{ fontSize: '1.25rem', margin: '0 0 4px', color: '#faf9f6' }}>
                                Headless CMS Console
                            </h2>
                            <p style={{ color: '#71717a', margin: 0, fontSize: '0.85rem' }}>
                                Access raw collections, media uploads, schema builder, and permissions directly.
                            </p>
                        </div>
                        <a
                            href="http://localhost:1337/admin"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-primary-action"
                            style={{ padding: '9px 18px' }}
                        >
                            Open Strapi Console ↗
                        </a>
                    </div>

                    <div className="admin-grid-2col">
                        <div className="admin-card">
                            <h3 className="admin-section-title">
                                <span>Collections Quick Access</span>
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <a
                                    href="http://localhost:1337/admin/content-manager/collection-types/api::announcement.announcement?page=1&pageSize=10&sort=text:ASC"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn-secondary-action"
                                    style={{ justifyContent: 'space-between', padding: '10px 14px' }}
                                >
                                    <span>Announcements Collection</span>
                                    <span>↗</span>
                                </a>
                                <a
                                    href="http://localhost:1337/admin/content-manager/collection-types/api::product.product?page=1&pageSize=10&sort=title:ASC"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn-secondary-action"
                                    style={{ justifyContent: 'space-between', padding: '10px 14px' }}
                                >
                                    <span>Products Collection</span>
                                    <span>↗</span>
                                </a>
                                <a
                                    href="http://localhost:1337/admin/content-manager/collection-types/api::category.category"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn-secondary-action"
                                    style={{ justifyContent: 'space-between', padding: '10px 14px' }}
                                >
                                    <span>Categories & Customs</span>
                                    <span>↗</span>
                                </a>
                                <a
                                    href="http://localhost:1337/admin/plugins/upload"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn-secondary-action"
                                    style={{ justifyContent: 'space-between', padding: '10px 14px' }}
                                >
                                    <span>Media Library (Images)</span>
                                    <span>↗</span>
                                </a>
                            </div>
                        </div>

                        <div className="admin-card">
                            <h3 className="admin-section-title">
                                <span>Services Status</span>
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#141414', borderRadius: '6px', fontSize: '0.82rem' }}>
                                    <span style={{ color: '#71717a' }}>Next.js Storefront</span>
                                    <span style={{ color: '#4ade80', fontWeight: 600 }}>Active (Port 3000)</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#141414', borderRadius: '6px', fontSize: '0.82rem' }}>
                                    <span style={{ color: '#71717a' }}>Express API Gateway</span>
                                    <span style={{ color: '#4ade80', fontWeight: 600 }}>Active (Port 5001)</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#141414', borderRadius: '6px', fontSize: '0.82rem' }}>
                                    <span style={{ color: '#71717a' }}>Strapi v5 CMS</span>
                                    <span style={{ color: '#4ade80', fontWeight: 600 }}>Active (Port 1337)</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#141414', borderRadius: '6px', fontSize: '0.82rem' }}>
                                    <span style={{ color: '#71717a' }}>PostgreSQL</span>
                                    <span style={{ color: '#4ade80', fontWeight: 600 }}>Connected (Port 5438)</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#141414', borderRadius: '6px', fontSize: '0.82rem' }}>
                                    <span style={{ color: '#71717a' }}>IP Geolocation</span>
                                    <span style={{ color: '#ffb84d', fontWeight: 600 }}>ipwho.is</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Announcement Modal */}
            {editingItem && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.75)',
                    backdropFilter: 'blur(4px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 2000,
                    padding: '20px'
                }}>
                    <div style={{
                        background: '#141414',
                        border: '1px solid #282828',
                        borderRadius: '10px',
                        padding: '20px',
                        maxWidth: '480px',
                        width: '100%',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.8)'
                    }}>
                        <h3 style={{ margin: '0 0 14px', color: '#faf9f6', fontSize: '1.05rem' }}>
                            Edit Announcement
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div className="form-group">
                                <label className="form-label">Text</label>
                                <textarea
                                    value={editingItem.text}
                                    onChange={(e) => setEditingItem({ ...editingItem, text: e.target.value })}
                                    className="form-input"
                                    rows={3}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Type</label>
                                <select
                                    value={editingItem.type}
                                    onChange={(e) => setEditingItem({ ...editingItem, type: e.target.value })}
                                    className="form-select"
                                >
                                    <option value="promo">Promo (Amber Gold)</option>
                                    <option value="info">Info (Ocean Blue)</option>
                                    <option value="critical">Critical (Crimson Red)</option>
                                </select>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                                <input
                                    type="checkbox"
                                    id="editActive"
                                    checked={editingItem.is_active}
                                    onChange={(e) => setEditingItem({ ...editingItem, is_active: e.target.checked })}
                                    style={{ width: '16px', height: '16px', accentColor: '#ffb84d' }}
                                />
                                <label htmlFor="editActive" style={{ color: '#d4d4d8', fontSize: '0.85rem', cursor: 'pointer' }}>
                                    Active on storefront
                                </label>
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '20px' }}>
                            <button
                                className="btn-secondary-action"
                                onClick={() => setEditingItem(null)}
                            >
                                Cancel
                            </button>
                            <button
                                className="btn-primary-action"
                                onClick={handleSaveEdit}
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Notification Toast */}
            {toastMessage && (
                <div className="admin-toast">
                    <span>{toastMessage}</span>
                </div>
            )}
        </div>
    );
}
