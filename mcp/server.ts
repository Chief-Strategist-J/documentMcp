/**
 * Model Context Protocol (MCP) Server for Document Management SDK
 * Follows DRY principles - centralized MCP implementation
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import { DocumentClient } from '../src/sdk/DocumentClient';
import { 
  CreateDocumentRequest, 
  CreateSectionRequest, 
  DocumentType, 
  SectionType,
  DocumentLayoutSchema,
  SectionContentSchema,
  StylingSchema,
  UpdateDocumentRequest,
  UpdateSectionRequest,
  AddSectionDataRequest,
  UpdateSectionDataRequest,
  DuplicateDocumentRequest,
  DuplicateSectionRequest,
  ReorderSectionsRequest,
  BulkCreateSectionsRequest,
  SearchDocumentsRequest
} from '../src/types';

/**
 * MCP Server configuration
 */
const MCP_SERVER_CONFIG = {
  name: 'document-management-sdk',
  version: '1.0.0',
  baseUrl: process.env['BASE_URL'] || 'http://localhost:3000',
  apiKey: process.env['API_KEY'] || ''
};

/**
 * Initialize DocumentClient
 */
const documentClient = new DocumentClient(MCP_SERVER_CONFIG.baseUrl, MCP_SERVER_CONFIG.apiKey);

/**
 * Create MCP Server instance
 */
