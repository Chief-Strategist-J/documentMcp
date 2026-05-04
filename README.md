# Document Management SDK

🚀 **A comprehensive TypeScript SDK for document management with REST API and PostgreSQL backend.** Supports generating both Word (.docx) and PDF documents with configurable layouts, sections, tables, paragraphs, images, charts, headers, footers, and advanced styling capabilities.

## 🌟 Key Features

- **📄 Multi-format Support**: Generate Word (.docx) and PDF documents
- **🔌 RESTful API**: Complete CRUD operations with advanced features
- **🗄️ PostgreSQL Backend**: Scalable database with JSON schema support
- **🎨 Dynamic Document Structure**: Configurable via APIs with JSON schemas
- **📊 Comprehensive Section Types**: Tables, paragraphs, headers, footers, images, charts
- **🎨 Advanced Styling**: Full control over document appearance
- **🐳 Docker Support**: Containerized deployment with Docker Compose
- **🔷 TypeScript**: Full type safety and IntelliSense support
- **✅ Schema Validation**: Built-in validation for all document schemas
- **🏗️ Clean Architecture**: Follows coupling taxonomy and DRY principles
- **🔄 Advanced Operations**: Duplicate, reorder, bulk operations, search
- **📦 Storage Options**: Local and Ceph cloud storage support


## Architecture

The SDK follows a clean architecture with clear separation of concerns:

```
src/
├── types/           # TypeScript type definitions
├── sdk/             # Client SDK for API interactions
├── api/             # REST API server and controllers
├── database/        # PostgreSQL database management
├── validation/      # Schema validation utilities
├── generators/      # Document generation logic
└── utils/           # Shared utilities
```

## Quick Start

### Using Docker Compose (Recommended)

1. Clone the repository and navigate to the project directory
2. Run the application with Docker Compose:

```bash
docker-compose up -d
```

3. The API will be available at `http://localhost:3000`
4. Health check: `http://localhost:3000/api/health`

### Manual Setup

1. Install dependencies:
```bash
npm install
```

