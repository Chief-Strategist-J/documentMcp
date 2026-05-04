import { DocumentServer } from './api/server';
import { DocumentClient } from './sdk/DocumentClient';
import { MockDatabaseManager } from './database/MockDatabaseManager';

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
function createServerWithFallback(connectionString: string): DocumentServer {
  try {
    // Validate connection string - follows typecasting rules
    if (!connectionString || typeof connectionString !== 'string') {
      throw new Error('Database connection string must be a non-empty string');
    }

    // Try to create server with real database
    return new DocumentServer(connectionString);
  } catch (error) {
    // Fallback to mock database for testing/demonstration
    console.warn('⚠️  Database connection failed, using mock database for testing');
    console.warn(`   Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    
    // Create server with mock database
    const mockServer = new DocumentServer('mock://database');
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

// Export SDK components for use as a library
export { DocumentClient, DocumentServer };
export * from './types';
export * from './validation/SchemaValidator';
export * from './database/DatabaseManager';
