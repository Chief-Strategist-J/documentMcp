# Document Management SDK - MCP Server

A Model Context Protocol (MCP) server that provides document management capabilities through a standardized interface for AI assistants and tools.

## Quick Start

### 1. Installation

```bash
# Clone the repository
git clone <repository-url>
cd document-management-sdk

# Install dependencies
npm install

# Build the project
npm run build

# Build the MCP server
npm run mcp:build
```

### 2. Environment Setup

Create a `.env` file:

```bash
# API Configuration
BASE_URL=http://localhost:3000
API_KEY=your-api-key-here

# Optional
NODE_ENV=development
```

### 3. Start the MCP Server

```bash
# Development mode
npm run mcp:dev

# Production mode
npm run mcp:start
```

### 4. Docker Setup

```bash
# Build and run with Docker Compose
docker-compose up -d

# Or build MCP server separately
npm run mcp:docker:build
npm run mcp:docker:run
```

## Available Tools

The MCP server provides the following tools:

### Document Management
- `create_document` - Create new documents
- `get_document` - Retrieve document by ID
- `list_documents` - List all documents with pagination
- `update_document` - Update existing documents
- `delete_document` - Delete documents

### Section Management
- `create_section` - Create document sections
- `get_document_sections` - Get all sections for a document

### Document Generation
- `generate_document` - Generate documents in Word/PDF format

### Schema Operations
- `validate_schema` - Validate document/section schemas
- `get_schema_template` - Get predefined schema templates

## Usage Examples

### Basic Document Creation

```json
{
  "name": "create_document",
  "arguments": {
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
}
```

### Adding a Table Section

```json
{
  "name": "create_section",
  "arguments": {
    "documentId": "doc-123",
    "sectionType": "table",
    "sectionOrder": 1,
    "contentSchema": {
      "schemaId": "project-table",
      "columns": [
        {
          "id": "task",
          "name": "Task",
          "type": "string",
          "required": true,
          "editable": true,
          "sortable": true,
          "filterable": true,
          "width": 200,
          "options": [],
          "format": { "kind": "text", "precision": 0 }
        }
      ],
      "rows": {
        "rowIdStrategy": "auto",
        "allowAdd": true,
        "allowDelete": true,
        "allowReorder": true,
        "showRowNumbers": true
      },
      "validationSchema": {},
      "behaviorSchema": {
        "sorting": { "enabled": true, "multiColumn": false },
        "filtering": { "enabled": true },
        "pagination": { "enabled": true, "pageSize": 10 },
        "editing": { "enabled": true, "mode": "cell" }
      }
    },
    "stylingSchema": {
      "table": {
        "backgroundColor": "#ffffff",
        "borderColor": "#000000",
        "borderWidth": 1,
        "borderRadius": 0,
        "fontFamily": "Arial",
        "fontSize": 12,
        "textColor": "#000000"
      },
      "header": {
        "backgroundColor": "#f0f0f0",
        "textColor": "#000000",
        "fontWeight": 700,
        "fontSize": 14,
        "height": 40
      },
      "row": {
        "height": 30,
        "backgroundColor": "#ffffff",
        "alternateBackgroundColor": "#f9f9f9",
        "hoverBackgroundColor": "#e8e8e8",
        "selectedBackgroundColor": "#d0d0d0"
      },
      "cell": {
        "paddingX": 8,
        "paddingY": 4,
        "borderColor": "#cccccc",
        "borderWidth": 1,
        "textAlign": "left"
      },
      "columnOverrides": {}
    }
  }
}
```

### Document Generation

```json
{
  "name": "generate_document",
  "arguments": {
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
}
```

## Testing

```bash
# Run MCP-specific tests
npm run mcp:test

# Run all tests
npm run test

# Run integration tests
npm run test:integration
```

## Development

### Project Structure

```
mcp/
├── server.ts              # Main MCP server implementation
├── tsconfig.json          # TypeScript configuration
└── package.json           # MCP-specific dependencies

tests/mcp/
├── MCPServer.test.ts           # Unit tests
└── MCPServer.integration.test.ts # Integration tests

docs/
└── MCP-Server.md          # Detailed documentation

examples/
└── mcp-client-example.js  # Example client implementation

Dockerfile.mcp             # Docker configuration for MCP server
```

### Adding New Tools

1. Add tool definition to `ListToolsRequestSchema` handler in `mcp/server.ts`
2. Implement tool logic in `CallToolRequestSchema` handler
3. Add corresponding tests in `tests/mcp/`
4. Update documentation in `docs/MCP-Server.md`

### Building and Deployment

```bash
# Development build
npm run mcp:build

# Production build with Docker
docker build -f Dockerfile.mcp -t document-management-mcp .

# Run with Docker Compose
docker-compose up mcp
```

## Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `BASE_URL` | `http://localhost:3000` | Document Management API URL |
| `API_KEY` | `""` | Optional API key for authentication |
| `NODE_ENV` | `development` | Environment mode |

### Docker Configuration

The MCP server can be configured in Docker using environment variables:

```yaml
environment:
  - BASE_URL=http://api:3000
  - API_KEY=${API_KEY}
  - NODE_ENV=production
```

## Troubleshooting

### Common Issues

1. **Connection Errors**: Verify `BASE_URL` and API server is running
2. **Authentication Errors**: Check `API_KEY` configuration
3. **Build Errors**: Ensure all dependencies are installed

### Debug Mode

Enable debug logging:

```bash
DEBUG=mcp:* npm run mcp:start
```

### Health Check

The MCP server includes a health check that can be used to verify it's running correctly:

```bash
# Check if server is responding
echo '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}' | node dist/mcp/mcp/server.js
```

## Integration with AI Assistants

The MCP server follows the Model Context Protocol specification and can be integrated with:

- **Claude Desktop**: Add to MCP configuration
- **Custom AI Tools**: Use the provided client example
- **Development Environments**: Integrate with IDE extensions

### Claude Desktop Configuration

```json
{
  "mcpServers": {
    "document-management": {
      "command": "node",
      "args": ["/path/to/document-management-sdk/dist/mcp/mcp/server.js"],
      "env": {
        "BASE_URL": "http://localhost:3000",
        "API_KEY": "your-api-key"
      }
    }
  }
}
```

## API Reference

For detailed API documentation, see:
- [MCP Server Documentation](docs/MCP-Server.md)
- [API Documentation](docs/API.md)
- [Schema Documentation](docs/Schemas.md)

## Support

For issues and questions:

1. Check the troubleshooting section
2. Review test cases for usage examples
3. Check API documentation
4. Open an issue with detailed error information

## License

This project is licensed under the ISC License.
