const geoip = require('geoip-lite');
const db = require('../db/postgresClient');

// Cached region display names formatter
const regionNames = new Intl.DisplayNames(['en'], { type: 'region' });

// In-memory cache for IP lookups to keep responses ultra fast and avoid redundant calls to ipwho.is
const ipCache = new Map();

/**
 * Convert ISO 2-letter country code to flag emoji
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
 * Get readable country name from ISO code
 */
function getCountryName(countryCode) {
    if (!countryCode || countryCode === 'UN') return 'Unknown';
    if (countryCode === 'LO') return 'Localhost / Internal';
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
 * IP Geolocation lookup using external API: ipwho.is
 * With fallback to local geoip-lite if network fails
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

    // 1. Primary: External API ipwho.is
    try {
        // If it's a local/reserved IP on local dev, querying ipwho.is without IP returns the caller's actual location
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

    // 2. Secondary Fallback: geoip-lite
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

    // 3. Default Fallback
    const fallback = {
        ip_resolved: targetIp,
        country_code: isReserved ? 'IN' : 'UN',
        country_name: isReserved ? 'India (Local Dev)' : 'Unknown',
        city: isReserved ? 'Jaipur' : '',
        region: isReserved ? 'RJ' : '',
        flag: isReserved ? '🇮🇳' : '🌐',
        isp: ''
    };
    ipCache.set(targetIp, fallback);
    return fallback;
}

/**
 * Record a visit into PostgreSQL
 */
async function recordVisit({ ip_address, country_code, country_name, city, region, path = '/', user_agent = '', device = 'Desktop', referrer = '', created_at = null }) {
    // If geo fields not provided, look them up via external API ipwho.is
    if (!country_code || !country_name) {
        const geo = await lookupIp(ip_address);
        country_code = country_code || geo.country_code;
        country_name = country_name || geo.country_name;
        city = city || geo.city;
        region = region || geo.region;
    }

    const query = `
        INSERT INTO tx_visitor_analytics 
        (ip_address, country_code, country_name, city, region, path, user_agent, device, referrer, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, COALESCE($10, CURRENT_TIMESTAMP))
        RETURNING *;
    `;

    const values = [
        ip_address || '127.0.0.1',
        country_code || 'UN',
        country_name || 'Unknown',
        city || '',
        region || '',
        path || '/',
        user_agent || '',
        device || 'Desktop',
        referrer || '',
        created_at
    ];

    const result = await db.query(query, values);
    return result.rows[0];
}

/**
 * Get comprehensive analytics stats
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

    // 5. Timeline / Trend (grouped by day)
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

    // 6. Recent Visitor Logs (last 50)
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
        timeline: timelineRes.rows,
        recentVisits,
        timeRange,
        geoApiSource: 'ipwho.is'
    };
}

/**
 * Diverse global IPs with their expected locations
 */
const SIMULATED_VISITORS_POOL = [
    // India
    { ip: '49.36.128.45', country_code: 'IN', country_name: 'India', city: 'Delhi', region: 'DL' },
    { ip: '103.25.130.88', country_code: 'IN', country_name: 'India', city: 'Bengaluru', region: 'KA' },
    { ip: '117.200.10.55', country_code: 'IN', country_name: 'India', city: 'New Delhi', region: 'DL' },
    { ip: '122.160.25.12', country_code: 'IN', country_name: 'India', city: 'Jaipur', region: 'RJ' },
    { ip: '14.139.128.90', country_code: 'IN', country_name: 'India', city: 'Kolkata', region: 'WB' },
    { ip: '43.242.176.10', country_code: 'IN', country_name: 'India', city: 'Hyderabad', region: 'TG' },

    // United States
    { ip: '8.8.8.8', country_code: 'US', country_name: 'United States', city: 'San Jose', region: 'CA' },
    { ip: '104.244.42.65', country_code: 'US', country_name: 'United States', city: 'San Francisco', region: 'CA' },
    { ip: '140.82.112.44', country_code: 'US', country_name: 'United States', city: 'Seattle', region: 'WA' },
    { ip: '151.101.1.140', country_code: 'US', country_name: 'United States', city: 'New York', region: 'NY' },
    { ip: '199.16.156.38', country_code: 'US', country_name: 'United States', city: 'Austin', region: 'TX' },

    // United Kingdom
    { ip: '81.2.69.142', country_code: 'GB', country_name: 'United Kingdom', city: 'Bracknell', region: 'ENG' },
    { ip: '212.58.244.20', country_code: 'GB', country_name: 'United Kingdom', city: 'London', region: 'ENG' },
    { ip: '185.86.151.11', country_code: 'GB', country_name: 'United Kingdom', city: 'Edinburgh', region: 'SCT' },

    // Germany
    { ip: '85.214.132.117', country_code: 'DE', country_name: 'Germany', city: 'Berlin', region: 'BE' },
    { ip: '178.63.97.34', country_code: 'DE', country_name: 'Germany', city: 'Munich', region: 'BY' },
    { ip: '195.201.201.32', country_code: 'DE', country_name: 'Germany', city: 'Frankfurt', region: 'HE' },

    // Japan
    { ip: '133.242.0.1', country_code: 'JP', country_name: 'Japan', city: 'Tokyo', region: '13' },
    { ip: '210.140.10.1', country_code: 'JP', country_name: 'Japan', city: 'Osaka', region: '27' },
    { ip: '114.179.32.1', country_code: 'JP', country_name: 'Japan', city: 'Kyoto', region: '26' },

    // Canada
    { ip: '142.250.80.46', country_code: 'CA', country_name: 'Canada', city: 'Toronto', region: 'ON' },
    { ip: '24.114.12.50', country_code: 'CA', country_name: 'Canada', city: 'Vancouver', region: 'BC' },

    // Australia
    { ip: '139.130.4.5', country_code: 'AU', country_name: 'Australia', city: 'Sydney', region: 'NSW' },
    { ip: '203.2.75.1', country_code: 'AU', country_name: 'Australia', city: 'Melbourne', region: 'VIC' },

    // France
    { ip: '51.15.0.1', country_code: 'FR', country_name: 'France', city: 'Paris', region: 'IDF' },
    { ip: '195.154.120.1', country_code: 'FR', country_name: 'France', city: 'Lyon', region: 'ARA' },

    // Singapore
    { ip: '103.28.248.1', country_code: 'SG', country_name: 'Singapore', city: 'Singapore', region: 'SG' },

    // Brazil
    { ip: '177.18.0.1', country_code: 'BR', country_name: 'Brazil', city: 'São Paulo', region: 'SP' },

    // Netherlands
    { ip: '188.166.0.1', country_code: 'NL', country_name: 'Netherlands', city: 'Amsterdam', region: 'NH' },

    // United Arab Emirates
    { ip: '94.200.10.1', country_code: 'AE', country_name: 'United Arab Emirates', city: 'Dubai', region: 'DU' }
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

const DEVICES_POOL = ['Desktop', 'Desktop', 'Mobile', 'Mobile', 'Mobile', 'Tablet'];

const REFERRERS_POOL = [
    'https://www.google.com/',
    'https://www.instagram.com/',
    'https://www.bing.com/',
    'Direct',
    'https://twitter.com/',
    'https://t.co/'
];

/**
 * Simulate web requests from different IPs from different countries
 * Resolving geolocation with ipwho.is
 */
async function simulateTraffic(count = 50) {
    console.log(`🚀 Simulating ${count} web visits using ipwho.is across different countries...`);
    const results = [];
    const now = Date.now();

    for (let i = 0; i < count; i++) {
        // Pick a visitor profile
        const visitor = SIMULATED_VISITORS_POOL[Math.floor(Math.random() * SIMULATED_VISITORS_POOL.length)];
        const path = PAGES_POOL[Math.floor(Math.random() * PAGES_POOL.length)];
        const device = DEVICES_POOL[Math.floor(Math.random() * DEVICES_POOL.length)];
        const referrer = REFERRERS_POOL[Math.floor(Math.random() * REFERRERS_POOL.length)];

        // Spread timestamps across the last 6 days and today
        const daysAgo = Math.floor(Math.random() * 6);
        const hoursAgo = Math.floor(Math.random() * 24);
        const minutesAgo = Math.floor(Math.random() * 60);
        const visitTime = new Date(now - (daysAgo * 86400000 + hoursAgo * 3600000 + minutesAgo * 60000));

        // Use ipwho.is lookup
        const geo = await lookupIp(visitor.ip);

        const record = await recordVisit({
            ip_address: visitor.ip,
            country_code: geo.country_code || visitor.country_code,
            country_name: geo.country_name || visitor.country_name,
            city: geo.city || visitor.city,
            region: geo.region || visitor.region,
            path,
            user_agent: `Mozilla/5.0 (${device === 'Mobile' ? 'iPhone; CPU iPhone OS 16_0 like Mac OS X' : 'Windows NT 10.0; Win64; x64'}) AppleWebKit/537.36 SimulatedBot/1.0`,
            device,
            referrer,
            created_at: visitTime
        });

        results.push(record);
    }

    // Get fresh totals
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
    getFlagEmoji,
    getCountryName,
    recordVisit,
    getAnalytics,
    simulateTraffic,
    clearAnalytics
};
