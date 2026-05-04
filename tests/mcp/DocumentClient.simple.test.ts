/**
 * Simple DocumentClient Tests
 * Basic tests to verify all methods exist and can be called
 */

import { DocumentClient } from '../../src/sdk/DocumentClient';

// Mock fetch for DocumentClient
global.fetch = jest.fn();

describe('DocumentClient Simple Tests', () => {
  let documentClient: DocumentClient;
  let mockFetch: jest.MockedFunction<typeof fetch>;

  beforeEach(() => {
    mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;
    documentClient = new DocumentClient('https://test-api.example.com', 'test-key');
    jest.clearAllMocks();
    
    // Mock successful responses for all fetch calls
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, data: {} })
    } as Response);
  });

  describe('Method Existence Tests', () => {
    it('should have all document operations methods', () => {
      expect(typeof documentClient.createDocument).toBe('function');
      expect(typeof documentClient.getDocument).toBe('function');
      expect(typeof documentClient.updateDocument).toBe('function');
      expect(typeof documentClient.deleteDocument).toBe('function');
      expect(typeof documentClient.listDocuments).toBe('function');
    });

    it('should have all section operations methods', () => {
      expect(typeof documentClient.createSection).toBe('function');
      expect(typeof documentClient.getDocumentSections).toBe('function');
      expect(typeof documentClient.getSection).toBe('function');
      expect(typeof documentClient.updateSection).toBe('function');
      expect(typeof documentClient.deleteSection).toBe('function');
    });

    it('should have all additional operations methods', () => {
      expect(typeof documentClient.listGeneratedDocuments).toBe('function');
      expect(typeof documentClient.getStorageStats).toBe('function');
      expect(typeof documentClient.deleteGeneratedDocument).toBe('function');
      expect(typeof documentClient.addSectionData).toBe('function');
      expect(typeof documentClient.getSectionData).toBe('function');
      expect(typeof documentClient.duplicateDocument).toBe('function');
      expect(typeof documentClient.duplicateSection).toBe('function');
      expect(typeof documentClient.reorderSections).toBe('function');
      expect(typeof documentClient.updateSectionData).toBe('function');
      expect(typeof documentClient.bulkCreateSections).toBe('function');
      expect(typeof documentClient.searchDocuments).toBe('function');
    });

    it('should have all schema and generation methods', () => {
      expect(typeof documentClient.generateDocument).toBe('function');
      expect(typeof documentClient.downloadDocument).toBe('function');
      expect(typeof documentClient.validateSchema).toBe('function');
      expect(typeof documentClient.getSchemaTemplates).toBe('function');
      expect(typeof documentClient.getHealthStatus).toBe('function');
    });
  });

  describe('Basic Functionality Tests', () => {
    it('should create document without throwing', async () => {
      const request = {
        name: 'Test Document',
        type: 'word' as const,
        layoutSchema: {
          schemaId: 'test',
          schemaVersion: '1.0',
          tableName: 'test',
          dimensions: { minRows: 1, maxRows: 100, defaultRows: 10, columnCount: 5 }
        }
      };

      const result = await documentClient.createDocument(request);
      expect(result).toBeDefined();
      expect(mockFetch).toHaveBeenCalled();
    });

    it('should get document without throwing', async () => {
      const result = await documentClient.getDocument('doc-123');
      expect(result).toBeDefined();
      expect(mockFetch).toHaveBeenCalled();
    });

    it('should update document without throwing', async () => {
      const result = await documentClient.updateDocument('doc-123', {
        name: 'Updated',
        layoutSchema: {
          schemaId: 'test',
          schemaVersion: '1.0',
          tableName: 'test',
          dimensions: { minRows: 1, maxRows: 100, defaultRows: 10, columnCount: 5 }
        }
      });
      expect(result).toBeDefined();
      expect(mockFetch).toHaveBeenCalled();
    });

    it('should delete document without throwing', async () => {
      const result = await documentClient.deleteDocument('doc-123');
      expect(result).toBeDefined();
      expect(mockFetch).toHaveBeenCalled();
    });

    it('should list documents without throwing', async () => {
      const result = await documentClient.listDocuments();
      expect(result).toBeDefined();
      expect(mockFetch).toHaveBeenCalled();
    });

    it('should create section without throwing', async () => {
      const result = await documentClient.createSection({
        documentId: 'doc-123',
        sectionType: 'table' as const,
        sectionOrder: 1,
        contentSchema: {
          schemaId: 'test',
          columns: [],
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
        },
        stylingSchema: {
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
        }
      });
      expect(result).toBeDefined();
      expect(mockFetch).toHaveBeenCalled();
    });

    it('should get document sections without throwing', async () => {
      const result = await documentClient.getDocumentSections('doc-123');
      expect(result).toBeDefined();
      expect(mockFetch).toHaveBeenCalled();
    });

    it('should get section without throwing', async () => {
      const result = await documentClient.getSection('section-123');
      expect(result).toBeDefined();
      expect(mockFetch).toHaveBeenCalled();
    });

    it('should update section without throwing', async () => {
      const result = await documentClient.updateSection('section-123', {
        sectionOrder: 2,
        contentSchema: {
          schemaId: 'test',
          columns: [],
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
        },
        stylingSchema: {
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
        }
      });
      expect(result).toBeDefined();
      expect(mockFetch).toHaveBeenCalled();
    });

    it('should delete section without throwing', async () => {
      const result = await documentClient.deleteSection('section-123');
      expect(result).toBeDefined();
      expect(mockFetch).toHaveBeenCalled();
    });

    it('should list generated documents without throwing', async () => {
      const result = await documentClient.listGeneratedDocuments();
      expect(result).toBeDefined();
      expect(mockFetch).toHaveBeenCalled();
    });

    it('should get storage stats without throwing', async () => {
      const result = await documentClient.getStorageStats();
      expect(result).toBeDefined();
      expect(mockFetch).toHaveBeenCalled();
    });

    it('should delete generated document without throwing', async () => {
      const result = await documentClient.deleteGeneratedDocument('doc-123', 'word');
      expect(result).toBeDefined();
      expect(mockFetch).toHaveBeenCalled();
    });

    it('should add section data without throwing', async () => {
      const result = await documentClient.addSectionData({
        sectionId: 'section-123',
        data: [{ test: 'data' }]
      });
      expect(result).toBeDefined();
      expect(mockFetch).toHaveBeenCalled();
    });

    it('should get section data without throwing', async () => {
      const result = await documentClient.getSectionData('section-123');
      expect(result).toBeDefined();
      expect(mockFetch).toHaveBeenCalled();
    });

    it('should update section data without throwing', async () => {
      const result = await documentClient.updateSectionData({
        sectionId: 'section-123',
        rowIndex: 0,
        data: { test: 'updated' }
      });
      expect(result).toBeDefined();
      expect(mockFetch).toHaveBeenCalled();
    });

    it('should duplicate document without throwing', async () => {
      const result = await documentClient.duplicateDocument('doc-123', {
        newName: 'Duplicated'
      });
      expect(result).toBeDefined();
      expect(mockFetch).toHaveBeenCalled();
    });

    it('should duplicate section without throwing', async () => {
      const result = await documentClient.duplicateSection('section-123', {
        newDocumentId: 'doc-456'
      });
      expect(result).toBeDefined();
      expect(mockFetch).toHaveBeenCalled();
    });

    it('should reorder sections without throwing', async () => {
      const result = await documentClient.reorderSections('doc-123', {
        sectionOrders: [{ id: 'section-1', order: 0 }]
      });
      expect(result).toBeDefined();
      expect(mockFetch).toHaveBeenCalled();
    });

    it('should bulk create sections without throwing', async () => {
      const result = await documentClient.bulkCreateSections('doc-123', {
        sections: [{
          sectionType: 'table' as const,
          sectionOrder: 0,
          contentSchema: {
            schemaId: 'test',
            columns: [],
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
          },
          stylingSchema: {
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
          }
        }]
      });
      expect(result).toBeDefined();
      expect(mockFetch).toHaveBeenCalled();
    });

    it('should search documents without throwing', async () => {
      const result = await documentClient.searchDocuments({
        query: 'test',
        limit: 10,
        offset: 0
      });
      expect(result).toBeDefined();
      expect(mockFetch).toHaveBeenCalled();
    });

    it('should generate document without throwing', async () => {
      const result = await documentClient.generateDocument('doc-123', 'word', {
        pageSize: 'A4'
      });
      expect(result).toBeDefined();
      expect(mockFetch).toHaveBeenCalled();
    });

    it('should download document without throwing', async () => {
      const result = await documentClient.downloadDocument('doc-123', 'word');
      expect(result).toBeDefined();
      expect(mockFetch).toHaveBeenCalled();
    });

    it('should validate schema without throwing', async () => {
      const result = await documentClient.validateSchema({}, 'document');
      expect(result).toBeDefined();
      expect(mockFetch).toHaveBeenCalled();
    });

    it('should get schema templates without throwing', async () => {
      const result = await documentClient.getSchemaTemplates('table');
      expect(result).toBeDefined();
      expect(mockFetch).toHaveBeenCalled();
    });

    it('should get health status without throwing', async () => {
      const result = await documentClient.getHealthStatus();
      expect(result).toBeDefined();
      expect(mockFetch).toHaveBeenCalled();
    });
  });

  describe('Complete Coverage Test', () => {
    it('should verify all 26 methods exist and are callable', async () => {
      const methods = [
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
        'listGeneratedDocuments',
        'getStorageStats',
        'deleteGeneratedDocument',
        'addSectionData',
        'getSectionData',
        'updateSectionData',
        'duplicateDocument',
        'duplicateSection',
        'reorderSections',
        'bulkCreateSections',
        'searchDocuments',
        'generateDocument',
        'downloadDocument',
        'validateSchema',
        'getSchemaTemplates',
        'getHealthStatus'
      ];

      // Test that all methods exist
      methods.forEach(method => {
        expect(typeof (documentClient as any)[method]).toBe('function');
      });

      // Test that all methods can be called (basic smoke test)
      for (const method of methods) {
        mockFetch.mockClear();
        mockFetch.mockResolvedValue({
          ok: true,
          json: async () => ({ success: true, data: {} })
        } as Response);

        // Call each method with minimal valid arguments
        try {
          switch (method) {
            case 'createDocument':
              await (documentClient as any)[method]({ name: 'test', type: 'word', layoutSchema: {} });
              break;
            case 'getDocument':
            case 'deleteDocument':
            case 'getDocumentSections':
            case 'listGeneratedDocuments':
            case 'getStorageStats':
            case 'getHealthStatus':
              await (documentClient as any)[method]('test-id');
              break;
            case 'updateDocument':
              await (documentClient as any)[method]('test-id', { name: 'updated', layoutSchema: {} });
              break;
            case 'listDocuments':
              await (documentClient as any)[method]();
              break;
            case 'createSection':
              await (documentClient as any)[method]({ documentId: 'test', sectionType: 'table', sectionOrder: 1, contentSchema: {}, stylingSchema: {} });
              break;
            case 'getSection':
            case 'deleteSection':
            case 'getSectionData':
              await (documentClient as any)[method]('section-id');
              break;
            case 'updateSection':
              await (documentClient as any)[method]('section-id', { sectionOrder: 1, contentSchema: {}, stylingSchema: {} });
              break;
            case 'deleteGeneratedDocument':
              await (documentClient as any)[method]('doc-id', 'word');
              break;
            case 'addSectionData':
              await (documentClient as any)[method]({ sectionId: 'test', data: [] });
              break;
            case 'updateSectionData':
              await (documentClient as any)[method]({ sectionId: 'test', rowIndex: 0, data: {} });
              break;
            case 'duplicateDocument':
              await (documentClient as any)[method]('doc-id', { newName: 'copy' });
              break;
            case 'duplicateSection':
              await (documentClient as any)[method]('section-id', { newDocumentId: 'doc-id' });
              break;
            case 'reorderSections':
              await (documentClient as any)[method]('doc-id', { sectionOrders: [] });
              break;
            case 'bulkCreateSections':
              await (documentClient as any)[method]('doc-id', { sections: [] });
              break;
            case 'searchDocuments':
              await (documentClient as any)[method]({ query: 'test' });
              break;
            case 'generateDocument':
              await (documentClient as any)[method]('doc-id', 'word', {});
              break;
            case 'downloadDocument':
              await (documentClient as any)[method]('doc-id', 'word');
              break;
            case 'validateSchema':
              await (documentClient as any)[method]({}, 'document');
              break;
            case 'getSchemaTemplates':
              await (documentClient as any)[method]('table');
              break;
          }
          
          expect(mockFetch).toHaveBeenCalled();
        } catch (error) {
          fail(`Method ${method} threw an error: ${error}`);
        }
      }

      expect(methods.length).toBe(26);
    });
  });
});
