const { Queue, Worker } = require('bullmq');
const cachingService = require('./cachingService');

// Create the product sync queue
const productSyncQueue = new Queue('product-sync', {
    connection: {
        host: 'localhost',
        port: 6379
    }
});

class TaskService {
    /**
     * Add a product sync job to the queue
     * @param {Object} data - Optional data for the job
     */
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

// Set up the worker to process jobs
const worker = new Worker('product-sync', async (job) => {
    if (job.name === 'sync-products') {
        console.log(`👷 Processing job ${job.id}: Syncing products...`);

        // Simulate a heavy task (e.g., intensive image processing or remote sync)
        await new Promise(resolve => setTimeout(resolve, 3000));

        // In a real scenario, this would involve complex logic.
        // For now, we'll just log and complete.
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
