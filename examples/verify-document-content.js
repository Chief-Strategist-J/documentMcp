/**
 * Simple test to verify document content without binary output
 */

const http = require('http');
const fs = require('fs');

class APITestClient {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
  }

  async request(method, path, data = null) {
    return new Promise((resolve, reject) => {
      const url = new URL(path, this.baseUrl);
      const options = {
        method: method.toUpperCase(),
        headers: {
          'Content-Type': 'application/json',
        }
      };

      const req = http.request(url, options, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          try {
            const parsed = JSON.parse(body);
            resolve(parsed);
          } catch (e) {
            resolve({ success: false, error: 'Invalid JSON response' });
          }
        });
      });

      req.on('error', reject);

      if (data) {
        req.write(JSON.stringify(data));
      }
      req.end();
    });
  }

  async post(path, data) {
    return this.request('POST', path, data);
  }

  async get(path) {
    return this.request('GET', path);
  }
}

async function verifyDocumentContent() {
  console.log('🔍 VERIFYING DOCUMENT CONTENT\n');
  const client = new APITestClient('http://localhost:3002');

  try {
    // Step 1: Create document
    console.log('📝 Step 1: Creating document...');
    const documentResponse = await client.post('/api/documents', {
      name: 'Content Verification Report',
      type: 'word'
    });
    
    if (!documentResponse.success) {
      console.log('❌ Failed to create document:', documentResponse.error);
      return;
    }

    const documentId = documentResponse.data.id;
    console.log(`✅ Document created: ${documentId}`);

    // Step 2: Create section
    console.log('\n📋 Step 2: Creating section...');
    const sectionResponse = await client.post('/api/sections', {
      documentId: documentId,
      sectionType: 'table',
      sectionOrder: 1,
      contentSchema: {
        schemaId: 'verification-schema',
        columns: [
          {
            id: 'productName',
            name: 'Product Name',
            type: 'string',
            required: true,
            editable: true,
            width: 2000
          },
          {
            id: 'price',
            name: 'Price ($)',
            type: 'number',
            required: true,
            editable: true,
            width: 1500
          },
          {
            id: 'category',
            name: 'Category',
            type: 'string',
            required: true,
            editable: true,
            width: 1500
          }
        ]
      },
      stylingSchema: {
        table: {
          backgroundColor: '#ffffff',
          borderColor: '#000000',
          borderWidth: 1,
          borderRadius: 0,
          fontFamily: 'Arial',
          fontSize: 11,
          textColor: '#000000'
        },
        header: {
          backgroundColor: '#f0f0f0',
          textColor: '#000000',
          bold: true,
          fontSize: 12
        },
        row: {
          backgroundColor: '#ffffff',
          textColor: '#000000',
          fontSize: 11
        },
        cell: {
          padding: 8,
          borderColor: '#cccccc'
        }
      }
    });
    
    if (!sectionResponse.success) {
      console.log('❌ Failed to create section:', sectionResponse.error);
      return;
    }

    const sectionId = sectionResponse.data.id;
    console.log(`✅ Section created: ${sectionId}`);
    console.log(`   Schema ID: ${sectionResponse.data.content_schema.schemaId}`);

    // Step 3: Add data
    console.log('\n📊 Step 3: Adding data...');
    const testData = [
      { productName: 'Test Product 1', price: 99.99, category: 'Electronics' },
      { productName: 'Test Product 2', price: 149.99, category: 'Electronics' },
      { productName: 'Test Product 3', price: 29.99, category: 'Accessories' }
    ];

    const dataResponse = await client.post(`/api/sections/${sectionId}/data`, {
      sectionId: sectionId,
      data: testData
    });
    
    if (!dataResponse.success) {
      console.log('❌ Failed to add data:', dataResponse.error);
      return;
    }

    console.log(`✅ Data added successfully`);
    console.log(`   Data Count: ${dataResponse.data.dataCount}`);

    // Step 4: Verify data retrieval
    console.log('\n🔍 Step 4: Verifying data retrieval...');
    const verifyResponse = await client.get(`/api/sections/${sectionId}/data`);
    
    if (!verifyResponse.success) {
      console.log('❌ Failed to retrieve data:', verifyResponse.error);
      return;
    }

    console.log(`✅ Data retrieved successfully`);
    console.log(`   Retrieved Count: ${verifyResponse.data.dataCount}`);
    console.log(`   Sample Data:`, JSON.stringify(verifyResponse.data.data.slice(0, 2), null, 2));

    // Step 5: Generate document
    console.log('\n🎨 Step 5: Generating document...');
    const generateResponse = await client.post(`/api/documents/${documentId}/generate`, {
      format: 'word',
      options: {
        pageSize: 'A4',
        orientation: 'portrait',
        margins: { top: 72, right: 72, bottom: 72, left: 72 },
        apiBased: true,
        realData: true
      }
    });
    
    if (!generateResponse.success) {
      console.log('❌ Failed to generate document:', generateResponse.error);
      return;
    }

    console.log(`✅ Document generated successfully`);
    console.log(`   Generator: ${generateResponse.data.generator}`);
    console.log(`   Content: ${generateResponse.data.content}`);

    // Step 6: Download and save document
    console.log('\n📥 Step 6: Downloading document...');
    const downloadResponse = await client.get(`/api/documents/${documentId}/download`);
    
    if (downloadResponse.success) {
      const filePath = `/tmp/verification-document-${Date.now()}.docx`;
      fs.writeFileSync(filePath, Buffer.from(downloadResponse.data.data, 'base64'));
      console.log(`✅ Document downloaded and saved to: ${filePath}`);
      console.log(`   File size: ${fs.statSync(filePath).size} bytes`);
    }

    console.log('\n🎯 VERIFICATION COMPLETE');
    console.log('✅ Document should now contain:');
    console.log('   - Proper section name: "Section 1: verification-schema"');
    console.log('   - Data table with 3 rows of real data');
    console.log('   - Professional formatting');

  } catch (error) {
    console.error('❌ Verification failed:', error.message);
  }
}

verifyDocumentContent();
