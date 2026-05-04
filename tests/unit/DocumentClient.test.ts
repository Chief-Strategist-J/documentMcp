import { DocumentClient } from '../../src/sdk/DocumentClient';
import { ApiResponse, CreateDocumentRequest, CreateSectionRequest } from '../../src/types';

/**
 * Unit tests for DocumentClient
 * Follows DRY principles - comprehensive API client testing
 */

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('DocumentClient', () => {
  let client: DocumentClient;
  const mockBaseUrl = 'http://localhost:3000';
  const mockApiKey = 'test-api-key';

  beforeEach(() => {
    client = new DocumentClient(mockBaseUrl, mockApiKey);
    mockFetch.mockClear();
  });

  describe('Initialization', () => {
    test('should initialize with base URL and API key', () => {
      expect(client).toBeDefined();
    });

    test('should initialize with base URL only', () => {
      const clientWithoutKey = new DocumentClient(mockBaseUrl);
      expect(clientWithoutKey).toBeDefined();
    });
  });

  describe('Document Operations', () => {
    const mockDocumentResponse: ApiResponse<any> = {
      success: true,
      data: {
        id: 'doc-123',
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
        },
        createdAt: new Date().toISOString()
      }
    };

    test('should create document successfully', async () => {
      const createRequest: CreateDocumentRequest = {
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

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockDocumentResponse
      });

      const result = await client.createDocument(createRequest);

      expect(mockFetch).toHaveBeenCalledWith(
        `${mockBaseUrl}/api/documents`,
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${mockApiKey}`
          }),
          body: JSON.stringify(createRequest)
        })
      );

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockDocumentResponse.data);
    });

    test('should handle document creation error', async () => {
      const errorResponse = {
        success: false,
        error: 'Invalid document data'
      };

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => errorResponse
      });

      const createRequest: CreateDocumentRequest = {
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

      const result = await client.createDocument(createRequest);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid document data');
    });

    test('should get document by ID', async () => {
      const documentId = 'doc-123';

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockDocumentResponse
      });

      const result = await client.getDocument(documentId);

      expect(mockFetch).toHaveBeenCalledWith(
        `${mockBaseUrl}/api/documents/${documentId}`,
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Authorization': `Bearer ${mockApiKey}`
          })
        })
      );

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockDocumentResponse.data);
    });

    test('should list documents with pagination', async () => {
      const listResponse: ApiResponse<any[]> = {
        success: true,
        data: [
          {
            id: 'doc-1',
            name: 'Document 1',
            type: 'word'
          },
          {
            id: 'doc-2',
            name: 'Document 2',
            type: 'pdf'
          }
        ]
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => listResponse
      });

      const result = await client.listDocuments(10, 0);

      expect(mockFetch).toHaveBeenCalledWith(
        `${mockBaseUrl}/api/documents?limit=10&offset=0`,
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Authorization': `Bearer ${mockApiKey}`
          })
        })
      );

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
    });

    test('should update document', async () => {
      const documentId = 'doc-123';
      const updateRequest = {
        name: 'Updated Document',
        layoutSchema: {
          schemaId: 'updated-layout',
          schemaVersion: '1.0.0',
          tableName: 'Updated Table',
          dimensions: {
            minRows: 1,
            maxRows: 200,
            defaultRows: 20,
            columnCount: 8
          }
        }
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockDocumentResponse
      });

      const result = await client.updateDocument(documentId, updateRequest);

      expect(mockFetch).toHaveBeenCalledWith(
        `${mockBaseUrl}/api/documents/${documentId}`,
        expect.objectContaining({
          method: 'PUT',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${mockApiKey}`
          }),
          body: JSON.stringify(updateRequest)
        })
      );

      expect(result.success).toBe(true);
    });

    test('should delete document', async () => {
      const documentId = 'doc-123';
      const deleteResponse: ApiResponse<null> = {
        success: true,
        data: null
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => deleteResponse
      });

      const result = await client.deleteDocument(documentId);

      expect(mockFetch).toHaveBeenCalledWith(
        `${mockBaseUrl}/api/documents/${documentId}`,
        expect.objectContaining({
          method: 'DELETE',
          headers: expect.objectContaining({
            'Authorization': `Bearer ${mockApiKey}`
          })
        })
      );

      expect(result.success).toBe(true);
    });
  });

  describe('Section Operations', () => {
    const mockSectionResponse: ApiResponse<any> = {
      success: true,
      data: {
        id: 'section-123',
        documentId: 'doc-123',
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
        },
        createdAt: new Date().toISOString()
      }
    };

    test('should create section successfully', async () => {
      const createRequest: CreateSectionRequest = {
        documentId: 'doc-123',
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

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockSectionResponse
      });

      const result = await client.createSection(createRequest);

      expect(mockFetch).toHaveBeenCalledWith(
        `${mockBaseUrl}/api/sections`,
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${mockApiKey}`
          }),
          body: JSON.stringify(createRequest)
        })
      );

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockSectionResponse.data);
    });

    test('should get document sections', async () => {
      const documentId = 'doc-123';
      const sectionsResponse: ApiResponse<any[]> = {
        success: true,
        data: [
          {
            id: 'section-1',
            sectionType: 'header',
            sectionOrder: 1
          },
          {
            id: 'section-2',
            sectionType: 'table',
            sectionOrder: 2
          }
        ]
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => sectionsResponse
      });

      const result = await client.getDocumentSections(documentId);

      expect(mockFetch).toHaveBeenCalledWith(
        `${mockBaseUrl}/api/documents/${documentId}/sections`,
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Authorization': `Bearer ${mockApiKey}`
          })
        })
      );

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
    });
  });

  describe('Document Generation', () => {
    test('should generate Word document', async () => {
      const documentId = 'doc-123';
      const mockBuffer = Buffer.from('mock-document-content');
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        arrayBuffer: async () => mockBuffer,
        headers: new Map([['content-type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']])
      });

      const result = await client.generateDocument(documentId, 'word');

      expect(mockFetch).toHaveBeenCalledWith(
        `${mockBaseUrl}/api/documents/${documentId}/generate`,
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${mockApiKey}`
          }),
          body: JSON.stringify({
            format: 'word',
            options: {}
          })
        })
      );

      expect(result.success).toBe(true);
    });

    test('should generate PDF document', async () => {
      const documentId = 'doc-123';
      const mockBuffer = Buffer.from('mock-pdf-content');
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        arrayBuffer: async () => mockBuffer,
        headers: new Map([['content-type', 'application/pdf']])
      });

      const result = await client.generateDocument(documentId, 'pdf');

      expect(mockFetch).toHaveBeenCalledWith(
        `${mockBaseUrl}/api/documents/${documentId}/generate`,
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${mockApiKey}`
          }),
          body: JSON.stringify({
            format: 'pdf',
            options: {}
          })
        })
      );

      expect(result.success).toBe(true);
    });

    test('should handle generation with custom options', async () => {
      const documentId = 'doc-123';
      const options = {
        pageSize: 'A4',
        orientation: 'landscape',
        margins: { top: 72, right: 72, bottom: 72, left: 72 }
      };
      const mockBuffer = Buffer.from('mock-document-content');
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        arrayBuffer: async () => mockBuffer
      });

      await client.generateDocument(documentId, 'word', options);

      expect(mockFetch).toHaveBeenCalledWith(
        `${mockBaseUrl}/api/documents/${documentId}/generate`,
        expect.objectContaining({
          body: JSON.stringify({
            format: 'word',
            options
          })
        })
      );
    });
  });

  describe('Schema Validation', () => {
    test('should validate schema successfully', async () => {
      const schema = {
        schemaId: 'test-schema',
        schemaVersion: '1.0.0'
      };
      const validationResponse: ApiResponse<boolean> = {
        success: true,
        data: true
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => validationResponse
      });

      const result = await client.validateSchema(schema);

      expect(mockFetch).toHaveBeenCalledWith(
        `${mockBaseUrl}/api/validation/validate`,
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${mockApiKey}`
          }),
          body: JSON.stringify(schema)
        })
      );

      expect(result.success).toBe(true);
      expect(result.data).toBe(true);
    });
  });

  describe('Error Handling', () => {
    test('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await client.getDocument('doc-123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Network error');
    });

    test('should handle JSON parsing errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => {
          throw new Error('Invalid JSON');
        }
      });

      const result = await client.getDocument('doc-123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid JSON');
    });

    test('should handle missing error response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({})
      });

      const result = await client.getDocument('doc-123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('HTTP 500: Internal Server Error');
    });
  });

  describe('Header Management', () => {
    test('should include custom headers', async () => {
      const customClient = new DocumentClient(mockBaseUrl, mockApiKey, {
        'X-Custom-Header': 'custom-value'
      });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: {} })
      });

      await customClient.getDocument('doc-123');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-Custom-Header': 'custom-value'
          })
        })
      );
    });

    test('should handle undefined custom headers', async () => {
      const customClient = new DocumentClient(mockBaseUrl, mockApiKey, {
        'X-Custom-Header': undefined as any
      });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: {} })
      });

      await customClient.getDocument('doc-123');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.not.objectContaining({
            'X-Custom-Header': undefined
          })
        })
      );
    });
  });
});
