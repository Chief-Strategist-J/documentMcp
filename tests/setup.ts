import 'jest';
import { TextDecoder, TextEncoder } from 'util';

/**
 * Test setup configuration
 * Follows DRY principles - centralized test configuration
 */

// ─── Environment ────────────────────────────────────────────────────────────

process.env['DATABASE_URL'] = 'postgres://test:test@localhost:5432/test_documents';
process.env['PORT'] = '3001';
process.env['CORS_ORIGIN'] = '*';
process.env['NODE_ENV'] = 'test';

// ─── Globals ─────────────────────────────────────────────────────────────────

// Required by many HTTP/parsing libs when running under Node via Jest
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder as typeof global.TextDecoder;

// Global timeout — 30s is fine for integration, consider 5s for pure unit suites
jest.setTimeout(30000);

// ─── Console suppression ─────────────────────────────────────────────────────
// Suppress noise but preserve `error` so real failures still surface in CI logs

const originalConsole = { ...console };

global.console = {
  ...console,
  log:   jest.fn(),
  info:  jest.fn(),
  warn:  jest.fn(),
  debug: jest.fn(),
  error: jest.fn(),   // silenced during tests; swap to originalConsole.error if you want errors visible
};

// ─── Fetch mock ──────────────────────────────────────────────────────────────

global.fetch = jest.fn();

// ─── Lifecycle ───────────────────────────────────────────────────────────────

beforeAll(async () => {
  // DB/service bootstrap goes here
  originalConsole.log('Setting up test environment...');
});

afterAll(async () => {
  // DB teardown, close open handles (pg pools, redis, etc.)
  originalConsole.log('Cleaning up test environment...');

  // Flush any pending async handles so Jest doesn't warn about open handles
  await new Promise<void>((resolve) => setTimeout(resolve, 100));
});

beforeEach(() => {
  jest.clearAllMocks();
});

afterEach(() => {
  // WARNING: resetModules re-requires every module on the next import.
  // Only keep this if you intentionally need module isolation per test —
  // it significantly slows down large suites. Remove if not needed.
  jest.resetModules();
});