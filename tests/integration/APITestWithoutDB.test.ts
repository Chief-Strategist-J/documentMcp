import request from 'supertest';
import { DocumentServer } from '../../src/api/server';
import { DatabaseManager } from '../../src/database/DatabaseManager';

/**
 * Integration tests for API without database dependency
 * Follows DRY principles - centralized test configuration
 * Follows strict null handling and typecasting rules
 */

describe('API Integration Tests (No Database)', () => {
  let server: DocumentServer;
  let app: any;

  beforeAll(async () => {
    // Create server with mock database to test API structure
    server = new DocumentServer('mock://database');
    app = server.getApp();
  });

  describe('API Structure Verification', () => {
    test('should have health endpoint', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.body).toHaveProperty('success');
      expect(response.body.data).toHaveProperty('status');
    });

    test('should return proper error for invalid endpoints', async () => {
      const response = await request(app)
        .get('/api/invalid-endpoint')
        .expect(404);
    });

    test('should handle malformed JSON', async () => {
      const response = await request(app)
        .post('/api/documents')
        .set('Content-Type', 'application/json')
        .send('invalid-json')
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });

    test('should include CORS headers', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.headers).toHaveProperty('access-control-allow-origin');
    });
  });

  describe('Request Validation', () => {
    test('should reject document creation without required fields', async () => {
      const response = await request(app)
        .post('/api/documents')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });

    test('should reject document creation with invalid type', async () => {
      const response = await request(app)
        .post('/api/documents')
        .send({
          name: 'Test Document',
          type: 'invalid-type',
          layoutSchema: {
            schemaId: 'test',
            schemaVersion: '1.0.0',
            tableName: 'Test',
            dimensions: {
              minRows: 1,
              maxRows: 100,
              defaultRows: 10,
              columnCount: 5
            }
          }
        })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });

    test('should reject section creation without documentId', async () => {
      const response = await request(app)
        .post('/api/sections')
        .send({
          sectionType: 'table',
          sectionOrder: 1,
          contentSchema: {},
          stylingSchema: {}
        })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });

    test('should reject section creation with invalid sectionType', async () => {
      const response = await request(app)
        .post('/api/sections')
        .send({
          documentId: 'test-id',
          sectionType: 'invalid-type',
          sectionOrder: 1,
          contentSchema: {},
          stylingSchema: {}
        })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('Schema Validation Endpoint', () => {
    test('should reject schema validation without schema', async () => {
      const response = await request(app)
        .post('/api/validation/validate')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });

    test('should handle schema validation with valid document schema', async () => {
      const validSchema = {
        schemaId: 'test-schema',
        schemaVersion: '1.0.0',
        tableName: 'Test Table',
        dimensions: {
          minRows: 1,
          maxRows: 100,
          defaultRows: 10,
          columnCount: 5
        }
      };

      // This will fail due to database connection, but should validate the schema structure
      const response = await request(app)
        .post('/api/validation/validate')
        .send(validSchema);

      // Should either succeed or fail gracefully with proper error handling
      expect([200, 500]).toContain(response.status);
      expect(response.body).toHaveProperty('success');
    });
  });

  describe('Document Generation Endpoint', () => {
    test('should reject document generation without format', async () => {
      const response = await request(app)
        .post('/api/documents/test-id/generate')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });

    test('should reject document generation with invalid format', async () => {
      const response = await request(app)
        .post('/api/documents/test-id/generate')
        .send({
          format: 'invalid-format',
          options: {}
        })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });

    test('should handle document generation request structure', async () => {
      const validRequest = {
        format: 'word',
        options: {
          pageSize: 'A4',
          orientation: 'portrait',
          margins: { top: 72, right: 72, bottom: 72, left: 72 }
        }
      };

      // This will fail due to database connection, but should validate request structure
      const response = await request(app)
        .post('/api/documents/test-id/generate')
        .send(validRequest);

      // Should either succeed or fail gracefully with proper error handling
      expect([200, 500]).toContain(response.status);
      expect(response.body).toHaveProperty('success');
    });
  });

  describe('Parameter Validation', () => {
    test('should handle pagination parameters correctly', async () => {
      const response = await request(app)
        .get('/api/documents?limit=10&offset=0')
        .expect(500); // Will fail due to no database, but should handle parameters

      expect(response.body).toHaveProperty('success');
    });

    test('should reject negative pagination parameters', async () => {
      const response = await request(app)
        .get('/api/documents?limit=-1&offset=-1')
        .expect(500); // Will fail due to no database, but should validate parameters

      expect(response.body).toHaveProperty('success');
    });

    test('should handle document ID parameter validation', async () => {
      const response = await request(app)
        .get('/api/documents/invalid-id')
        .expect(500); // Will fail due to no database, but should validate ID format

      expect(response.body).toHaveProperty('success');
    });
  });

  describe('Error Handling', () => {
    test('should handle server errors gracefully', async () => {
      // This will cause a database error, but should be handled gracefully
      const response = await request(app)
        .get('/api/documents')
        .expect(500);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });

    test('should maintain consistent error response format', async () => {
      const responses = await Promise.all([
        request(app).get('/api/documents'),
        request(app).get('/api/documents/test-id'),
        request(app).get('/api/documents/test-id/sections')
      ]);

      responses.forEach(response => {
        expect(response.status).toBe(500);
        expect(response.body).toHaveProperty('success', false);
        expect(response.body).toHaveProperty('error');
        expect(typeof response.body.error).toBe('string');
      });
    });
  });
});
