"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentClient = void 0;
/**
 * Document client for API operations
 * Follows DRY principles - single source of truth for API calls
 */
class DocumentClient {
    constructor(baseUrl, apiKey, customHeaders) {
        this.baseUrl = baseUrl;
        this.apiKey = apiKey || '';
    }
    /**
     * Sets authentication headers
     * @param headers - Request headers
     * @returns Headers with authentication
     */
    getHeaders(headers = {}) {
        const baseHeaders = {
            'Content-Type': 'application/json'
        };
        // Add custom headers
        Object.entries(headers).forEach(([key, value]) => {
            if (value !== undefined) {
                baseHeaders[key] = value;
            }
        });
        // Add authentication header if API key is available
        if (this.apiKey) {
            baseHeaders['Authorization'] = `Bearer ${this.apiKey}`;
        }
        return baseHeaders;
    }
    /**
     * Makes HTTP request with error handling
     * @param endpoint - API endpoint
     * @param options - Request options
     * @returns API response
     */
    async makeRequest(endpoint, options = {}) {
        try {
            const url = `${this.baseUrl}${endpoint}`;
            const response = await fetch(url, {
                ...options,
                headers: this.getHeaders(options.headers)
            });
            const data = await response.json();
            if (!response.ok) {
                return {
                    success: false,
                    error: data?.error || `HTTP ${response.status}: ${response.statusText}`
                };
            }
            return {
                success: true,
                data: data.data || data
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred'
            };
        }
    }
    /**
     * Creates a new document
     * @param request - Document creation request
     * @returns Created document or error
     */
    async createDocument(request) {
        return this.makeRequest('/api/documents', {
            method: 'POST',
            body: JSON.stringify(request)
        });
    }
    /**
     * Gets a document by ID
     * @param id - Document ID
     * @returns Document or error
     */
    async getDocument(id) {
        return this.makeRequest(`/api/documents/${id}`);
    }
    /**
     * Updates a document
     * @param id - Document ID
     * @param request - Update request
     * @returns Updated document or error
     */
    async updateDocument(id, request) {
        return this.makeRequest(`/api/documents/${id}`, {
            method: 'PUT',
            body: JSON.stringify(request)
        });
    }
    /**
     * Lists all documents
     * @param limit - Maximum number of documents
     * @param offset - Pagination offset
     * @returns Array of documents or error
     */
    async listDocuments(limit = 100, offset = 0) {
        return this.makeRequest(`/api/documents?limit=${limit}&offset=${offset}`);
    }
    /**
     * Deletes a document
     * @param id - Document ID
     * @returns Success status or error
     */
    async deleteDocument(id) {
        return this.makeRequest(`/api/documents/${id}`, {
            method: 'DELETE'
        });
    }
    /**
     * Creates a new section in a document
     * @param request - Section creation request
     * @returns Created section or error
     */
    async createSection(request) {
        return this.makeRequest('/api/sections', {
            method: 'POST',
            body: JSON.stringify(request)
        });
    }
    /**
     * Gets sections for a document
     * @param documentId - Document ID
     * @returns Array of sections or error
     */
    async getDocumentSections(documentId) {
        return this.makeRequest(`/api/documents/${documentId}/sections`);
    }
    /**
     * Gets a section by ID
     * @param id - Section ID
     * @returns Section or error
     */
    async getSection(id) {
        return this.makeRequest(`/api/sections/${id}`);
    }
    /**
     * Updates a section
     * @param id - Section ID
     * @param request - Update request
     * @returns Updated section or error
     */
    async updateSection(id, request) {
        return this.makeRequest(`/api/sections/${id}`, {
            method: 'PUT',
            body: JSON.stringify(request)
        });
    }
    /**
     * Deletes a section
     * @param id - Section ID
     * @returns Success status or error
     */
    async deleteSection(id) {
        return this.makeRequest(`/api/sections/${id}`, {
            method: 'DELETE'
        });
    }
    /**
     * Generates a document in specified format
     * @param documentId - Document ID
     * @param format - Output format
     * @param options - Generation options
     * @returns Generated document data or error
     */
    async generateDocument(documentId, format, options) {
        const queryParams = new URLSearchParams({ format });
        if (options) {
            Object.entries(options).forEach(([key, value]) => {
                queryParams.append(key, String(value));
            });
        }
        return this.makeRequest(`/api/documents/${documentId}/generate?${queryParams.toString()}`, {
            method: 'POST'
        });
    }
    /**
     * Downloads a generated document
     * @param documentId - Document ID
     * @param format - Output format
     * @returns Document blob or error
     */
    async downloadDocument(documentId, format) {
        return this.makeRequest(`/api/documents/${documentId}/download?format=${format}`);
    }
    /**
     * Validates a document schema
     * @param schema - Schema to validate
     * @param schemaType - Type of schema
     * @returns Validation result or error
     */
    async validateSchema(schema, schemaType) {
        return this.makeRequest('/api/validation/validate', {
            method: 'POST',
            body: JSON.stringify({ schema, schemaType })
        });
    }
    /**
     * Gets available schema templates
     * @param schemaType - Type of schema templates
     * @returns Schema templates or error
     */
    async getSchemaTemplates(schemaType) {
        return this.makeRequest(`/api/schemas/templates/${schemaType}`);
    }
    /**
     * Gets API health status
     * @returns Health status or error
     */
    async getHealthStatus() {
        return this.makeRequest('/api/health');
    }
}
exports.DocumentClient = DocumentClient;
//# sourceMappingURL=DocumentClient.js.map