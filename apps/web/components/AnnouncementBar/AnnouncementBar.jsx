'use client';

import { useState, useEffect } from 'react';
import config, { getApiUrl } from '../../config';
import './AnnouncementBar.css';

export default function AnnouncementBar() {
    const [activeAnnouncement, setActiveAnnouncement] = useState(null);
    const [dismissed, setDismissed] = useState(false);

    useEffect(() => {
        const fetchAnnouncement = async () => {
            try {
                const endpoint = getApiUrl('/api/v1/announcements');
                const res = await fetch(endpoint);
                const json = await res.json();
                if (json.success && Array.isArray(json.data)) {
                    const active = json.data.find(a => a.is_active);
                    if (active) {
                        setActiveAnnouncement(active);
                    }
                }
            } catch (e) {
                // Silently ignore announcement load errors
            }
        };

        fetchAnnouncement();
    }, []);

    if (!activeAnnouncement || dismissed) {
        return null;
    }

    return (
        <div className={`store-announcement-bar ${activeAnnouncement.type || 'promo'}`}>
            <div className="announcement-bar-inner">
                <span className="announcement-icon">
                    {activeAnnouncement.type === 'promo' ? '✨' : activeAnnouncement.type === 'critical' ? '⚠️' : '📢'}
                </span>
                <span className="announcement-message">{activeAnnouncement.text}</span>
            </div>
            <button
                className="announcement-close-btn"
                onClick={() => setDismissed(true)}
                aria-label="Dismiss banner"
                title="Dismiss"
            >
                ✕
            </button>
        </div>
    );
}
