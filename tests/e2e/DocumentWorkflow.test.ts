import { DocumentClient } from '../../src/sdk/DocumentClient';
import { DocumentType } from '../../src/types';

/**
 * End-to-end tests for complete document workflow
 * Follows DRY principles - comprehensive workflow testing
 */

describe('Document Workflow E2E Tests', () => {
  let client: DocumentClient;
  const baseUrl = process.env['TEST_API_URL'] || 'http://localhost:3000';
  const apiKey = process.env['TEST_API_KEY'] || 'test-key';

  beforeAll(async () => {
    client = new DocumentClient(baseUrl, apiKey);
  });

  describe('Complete Document Creation and Generation Workflow', () => {
    test('should create document with table section and generate Word document', async () => {
      // Step 1: Create a document
      const documentResponse = await client.createDocument({
        name: 'E2E Test Document',
        type: 'word',
        layoutSchema: {
          schemaId: 'e2e-layout',
          schemaVersion: '1.0.0',
          tableName: 'E2E Test Table',
          dimensions: {
            minRows: 1,
            maxRows: 100,
            defaultRows: 10,
            columnCount: 3
          }
        }
      });

      expect(documentResponse.success).toBe(true);
      expect(documentResponse.data).toBeDefined();
      const documentId = documentResponse.data!.id;

      // Step 2: Add a table section
      const tableSectionResponse = await client.createSection({
        documentId,
        sectionType: 'table',
        sectionOrder: 1,
        contentSchema: {
          schemaId: 'e2e-table',
          columns: [
            {
              id: 'id',
              name: 'ID',
              type: 'number',
              required: true,
              editable: false,
              sortable: true,
              filterable: true,
              width: 80,
              options: [],
              format: { kind: 'text', precision: 0 }
            },
            {
              id: 'name',
              name: 'Name',
              type: 'string',
              required: true,
              editable: true,
              sortable: true,
              filterable: true,
              width: 200,
              options: [],
              format: { kind: 'text', precision: 2 }
            },
            {
              id: 'status',
              name: 'Status',
              type: 'enum',
              required: true,
              editable: true,
              sortable: true,
              filterable: true,
              width: 120,
              options: ['active', 'inactive', 'pending'],
              format: { kind: 'text', precision: 2 }
            }
          ],
          rows: {
            rowIdStrategy: 'auto',
            allowAdd: true,
            allowDelete: true,
            allowReorder: false,
            showRowNumbers: true
          },
          validationSchema: {
            id: { min: 1 },
            name: { minLength: 2, maxLength: 50 },
            status: { allowedValues: ['active', 'inactive', 'pending'] }
          },
          behaviorSchema: {
            sorting: { enabled: true, multiColumn: true },
            filtering: { enabled: true },
            pagination: { enabled: true, pageSize: 25 },
            editing: { enabled: true, mode: 'row' }
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

      expect(tableSectionResponse.success).toBe(true);
      expect(tableSectionResponse.data).toBeDefined();
      const sectionId = tableSectionResponse.data!.id;

      // Step 3: Add a paragraph section
      const paragraphSectionResponse = await client.createSection({
        documentId,
        sectionType: 'paragraph',
        sectionOrder: 2,
        contentSchema: {
          schemaId: 'e2e-paragraph',
          content: 'This is a test paragraph for the E2E workflow test.',
          format: {
            bold: false,
            italic: true,
            fontSize: 14,
            fontFamily: 'Arial',
            color: '#333333',
            alignment: 'left'
          },
          position: {
            x: 100,
            y: 200,
            width: 400,
            height: 50
          },
          margins: {
            top: 10,
            right: 10,
            bottom: 10,
            left: 10
          },
          border: {
            enabled: false,
            style: 'solid',
            color: '#000000',
            width: 1
          },
          background: {
            enabled: false,
            color: '#f0f0f0'
          }
        },
        stylingSchema: {
          paragraph: {
            fontFamily: 'Arial',
            fontSize: 14,
            textColor: '#333333',
            fontWeight: 'normal',
            fontStyle: 'italic',
            textAlign: 'left',
            paragraphSpacing: 6
          },
          columnOverrides: {}
        }
      });

      expect(paragraphSectionResponse.success).toBe(true);

      // Step 4: Get document sections to verify
      const sectionsResponse = await client.getDocumentSections(documentId);
      expect(sectionsResponse.success).toBe(true);
      expect(sectionsResponse.data).toHaveLength(2);

      // Step 5: Generate Word document
      const generationResponse = await client.generateDocument(documentId, 'word', {
        pageSize: 'A4',
        orientation: 'portrait',
        margins: { top: 72, right: 72, bottom: 72, left: 72 }
      });

      expect(generationResponse.success).toBe(true);
      expect(generationResponse.data).toBeDefined();

      // Step 6: Verify document can be retrieved
      const getDocumentResponse = await client.getDocument(documentId);
      expect(getDocumentResponse.success).toBe(true);
      expect(getDocumentResponse.data!.name).toBe('E2E Test Document');
    });

    test('should create document with multiple sections and generate PDF', async () => {
      // Create document
      const documentResponse = await client.createDocument({
        name: 'Multi-Section PDF Test',
        type: 'pdf',
        layoutSchema: {
          schemaId: 'pdf-layout',
          schemaVersion: '1.0.0',
          tableName: 'PDF Test Table',
          dimensions: {
            minRows: 1,
            maxRows: 50,
            defaultRows: 5,
            columnCount: 2
          }
        }
      });

      expect(documentResponse.success).toBe(true);
      const documentId = documentResponse.data!.id;

      // Add header section
      const headerResponse = await client.createSection({
        documentId,
        sectionType: 'header',
        sectionOrder: 1,
        contentSchema: {
          schemaId: 'pdf-header',
          type: 'header',
          elements: [
            {
              type: 'text',
              content: 'PDF Test Document',
              style: {
                fontSize: 16,
                fontWeight: 'bold',
                alignment: 'center'
              }
            }
          ],
          layout: {
            height: 50,
            backgroundColor: '#f5f5f5',
            borderColor: '#cccccc',
            borderWidth: 1
          },
          repeatBehavior: 'all',
          background: {
            enabled: true,
            color: '#f5f5f5'
          }
        },
        stylingSchema: {
          header: {
            backgroundColor: '#f5f5f5',
            textColor: '#000000',
            fontSize: 16,
            fontWeight: 'bold',
            textAlign: 'center',
            height: 50
          },
          columnOverrides: {}
        }
      });

      expect(headerResponse.success).toBe(true);

      // Add table section
      const tableResponse = await client.createSection({
        documentId,
        sectionType: 'table',
        sectionOrder: 2,
        contentSchema: {
          schemaId: 'pdf-table',
          columns: [
            {
              id: 'product',
              name: 'Product',
              type: 'string',
              required: true,
              editable: true,
              sortable: true,
              filterable: true,
              width: 150,
              options: [],
              format: { kind: 'text', precision: 2 }
            },
            {
              id: 'price',
              name: 'Price',
              type: 'number',
              required: true,
              editable: true,
              sortable: true,
              filterable: true,
              width: 100,
              options: [],
              format: { kind: 'number', precision: 2 }
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

      expect(tableResponse.success).toBe(true);

      // Add footer section
      const footerResponse = await client.createSection({
        documentId,
        sectionType: 'footer',
        sectionOrder: 3,
        contentSchema: {
          schemaId: 'pdf-footer',
          type: 'footer',
          elements: [
            {
              type: 'text',
              content: 'Page {pageNumber}',
              style: {
                fontSize: 10,
                alignment: 'center'
              }
            }
          ],
          layout: {
            height: 30,
            backgroundColor: '#f9f9f9',
            borderColor: '#dddddd',
            borderWidth: 1
          },
          repeatBehavior: 'all',
          background: {
            enabled: true,
            color: '#f9f9f9'
          }
        },
        stylingSchema: {
          footer: {
            backgroundColor: '#f9f9f9',
            textColor: '#666666',
            fontSize: 10,
            textAlign: 'center',
            height: 30
          },
          columnOverrides: {}
        }
      });

      expect(footerResponse.success).toBe(true);

      // Generate PDF
      const pdfResponse = await client.generateDocument(documentId, 'pdf', {
        pageSize: 'A4',
        orientation: 'portrait',
        margins: { top: 60, right: 60, bottom: 60, left: 60 }
      });

      expect(pdfResponse.success).toBe(true);
    });
  });

  describe('Schema Validation Workflow', () => {
    test('should validate schemas before creating document', async () => {
      // Validate document layout schema
      const documentSchema = {
        schemaId: 'validation-test',
        schemaVersion: '1.0.0',
        tableName: 'Validation Test',
        dimensions: {
          minRows: 1,
          maxRows: 100,
          defaultRows: 10,
          columnCount: 3
        }
      };

      const validationResponse = await client.validateSchema(documentSchema);
      expect(validationResponse.success).toBe(true);
      expect(validationResponse.data).toBe(true);

      // Create document using validated schema
      const documentResponse = await client.createDocument({
        name: 'Validation Test Document',
        type: 'word',
        layoutSchema: documentSchema
      });

      expect(documentResponse.success).toBe(true);
    });

    test('should reject invalid schemas', async () => {
      // Try to validate invalid schema
      const invalidSchema = {
        invalid: 'schema',
        missing: 'required-fields'
      };

      const validationResponse = await client.validateSchema(invalidSchema);
      expect(validationResponse.success).toBe(false);
      expect(validationResponse.error).toBeDefined();
    });
  });

  describe('Error Recovery Workflow', () => {
    test('should handle creation failures gracefully', async () => {
      // Try to create document with invalid data
      const invalidResponse = await client.createDocument({
        name: '', // Invalid empty name
        type: 'word',
        layoutSchema: {
          schemaId: 'invalid-test',
          schemaVersion: '1.0.0',
          tableName: 'Invalid Test',
          dimensions: {
            minRows: -1, // Invalid negative value
            maxRows: 0,   // Invalid zero value
            defaultRows: 10,
            columnCount: 5
          }
        }
      });

      expect(invalidResponse.success).toBe(false);
      expect(invalidResponse.error).toBeDefined();

      // Create valid document after failure
      const validResponse = await client.createDocument({
        name: 'Valid Document After Error',
        type: 'word',
        layoutSchema: {
          schemaId: 'valid-test',
          schemaVersion: '1.0.0',
          tableName: 'Valid Test',
          dimensions: {
            minRows: 1,
            maxRows: 100,
            defaultRows: 10,
            columnCount: 5
          }
        }
      });

      expect(validResponse.success).toBe(true);
    });
  });

  describe('Performance Workflow', () => {
    test('should handle multiple document operations efficiently', async () => {
      const documentIds: string[] = [];
      const startTime = Date.now();

      // Create multiple documents
      for (let i = 0; i < 5; i++) {
        const response = await client.createDocument({
          name: `Performance Test Document ${i}`,
          type: 'word',
          layoutSchema: {
            schemaId: `perf-test-${i}`,
            schemaVersion: '1.0.0',
            tableName: `Performance Test ${i}`,
            dimensions: {
              minRows: 1,
              maxRows: 50,
              defaultRows: 10,
              columnCount: 3
            }
          }
        });

        expect(response.success).toBe(true);
        documentIds.push(response.data!.id);
      }

      const creationTime = Date.now() - startTime;
      console.log(`Created 5 documents in ${creationTime}ms`);

      // List all documents
      const listStartTime = Date.now();
      const listResponse = await client.listDocuments(10, 0);
      const listTime = Date.now() - listStartTime;

      expect(listResponse.success).toBe(true);
      expect(listResponse.data!.length).toBeGreaterThanOrEqual(5);
      console.log(`Listed documents in ${listTime}ms`);

      // Update all documents
      const updateStartTime = Date.now();
      for (const id of documentIds) {
        const response = await client.updateDocument(id, {
          name: `Updated Performance Test Document ${id}`
        });
        expect(response.success).toBe(true);
      }
      const updateTime = Date.now() - updateStartTime;
      console.log(`Updated 5 documents in ${updateTime}ms`);

      // Clean up
      const deleteStartTime = Date.now();
      for (const id of documentIds) {
        const response = await client.deleteDocument(id);
        expect(response.success).toBe(true);
      }
      const deleteTime = Date.now() - deleteStartTime;
      console.log(`Deleted 5 documents in ${deleteTime}ms`);

      // Performance should be reasonable (less than 5 seconds for all operations)
      const totalTime = creationTime + listTime + updateTime + deleteTime;
      expect(totalTime).toBeLessThan(5000);
    });
  });

  describe('Schema Template Workflow', () => {
    test('should retrieve and use schema templates', async () => {
      // Get table template
      const tableTemplateResponse = await fetch(`${baseUrl}/api/schemas/templates/table`);
      const tableTemplate = await tableTemplateResponse.json();
      expect(tableTemplate.success).toBe(true);

      // Use template to create section
      const documentResponse = await client.createDocument({
        name: 'Template Test Document',
        type: 'word',
        layoutSchema: {
          schemaId: 'template-test',
          schemaVersion: '1.0.0',
          tableName: 'Template Test',
          dimensions: {
            minRows: 1,
            maxRows: 100,
            defaultRows: 10,
            columnCount: 3
          }
        }
      });

      expect(documentResponse.success).toBe(true);

      const sectionResponse = await client.createSection({
        documentId: documentResponse.data!.id,
        sectionType: 'table',
        sectionOrder: 1,
        contentSchema: tableTemplate.data,
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

      expect(sectionResponse.success).toBe(true);
    });
  });
});
