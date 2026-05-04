# MCP Server Documentation

## Overview

The Model Context Protocol (MCP) server provides a standardized interface for document management operations through the Document Management SDK. It enables AI assistants and other tools to interact with documents, sections, schemas, and generation capabilities through a well-defined protocol.

## Features

- **Document Management**: Create, read, update, delete, and list documents
- **Section Management**: Create and retrieve document sections
- **Document Generation**: Generate documents in Word or PDF format
- **Schema Validation**: Validate document and section schemas
- **Schema Templates**: Get predefined schema templates
- **Error Handling**: Comprehensive error handling and reporting

## Installation & Setup

### Prerequisites

- Node.js 18+ 
- Document Management SDK API server running
- Environment variables configured

### Environment Variables

```bash
# API Configuration
BASE_URL=http://localhost:3000          # API base URL
API_KEY=your-api-key-here              # Optional API key for authentication

# Development
NODE_ENV=development
```

### Building and Running

```bash
# Build the MCP server
npm run mcp:build

# Start the MCP server
npm run mcp:start

# Or run directly with TypeScript
npx ts-node mcp/server.ts
```

## Available Tools

### Document Operations

#### create_document
Creates a new document with specified configuration.

**Parameters:**
- `name` (string, required): Document name
- `type` (string, required): Document type - 'word' or 'pdf'
- `layoutSchema` (object, optional): Document layout schema configuration

**Example:**
```json
{
  "name": "My Report",
  "type": "word",
  "layoutSchema": {
    "schemaId": "report-layout",
    "schemaVersion": "1.0",
    "tableName": "report_data",
    "dimensions": {
      "minRows": 1,
      "maxRows": 100,
      "defaultRows": 10,
      "columnCount": 5
    }
  }
}
```

#### get_document
Retrieves a document by ID.

**Parameters:**
- `documentId` (string, required): Document ID

#### list_documents
Lists all documents with pagination.

**Parameters:**
- `limit` (number, optional): Maximum number of documents (default: 100)
- `offset` (number, optional): Number of documents to skip (default: 0)

#### update_document
Updates an existing document.

**Parameters:**
- `documentId` (string, required): Document ID
- `name` (string, optional): Updated document name
- `layoutSchema` (object, optional): Updated layout schema

#### delete_document
Deletes a document.

**Parameters:**
- `documentId` (string, required): Document ID

### Section Operations

#### create_section
Creates a new section in a document.

**Parameters:**
- `documentId` (string, required): Document ID
- `sectionType` (string, required): Section type - 'table', 'paragraph', 'header', 'footer', 'image', 'chart'
- `sectionOrder` (number, required): Section order in document
- `contentSchema` (object, optional): Section content schema
- `stylingSchema` (object, optional): Section styling schema

#### get_document_sections
Retrieves all sections for a document.

**Parameters:**
- `documentId` (string, required): Document ID

### Document Generation

#### generate_document
Generates a document in specified format.

**Parameters:**
- `documentId` (string, required): Document ID
- `format` (string, required): Output format - 'word' or 'pdf'
- `options` (object, optional): Generation options (pageSize, orientation, margins)

**Example:**
```json
{
  "documentId": "doc-123",
  "format": "word",
  "options": {
    "pageSize": "A4",
    "orientation": "portrait",
    "margins": {
      "top": 20,
      "right": 20,
      "bottom": 20,
      "left": 20
    }
  }
}
```

### Schema Operations

#### validate_schema
Validates a document or section schema.

**Parameters:**
- `schema` (object, required): Schema to validate
- `schemaType` (string, required): Type of schema - 'document', 'section', 'styling'

#### get_schema_template
Gets schema template for document or section type.

**Parameters:**
- `templateType` (string, required): Template type - 'document', 'table', 'paragraph', 'header', 'footer', 'image', 'chart', 'word-styling', 'pdf-styling'

## Usage Examples

### Basic Document Workflow

