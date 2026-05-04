import 'jest';

/**
 * Test setup configuration
 * Follows DRY principles - centralized test configuration
 */

// Mock environment variables
process.env['DATABASE_URL'] = 'postgres://test:test@localhost:5432/test_documents';
process.env['PORT'] = '3001';
process.env['CORS_ORIGIN'] = '*';

// Global test timeout
jest.setTimeout(30000);

// Mock console methods to reduce test noise
global.console = {
  ...console,
  log: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Mock fetch for API tests
global.fetch = jest.fn();

// Setup test database connection
beforeAll(async () => {
  // Test database setup would go here
  console.log('Setting up test environment...');
});

afterAll(async () => {
  // Cleanup test database
  console.log('Cleaning up test environment...');
});

beforeEach(() => {
  // Clear all mocks before each test
  jest.clearAllMocks();
});

afterEach(() => {
  // Reset modules after each test
  jest.resetModules();
});
