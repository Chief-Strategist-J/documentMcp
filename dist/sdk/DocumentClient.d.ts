import { DocumentConfig, Section, CreateDocumentRequest, UpdateDocumentRequest, CreateSectionRequest, UpdateSectionRequest, ApiResponse, DocumentType } from '../types';
/**
 * Document client for API operations
 * Follows DRY principles - single source of truth for API calls
 */
export declare class DocumentClient {
    private baseUrl;
    private apiKey?;
    constructor(baseUrl: string, apiKey?: string, customHeaders?: Record<string, string | undefined>);
    /**
     * Sets authentication headers
     * @param headers - Request headers
     * @returns Headers with authentication
     */
    private getHeaders;
    /**
     * Makes HTTP request with error handling
     * @param endpoint - API endpoint
     * @param options - Request options
     * @returns API response
     */
    private makeRequest;
    /**
     * Creates a new document
     * @param request - Document creation request
     * @returns Created document or error
     */
    createDocument(request: CreateDocumentRequest): Promise<ApiResponse<DocumentConfig>>;
    /**
     * Gets a document by ID
     * @param id - Document ID
     * @returns Document or error
     */
    getDocument(id: string): Promise<ApiResponse<DocumentConfig>>;
    /**
     * Updates a document
     * @param id - Document ID
     * @param request - Update request
     * @returns Updated document or error
     */
    updateDocument(id: string, request: UpdateDocumentRequest): Promise<ApiResponse<DocumentConfig>>;
    /**
     * Lists all documents
     * @param limit - Maximum number of documents
     * @param offset - Pagination offset
     * @returns Array of documents or error
     */
    listDocuments(limit?: number, offset?: number): Promise<ApiResponse<DocumentConfig[]>>;
    /**
     * Deletes a document
     * @param id - Document ID
     * @returns Success status or error
     */
    deleteDocument(id: string): Promise<ApiResponse<void>>;
    /**
     * Creates a new section in a document
     * @param request - Section creation request
     * @returns Created section or error
     */
    createSection(request: CreateSectionRequest): Promise<ApiResponse<Section>>;
    /**
     * Gets sections for a document
     * @param documentId - Document ID
     * @returns Array of sections or error
     */
    getDocumentSections(documentId: string): Promise<ApiResponse<Section[]>>;
    /**
     * Gets a section by ID
     * @param id - Section ID
     * @returns Section or error
     */
    getSection(id: string): Promise<ApiResponse<Section>>;
    /**
     * Updates a section
     * @param id - Section ID
     * @param request - Update request
     * @returns Updated section or error
     */
    updateSection(id: string, request: UpdateSectionRequest): Promise<ApiResponse<Section>>;
    /**
     * Deletes a section
     * @param id - Section ID
     * @returns Success status or error
     */
    deleteSection(id: string): Promise<ApiResponse<void>>;
    /**
     * Generates a document in specified format
     * @param documentId - Document ID
     * @param format - Output format
     * @param options - Generation options
     * @returns Generated document data or error
     */
    generateDocument(documentId: string, format: DocumentType, options?: any): Promise<ApiResponse<Blob>>;
    /**
     * Downloads a generated document
     * @param documentId - Document ID
     * @param format - Output format
     * @returns Document blob or error
     */
    downloadDocument(documentId: string, format: DocumentType): Promise<ApiResponse<Blob>>;
    /**
     * Validates a document schema
     * @param schema - Schema to validate
     * @param schemaType - Type of schema
     * @returns Validation result or error
     */
    validateSchema(schema: any, schemaType: 'document' | 'section' | 'styling'): Promise<ApiResponse<{
        valid: boolean;
        errors?: string[];
    }>>;
    /**
     * Gets available schema templates
     * @param schemaType - Type of schema templates
     * @returns Schema templates or error
     */
    getSchemaTemplates(schemaType: string): Promise<ApiResponse<any[]>>;
    /**
     * Gets API health status
     * @returns Health status or error
     */
    getHealthStatus(): Promise<ApiResponse<{
        status: string;
        timestamp: string;
    }>>;
}
//# sourceMappingURL=DocumentClient.d.ts.map