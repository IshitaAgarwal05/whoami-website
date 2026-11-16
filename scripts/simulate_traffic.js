/**
 * Standalone CLI script to simulate web visits from diverse IPs from different countries
 * Usage: node scripts/simulate_traffic.js [count]
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const analyticsService = require('../services/api/services/analyticsService');

async function main() {
    const count = parseInt(process.argv[2] || '60', 10);
    console.log(`\n======================================================`);
    console.log(`🌐 WhoAmI Studios - Simulating ${count} Global Web Visits`);
    console.log(`📍 IP Geolocation API: ipwho.is`);
    console.log(`======================================================\n`);

    try {
        const result = await analyticsService.simulateTraffic(count);
        console.log(`✅ Simulation complete!`);
        console.log(` - Simulated visits: ${result.simulatedCount}`);
        console.log(` - Total visits in database: ${result.totalVisits}`);
        console.log(` - Unique visitors (distinct IPs): ${result.uniqueVisitors}`);
        console.log(` - Total countries represented: ${result.totalCountries}`);

        const stats = await analyticsService.getAnalytics('all');
        console.log(`\n📊 Country Breakdown:`);
        console.table(stats.countries.map(c => ({
            Flag: c.flag,
            Country: c.country_name,
            Code: c.country_code,
            Visits: c.total_visits,
            'Unique IPs': c.unique_visitors,
            Share: `${c.percentage}%`
        })));

        console.log(`\n📱 Device Breakdown:`);
        console.table(stats.devices);

        console.log(`\n📄 Top Visited Pages:`);
        console.table(stats.topPages);

        process.exit(0);
    } catch (err) {
        console.error(`❌ Simulation failed:`, err);
        process.exit(1);
    }
}

main();
