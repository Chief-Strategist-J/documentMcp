/**
 * Cache manager for build and runtime caching
 * Follows DRY principles - centralized caching logic
 */
export interface CacheEntry<T> {
    data: T;
    timestamp: number;
    ttl: number;
}
export interface CacheConfig {
    maxSize: number;
    defaultTtl: number;
}
/**
 * Generic cache manager with TTL support
 */
export declare class CacheManager<T> {
    private cache;
    private maxSize;
    private defaultTtl;
    constructor(config: CacheConfig);
    /**
     * Gets value from cache
     * @param key - Cache key
     * @returns Cached value or null if not found/expired
     */
    get(key: string): T | null;
    /**
     * Sets value in cache
     * @param key - Cache key
     * @param data - Data to cache
     * @param ttl - Time to live in milliseconds (optional)
     */
    set(key: string, data: T, ttl?: number): void;
    /**
     * Deletes value from cache
     * @param key - Cache key
     * @returns True if key was deleted
     */
    delete(key: string): boolean;
    /**
     * Clears all cache entries
     */
    clear(): void;
    /**
     * Gets cache size
     * @returns Number of cached entries
     */
    size(): number;
    /**
     * Checks if key exists and is not expired
     * @param key - Cache key
     * @returns True if key exists and is valid
     */
    has(key: string): boolean;
    /**
     * Evicts oldest entry from cache
     */
    private evictOldest;
    /**
     * Cleans up expired entries
     * @returns Number of entries cleaned up
     */
    cleanup(): number;
}
/**
 * Build cache manager for TypeScript compilation caching
 */
export declare class BuildCacheManager {
    private static instance;
    private cache;
    private constructor();
    /**
     * Gets singleton instance
     * @returns Build cache manager instance
     */
    static getInstance(): BuildCacheManager;
    /**
     * Gets cached build result
     * @param fileHash - File hash for cache key
     * @returns Cached build result or null
     */
    getBuildResult(fileHash: string): string | null;
    /**
     * Sets build result in cache
     * @param fileHash - File hash for cache key
     * @param result - Build result to cache
     */
    setBuildResult(fileHash: string, result: string): void;
    /**
     * Clears build cache
     */
    clearBuildCache(): void;
    /**
     * Gets cache statistics
     * @returns Cache statistics
     */
    getStats(): {
        size: number;
        maxSize: number;
    };
}
//# sourceMappingURL=CacheManager.d.ts.map