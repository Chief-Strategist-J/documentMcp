import request from 'supertest';
import { DocumentServer } from '../../src/api/server';
import { DatabaseManager } from '../../src/database/DatabaseManager';
import { SchemaValidator } from '../../src/validation/SchemaValidator';

/**
 * Integration tests for Document API
 * Follows DRY principles - comprehensive API integration testing
 */

describe('Document API Integration Tests', () => {
  let server: DocumentServer;
  let app: any;
  let databaseManager: DatabaseManager;

  beforeAll(async () => {
    // Initialize test database
    const testDatabaseUrl = 'postgres://test:test@localhost:5432/test_documents';
    databaseManager = new DatabaseManager(testDatabaseUrl);
    
    // Initialize server
    server = new DocumentServer(testDatabaseUrl);
    app = server.getApp();
    
    // Initialize database schema
    await databaseManager.initializeDatabase();
  });

  afterAll(async () => {
    // Cleanup database connections
    await databaseManager.close();
  });

  beforeEach(async () => {
    // Clean up database before each test
    await databaseManager.clearDatabase();
  });

  describe('Health Check', () => {
    test('should return health status', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('status', 'healthy');
      expect(response.body.data).toHaveProperty('timestamp');
    });
  });

  describe('Document CRUD Operations', () => {
    test('should create a new document', async () => {
      const createRequest = {
        name: 'Test Document',
        type: 'word',
        layoutSchema: {
          schemaId: 'test-layout',
          schemaVersion: '1.0.0',
          tableName: 'Test Table',
          dimensions: {
            minRows: 1,
            maxRows: 100,
            defaultRows: 10,
            columnCount: 5
          }
        }
      };

      const response = await request(app)
        .post('/api/documents')
        .send(createRequest)
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('name', createRequest.name);
      expect(response.body.data).toHaveProperty('type', createRequest.type);
      expect(response.body.data).toHaveProperty('layoutSchema');
    });

    test('should reject document creation with missing required fields', async () => {
      const invalidRequest = {
        name: 'Test Document'
        // Missing type and layoutSchema
      };

      const response = await request(app)
        .post('/api/documents')
        .send(invalidRequest)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });

    test('should reject document creation with invalid type', async () => {
      const invalidRequest = {
        name: 'Test Document',
        type: 'invalid-type',
        layoutSchema: {
          schemaId: 'test-layout',
          schemaVersion: '1.0.0',
          tableName: 'Test Table',
          dimensions: {
            minRows: 1,
            maxRows: 100,
            defaultRows: 10,
            columnCount: 5
          }
        }
      };

      const response = await request(app)
        .post('/api/documents')
        .send(invalidRequest)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toContain('Type must be either "word" or "pdf"');
    });

    test('should get document by ID', async () => {
      // First create a document
      const createRequest = {
        name: 'Test Document',
        type: 'word',
        layoutSchema: {
          schemaId: 'test-layout',
          schemaVersion: '1.0.0',
          tableName: 'Test Table',
          dimensions: {
            minRows: 1,
            maxRows: 100,
            defaultRows: 10,
            columnCount: 5
          }
        }
      };

      const createResponse = await request(app)
        .post('/api/documents')
        .send(createRequest)
        .expect(201);

      const documentId = createResponse.body.data.id;

      // Get the document
      const getResponse = await request(app)
        .get(`/api/documents/${documentId}`)
        .expect(200);

      expect(getResponse.body).toHaveProperty('success', true);
      expect(getResponse.body.data).toHaveProperty('id', documentId);
      expect(getResponse.body.data).toHaveProperty('name', createRequest.name);
    });

    test('should return 404 for non-existent document', async () => {
      const nonExistentId = 'non-existent-id';

      const response = await request(app)
        .get(`/api/documents/${nonExistentId}`)
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'Document not found');
    });

    test('should list documents with pagination', async () => {
      // Create multiple documents
      const documents = [
        { name: 'Document 1', type: 'word' },
        { name: 'Document 2', type: 'pdf' },
        { name: 'Document 3', type: 'word' }
      ];

      for (const doc of documents) {
        await request(app)
          .post('/api/documents')
          .send({
            ...doc,
            layoutSchema: {
              schemaId: 'test-layout',
              schemaVersion: '1.0.0',
              tableName: 'Test Table',
              dimensions: {
                minRows: 1,
                maxRows: 100,
                defaultRows: 10,
                columnCount: 5
              }
            }
          });
      }

      // List documents
      const response = await request(app)
        .get('/api/documents')
        .query({ limit: 2, offset: 0 })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveLength(2);
    });

    test('should update document', async () => {
      // Create a document
      const createResponse = await request(app)
        .post('/api/documents')
        .send({
          name: 'Original Document',
          type: 'word',
          layoutSchema: {
            schemaId: 'test-layout',
            schemaVersion: '1.0.0',
            tableName: 'Test Table',
            dimensions: {
              minRows: 1,
              maxRows: 100,
              defaultRows: 10,
              columnCount: 5
            }
          }
        })
        .expect(201);

      const documentId = createResponse.body.data.id;

      // Update the document
      const updateRequest = {
        name: 'Updated Document',
        layoutSchema: {
          schemaId: 'updated-layout',
          schemaVersion: '1.0.0',
          tableName: 'Updated Table',
          dimensions: {
            minRows: 5,
            maxRows: 200,
            defaultRows: 20,
            columnCount: 8
          }
        }
      };

      const updateResponse = await request(app)
        .put(`/api/documents/${documentId}`)
        .send(updateRequest)
        .expect(200);

      expect(updateResponse.body).toHaveProperty('success', true);
      expect(updateResponse.body.data).toHaveProperty('name', updateRequest.name);
    });

    test('should delete document', async () => {
      // Create a document
      const createResponse = await request(app)
        .post('/api/documents')
        .send({
          name: 'Document to Delete',
          type: 'word',
          layoutSchema: {
            schemaId: 'test-layout',
            schemaVersion: '1.0.0',
            tableName: 'Test Table',
            dimensions: {
              minRows: 1,
              maxRows: 100,
              defaultRows: 10,
              columnCount: 5
            }
          }
        })
        .expect(201);

      const documentId = createResponse.body.data.id;

      // Delete the document
      const deleteResponse = await request(app)
        .delete(`/api/documents/${documentId}`)
        .expect(200);

      expect(deleteResponse.body).toHaveProperty('success', true);

      // Verify document is deleted
      await request(app)
        .get(`/api/documents/${documentId}`)
        .expect(404);
    });
  });

  describe('Section CRUD Operations', () => {
    let documentId: string;

    beforeEach(async () => {
      // Create a test document for section tests
      const createResponse = await request(app)
        .post('/api/documents')
        .send({
          name: 'Test Document for Sections',
          type: 'word',
          layoutSchema: {
            schemaId: 'test-layout',
            schemaVersion: '1.0.0',
            tableName: 'Test Table',
            dimensions: {
              minRows: 1,
              maxRows: 100,
              defaultRows: 10,
              columnCount: 5
            }
          }
        })
        .expect(201);

      documentId = createResponse.body.data.id;
    });

    test('should create a new section', async () => {
      const createRequest = {
        documentId,
        sectionType: 'table',
        sectionOrder: 1,
        contentSchema: {
          schemaId: 'table-schema',
          columns: [
            {
              id: 'col1',
              name: 'Column 1',
              type: 'string',
              required: false,
              editable: true,
              sortable: true,
              filterable: true,
              width: 120,
              options: [],
              format: { kind: 'text', precision: 2 }
            }
          ],
          rows: {
            rowIdStrategy: 'auto',
            allowAdd: true,
            allowDelete: true,
            allowReorder: false,
            showRowNumbers: false
          },
          validationSchema: {},
          behaviorSchema: {
            sorting: { enabled: true, multiColumn: false },
            filtering: { enabled: true },
            pagination: { enabled: true, pageSize: 10 },
            editing: { enabled: true, mode: 'cell' }
          }
        },
        stylingSchema: {
          table: {
            backgroundColor: '#ffffff',
            borderColor: '#d9d9d9',
            borderWidth: 1,
            borderRadius: 4,
            fontFamily: 'Arial',
            fontSize: 12,
            textColor: '#000000'
          },
          columnOverrides: {}
        }
      };

      const response = await request(app)
        .post('/api/sections')
        .send(createRequest)
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('sectionType', createRequest.sectionType);
      expect(response.body.data).toHaveProperty('sectionOrder', createRequest.sectionOrder);
    });

    test('should get document sections', async () => {
      // Create a section first
      await request(app)
        .post('/api/sections')
        .send({
          documentId,
          sectionType: 'table',
          sectionOrder: 1,
          contentSchema: {
            schemaId: 'table-schema',
            columns: [
              {
                id: 'col1',
                name: 'Column 1',
                type: 'string',
                required: false,
                editable: true,
                sortable: true,
                filterable: true,
                width: 120,
                options: [],
                format: { kind: 'text', precision: 2 }
              }
            ],
            rows: {
              rowIdStrategy: 'auto',
              allowAdd: true,
              allowDelete: true,
              allowReorder: false,
              showRowNumbers: false
            },
            validationSchema: {},
            behaviorSchema: {
              sorting: { enabled: true, multiColumn: false },
              filtering: { enabled: true },
              pagination: { enabled: true, pageSize: 10 },
              editing: { enabled: true, mode: 'cell' }
            }
          },
          stylingSchema: {
            table: {
              backgroundColor: '#ffffff',
              borderColor: '#d9d9d9',
              borderWidth: 1,
              borderRadius: 4,
              fontFamily: 'Arial',
              fontSize: 12,
              textColor: '#000000'
            },
            columnOverrides: {}
          }
        });

      // Get sections
      const response = await request(app)
        .get(`/api/documents/${documentId}/sections`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0]).toHaveProperty('sectionType', 'table');
    });

    test('should reject section creation with invalid section type', async () => {
      const invalidRequest = {
        documentId,
        sectionType: 'invalid-type',
        sectionOrder: 1,
        contentSchema: {},
        stylingSchema: {}
      };

      const response = await request(app)
        .post('/api/sections')
        .send(invalidRequest)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toContain('Invalid section type');
    });
  });

  describe('Schema Validation', () => {
    test('should validate document schema', async () => {
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

      const response = await request(app)
        .post('/api/validation/validate')
        .send(validSchema)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toBe(true);
    });

    test('should reject invalid schema', async () => {
      const invalidSchema = {
        invalid: 'schema'
      };

      const response = await request(app)
        .post('/api/validation/validate')
        .send(invalidSchema)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
      expect(response.body).toHaveProperty('details');
    });
  });

  describe('Schema Templates', () => {
    test('should get document schema template', async () => {
      const response = await request(app)
        .get('/api/schemas/templates/document')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('schemaId');
      expect(response.body.data).toHaveProperty('schemaVersion');
    });

    test('should get table schema template', async () => {
      const response = await request(app)
        .get('/api/schemas/templates/table')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('schemaId');
      expect(response.body.data).toHaveProperty('columns');
    });

    test('should return 404 for non-existent template', async () => {
      const response = await request(app)
        .get('/api/schemas/templates/non-existent')
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'Schema template not found');
    });
  });

  describe('Error Handling', () => {
    test('should handle malformed JSON', async () => {
      const response = await request(app)
        .post('/api/documents')
        .send('invalid-json')
        .set('Content-Type', 'application/json')
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });

    test('should handle missing content-type', async () => {
      const response = await request(app)
        .post('/api/documents')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('CORS Headers', () => {
    test('should include CORS headers', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.headers).toHaveProperty('access-control-allow-origin');
    });
  });
});
