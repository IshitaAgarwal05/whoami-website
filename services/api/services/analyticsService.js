const geoip = require('geoip-lite');
const db = require('../db/postgresClient');

// Cached region display names formatter (Intl standard)
const regionNames = new Intl.DisplayNames(['en'], { type: 'region' });

// In-memory cache for IP lookups to avoid redundant network requests
const ipCache = new Map();

/**
 * Convert ISO 2-letter country code to flag emoji dynamically
 */
function getFlagEmoji(countryCode) {
    if (!countryCode || countryCode.length !== 2 || countryCode === 'UN' || countryCode === 'LO') {
        return '🌐';
    }
    try {
        const codePoints = countryCode
            .toUpperCase()
            .split('')
            .map(char => 127397 + char.charCodeAt(0));
        return String.fromCodePoint(...codePoints);
    } catch {
        return '🌐';
    }
}

/**
 * Get readable country name from ISO code dynamically
 */
function getCountryName(countryCode) {
    if (!countryCode || countryCode === 'UN') return 'Unknown';
    try {
        return regionNames.of(countryCode.toUpperCase()) || countryCode;
    } catch {
        return countryCode;
    }
}

/**
 * Parse client IP address from express request
 */
function extractClientIp(req) {
    let ip = req.headers['x-forwarded-for'] ||
             req.headers['x-real-ip'] ||
             req.headers['cf-connecting-ip'] ||
             req.ip ||
             req.socket?.remoteAddress ||
             req.connection?.remoteAddress ||
             '127.0.0.1';

    if (typeof ip === 'string') {
        if (ip.includes(',')) {
            ip = ip.split(',')[0].trim();
        }
        if (ip.startsWith('::ffff:')) {
            ip = ip.replace('::ffff:', '');
        }
        if (ip === '::1') {
            ip = '127.0.0.1';
        }
    }
    return ip;
}

/**
 * Detect client device from User-Agent
 */
function detectDevice(userAgent = '') {
    const ua = userAgent.toLowerCase();
    if (/ipad|tablet|(android(?!.*mobile))/i.test(ua)) {
        return 'Tablet';
    }
    if (/mobile|iphone|ipod|android.*mobile|blackberry|opera mini|iemobile/i.test(ua)) {
        return 'Mobile';
    }
    return 'Desktop';
}

/**
 * Detect client Operating System (OS) from User-Agent
 */
function detectOS(userAgent = '') {
    const ua = userAgent.toLowerCase();
    if (/iphone|ipad|ipod/i.test(ua)) return 'iOS';
    if (/android/i.test(ua)) return 'Android';
    if (/macintosh|mac os x/i.test(ua)) return 'macOS';
    if (/windows|win32|win64/i.test(ua)) return 'Windows';
    if (/linux/i.test(ua)) return 'Linux';
    if (/cros/i.test(ua)) return 'ChromeOS';
    return 'Other';
}

/**
 * IP Geolocation lookup using external API: ipwho.is
 * 100% Dynamic: Calls http://ipwho.is/{ip}
 */
async function lookupIp(ip) {
    const targetIp = (ip || '127.0.0.1').trim();

    // Check memory cache
    if (ipCache.has(targetIp)) {
        return ipCache.get(targetIp);
    }

    const isReserved = targetIp === '127.0.0.1' ||
                       targetIp === 'localhost' ||
                       targetIp.startsWith('192.168.') ||
                       targetIp.startsWith('10.') ||
                       targetIp.startsWith('172.16.') ||
                       targetIp.startsWith('172.31.');

    // 1. Primary: Query external API ipwho.is
    try {
        // If reserved localhost, querying ipwho.is without an IP dynamically resolves the developer's public internet IP
        const apiUrl = isReserved ? 'http://ipwho.is/' : `http://ipwho.is/${encodeURIComponent(targetIp)}`;
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 4000);

        const response = await fetch(apiUrl, { signal: controller.signal });
        clearTimeout(timeout);
        const data = await response.json();

        if (data && data.success) {
            const result = {
                ip_resolved: data.ip || targetIp,
                country_code: data.country_code || 'UN',
                country_name: data.country || getCountryName(data.country_code),
                city: data.city || '',
                region: data.region || '',
                flag: data.flag?.emoji || getFlagEmoji(data.country_code),
                isp: data.connection?.isp || data.connection?.org || ''
            };
            ipCache.set(targetIp, result);
            return result;
        }
    } catch (apiErr) {
        console.warn(`⚠️ ipwho.is external API lookup failed for ${targetIp}:`, apiErr.message);
    }

    // 2. Secondary Fallback: local geoip-lite if internet is down
    try {
        const geo = geoip.lookup(targetIp);
        if (geo && geo.country) {
            const result = {
                ip_resolved: targetIp,
                country_code: geo.country,
                country_name: getCountryName(geo.country),
                city: geo.city || '',
                region: geo.region || '',
                flag: getFlagEmoji(geo.country),
                isp: ''
            };
            ipCache.set(targetIp, result);
            return result;
        }
    } catch (geoErr) {
        console.warn('⚠️ geoip-lite fallback failed:', geoErr.message);
    }

    // 3. Fallback for offline / unknown IP
    const fallback = {
        ip_resolved: targetIp,
        country_code: 'UN',
        country_name: 'Unknown',
        city: '',
        region: '',
        flag: '🌐',
        isp: ''
    };
    ipCache.set(targetIp, fallback);
    return fallback;
}

