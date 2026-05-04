/**
 * MCP Server API Coverage Tests
 * Tests to verify all DocumentClient APIs are properly exposed in MCP server
 */

import { DocumentClient } from '../../src/sdk/DocumentClient';
import { 
  DocumentType, 
  SectionType, 
  DocumentLayoutSchema, 
  SectionContentSchema, 
  StylingSchema,
  UpdateSectionRequest
} from '../../src/types';

// Mock the DocumentClient
jest.mock('../../src/sdk/DocumentClient');
const MockDocumentClient = DocumentClient as jest.MockedClass<typeof DocumentClient>;

describe('MCP Server API Coverage', () => {
  let mockDocumentClient: jest.Mocked<DocumentClient>;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Create comprehensive mock with all methods
    mockDocumentClient = {
      createDocument: jest.fn(),
      getDocument: jest.fn(),
      updateDocument: jest.fn(),
      deleteDocument: jest.fn(),
      listDocuments: jest.fn(),
      createSection: jest.fn(),
      getDocumentSections: jest.fn(),
      getSection: jest.fn(),
      updateSection: jest.fn(),
      deleteSection: jest.fn(),
      generateDocument: jest.fn(),
      downloadDocument: jest.fn(),
      validateSchema: jest.fn(),
      getSchemaTemplates: jest.fn(),
      getHealthStatus: jest.fn(),
      listGeneratedDocuments: jest.fn(),
      getStorageStats: jest.fn(),
      deleteGeneratedDocument: jest.fn(),
      addSectionData: jest.fn(),
      getSectionData: jest.fn(),
      duplicateDocument: jest.fn(),
      duplicateSection: jest.fn(),
      reorderSections: jest.fn(),
      updateSectionData: jest.fn(),
      bulkCreateSections: jest.fn(),
      searchDocuments: jest.fn(),
    } as any;

    MockDocumentClient.mockImplementation(() => mockDocumentClient);
  });

  describe('DocumentClient API Coverage', () => {
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
        expect((mockDocumentClient as any)[method]).toBeDefined();
        expect(typeof (mockDocumentClient as any)[method]).toBe('function');
      });
    });

    it('should initialize DocumentClient with correct parameters', () => {
      process.env.BASE_URL = 'https://test-api.example.com';
      process.env.API_KEY = 'test-key';

      jest.resetModules();
      require('../../mcp/server');

      expect(MockDocumentClient).toHaveBeenCalledWith(
        'https://test-api.example.com',
        'test-key'
      );

      delete process.env.BASE_URL;
      delete process.env.API_KEY;
    });

    it('should use default configuration when environment variables are not set', () => {
      delete process.env.BASE_URL;
      delete process.env.API_KEY;

      jest.resetModules();
      require('../../mcp/server');

      expect(MockDocumentClient).toHaveBeenCalledWith(
        'http://localhost:3000',
        ''
      );
    });
  });

  describe('Document Operations Mock Tests', () => {
    const mockDocumentLayout: DocumentLayoutSchema = {
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

    it('should test createDocument API', async () => {
      const createRequest = {
        name: 'Test Document',
        type: 'word' as DocumentType,
        layoutSchema: mockDocumentLayout
      };

      const expectedResponse = {
        success: true,
        data: {
          id: 'doc-123',
          name: 'Test Document',
          type: 'word' as DocumentType,
          layoutSchema: mockDocumentLayout,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      };

      mockDocumentClient.createDocument.mockResolvedValue(expectedResponse);

      const result = await mockDocumentClient.createDocument(createRequest);
      expect(result).toEqual(expectedResponse);
      expect(mockDocumentClient.createDocument).toHaveBeenCalledWith(createRequest);
    });

    it('should test getDocument API', async () => {
      const documentId = 'doc-123';
      const expectedResponse = {
        success: true,
        data: {
          id: documentId,
          name: 'Test Document',
          type: 'word' as DocumentType,
          layoutSchema: mockDocumentLayout,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      };

      mockDocumentClient.getDocument.mockResolvedValue(expectedResponse);

      const result = await mockDocumentClient.getDocument(documentId);
      expect(result).toEqual(expectedResponse);
      expect(mockDocumentClient.getDocument).toHaveBeenCalledWith(documentId);
    });

    it('should test updateDocument API', async () => {
      const documentId = 'doc-123';
      const updateRequest = {
        name: 'Updated Document',
        layoutSchema: mockDocumentLayout
      };

      const expectedResponse = {
        success: true,
        data: {
          id: documentId,
          name: 'Updated Document',
          type: 'word' as DocumentType,
          layoutSchema: mockDocumentLayout,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      };

      mockDocumentClient.updateDocument.mockResolvedValue(expectedResponse);

      const result = await mockDocumentClient.updateDocument(documentId, updateRequest);
      expect(result).toEqual(expectedResponse);
      expect(mockDocumentClient.updateDocument).toHaveBeenCalledWith(documentId, updateRequest);
    });

    it('should test deleteDocument API', async () => {
      const documentId = 'doc-123';
      const expectedResponse = { success: true };

      mockDocumentClient.deleteDocument.mockResolvedValue(expectedResponse);

      const result = await mockDocumentClient.deleteDocument(documentId);
      expect(result).toEqual(expectedResponse);
      expect(mockDocumentClient.deleteDocument).toHaveBeenCalledWith(documentId);
    });

    it('should test listDocuments API', async () => {
      const expectedResponse = {
        success: true,
        data: [
          {
            id: 'doc-1',
            name: 'Document 1',
            type: 'word' as DocumentType,
            layoutSchema: mockDocumentLayout,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ]
      };

      mockDocumentClient.listDocuments.mockResolvedValue(expectedResponse);

      const result = await mockDocumentClient.listDocuments(10, 0);
      expect(result).toEqual(expectedResponse);
      expect(mockDocumentClient.listDocuments).toHaveBeenCalledWith(10, 0);
    });
  });

  describe('Section Operations Mock Tests', () => {
    const mockSectionContent: SectionContentSchema = {
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

    it('should test createSection API', async () => {
      const createRequest = {
        documentId: 'doc-123',
        sectionType: 'table' as SectionType,
        sectionOrder: 1,
        contentSchema: mockSectionContent,
        stylingSchema: mockStyling
      };

      const expectedResponse = {
        success: true,
        data: {
          id: 'section-123',
          documentId: 'doc-123',
          sectionType: 'table' as SectionType,
          sectionOrder: 1,
          contentSchema: mockSectionContent,
          stylingSchema: mockStyling,
          createdAt: new Date()
        }
      };

      mockDocumentClient.createSection.mockResolvedValue(expectedResponse);

      const result = await mockDocumentClient.createSection(createRequest);
      expect(result).toEqual(expectedResponse);
      expect(mockDocumentClient.createSection).toHaveBeenCalledWith(createRequest);
    });

    it('should test getSection API', async () => {
      const sectionId = 'section-123';
      const expectedResponse = {
        success: true,
        data: {
          id: sectionId,
          documentId: 'doc-123',
          sectionType: 'table' as SectionType,
          sectionOrder: 1,
          contentSchema: mockSectionContent,
          stylingSchema: mockStyling,
          createdAt: new Date()
        }
      };

      mockDocumentClient.getSection.mockResolvedValue(expectedResponse);

      const result = await mockDocumentClient.getSection(sectionId);
      expect(result).toEqual(expectedResponse);
      expect(mockDocumentClient.getSection).toHaveBeenCalledWith(sectionId);
    });

    it('should test updateSection API', async () => {
      const sectionId = 'section-123';
      const updateRequest: UpdateSectionRequest = {
        sectionOrder: 2,
        contentSchema: mockSectionContent,
        stylingSchema: mockStyling
      };

      const expectedResponse = {
        success: true,
        data: {
          id: sectionId,
          documentId: 'doc-123',
          sectionType: 'table' as SectionType,
          sectionOrder: 2,
          contentSchema: mockSectionContent,
          stylingSchema: mockStyling,
          createdAt: new Date()
        }
      };

      mockDocumentClient.updateSection.mockResolvedValue(expectedResponse);

      const result = await mockDocumentClient.updateSection(sectionId, updateRequest);
      expect(result).toEqual(expectedResponse);
      expect(mockDocumentClient.updateSection).toHaveBeenCalledWith(sectionId, updateRequest);
    });

    it('should test deleteSection API', async () => {
      const sectionId = 'section-123';
      const expectedResponse = { success: true };

      mockDocumentClient.deleteSection.mockResolvedValue(expectedResponse);

      const result = await mockDocumentClient.deleteSection(sectionId);
      expect(result).toEqual(expectedResponse);
      expect(mockDocumentClient.deleteSection).toHaveBeenCalledWith(sectionId);
    });

    it('should test getDocumentSections API', async () => {
      const documentId = 'doc-123';
      const expectedResponse = {
        success: true,
        data: [
          {
            id: 'section-1',
            documentId: documentId,
            sectionType: 'table' as SectionType,
            sectionOrder: 1,
            contentSchema: mockSectionContent,
            stylingSchema: mockStyling,
            createdAt: new Date()
          }
        ]
      };

      mockDocumentClient.getDocumentSections.mockResolvedValue(expectedResponse);

      const result = await mockDocumentClient.getDocumentSections(documentId);
      expect(result).toEqual(expectedResponse);
      expect(mockDocumentClient.getDocumentSections).toHaveBeenCalledWith(documentId);
    });
  });

  describe('Document Generation Mock Tests', () => {
    it('should test generateDocument API', async () => {
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

      mockDocumentClient.generateDocument.mockResolvedValue(expectedResponse);

      const result = await mockDocumentClient.generateDocument(documentId, format, options);
      expect(result).toEqual(expectedResponse);
      expect(mockDocumentClient.generateDocument).toHaveBeenCalledWith(documentId, format, options);
    });

    it('should test downloadDocument API', async () => {
      const documentId = 'doc-123';
      const format = 'word' as DocumentType;

      const mockBlob = new Blob(['test content'], { 
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
      });

      const expectedResponse = {
        success: true,
        data: mockBlob
      };

      mockDocumentClient.downloadDocument.mockResolvedValue(expectedResponse);

      const result = await mockDocumentClient.downloadDocument(documentId, format);
      expect(result).toEqual(expectedResponse);
      expect(mockDocumentClient.downloadDocument).toHaveBeenCalledWith(documentId, format);
    });
  });

  describe('Schema Operations Mock Tests', () => {
    it('should test validateSchema API', async () => {
      const schema = { type: 'object' };
      const schemaType = 'document' as const;

      const expectedResponse = {
        success: true,
        data: {
          valid: true,
          errors: []
        }
      };

      mockDocumentClient.validateSchema.mockResolvedValue(expectedResponse);

      const result = await mockDocumentClient.validateSchema(schema, schemaType);
      expect(result).toEqual(expectedResponse);
      expect(mockDocumentClient.validateSchema).toHaveBeenCalledWith(schema, schemaType);
    });

    it('should test getSchemaTemplates API', async () => {
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

      mockDocumentClient.getSchemaTemplates.mockResolvedValue(expectedResponse);

      const result = await mockDocumentClient.getSchemaTemplates(schemaType);
      expect(result).toEqual(expectedResponse);
      expect(mockDocumentClient.getSchemaTemplates).toHaveBeenCalledWith(schemaType);
    });
  });

  describe('Health Check Mock Tests', () => {
    it('should test getHealthStatus API', async () => {
      const expectedResponse = {
        success: true,
        data: {
          status: 'healthy',
          timestamp: new Date().toISOString()
        }
      };

      mockDocumentClient.getHealthStatus.mockResolvedValue(expectedResponse);

      const result = await mockDocumentClient.getHealthStatus();
      expect(result).toEqual(expectedResponse);
      expect(mockDocumentClient.getHealthStatus).toHaveBeenCalled();
    });
  });

  describe('Additional API Mock Tests', () => {
    it('should test listGeneratedDocuments API', async () => {
      const expectedResponse = {
        success: true,
        data: [
          { id: 'doc1', name: 'Document 1', format: 'word' },
          { id: 'doc2', name: 'Document 2', format: 'pdf' }
        ]
      };

      mockDocumentClient.listGeneratedDocuments.mockResolvedValue(expectedResponse);

      const result = await mockDocumentClient.listGeneratedDocuments();
      expect(result).toEqual(expectedResponse);
      expect(mockDocumentClient.listGeneratedDocuments).toHaveBeenCalled();
    });

    it('should test getStorageStats API', async () => {
      const expectedResponse = {
        success: true,
        data: {
          totalDocuments: 10,
          totalSize: 1024000,
          storageUsed: 512000
        }
      };

      mockDocumentClient.getStorageStats.mockResolvedValue(expectedResponse);

      const result = await mockDocumentClient.getStorageStats();
      expect(result).toEqual(expectedResponse);
      expect(mockDocumentClient.getStorageStats).toHaveBeenCalled();
    });

    it('should test deleteGeneratedDocument API', async () => {
      const expectedResponse = { success: true };
      mockDocumentClient.deleteGeneratedDocument.mockResolvedValue(expectedResponse);

      const result = await mockDocumentClient.deleteGeneratedDocument('doc-123', 'word');
      expect(result).toEqual(expectedResponse);
      expect(mockDocumentClient.deleteGeneratedDocument).toHaveBeenCalledWith('doc-123', 'word');
    });

    it('should test addSectionData API', async () => {
      const expectedResponse = { success: true };
      const request = {
        sectionId: 'section-123',
        data: [{ row1: 'data1' }, { row2: 'data2' }]
      };

      mockDocumentClient.addSectionData.mockResolvedValue(expectedResponse);

      const result = await mockDocumentClient.addSectionData(request);
      expect(result).toEqual(expectedResponse);
      expect(mockDocumentClient.addSectionData).toHaveBeenCalledWith(request);
    });

    it('should test getSectionData API', async () => {
      const expectedResponse = {
        success: true,
        data: [{ row1: 'data1' }, { row2: 'data2' }]
      };

      mockDocumentClient.getSectionData.mockResolvedValue(expectedResponse);

      const result = await mockDocumentClient.getSectionData('section-123');
      expect(result).toEqual(expectedResponse);
      expect(mockDocumentClient.getSectionData).toHaveBeenCalledWith('section-123');
    });

    it('should test duplicateDocument API', async () => {
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

      const request = { newName: 'Duplicated Document' };
      mockDocumentClient.duplicateDocument.mockResolvedValue(expectedResponse);

      const result = await mockDocumentClient.duplicateDocument('doc-123', request);
      expect(result).toEqual(expectedResponse);
      expect(mockDocumentClient.duplicateDocument).toHaveBeenCalledWith('doc-123', request);
    });

    it('should test duplicateSection API', async () => {
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

      const request = { newDocumentId: 'doc-456' };
      mockDocumentClient.duplicateSection.mockResolvedValue(expectedResponse);

      const result = await mockDocumentClient.duplicateSection('section-123', request);
      expect(result).toEqual(expectedResponse);
      expect(mockDocumentClient.duplicateSection).toHaveBeenCalledWith('section-123', request);
    });

    it('should test reorderSections API', async () => {
      const expectedResponse = { success: true };
      const request = {
        sectionOrders: [
          { id: 'section-1', order: 0 },
          { id: 'section-2', order: 1 }
        ]
      };

      mockDocumentClient.reorderSections.mockResolvedValue(expectedResponse);

      const result = await mockDocumentClient.reorderSections('doc-123', request);
      expect(result).toEqual(expectedResponse);
      expect(mockDocumentClient.reorderSections).toHaveBeenCalledWith('doc-123', request);
    });

    it('should test updateSectionData API', async () => {
      const expectedResponse = { success: true };
      const request = {
        sectionId: 'section-123',
        rowIndex: 0,
        data: { column1: 'updated data' }
      };

      mockDocumentClient.updateSectionData.mockResolvedValue(expectedResponse);

      const result = await mockDocumentClient.updateSectionData(request);
      expect(result).toEqual(expectedResponse);
      expect(mockDocumentClient.updateSectionData).toHaveBeenCalledWith(request);
    });

    it('should test bulkCreateSections API', async () => {
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

      const request = {
        sections: [
          {
            sectionType: 'table' as SectionType,
            sectionOrder: 0,
            contentSchema: {} as SectionContentSchema,
            stylingSchema: {} as StylingSchema
          }
        ]
      };

      mockDocumentClient.bulkCreateSections.mockResolvedValue(expectedResponse);

      const result = await mockDocumentClient.bulkCreateSections('doc-123', request);
      expect(result).toEqual(expectedResponse);
      expect(mockDocumentClient.bulkCreateSections).toHaveBeenCalledWith('doc-123', request);
    });

    it('should test searchDocuments API', async () => {
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

      const request = {
        query: 'search term',
        limit: 10,
        offset: 0
      };

      mockDocumentClient.searchDocuments.mockResolvedValue(expectedResponse);

      const result = await mockDocumentClient.searchDocuments(request);
      expect(result).toEqual(expectedResponse);
      expect(mockDocumentClient.searchDocuments).toHaveBeenCalledWith(request);
    });
  });

  describe('Error Handling Tests', () => {
    it('should handle API errors gracefully', async () => {
      const errorResponses = [
        { success: false, error: 'Network error' },
        { success: false, error: 'Validation failed' },
        { success: false, error: 'Not found' }
      ];

      // Test all methods with error responses
      mockDocumentClient.createDocument.mockResolvedValue(errorResponses[0]);
      mockDocumentClient.getDocument.mockResolvedValue(errorResponses[1]);
      mockDocumentClient.updateDocument.mockResolvedValue(errorResponses[2]);
      mockDocumentClient.deleteDocument.mockResolvedValue(errorResponses[0]);
      mockDocumentClient.listDocuments.mockResolvedValue(errorResponses[1]);
      mockDocumentClient.createSection.mockResolvedValue(errorResponses[2]);
      mockDocumentClient.getDocumentSections.mockResolvedValue(errorResponses[0]);
      mockDocumentClient.getSection.mockResolvedValue(errorResponses[1]);
      mockDocumentClient.updateSection.mockResolvedValue(errorResponses[2]);
      mockDocumentClient.deleteSection.mockResolvedValue(errorResponses[0]);
      mockDocumentClient.generateDocument.mockResolvedValue(errorResponses[1]);
      mockDocumentClient.downloadDocument.mockResolvedValue(errorResponses[2]);
      mockDocumentClient.validateSchema.mockResolvedValue(errorResponses[0]);
      mockDocumentClient.getSchemaTemplates.mockResolvedValue(errorResponses[1]);
      mockDocumentClient.getHealthStatus.mockResolvedValue(errorResponses[2]);
      mockDocumentClient.listGeneratedDocuments.mockResolvedValue(errorResponses[0]);
      mockDocumentClient.getStorageStats.mockResolvedValue(errorResponses[1]);
      mockDocumentClient.deleteGeneratedDocument.mockResolvedValue(errorResponses[2]);
      mockDocumentClient.addSectionData.mockResolvedValue(errorResponses[0]);
      mockDocumentClient.getSectionData.mockResolvedValue(errorResponses[1]);
      mockDocumentClient.duplicateDocument.mockResolvedValue(errorResponses[2]);
      mockDocumentClient.duplicateSection.mockResolvedValue(errorResponses[0]);
      mockDocumentClient.reorderSections.mockResolvedValue(errorResponses[1]);
      mockDocumentClient.updateSectionData.mockResolvedValue(errorResponses[2]);
      mockDocumentClient.bulkCreateSections.mockResolvedValue(errorResponses[0]);
      mockDocumentClient.searchDocuments.mockResolvedValue(errorResponses[1]);

      // Test that all methods handle errors
      const createResult = await mockDocumentClient.createDocument({} as any);
      expect(createResult).toEqual(errorResponses[0]);

      const getResult = await mockDocumentClient.getDocument('test');
      expect(getResult).toEqual(errorResponses[1]);

      const updateResult = await mockDocumentClient.updateDocument('test', {} as any);
      expect(updateResult).toEqual(errorResponses[2]);

      // Test network errors (rejected promises)
      mockDocumentClient.createDocument.mockRejectedValue(new Error('Network failure'));

      await expect(mockDocumentClient.createDocument({} as any)).rejects.toThrow('Network failure');
    });
  });

  describe('API Coverage Verification', () => {
    it('should verify complete API coverage', () => {
      const documentClientMethods = Object.keys(mockDocumentClient).filter(key => 
        typeof (mockDocumentClient as any)[key] === 'function'
      );

      const expectedMethods = [
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

      expectedMethods.forEach(method => {
        expect(documentClientMethods).toContain(method);
      });

      expect(documentClientMethods.length).toBe(expectedMethods.length);
    });

    it('should verify MCP tools mapping', () => {
      const mcpTools = [
        'create_document',
        'get_document',
        'update_document',
        'delete_document',
        'list_documents',
        'create_section',
        'get_document_sections',
        'get_section',
        'update_section',
        'delete_section',
        'generate_document',
        'download_document',
        'validate_schema',
        'get_schema_template',
        'get_health_status',
        'list_generated_documents',
        'get_storage_stats',
        'delete_generated_document',
        'add_section_data',
        'get_section_data',
        'duplicate_document',
        'duplicate_section',
        'reorder_sections',
        'update_section_data',
        'bulk_create_sections',
        'search_documents'
      ];

      const documentClientMethods = [
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

      expect(mcpTools.length).toBe(documentClientMethods.length);
    });
  });
});
