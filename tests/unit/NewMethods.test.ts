import { DatabaseManager } from '../../src/database/DatabaseManager';
import { MockDatabaseManager } from '../../src/database/MockDatabaseManager';
import { DocumentController } from '../../src/api/DocumentController';
import { SchemaValidator } from '../../src/validation/SchemaValidator';
import { Request, Response } from 'express';

describe('New Database Methods', () => {
  let mockDb: MockDatabaseManager;

  beforeEach(() => {
    mockDb = new MockDatabaseManager();
  });

  describe('duplicateDocument', () => {
    it('should duplicate a document with all sections', async () => {
      const originalDoc = await mockDb.createDocument({
        name: 'Original Document',
        type: 'word',
        layoutSchema: {
          schemaId: 'test',
          schemaVersion: '1.0.0',
          tableName: 'Test Table',
          dimensions: { minRows: 1, maxRows: 100, defaultRows: 10, columnCount: 3 }
        }
      } as any);

      await mockDb.createSection({
        documentId: originalDoc.id,
        sectionType: 'table',
        sectionOrder: 1,
        contentSchema: {
          schemaId: 'table-schema',
          columns: [{ id: 'col1', name: 'Column 1', type: 'text', width: 100 }],
          rows: { data: [] },
          validationSchema: {},
          behaviorSchema: {}
        },
        stylingSchema: {}
      });

      const duplicatedDoc = await mockDb.duplicateDocument(originalDoc.id, 'Duplicated Document');

      expect(duplicatedDoc).toBeTruthy();
      expect(duplicatedDoc.name).toBe('Duplicated Document');
      expect(duplicatedDoc.type).toBe(originalDoc.type);
      
      const originalSections = await mockDb.getDocumentSections(originalDoc.id);
      const duplicatedSections = await mockDb.getDocumentSections(duplicatedDoc.id);
      
      expect(duplicatedSections.length).toBe(originalSections.length);
    });

    it('should return null for non-existent document', async () => {
      const result = await mockDb.duplicateDocument('non-existent-id');
      expect(result).toBeNull();
    });

    it('should use default name if none provided', async () => {
      const originalDoc = await mockDb.createDocument({
        name: 'Original Document',
        type: 'word',
        layoutSchema: {
          schemaId: 'test',
          schemaVersion: '1.0.0',
          tableName: 'Test Table',
          dimensions: { minRows: 1, maxRows: 100, defaultRows: 10, columnCount: 3 }
        }
      } as any);

      const duplicatedDoc = await mockDb.duplicateDocument(originalDoc.id);
      expect(duplicatedDoc.name).toBe('Original Document (Copy)');
    });
  });

  describe('duplicateSection', () => {
    it('should duplicate a section within the same document', async () => {
      const doc = await mockDb.createDocument({
        name: 'Test Document',
        type: 'word',
        layoutSchema: {
          schemaId: 'test',
          schemaVersion: '1.0.0',
          tableName: 'Test Table',
          dimensions: { minRows: 1, maxRows: 100, defaultRows: 10, columnCount: 3 }
        }
      } as any);

      const originalSection = await mockDb.createSection({
        documentId: doc.id,
        sectionType: 'table',
        sectionOrder: 1,
        contentSchema: {
          schemaId: 'table-schema',
          columns: [{ id: 'col1', name: 'Column 1', type: 'text', width: 100 }],
          rows: { data: [] },
          validationSchema: {},
          behaviorSchema: {}
        },
        stylingSchema: {}
      });

      await mockDb.updateSectionData(originalSection.id, [{ col1: 'test data' }]);

      const duplicatedSection = await mockDb.duplicateSection(originalSection.id);

      expect(duplicatedSection).toBeTruthy();
      expect(duplicatedSection.document_id).toBe(doc.id);
      expect(duplicatedSection.section_order).toBe(2);
      
      const duplicatedData = await mockDb.getSection(duplicatedSection.id);
      expect((duplicatedData as any).data).toEqual([{ col1: 'test data' }]);
    });

    it('should duplicate a section to a different document', async () => {
      const doc1 = await mockDb.createDocument({
        name: 'Document 1',
        type: 'word',
        layoutSchema: {
          schemaId: 'test',
          schemaVersion: '1.0.0',
          tableName: 'Test Table',
          dimensions: { minRows: 1, maxRows: 100, defaultRows: 10, columnCount: 3 }
        }
      } as any);

      const doc2 = await mockDb.createDocument({
        name: 'Document 2',
        type: 'word',
        layoutSchema: {
          schemaId: 'test',
          schemaVersion: '1.0.0',
          tableName: 'Test Table',
          dimensions: { minRows: 1, maxRows: 100, defaultRows: 10, columnCount: 3 }
        }
      } as any);

      const originalSection = await mockDb.createSection({
        documentId: doc1.id,
        sectionType: 'table',
        sectionOrder: 1,
        contentSchema: {
          schemaId: 'table-schema',
          columns: [{ id: 'col1', name: 'Column 1', type: 'text', width: 100 }],
          rows: { data: [] },
          validationSchema: {},
          behaviorSchema: {}
        },
        stylingSchema: {}
      });

      const duplicatedSection = await mockDb.duplicateSection(originalSection.id, doc2.id);

      expect(duplicatedSection).toBeTruthy();
      expect(duplicatedSection.document_id).toBe(doc2.id);
    });

    it('should return null for non-existent section', async () => {
      const result = await mockDb.duplicateSection('non-existent-id');
      expect(result).toBeNull();
    });
  });

  describe('reorderSections', () => {
    it('should reorder sections in a document', async () => {
      const doc = await mockDb.createDocument({
        name: 'Test Document',
        type: 'word',
        layoutSchema: {
          schemaId: 'test',
          schemaVersion: '1.0.0',
          tableName: 'Test Table',
          dimensions: { minRows: 1, maxRows: 100, defaultRows: 10, columnCount: 3 }
        }
      } as any);

      const section1 = await mockDb.createSection({
        documentId: doc.id,
        sectionType: 'table',
        sectionOrder: 1,
        contentSchema: {
          schemaId: 'table-schema',
          columns: [{ id: 'col1', name: 'Column 1', type: 'text', width: 100 }],
          rows: { data: [] },
          validationSchema: {},
          behaviorSchema: {}
        },
        stylingSchema: {}
      });

      const section2 = await mockDb.createSection({
        documentId: doc.id,
        sectionType: 'paragraph',
        sectionOrder: 2,
        contentSchema: {
          schemaId: 'paragraph-schema',
          columns: [],
          rows: { data: [] },
          validationSchema: {},
          behaviorSchema: {}
        },
        stylingSchema: {}
      });

      const reorderedSections = await mockDb.reorderSections(doc.id, [
        { id: section1.id, order: 2 },
        { id: section2.id, order: 1 }
      ]);

      expect(reorderedSections.length).toBe(2);
      expect(reorderedSections[0].id).toBe(section2.id);
      expect(reorderedSections[0].section_order).toBe(1);
      expect(reorderedSections[1].id).toBe(section1.id);
      expect(reorderedSections[1].section_order).toBe(2);
    });
  });

  describe('bulkCreateSections', () => {
    it('should create multiple sections at once', async () => {
      const doc = await mockDb.createDocument({
        name: 'Test Document',
        type: 'word',
        layoutSchema: {
          schemaId: 'test',
          schemaVersion: '1.0.0',
          tableName: 'Test Table',
          dimensions: { minRows: 1, maxRows: 100, defaultRows: 10, columnCount: 3 }
        }
      } as any);

      const sectionsToCreate = [
        {
          sectionType: 'table' as const,
          sectionOrder: 1,
          contentSchema: {
            schemaId: 'table-schema',
            columns: [{ id: 'col1', name: 'Column 1', type: 'text', width: 100 }],
            rows: { data: [] },
            validationSchema: {},
            behaviorSchema: {}
          },
          stylingSchema: {}
        },
        {
          sectionType: 'paragraph' as const,
          sectionOrder: 2,
          contentSchema: {
            schemaId: 'paragraph-schema',
            columns: [],
            rows: { data: [] },
            validationSchema: {},
            behaviorSchema: {}
          },
          stylingSchema: {}
        }
      ];

      const createdSections = await mockDb.bulkCreateSections(doc.id, sectionsToCreate);

      expect(createdSections.length).toBe(2);
      expect(createdSections[0].section_type).toBe('table');
      expect(createdSections[1].section_type).toBe('paragraph');
      
      const docSections = await mockDb.getDocumentSections(doc.id);
      expect(docSections.length).toBe(2);
    });
  });

  describe('searchDocuments', () => {
    it('should search documents by name', async () => {
      await mockDb.createDocument({
        name: 'Test Document One',
        type: 'word',
        layoutSchema: {
          schemaId: 'test',
          schemaVersion: '1.0.0',
          tableName: 'Test Table',
          dimensions: { minRows: 1, maxRows: 100, defaultRows: 10, columnCount: 3 }
        }
      } as any);

      await mockDb.createDocument({
        name: 'Another Document',
        type: 'pdf',
        layoutSchema: {
          schemaId: 'test',
          schemaVersion: '1.0.0',
          tableName: 'Test Table',
          dimensions: { minRows: 1, maxRows: 100, defaultRows: 10, columnCount: 3 }
        }
      } as any);

      const searchResults = await mockDb.searchDocuments('Test');
      expect(searchResults.length).toBe(1);
      expect(searchResults[0].name).toBe('Test Document One');
    });

    it('should search documents by type', async () => {
      await mockDb.createDocument({
        name: 'Document One',
        type: 'word',
        layoutSchema: {
          schemaId: 'test',
          schemaVersion: '1.0.0',
          tableName: 'Test Table',
          dimensions: { minRows: 1, maxRows: 100, defaultRows: 10, columnCount: 3 }
        }
      } as any);

      await mockDb.createDocument({
        name: 'Document Two',
        type: 'pdf',
        layoutSchema: {
          schemaId: 'test',
          schemaVersion: '1.0.0',
          tableName: 'Test Table',
          dimensions: { minRows: 1, maxRows: 100, defaultRows: 10, columnCount: 3 }
        }
      } as any);

      const searchResults = await mockDb.searchDocuments('pdf');
      expect(searchResults.length).toBe(1);
      expect(searchResults[0].type).toBe('pdf');
    });

    it('should respect pagination', async () => {
      for (let i = 0; i < 5; i++) {
        await mockDb.createDocument({
          name: `Test Document ${i}`,
          type: 'word',
          layoutSchema: {
            schemaId: 'test',
            schemaVersion: '1.0.0',
            tableName: 'Test Table',
            dimensions: { minRows: 1, maxRows: 100, defaultRows: 10, columnCount: 3 }
          }
        } as any);
      }

      const searchResults = await mockDb.searchDocuments('Test', 2, 1);
      expect(searchResults.length).toBe(2);
    });
  });
});

