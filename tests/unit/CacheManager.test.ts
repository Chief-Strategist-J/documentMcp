import { CacheManager, BuildCacheManager } from '../../src/utils/CacheManager';

/**
 * Unit tests for CacheManager
 * Follows DRY principles - comprehensive test coverage
 */

describe('CacheManager', () => {
  let cacheManager: CacheManager<string>;

  beforeEach(() => {
    cacheManager = new CacheManager<string>({
      maxSize: 3,
      defaultTtl: 1000
    });
  });

  describe('Basic Operations', () => {
    test('should set and get value', () => {
      const key = 'test-key';
      const value = 'test-value';

      cacheManager.set(key, value);
      const result = cacheManager.get(key);

      expect(result).toBe(value);
    });

    test('should return null for non-existent key', () => {
      const result = cacheManager.get('non-existent');
      expect(result).toBeNull();
    });

    test('should delete key', () => {
      const key = 'test-key';
      const value = 'test-value';

      cacheManager.set(key, value);
      const deleted = cacheManager.delete(key);
      const result = cacheManager.get(key);

      expect(deleted).toBe(true);
      expect(result).toBeNull();
    });

    test('should return false when deleting non-existent key', () => {
      const deleted = cacheManager.delete('non-existent');
      expect(deleted).toBe(false);
    });

    test('should clear all entries', () => {
      cacheManager.set('key1', 'value1');
      cacheManager.set('key2', 'value2');
      cacheManager.set('key3', 'value3');

      cacheManager.clear();

      expect(cacheManager.get('key1')).toBeNull();
      expect(cacheManager.get('key2')).toBeNull();
      expect(cacheManager.get('key3')).toBeNull();
      expect(cacheManager.size()).toBe(0);
    });

    test('should check if key exists', () => {
      const key = 'test-key';
      const value = 'test-value';

      expect(cacheManager.has(key)).toBe(false);

      cacheManager.set(key, value);
      expect(cacheManager.has(key)).toBe(true);

      cacheManager.delete(key);
      expect(cacheManager.has(key)).toBe(false);
    });
  });

  describe('TTL (Time To Live)', () => {
    test('should expire entries after TTL', (done) => {
      const key = 'test-key';
      const value = 'test-value';
      const shortTtl = 50;

      cacheManager.set(key, value, shortTtl);

      expect(cacheManager.get(key)).toBe(value);

      setTimeout(() => {
        const result = cacheManager.get(key);
        expect(result).toBeNull();
        done();
      }, shortTtl + 10);
    });

    test('should use default TTL when not specified', (done) => {
      const key = 'test-key';
      const value = 'test-value';

      cacheManager.set(key, value);

      setTimeout(() => {
        const result = cacheManager.get(key);
        expect(result).toBeNull();
        done();
      }, 1100);
    });

    test('should cleanup expired entries', () => {
      const key1 = 'key1';
      const key2 = 'key2';
      const shortTtl = 50;

      cacheManager.set(key1, 'value1', shortTtl);
      cacheManager.set(key2, 'value2', 2000);

      setTimeout(() => {
        const cleaned = cacheManager.cleanup();
        expect(cleaned).toBe(1);
        expect(cacheManager.has(key1)).toBe(false);
        expect(cacheManager.has(key2)).toBe(true);
      }, shortTtl + 10);
    });
  });

  describe('Size Management', () => {
    test('should evict oldest entry when max size exceeded', () => {
      cacheManager.set('key1', 'value1');
      cacheManager.set('key2', 'value2');
      cacheManager.set('key3', 'value3');

      expect(cacheManager.size()).toBe(3);

      cacheManager.set('key4', 'value4');

      expect(cacheManager.size()).toBe(3);
      expect(cacheManager.get('key1')).toBeNull();
      expect(cacheManager.get('key2')).toBe('value2');
      expect(cacheManager.get('key3')).toBe('value3');
      expect(cacheManager.get('key4')).toBe('value4');
    });

    test('should return correct size', () => {
      expect(cacheManager.size()).toBe(0);

      cacheManager.set('key1', 'value1');
      expect(cacheManager.size()).toBe(1);

      cacheManager.set('key2', 'value2');
      expect(cacheManager.size()).toBe(2);

      cacheManager.delete('key1');
      expect(cacheManager.size()).toBe(1);
    });
  });

  describe('Edge Cases', () => {
    test('should handle empty string keys', () => {
      const key = '';
      const value = 'value';

      cacheManager.set(key, value);
      const result = cacheManager.get(key);

      expect(result).toBe(value);
    });

    test('should handle null and undefined values', () => {
      const key = 'test-key';

      cacheManager.set(key, null as any);
      const result1 = cacheManager.get(key);
      expect(result1).toBeNull();

      cacheManager.set(key, undefined as any);
      const result2 = cacheManager.get(key);
      expect(result2).toBeUndefined();
    });

    test('should handle very large TTL values', () => {
      const key = 'test-key';
      const value = 'test-value';
      const largeTtl = Number.MAX_SAFE_INTEGER;

      cacheManager.set(key, value, largeTtl);
      const result = cacheManager.get(key);

      expect(result).toBe(value);
    });
  });
});

describe('BuildCacheManager', () => {
  let buildCache: BuildCacheManager;

  beforeEach(() => {
    buildCache = BuildCacheManager.getInstance();
    buildCache.clearBuildCache();
  });

  describe('Singleton Pattern', () => {
    test('should return same instance', () => {
      const instance1 = BuildCacheManager.getInstance();
      const instance2 = BuildCacheManager.getInstance();

      expect(instance1).toBe(instance2);
    });
  });

  describe('Build Operations', () => {
    test('should set and get build results', () => {
      const fileHash = 'abc123';
      const result = 'compiled-content';

      buildCache.setBuildResult(fileHash, result);
      const retrieved = buildCache.getBuildResult(fileHash);

      expect(retrieved).toBe(result);
    });

    test('should return null for non-existent build result', () => {
      const result = buildCache.getBuildResult('non-existent');
      expect(result).toBeNull();
    });

    test('should clear build cache', () => {
      buildCache.setBuildResult('hash1', 'result1');
      buildCache.setBuildResult('hash2', 'result2');

      buildCache.clearBuildCache();

      expect(buildCache.getBuildResult('hash1')).toBeNull();
      expect(buildCache.getBuildResult('hash2')).toBeNull();
    });
  });

  describe('Statistics', () => {
    test('should return cache statistics', () => {
      const stats = buildCache.getStats();

      expect(stats).toHaveProperty('size');
      expect(stats).toHaveProperty('maxSize');
      expect(typeof stats.size).toBe('number');
      expect(typeof stats.maxSize).toBe('number');
      expect(stats.maxSize).toBe(100);
    });
  });
});
