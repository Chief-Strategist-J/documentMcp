import { DocumentConfig, Section } from '../types';
/**
 * Database manager for document and section storage
 * Follows DRY principles - centralized database operations
 * Follows strict null handling and typecasting rules
 */
export declare class DatabaseManager {
    private readonly db;
    private readonly isConnected;
    constructor(connectionString: string);
    /**
     * Initializes database tables
     * Single source of truth for database schema
     */
    initializeDatabase(): Promise<void>;
    /**
     * Creates documents table
     */
    private createDocumentsTable;
    /**
     * Creates sections table
     */
    private createSectionsTable;
    /**
     * Creates section content table
     */
    private createSectionContentTable;
    /**
     * Creates a new document
     * @param documentConfig - Document configuration
     * @returns Created document
     */
    createDocument(documentConfig: Omit<DocumentConfig, 'id' | 'createdAt' | 'updatedAt'>): Promise<DocumentConfig>;
    /**
     * Gets a document by ID
     * @param id - Document ID
     * @returns Document or null if not found
     */
    getDocument(id: string): Promise<DocumentConfig | null>;
    /**
     * Updates a document
     * @param id - Document ID
     * @param updates - Document updates
     * @returns Updated document or null if not found
     */
    updateDocument(id: string, updates: Partial<Omit<DocumentConfig, 'id' | 'createdAt'>>): Promise<DocumentConfig | null>;
    /**
     * Lists all documents
     * @param limit - Maximum number of documents to return
     * @param offset - Offset for pagination
     * @returns Array of documents
     */
    listDocuments(limit?: number, offset?: number): Promise<DocumentConfig[]>;
    /**
     * Deletes a document
     * @param id - Document ID
     * @returns True if document was deleted, false if not found
     */
    deleteDocument(id: string): Promise<boolean>;
    /**
     * Creates a new section
     * @param section - Section configuration
     * @returns Created section
     */
    createSection(section: Omit<Section, 'id' | 'createdAt'>): Promise<Section>;
    /**
     * Gets sections for a document
     * @param documentId - Document ID
     * @returns Array of sections
     */
    getDocumentSections(documentId: string): Promise<Section[]>;
    /**
     * Updates a section
     * @param id - Section ID
     * @param updates - Section updates
     * @returns Updated section or null if not found
     */
    updateSection(id: string, updates: Partial<Omit<Section, 'id' | 'documentId' | 'createdAt'>>): Promise<Section | null>;
    /**
     * Gets a section by ID
     * @param id - Section ID
     * @returns Section or null if not found
     */
    getSection(id: string): Promise<Section | null>;
    /**
     * Deletes a section
     * @param id - Section ID
     * @returns True if section was deleted, false if not found
     */
    deleteSection(id: string): Promise<boolean>;
    /**
     * Clears all database tables - for testing purposes
     * Follows strict null handling and validation rules
     */
    clearDatabase(): Promise<void>;
    /**
     * Updates section data separately from other section properties
     * @param id - Section ID
     * @param data - Array of data objects
     * @returns Updated section or null if not found
     */
    updateSectionData(id: string, data: unknown[]): Promise<Section | null>;
    /**
     * Closes database connection
     */
    close(): Promise<void>;
}
//# sourceMappingURL=DatabaseManager.d.ts.map