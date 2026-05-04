import { SchemaValidator } from '../../src/validation/SchemaValidator';
import { DocumentLayoutSchema, SectionContentSchema, StylingSchema } from '../../src/types';

/**
 * Unit tests for SchemaValidator
 * Follows DRY principles - comprehensive validation testing
 */

describe('SchemaValidator', () => {
  let validator: SchemaValidator;

  beforeEach(() => {
    validator = new SchemaValidator();
  });

  describe('Document Layout Validation', () => {
    const validDocumentSchema: DocumentLayoutSchema = {
      schemaId: 'test-document',
      schemaVersion: '1.0.0',
      tableName: 'Test Document',
      dimensions: {
        minRows: 1,
        maxRows: 100,
        defaultRows: 10,
        columnCount: 5
      }
    };

    test('should validate correct document schema', () => {
      const result = validator.validateDocumentLayout(validDocumentSchema);
      expect(result).toBe(true);
    });

    test('should reject document schema without required fields', () => {
      const invalidSchema = { ...validDocumentSchema };
      delete (invalidSchema as any).schemaId;

      const result = validator.validateDocumentLayout(invalidSchema);
      expect(result).toBe(false);
    });

    test('should reject document schema with invalid dimensions', () => {
      const invalidSchema: DocumentLayoutSchema = {
        ...validDocumentSchema,
        dimensions: {
          minRows: -1,
          maxRows: 0,
          defaultRows: 10,
          columnCount: -5
        }
      };

      const result = validator.validateDocumentLayout(invalidSchema);
      expect(result).toBe(false);
    });

    test('should accept document schema with default values', () => {
      const minimalSchema: DocumentLayoutSchema = {
        schemaId: 'minimal',
        schemaVersion: '1.0.0',
        tableName: 'Minimal',
        dimensions: {
          minRows: 0,
          maxRows: 1000,
          defaultRows: 0,
          columnCount: 0
        }
      };

      const result = validator.validateDocumentLayout(minimalSchema);
      expect(result).toBe(true);
    });

    test('should return validation errors for invalid document schema', () => {
      const invalidSchema = { invalid: 'schema' };

      const errors = validator.getValidationErrors(invalidSchema, 'document');
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0]).toContain('schemaId');
    });
  });

  describe('Section Content Validation', () => {
    const validSectionSchema: SectionContentSchema = {
      schemaId: 'test-section',
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
    };

    test('should validate correct section schema', () => {
      const result = validator.validateSectionContent(validSectionSchema);
      expect(result).toBe(true);
    });

    test('should reject section schema without columns', () => {
      const invalidSchema = { ...validSectionSchema };
      delete (invalidSchema as any).columns;

      const result = validator.validateSectionContent(invalidSchema);
      expect(result).toBe(false);
    });

    test('should reject section schema with invalid column type', () => {
      const invalidSchema: SectionContentSchema = {
        ...validSectionSchema,
        columns: [
          {
            ...validSectionSchema.columns[0],
            type: 'invalid-type' as any
          }
        ]
      };

      const result = validator.validateSectionContent(invalidSchema);
      expect(result).toBe(false);
    });

    test('should reject section schema with invalid column width', () => {
      const invalidSchema: SectionContentSchema = {
        ...validSectionSchema,
        columns: [
          {
            ...validSectionSchema.columns[0],
            width: -10
          }
        ]
      };

      const result = validator.validateSectionContent(invalidSchema);
      expect(result).toBe(false);
    });

    test('should return validation errors for invalid section schema', () => {
      const invalidSchema = { invalid: 'schema' };

      const errors = validator.getValidationErrors(invalidSchema, 'section');
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0]).toContain('schemaId');
    });
  });

  describe('Styling Schema Validation', () => {
    const validStylingSchema: StylingSchema = {
      table: {
        backgroundColor: '#ffffff',
        borderColor: '#d9d9d9',
        borderWidth: 1,
        borderRadius: 4,
        fontFamily: 'Arial',
        fontSize: 12,
        textColor: '#000000'
      },
      tableHeader: {
        backgroundColor: '#f5f5f5',
        textColor: '#000000',
        fontWeight: 600,
        fontSize: 12,
        height: 40
      },
      tableRow: {
        height: 36,
        backgroundColor: '#ffffff',
        alternateBackgroundColor: '#fafafa',
        hoverBackgroundColor: '#eeeeee',
        selectedBackgroundColor: '#dddddd'
      },
      tableCell: {
        paddingX: 8,
        paddingY: 4,
        borderColor: '#e0e0e0',
        borderWidth: 1,
        textAlign: 'left'
      },
      columnOverrides: {}
    };

    test('should validate correct styling schema', () => {
      const result = validator.validateStyling(validStylingSchema);
      expect(result).toBe(true);
    });

    test('should accept minimal styling schema', () => {
      const minimalSchema: StylingSchema = {
        table: {
          backgroundColor: '#ffffff',
          borderColor: '#000000',
          borderWidth: 1,
          borderRadius: 0,
          fontFamily: 'Arial',
          fontSize: 12,
          textColor: '#000000'
        },
        tableHeader: {
          backgroundColor: '#ffffff',
          textColor: '#000000',
          fontWeight: 400,
          fontSize: 12,
          height: 20
        },
        tableRow: {
          height: 20,
          backgroundColor: '#ffffff',
          alternateBackgroundColor: '#ffffff',
          hoverBackgroundColor: '#ffffff',
          selectedBackgroundColor: '#ffffff'
        },
        tableCell: {
          paddingX: 4,
          paddingY: 2,
          borderColor: '#000000',
          borderWidth: 1,
          textAlign: 'left'
        },
        columnOverrides: {}
      };

      const result = validator.validateStyling(minimalSchema);
      expect(result).toBe(true);
    });

    test('should reject styling schema with invalid color format', () => {
      const invalidSchema: StylingSchema = {
        ...validStylingSchema,
        table: {
          ...validStylingSchema.table,
          backgroundColor: 'invalid-color'
        }
      };

      const result = validator.validateStyling(invalidSchema);
      expect(result).toBe(false);
    });

    test('should reject styling schema with invalid text alignment', () => {
      const invalidSchema: StylingSchema = {
        ...validStylingSchema,
        tableCell: {
          ...validStylingSchema.tableCell,
          textAlign: 'invalid-align' as any
        }
      };

      const result = validator.validateStyling(invalidSchema);
      expect(result).toBe(false);
    });

    test('should return validation errors for invalid styling schema', () => {
      const invalidSchema = { invalid: 'schema' };

      const errors = validator.getValidationErrors(invalidSchema, 'styling');
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe('Error Handling', () => {
    test('should handle null schema gracefully', () => {
      const result = validator.validateDocumentLayout(null as any);
      expect(result).toBe(false);

      const errors = validator.getValidationErrors(null as any, 'document');
      expect(errors.length).toBeGreaterThan(0);
    });

    test('should handle undefined schema gracefully', () => {
      const result = validator.validateSectionContent(undefined as any);
      expect(result).toBe(false);

      const errors = validator.getValidationErrors(undefined as any, 'section');
      expect(errors.length).toBeGreaterThan(0);
    });

    test('should handle empty schema gracefully', () => {
      const result = validator.validateStyling({} as any);
      expect(result).toBe(false);

      const errors = validator.getValidationErrors({} as any, 'styling');
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe('Complex Validation Scenarios', () => {
    test('should validate complex document schema with all properties', () => {
      const complexSchema: DocumentLayoutSchema = {
        schemaId: 'complex-document',
        schemaVersion: '2.0.0',
        tableName: 'Complex Document',
        dimensions: {
          minRows: 5,
          maxRows: 1000,
          defaultRows: 25,
          columnCount: 10
        },
        pageSetup: {
          pageSize: 'A4',
          orientation: 'portrait',
          margins: {
            top: 72,
            right: 72,
            bottom: 72,
            left: 72
          }
        },
        sections: [
          {
            sectionType: 'header',
            order: 1,
            repeatOnPages: true
          },
          {
            sectionType: 'table',
            order: 2,
            repeatOnPages: false
          },
          {
            sectionType: 'footer',
            order: 3,
            repeatOnPages: true
          }
        ]
      };

      const result = validator.validateDocumentLayout(complexSchema);
      expect(result).toBe(true);
    });

    test('should validate section schema with multiple columns and complex behavior', () => {
      const complexSectionSchema: SectionContentSchema = {
        schemaId: 'complex-section',
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
          },
          {
            id: 'date',
            name: 'Date',
            type: 'date',
            required: false,
            editable: true,
            sortable: true,
            filterable: true,
            width: 150,
            options: [],
            format: { kind: 'date', precision: 0 }
          }
        ],
        rows: {
          rowIdStrategy: 'auto',
          allowAdd: true,
          allowDelete: true,
          allowReorder: true,
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
      };

      const result = validator.validateSectionContent(complexSectionSchema);
      expect(result).toBe(true);
    });
  });
});
