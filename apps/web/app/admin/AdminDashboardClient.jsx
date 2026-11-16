'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import config, { getApiUrl } from '../../config';
import './admin.css';

export default function AdminDashboardClient() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [simulating, setSimulating] = useState(false);
    const [timeRange, setTimeRange] = useState('all');
    const [toastMessage, setToastMessage] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [countrySearch, setCountrySearch] = useState('');

    const showToast = (msg) => {
        setToastMessage(msg);
        setTimeout(() => {
            setToastMessage(null);
        }, 4000);
    };

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

    useEffect(() => {
        fetchStats(timeRange);
    }, [timeRange]);

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
                        Analytics & Traffic Intelligence
                        <span className="admin-badge-live">
                            <span className="admin-live-dot"></span>
                            Live • ipwho.is Powered
                        </span>
                    </h1>
                    <p className="admin-subtitle">
                        Real-time visitor tracking with IP-to-Country geolocation via ipwho.is and PostgreSQL telemetry
                    </p>
                </div>

                <div className="admin-actions">
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
                </div>
            </header>

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

                    {/* Top Visited Pages & Recent Visits Feed */}
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

            {/* Notification Toast */}
            {toastMessage && (
                <div className="admin-toast">
                    <span>{toastMessage}</span>
                </div>
            )}
        </div>
    );
}