/**
 * Record a visit into PostgreSQL
 */
async function recordVisit({ ip_address, path = '/', user_agent = '', device = null, os = null, referrer = '', created_at = null }) {
    // Dynamically look up IP details via ipwho.is
    const geo = await lookupIp(ip_address);

    const detectedDevice = device || detectDevice(user_agent);
    const detectedOS = os || detectOS(user_agent);

    const query = `
        INSERT INTO tx_visitor_analytics 
        (ip_address, country_code, country_name, city, region, path, user_agent, device, os, referrer, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, COALESCE($11, CURRENT_TIMESTAMP))
        RETURNING *;
    `;

    const values = [
        ip_address || '127.0.0.1',
        geo.country_code || 'UN',
        geo.country_name || 'Unknown',
        geo.city || '',
        geo.region || '',
        path || '/',
        user_agent || '',
        detectedDevice,
        detectedOS,
        referrer || '',
        created_at
    ];

    const result = await db.query(query, values);
    return result.rows[0];
}

/**
 * Get comprehensive analytics stats from PostgreSQL
 */
async function getAnalytics(timeRange = 'all') {
    let timeFilter = '';
    if (timeRange === 'today') {
        timeFilter = `WHERE created_at >= CURRENT_DATE`;
    } else if (timeRange === '7d') {
        timeFilter = `WHERE created_at >= NOW() - INTERVAL '7 days'`;
    } else if (timeRange === '30d') {
        timeFilter = `WHERE created_at >= NOW() - INTERVAL '30 days'`;
    }

    // 1. Overall counts
    const countsQuery = `
        SELECT 
            COUNT(*)::int AS total_visits,
            COUNT(DISTINCT ip_address)::int AS unique_visitors
        FROM tx_visitor_analytics
        ${timeFilter};
    `;
    const countsRes = await db.query(countsQuery);
    const totalVisits = countsRes.rows[0]?.total_visits || 0;
    const uniqueVisitors = countsRes.rows[0]?.unique_visitors || 0;

    // 2. Country Breakdown
    const countriesQuery = `
        SELECT 
            country_code,
            country_name,
            COUNT(*)::int AS total_visits,
            COUNT(DISTINCT ip_address)::int AS unique_visitors
        FROM tx_visitor_analytics
        ${timeFilter}
        GROUP BY country_code, country_name
        ORDER BY total_visits DESC;
    `;
    const countriesRes = await db.query(countriesQuery);
    const countries = countriesRes.rows.map(c => ({
        ...c,
        flag: getFlagEmoji(c.country_code),
        percentage: totalVisits > 0 ? ((c.total_visits / totalVisits) * 100).toFixed(1) : 0
    }));

    // 3. Top Pages
    const pagesQuery = `
        SELECT 
            path,
            COUNT(*)::int AS visits,
            COUNT(DISTINCT ip_address)::int AS unique_visitors
        FROM tx_visitor_analytics
        ${timeFilter}
        GROUP BY path
        ORDER BY visits DESC
        LIMIT 10;
    `;
    const pagesRes = await db.query(pagesQuery);

    // 4. Device Breakdown
    const devicesQuery = `
        SELECT 
            COALESCE(device, 'Desktop') AS device,
            COUNT(*)::int AS count
        FROM tx_visitor_analytics
        ${timeFilter}
        GROUP BY device
        ORDER BY count DESC;
    `;
    const devicesRes = await db.query(devicesQuery);

    // 5. Operating System (OS) Breakdown
    const osQuery = `
        SELECT 
            COALESCE(os, 'Other') AS os,
            COUNT(*)::int AS count
        FROM tx_visitor_analytics
        ${timeFilter}
        GROUP BY os
        ORDER BY count DESC;
    `;
    const osRes = await db.query(osQuery);

    // 6. Timeline / Trend (grouped by day)
    const timelineQuery = `
        SELECT 
            TO_CHAR(created_at, 'YYYY-MM-DD') AS date,
            COUNT(*)::int AS total_visits,
            COUNT(DISTINCT ip_address)::int AS unique_visitors
        FROM tx_visitor_analytics
        ${timeFilter}
        GROUP BY TO_CHAR(created_at, 'YYYY-MM-DD')
        ORDER BY date ASC;
    `;
    const timelineRes = await db.query(timelineQuery);

    // 7. Recent Visitor Logs (last 50)
    const recentQuery = `
        SELECT 
            id,
            ip_address,
            country_code,
            country_name,
            city,
            region,
            path,
            device,
            COALESCE(os, 'Other') AS os,
            referrer,
            created_at
        FROM tx_visitor_analytics
        ORDER BY created_at DESC
        LIMIT 50;
    `;
    const recentRes = await db.query(recentQuery);
    const recentVisits = recentRes.rows.map(r => ({
        ...r,
        flag: getFlagEmoji(r.country_code)
    }));

    return {
        totalVisits,
        uniqueVisitors,
        countries,
        topPages: pagesRes.rows,
        devices: devicesRes.rows,
        operatingSystems: osRes.rows,
        timeline: timelineRes.rows,
        recentVisits,
        timeRange,
        geoApiSource: 'ipwho.is'
    };
}

