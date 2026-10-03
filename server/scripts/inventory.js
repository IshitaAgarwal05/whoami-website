/**
 * WHOAMI INVENTORY MANAGEMENT CLI (DELEGATOR)
 * Calls the unified manage_products script
 */
const { main } = require('../../scripts/manage_products.cjs');

if (require.main === module) {
    main();
}
