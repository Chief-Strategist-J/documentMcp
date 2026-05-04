"use strict";
/**
 * Cache manager for build and runtime caching
 * Follows DRY principles - centralized caching logic
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.BuildCacheManager = exports.CacheManager = void 0;
/**
 * Generic cache manager with TTL support
 */
class CacheManager {
    constructor(config) {
        this.cache = new Map();
        this.maxSize = config.maxSize;
        this.defaultTtl = config.defaultTtl;
    }
    /**
     * Gets value from cache
     * @param key - Cache key
     * @returns Cached value or null if not found/expired
     */
    get(key) {
        const entry = this.cache.get(key);
        if (!entry) {
            return null;
        }
        const now = Date.now();
        if (now - entry.timestamp > entry.ttl) {
            this.cache.delete(key);
            return null;
        }
        return entry.data;
    }
    /**
     * Sets value in cache
     * @param key - Cache key
     * @param data - Data to cache
     * @param ttl - Time to live in milliseconds (optional)
     */
    set(key, data, ttl) {
        if (this.cache.size >= this.maxSize) {
            this.evictOldest();
        }
        const entry = {
            data,
            timestamp: Date.now(),
            ttl: ttl || this.defaultTtl
        };
        this.cache.set(key, entry);
    }
    /**
     * Deletes value from cache
     * @param key - Cache key
     * @returns True if key was deleted
     */
    delete(key) {
        return this.cache.delete(key);
    }
    /**
     * Clears all cache entries
     */
    clear() {
        this.cache.clear();
    }
    /**
     * Gets cache size
     * @returns Number of cached entries
     */
    size() {
        return this.cache.size;
    }
    /**
     * Checks if key exists and is not expired
     * @param key - Cache key
     * @returns True if key exists and is valid
     */
    has(key) {
        const entry = this.cache.get(key);
        if (!entry) {
            return false;
        }
        const now = Date.now();
        if (now - entry.timestamp > entry.ttl) {
            this.cache.delete(key);
            return false;
        }
        return true;
    }
    /**
     * Evicts oldest entry from cache
     */
    evictOldest() {
        let oldestKey = '';
        let oldestTime = Date.now();
        for (const [key, entry] of this.cache.entries()) {
            if (entry.timestamp < oldestTime) {
                oldestTime = entry.timestamp;
                oldestKey = key;
            }
        }
        if (oldestKey) {
            this.cache.delete(oldestKey);
        }
    }
    /**
     * Cleans up expired entries
     * @returns Number of entries cleaned up
     */
    cleanup() {
        const now = Date.now();
        let cleaned = 0;
        for (const [key, entry] of this.cache.entries()) {
            if (now - entry.timestamp > entry.ttl) {
                this.cache.delete(key);
                cleaned++;
            }
        }
        return cleaned;
    }
}
exports.CacheManager = CacheManager;
/**
 * Build cache manager for TypeScript compilation caching
 */
class BuildCacheManager {
    constructor() {
        this.cache = new CacheManager({
            maxSize: 100,
            defaultTtl: 3600000 // 1 hour
        });
    }
    /**
     * Gets singleton instance
     * @returns Build cache manager instance
     */
    static getInstance() {
        if (!BuildCacheManager.instance) {
            BuildCacheManager.instance = new BuildCacheManager();
        }
        return BuildCacheManager.instance;
    }
    /**
     * Gets cached build result
     * @param fileHash - File hash for cache key
     * @returns Cached build result or null
     */
    getBuildResult(fileHash) {
        return this.cache.get(`build:${fileHash}`);
    }
    /**
     * Sets build result in cache
     * @param fileHash - File hash for cache key
     * @param result - Build result to cache
     */
    setBuildResult(fileHash, result) {
        this.cache.set(`build:${fileHash}`, result);
    }
    /**
     * Clears build cache
     */
    clearBuildCache() {
        this.cache.clear();
    }
    /**
     * Gets cache statistics
     * @returns Cache statistics
     */
    getStats() {
        return {
            size: this.cache.size(),
            maxSize: 100
        };
    }
}
exports.BuildCacheManager = BuildCacheManager;
//# sourceMappingURL=CacheManager.js.map