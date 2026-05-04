# 📡 API Documentation

## Overview

The Document Management SDK provides a comprehensive RESTful API for document creation, management, and generation. All endpoints follow REST conventions and return consistent JSON responses.

## 🔗 Base URL

```
Development: http://localhost:3000
Production: https://your-domain.com/api
```

## 📋 Response Format

All API responses follow a consistent format:

```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
```

### Success Response Example
```json
{
  "success": true,
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "My Document",
    "type": "word",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Error Response Example
```json
{
  "success": false,
  "error": "Document not found",
  "message": "The requested document could not be found"
}
```

## 📄 Document Operations

### Create Document
```http
POST /api/documents
```

**Request Body:**
```json
{
  "name": "My Report",
  "type": "word",
  "layoutSchema": {
    "schemaId": "layout-001",
    "schemaVersion": "1.0.0",
    "tableName": "Report Data",
    "dimensions": {
      "minRows": 1,
      "maxRows": 100,
      "defaultRows": 10,
      "columnCount": 5
    },
    "pageSetup": {
      "pageSize": "A4",
      "orientation": "portrait",
      "margins": {
        "top": 72,
        "right": 72,
        "bottom": 72,
        "left": 72
      }
    }
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "doc-uuid",
    "name": "My Report",
    "type": "word",
    "layoutSchema": { ... },
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### List Documents
```http
GET /api/documents
```

**Query Parameters:**
- `limit` (optional): Number of documents to return (default: 50)
- `offset` (optional): Number of documents to skip (default: 0)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "doc-uuid-1",
      "name": "Document 1",
      "type": "word",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 100,
    "limit": 50,
    "offset": 0
  }
}
```

### Get Document
```http
GET /api/documents/:id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "doc-uuid",
    "name": "My Document",
    "type": "word",
    "layoutSchema": { ... },
    "sections": [
      {
        "id": "section-uuid",
        "sectionType": "table",
        "sectionOrder": 1
      }
    ],
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Update Document
```http
PUT /api/documents/:id
```

**Request Body:**
```json
{
  "name": "Updated Document Name",
  "layoutSchema": { ... }
}
```

### Delete Document
```http
DELETE /api/documents/:id
```

**Response:**
```json
{
  "success": true,
  "message": "Document deleted successfully"
}
```

### Duplicate Document
```http
POST /api/documents/:id/duplicate
```

**Request Body:**
```json
{
  "newName": "Copy of My Document"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "new-doc-uuid",
    "name": "Copy of My Document",
    "type": "word",
    "layoutSchema": { ... },
    "sections": [ ... ],
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Search Documents
```http
GET /api/documents/search
```

**Query Parameters:**
- `query` (required): Search term
- `limit` (optional): Number of results (default: 10)
- `offset` (optional): Number of results to skip (default: 0)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "doc-uuid",
      "name": "Sales Report",
      "type": "word",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 5,
    "limit": 10,
    "offset": 0
  }
}
```

### Generate Document
```http
POST /api/documents/:id/generate
```

**Request Body:**
```json
{
  "format": "word",
  "outputPath": "/path/to/output"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "filename": "my-document.docx",
    "path": "/generated-documents/my-document.docx",
    "size": 1024000
  }
}
```

### Download Document
```http
GET /api/documents/:id/download?format=word
```

**Query Parameters:**
- `format` (required): `word` or `pdf`

**Response:** Binary file download

## 📊 Section Operations

### Create Section
```http
POST /api/sections
```

