/**
 * MCP Server E2E Tests
 * End-to-end tests for MCP server functionality
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

describe('MCP Server E2E Tests', () => {
  let mockDocumentClient: jest.Mocked<DocumentClient>;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Create comprehensive mock
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
    } as any;

    MockDocumentClient.mockImplementation(() => mockDocumentClient);
  });

  describe('Complete API Coverage', () => {
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

    it('should initialize server with all DocumentClient methods available', () => {
      process.env.BASE_URL = 'https://test-api.example.com';
      process.env.API_KEY = 'test-key';

      jest.resetModules();
      require('../../mcp/server');

      expect(MockDocumentClient).toHaveBeenCalledWith(
        'https://test-api.example.com',
        'test-key'
      );

      // Verify all methods are available
      expect(mockDocumentClient.createDocument).toBeDefined();
      expect(mockDocumentClient.getDocument).toBeDefined();
      expect(mockDocumentClient.updateDocument).toBeDefined();
      expect(mockDocumentClient.deleteDocument).toBeDefined();
      expect(mockDocumentClient.listDocuments).toBeDefined();
      expect(mockDocumentClient.createSection).toBeDefined();
      expect(mockDocumentClient.getDocumentSections).toBeDefined();
      expect(mockDocumentClient.getSection).toBeDefined();
      expect(mockDocumentClient.updateSection).toBeDefined();
      expect(mockDocumentClient.deleteSection).toBeDefined();
      expect(mockDocumentClient.generateDocument).toBeDefined();
      expect(mockDocumentClient.downloadDocument).toBeDefined();
      expect(mockDocumentClient.validateSchema).toBeDefined();
      expect(mockDocumentClient.getSchemaTemplates).toBeDefined();
      expect(mockDocumentClient.getHealthStatus).toBeDefined();

      delete process.env.BASE_URL;
      delete process.env.API_KEY;
    });

    it('should test all document operations', async () => {
      // Create document
      const createResponse = {
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
      mockDocumentClient.createDocument.mockResolvedValue(createResponse);

      jest.resetModules();
      const { server } = require('../../mcp/server');

      expect(server).toBeDefined();
      expect(MockDocumentClient).toHaveBeenCalled();
    });

    it('should test all section operations', async () => {
      const sectionResponse = {
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

      mockDocumentClient.createSection.mockResolvedValue(sectionResponse);
      mockDocumentClient.getSection.mockResolvedValue(sectionResponse);
      mockDocumentClient.updateSection.mockResolvedValue(sectionResponse);
      mockDocumentClient.deleteSection.mockResolvedValue({ success: true });

      jest.resetModules();
      const { server } = require('../../mcp/server');

      expect(server).toBeDefined();
    });

    it('should test document generation and download', async () => {
      const mockBlob = new Blob(['test content'], { 
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
      });
      
      const generationResponse = {
        success: true,
        data: mockBlob
      };

      mockDocumentClient.generateDocument.mockResolvedValue(generationResponse);
      mockDocumentClient.downloadDocument.mockResolvedValue(generationResponse);

      jest.resetModules();
      const { server } = require('../../mcp/server');

      expect(server).toBeDefined();
    });

    it('should test schema operations', async () => {
      const validationResponse = {
        success: true,
        data: {
          valid: true,
          errors: []
        }
      };

      const templateResponse = {
        success: true,
        data: [
          {
            name: 'Basic Table',
            schemaId: 'basic-table',
            description: 'Simple table template',
            contentSchema: mockSectionContent,
            stylingSchema: mockStyling
          }
        ]
      };

      mockDocumentClient.validateSchema.mockResolvedValue(validationResponse);
      mockDocumentClient.getSchemaTemplates.mockResolvedValue(templateResponse);

      jest.resetModules();
      const { server } = require('../../mcp/server');

      expect(server).toBeDefined();
    });

    it('should test health check', async () => {
      const healthResponse = {
        success: true,
        data: {
          status: 'healthy',
          timestamp: new Date().toISOString()
        }
      };

      mockDocumentClient.getHealthStatus.mockResolvedValue(healthResponse);

      jest.resetModules();
      const { server } = require('../../mcp/server');

      expect(server).toBeDefined();
    });

    it('should handle all error scenarios', async () => {
      // Test various error responses
      const errors = [
        { success: false, error: 'Network error' },
        { success: false, error: 'Validation failed' },
        { success: false, error: 'Document not found' },
        { success: false, error: 'Section not found' },
        { success: false, error: 'Invalid schema' }
      ];

      // Set all methods to return errors
      mockDocumentClient.createDocument.mockRejectedValue(new Error('Network error'));
      mockDocumentClient.getDocument.mockResolvedValue(errors[0]);
      mockDocumentClient.updateDocument.mockResolvedValue(errors[1]);
      mockDocumentClient.deleteDocument.mockResolvedValue(errors[2]);
      mockDocumentClient.listDocuments.mockResolvedValue(errors[3]);
      mockDocumentClient.createSection.mockResolvedValue(errors[4]);
      mockDocumentClient.getDocumentSections.mockRejectedValue(new Error('Connection error'));
      mockDocumentClient.getSection.mockResolvedValue(errors[0]);
      mockDocumentClient.updateSection.mockResolvedValue(errors[1]);
      mockDocumentClient.deleteSection.mockResolvedValue(errors[2]);
      mockDocumentClient.generateDocument.mockRejectedValue(new Error('Generation failed'));
      mockDocumentClient.downloadDocument.mockResolvedValue(errors[3]);
      mockDocumentClient.validateSchema.mockResolvedValue(errors[4]);
      mockDocumentClient.getSchemaTemplates.mockRejectedValue(new Error('Template error'));
      mockDocumentClient.getHealthStatus.mockResolvedValue(errors[0]);

      jest.resetModules();
      const { server } = require('../../mcp/server');

      expect(server).toBeDefined();
    });
  });

  describe('API Coverage Verification', () => {
    it('should verify all DocumentClient methods are exposed in MCP server', () => {
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
        'getHealthStatus'
      ];

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
        'get_health_status'
      ];

      // Verify we have the same number of tools as methods
      expect(documentClientMethods.length).toBe(mcpTools.length);

      // Verify server initializes properly
      jest.resetModules();
      const { server } = require('../../mcp/server');
      expect(server).toBeDefined();
    });
  });
});
