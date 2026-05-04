import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { BuildCacheManager } from './CacheManager';

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
export class BuildOptimizer {
  private static instance: BuildOptimizer;
  private cacheManager: BuildCacheManager;
  private buildDir: string;

  private constructor() {
    this.cacheManager = BuildCacheManager.getInstance();
    this.buildDir = path.join(process.cwd(), 'dist');
  }

  /**
   * Gets singleton instance
   * @returns Build optimizer instance
   */
  static getInstance(): BuildOptimizer {
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
  calculateFileHash(filePath: string): string {
    try {
      if (!fs.existsSync(filePath)) {
        return '';
      }

      const fileBuffer = fs.readFileSync(filePath);
      const hash = crypto.createHash('sha256');
      hash.update(fileBuffer);
      return hash.digest('hex');
    } catch (error) {
      console.error(`Error calculating hash for ${filePath}:`, error);
      return '';
    }
  }

  /**
   * Gets file information for build tracking
   * @param filePath - Path to file
   * @returns File information object
   */
  getFileInfo(filePath: string): BuildFileInfo {
    try {
      const stats = fs.statSync(filePath);
      return {
        path: filePath,
        hash: this.calculateFileHash(filePath),
        lastModified: stats.mtime.getTime(),
        size: stats.size
      };
    } catch (error) {
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
  scanSourceFiles(sourceDir: string, extensions: string[]): BuildFileInfo[] {
    const files: BuildFileInfo[] = [];
    
    if (!fs.existsSync(sourceDir)) {
      return files;
    }

    const scanDirectory = (dir: string): void => {
      const items = fs.readdirSync(dir);
      
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stats = fs.statSync(fullPath);
        
        if (stats.isDirectory()) {
          scanDirectory(fullPath);
        } else if (stats.isFile()) {
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
  getFilesToRebuild(sourceFiles: BuildFileInfo[]): BuildFileInfo[] {
    const filesToRebuild: BuildFileInfo[] = [];
    let cachedCount = 0;

    for (const file of sourceFiles) {
      const cacheKey = file.hash;
      const cached = this.cacheManager.getBuildResult(cacheKey);
      
      if (!cached) {
        filesToRebuild.push(file);
      } else {
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
  cacheBuildResult(file: BuildFileInfo, outputPath: string): void {
    try {
      if (fs.existsSync(outputPath)) {
        const outputContent = fs.readFileSync(outputPath, 'utf8');
        this.cacheManager.setBuildResult(file.hash, outputContent);
      }
    } catch (error) {
      console.error(`Error caching build result for ${file.path}:`, error);
    }
  }

  /**
   * Restores cached build result
   * @param file - File information
   * @param outputPath - Output file path
   * @returns True if cache was restored
   */
  restoreCachedResult(file: BuildFileInfo, outputPath: string): boolean {
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
    } catch (error) {
      console.error(`Error restoring cached result for ${file.path}:`, error);
      return false;
    }
  }

  /**
   * Cleans up build directory
   */
  cleanupBuildDirectory(): void {
    try {
      if (fs.existsSync(this.buildDir)) {
        fs.rmSync(this.buildDir, { recursive: true, force: true });
      }
    } catch (error) {
      console.error('Error cleaning build directory:', error);
    }
  }

  /**
   * Gets build cache statistics
   * @returns Cache statistics
   */
  getCacheStats(): { size: number; maxSize: number } {
    return this.cacheManager.getStats();
  }

  /**
   * Clears build cache
   */
  clearCache(): void {
    this.cacheManager.clearBuildCache();
  }

  /**
   * Optimizes build process
   * @param sourceDir - Source directory
   * @param outputDir - Output directory
   * @returns Build metrics
   */
  async optimizeBuild(sourceDir: string, outputDir: string): Promise<BuildMetrics> {
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
