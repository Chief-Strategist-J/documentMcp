#!/usr/bin/env node

/**
 * Optimized build script with caching
 * Follows DRY principles - centralized build optimization
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

// Import build optimizer
const { BuildOptimizer } = require("../dist/utils/BuildOptimizer");

/**
 * Optimized build process
 */
async function runOptimizedBuild() {
  console.log("🚀 Starting optimized build...");

  const startTime = Date.now();
  const sourceDir = path.join(process.cwd(), "src");
  const outputDir = path.join(process.cwd(), "dist");

  try {
    // Initialize build optimizer
    const optimizer = BuildOptimizer.getInstance();

    // Clean previous build if needed
    const cleanBuild = process.argv.includes("--clean");
    if (cleanBuild) {
      console.log("🧹 Cleaning previous build...");
      optimizer.cleanupBuildDirectory();
    }

    // Optimize build process
    const metrics = await optimizer.optimizeBuild(sourceDir, outputDir);

    // Run TypeScript compiler with incremental compilation
    console.log("📦 Running TypeScript compilation...");
    const tscCommand = cleanBuild ? "npm run build:clean" : "npm run build";

    try {
      execSync(tscCommand, { stdio: "inherit" });
    } catch (error) {
      console.error("❌ TypeScript compilation failed");
      process.exit(1);
    }

    // Cache build results
    console.log("💾 Caching build results...");
    const sourceFiles = optimizer.scanSourceFiles(sourceDir, [
      ".ts",
      ".js",
      ".json",
    ]);

    for (const file of sourceFiles) {
      const relativePath = path.relative(sourceDir, file.path);
      const outputPath = path.join(
        outputDir,
        relativePath.replace(".ts", ".js"),
      );

      if (fs.existsSync(outputPath)) {
        optimizer.cacheBuildResult(file, outputPath);
      }
    }

    const totalTime = Date.now() - startTime;

    // Display build metrics
    console.log("\n📊 Build Metrics:");
    console.log(`   Total files: ${metrics.totalFiles}`);
    console.log(`   Changed files: ${metrics.changedFiles}`);
    console.log(`   Cached files: ${metrics.cachedFiles}`);
    console.log(`   Cache hit rate: ${metrics.cacheHitRate.toFixed(1)}%`);
    console.log(`   Build time: ${totalTime}ms`);

    // Display cache statistics
    const cacheStats = optimizer.getCacheStats();
    console.log("\n💾 Cache Statistics:");
    console.log(`   Cache size: ${cacheStats.size}/${cacheStats.maxSize}`);

    console.log("\n✅ Build completed successfully!");
  } catch (error) {
    console.error("❌ Build failed:", error.message);
    process.exit(1);
  }
}

/**
 * Cache management commands
 */
function manageCache() {
  const command = process.argv[2];
  const optimizer = BuildOptimizer.getInstance();

  switch (command) {
    case "clear":
      console.log("🧹 Clearing build cache...");
      optimizer.clearCache();
      console.log("✅ Cache cleared");
      break;

    case "stats":
      const stats = optimizer.getCacheStats();
      console.log("📊 Cache Statistics:");
      console.log(`   Size: ${stats.size}/${stats.maxSize}`);
      console.log(
        `   Usage: ${((stats.size / stats.maxSize) * 100).toFixed(1)}%`,
      );
      break;

    default:
      console.log("Usage: node scripts/build-optimized.js [clear|stats]");
      console.log("  clear - Clear build cache");
      console.log("  stats - Show cache statistics");
  }
}

// Main execution
if (process.argv.includes("--help") || process.argv.includes("-h")) {
  console.log("Optimized Build Script");
  console.log("Usage:");
  console.log(
    "  node scripts/build-optimized.js          - Run optimized build",
  );
  console.log(
    "  node scripts/build-optimized.js --clean - Clean build and cache",
  );
  console.log("  node scripts/build-optimized.js clear   - Clear cache");
  console.log("  node scripts/build-optimized.js stats   - Show cache stats");
} else if (
  process.argv.length > 2 &&
  ["clear", "stats"].includes(process.argv[2])
) {
  manageCache();
} else {
  runOptimizedBuild();
}
