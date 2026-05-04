/**
 * Simple document generation test that bypasses validation issues
 * Tests actual document generation and file creation
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

/**
 * Simple HTTP client
 */
class SimpleClient {
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
          'Authorization': 'Bearer test-api-key'
        }
      };

      const req = http.request(url, options, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          try {
            const result = body ? JSON.parse(body) : {};
            resolve({
              success: res.statusCode < 400,
              status: res.statusCode,
              data: result,
              headers: res.headers,
              rawBody: body
            });
          } catch (error) {
            resolve({
              success: false,
              status: res.statusCode,
              error: 'Invalid JSON response',
              rawBody: body
            });
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

  async get(path) {
    return this.request('GET', path);
  }

  async post(path, data) {
    return this.request('POST', path, data);
  }
}

/**
 * Simple document generation test
 */
async function testDocumentGeneration() {
  console.log('🚀 Simple Document Generation Test\n');
  console.log('=' .repeat(50));

  const client = new SimpleClient('http://localhost:3002');
  let documentId = null;

  try {
    // Step 1: Create minimal document (no layout schema to bypass validation)
    console.log('📝 Step 1: Creating minimal document...');
    const minimalDoc = {
      name: 'Simple Test Document',
      type: 'word'
    };

    const createResponse = await client.post('/api/documents', minimalDoc);
    
    if (createResponse.success) {
      documentId = createResponse.data.data.id;
      console.log(`✅ Document created: ${documentId}`);
    } else {
      console.log(`❌ Failed to create document: ${createResponse.rawBody}`);
      return;
    }

    // Step 2: Generate Word document
    console.log('\n🎨 Step 2: Generating Word document...');
    const wordResponse = await client.post(`/api/documents/${documentId}/generate`, {
      format: 'word',
      options: {
        pageSize: 'A4',
        orientation: 'portrait',
        margins: { top: 72, right: 72, bottom: 72, left: 72 }
      }
    });
    
    if (wordResponse.success) {
      console.log(`✅ Word document generated!`);
      console.log(`   File Path: ${wordResponse.data.data.filePath}`);
      console.log(`   Download URL: ${wordResponse.data.data.downloadUrl}`);
    } else {
      console.log(`❌ Failed to generate Word document: ${wordResponse.rawBody}`);
    }

    // Step 3: Generate PDF document
    console.log('\n📄 Step 3: Generating PDF document...');
    const pdfResponse = await client.post(`/api/documents/${documentId}/generate`, {
      format: 'pdf',
      options: {
        pageSize: 'A4',
        orientation: 'portrait',
        margins: { top: 72, right: 72, bottom: 72, left: 72 }
      }
    });
    
    if (pdfResponse.success) {
      console.log(`✅ PDF document generated!`);
      console.log(`   File Path: ${pdfResponse.data.data.filePath}`);
      console.log(`   Download URL: ${pdfResponse.data.data.downloadUrl}`);
    } else {
      console.log(`❌ Failed to generate PDF document: ${pdfResponse.rawBody}`);
    }

    // Step 4: Check storage
    console.log('\n💾 Step 4: Checking storage...');
    const storageResponse = await client.get('/api/storage/stats');
    
    if (storageResponse.success) {
      const stats = storageResponse.data.data;
      console.log(`✅ Storage stats:`);
      console.log(`   Total Documents: ${stats.totalDocuments}`);
      console.log(`   Total Size: ${stats.totalSizeHuman}`);
      console.log(`   Word Documents: ${stats.formatCounts.word}`);
      console.log(`   PDF Documents: ${stats.formatCounts.pdf}`);
    } else {
      console.log(`❌ Failed to get storage stats: ${storageResponse.rawBody}`);
    }

    // Step 5: List generated documents
    console.log('\n📋 Step 5: Listing generated documents...');
    const listResponse = await client.get('/api/generated-documents');
    
    if (listResponse.success) {
      const documents = listResponse.data.data.documents;
      console.log(`✅ Generated documents (${documents.length}):`);
      documents.forEach(doc => {
        console.log(`   📄 ${doc.documentId} - ${doc.format} (${doc.createdAt})`);
      });
    } else {
      console.log(`❌ Failed to list documents: ${listResponse.rawBody}`);
    }

    // Step 6: Check file system
    console.log('\n📁 Step 6: Checking file system...');
    const storageDir = './generated-documents';
    try {
      const files = fs.readdirSync(storageDir);
      console.log(`✅ Files in storage directory (${files.length}):`);
      files.forEach(file => {
        const filePath = path.join(storageDir, file);
        const stats = fs.statSync(filePath);
        if (stats.isFile()) {
          console.log(`   📄 ${file} (${stats.size} bytes)`);
        }
      });
    } catch (error) {
      console.log(`❌ Error checking file system: ${error.message}`);
    }

    // Step 7: Test download
    if (wordResponse.success) {
      console.log('\n⬇️  Step 7: Testing document download...');
      const downloadResponse = await client.get(`/api/documents/${documentId}/download?format=word`);
      
      if (downloadResponse.success) {
        console.log(`✅ Word document download successful!`);
        console.log(`   Content-Type: ${downloadResponse.headers['content-type']}`);
        console.log(`   Content-Disposition: ${downloadResponse.headers['content-disposition']}`);
        console.log(`   Content-Length: ${downloadResponse.headers['content-length']} bytes`);
      } else {
        console.log(`❌ Failed to download: ${downloadResponse.rawBody}`);
      }
    }

  } catch (error) {
    console.log(`❌ Test failed: ${error.message}`);
  }

  console.log('\n' + '=' .repeat(50));
  console.log('🎯 SIMPLE GENERATION TEST COMPLETE');
  console.log('=' .repeat(50));
}

// Run the test
if (require.main === module) {
  testDocumentGeneration().catch(console.error);
}

module.exports = { testDocumentGeneration };
