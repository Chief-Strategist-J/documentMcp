"use strict";
/**
 * Model Context Protocol (MCP) Server for Document Management SDK
 * Follows DRY principles - centralized MCP implementation
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.startServer = exports.server = void 0;
const index_js_1 = require("@modelcontextprotocol/sdk/server/index.js");
const stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
const types_js_1 = require("@modelcontextprotocol/sdk/types.js");
const DocumentClient_1 = require("../src/sdk/DocumentClient");
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
const documentClient = new DocumentClient_1.DocumentClient(MCP_SERVER_CONFIG.baseUrl, MCP_SERVER_CONFIG.apiKey);
/**
 * Create MCP Server instance
 */
const server = new index_js_1.Server({
    name: MCP_SERVER_CONFIG.name,
    version: MCP_SERVER_CONFIG.version,
}, {
    capabilities: {
        tools: {},
    },
});
exports.server = server;
/**
 * Register MCP tools
 */
server.setRequestHandler(types_js_1.ListToolsRequestSchema, async () => {
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
server.setRequestHandler(types_js_1.CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    if (!args) {
        throw new types_js_1.McpError(types_js_1.ErrorCode.InvalidParams, 'Tool arguments are required');
    }
    try {
        switch (name) {
            case 'create_document': {
                const createRequest = {
                    name: args.name,
                    type: args.type,
                    layoutSchema: args.layoutSchema
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
                const result = await documentClient.getDocument(args.documentId);
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
                const limit = args.limit || 100;
                const offset = args.offset || 0;
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
                const updateRequest = {
                    name: args.name,
                    layoutSchema: args.layoutSchema
                };
                const result = await documentClient.updateDocument(args.documentId, updateRequest);
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
                const result = await documentClient.deleteDocument(args.documentId);
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
                const createRequest = {
                    documentId: args.documentId,
                    sectionType: args.sectionType,
                    sectionOrder: args.sectionOrder,
                    contentSchema: args.contentSchema,
                    stylingSchema: args.stylingSchema
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
                const result = await documentClient.getDocumentSections(args.documentId);
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
                const result = await documentClient.generateDocument(args.documentId, args.format, args.options);
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
                const result = await documentClient.validateSchema(args.schema, args.schemaType);
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
                const result = await documentClient.getSchemaTemplates(args.templateType);
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
                const result = await documentClient.getSection(args.sectionId);
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
                const updateRequest = {
                    sectionOrder: args.sectionOrder,
                    contentSchema: args.contentSchema,
                    stylingSchema: args.stylingSchema
                };
                const result = await documentClient.updateSection(args.sectionId, updateRequest);
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
                const result = await documentClient.deleteSection(args.sectionId);
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
                const result = await documentClient.downloadDocument(args.documentId, args.format);
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
                const result = await documentClient.deleteGeneratedDocument(args.documentId, args.format);
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
                const request = {
                    sectionId: args.sectionId,
                    data: args.data
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
                const result = await documentClient.getSectionData(args.sectionId);
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
                const request = {
                    newName: args.newName
                };
                const result = await documentClient.duplicateDocument(args.documentId, request);
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
                const request = {
                    newDocumentId: args.newDocumentId
                };
                const result = await documentClient.duplicateSection(args.sectionId, request);
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
                const request = {
                    sectionOrders: args.sectionOrders
                };
                const result = await documentClient.reorderSections(args.documentId, request);
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
                const request = {
                    sectionId: args.sectionId,
                    rowIndex: args.rowIndex,
                    data: args.data
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
                const request = {
                    sections: args.sections
                };
                const result = await documentClient.bulkCreateSections(args.documentId, request);
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
                const request = {
                    query: args.query,
                    limit: args.limit,
                    offset: args.offset
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
                throw new types_js_1.McpError(types_js_1.ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
        }
    }
    catch (error) {
        throw new types_js_1.McpError(types_js_1.ErrorCode.InternalError, `Tool execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
});
/**
 * Start MCP server
 */
async function startServer() {
    const transport = new stdio_js_1.StdioServerTransport();
    await server.connect(transport);
    console.error(`Document Management MCP Server running on ${MCP_SERVER_CONFIG.baseUrl}`);
}
exports.startServer = startServer;
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
