/**
 * DocumentClient Tests
 * Tests for all DocumentClient methods without MCP server dependency
 */

import { DocumentClient } from '../../src/sdk/DocumentClient';
import { 
  DocumentType, 
  SectionType, 
  DocumentLayoutSchema, 
  SectionContentSchema, 
  StylingSchema,
  UpdateSectionRequest,
  AddSectionDataRequest,
  UpdateSectionDataRequest,
  DuplicateDocumentRequest,
  DuplicateSectionRequest,
  ReorderSectionsRequest,
  BulkCreateSectionsRequest,
  SearchDocumentsRequest
} from '../../src/types';

// Mock fetch for DocumentClient
global.fetch = jest.fn();

describe('DocumentClient Tests', () => {
  let documentClient: DocumentClient;
  let mockFetch: jest.MockedFunction<typeof fetch>;

  beforeEach(() => {
    mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;
    documentClient = new DocumentClient('https://test-api.example.com', 'test-key');
    jest.clearAllMocks();
  });

  describe('Document Operations', () => {
    it('should create a document', async () => {
      const mockLayout: DocumentLayoutSchema = {
        schemaId: 'test-schema',
        schemaVersion: '1.0',
        tableName: 'test_table',
        dimensions: {
          minRows: 1,
          maxRows: 100,
          defaultRows: 10,
          columnCount: 5
        }
      };

      const request = {
        name: 'Test Document',
        type: 'word' as DocumentType,
        layoutSchema: mockLayout
      };

      const expectedResponse = {
        success: true,
        data: {
          id: 'doc-123',
          name: 'Test Document',
          type: 'word' as DocumentType,
          layoutSchema: mockLayout,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => expectedResponse
      } as Response);

      const result = await documentClient.createDocument(request);
      expect(result).toEqual(expectedResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://test-api.example.com/api/documents',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Authorization': 'Bearer test-key'
          }),
          body: JSON.stringify(request)
        })
      );
    });

    it('should get a document', async () => {
      const documentId = 'doc-123';
      const expectedResponse = {
        success: true,
        data: {
          id: documentId,
          name: 'Test Document',
          type: 'word' as DocumentType,
          layoutSchema: {} as DocumentLayoutSchema,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => expectedResponse
      } as Response);

      const result = await documentClient.getDocument(documentId);
      expect(result).toEqual(expectedResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        `https://test-api.example.com/api/documents/${documentId}`,
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-key'
          })
        })
      );
    });

    it('should update a document', async () => {
      const documentId = 'doc-123';
      const updateRequest = {
        name: 'Updated Document',
        layoutSchema: {} as DocumentLayoutSchema
      };

      const expectedResponse = {
        success: true,
        data: {
          id: documentId,
          name: 'Updated Document',
          type: 'word' as DocumentType,
          layoutSchema: {} as DocumentLayoutSchema,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => expectedResponse
      } as Response);

      const result = await documentClient.updateDocument(documentId, updateRequest);
      expect(result).toEqual(expectedResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        `https://test-api.example.com/api/documents/${documentId}`,
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify(updateRequest)
        })
      );
    });

    it('should delete a document', async () => {
      const documentId = 'doc-123';
      const expectedResponse = { success: true };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => expectedResponse
      } as Response);

      const result = await documentClient.deleteDocument(documentId);
      expect(result).toEqual(expectedResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        `https://test-api.example.com/api/documents/${documentId}`,
        expect.objectContaining({
          method: 'DELETE'
        })
      );
    });

    it('should list documents', async () => {
      const expectedResponse = {
        success: true,
        data: [
          {
            id: 'doc-1',
            name: 'Document 1',
            type: 'word' as DocumentType,
            layoutSchema: {} as DocumentLayoutSchema,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ]
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => expectedResponse
      } as Response);

      const result = await documentClient.listDocuments(10, 0);
      expect(result).toEqual(expectedResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://test-api.example.com/api/documents?limit=10&offset=0',
        expect.objectContaining({
          method: 'GET'
        })
      );
    });
  });

  describe('Section Operations', () => {
    it('should create a section', async () => {
      const mockContent: SectionContentSchema = {
        schemaId: 'section-schema',
        columns: [
          {
            id: 'col1',
            name: 'Column 1',
            type: 'string',
            required: true,
            editable: true,
            sortable: true,
            filterable: true,
            width: 100,
            options: [],
            format: { kind: 'text', precision: 0 }
          }
        ],
        rows: {
          rowIdStrategy: 'auto',
          allowAdd: true,
          allowDelete: true,
          allowReorder: true,
          showRowNumbers: true
        },
        validationSchema: {},
        behaviorSchema: {
          sorting: { enabled: true, multiColumn: false },
          filtering: { enabled: true },
          pagination: { enabled: true, pageSize: 10 },
          editing: { enabled: true, mode: 'cell' }
        }
      };

      const mockStyling: StylingSchema = {
        table: {
          backgroundColor: '#ffffff',
          borderColor: '#000000',
          borderWidth: 1,
          borderRadius: 0,
          fontFamily: 'Arial',
          fontSize: 12,
          textColor: '#000000'
        },
        header: {
          backgroundColor: '#f0f0f0',
          textColor: '#000000',
          fontWeight: 700,
          fontSize: 14,
          height: 40
        },
        row: {
          height: 30,
          backgroundColor: '#ffffff',
          alternateBackgroundColor: '#f9f9f9',
          hoverBackgroundColor: '#e8e8e8',
          selectedBackgroundColor: '#d0d0d0'
        },
        cell: {
          paddingX: 8,
          paddingY: 4,
          borderColor: '#cccccc',
          borderWidth: 1,
          textAlign: 'left'
        },
        columnOverrides: {}
      };

      const request = {
        documentId: 'doc-123',
        sectionType: 'table' as SectionType,
        sectionOrder: 1,
        contentSchema: mockContent,
        stylingSchema: mockStyling
      };

      const expectedResponse = {
        success: true,
        data: {
          id: 'section-123',
          documentId: 'doc-123',
          sectionType: 'table' as SectionType,
          sectionOrder: 1,
          contentSchema: mockContent,
          stylingSchema: mockStyling,
          createdAt: new Date()
        }
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => expectedResponse
      } as Response);

      const result = await documentClient.createSection(request);
      expect(result).toEqual(expectedResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://test-api.example.com/api/sections',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(request)
        })
      );
    });

    it('should get document sections', async () => {
      const documentId = 'doc-123';
      const expectedResponse = {
        success: true,
        data: [
          {
            id: 'section-1',
            documentId: documentId,
            sectionType: 'table' as SectionType,
            sectionOrder: 1,
            contentSchema: {} as SectionContentSchema,
            stylingSchema: {} as StylingSchema,
            createdAt: new Date()
          }
        ]
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => expectedResponse
      } as Response);

      const result = await documentClient.getDocumentSections(documentId);
      expect(result).toEqual(expectedResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        `https://test-api.example.com/api/documents/${documentId}/sections`,
        expect.objectContaining({
          method: 'GET'
        })
      );
    });

    it('should get a section', async () => {
      const sectionId = 'section-123';
      const expectedResponse = {
        success: true,
        data: {
          id: sectionId,
          documentId: 'doc-123',
          sectionType: 'table' as SectionType,
          sectionOrder: 1,
          contentSchema: {} as SectionContentSchema,
          stylingSchema: {} as StylingSchema,
          createdAt: new Date()
        }
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => expectedResponse
      } as Response);

      const result = await documentClient.getSection(sectionId);
      expect(result).toEqual(expectedResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        `https://test-api.example.com/api/sections/${sectionId}`,
        expect.objectContaining({
          method: 'GET'
        })
      );
    });

    it('should update a section', async () => {
      const sectionId = 'section-123';
      const updateRequest: UpdateSectionRequest = {
        sectionOrder: 2,
        contentSchema: {} as SectionContentSchema,
        stylingSchema: {} as StylingSchema
      };

      const expectedResponse = {
        success: true,
        data: {
          id: sectionId,
          documentId: 'doc-123',
          sectionType: 'table' as SectionType,
          sectionOrder: 2,
          contentSchema: {} as SectionContentSchema,
          stylingSchema: {} as StylingSchema,
          createdAt: new Date()
        }
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => expectedResponse
      } as Response);

      const result = await documentClient.updateSection(sectionId, updateRequest);
      expect(result).toEqual(expectedResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        `https://test-api.example.com/api/sections/${sectionId}`,
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify(updateRequest)
        })
      );
    });

    it('should delete a section', async () => {
      const sectionId = 'section-123';
      const expectedResponse = { success: true };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => expectedResponse
      } as Response);

      const result = await documentClient.deleteSection(sectionId);
      expect(result).toEqual(expectedResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        `https://test-api.example.com/api/sections/${sectionId}`,
        expect.objectContaining({
          method: 'DELETE'
        })
      );
    });
  });

  describe('Additional Operations', () => {
    it('should list generated documents', async () => {
      const expectedResponse = {
        success: true,
        data: [
          { id: 'doc1', name: 'Document 1', format: 'word' },
          { id: 'doc2', name: 'Document 2', format: 'pdf' }
        ]
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => expectedResponse
      } as Response);

      const result = await documentClient.listGeneratedDocuments();
      expect(result).toEqual(expectedResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://test-api.example.com/api/documents/generated',
        expect.objectContaining({
          method: 'GET'
        })
      );
    });

    it('should get storage stats', async () => {
      const expectedResponse = {
        success: true,
        data: {
          totalDocuments: 10,
          totalSize: 1024000,
          storageUsed: 512000
        }
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => expectedResponse
      } as Response);

      const result = await documentClient.getStorageStats();
      expect(result).toEqual(expectedResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://test-api.example.com/api/storage/stats',
        expect.objectContaining({
          method: 'GET'
        })
      );
    });

    it('should delete generated document', async () => {
      const documentId = 'doc-123';
      const format = 'word' as DocumentType;
      const expectedResponse = { success: true };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => expectedResponse
      } as Response);

      const result = await documentClient.deleteGeneratedDocument(documentId, format);
      expect(result).toEqual(expectedResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        `https://test-api.example.com/api/documents/${documentId}/generated?format=${format}`,
        expect.objectContaining({
          method: 'DELETE'
        })
      );
    });

    it('should add section data', async () => {
      const request: AddSectionDataRequest = {
        sectionId: 'section-123',
        data: [{ row1: 'data1' }, { row2: 'data2' }]
      };

      const expectedResponse = { success: true };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => expectedResponse
      } as Response);

      const result = await documentClient.addSectionData(request);
      expect(result).toEqual(expectedResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://test-api.example.com/api/sections/data',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(request)
        })
      );
    });

    it('should get section data', async () => {
      const sectionId = 'section-123';
      const expectedResponse = {
        success: true,
        data: [{ row1: 'data1' }, { row2: 'data2' }]
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => expectedResponse
      } as Response);

      const result = await documentClient.getSectionData(sectionId);
      expect(result).toEqual(expectedResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        `https://test-api.example.com/api/sections/${sectionId}/data`,
        expect.objectContaining({
          method: 'GET'
        })
      );
    });

    it('should update section data', async () => {
      const request: UpdateSectionDataRequest = {
        sectionId: 'section-123',
        rowIndex: 0,
        data: { column1: 'updated data' }
      };

      const expectedResponse = { success: true };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => expectedResponse
      } as Response);

      const result = await documentClient.updateSectionData(request);
      expect(result).toEqual(expectedResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://test-api.example.com/api/sections/section-123/data',
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify(request)
        })
      );
    });

    it('should duplicate document', async () => {
      const documentId = 'doc-123';
      const request: DuplicateDocumentRequest = {
        newName: 'Duplicated Document'
      };

      const expectedResponse = {
        success: true,
        data: {
          id: 'doc-456',
          name: 'Duplicated Document',
          type: 'word' as DocumentType,
          layoutSchema: {} as DocumentLayoutSchema,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => expectedResponse
      } as Response);

      const result = await documentClient.duplicateDocument(documentId, request);
      expect(result).toEqual(expectedResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        `https://test-api.example.com/api/documents/${documentId}/duplicate`,
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(request)
        })
      );
    });

    it('should duplicate section', async () => {
      const sectionId = 'section-123';
      const request: DuplicateSectionRequest = {
        newDocumentId: 'doc-456'
      };

      const expectedResponse = {
        success: true,
        data: {
          id: 'section-456',
          documentId: 'doc-456',
          sectionType: 'table' as SectionType,
          sectionOrder: 1,
          contentSchema: {} as SectionContentSchema,
          stylingSchema: {} as StylingSchema,
          createdAt: new Date()
        }
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => expectedResponse
      } as Response);

      const result = await documentClient.duplicateSection(sectionId, request);
      expect(result).toEqual(expectedResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        `https://test-api.example.com/api/sections/${sectionId}/duplicate`,
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(request)
        })
      );
    });

    it('should reorder sections', async () => {
      const documentId = 'doc-123';
      const request: ReorderSectionsRequest = {
        sectionOrders: [
          { id: 'section-1', order: 0 },
          { id: 'section-2', order: 1 }
        ]
      };

      const expectedResponse = { success: true };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => expectedResponse
      } as Response);

      const result = await documentClient.reorderSections(documentId, request);
      expect(result).toEqual(expectedResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        `https://test-api.example.com/api/documents/${documentId}/sections/reorder`,
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(request)
        })
      );
    });

    it('should bulk create sections', async () => {
      const documentId = 'doc-123';
      const request: BulkCreateSectionsRequest = {
        sections: [
          {
            sectionType: 'table' as SectionType,
            sectionOrder: 0,
            contentSchema: {} as SectionContentSchema,
            stylingSchema: {} as StylingSchema
          }
        ]
      };

      const expectedResponse = {
        success: true,
        data: [
          {
            id: 'section-1',
            documentId: 'doc-123',
            sectionType: 'table' as SectionType,
            sectionOrder: 0,
            contentSchema: {} as SectionContentSchema,
            stylingSchema: {} as StylingSchema,
            createdAt: new Date()
          }
        ]
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => expectedResponse
      } as Response);

      const result = await documentClient.bulkCreateSections(documentId, request);
      expect(result).toEqual(expectedResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        `https://test-api.example.com/api/documents/${documentId}/sections/bulk`,
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(request)
        })
      );
    });

    it('should search documents', async () => {
      const request: SearchDocumentsRequest = {
        query: 'search term',
        limit: 10,
        offset: 0
      };

      const expectedResponse = {
        success: true,
        data: [
          {
            id: 'doc-1',
            name: 'Search Result 1',
            type: 'word' as DocumentType,
            layoutSchema: {} as DocumentLayoutSchema,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ]
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => expectedResponse
      } as Response);

      const result = await documentClient.searchDocuments(request);
      expect(result).toEqual(expectedResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://test-api.example.com/api/documents/search?query=search%20term&limit=10&offset=0',
        expect.objectContaining({
          method: 'GET'
        })
      );
    });
  });

  describe('Schema and Generation Operations', () => {
    it('should generate document', async () => {
      const documentId = 'doc-123';
      const format = 'word' as DocumentType;
      const options = { pageSize: 'A4' };

      const mockBlob = new Blob(['test content'], { 
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
      });

      const expectedResponse = {
        success: true,
        data: mockBlob
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => expectedResponse
      } as Response);

      const result = await documentClient.generateDocument(documentId, format, options);
      expect(result).toEqual(expectedResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        `https://test-api.example.com/api/documents/${documentId}/generate?format=${format}`,
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(options)
        })
      );
    });

    it('should download document', async () => {
      const documentId = 'doc-123';
      const format = 'word' as DocumentType;

      const mockBlob = new Blob(['test content'], { 
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
      });

      const expectedResponse = {
        success: true,
        data: mockBlob
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => expectedResponse
      } as Response);

      const result = await documentClient.downloadDocument(documentId, format);
      expect(result).toEqual(expectedResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        `https://test-api.example.com/api/documents/${documentId}/download?format=${format}`,
        expect.objectContaining({
          method: 'GET'
        })
      );
    });

    it('should validate schema', async () => {
      const schema = { type: 'object' };
      const schemaType = 'document' as const;

      const expectedResponse = {
        success: true,
        data: {
          valid: true,
          errors: []
        }
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => expectedResponse
      } as Response);

      const result = await documentClient.validateSchema(schema, schemaType);
      expect(result).toEqual(expectedResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://test-api.example.com/api/validation/validate',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ schema, schemaType })
        })
      );
    });

    it('should get schema templates', async () => {
      const schemaType = 'table';

      const expectedResponse = {
        success: true,
        data: [
          {
            name: 'Basic Table',
            schemaId: 'basic-table',
            description: 'Simple table template'
          }
        ]
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => expectedResponse
      } as Response);

      const result = await documentClient.getSchemaTemplates(schemaType);
      expect(result).toEqual(expectedResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        `https://test-api.example.com/api/schemas/templates/${schemaType}`,
        expect.objectContaining({
          method: 'GET'
        })
      );
    });

    it('should get health status', async () => {
      const expectedResponse = {
        success: true,
        data: {
          status: 'healthy',
          timestamp: new Date().toISOString()
        }
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => expectedResponse
      } as Response);

      const result = await documentClient.getHealthStatus();
      expect(result).toEqual(expectedResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://test-api.example.com/api/health',
        expect.objectContaining({
          method: 'GET'
        })
      );
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      // DocumentClient catches network errors and returns error response
      const result = await documentClient.getDocument('test');
      expect(result.success).toBe(false);
      expect(result.error).toContain('Network error');
    });

    it('should handle API errors', async () => {
      const errorResponse = {
        success: false,
        error: 'Document not found'
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => errorResponse
      } as Response);

      const result = await documentClient.getDocument('nonexistent');
      expect(result.success).toBe(false);
      expect(result.error).toBe('Document not found');
    });

    it('should handle HTTP errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: async () => ({ error: '404 Not Found' })
      } as Response);

      const result = await documentClient.getDocument('nonexistent');
      expect(result.success).toBe(false);
      expect(result.error).toContain('404');
    });
  });

  describe('Method Coverage Verification', () => {
    it('should have all required DocumentClient methods', () => {
      const requiredMethods = [
        'createDocument',
        'getDocument',
        'updateDocument',
        'deleteDocument',
        'listDocuments',
        'createSection',
        'getDocumentSections',
        'getSection',
        'updateSection',
        'deleteSection',
        'generateDocument',
        'downloadDocument',
        'validateSchema',
        'getSchemaTemplates',
        'getHealthStatus',
        'listGeneratedDocuments',
        'getStorageStats',
        'deleteGeneratedDocument',
        'addSectionData',
        'getSectionData',
        'duplicateDocument',
        'duplicateSection',
        'reorderSections',
        'updateSectionData',
        'bulkCreateSections',
        'searchDocuments'
      ];

      requiredMethods.forEach(method => {
        expect((documentClient as any)[method]).toBeDefined();
        expect(typeof (documentClient as any)[method]).toBe('function');
      });
    });

    it('should verify method count matches expected', () => {
      const methodCount = Object.getOwnPropertyNames(DocumentClient.prototype)
        .filter(name => name !== 'constructor' && typeof (documentClient as any)[name] === 'function')
        .length;

      expect(methodCount).toBe(28); // Total number of methods (including makeRequest and getHeaders)
    });
  });
});
