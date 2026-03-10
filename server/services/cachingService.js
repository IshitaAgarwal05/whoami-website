const { createClient } = require('redis');

class CachingService {
    constructor() {
        this.client = createClient({
            url: process.env.REDIS_URL || 'redis://localhost:6379'
        });

        this.client.on('error', (err) => console.error('Redis Client Error', err));
        this.connected = false;
        this.connect();
    }

    async connect() {
        try {
            await this.client.connect();
            this.connected = true;
            console.log('✅ Redis connected successfully');
        } catch (error) {
            console.error('❌ Failed to connect to Redis:', error);
        }
    }

    /**
     * Set a value in cache
     * @param {string} key 
     * @param {any} value 
     * @param {number} ttl - Time to live in seconds (default 1 hour)
     */
    async set(key, value, ttl = 3600) {
        if (!this.connected) return null;
        try {
            const stringValue = JSON.stringify(value);
            await this.client.set(key, stringValue, {
                EX: ttl
            });
            return true;
        } catch (error) {
            console.error(`Error setting cache key ${key}:`, error);
            return false;
        }
    }

    /**
     * Get a value from cache
     * @param {string} key 
     */
    async get(key) {
        if (!this.connected) return null;
        try {
            const value = await this.client.get(key);
            return value ? JSON.parse(value) : null;
        } catch (error) {
            console.error(`Error getting cache key ${key}:`, error);
            return null;
        }
    }

    /**
     * Delete a key from cache
     * @param {string} key 
     */
    async del(key) {
        if (!this.connected) return null;
        try {
            await this.client.del(key);
            return true;
        } catch (error) {
            console.error(`Error deleting cache key ${key}:`, error);
            return false;
        }
    }

    /**
     * Clear all cache keys starting with a prefix
     * @param {string} prefix 
     */
    async clearByPrefix(prefix) {
        if (!this.connected) return null;
        try {
            const keys = await this.client.keys(`${prefix}*`);
            if (keys.length > 0) {
                await this.client.del(keys);
            }
            return true;
        } catch (error) {
            console.error(`Error clearing cache by prefix ${prefix}:`, error);
            return false;
        }
    }
}

// Export singleton
module.exports = new CachingService();