2. Start PostgreSQL (ensure it's running on localhost:5432)

3. Build the application:
```bash
npm run build
```

4. Start the server:
```bash
npm start
```

For development:
```bash
npm run dev
```

## 📡 API Endpoints

### 📄 Document Operations
- `POST /api/documents` - Create new document
- `GET /api/documents` - List all documents
- `GET /api/documents/:id` - Get document by ID
- `PUT /api/documents/:id` - Update document
- `DELETE /api/documents/:id` - Delete document
- `POST /api/documents/:id/duplicate` - Duplicate document with all sections
- `GET /api/documents/search` - Search documents by name or type
- `POST /api/documents/:id/generate` - Generate document (Word/PDF)
- `GET /api/documents/:id/download` - Download generated document

### 📊 Section Operations
- `POST /api/sections` - Create new section
- `GET /api/documents/:documentId/sections` - Get document sections
- `GET /api/sections/:id` - Get section by ID
- `PUT /api/sections/:id` - Update section
- `DELETE /api/sections/:id` - Delete section
- `POST /api/sections/:id/duplicate` - Duplicate section
- `PUT /api/documents/:documentId/sections/reorder` - Reorder sections
- `PUT /api/sections/:id/data` - Update section data
- `POST /api/documents/:documentId/sections/bulk` - Bulk create sections
- `GET /api/sections/:sectionId/data` - Get section data

### 🔧 Utility Operations
- `POST /api/validation/validate` - Validate schema
- `GET /api/schemas/templates/:type` - Get schema templates
- `GET /api/generated-documents` - List generated documents
- `GET /api/storage/stats` - Get storage statistics
- `DELETE /api/generated-documents/:filename` - Delete generated document

### 🏥 Health & Status
- `GET /api/health` - Health check

## SDK Usage

### Client SDK Example

```typescript
import { DocumentClient } from './src/sdk/DocumentClient';

// Initialize client
const client = new DocumentClient('http://localhost:3000', 'your-api-key');

// Create a document
const document = await client.createDocument({
  name: 'My Report',
  type: 'word',
  layoutSchema: {
    schemaId: 'report-layout',
    schemaVersion: '1.0.0',
    tableName: 'Report Data',
    dimensions: {
      minRows: 1,
      maxRows: 100,
      defaultRows: 10,
      columnCount: 5
    }
  }
});

// Add a table section
const tableSection = await client.createSection({
  documentId: document.data!.id,
  sectionType: 'table',
  sectionOrder: 1,
  contentSchema: {
    schemaId: 'simple-table',
    columns: [
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
        id: 'age',
        name: 'Age',
        type: 'number',
        required: false,
        editable: true,
        sortable: true,
        filterable: true,
        width: 100,
        options: [],
        format: { kind: 'text', precision: 0 }
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
  }
});

// Generate Word document
const generatedDoc = await client.generateDocument(document.data!.id, 'word', {
  pageSize: 'A4',
  orientation: 'portrait',
  margins: { top: 72, right: 72, bottom: 72, left: 72 }
});

// Save the document
const fs = require('fs');
fs.writeFileSync('report.docx', Buffer.from(await generatedDoc.data!.arrayBuffer()));
```

## Schema Structure

The SDK uses JSON schemas to define document structure and styling:

### Document Layout Schema
- Basic document configuration
- Page setup (size, orientation, margins)
- Section ordering and types

### Section Schemas
- **Table Schema**: Column definitions, data types, validation, behavior
- **Paragraph Schema**: Text content, formatting, positioning
- **Header/Footer Schema**: Repeated content, styling, layout
- **Image Schema**: Image properties, positioning, effects
- **Chart Schema**: Chart types, data, styling, interactivity

### Styling Schemas
- **Word Styling**: Font families, colors, spacing, borders
- **PDF Styling**: Page layout, fonts, compression, metadata

## Configuration

### Environment Variables

- `DATABASE_URL`: PostgreSQL connection string
- `PORT`: API server port (default: 3000)
- `CORS_ORIGIN`: CORS allowed origins (default: "*")

### Database Configuration

The SDK automatically creates and manages the database schema:

```sql
-- Documents table
CREATE TABLE documents (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type ENUM('word', 'pdf') NOT NULL,
    layout_schema JSONB NOT NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

-- Sections table
CREATE TABLE sections (
    id UUID PRIMARY KEY,
    document_id UUID REFERENCES documents(id),
    section_type VARCHAR(20) NOT NULL,
    section_order INTEGER NOT NULL,
    content_schema JSONB NOT NULL,
    styling_schema JSONB NOT NULL,
    created_at TIMESTAMP
);

-- Section content table
CREATE TABLE section_content (
    id UUID PRIMARY KEY,
    section_id UUID REFERENCES sections(id),
    content_type VARCHAR(50) NOT NULL,
    content_data JSONB NOT NULL,
    created_at TIMESTAMP
);
```

## Development

### Scripts

- `npm run build`: Build TypeScript to JavaScript
- `npm run dev`: Development server with hot reload
- `npm start`: Production server
- `npm test`: Run tests
- `npm run test:unit`: Run unit tests only
- `npm run test:integration`: Run integration tests only
- `npm run test:e2e`: Run end-to-end tests only
- `npm run lint`: Run ESLint
- `npm run docker:build`: Build Docker image
- `npm run docker:up`: Start Docker Compose
- `npm run docker:down`: Stop Docker Compose

### Code Quality

The SDK follows strict coding standards:

- **DRY Principle**: No code duplication
- **Function Parameter Limit**: Maximum 3 parameters per function
- **Coupling Taxonomy**: Minimal coupling between components
- **TypeScript Strict Mode**: Full type safety
- **ESLint**: Code linting and formatting

## Testing

The SDK includes comprehensive test coverage:

```bash
# Run all tests
npm test

# Run specific test suites
npm run test:unit        # Unit tests
npm run test:integration # Integration tests
npm run test:e2e        # End-to-end tests

# Run tests with coverage
npm test -- --coverage
```

## Docker Deployment

### Production Deployment

1. Build the Docker image:
```bash
npm run docker:build
```

2. Start with Docker Compose:
```bash
npm run docker:up
```

3. Scale the API:
```bash
docker-compose up -d --scale api=3
```

### Docker Compose Services

- **postgres**: PostgreSQL 15 database
- **api**: Document Management API server
- **nginx**: Reverse proxy (optional)

## API Documentation

### Response Format

All API responses follow a consistent format:

```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
```

### Error Handling

The SDK provides comprehensive error handling:

- **400 Bad Request**: Invalid input data
- **404 Not Found**: Resource not found
- **500 Internal Server Error**: Server-side errors
- **Validation Errors**: Schema validation failures with detailed error messages

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes following the coding standards
4. Add tests for new functionality
5. Run the test suite
6. Submit a pull request

## License

This project is licensed under the ISC License.

## Support

For issues and questions:

1. Check the API documentation
2. Review the schema definitions in `/schemas/`
3. Check the test files for usage examples
4. Create an issue with detailed information

## Roadmap

- [ ] Advanced chart types and data visualization
- [ ] Real-time collaborative editing
- [ ] Document templates library
- [ ] Advanced PDF features (forms, annotations)
- [ ] Performance optimizations for large documents
- [ ] Plugin system for custom generators
