import * as fs from 'fs';
import * as path from 'path';

describe('Schema Validation Tests', () => {
  const schemasDir = path.join(__dirname, '../../schemas');
  
  const loadSchema = (schemaPath: string) => {
    const fullPath = path.join(schemasDir, schemaPath);
    return JSON.parse(fs.readFileSync(fullPath, 'utf8'));
  };

  const validateSchema = (schema: any, data: any): { valid: boolean; errors?: string[] } => {
    const errors: string[] = [];
    
    const validateObject = (obj: any, schemaObj: any, path: string = ''): void => {
      if (!schemaObj || typeof schemaObj !== 'object') return;
      
      // Check required fields
      if (schemaObj.required && Array.isArray(schemaObj.required)) {
        for (const field of schemaObj.required) {
          if (!(field in obj)) {
            errors.push(`Missing required field: ${path}${field}`);
          }
        }
      }
      
      // Validate properties
      if (schemaObj.properties && typeof schemaObj.properties === 'object') {
        for (const [field, fieldSchema] of Object.entries(schemaObj.properties)) {
          if (field in obj) {
            validateField(obj[field], fieldSchema as any, `${path}${field}.`);
          }
        }
      }
    };
    
    const validateField = (value: any, fieldSchema: any, path: string): void => {
      if (!fieldSchema || typeof fieldSchema !== 'object') return;
      
      // Type validation
      if (fieldSchema.type) {
        const expectedType = fieldSchema.type;
        const actualType = typeof value;
        
        if (expectedType === 'string' && actualType !== 'string') {
          errors.push(`${path} should be a string, got ${actualType}`);
        } else if (expectedType === 'number' && actualType !== 'number') {
          errors.push(`${path} should be a number, got ${actualType}`);
        } else if (expectedType === 'boolean' && actualType !== 'boolean') {
          errors.push(`${path} should be a boolean, got ${actualType}`);
        } else if (expectedType === 'array' && !Array.isArray(value)) {
          errors.push(`${path} should be an array, got ${actualType}`);
        } else if (expectedType === 'object' && (actualType !== 'object' || Array.isArray(value))) {
          errors.push(`${path} should be an object, got ${actualType}`);
        }
      }
      
      // Enum validation
      if (fieldSchema.enum && Array.isArray(fieldSchema.enum)) {
        if (!fieldSchema.enum.includes(value)) {
          errors.push(`${path} should be one of: ${fieldSchema.enum.join(', ')}, got ${value}`);
        }
      }
      
      // Pattern validation
      if (fieldSchema.pattern && typeof value === 'string') {
        const regex = new RegExp(fieldSchema.pattern);
        if (!regex.test(value)) {
          errors.push(`${path} should match pattern: ${fieldSchema.pattern}`);
        }
      }
      
      // Range validation for numbers
      if (typeof value === 'number') {
        if (fieldSchema.minimum !== undefined && value < fieldSchema.minimum) {
          errors.push(`${path} should be at least ${fieldSchema.minimum}, got ${value}`);
        }
        if (fieldSchema.maximum !== undefined && value > fieldSchema.maximum) {
          errors.push(`${path} should be at most ${fieldSchema.maximum}, got ${value}`);
        }
        if (fieldSchema.exclusiveMinimum !== undefined && value <= fieldSchema.exclusiveMinimum) {
          errors.push(`${path} should be greater than ${fieldSchema.exclusiveMinimum}, got ${value}`);
        }
        if (fieldSchema.exclusiveMaximum !== undefined && value >= fieldSchema.exclusiveMaximum) {
          errors.push(`${path} should be less than ${fieldSchema.exclusiveMaximum}, got ${value}`);
        }
      }
      
      // Length validation for strings and arrays
      if (typeof value === 'string' || Array.isArray(value)) {
        if (fieldSchema.minLength !== undefined && value.length < fieldSchema.minLength) {
          errors.push(`${path} should have minimum length of ${fieldSchema.minLength}, got ${value.length}`);
        }
        if (fieldSchema.maxLength !== undefined && value.length > fieldSchema.maxLength) {
          errors.push(`${path} should have maximum length of ${fieldSchema.maxLength}, got ${value.length}`);
        }
      }
      
      // Min/Max items validation for arrays
      if (Array.isArray(value)) {
        if (fieldSchema.minItems !== undefined && value.length < fieldSchema.minItems) {
          errors.push(`${path} should have at least ${fieldSchema.minItems} items, got ${value.length}`);
        }
        if (fieldSchema.maxItems !== undefined && value.length > fieldSchema.maxItems) {
          errors.push(`${path} should have at most ${fieldSchema.maxItems} items, got ${value.length}`);
        }
      }
      
      // Array item validation
      if (Array.isArray(value) && fieldSchema.items) {
        value.forEach((item, index) => {
          validateField(item, fieldSchema.items, `${path}[${index}].`);
        });
      }
      
      // Object validation
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        validateObject(value, fieldSchema, path);
      }
    };
    
    // Start validation from the root
    if (schema.type === 'object') {
      validateObject(data, schema);
    }
    
    return { valid: errors.length === 0, errors };
  };

  describe('Chart Schema Validation', () => {
    const chartSchema = loadSchema('sections/chart-schema.json');

    it('should validate a complete chart object', () => {
      const validChart = {
        schemaId: 'chart-001',
        chartType: 'bar',
        title: 'Sales Chart',
        subtitle: 'Monthly Sales Data',
        data: {
          datasets: [{
            label: 'Sales',
            data: [100, 200, 150],
            backgroundColor: ['#FF0000', '#00FF00', '#0000FF'],
            borderColor: ['#FF0000', '#00FF00', '#0000FF'],
            borderWidth: 1
          }],
          labels: ['Jan', 'Feb', 'Mar']
        },
        position: {
          x: 100,
          y: 100,
          width: 400,
          height: 300,
          alignment: 'center'
        }
      };

      const result = validateSchema(chartSchema, validChart);
      expect(result.valid).toBe(true);
    });

    it('should reject chart without required fields', () => {
      const invalidChart = {
        title: 'Sales Chart',
        data: {
          datasets: [],
          labels: []
        }
      };

      const result = validateSchema(chartSchema, invalidChart);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Missing required field: schemaId');
      expect(result.errors).toContain('Missing required field: chartType');
    });

    it('should reject invalid chart type', () => {
      const invalidChart = {
        schemaId: 'chart-001',
        chartType: 'invalid-type',
        data: {
          datasets: [],
          labels: []
        }
      };

      const result = validateSchema(chartSchema, invalidChart);
      expect(result.valid).toBe(false);
    });
  });

  describe('Header/Footer Schema Validation', () => {
    const headerFooterSchema = loadSchema('sections/header-footer-schema.json');

    it('should validate a complete header object', () => {
      const validHeader = {
        schemaId: 'header-001',
        type: 'header',
        content: [{
          contentType: 'text',
          text: 'Company Name',
          position: {
            x: 50,
            y: 10,
            width: 200,
            height: 20
          },
          formatting: {
            bold: true,
            fontSize: 14,
            color: '#000000',
            alignment: 'center'
          }
        }],
        layout: {
          height: 48,
          margins: {
            top: 12,
            right: 12,
            bottom: 12,
            left: 12
          }
        }
      };

      const result = validateSchema(headerFooterSchema, validHeader);
      expect(result.valid).toBe(true);
    });

    it('should reject header/footer without required fields', () => {
      const invalidHeader = {
        type: 'header'
      };

      const result = validateSchema(headerFooterSchema, invalidHeader);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Missing required field: schemaId');
      expect(result.errors).toContain('Missing required field: content');
    });

    it('should reject invalid content type', () => {
      const invalidHeader = {
        schemaId: 'header-001',
        type: 'header',
        content: [{
          contentType: 'invalid-type',
          text: 'Test'
        }]
      };

      const result = validateSchema(headerFooterSchema, invalidHeader);
      expect(result.valid).toBe(false);
    });
  });

  describe('Image Schema Validation', () => {
    const imageSchema = loadSchema('sections/image-schema.json');

    it('should validate a complete image object', () => {
      const validImage = {
        schemaId: 'image-001',
        imagePath: '/path/to/image.png',
        altText: 'Sample Image',
        position: {
          x: 100,
          y: 100,
          width: 200,
          height: 150,
          alignment: 'center'
        },
        sizing: {
          scale: 1.0,
          maintainAspectRatio: true,
          fitMode: 'fit'
        },
        border: {
          enabled: true,
          color: '#000000',
          width: 1,
          style: 'solid'
        }
      };

      const result = validateSchema(imageSchema, validImage);
      expect(result.valid).toBe(true);
    });

    it('should reject image without required fields', () => {
      const invalidImage = {
        altText: 'Sample Image'
      };

      const result = validateSchema(imageSchema, invalidImage);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Missing required field: schemaId');
      expect(result.errors).toContain('Missing required field: imagePath');
    });

    it('should reject invalid image alignment', () => {
      const invalidImage = {
        schemaId: 'image-001',
        imagePath: '/path/to/image.png',
        position: {
          alignment: 'invalid-alignment'
        }
      };

      const result = validateSchema(imageSchema, invalidImage);
      expect(result.valid).toBe(false);
    });
  });

  describe('Paragraph Schema Validation', () => {
    const paragraphSchema = loadSchema('sections/paragraph-schema.json');

    it('should validate a complete paragraph object', () => {
      const validParagraph = {
        schemaId: 'paragraph-001',
        content: 'This is a sample paragraph text.',
        formatting: {
          bold: false,
          italic: false,
          fontSize: 12,
          fontFamily: 'Arial',
          color: '#000000',
          alignment: 'left',
          lineSpacing: 1.5,
          paragraphSpacing: 6
        },
        position: {
          x: 50,
          y: 100,
          width: 400,
          height: 50
        },
        margins: {
          top: 10,
          right: 10,
          bottom: 10,
          left: 10
        }
      };

      const result = validateSchema(paragraphSchema, validParagraph);
      expect(result.valid).toBe(true);
    });

    it('should reject paragraph without required fields', () => {
      const invalidParagraph = {
        formatting: {
          fontSize: 12
        }
      };

      const result = validateSchema(paragraphSchema, invalidParagraph);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Missing required field: schemaId');
      expect(result.errors).toContain('Missing required field: content');
    });

    it('should reject invalid text alignment', () => {
      const invalidParagraph = {
        schemaId: 'paragraph-001',
        content: 'Test text',
        formatting: {
          alignment: 'invalid-alignment'
        }
      };

      const result = validateSchema(paragraphSchema, invalidParagraph);
      expect(result.valid).toBe(false);
    });
  });

  describe('Table Schema Validation', () => {
    const tableSchema = loadSchema('sections/table-schema.json');

    it('should validate a complete table object', () => {
      const validTable = {
        schemaId: 'table-001',
        tableName: 'Sales Data',
        dimensions: {
          minRows: 1,
          maxRows: 100,
          defaultRows: 10,
          columnCount: 3
        },
        columns: [{
          id: 'col1',
          name: 'Product',
          type: 'string',
          required: true,
          editable: true,
          sortable: true,
          filterable: true,
          width: 120,
          format: {
            kind: 'text'
          }
        }, {
          id: 'col2',
          name: 'Price',
          type: 'number',
          required: true,
          editable: true,
          sortable: true,
          filterable: true,
          width: 100,
          format: {
            kind: 'currency',
            currencyCode: 'USD',
            precision: 2
          }
        }],
        rows: {
          rowIdStrategy: 'auto',
          allowAdd: true,
          allowDelete: true,
          allowReorder: false,
          showRowNumbers: false
        },
        validationSchema: {
          col1: {
            minLength: 1,
            maxLength: 50
          },
          col2: {
            min: 0,
            max: 10000
          }
        },
        behaviorSchema: {
          sorting: {
            enabled: true,
            multiColumn: false
          },
          filtering: {
            enabled: true
          },
          pagination: {
            enabled: true,
            pageSize: 10
          },
          editing: {
            enabled: true,
            mode: 'cell'
          }
        }
      };

      const result = validateSchema(tableSchema, validTable);
      expect(result.valid).toBe(true);
    });

    it('should reject table without required fields', () => {
      const invalidTable = {
        tableName: 'Test Table'
      };

      const result = validateSchema(tableSchema, invalidTable);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Missing required field: schemaId');
      expect(result.errors).toContain('Missing required field: columns');
    });

    it('should reject table without columns', () => {
      const invalidTable = {
        schemaId: 'table-001',
        columns: []
      };

      const result = validateSchema(tableSchema, invalidTable);
      expect(result.valid).toBe(false);
    });

    it('should reject invalid column type', () => {
      const invalidTable = {
        schemaId: 'table-001',
        columns: [{
          id: 'col1',
          name: 'Column',
          type: 'invalid-type'
        }]
      };

      const result = validateSchema(tableSchema, invalidTable);
      expect(result.valid).toBe(false);
    });
  });

  describe('PDF Styling Schema Validation', () => {
    const pdfStylingSchema = loadSchema('styling/pdf-styling.json');

    it('should validate complete PDF styling', () => {
      const validPdfStyling = {
        document: {
          backgroundColor: '#ffffff',
          fontFamily: 'Arial',
          fontSize: 12,
          textColor: '#000000',
          lineSpacing: 1.2,
          paragraphSpacing: 6
        },
        page: {
          size: 'A4',
          orientation: 'portrait',
          margins: {
            top: 72,
            right: 72,
            bottom: 72,
            left: 72
          }
        },
        header: {
          backgroundColor: '#f5f5f5',
          textColor: '#000000',
          fontWeight: 'bold',
          fontSize: 10,
          height: 36,
          border: {
            enabled: true,
            color: '#000000',
            width: 0.5,
            position: 'bottom'
          }
        },
        table: {
          backgroundColor: '#ffffff',
          borderColor: '#000000',
          borderWidth: 0.5,
          fontFamily: 'Arial',
          fontSize: 10,
          textColor: '#000000'
        },
        tableHeader: {
          backgroundColor: '#e8e8e8',
          textColor: '#000000',
          fontWeight: 'bold',
          fontSize: 10,
          height: 24,
          repeatOnEveryPage: true
        },
        paragraph: {
          backgroundColor: '#ffffff',
          textColor: '#000000',
          fontSize: 12,
          fontWeight: 'normal',
          alignment: 'left',
          lineSpacing: 1.2,
          paragraphSpacing: 6
        }
      };

      const result = validateSchema(pdfStylingSchema, validPdfStyling);
      expect(result.valid).toBe(true);
    });

    it('should reject invalid page size', () => {
      const invalidPdfStyling = {
        page: {
          size: 'invalid-size',
          orientation: 'portrait'
        }
      };

      const result = validateSchema(pdfStylingSchema, invalidPdfStyling);
      expect(result.valid).toBe(false);
    });

    it('should reject invalid font weight', () => {
      const invalidPdfStyling = {
        header: {
          fontWeight: 'invalid-weight'
        }
      };

      const result = validateSchema(pdfStylingSchema, invalidPdfStyling);
      expect(result.valid).toBe(false);
    });
  });

  describe('Word Styling Schema Validation', () => {
    const wordStylingSchema = loadSchema('styling/word-styling.json');

    it('should validate complete Word styling', () => {
      const validWordStyling = {
        document: {
          backgroundColor: '#ffffff',
          fontFamily: 'Arial',
          fontSize: 14,
          textColor: '#000000',
          lineSpacing: 1.0,
          paragraphSpacing: 0
        },
        header: {
          backgroundColor: '#f5f5f5',
          textColor: '#000000',
          fontWeight: 600,
          fontSize: 14,
          height: 40
        },
        table: {
          backgroundColor: '#ffffff',
          borderColor: '#d9d9d9',
          borderWidth: 1,
          fontFamily: 'Arial',
          fontSize: 12,
          textColor: '#000000'
        },
        tableHeader: {
          backgroundColor: '#f5f5f5',
          textColor: '#000000',
          fontWeight: 600,
          fontSize: 12,
          height: 30
        },
        paragraph: {
          backgroundColor: '#ffffff',
          textColor: '#000000',
          fontSize: 12,
          fontWeight: 400,
          alignment: 'left',
          lineSpacing: 1.0,
          paragraphSpacing: 0
        }
      };

      const result = validateSchema(wordStylingSchema, validWordStyling);
      expect(result.valid).toBe(true);
    });

    it('should reject invalid font weight range', () => {
      const invalidWordStyling = {
        header: {
          fontWeight: 50 // Should be between 100-900
        }
      };

      const result = validateSchema(wordStylingSchema, invalidWordStyling);
      expect(result.valid).toBe(false);
    });

    it('should reject invalid text alignment', () => {
      const invalidWordStyling = {
        paragraph: {
          alignment: 'invalid-alignment'
        }
      };

      const result = validateSchema(wordStylingSchema, invalidWordStyling);
      expect(result.valid).toBe(false);
    });
  });

  describe('Document Layout Schema Validation', () => {
    const documentLayoutSchema = loadSchema('document-layout.json');

    it('should validate complete document layout', () => {
      const validDocumentLayout = {
        schemaId: 'layout-001',
        tableName: 'Main Document Table',
        dimensions: {
          minRows: 1,
          maxRows: 1000,
          defaultRows: 10,
          columnCount: 5
        },
        sections: [{
          sectionType: 'header',
          order: 0,
          repeatOnPages: true
        }, {
          sectionType: 'table',
          order: 1,
          repeatOnPages: false
        }, {
          sectionType: 'footer',
          order: 2,
          repeatOnPages: true
        }]
      };

      const result = validateSchema(documentLayoutSchema, validDocumentLayout);
      expect(result.valid).toBe(true);
    });

    it('should reject document layout without required fields', () => {
      const invalidDocumentLayout = {
        // Missing both schemaId and tableName
      };

      const result = validateSchema(documentLayoutSchema, invalidDocumentLayout);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Missing required field: schemaId');
      expect(result.errors).toContain('Missing required field: tableName');
    });

    it('should reject invalid page size', () => {
      const invalidDocumentLayout = {
        schemaId: 'layout-001',
        tableName: 'Test Document',
        pageSetup: {
          pageSize: 'invalid-size',
          orientation: 'portrait'
        }
      };

      const result = validateSchema(documentLayoutSchema, invalidDocumentLayout);
      expect(result.valid).toBe(false);
    });

    it('should reject invalid section type', () => {
      const invalidDocumentLayout = {
        schemaId: 'layout-001',
        tableName: 'Test Document',
        sections: [{
          sectionType: 'invalid-section',
          order: 0
        }]
      };

      const result = validateSchema(documentLayoutSchema, invalidDocumentLayout);
      expect(result.valid).toBe(false);
    });
  });

  describe('Schema File Integrity', () => {
    it('should have valid JSON syntax in all schema files', () => {
      const schemaFiles = [
        'sections/chart-schema.json',
        'sections/header-footer-schema.json',
        'sections/image-schema.json',
        'sections/paragraph-schema.json',
        'sections/table-schema.json',
        'styling/pdf-styling.json',
        'styling/word-styling.json',
        'document-layout.json'
      ];

      schemaFiles.forEach(file => {
        expect(() => {
          const schema = loadSchema(file);
          expect(schema).toHaveProperty('$schema');
          expect(schema).toHaveProperty('title');
          expect(schema).toHaveProperty('type', 'object');
        }).not.toThrow();
      });
    });

    it('should have proper schema version in all files', () => {
      const schemaFiles = [
        'sections/chart-schema.json',
        'sections/header-footer-schema.json',
        'sections/image-schema.json',
        'sections/paragraph-schema.json',
        'sections/table-schema.json',
        'styling/pdf-styling.json',
        'styling/word-styling.json',
        'document-layout.json'
      ];

      schemaFiles.forEach(file => {
        const schema = loadSchema(file);
        expect(schema.$schema).toBe('https://json-schema.org/draft/2020-12/schema');
      });
    });
  });
});
