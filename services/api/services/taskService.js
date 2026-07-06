// =============================================================
// DEAD CODE — Commented out per codebase audit (2026-04-15)
// Reason: This BullMQ task service is never imported by any
// route or the server entry point. The worker only has a
// placeholder setTimeout. Kept for future reference.
// =============================================================

/*
const { Queue, Worker } = require('bullmq');
const cachingService = require('./cachingService');

const productSyncQueue = new Queue('product-sync', {
    connection: {
        host: 'localhost',
        port: 6379
    }
});

class TaskService {
    async addProductSyncJob(data = {}) {
        try {
            const job = await productSyncQueue.add('sync-products', data);
            console.log(`📦 Background job added: Product Sync (ID: ${job.id})`);
            return job;
        } catch (error) {
            console.error('Error adding job to queue:', error);
            throw error;
        }
    }
}

const worker = new Worker('product-sync', async (job) => {
    if (job.name === 'sync-products') {
        console.log(`👷 Processing job ${job.id}: Syncing products...`);
        await new Promise(resolve => setTimeout(resolve, 3000));
        console.log(`✅ Job ${job.id} completed: Products synchronized.`);
    }
}, {
    connection: {
        host: 'localhost',
        port: 6379
    }
});

worker.on('failed', (job, err) => {
    console.error(`❌ Job ${job.id} failed with ${err.message}`);
});

module.exports = new TaskService();
*/

// Export empty object so any accidental require() doesn't crash
module.exports = {};