```typescript
// Create a document
const createResult = await mcpServer.call('create_document', {
  name: 'Project Report',
  type: 'word',
  layoutSchema: {
    schemaId: 'project-report',
    schemaVersion: '1.0',
    tableName: 'project_data',
    dimensions: {
      minRows: 1,
      maxRows: 50,
      defaultRows: 10,
      columnCount: 4
    }
  }
});

// Add a table section
const sectionResult = await mcpServer.call('create_section', {
  documentId: createResult.data.id,
  sectionType: 'table',
  sectionOrder: 1,
  contentSchema: {
    schemaId: 'project-table',
    columns: [
      {
        id: 'task',
        name: 'Task',
        type: 'string',
        required: true,
        editable: true,
        sortable: true,
        filterable: true,
        width: 200,
        options: [],
        format: { kind: 'text', precision: 0 }
      }
    ],
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

// Generate the document
const generateResult = await mcpServer.call('generate_document', {
  documentId: createResult.data.id,
  format: 'word',
  options: {
    pageSize: 'A4',
    orientation: 'portrait'
  }
});
```

### Schema Validation

```typescript
// Validate a document schema
const validationResult = await mcpServer.call('validate_schema', {
  schema: {
    schemaId: 'test-schema',
    schemaVersion: '1.0',
    tableName: 'test_table',
    dimensions: {
      minRows: 1,
      maxRows: 100,
      defaultRows: 10,
      columnCount: 5
    }
  },
  schemaType: 'document'
});

if (validationResult.data.valid) {
  console.log('Schema is valid');
} else {
  console.log('Schema errors:', validationResult.data.errors);
}
```

### Getting Schema Templates

```typescript
// Get table template
const templateResult = await mcpServer.call('get_schema_template', {
  templateType: 'table'
});

console.log('Available table templates:', templateResult.data);
```

## Error Handling

The MCP server provides comprehensive error handling:

### Common Error Types

- **InvalidParams**: Missing or invalid parameters
- **MethodNotFound**: Unknown tool requested
- **InternalError**: Server-side errors (network, API errors)

### Error Response Format

```json
{
  "error": {
    "code": -32603,
    "message": "Tool execution failed: Document not found"
  }
}
```

### Best Practices

1. Always validate parameters before making requests
2. Check API responses for success status
3. Handle network errors gracefully
4. Use appropriate error messages for debugging

## Configuration

### Server Configuration

The MCP server can be configured through environment variables:

```bash
# Production
BASE_URL=https://api.yourdomain.com
API_KEY=prod-api-key

# Development
BASE_URL=http://localhost:3000
API_KEY=dev-api-key
```

### Docker Configuration

When running in Docker, ensure proper environment variable configuration:

```yaml
environment:
  - BASE_URL=http://api-server:3000
  - API_KEY=${API_KEY}
```

## Testing

The MCP server includes comprehensive test coverage:

```bash
# Run MCP-specific tests
npm run test -- --testPathPattern=mcp

# Run integration tests
npm run test:integration

# Run all tests
npm run test
```

### Test Structure

- **Unit Tests**: Individual tool functionality
- **Integration Tests**: End-to-end workflows
- **Error Handling Tests**: Various error scenarios

## Development

### Adding New Tools

1. Add tool definition to `ListToolsRequestSchema` handler
2. Implement tool logic in `CallToolRequestSchema` handler
3. Add corresponding tests
4. Update documentation

### Code Style

- Follow TypeScript best practices
- Use proper error handling
- Include comprehensive tests
- Document all public interfaces

## Troubleshooting

### Common Issues

1. **Connection Errors**: Check BASE_URL and API_KEY
2. **Timeout Issues**: Verify API server is running
3. **Schema Validation**: Ensure schema structure is correct

### Debug Mode

Enable debug logging:

```bash
DEBUG=mcp:* npm run mcp:start
```

## Support

For issues and questions:

1. Check the troubleshooting section
2. Review test cases for usage examples
3. Check API documentation for endpoint details
4. Open an issue with detailed error information

## Version History

- **v1.0.0**: Initial release with full document management capabilities
- **v1.1.0**: Added schema validation and templates
- **v1.2.0**: Enhanced error handling and logging