**Request Body:**
```json
{
  "documentId": "doc-uuid",
  "sectionType": "table",
  "sectionOrder": 1,
  "contentSchema": {
    "schemaId": "table-schema-001",
    "columns": [
      {
        "id": "col1",
        "name": "Name",
        "type": "string",
        "required": true,
        "editable": true,
        "sortable": true,
        "filterable": true,
        "width": 120
      }
    ],
    "rows": {
      "allowAdd": true,
      "allowDelete": true,
      "showRowNumbers": false
    }
  },
  "stylingSchema": {
    "table": {
      "backgroundColor": "#ffffff",
      "borderColor": "#d9d9d9",
      "borderWidth": 1
    }
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "section-uuid",
    "documentId": "doc-uuid",
    "sectionType": "table",
    "sectionOrder": 1,
    "contentSchema": { ... },
    "stylingSchema": { ... },
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Get Document Sections
```http
GET /api/documents/:documentId/sections
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "section-uuid-1",
      "sectionType": "header",
      "sectionOrder": 1,
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    {
      "id": "section-uuid-2",
      "sectionType": "table",
      "sectionOrder": 2,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### Get Section
```http
GET /api/sections/:id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "section-uuid",
    "documentId": "doc-uuid",
    "sectionType": "table",
    "sectionOrder": 1,
    "contentSchema": { ... },
    "stylingSchema": { ... },
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Update Section
```http
PUT /api/sections/:id
```

**Request Body:**
```json
{
  "sectionOrder": 2,
  "contentSchema": { ... },
  "stylingSchema": { ... }
}
```

### Delete Section
```http
DELETE /api/sections/:id
```

### Duplicate Section
```http
POST /api/sections/:id/duplicate
```

**Request Body:**
```json
{
  "newDocumentId": "target-doc-uuid"
}
```

### Reorder Sections
```http
PUT /api/documents/:documentId/sections/reorder
```

**Request Body:**
```json
{
  "sectionOrders": [
    {
      "id": "section-uuid-1",
      "order": 1
    },
    {
      "id": "section-uuid-2",
      "order": 2
    }
  ]
}
```

### Update Section Data
```http
PUT /api/sections/:id/data
```

**Request Body:**
```json
{
  "data": [
    {
      "col1": "John Doe",
      "col2": 1000
    },
    {
      "col1": "Jane Smith",
      "col2": 1500
    }
  ]
}
```

### Bulk Create Sections
```http
POST /api/documents/:documentId/sections/bulk
```

**Request Body:**
```json
{
  "sections": [
    {
      "sectionType": "paragraph",
      "sectionOrder": 1,
      "contentSchema": {
        "schemaId": "paragraph-001",
        "content": "This is a paragraph"
      }
    },
    {
      "sectionType": "table",
      "sectionOrder": 2,
      "contentSchema": {
        "schemaId": "table-001",
        "columns": [ ... ]
      }
    }
  ]
}
```

### Get Section Data
```http
GET /api/sections/:sectionId/data
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "col1": "John Doe",
      "col2": 1000
    },
    {
      "col1": "Jane Smith",
      "col2": 1500
    }
  ]
}
```

## 🔧 Utility Operations

### Validate Schema
```http
POST /api/validation/validate
```

**Request Body:**
```json
{
  "schema": {
    "schemaId": "test-schema",
    "type": "object",
    "properties": {
      "name": { "type": "string" }
    }
  },
  "data": {
    "name": "Test"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "valid": true,
    "errors": []
  }
}
```

### Get Schema Templates
```http
GET /api/schemas/templates/:type
```

**Response:**
```json
{
  "success": true,
  "data": {
    "schemaId": "table-template",
    "schemaVersion": "1.0.0",
    "columns": [ ... ]
  }
}
```

### List Generated Documents
```http
GET /api/generated-documents
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "filename": "document-1.docx",
      "path": "/generated-documents/document-1.docx",
      "size": 1024000,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### Get Storage Statistics
```http
GET /api/storage/stats
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalDocuments": 150,
    "totalSize": 104857600,
    "storageType": "local",
    "availableSpace": 1073741824
  }
}
```

### Delete Generated Document
```http
DELETE /api/generated-documents/:filename
```

## 🏥 Health Check

### Health Status
```http
GET /api/health
```

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2024-01-01T00:00:00.000Z",
    "uptime": 3600,
    "database": "connected",
    "version": "1.0.0"
  }
}
```

## 🚨 Error Handling

### HTTP Status Codes

| Code | Description | Example |
|------|-------------|---------|
| 200 | Success | Document retrieved successfully |
| 201 | Created | Document created successfully |
| 400 | Bad Request | Invalid input data |
| 404 | Not Found | Document not found |
| 500 | Internal Server Error | Database connection failed |

### Common Error Responses

#### Validation Error (400)
```json
{
  "success": false,
  "error": "Validation failed",
  "message": "Missing required field: schemaId"
}
```

#### Not Found (404)
```json
{
  "success": false,
  "error": "Document not found",
  "message": "The requested document could not be found"
}
```

#### Server Error (500)
```json
{
  "success": false,
  "error": "Internal server error",
  "message": "Database connection failed"
}
```

## 🔐 Authentication

The API supports API key authentication:

```http
Authorization: Bearer your-api-key
```

Set the API key in the `.env` file:
```
API_KEY=your-secret-api-key
```

## 📝 Rate Limiting

- **Default Limit**: 100 requests per minute
- **Burst Limit**: 10 requests per second
- **Headers**: Rate limit info included in response headers

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

## 🌐 CORS Configuration

Configure CORS origins in the `.env` file:
```
CORS_ORIGIN=http://localhost:3000,https://your-frontend.com
```

## 📚 SDK Client Usage

```typescript
import { DocumentClient } from './src/sdk/DocumentClient';

const client = new DocumentClient('http://localhost:3000', 'your-api-key');

// Create document
const doc = await client.createDocument({
  name: 'My Document',
  type: 'word',
  layoutSchema: { ... }
});

// Add section
const section = await client.createSection({
  documentId: doc.data.id,
  sectionType: 'table',
  contentSchema: { ... }
});

// Generate document
const generated = await client.generateDocument(doc.data.id, 'word');
```

## 🧪 Testing API Endpoints

Use the included test suite to verify API functionality:

```bash
# Run API tests
npm run test:integration

# Run specific endpoint tests
npm test -- --testNamePattern="Document API"
```

## 📊 Monitoring

Monitor API performance and health:

```bash
# Health check
curl http://localhost:3000/api/health

# Storage stats
curl http://localhost:3000/api/storage/stats
```

## 🔄 Webhooks

Configure webhooks for real-time notifications:

```bash
# Set webhook URL in .env
WEBHOOK_URL=https://your-webhook-endpoint.com/events

# Webhook events
- document.created
- document.updated
- document.deleted
- section.created
- section.updated
- section.deleted
```