const server = new Server(
  {
    name: MCP_SERVER_CONFIG.name,
    version: MCP_SERVER_CONFIG.version,
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

/**
 * Register MCP tools
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'create_document',
        description: 'Create a new document with specified configuration',
        inputSchema: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: 'Document name'
            },
            type: {
              type: 'string',
              enum: ['word', 'pdf'],
              description: 'Document type (word or pdf)'
            },
            layoutSchema: {
              type: 'object',
              description: 'Document layout schema configuration'
            }
          },
          required: ['name', 'type']
        }
      },
      {
        name: 'get_document',
        description: 'Get document by ID',
        inputSchema: {
          type: 'object',
          properties: {
            documentId: {
              type: 'string',
              description: 'Document ID'
            }
          },
          required: ['documentId']
        }
      },
      {
        name: 'list_documents',
        description: 'List all documents with pagination',
        inputSchema: {
          type: 'object',
          properties: {
            limit: {
              type: 'number',
              description: 'Maximum number of documents to return',
              default: 100
            },
            offset: {
              type: 'number',
              description: 'Number of documents to skip',
              default: 0
            }
          }
        }
      },
      {
        name: 'update_document',
        description: 'Update an existing document',
        inputSchema: {
          type: 'object',
          properties: {
            documentId: {
              type: 'string',
              description: 'Document ID'
            },
            name: {
              type: 'string',
              description: 'Updated document name'
            },
            layoutSchema: {
              type: 'object',
              description: 'Updated layout schema'
            }
          },
          required: ['documentId']
        }
      },
      {
        name: 'delete_document',
        description: 'Delete a document',
        inputSchema: {
          type: 'object',
          properties: {
            documentId: {
              type: 'string',
              description: 'Document ID'
            }
          },
          required: ['documentId']
        }
      },
      {
        name: 'create_section',
        description: 'Create a new section in a document',
        inputSchema: {
          type: 'object',
          properties: {
            documentId: {
              type: 'string',
              description: 'Document ID'
            },
            sectionType: {
              type: 'string',
              enum: ['table', 'paragraph', 'header', 'footer', 'image', 'chart'],
              description: 'Section type'
            },
            sectionOrder: {
              type: 'number',
              description: 'Section order in document'
            },
            contentSchema: {
              type: 'object',
              description: 'Section content schema'
            },
            stylingSchema: {
              type: 'object',
              description: 'Section styling schema'
            }
          },
          required: ['documentId', 'sectionType', 'sectionOrder']
        }
      },
      {
        name: 'get_document_sections',
        description: 'Get all sections for a document',
        inputSchema: {
          type: 'object',
          properties: {
            documentId: {
              type: 'string',
              description: 'Document ID'
            }
          },
          required: ['documentId']
        }
      },
      {
        name: 'generate_document',
        description: 'Generate a document in specified format',
        inputSchema: {
          type: 'object',
          properties: {
            documentId: {
              type: 'string',
              description: 'Document ID'
            },
            format: {
              type: 'string',
              enum: ['word', 'pdf'],
              description: 'Output format'
            },
            options: {
              type: 'object',
              description: 'Generation options (pageSize, orientation, margins)'
            }
          },
          required: ['documentId', 'format']
        }
      },
      {
        name: 'validate_schema',
        description: 'Validate a document or section schema',
        inputSchema: {
          type: 'object',
          properties: {
            schema: {
              type: 'object',
              description: 'Schema to validate'
            },
            schemaType: {
              type: 'string',
              enum: ['document', 'section', 'styling'],
              description: 'Type of schema to validate'
            }
          },
          required: ['schema', 'schemaType']
        }
      },
      {
        name: 'get_schema_template',
        description: 'Get schema template for document or section type',
        inputSchema: {
          type: 'object',
          properties: {
            templateType: {
              type: 'string',
              enum: ['document', 'table', 'paragraph', 'header', 'footer', 'image', 'chart', 'word-styling', 'pdf-styling'],
              description: 'Template type'
            }
          },
          required: ['templateType']
        }
      },
      {
        name: 'get_section',
        description: 'Get a section by ID',
        inputSchema: {
          type: 'object',
          properties: {
            sectionId: {
              type: 'string',
              description: 'Section ID'
            }
          },
          required: ['sectionId']
        }
      },
      {
        name: 'update_section',
        description: 'Update an existing section',
        inputSchema: {
          type: 'object',
          properties: {
            sectionId: {
              type: 'string',
              description: 'Section ID'
            },
            sectionOrder: {
              type: 'number',
              description: 'Updated section order'
            },
            contentSchema: {
              type: 'object',
              description: 'Updated content schema'
            },
            stylingSchema: {
              type: 'object',
              description: 'Updated styling schema'
            }
          },
          required: ['sectionId']
        }
      },
      {
        name: 'delete_section',
        description: 'Delete a section',
        inputSchema: {
          type: 'object',
          properties: {
            sectionId: {
              type: 'string',
              description: 'Section ID'
            }
          },
          required: ['sectionId']
        }
      },
      {
        name: 'download_document',
        description: 'Download a generated document',
        inputSchema: {
          type: 'object',
          properties: {
            documentId: {
              type: 'string',
              description: 'Document ID'
            },
            format: {
              type: 'string',
              enum: ['word', 'pdf'],
              description: 'Output format'
            }
          },
          required: ['documentId', 'format']
        }
      },
      {
        name: 'get_health_status',
        description: 'Get API health status',
        inputSchema: {
          type: 'object',
          properties: {}
        }
      },
      {
        name: 'list_generated_documents',
        description: 'List all generated documents',
        inputSchema: {
          type: 'object',
          properties: {}
        }
      },
      {
        name: 'get_storage_stats',
        description: 'Get storage statistics',
        inputSchema: {
          type: 'object',
          properties: {}
        }
      },
      {
        name: 'delete_generated_document',
        description: 'Delete a generated document',
        inputSchema: {
          type: 'object',
          properties: {
            documentId: {
              type: 'string',
              description: 'Document ID'
            },
            format: {
              type: 'string',
              enum: ['word', 'pdf'],
              description: 'Document format'
            }
          },
          required: ['documentId', 'format']
        }
      },
      {
        name: 'add_section_data',
        description: 'Add data to a section',
        inputSchema: {
          type: 'object',
          properties: {
            sectionId: {
              type: 'string',
              description: 'Section ID'
            },
            data: {
              type: 'array',
              description: 'Data to add'
            }
          },
          required: ['sectionId', 'data']
        }
      },
      {
        name: 'get_section_data',
        description: 'Get data for a section',
        inputSchema: {
          type: 'object',
          properties: {
            sectionId: {
              type: 'string',
              description: 'Section ID'
            }
          },
          required: ['sectionId']
        }
      },
      {
        name: 'duplicate_document',
        description: 'Duplicate a document',
        inputSchema: {
          type: 'object',
          properties: {
            documentId: {
              type: 'string',
              description: 'Document ID'
            },
            newName: {
              type: 'string',
              description: 'New document name'
            }
          },
          required: ['documentId']
        }
      },
      {
        name: 'duplicate_section',
        description: 'Duplicate a section',
        inputSchema: {
          type: 'object',
          properties: {
            sectionId: {
              type: 'string',
              description: 'Section ID'
            },
            newDocumentId: {
              type: 'string',
              description: 'Target document ID'
            }
          },
          required: ['sectionId']
        }
      },
      {
        name: 'reorder_sections',
        description: 'Reorder sections in a document',
        inputSchema: {
          type: 'object',
          properties: {
            documentId: {
              type: 'string',
              description: 'Document ID'
            },
            sectionOrders: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  order: { type: 'number' }
                }
              },
              description: 'Section order mappings'
            }
          },
          required: ['documentId', 'sectionOrders']
        }
      },
      {
        name: 'update_section_data',
        description: 'Update section data',
        inputSchema: {
          type: 'object',
          properties: {
            sectionId: {
              type: 'string',
              description: 'Section ID'
            },
            rowIndex: {
              type: 'number',
              description: 'Row index'
            },
            data: {
              type: 'object',
              description: 'Row data'
            }
          },
          required: ['sectionId', 'rowIndex', 'data']
        }
      },
      {
        name: 'bulk_create_sections',
        description: 'Bulk create sections in a document',
        inputSchema: {
          type: 'object',
          properties: {
            documentId: {
              type: 'string',
              description: 'Document ID'
            },
            sections: {
              type: 'array',
              items: {
                type: 'object'
              },
              description: 'Sections to create'
            }
          },
          required: ['documentId', 'sections']
        }
      },
      {
        name: 'search_documents',
        description: 'Search documents',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'Search query'
            },
            limit: {
              type: 'number',
              description: 'Maximum results'
            },
            offset: {
              type: 'number',
              description: 'Results offset'
            }
          },
          required: ['query']
        }
      }
    ],
  };
});

/**
 * Handle tool calls
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (!args) {
    throw new McpError(
      ErrorCode.InvalidParams,
      'Tool arguments are required'
    );
  }

  try {
    switch (name) {
      case 'create_document': {
        const createRequest: CreateDocumentRequest = {
          name: args.name as string,
          type: args.type as DocumentType,
          layoutSchema: args.layoutSchema as DocumentLayoutSchema
        };

        const result = await documentClient.createDocument(createRequest);
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2)
            }
          ]
        };
      }

      case 'get_document': {
        const result = await documentClient.getDocument(args.documentId as string);
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2)
            }
          ]
        };
      }

      case 'list_documents': {
        const limit = (args.limit as number) || 100;
        const offset = (args.offset as number) || 0;
        
        const result = await documentClient.listDocuments(limit, offset);
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2)
            }
          ]
        };
      }

      case 'update_document': {
        const updateRequest: UpdateDocumentRequest = {
          name: args.name as string,
          layoutSchema: args.layoutSchema as DocumentLayoutSchema
        };
        
        const result = await documentClient.updateDocument(
          args.documentId as string,
          updateRequest
        );
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2)
            }
          ]
        };
      }

      case 'delete_document': {
        const result = await documentClient.deleteDocument(args.documentId as string);
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2)
            }
          ]
        };
      }

      case 'create_section': {
        const createRequest: CreateSectionRequest = {
          documentId: args.documentId as string,
          sectionType: args.sectionType as SectionType,
          sectionOrder: args.sectionOrder as number,
          contentSchema: args.contentSchema as SectionContentSchema,
          stylingSchema: args.stylingSchema as StylingSchema
        };
        
        const result = await documentClient.createSection(createRequest);
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2)
            }
          ]
        };
      }

      case 'get_document_sections': {
        const result = await documentClient.getDocumentSections(args.documentId as string);
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2)
            }
          ]
        };
      }

      case 'generate_document': {
        const result = await documentClient.generateDocument(
          args.documentId as string,
          args.format as DocumentType,
          args.options
        );
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2)
            }
          ]
        };
      }

      case 'validate_schema': {
        const result = await documentClient.validateSchema(args.schema, args.schemaType as 'document' | 'section' | 'styling');
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2)
            }
          ]
        };
      }

      case 'get_schema_template': {
        const result = await documentClient.getSchemaTemplates(args.templateType as string);
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2)
            }
          ]
        };
      }

      case 'get_section': {
        const result = await documentClient.getSection(args.sectionId as string);
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2)
            }
          ]
        };
      }

      case 'update_section': {
        const updateRequest: UpdateSectionRequest = {
          sectionOrder: args.sectionOrder as number,
          contentSchema: args.contentSchema as SectionContentSchema,
          stylingSchema: args.stylingSchema as StylingSchema
        };
        
        const result = await documentClient.updateSection(
          args.sectionId as string,
          updateRequest
        );
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2)
            }
          ]
        };
      }

      case 'delete_section': {
        const result = await documentClient.deleteSection(args.sectionId as string);
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2)
            }
          ]
        };
      }

      case 'download_document': {
        const result = await documentClient.downloadDocument(
          args.documentId as string,
          args.format as DocumentType
        );
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2)
            }
          ]
        };
      }

      case 'get_health_status': {
        const result = await documentClient.getHealthStatus();
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2)
            }
          ]
        };
      }

      case 'list_generated_documents': {
        const result = await documentClient.listGeneratedDocuments();
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2)
            }
          ]
        };
      }

      case 'get_storage_stats': {
        const result = await documentClient.getStorageStats();
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2)
            }
          ]
        };
      }

      case 'delete_generated_document': {
        const result = await documentClient.deleteGeneratedDocument(
          args.documentId as string,
          args.format as DocumentType
        );
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2)
            }
          ]
        };
      }

      case 'add_section_data': {
        const request: AddSectionDataRequest = {
          sectionId: args.sectionId as string,
          data: args.data as any[]
        };
        
        const result = await documentClient.addSectionData(request);
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2)
            }
          ]
        };
      }

      case 'get_section_data': {
        const result = await documentClient.getSectionData(args.sectionId as string);
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2)
            }
          ]
        };
      }

      case 'duplicate_document': {
        const request: DuplicateDocumentRequest = {
          newName: args.newName as string
        };
        
        const result = await documentClient.duplicateDocument(args.documentId as string, request);
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2)
            }
          ]
        };
      }

      case 'duplicate_section': {
        const request: DuplicateSectionRequest = {
          newDocumentId: args.newDocumentId as string
        };
        
        const result = await documentClient.duplicateSection(args.sectionId as string, request);
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2)
            }
          ]
        };
      }

      case 'reorder_sections': {
        const request: ReorderSectionsRequest = {
          sectionOrders: args.sectionOrders as Array<{ id: string; order: number }>
        };
        
        const result = await documentClient.reorderSections(args.documentId as string, request);
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2)
            }
          ]
        };
      }

      case 'update_section_data': {
        const request: UpdateSectionDataRequest = {
          sectionId: args.sectionId as string,
          rowIndex: args.rowIndex as number,
          data: args.data as any
        };
        
        const result = await documentClient.updateSectionData(request);
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2)
            }
          ]
        };
      }

      case 'bulk_create_sections': {
        const request: BulkCreateSectionsRequest = {
          sections: args.sections as Array<Omit<CreateSectionRequest, 'documentId'>>
        };
        
        const result = await documentClient.bulkCreateSections(args.documentId as string, request);
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2)
            }
          ]
        };
      }

      case 'search_documents': {
        const request: SearchDocumentsRequest = {
          query: args.query as string,
          limit: args.limit as number,
          offset: args.offset as number
        };
        
        const result = await documentClient.searchDocuments(request);
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2)
            }
          ]
        };
      }

      default:
        throw new McpError(
          ErrorCode.MethodNotFound,
          `Unknown tool: ${name}`
        );
    }
  } catch (error) {
    throw new McpError(
      ErrorCode.InternalError,
      `Tool execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
});

/**
 * Start MCP server
 */
async function startServer(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  
  console.error(`Document Management MCP Server running on ${MCP_SERVER_CONFIG.baseUrl}`);
}

// Export server for testing
export { server, startServer };

// Handle server shutdown
process.on('SIGINT', async () => {
  console.error('Shutting down MCP server...');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.error('Shutting down MCP server...');
  process.exit(0);
});

// Start server if this file is run directly
if (require.main === module) {
  startServer().catch((error) => {
    console.error('Failed to start MCP server:', error);
    process.exit(1);
  });
}
