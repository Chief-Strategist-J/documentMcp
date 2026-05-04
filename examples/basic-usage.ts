import { DocumentClient } from '../src/sdk/DocumentClient';
import { CreateDocumentRequest, CreateSectionRequest, DocumentType } from '../src/types';

/**
 * Basic usage example for Document Management SDK
 * Demonstrates creating documents, sections, and generating files
 */

async function basicUsageExample(): Promise<void> {
  console.log('🚀 Starting Document Management SDK Example...\n');

  // Initialize the client
  const client = new DocumentClient('http://localhost:3000', 'demo-api-key');

  try {
    // Step 1: Create a document
    console.log('📄 Creating document...');
    const documentRequest: CreateDocumentRequest = {
      name: 'Sample Report',
      type: 'word',
      layoutSchema: {
        schemaId: 'report-layout',
        schemaVersion: '1.0.0',
        tableName: 'Report Data',
        dimensions: {
          minRows: 1,
          maxRows: 100,
          defaultRows: 10,
          columnCount: 3
        }
      }
    };

    const documentResponse = await client.createDocument(documentRequest);
    
    if (!documentResponse.success) {
      console.error('❌ Failed to create document:', documentResponse.error);
      return;
    }

    const documentId = documentResponse.data!.id;
    console.log('✅ Document created with ID:', documentId);

    // Step 2: Add a table section
    console.log('\n📊 Adding table section...');
    const tableSectionRequest: CreateSectionRequest = {
      documentId,
      sectionType: 'table',
      sectionOrder: 1,
      contentSchema: {
        schemaId: 'sample-table',
        columns: [
          {
            id: 'name',
            name: 'Name',
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
            id: 'age',
            name: 'Age',
            type: 'number',
            required: true,
            editable: true,
            sortable: true,
            filterable: true,
            width: 80,
            options: [],
            format: { kind: 'number', precision: 0 }
          },
          {
            id: 'department',
            name: 'Department',
            type: 'string',
            required: true,
            editable: true,
            sortable: true,
            filterable: true,
            width: 120,
            options: ['Engineering', 'Sales', 'Marketing', 'HR'],
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
          name: { minLength: 2, maxLength: 50 },
          age: { min: 18, max: 65 }
        },
        behaviorSchema: {
          sorting: { enabled: true, multiColumn: true },
          filtering: { enabled: true },
          pagination: { enabled: true, pageSize: 25 },
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
        header: {
          backgroundColor: '#f5f5f5',
          textColor: '#000000',
          fontSize: 12,
          fontWeight: 600
        },
        row: {
          height: 36,
          backgroundColor: '#ffffff',
          alternateBackgroundColor: '#fafafa'
        },
        cell: {
          paddingX: 8,
          paddingY: 4,
          borderColor: '#e0e0e0'
        },
        columnOverrides: {}
      }
    };

    const tableResponse = await client.createSection(tableSectionRequest);
    
    if (!tableResponse.success) {
      console.error('❌ Failed to create table section:', tableResponse.error);
      return;
    }

    console.log('✅ Table section created');

    // Step 3: Add a paragraph section
    console.log('\n📝 Adding paragraph section...');
    const paragraphSectionRequest: CreateSectionRequest = {
      documentId,
      sectionType: 'paragraph',
      sectionOrder: 2,
      contentSchema: {
        schemaId: 'sample-paragraph',
        content: 'This is a sample paragraph for our report. It demonstrates the document generation capabilities of the SDK.',
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
        }
      },
      stylingSchema: {
        paragraph: {
          fontFamily: 'Arial',
          fontSize: 14,
          textColor: '#333333',
          fontWeight: 'normal',
          fontStyle: 'italic',
          textAlign: 'left'
        },
        columnOverrides: {}
      }
    };

    const paragraphResponse = await client.createSection(paragraphSectionRequest);
    
    if (!paragraphResponse.success) {
      console.error('❌ Failed to create paragraph section:', paragraphResponse.error);
      return;
    }

    console.log('✅ Paragraph section created');

    // Step 4: Get document sections
    console.log('\n📋 Retrieving document sections...');
    const sectionsResponse = await client.getDocumentSections(documentId);
    
    if (!sectionsResponse.success) {
      console.error('❌ Failed to get sections:', sectionsResponse.error);
      return;
    }

    console.log('✅ Document sections:', sectionsResponse.data!.length);

    // Step 5: Generate Word document
    console.log('\n📦 Generating Word document...');
    const wordResponse = await client.generateDocument(documentId, 'word', {
      pageSize: 'A4',
      orientation: 'portrait',
      margins: { top: 72, right: 72, bottom: 72, left: 72 }
    });

    if (!wordResponse.success) {
      console.error('❌ Failed to generate Word document:', wordResponse.error);
      return;
    }

    // Save the Word document
    const fs = require('fs');
    const wordBuffer = Buffer.from(await wordResponse.data!.arrayBuffer());
    fs.writeFileSync('sample-report.docx', wordBuffer);
    console.log('✅ Word document saved as sample-report.docx');

    // Step 6: Generate PDF document
    console.log('\n📦 Generating PDF document...');
    const pdfResponse = await client.generateDocument(documentId, 'pdf', {
      pageSize: 'A4',
      orientation: 'portrait',
      margins: { top: 72, right: 72, bottom: 72, left: 72 }
    });

    if (!pdfResponse.success) {
      console.error('❌ Failed to generate PDF document:', pdfResponse.error);
      return;
    }

    // Save the PDF document
    const pdfBuffer = Buffer.from(await pdfResponse.data!.arrayBuffer());
    fs.writeFileSync('sample-report.pdf', pdfBuffer);
    console.log('✅ PDF document saved as sample-report.pdf');

    // Step 7: List all documents
    console.log('\n📚 Listing all documents...');
    const listResponse = await client.listDocuments(10, 0);
    
    if (listResponse.success) {
      console.log('✅ Found', listResponse.data!.length, 'documents');
      listResponse.data!.forEach((doc: any) => {
        console.log(`   - ${doc.name} (${doc.type})`);
      });
    }

    console.log('\n🎉 Example completed successfully!');
    console.log('📁 Generated files: sample-report.docx, sample-report.pdf');

  } catch (error) {
    console.error('❌ Error during example execution:', error);
  }
}

/**
 * Run the example if this file is executed directly
 */
if (require.main === module) {
  basicUsageExample().catch(error => {
    console.error('❌ Example failed:', error);
    process.exit(1);
  });
}

export { basicUsageExample };
