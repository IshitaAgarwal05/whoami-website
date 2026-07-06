import React, { useState, useEffect } from 'react';

export function HomePage() {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/founder-dashboard/metrics');
      const data = await res.json();
      if (data.success) {
        setMetrics(data.data);
      } else {
        setError(data.error || 'Failed to fetch metrics');
      }
    } catch (err: any) {
      setError(err.message || 'Error fetching metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  const triggerAction = async (action: string) => {
    try {
      setActionLoading(action);
      const res = await fetch('/api/founder-dashboard/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });
      const data = await res.json();
      if (data.success) {
        setNotification({ type: 'success', message: data.message || 'Action executed successfully!' });
        fetchMetrics(); // reload to get new audit logs
      } else {
        setNotification({ type: 'error', message: data.error || 'Action failed' });
      }
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message || 'Network error occurred' });
    } finally {
      setActionLoading(null);
      setTimeout(() => setNotification(null), 5000);
    }
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p style={styles.loadingText}>Loading Premium metrics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.errorContainer}>
        <div style={styles.errorCard}>
          <span style={styles.errorIcon}>⚠️</span>
          <h3>Dashboard Error</h3>
          <p>{error}</p>
          <button onClick={fetchMetrics} style={styles.retryBtn}>Retry</button>
        </div>
      </div>
    );
  }

  const { summary = {}, lowStock = [], recentAuditLogs = [] } = metrics || {};

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>WhoAmI Studios</h1>
          <p style={styles.subtitle}>Founder Dashboard & Operations Control</p>
        </div>
        <div style={styles.refreshContainer}>
          <button onClick={fetchMetrics} style={styles.refreshBtn}>
            🔄 Refresh Data
          </button>
        </div>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div style={{
          ...styles.toast,
          backgroundColor: notification.type === 'success' ? '#10B981' : '#EF4444'
        }}>
          {notification.message}
        </div>
      )}

      {/* Metrics Row */}
      <div style={styles.metricsGrid}>
        <div style={{ ...styles.card, borderLeft: '5px solid #10B981' }}>
          <p style={styles.cardLabel}>TOTAL SALES</p>
          <h2 style={styles.cardVal}>₹{Number(summary.totalSales || 0).toLocaleString('en-IN')}</h2>
          <p style={styles.cardSub}>Cumulative revenue</p>
        </div>
        <div style={{ ...styles.card, borderLeft: '5px solid #6366F1' }}>
          <p style={styles.cardLabel}>TOTAL ORDERS</p>
          <h2 style={styles.cardVal}>{summary.totalOrders || 0}</h2>
          <p style={styles.cardSub}>Orders placed</p>
        </div>
        <div style={{ ...styles.card, borderLeft: '5px solid #3B82F6' }}>
          <p style={styles.cardLabel}>CUSTOMERS</p>
          <h2 style={styles.cardVal}>{summary.totalCustomers || 0}</h2>
          <p style={styles.cardSub}>Active accounts</p>
        </div>
        <div style={{ ...styles.card, borderLeft: '5px solid #F59E0B' }}>
          <p style={styles.cardLabel}>LOW STOCK ITEMS</p>
          <h2 style={styles.cardVal}>{summary.lowStockCount || 0}</h2>
          <p style={styles.cardSub}>Below thresholds</p>
        </div>
      </div>

      {/* Main Content Area */}
      <div style={styles.contentGrid}>
        
        {/* Left Column: Quick Actions & Low Stock */}
        <div style={styles.leftCol}>
          
          {/* Quick Actions */}
          <div style={styles.sectionCard}>
            <h3 style={styles.sectionTitle}>Quick Operations Actions</h3>
            <div style={styles.actionButtonsGrid}>
              <button 
                disabled={actionLoading !== null}
                onClick={() => triggerAction('clear_cache')}
                style={styles.actionBtn}
              >
                {actionLoading === 'clear_cache' ? 'Clearing...' : '🧹 Clear Redis Cache'}
              </button>
              <button 
                disabled={actionLoading !== null}
                onClick={() => triggerAction('send_low_stock_alert')}
                style={styles.actionBtn}
              >
                {actionLoading === 'send_low_stock_alert' ? 'Sending...' : '📧 Send Low Stock Alerts'}
              </button>
              <button 
                disabled={actionLoading !== null}
                onClick={() => triggerAction('generate_report')}
                style={styles.actionBtn}
              >
                {actionLoading === 'generate_report' ? 'Generating...' : '📊 Generate Sales Report'}
              </button>
            </div>
          </div>

          {/* Low Stock Alerts */}
          <div style={styles.sectionCard}>
            <h3 style={styles.sectionTitle}>⚠️ Low Stock Notifications</h3>
            {lowStock.length === 0 ? (
              <p style={styles.emptyText}>All products have sufficient stock! ✅</p>
            ) : (
              <div style={styles.tableWrapper}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Product</th>
                      <th style={styles.th}>SKU</th>
                      <th style={styles.th}>Stock</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lowStock.map((p: any, idx: number) => (
                      <tr key={idx} style={styles.tr}>
                        <td style={styles.td}>{p.name}</td>
                        <td style={styles.td}>{p.sku}</td>
                        <td style={{ ...styles.td, color: '#EF4444', fontWeight: 'bold' }}>{p.stock}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Audit Logs */}
        <div style={styles.rightCol}>
          <div style={styles.sectionCard}>
            <h3 style={styles.sectionTitle}>📋 Recent Operations Audit Logs</h3>
            {recentAuditLogs.length === 0 ? (
              <p style={styles.emptyText}>No recent audit logs available.</p>
            ) : (
              <div style={styles.tableWrapper}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Action</th>
                      <th style={styles.th}>Email</th>
                      <th style={styles.th}>Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentAuditLogs.map((log: any, idx: number) => (
                      <tr key={idx} style={styles.tr}>
                        <td style={styles.td}>
                          <span style={styles.badge}>{log.action}</span>
                        </td>
                        <td style={styles.td}>{log.user_email || 'System'}</td>
                        <td style={styles.td}>
                          {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: '24px',
    backgroundColor: '#F3F4F6',
    minHeight: '100vh',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
    borderBottom: '1px solid #E5E7EB',
    paddingBottom: '16px',
  },
  title: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#111827',
    margin: 0,
  },
  subtitle: {
    fontSize: '14px',
    color: '#6B7280',
    margin: '4px 0 0 0',
  },
  refreshContainer: {},
  refreshBtn: {
    backgroundColor: '#FFFFFF',
    border: '1px solid #D1D5DB',
    padding: '10px 16px',
    borderRadius: '8px',
    fontWeight: '600',
    color: '#374151',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '20px',
    marginBottom: '24px',
  },
  card: {
    backgroundColor: '#FFFFFF',
    padding: '20px',
    borderRadius: '12px',
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
  },
  cardLabel: {
    fontSize: '11px',
    fontWeight: 'bold',
    color: '#9CA3AF',
    margin: 0,
    letterSpacing: '0.05em',
  },
  cardVal: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#111827',
    margin: '8px 0',
  },
  cardSub: {
    fontSize: '12px',
    color: '#6B7280',
    margin: 0,
  },
  contentGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '24px',
  },
  leftCol: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '24px',
  },
  rightCol: {},
  sectionCard: {
    backgroundColor: '#FFFFFF',
    padding: '24px',
    borderRadius: '12px',
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
  },
  sectionTitle: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#374151',
    margin: '0 0 16px 0',
  },
  actionButtonsGrid: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px',
  },
  actionBtn: {
    backgroundColor: '#4F46E5',
    color: '#FFFFFF',
    border: 'none',
    padding: '12px 16px',
    borderRadius: '8px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
    textAlign: 'left' as const,
  },
  tableWrapper: {
    overflowX: 'auto' as const,
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
  },
  th: {
    textAlign: 'left' as const,
    padding: '12px',
    borderBottom: '2px solid #F3F4F6',
    color: '#4B5563',
    fontSize: '12px',
    fontWeight: 'bold',
  },
  tr: {
    borderBottom: '1px solid #F3F4F6',
  },
  td: {
    padding: '12px',
    fontSize: '14px',
    color: '#1F2937',
  },
  emptyText: {
    color: '#9CA3AF',
    fontSize: '14px',
    textAlign: 'center' as const,
    padding: '20px 0',
    margin: 0,
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    backgroundColor: '#F3F4F6',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid #D1D5DB',
    borderTop: '4px solid #4F46E5',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  loadingText: {
    marginTop: '16px',
    color: '#4B5563',
    fontWeight: '600',
  },
  errorContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    backgroundColor: '#F3F4F6',
  },
  errorCard: {
    backgroundColor: '#FFFFFF',
    padding: '32px',
    borderRadius: '12px',
    textAlign: 'center' as const,
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
    maxWidth: '400px',
  },
  errorIcon: {
    fontSize: '48px',
  },
  retryBtn: {
    marginTop: '16px',
    backgroundColor: '#EF4444',
    color: '#FFFFFF',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '8px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  badge: {
    backgroundColor: '#E0E7FF',
    color: '#4338CA',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: 'bold',
  },
  toast: {
    position: 'fixed' as const,
    bottom: '24px',
    right: '24px',
    color: '#FFFFFF',
    padding: '12px 24px',
    borderRadius: '8px',
    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
    zIndex: 1000,
    fontWeight: '600',
  }
};
