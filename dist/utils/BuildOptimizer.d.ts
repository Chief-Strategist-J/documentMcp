/**
 * Build optimization utilities
 * Follows DRY principles - centralized build optimization logic
 */
export interface BuildFileInfo {
    path: string;
    hash: string;
    lastModified: number;
    size: number;
}
export interface BuildMetrics {
    totalFiles: number;
    changedFiles: number;
    cachedFiles: number;
    buildTime: number;
    cacheHitRate: number;
}
/**
 * Build optimizer with file hashing and caching
 */
export declare class BuildOptimizer {
    private static instance;
    private cacheManager;
    private buildDir;
    private constructor();
    /**
     * Gets singleton instance
     * @returns Build optimizer instance
     */
    static getInstance(): BuildOptimizer;
    /**
     * Calculates file hash for caching
     * @param filePath - Path to file
     * @returns File hash string
     */
    calculateFileHash(filePath: string): string;
    /**
     * Gets file information for build tracking
     * @param filePath - Path to file
     * @returns File information object
     */
    getFileInfo(filePath: string): BuildFileInfo;
    /**
     * Scans source directory for files
     * @param sourceDir - Source directory path
     * @param extensions - File extensions to include
     * @returns Array of file information
     */
    scanSourceFiles(sourceDir: string, extensions: string[]): BuildFileInfo[];
    /**
     * Determines which files need rebuilding
     * @param sourceFiles - Array of source file information
     * @returns Files that need rebuilding
     */
    getFilesToRebuild(sourceFiles: BuildFileInfo[]): BuildFileInfo[];
    /**
     * Caches build result for a file
     * @param file - File information
     * @param outputPath - Output file path
     */
    cacheBuildResult(file: BuildFileInfo, outputPath: string): void;
    /**
     * Restores cached build result
     * @param file - File information
     * @param outputPath - Output file path
     * @returns True if cache was restored
     */
    restoreCachedResult(file: BuildFileInfo, outputPath: string): boolean;
    /**
     * Cleans up build directory
     */
    cleanupBuildDirectory(): void;
    /**
     * Gets build cache statistics
     * @returns Cache statistics
     */
    getCacheStats(): {
        size: number;
        maxSize: number;
    };
    /**
     * Clears build cache
     */
    clearCache(): void;
    /**
     * Optimizes build process
     * @param sourceDir - Source directory
     * @param outputDir - Output directory
     * @returns Build metrics
     */
    optimizeBuild(sourceDir: string, outputDir: string): Promise<BuildMetrics>;
}
//# sourceMappingURL=BuildOptimizer.d.ts.map