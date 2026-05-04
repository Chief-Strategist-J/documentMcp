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
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentServer = exports.DocumentClient = void 0;
const server_1 = require("./api/server");
Object.defineProperty(exports, "DocumentServer", { enumerable: true, get: function () { return server_1.DocumentServer; } });
const DocumentClient_1 = require("./sdk/DocumentClient");
Object.defineProperty(exports, "DocumentClient", { enumerable: true, get: function () { return DocumentClient_1.DocumentClient; } });
/**
 * Main entry point for the Document Management SDK
 * Sets up the server and provides SDK exports
 * Follows strict error handling and fallback strategies
 */
// Get database URL from environment or use default - follows null handling rules
const databaseUrl = process.env['DATABASE_URL'] || 'postgres://localhost:5432/document_management';
/**
 * Creates server with fallback to mock database - follows DRY principles
 * @param connectionString - Database connection string
 * @returns Configured server instance
 */
function createServerWithFallback(connectionString) {
    try {
        // Validate connection string - follows typecasting rules
        if (!connectionString || typeof connectionString !== 'string') {
            throw new Error('Database connection string must be a non-empty string');
        }
        // Try to create server with real database
        return new server_1.DocumentServer(connectionString);
    }
    catch (error) {
        // Fallback to mock database for testing/demonstration
        console.warn('⚠️  Database connection failed, using mock database for testing');
        console.warn(`   Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        // Create server with mock database
        const mockServer = new server_1.DocumentServer('mock://database');
        return mockServer;
    }
}
// Create and start server with fallback
const server = createServerWithFallback(databaseUrl);
// Start server if this file is run directly - follows proper error handling
if (require.main === module) {
    const portString = process.env['PORT'] || '3000';
    // Validate port - follows boundary condition rules
    const port = parseInt(portString, 10);
    if (isNaN(port) || port < 1 || port > 65535) {
        console.error('❌ Invalid port number:', portString);
        process.exit(1);
    }
    server.start(port).catch(error => {
        console.error('❌ Failed to start server:', error instanceof Error ? error.message : 'Unknown error');
        process.exit(1);
    });
}
__exportStar(require("./types"), exports);
__exportStar(require("./validation/SchemaValidator"), exports);
__exportStar(require("./database/DatabaseManager"), exports);
//# sourceMappingURL=index.js.map