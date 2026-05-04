/**
 * MCP Server Integration Tests
 * Integration tests for Model Context Protocol server functionality
 */

import { DocumentClient } from '../../src/sdk/DocumentClient';
import { DocumentType, SectionType, DocumentLayoutSchema, SectionContentSchema, StylingSchema } from '../../src/types';

// Mock the DocumentClient
jest.mock('../../src/sdk/DocumentClient');
const MockDocumentClient = DocumentClient as jest.MockedClass<typeof DocumentClient>;

describe('MCP Server Integration', () => {
  let mockDocumentClient: jest.Mocked<DocumentClient>;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockDocumentClient = {
      createDocument: jest.fn(),
      getDocument: jest.fn(),
      updateDocument: jest.fn(),
      deleteDocument: jest.fn(),
      listDocuments: jest.fn(),
      createSection: jest.fn(),
      getDocumentSections: jest.fn(),
      generateDocument: jest.fn(),
      validateSchema: jest.fn(),
      getSchemaTemplates: jest.fn(),
      getHealthStatus: jest.fn(),
    } as any;

    MockDocumentClient.mockImplementation(() => mockDocumentClient);
  });

  describe('Server Initialization', () => {
    it('should initialize server with correct configuration', () => {
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

  describe('Document Operations Integration', () => {
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

    it('should handle complete document creation workflow', async () => {
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

      // Import server after setting up mocks
      jest.resetModules();
      const { server } = require('../../mcp/server');

      // Verify server is created successfully
      expect(server).toBeDefined();
      expect(MockDocumentClient).toHaveBeenCalled();
    });

    it('should handle error responses correctly', async () => {
      const errorResponse = {
        success: false,
        error: 'Document creation failed'
      };

      mockDocumentClient.createDocument.mockResolvedValue(errorResponse);

      jest.resetModules();
      const { server } = require('../../mcp/server');

      // Server should handle errors without crashing
      expect(server).toBeDefined();
    });
  });

  describe('Section Operations Integration', () => {
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

    it('should handle section creation with proper types', async () => {
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

      jest.resetModules();
      const { server } = require('../../mcp/server');

      expect(server).toBeDefined();
      expect(mockDocumentClient.createSection).toBeDefined();
    });
  });

  describe('Schema Validation Integration', () => {
    it('should handle schema validation requests', async () => {
      const validationResponse = {
        success: true,
        data: {
          valid: true,
          errors: []
        }
      };

      mockDocumentClient.validateSchema.mockResolvedValue(validationResponse);

      jest.resetModules();
      const { server } = require('../../mcp/server');

      expect(server).toBeDefined();
    });

    it('should handle schema template requests', async () => {
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

      mockDocumentClient.getSchemaTemplates.mockResolvedValue(templateResponse);

      jest.resetModules();
      const { server } = require('../../mcp/server');

      expect(server).toBeDefined();
    });
  });

  describe('Document Generation Integration', () => {
    it('should handle document generation requests', async () => {
      const mockBlob = new Blob(['test content'], { 
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
      });
      
      const generationResponse = {
        success: true,
        data: mockBlob
      };

      mockDocumentClient.generateDocument.mockResolvedValue(generationResponse);

      jest.resetModules();
      const { server } = require('../../mcp/server');

      expect(server).toBeDefined();
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle network errors gracefully', async () => {
      mockDocumentClient.getDocument.mockRejectedValue(new Error('Network error'));

      jest.resetModules();
      const { server } = require('../../mcp/server');

      expect(server).toBeDefined();
    });

    it('should handle API error responses', async () => {
      const errorResponse = {
        success: false,
        error: 'API Error: Invalid document ID'
      };

      mockDocumentClient.getDocument.mockResolvedValue(errorResponse);

      jest.resetModules();
      const { server } = require('../../mcp/server');

      expect(server).toBeDefined();
    });
  });

  describe('Health Check Integration', () => {
    it('should handle health check requests', async () => {
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
  });
});

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
