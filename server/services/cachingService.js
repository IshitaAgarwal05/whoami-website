const { createClient } = require('redis');

class CachingService {
    constructor() {
        this.connected = false;
        this.client = null;

        // Only attempt connection if a REDIS_URL is explicitly set,
        // OR if we're in development (where localhost Redis is expected).
        const redisUrl = process.env.REDIS_URL;
        const isDev = process.env.NODE_ENV !== 'production';

        if (redisUrl || isDev) {
            this.client = createClient({
                url: redisUrl || 'redis://localhost:6379'
            });

            this.client.on('error', (err) => {
                // Log once, don't crash the server
                if (this.connected !== false) {
                    console.warn('⚠️  Redis connection lost, caching disabled:', err.message);
                }
                this.connected = false;
            });

            this.connect();
        } else {
            console.warn('⚠️  REDIS_URL not set — Redis caching is disabled. Set REDIS_URL in Render environment variables to enable it.');
        }
    }

    async connect() {
        if (!this.client) return;
        try {
            await this.client.connect();
            this.connected = true;
            console.log('✅ Redis connected successfully');
        } catch (error) {
            console.warn('⚠️  Could not connect to Redis, caching disabled:', error.message);
            this.connected = false;
        }
    }

    /**
     * Set a value in cache
     * @param {string} key 
     * @param {any} value 
     * @param {number} ttl - Time to live in seconds (default 1 hour)
     */
    async set(key, value, ttl = 3600) {
        if (!this.connected || !this.client) return null;
        try {
            const stringValue = JSON.stringify(value);
            await this.client.set(key, stringValue, { EX: ttl });
            return true;
        } catch (error) {
            console.error(`Error setting cache key ${key}:`, error.message);
            return false;
        }
    }

    /**
     * Get a value from cache
     * @param {string} key 
     */
    async get(key) {
        if (!this.connected || !this.client) return null;
        try {
            const value = await this.client.get(key);
            return value ? JSON.parse(value) : null;
        } catch (error) {
            console.error(`Error getting cache key ${key}:`, error.message);
            return null;
        }
    }

    /**
     * Delete a key from cache
     * @param {string} key 
     */
    async del(key) {
        if (!this.connected || !this.client) return null;
        try {
            await this.client.del(key);
            return true;
        } catch (error) {
            console.error(`Error deleting cache key ${key}:`, error.message);
            return false;
        }
    }

    /**
     * Clear all cache keys starting with a prefix
     * @param {string} prefix 
     */
    async clearByPrefix(prefix) {
        if (!this.connected || !this.client) return null;
        try {
            const keys = await this.client.keys(`${prefix}*`);
            if (keys.length > 0) await this.client.del(keys);
            return true;
        } catch (error) {
            console.error(`Error clearing cache by prefix ${prefix}:`, error.message);
            return false;
        }
    }
}

// Export singleton
module.exports = new CachingService();


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
