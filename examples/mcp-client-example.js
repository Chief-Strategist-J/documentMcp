#!/usr/bin/env node

/**
 * MCP Client Example
 * Demonstrates how to interact with the MCP server
 */

const { spawn } = require('child_process');
const path = require('path');

class MCPClient {
  constructor(serverPath) {
    this.serverPath = serverPath;
    this.server = null;
    this.requestId = 1;
    this.pendingRequests = new Map();
  }

  async start() {
    console.log('Starting MCP Server...');
    
    this.server = spawn('node', [this.serverPath], {
      stdio: ['pipe', 'pipe', 'inherit']
    });

    this.server.stdout.on('data', (data) => {
      try {
        const messages = data.toString().split('\n').filter(line => line.trim());
        messages.forEach(message => {
          if (message) {
            const response = JSON.parse(message);
            this.handleResponse(response);
          }
        });
      } catch (error) {
        console.error('Error parsing server response:', error);
      }
    });

    this.server.on('error', (error) => {
      console.error('Server error:', error);
    });

    this.server.on('close', (code) => {
      console.log(`Server exited with code ${code}`);
    });

    // Wait a moment for server to start
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  async sendRequest(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = this.requestId++;
      const request = {
        jsonrpc: '2.0',
        id,
        method,
        params
      };

      this.pendingRequests.set(id, { resolve, reject });

      const message = JSON.stringify(request) + '\n';
      this.server.stdin.write(message);

      // Timeout after 30 seconds
      setTimeout(() => {
        if (this.pendingRequests.has(id)) {
          this.pendingRequests.delete(id);
          reject(new Error('Request timeout'));
        }
      }, 30000);
    });
  }

  handleResponse(response) {
    if (response.id && this.pendingRequests.has(response.id)) {
      const { resolve, reject } = this.pendingRequests.get(response.id);
      this.pendingRequests.delete(response.id);

      if (response.error) {
        reject(new Error(response.error.message));
      } else {
        resolve(response.result);
      }
    }
  }

  async listTools() {
    return this.sendRequest('tools/list');
  }

  async callTool(name, args) {
    return this.sendRequest('tools/call', {
      name,
      arguments: args
    });
  }

  async stop() {
    if (this.server) {
      this.server.kill();
    }
  }
}

async function main() {
  const client = new MCPClient(path.join(__dirname, '../dist/mcp/server.js'));
  
  try {
    await client.start();

    console.log('=== MCP Server Example ===\n');

    // List available tools
    console.log('1. Listing available tools...');
    const tools = await client.listTools();
    console.log('Available tools:');
    tools.tools.forEach(tool => {
      console.log(`  - ${tool.name}: ${tool.description}`);
    });
    console.log();

    // Create a document
    console.log('2. Creating a document...');
    const createResult = await client.callTool('create_document', {
      name: 'Example Document',
      type: 'word',
      layoutSchema: {
        schemaId: 'example-layout',
        schemaVersion: '1.0',
        tableName: 'example_data',
        dimensions: {
          minRows: 1,
          maxRows: 100,
          defaultRows: 10,
          columnCount: 3
        }
      }
    });
    console.log('Document created:', JSON.stringify(createResult, null, 2));
    console.log();

    // Get schema template
    console.log('3. Getting table schema template...');
    const templateResult = await client.callTool('get_schema_template', {
      templateType: 'table'
    });
    console.log('Table template:', JSON.stringify(templateResult, null, 2));
    console.log();

    // Validate a schema
    console.log('4. Validating a schema...');
    const validationResult = await client.callTool('validate_schema', {
      schema: {
        schemaId: 'test-schema',
        schemaVersion: '1.0',
        tableName: 'test_table',
        dimensions: {
          minRows: 1,
          maxRows: 50,
          defaultRows: 5,
          columnCount: 2
        }
      },
      schemaType: 'document'
    });
    console.log('Validation result:', JSON.stringify(validationResult, null, 2));
    console.log();

    console.log('=== Example completed successfully ===');

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await client.stop();
  }
}

// Run the example
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { MCPClient };
