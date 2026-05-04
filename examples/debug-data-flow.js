/**
 * Debug script to check data flow without binary output
 */

const http = require('http');

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

async function debugDataFlow() {
  console.log('🔍 DEBUG: Data Flow Analysis\n');
  const client = new APITestClient('http://localhost:3003');

  try {
    // Step 1: Create document
    console.log('📝 Step 1: Creating document...');
    const documentResponse = await client.post('/api/documents', {
      name: 'Debug Data Report',
      type: 'word'
    });
    
    if (!documentResponse.success) {
      console.log('❌ Failed to create document:', documentResponse.error);
      return;
    }

    const documentId = documentResponse.data.data.id;
    console.log(`✅ Document created: ${documentId}`);

    // Step 2: Create section
    console.log('\n📋 Step 2: Creating section...');
    const sectionResponse = await client.post('/api/sections', {
      documentId: documentId,
      sectionType: 'table',
      sectionOrder: 1,
      contentSchema: {
        schemaId: 'debug-schema',
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
          }
        ]
      }
    });
    
    if (!sectionResponse.success) {
      console.log('❌ Failed to create section:', sectionResponse.error);
      return;
    }

    const sectionId = sectionResponse.data.data.id;
    console.log(`✅ Section created: ${sectionId}`);

    // Step 3: Add data
    console.log('\n📊 Step 3: Adding data...');
    const testData = [
      { productName: 'Test Product 1', price: 99.99 },
      { productName: 'Test Product 2', price: 149.99 }
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

    // Step 5: Get document sections to see what the generator receives
    console.log('\n📄 Step 5: Checking document sections...');
    const sectionsResponse = await client.get(`/api/documents/${documentId}/sections`);
    
    if (!sectionsResponse.success) {
      console.log('❌ Failed to get sections:', sectionsResponse.error);
      return;
    }

    console.log(`✅ Sections retrieved successfully`);
    console.log(`   Sections Count: ${sectionsResponse.data.data.length}`);
    console.log(`   Section Details:`, JSON.stringify(sectionsResponse.data.data[0], null, 2));

    console.log('\n🎯 DEBUG COMPLETE: Check the server logs for APIDocumentGenerator debug output');

  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  }
}

debugDataFlow();
