'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import config, { getApiUrl } from '../../config';
import './admin.css';

export default function AdminDashboardClient() {
    // Active navigation tab: 'analytics' | 'announcements' | 'strapi'
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
        }, 4000);
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
            showToast('⚠️ Failed to load analytics. Please ensure backend is running.');
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
        fetchStats(timeRange);
        fetchAnnouncements();
    }, [timeRange]);

    // ----------------------------------------------------
    // Analytics Simulation & Reset
    // ----------------------------------------------------
    const handleSimulate = async (count = 50) => {
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
                showToast(`🚀 Successfully simulated ${count} requests from diverse global IPs!`);
                await fetchStats(timeRange);
            } else {
                showToast('❌ Simulation error: ' + (json.error || 'Unknown error'));
            }
        } catch (err) {
            console.error('Simulation error:', err);
            showToast('❌ Simulation failed to connect to backend.');
        } finally {
            setSimulating(false);
        }
    };

    const handleReset = async () => {
        if (!window.confirm('Are you sure you want to clear all analytics visits?')) return;
        try {
            setLoading(true);
            const endpoint = getApiUrl('/api/v1/analytics/reset');
            const res = await fetch(endpoint, { method: 'DELETE' });
            const json = await res.json();
            if (json.success) {
                showToast('🗑️ Analytics data cleared successfully.');
                await fetchStats(timeRange);
            }
        } catch (err) {
            console.error('Reset error:', err);
            showToast('❌ Failed to clear analytics.');
        } finally {
            setLoading(false);
        }
    };

    // ----------------------------------------------------
    // Announcements CRUD Handlers
    // ----------------------------------------------------
    const handleCreateAnnouncement = async (e) => {
        e.preventDefault();
        if (!newText.trim()) {
            showToast('⚠️ Announcement text cannot be empty');
            return;
        }

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
                showToast('✅ Announcement created and synced to Strapi!');
                setNewText('');
                fetchAnnouncements();
            } else {
                showToast('❌ Error: ' + (json.error || 'Failed to save announcement'));
            }
        } catch (err) {
            console.error('Announcement create error:', err);
            showToast('❌ Failed to reach Strapi API');
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
                // Optimistically update local state
                setAnnouncements(prev => prev.map(a => a.documentId === item.documentId ? { ...a, is_active: nextStatus } : a));
            } else {
                showToast('❌ Failed to update status in Strapi');
            }
        } catch (err) {
            console.error('Toggle error:', err);
            showToast('❌ Could not update announcement');
        }
    };

    const handleDeleteAnnouncement = async (documentId) => {
        if (!window.confirm('Delete this announcement from Strapi?')) return;
        try {
            const endpoint = getApiUrl(`/api/v1/announcements/${documentId}`);
            const res = await fetch(endpoint, { method: 'DELETE' });
            const json = await res.json();
            if (json.success) {
                showToast('🗑️ Announcement deleted from Strapi');
                setAnnouncements(prev => prev.filter(a => a.documentId !== documentId));
            } else {
                showToast('❌ Failed to delete from Strapi');
            }
        } catch (err) {
            console.error('Delete error:', err);
            showToast('❌ Could not delete announcement');
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
                showToast('✅ Announcement updated successfully!');
                setEditingItem(null);
                fetchAnnouncements();
            } else {
                showToast('❌ Update failed');
            }
        } catch (err) {
            showToast('❌ Could not save changes');
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

    return (
        <div className="admin-container">
            {/* Header */}
            <header className="admin-header">
                <div className="admin-title-area">
                    <h1>
                        WhoAmI Command Center
                        <span className="admin-badge-live">
                            <span className="admin-live-dot"></span>
                            Live • Strapi & PostgreSQL
                        </span>
                    </h1>
                    <p className="admin-subtitle">
                        Unified Administration: Visitor Analytics, Traffic Geolocation & Strapi CMS Content
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
                                    7 Days
                                </button>
                                <button
                                    className={`time-btn ${timeRange === '30d' ? 'active' : ''}`}
                                    onClick={() => setTimeRange('30d')}
                                >
                                    30 Days
                                </button>
                            </div>

                            <button
                                className="btn-primary-action"
                                onClick={() => handleSimulate(50)}
                                disabled={simulating}
                                title="Simulate 50 web visits from diverse IPs across different countries"
                            >
                                <span>{simulating ? '⏳ Simulating...' : '🚀 Simulate Global Traffic (50)'}</span>
                            </button>

                            <button
                                className="btn-secondary-action"
                                onClick={() => fetchStats(timeRange)}
                                title="Refresh data"
                            >
                                🔄 Refresh
                            </button>

                            <button
                                className="btn-secondary-action btn-danger-action"
                                onClick={handleReset}
                                title="Clear visitor analytics records"
                            >
                                🗑️ Reset
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
                                🔄 Refresh Strapi
                            </button>
                            <a
                                href="http://localhost:1337/admin/content-manager/collection-types/api::announcement.announcement?page=1&pageSize=10&sort=text:ASC"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn-secondary-action"
                                style={{ color: '#ffb84d' }}
                            >
                                ↗ Open in Strapi Admin
                            </a>
                        </>
                    )}
                </div>
            </header>

            {/* Main Tabs Navigation */}
            <nav className="admin-nav-tabs">
                <button
                    className={`admin-nav-tab ${activeTab === 'analytics' ? 'active' : ''}`}
                    onClick={() => setActiveTab('analytics')}
                >
                    <span>📊 Visitor Analytics & Geolocation</span>
                    <span className="admin-tab-count">{stats?.totalVisits ?? 0}</span>
                </button>

                <button
                    className={`admin-nav-tab ${activeTab === 'announcements' ? 'active' : ''}`}
                    onClick={() => setActiveTab('announcements')}
                >
                    <span>📢 Announcements (Strapi CMS)</span>
                    <span className="admin-tab-count">{announcements.length}</span>
                </button>

                <button
                    className={`admin-nav-tab ${activeTab === 'strapi' ? 'active' : ''}`}
                    onClick={() => setActiveTab('strapi')}
                >
                    <span>🚀 Strapi Studio & Collections</span>
                </button>
            </nav>

            {/* TAB 1: VISITOR ANALYTICS */}
            {activeTab === 'analytics' && (
                <>
                    {loading && !stats ? (
                        <div className="admin-loading">
                            <div className="admin-spinner"></div>
                            <p>Fetching visitor telemetry and geographic analytics...</p>
                        </div>
                    ) : (
                        <>
                            {/* KPI Summary Cards */}
                            <section className="kpi-grid">
                                <div className="kpi-card">
                                    <div className="kpi-header">
                                        <span className="kpi-title">Total Visits</span>
                                        <span className="kpi-icon">📈</span>
                                    </div>
                                    <div className="kpi-value">{stats?.totalVisits ?? 0}</div>
                                    <div className="kpi-footer">
                                        <span>Total page requests recorded</span>
                                    </div>
                                </div>

                                <div className="kpi-card">
                                    <div className="kpi-header">
                                        <span className="kpi-title">Unique IP(s) Visits</span>
                                        <span className="kpi-icon">👤</span>
                                    </div>
                                    <div className="kpi-value">{stats?.uniqueVisitors ?? 0}</div>
                                    <div className="kpi-footer">
                                        <span className="kpi-trend">
                                            {stats?.totalVisits > 0
                                                ? `${((stats.uniqueVisitors / stats.totalVisits) * 100).toFixed(0)}%`
                                                : '0%'}
                                        </span>
                                        <span>uniqueness ratio</span>
                                    </div>
                                </div>

                                <div className="kpi-card">
                                    <div className="kpi-header">
                                        <span className="kpi-title">Countries Reached</span>
                                        <span className="kpi-icon">🌍</span>
                                    </div>
                                    <div className="kpi-value">{stats?.countries?.length ?? 0}</div>
                                    <div className="kpi-footer">
                                        <span>Nations extracted from visitor IPs</span>
                                    </div>
                                </div>

                                <div className="kpi-card">
                                    <div className="kpi-header">
                                        <span className="kpi-title">Top Country</span>
                                        <span className="kpi-icon">
                                            {stats?.countries?.[0]?.flag || '🌐'}
                                        </span>
                                    </div>
                                    <div className="kpi-value" style={{ fontSize: '1.75rem' }}>
                                        {stats?.countries?.[0]?.country_name || 'None Yet'}
                                    </div>
                                    <div className="kpi-footer">
                                        <span>
                                            {stats?.countries?.[0]
                                                ? `${stats.countries[0].total_visits} visits (${stats.countries[0].percentage}%)`
                                                : 'Awaiting traffic'}
                                        </span>
                                    </div>
                                </div>
                            </section>

                            {/* Simulation Controls Quick Banner */}
                            <div style={{
                                background: 'linear-gradient(90deg, #18181b, #121214)',
                                border: '1px solid #27272a',
                                borderRadius: '12px',
                                padding: '16px 20px',
                                marginBottom: '32px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                flexWrap: 'wrap',
                                gap: '16px'
                            }}>
                                <div>
                                    <strong style={{ color: '#ffb84d', display: 'block', marginBottom: '4px' }}>
                                        🧪 IP Geolocation Simulation Engine (ipwho.is)
                                    </strong>
                                    <span style={{ color: '#888', fontSize: '0.85rem' }}>
                                        Test visitor analytics by simulating incoming HTTP requests with real-world IP addresses across India, USA, UK, Germany, Japan, France, Canada, Australia, Singapore, and Brazil resolved via ipwho.is.
                                    </span>
                                </div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button
                                        className="btn-secondary-action"
                                        onClick={() => handleSimulate(15)}
                                        disabled={simulating}
                                    >
                                        +15 Visits
                                    </button>
                                    <button
                                        className="btn-secondary-action"
                                        onClick={() => handleSimulate(50)}
                                        disabled={simulating}
                                    >
                                        +50 Visits
                                    </button>
                                    <button
                                        className="btn-secondary-action"
                                        onClick={() => handleSimulate(100)}
                                        disabled={simulating}
                                    >
                                        +100 Visits
                                    </button>
                                </div>
                            </div>

                            {/* Two Column Layout: Country Breakdown & Timeline Chart */}
                            <div className="admin-grid-2col">
                                {/* Country Breakdown */}
                                <div className="admin-card">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
                                        <h2 className="admin-section-title" style={{ margin: 0 }}>
                                            <span>Audience by Country</span>
                                            <span className="section-tag">{stats?.countries?.length ?? 0} Nations</span>
                                        </h2>
                                        <input
                                            type="text"
                                            placeholder="Search country..."
                                            value={countrySearch}
                                            onChange={(e) => setCountrySearch(e.target.value)}
                                            style={{
                                                background: '#1a1a1a',
                                                border: '1px solid #2a2a2a',
                                                color: '#fff',
                                                padding: '4px 10px',
                                                borderRadius: '6px',
                                                fontSize: '0.8rem',
                                                outline: 'none'
                                            }}
                                        />
                                    </div>

                                    {filteredCountries.length === 0 ? (
                                        <div className="admin-empty-state">
                                            <div className="admin-empty-icon">🌐</div>
                                            <p>No country visits recorded for this period.</p>
                                            <button className="btn-primary-action" onClick={() => handleSimulate(25)}>
                                                Simulate Global Visits
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="countries-list">
                                            {filteredCountries.map((c, idx) => (
                                                <div className="country-row" key={`${c.country_code}-${idx}`}>
                                                    <div className="country-info">
                                                        <div className="country-main">
                                                            <span className="country-flag">{c.flag}</span>
                                                            <div>
                                                                <span className="country-name">{c.country_name}</span>
                                                                <span className="country-code-pill" style={{ marginLeft: '8px' }}>
                                                                    {c.country_code}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="country-stats-nums">
                                                            <span className="country-unique-count">
                                                                👤 {c.unique_visitors} unique
                                                            </span>
                                                            <span className="country-visits-count">
                                                                {c.total_visits} ({c.percentage}%)
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="country-progress-bar">
                                                        <div
                                                            className="country-progress-fill"
                                                            style={{ width: `${Math.max(Number(c.percentage), 4)}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Timeline & Device Breakdown */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                    {/* Timeline Chart */}
                                    <div className="admin-card">
                                        <h2 className="admin-section-title">
                                            <span>Traffic Trend</span>
                                            <span className="section-tag">Daily</span>
                                        </h2>
                                        {(!stats?.timeline || stats.timeline.length === 0) ? (
                                            <div className="admin-empty-state" style={{ padding: '24px' }}>
                                                <p>No timeline data available</p>
                                            </div>
                                        ) : (
                                            <div className="chart-container">
                                                <div className="bars-chart">
                                                    {stats.timeline.slice(-10).map((t, idx) => {
                                                        const heightPct = Math.max((t.total_visits / maxTimelineVisits) * 100, 10);
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

                                    {/* Device & Top Pages */}
                                    <div className="admin-card">
                                        <h2 className="admin-section-title">
                                            <span>Device Breakdown</span>
                                        </h2>
                                        <div className="device-bars">
                                            {stats?.devices?.map((d, idx) => {
                                                const share = stats.totalVisits > 0
                                                    ? ((d.count / stats.totalVisits) * 100).toFixed(1)
                                                    : 0;
                                                const icon = d.device === 'Mobile' ? '📱' : d.device === 'Tablet' ? '📟' : '💻';
                                                return (
                                                    <div className="device-item" key={idx}>
                                                        <div className="device-info">
                                                            <span>{icon}</span>
                                                            <span>{d.device}</span>
                                                        </div>
                                                        <div className="device-count">
                                                            {d.count} ({share}%)
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Recent Visits Feed */}
                            <div className="admin-card" style={{ marginBottom: '32px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                                    <h2 className="admin-section-title" style={{ margin: 0 }}>
                                        <span>Recent Visitor Stream</span>
                                        <span className="section-tag">{filteredRecentVisits.length} Records</span>
                                    </h2>
                                    <input
                                        type="text"
                                        placeholder="Filter by IP, Country, City, or Path..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        style={{
                                            background: '#1a1a1a',
                                            border: '1px solid #2a2a2a',
                                            color: '#fff',
                                            padding: '6px 14px',
                                            borderRadius: '8px',
                                            fontSize: '0.85rem',
                                            minWidth: '280px',
                                            outline: 'none'
                                        }}
                                    />
                                </div>

                                {filteredRecentVisits.length === 0 ? (
                                    <div className="admin-empty-state">
                                        <div className="admin-empty-icon">📋</div>
                                        <p>No matching visitor logs found.</p>
                                    </div>
                                ) : (
                                    <div className="admin-table-container">
                                        <table className="admin-table">
                                            <thead>
                                                <tr>
                                                    <th>Timestamp</th>
                                                    <th>IP Address</th>
                                                    <th>Country</th>
                                                    <th>City / Region</th>
                                                    <th>Page Visited</th>
                                                    <th>Device</th>
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
                                                            <span style={{ fontSize: '1.2rem', marginRight: '6px' }}>{v.flag}</span>
                                                            <span>{v.country_name}</span>
                                                            <span className="country-code-pill" style={{ marginLeft: '6px' }}>{v.country_code}</span>
                                                        </td>
                                                        <td>
                                                            {v.city ? `${v.city}${v.region ? `, ${v.region}` : ''}` : '-'}
                                                        </td>
                                                        <td>
                                                            <span className="path-badge">{v.path}</span>
                                                        </td>
                                                        <td>
                                                            <span className="device-badge">{v.device || 'Desktop'}</span>
                                                        </td>
                                                        <td style={{ color: '#888', fontSize: '0.8rem' }}>
                                                            {v.referrer ? v.referrer.replace('https://', '').replace('http://', '').slice(0, 25) : 'Direct'}
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

            {/* TAB 2: ANNOUNCEMENTS MANAGEMENT (STRAPI CMS MERGED) */}
            {activeTab === 'announcements' && (
                <div>
                    {/* Live Storefront Announcement Preview */}
                    <div className="announcement-preview-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.8rem', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
                                👁️ Live Storefront Banner Preview
                            </span>
                            <span style={{ fontSize: '0.75rem', color: activeAnnouncement ? '#4ade80' : '#888' }}>
                                {activeAnnouncement ? '● Active Announcement Showing to Customers' : '○ No active announcement banner'}
                            </span>
                        </div>

                        {activeAnnouncement ? (
                            <div className={`preview-banner ${activeAnnouncement.type || 'promo'}`}>
                                <span>{activeAnnouncement.type === 'promo' ? '✨' : activeAnnouncement.type === 'critical' ? '⚠️' : '📢'}</span>
                                <span>{activeAnnouncement.text}</span>
                            </div>
                        ) : (
                            <div className="preview-banner inactive">
                                <span>No active announcement. Activate or create one below to display across whoamistudios.in</span>
                            </div>
                        )}
                    </div>

                    {/* Create New Announcement Form */}
                    <div className="admin-card" style={{ marginBottom: '28px' }}>
                        <h2 className="admin-section-title">
                            <span>Add New Announcement</span>
                            <span className="section-tag">Strapi Sync</span>
                        </h2>

                        <form onSubmit={handleCreateAnnouncement}>
                            <div className="announcement-form-grid">
                                <div className="form-group">
                                    <label className="form-label">Announcement Text *</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Free Shipping on all orders above ₹499! Use code WHOAMI"
                                        value={newText}
                                        onChange={(e) => setNewText(e.target.value)}
                                        className="form-input"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Banner Type</label>
                                    <select
                                        value={newType}
                                        onChange={(e) => setNewType(e.target.value)}
                                        className="form-select"
                                    >
                                        <option value="promo">Promo (Warm Amber / Gold)</option>
                                        <option value="info">Info (Blue / Cool Gray)</option>
                                        <option value="critical">Critical (Crimson Red)</option>
                                    </select>
                                </div>

                                <div className="form-group" style={{ justifyContent: 'flex-end' }}>
                                    <button
                                        type="submit"
                                        className="btn-primary-action"
                                        disabled={submittingAnnouncement}
                                        style={{ height: '42px', whiteSpace: 'nowrap' }}
                                    >
                                        {submittingAnnouncement ? 'Publishing...' : '+ Publish to Strapi'}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>

                    {/* Existing Announcements List */}
                    <div className="admin-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h2 className="admin-section-title" style={{ margin: 0 }}>
                                <span>Managed Announcements</span>
                                <span className="section-tag">{announcements.length} Total</span>
                            </h2>
                            <span style={{ fontSize: '0.8rem', color: '#888' }}>
                                Synced with Strapi collection: <code>api::announcement.announcement</code>
                            </span>
                        </div>

                        {announcementsLoading ? (
                            <div className="admin-loading" style={{ minHeight: '180px' }}>
                                <div className="admin-spinner"></div>
                                <p>Loading announcements from Strapi...</p>
                            </div>
                        ) : announcements.length === 0 ? (
                            <div className="admin-empty-state">
                                <div className="admin-empty-icon">📢</div>
                                <p>No announcements found in Strapi CMS.</p>
                            </div>
                        ) : (
                            <div className="announcements-list">
                                {announcements.map((item) => (
                                    <div className="announcement-card-item" key={item.documentId || item.id}>
                                        <div className="announcement-content-left">
                                            <span className={`announcement-badge ${item.type || 'promo'}`}>
                                                {item.type}
                                            </span>
                                            <div>
                                                <div className="announcement-text">{item.text}</div>
                                                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginTop: '4px' }}>
                                                    <span className={`status-indicator-pill ${item.is_active ? 'active' : 'inactive'}`}>
                                                        <span className={`status-dot-sm ${item.is_active ? 'active' : 'inactive'}`}></span>
                                                        {item.is_active ? 'Active' : 'Inactive'}
                                                    </span>
                                                    <span style={{ fontSize: '0.75rem', color: '#777' }}>
                                                        Created: {formatTimestamp(item.createdAt)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="announcement-actions">
                                            <button
                                                className={`btn-toggle-switch ${item.is_active ? 'is-active-btn' : ''}`}
                                                onClick={() => handleToggleActive(item)}
                                                title={item.is_active ? 'Deactivate announcement' : 'Activate announcement'}
                                            >
                                                {item.is_active ? '✓ Active' : '○ Inactive'}
                                            </button>

                                            <button
                                                className="btn-secondary-action"
                                                onClick={() => setEditingItem({ ...item })}
                                                style={{ padding: '6px 10px', fontSize: '0.8rem' }}
                                                title="Edit announcement"
                                            >
                                                ✏️ Edit
                                            </button>

                                            <button
                                                className="btn-icon-danger"
                                                onClick={() => handleDeleteAnnouncement(item.documentId)}
                                                title="Delete announcement from Strapi"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* TAB 3: STRAPI STUDIO & COLLECTIONS */}
            {activeTab === 'strapi' && (
                <div>
                    <div className="strapi-launch-banner">
                        <div>
                            <span className="strapi-meta-badge">Strapi v5 Headless CMS</span>
                            <h2 style={{ fontSize: '1.4rem', margin: '0 0 6px', color: '#fff' }}>
                                Advanced Content Studio
                            </h2>
                            <p style={{ color: '#aaa', margin: 0, fontSize: '0.9rem', maxWidth: '700px' }}>
                                You have full access to Strapi's backend admin interface on port 1337 for content types, media uploads, role permissions, and database schemas.
                            </p>
                        </div>
                        <a
                            href="http://localhost:1337/admin"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-primary-action"
                            style={{ padding: '12px 24px', fontSize: '0.95rem' }}
                        >
                            🚀 Open Strapi Admin Portal ↗
                        </a>
                    </div>

                    <div className="admin-grid-2col">
                        <div className="admin-card">
                            <h3 className="admin-section-title">
                                <span>Direct Content Links</span>
                            </h3>
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                <li>
                                    <a
                                        href="http://localhost:1337/admin/content-manager/collection-types/api::announcement.announcement?page=1&pageSize=10&sort=text:ASC"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn-secondary-action"
                                        style={{ width: '100%', justifyContent: 'space-between', padding: '12px 16px' }}
                                    >
                                        <span>📢 Announcements Collection</span>
                                        <span>↗</span>
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="http://localhost:1337/admin/content-manager/collection-types/api::product.product?page=1&pageSize=10&sort=title:ASC"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn-secondary-action"
                                        style={{ width: '100%', justifyContent: 'space-between', padding: '12px 16px' }}
                                    >
                                        <span>📦 Products Collection</span>
                                        <span>↗</span>
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="http://localhost:1337/admin/content-manager/collection-types/api::category.category"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn-secondary-action"
                                        style={{ width: '100%', justifyContent: 'space-between', padding: '12px 16px' }}
                                    >
                                        <span>🏷️ Categories & Customs</span>
                                        <span>↗</span>
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="http://localhost:1337/admin/plugins/upload"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn-secondary-action"
                                        style={{ width: '100%', justifyContent: 'space-between', padding: '12px 16px' }}
                                    >
                                        <span>🖼️ Media Library & Image Uploads</span>
                                        <span>↗</span>
                                    </a>
                                </li>
                            </ul>
                        </div>

                        <div className="admin-card">
                            <h3 className="admin-section-title">
                                <span>Architecture Health</span>
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: '#1c1c1c', borderRadius: '8px' }}>
                                    <span style={{ color: '#aaa' }}>Next.js Frontend</span>
                                    <span style={{ color: '#4ade80', fontWeight: 600 }}>● Active (Port 3000)</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: '#1c1c1c', borderRadius: '8px' }}>
                                    <span style={{ color: '#aaa' }}>Express Gateway Backend</span>
                                    <span style={{ color: '#4ade80', fontWeight: 600 }}>● Active (Port 5001)</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: '#1c1c1c', borderRadius: '8px' }}>
                                    <span style={{ color: '#aaa' }}>Strapi v5 CMS</span>
                                    <span style={{ color: '#4ade80', fontWeight: 600 }}>● Active (Port 1337)</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: '#1c1c1c', borderRadius: '8px' }}>
                                    <span style={{ color: '#aaa' }}>PostgreSQL Database</span>
                                    <span style={{ color: '#4ade80', fontWeight: 600 }}>● Connected (Port 5438)</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: '#1c1c1c', borderRadius: '8px' }}>
                                    <span style={{ color: '#aaa' }}>IP Geolocation API</span>
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
                        background: '#161616',
                        border: '1px solid #333',
                        borderRadius: '12px',
                        padding: '24px',
                        maxWidth: '520px',
                        width: '100%',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.8)'
                    }}>
                        <h3 style={{ margin: '0 0 16px', color: '#fff', fontSize: '1.2rem' }}>
                            Edit Announcement
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            <div className="form-group">
                                <label className="form-label">Announcement Text</label>
                                <textarea
                                    value={editingItem.text}
                                    onChange={(e) => setEditingItem({ ...editingItem, text: e.target.value })}
                                    className="form-input"
                                    rows={3}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Banner Type</label>
                                <select
                                    value={editingItem.type}
                                    onChange={(e) => setEditingItem({ ...editingItem, type: e.target.value })}
                                    className="form-select"
                                >
                                    <option value="promo">Promo (Gold/Amber)</option>
                                    <option value="info">Info (Blue)</option>
                                    <option value="critical">Critical (Red)</option>
                                </select>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '6px' }}>
                                <input
                                    type="checkbox"
                                    id="editActive"
                                    checked={editingItem.is_active}
                                    onChange={(e) => setEditingItem({ ...editingItem, is_active: e.target.checked })}
                                    style={{ width: '18px', height: '18px', accentColor: '#ffb84d' }}
                                />
                                <label htmlFor="editActive" style={{ color: '#ddd', fontSize: '0.9rem', cursor: 'pointer' }}>
                                    Set as Active banner
                                </label>
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px' }}>
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