describe('New Controller Methods', () => {
  let controller: DocumentController;
  let mockDb: MockDatabaseManager;
  let mockValidator: SchemaValidator;

  beforeEach(() => {
    mockDb = new MockDatabaseManager();
    mockValidator = new SchemaValidator();
    controller = new DocumentController(mockDb as any, mockValidator);
  });

  const createMockRequest = (params: any = {}, body: any = {}, query: any = {}): Partial<Request> => ({
    params,
    body,
    query,
  });

  const createMockResponse = (): Partial<Response> => {
    const res: any = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
  };

  describe('duplicateDocument', () => {
    it('should duplicate a document successfully', async () => {
      const originalDoc = await mockDb.createDocument({
        name: 'Original Document',
        type: 'word',
        layoutSchema: {
          schemaId: 'test',
          schemaVersion: '1.0.0',
          tableName: 'Test Table',
          dimensions: { minRows: 1, maxRows: 100, defaultRows: 10, columnCount: 3 }
        }
      } as any);

      const req = createMockRequest({ id: originalDoc.id }, { newName: 'Duplicated Document' });
      const res = createMockResponse();

      await controller.duplicateDocument(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            name: 'Duplicated Document'
          })
        })
      );
    });

    it('should return 404 for non-existent document', async () => {
      const req = createMockRequest({ id: 'non-existent-id' });
      const res = createMockResponse();

      await controller.duplicateDocument(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: 'Document not found'
        })
      );
    });

    it('should return 400 for missing document ID', async () => {
      const req = createMockRequest({});
      const res = createMockResponse();

      await controller.duplicateDocument(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: 'Document ID is required'
        })
      );
    });
  });

  describe('duplicateSection', () => {
    it('should duplicate a section successfully', async () => {
      const doc = await mockDb.createDocument({
        name: 'Test Document',
        type: 'word',
        layoutSchema: {
          schemaId: 'test',
          schemaVersion: '1.0.0',
          tableName: 'Test Table',
          dimensions: { minRows: 1, maxRows: 100, defaultRows: 10, columnCount: 3 }
        }
      } as any);

      const originalSection = await mockDb.createSection({
        documentId: doc.id,
        sectionType: 'table',
        sectionOrder: 1,
        contentSchema: {
          schemaId: 'table-schema',
          columns: [{ id: 'col1', name: 'Column 1', type: 'text', width: 100 }],
          rows: { data: [] },
          validationSchema: {},
          behaviorSchema: {}
        },
        stylingSchema: {}
      });

      const req = createMockRequest({ id: originalSection.id });
      const res = createMockResponse();

      await controller.duplicateSection(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            document_id: doc.id,
            section_type: 'table'
          })
        })
      );
    });
  });

  describe('reorderSections', () => {
    it('should reorder sections successfully', async () => {
      const doc = await mockDb.createDocument({
        name: 'Test Document',
        type: 'word',
        layoutSchema: {
          schemaId: 'test',
          schemaVersion: '1.0.0',
          tableName: 'Test Table',
          dimensions: { minRows: 1, maxRows: 100, defaultRows: 10, columnCount: 3 }
        }
      } as any);

      const section1 = await mockDb.createSection({
        documentId: doc.id,
        sectionType: 'table',
        sectionOrder: 1,
        contentSchema: {
          schemaId: 'table-schema',
          columns: [{ id: 'col1', name: 'Column 1', type: 'text', width: 100 }],
          rows: { data: [] },
          validationSchema: {},
          behaviorSchema: {}
        },
        stylingSchema: {}
      });

      const section2 = await mockDb.createSection({
        documentId: doc.id,
        sectionType: 'paragraph',
        sectionOrder: 2,
        contentSchema: {
          schemaId: 'paragraph-schema',
          columns: [],
          rows: { data: [] },
          validationSchema: {},
          behaviorSchema: {}
        },
        stylingSchema: {}
      });

      const req = createMockRequest(
        { documentId: doc.id },
        { sectionOrders: [{ id: section1.id, order: 2 }, { id: section2.id, order: 1 }] }
      );
      const res = createMockResponse();

      await controller.reorderSections(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.arrayContaining([
            expect.objectContaining({ id: section2.id, section_order: 1 }),
            expect.objectContaining({ id: section1.id, section_order: 2 })
          ])
        })
      );
    });
  });

  describe('updateSectionData', () => {
    it('should update section data successfully', async () => {
      const doc = await mockDb.createDocument({
        name: 'Test Document',
        type: 'word',
        layoutSchema: {
          schemaId: 'test',
          schemaVersion: '1.0.0',
          tableName: 'Test Table',
          dimensions: { minRows: 1, maxRows: 100, defaultRows: 10, columnCount: 3 }
        }
      } as any);

      const section = await mockDb.createSection({
        documentId: doc.id,
        sectionType: 'table',
        sectionOrder: 1,
        contentSchema: {
          schemaId: 'table-schema',
          columns: [{ id: 'col1', name: 'Column 1', type: 'text', width: 100 }],
          rows: { data: [] },
          validationSchema: {},
          behaviorSchema: {}
        },
        stylingSchema: {}
      });

      const testData = [{ col1: 'test data' }, { col1: 'more data' }];
      const req = createMockRequest({ id: section.id }, { data: testData });
      const res = createMockResponse();

      await controller.updateSectionData(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            data: testData
          })
        })
      );
    });
  });

  describe('bulkCreateSections', () => {
    it('should create multiple sections successfully', async () => {
      const doc = await mockDb.createDocument({
        name: 'Test Document',
        type: 'word',
        layoutSchema: {
          schemaId: 'test',
          schemaVersion: '1.0.0',
          tableName: 'Test Table',
          dimensions: { minRows: 1, maxRows: 100, defaultRows: 10, columnCount: 3 }
        }
      } as any);

      const sectionsToCreate = [
        {
          sectionType: 'table' as const,
          sectionOrder: 1,
          contentSchema: {
            schemaId: 'table-schema',
            columns: [{ id: 'col1', name: 'Column 1', type: 'text', width: 100 }],
            rows: { data: [] },
            validationSchema: {},
            behaviorSchema: {}
          },
          stylingSchema: {}
        },
        {
          sectionType: 'paragraph' as const,
          sectionOrder: 2,
          contentSchema: {
            schemaId: 'paragraph-schema',
            columns: [],
            rows: { data: [] },
            validationSchema: {},
            behaviorSchema: {}
          },
          stylingSchema: {}
        }
      ];

      const req = createMockRequest({ documentId: doc.id }, { sections: sectionsToCreate });
      const res = createMockResponse();

      await controller.bulkCreateSections(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.arrayContaining([
            expect.objectContaining({ section_type: 'table' }),
            expect.objectContaining({ section_type: 'paragraph' })
          ])
        })
      );
    });
  });

  describe('searchDocuments', () => {
    it('should search documents successfully', async () => {
      await mockDb.createDocument({
        name: 'Test Document One',
        type: 'word',
        layoutSchema: {
          schemaId: 'test',
          schemaVersion: '1.0.0',
          tableName: 'Test Table',
          dimensions: { minRows: 1, maxRows: 100, defaultRows: 10, columnCount: 3 }
        }
      } as any);

      await mockDb.createDocument({
        name: 'Another Document',
        type: 'pdf',
        layoutSchema: {
          schemaId: 'test',
          schemaVersion: '1.0.0',
          tableName: 'Test Table',
          dimensions: { minRows: 1, maxRows: 100, defaultRows: 10, columnCount: 3 }
        }
      } as any);

      const req = createMockRequest({}, {}, { query: 'Test', limit: '10', offset: '0' });
      const res = createMockResponse();

      await controller.searchDocuments(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.arrayContaining([
            expect.objectContaining({ name: 'Test Document One' })
          ])
        })
      );
    });

    it('should return 400 for missing query', async () => {
      const req = createMockRequest({}, {});
      const res = createMockResponse();

      await controller.searchDocuments(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: 'Search query is required'
        })
      );
    });
  });
});
