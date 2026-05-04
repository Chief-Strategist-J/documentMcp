import { 
  DocumentConfig, 
  Section, 
  CreateDocumentRequest, 
  UpdateDocumentRequest, 
  CreateSectionRequest, 
  UpdateSectionRequest,
  AddSectionDataRequest,
  UpdateSectionDataRequest,
  DuplicateDocumentRequest,
  DuplicateSectionRequest,
  ReorderSectionsRequest,
  BulkCreateSectionsRequest,
  SearchDocumentsRequest,
  ApiResponse,
  DocumentType
} from '../types';

/**
 * Document client for API operations
 * Follows DRY principles - single source of truth for API calls
 */
export class DocumentClient {
  private baseUrl: string;
  private apiKey?: string;
  private customHeaders?: Record<string, string | undefined>;

  constructor(baseUrl: string, apiKey?: string, customHeaders?: Record<string, string | undefined>) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey || '';
    this.customHeaders = customHeaders;
  }

  /**
   * Sets authentication headers
   * @param headers - Request headers
   * @param method - HTTP method
   * @returns Headers with authentication
   */
  private getHeaders(headers: Record<string, string | undefined> = {}, method: string = 'GET'): Record<string, string> {
    const baseHeaders: Record<string, string> = {};

    // Only add Content-Type for methods that typically have a body
    if (method !== 'GET' && method !== 'HEAD') {
      baseHeaders['Content-Type'] = 'application/json';
    }

    // Add custom headers from constructor
    if (this.customHeaders) {
      Object.entries(this.customHeaders).forEach(([key, value]) => {
        if (value !== undefined) {
          baseHeaders[key] = value;
        }
      });
    }

    // Add custom headers from request
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
  private async makeRequest<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      const method = options.method || 'GET';
      const response = await fetch(url, {
        ...options,
        method: method,
        headers: this.getHeaders(options.headers as Record<string, string | undefined>, method)
      });

      const data: any = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: (data as any)?.error || `HTTP ${response.status}: ${response.statusText}`
        };
      }

      return {
        success: true,
        data: data.data || data
      };
    } catch (error) {
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
  async createDocument(request: CreateDocumentRequest): Promise<ApiResponse<DocumentConfig>> {
    return this.makeRequest<DocumentConfig>('/api/documents', {
      method: 'POST',
      body: JSON.stringify(request)
    });
  }

  /**
   * Gets a document by ID
   * @param id - Document ID
   * @returns Document or error
   */
  async getDocument(id: string): Promise<ApiResponse<DocumentConfig>> {
    return this.makeRequest<DocumentConfig>(`/api/documents/${id}`);
  }

  /**
   * Updates a document
   * @param id - Document ID
   * @param request - Update request
   * @returns Updated document or error
   */
  async updateDocument(
    id: string, 
    request: UpdateDocumentRequest
  ): Promise<ApiResponse<DocumentConfig>> {
    return this.makeRequest<DocumentConfig>(`/api/documents/${id}`, {
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
  async listDocuments(
    limit: number = 100, 
    offset: number = 0
  ): Promise<ApiResponse<DocumentConfig[]>> {
    return this.makeRequest<DocumentConfig[]>(
      `/api/documents?limit=${limit}&offset=${offset}`
    );
  }

  /**
   * Deletes a document
   * @param id - Document ID
   * @returns Success status or error
   */
  async deleteDocument(id: string): Promise<ApiResponse<void>> {
    return this.makeRequest<void>(`/api/documents/${id}`, {
      method: 'DELETE'
    });
  }

  /**
   * Creates a new section in a document
   * @param request - Section creation request
   * @returns Created section or error
   */
  async createSection(request: CreateSectionRequest): Promise<ApiResponse<Section>> {
    return this.makeRequest<Section>('/api/sections', {
      method: 'POST',
      body: JSON.stringify(request)
    });
  }

  /**
   * Gets sections for a document
   * @param documentId - Document ID
   * @returns Array of sections or error
   */
  async getDocumentSections(documentId: string): Promise<ApiResponse<Section[]>> {
    return this.makeRequest<Section[]>(`/api/documents/${documentId}/sections`);
  }

  
  /**
   * Updates a section
   * @param id - Section ID
   * @param request - Update request
   * @returns Updated section or error
   */
  async updateSection(
    id: string, 
    request: UpdateSectionRequest
  ): Promise<ApiResponse<Section>> {
    return this.makeRequest<Section>(`/api/sections/${id}`, {
      method: 'PUT',
      body: JSON.stringify(request)
    });
  }

  /**
   * Deletes a section
   * @param id - Section ID
   * @returns Success status or error
   */
  async deleteSection(id: string): Promise<ApiResponse<void>> {
    return this.makeRequest<void>(`/api/sections/${id}`, {
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
  async generateDocument(
    documentId: string, 
    format: DocumentType,
    options?: any
  ): Promise<ApiResponse<Blob>> {
    const queryParams = new URLSearchParams({ format });
    
    if (options) {
      Object.entries(options).forEach(([key, value]) => {
        queryParams.append(key, String(value));
      });
    }

    return this.makeRequest<Blob>(
      `/api/documents/${documentId}/generate?${queryParams.toString()}`,
      {
        method: 'POST'
      }
    );
  }

  /**
   * Downloads a generated document
   * @param documentId - Document ID
   * @param format - Output format
   * @returns Document blob or error
   */
  async downloadDocument(
    documentId: string, 
    format: DocumentType
  ): Promise<ApiResponse<Blob>> {
    return this.makeRequest<Blob>(
      `/api/documents/${documentId}/download?format=${format}`
    );
  }

  /**
   * Validates a document schema
   * @param schema - Schema to validate
   * @param schemaType - Type of schema
   * @returns Validation result or error
   */
  async validateSchema(
    schema: any, 
    schemaType: 'document' | 'section' | 'styling'
  ): Promise<ApiResponse<{ valid: boolean; errors?: string[] }>> {
    return this.makeRequest<{ valid: boolean; errors?: string[] }>('/api/validation/validate', {
      method: 'POST',
      body: JSON.stringify({ schema, schemaType })
    });
  }

  /**
   * Gets available schema templates
   * @param schemaType - Type of schema templates
   * @returns Schema templates or error
   */
  async getSchemaTemplates(schemaType: string): Promise<ApiResponse<any[]>> {
    return this.makeRequest<any[]>(`/api/schemas/templates/${schemaType}`);
  }

  /**
   * Gets API health status
   * @returns Health status or error
   */
  async getHealthStatus(): Promise<ApiResponse<{ status: string; timestamp: string }>> {
    return this.makeRequest<{ status: string; timestamp: string }>('/api/health');
  }

  /**
   * Lists all generated documents
   * @returns Array of generated documents or error
   */
  async listGeneratedDocuments(): Promise<ApiResponse<any[]>> {
    return this.makeRequest<any[]>('/api/documents/generated');
  }

  /**
   * Gets storage statistics
   * @returns Storage stats or error
   */
  async getStorageStats(): Promise<ApiResponse<any>> {
    return this.makeRequest<any>('/api/storage/stats');
  }

  /**
   * Deletes a generated document
   * @param documentId - Document ID
   * @param format - Document format
   * @returns Success status or error
   */
  async deleteGeneratedDocument(documentId: string, format: DocumentType): Promise<ApiResponse<void>> {
    return this.makeRequest<void>(`/api/documents/${documentId}/generated?format=${format}`, {
      method: 'DELETE'
    });
  }

  /**
   * Adds data to a section
   * @param request - Add section data request
   * @returns Success status or error
   */
  async addSectionData(request: AddSectionDataRequest): Promise<ApiResponse<void>> {
    return this.makeRequest<void>('/api/sections/data', {
      method: 'POST',
      body: JSON.stringify(request)
    });
  }

  /**
   * Gets data for a section
   * @param sectionId - Section ID
   * @returns Section data or error
   */
  async getSectionData(sectionId: string): Promise<ApiResponse<any[]>> {
    return this.makeRequest<any[]>(`/api/sections/${sectionId}/data`);
  }

  /**
   * Duplicates a document
   * @param documentId - Document ID
   * @param request - Duplicate document request
   * @returns Duplicated document or error
   */
  async duplicateDocument(documentId: string, request: DuplicateDocumentRequest): Promise<ApiResponse<DocumentConfig>> {
    return this.makeRequest<DocumentConfig>(`/api/documents/${documentId}/duplicate`, {
      method: 'POST',
      body: JSON.stringify(request)
    });
  }

  /**
   * Duplicates a section
   * @param sectionId - Section ID
   * @param request - Duplicate section request
   * @returns Duplicated section or error
   */
  async duplicateSection(sectionId: string, request: DuplicateSectionRequest): Promise<ApiResponse<Section>> {
    return this.makeRequest<Section>(`/api/sections/${sectionId}/duplicate`, {
      method: 'POST',
      body: JSON.stringify(request)
    });
  }

  /**
   * Reorders sections in a document
   * @param documentId - Document ID
   * @param request - Reorder sections request
   * @returns Success status or error
   */
  async reorderSections(documentId: string, request: ReorderSectionsRequest): Promise<ApiResponse<void>> {
    return this.makeRequest<void>(`/api/documents/${documentId}/sections/reorder`, {
      method: 'POST',
      body: JSON.stringify(request)
    });
  }

  /**
   * Updates section data
   * @param request - Update section data request
   * @returns Success status or error
   */
  async updateSectionData(request: UpdateSectionDataRequest): Promise<ApiResponse<void>> {
    return this.makeRequest<void>(`/api/sections/${request.sectionId}/data`, {
      method: 'PUT',
      body: JSON.stringify(request)
    });
  }

  /**
   * Bulk creates sections in a document
   * @param documentId - Document ID
   * @param request - Bulk create sections request
   * @returns Created sections or error
   */
  async bulkCreateSections(documentId: string, request: BulkCreateSectionsRequest): Promise<ApiResponse<Section[]>> {
    return this.makeRequest<Section[]>(`/api/documents/${documentId}/sections/bulk`, {
      method: 'POST',
      body: JSON.stringify(request)
    });
  }

  /**
   * Searches documents
   * @param request - Search documents request
   * @returns Search results or error
   */
  async searchDocuments(request: SearchDocumentsRequest): Promise<ApiResponse<DocumentConfig[]>> {
    const params = new URLSearchParams();
    params.append('query', request.query);
    if (request.limit) params.append('limit', request.limit.toString());
    if (request.offset) params.append('offset', request.offset.toString());

    return this.makeRequest<DocumentConfig[]>(`/api/documents/search?${params.toString()}`);
  }

  /**
   * Gets a section by ID
   * @param sectionId - Section ID
   * @returns Section or error
   */
  async getSection(sectionId: string): Promise<ApiResponse<Section>> {
    return this.makeRequest<Section>(`/api/sections/${sectionId}`);
  }
}