/**
 * Raw Public IP addresses used purely to simulate incoming web requests.
 * Zero hardcoded countries or locations — everything is resolved dynamically via ipwho.is API!
 */
const SIMULATED_PUBLIC_IPS = [
    // Asian IPs
    '49.36.128.45',
    '103.25.130.88',
    '117.200.10.55',
    '122.160.25.12',
    '14.139.128.90',
    '133.242.0.1',
    '210.140.10.1',
    '103.28.248.1',
    '94.200.10.1',

    // North American IPs
    '8.8.8.8',
    '104.244.42.65',
    '140.82.112.44',
    '151.101.1.140',
    '142.250.80.46',
    '24.114.12.50',

    // European IPs
    '81.2.69.142',
    '212.58.244.20',
    '85.214.132.117',
    '178.63.97.34',
    '51.15.0.1',
    '188.166.0.1',

    // South American & Australian IPs
    '177.18.0.1',
    '139.130.4.5',
    '203.2.75.1'
];

const PAGES_POOL = [
    '/',
    '/products',
    '/products?category=Customs',
    '/products?category=Charms',
    '/products?category=Combos',
    '/about',
    '/contact',
    '/cart',
    '/faq',
    '/blog'
];

const PROFILES_POOL = [
    { device: 'Desktop', os: 'Windows', ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36' },
    { device: 'Desktop', os: 'macOS', ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_4_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36' },
    { device: 'Desktop', os: 'Linux', ua: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36' },
    { device: 'Mobile', os: 'iOS', ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1' },
    { device: 'Mobile', os: 'Android', ua: 'Mozilla/5.0 (Linux; Android 14; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36' },
    { device: 'Tablet', os: 'iOS', ua: 'Mozilla/5.0 (iPad; CPU OS 17_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1' }
];

const REFERRERS_POOL = [
    'https://www.google.com/',
    'https://www.instagram.com/',
    'https://www.bing.com/',
    'Direct',
    'https://twitter.com/',
    'https://t.co/'
];

/**
 * Simulate web requests:
 * Picks a raw IP and calls ipwho.is dynamically to resolve Country, Flag, and City!
 */
async function simulateTraffic(count = 35) {
    console.log(`🚀 Simulating ${count} web visits using dynamic ipwho.is lookups...`);
    const results = [];
    const now = Date.now();

    for (let i = 0; i < count; i++) {
        // Pick a raw IP string (contains NO country data)
        const ip = SIMULATED_PUBLIC_IPS[Math.floor(Math.random() * SIMULATED_PUBLIC_IPS.length)];
        const path = PAGES_POOL[Math.floor(Math.random() * PAGES_POOL.length)];
        const profile = PROFILES_POOL[Math.floor(Math.random() * PROFILES_POOL.length)];
        const referrer = REFERRERS_POOL[Math.floor(Math.random() * REFERRERS_POOL.length)];

        const daysAgo = Math.floor(Math.random() * 6);
        const hoursAgo = Math.floor(Math.random() * 24);
        const minutesAgo = Math.floor(Math.random() * 60);
        const visitTime = new Date(now - (daysAgo * 86400000 + hoursAgo * 3600000 + minutesAgo * 60000));

        // Call recordVisit which queries ipwho.is dynamically for this IP!
        const record = await recordVisit({
            ip_address: ip,
            path,
            user_agent: profile.ua,
            device: profile.device,
            os: profile.os,
            referrer,
            created_at: visitTime
        });

        results.push(record);
    }

    const counts = await db.query(`
        SELECT 
            COUNT(*)::int AS total_visits, 
            COUNT(DISTINCT ip_address)::int AS unique_visitors,
            COUNT(DISTINCT country_code)::int AS total_countries
        FROM tx_visitor_analytics;
    `);

    return {
        simulatedCount: results.length,
        totalVisits: counts.rows[0].total_visits,
        uniqueVisitors: counts.rows[0].unique_visitors,
        totalCountries: counts.rows[0].total_countries,
        geoApiSource: 'ipwho.is'
    };
}

/**
 * Clear analytics data
 */
async function clearAnalytics() {
    await db.query('TRUNCATE TABLE tx_visitor_analytics RESTART IDENTITY;');
    return { success: true, message: 'Visitor analytics cleared successfully' };
}

module.exports = {
    extractClientIp,
    lookupIp,
    detectDevice,
    detectOS,
    getFlagEmoji,
    getCountryName,
    recordVisit,
    getAnalytics,
    simulateTraffic,
    clearAnalytics
};
