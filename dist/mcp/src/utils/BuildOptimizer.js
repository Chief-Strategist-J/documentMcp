"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BuildOptimizer = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const crypto = __importStar(require("crypto"));
const CacheManager_1 = require("./CacheManager");
/**
 * Build optimizer with file hashing and caching
 */
class BuildOptimizer {
    constructor() {
        this.cacheManager = CacheManager_1.BuildCacheManager.getInstance();
        this.buildDir = path.join(process.cwd(), 'dist');
    }
    /**
     * Gets singleton instance
     * @returns Build optimizer instance
     */
    static getInstance() {
        if (!BuildOptimizer.instance) {
            BuildOptimizer.instance = new BuildOptimizer();
        }
        return BuildOptimizer.instance;
    }
    /**
     * Calculates file hash for caching
     * @param filePath - Path to file
     * @returns File hash string
     */
    calculateFileHash(filePath) {
        try {
            if (!fs.existsSync(filePath)) {
                return '';
            }
            const fileBuffer = fs.readFileSync(filePath);
            const hash = crypto.createHash('sha256');
            hash.update(fileBuffer);
            return hash.digest('hex');
        }
        catch (error) {
            console.error(`Error calculating hash for ${filePath}:`, error);
            return '';
        }
    }
    /**
     * Gets file information for build tracking
     * @param filePath - Path to file
     * @returns File information object
     */
    getFileInfo(filePath) {
        try {
            const stats = fs.statSync(filePath);
            return {
                path: filePath,
                hash: this.calculateFileHash(filePath),
                lastModified: stats.mtime.getTime(),
                size: stats.size
            };
        }
        catch (error) {
            console.error(`Error getting file info for ${filePath}:`, error);
            return {
                path: filePath,
                hash: '',
                lastModified: 0,
                size: 0
            };
        }
    }
    /**
     * Scans source directory for files
     * @param sourceDir - Source directory path
     * @param extensions - File extensions to include
     * @returns Array of file information
     */
    scanSourceFiles(sourceDir, extensions) {
        const files = [];
        if (!fs.existsSync(sourceDir)) {
            return files;
        }
        const scanDirectory = (dir) => {
            const items = fs.readdirSync(dir);
            for (const item of items) {
                const fullPath = path.join(dir, item);
                const stats = fs.statSync(fullPath);
                if (stats.isDirectory()) {
                    scanDirectory(fullPath);
                }
                else if (stats.isFile()) {
                    const ext = path.extname(item);
                    if (extensions.includes(ext)) {
                        files.push(this.getFileInfo(fullPath));
                    }
                }
            }
        };
        scanDirectory(sourceDir);
        return files;
    }
    /**
     * Determines which files need rebuilding
     * @param sourceFiles - Array of source file information
     * @returns Files that need rebuilding
     */
    getFilesToRebuild(sourceFiles) {
        const filesToRebuild = [];
        let cachedCount = 0;
        for (const file of sourceFiles) {
            const cacheKey = file.hash;
            const cached = this.cacheManager.getBuildResult(cacheKey);
            if (!cached) {
                filesToRebuild.push(file);
            }
            else {
                cachedCount++;
            }
        }
        console.log(`Cache hit: ${cachedCount}/${sourceFiles.length} files`);
        return filesToRebuild;
    }
    /**
     * Caches build result for a file
     * @param file - File information
     * @param outputPath - Output file path
     */
    cacheBuildResult(file, outputPath) {
        try {
            if (fs.existsSync(outputPath)) {
                const outputContent = fs.readFileSync(outputPath, 'utf8');
                this.cacheManager.setBuildResult(file.hash, outputContent);
            }
        }
        catch (error) {
            console.error(`Error caching build result for ${file.path}:`, error);
        }
    }
    /**
     * Restores cached build result
     * @param file - File information
     * @param outputPath - Output file path
     * @returns True if cache was restored
     */
    restoreCachedResult(file, outputPath) {
        try {
            const cached = this.cacheManager.getBuildResult(file.hash);
            if (cached) {
                // Ensure output directory exists
                const outputDir = path.dirname(outputPath);
                if (!fs.existsSync(outputDir)) {
                    fs.mkdirSync(outputDir, { recursive: true });
                }
                fs.writeFileSync(outputPath, cached, 'utf8');
                return true;
            }
            return false;
        }
        catch (error) {
            console.error(`Error restoring cached result for ${file.path}:`, error);
            return false;
        }
    }
    /**
     * Cleans up build directory
     */
    cleanupBuildDirectory() {
        try {
            if (fs.existsSync(this.buildDir)) {
                fs.rmSync(this.buildDir, { recursive: true, force: true });
            }
        }
        catch (error) {
            console.error('Error cleaning build directory:', error);
        }
    }
    /**
     * Gets build cache statistics
     * @returns Cache statistics
     */
    getCacheStats() {
        return this.cacheManager.getStats();
    }
    /**
     * Clears build cache
     */
    clearCache() {
        this.cacheManager.clearBuildCache();
    }
    /**
     * Optimizes build process
     * @param sourceDir - Source directory
     * @param outputDir - Output directory
     * @returns Build metrics
     */
    async optimizeBuild(sourceDir, outputDir) {
        const startTime = Date.now();
        // Scan source files
        const sourceFiles = this.scanSourceFiles(sourceDir, ['.ts', '.js', '.json']);
        const totalFiles = sourceFiles.length;
        // Get files that need rebuilding
        const filesToRebuild = this.getFilesToRebuild(sourceFiles);
        const changedFiles = filesToRebuild.length;
        const cachedFiles = totalFiles - changedFiles;
        // Restore cached files
        let restoredCount = 0;
        for (const file of sourceFiles) {
            const relativePath = path.relative(sourceDir, file.path);
            const outputPath = path.join(outputDir, relativePath.replace('.ts', '.js'));
            if (this.restoreCachedResult(file, outputPath)) {
                restoredCount++;
            }
        }
        const buildTime = Date.now() - startTime;
        const cacheHitRate = totalFiles > 0 ? (cachedFiles / totalFiles) * 100 : 0;
        return {
            totalFiles,
            changedFiles,
            cachedFiles,
            buildTime,
            cacheHitRate
        };
    }
}
exports.BuildOptimizer = BuildOptimizer;
