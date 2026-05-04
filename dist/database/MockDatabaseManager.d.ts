import { DocumentConfig } from '../types';
/**
 * Mock database manager for testing without PostgreSQL
 * Follows DRY principles - centralized database operations
 * Follows strict null handling and typecasting rules
 * Follows coupling taxonomy (Name/Type coupling only)
 */
export declare class MockDatabaseManager {
    private documents;
    private sections;
    private sectionContent;
    private isInitialized;
    constructor(connectionString?: string);
    /**
     * Initializes mock database tables - follows single source of truth principle
     */
    initializeDatabase(): Promise<void>;
    /**
     * Creates a document - follows strict null handling and validation
     * @param document - Document configuration
     * @returns Created document
     */
    createDocument(document: DocumentConfig): Promise<any>;
    /**
     * Gets a document by ID - follows strict null checks
     * @param id - Document ID
     * @returns Document or null if not found
     */
    getDocument(id: string): Promise<any | null>;
    /**
     * Updates a document - follows typecasting rules
     * @param id - Document ID
     * @param updates - Document updates
     * @returns Updated document or null
     */
    updateDocument(id: string, updates: Partial<DocumentConfig>): Promise<any | null>;
    /**
     * Lists documents with pagination - follows boundary condition handling
     * @param limit - Maximum number of documents to return
     * @param offset - Number of documents to skip
     * @returns Array of documents
     */
    listDocuments(limit: number, offset: number): Promise<any[]>;
    /**
     * Deletes a document - follows proper error handling
     * @param id - Document ID
     * @returns True if document was deleted
     */
    deleteDocument(id: string): Promise<boolean>;
    /**
     * Creates a section - follows strict validation
     * @param section - Section data
     * @returns Created section
     */
    createSection(section: any): Promise<any>;
    /**
     * Gets sections for a document - follows list handling rules
     * @param documentId - Document ID
     * @returns Array of sections
     */
    getDocumentSections(documentId: string): Promise<any[]>;
    /**
     * Updates a section - follows typecasting and validation rules
     * @param id - Section ID
     * @param updates - Section updates
     * @returns Updated section or null
     */
    updateSection(id: string, updates: any): Promise<any | null>;
    /**
     * Deletes a section - follows proper cleanup
     * @param id - Section ID
     * @returns True if section was deleted
     */
    deleteSection(id: string): Promise<boolean>;
    /**
     * Gets a section by ID - follows null handling
     * @param id - Section ID
     * @returns Section or null if not found
     */
    getSection(id: string): Promise<any | null>;
    /**
     * Updates section data separately from other section properties
     * @param id - Section ID
     * @param data - Array of data objects
     * @returns Updated section or null if not found
     */
    updateSectionData(id: string, data: unknown[]): Promise<any | null>;
    /**
     * Clears all database tables - for testing purposes
     * Follows strict null handling and validation rules
     */
    clearDatabase(): Promise<void>;
    /**
     * Closes database connection - mock implementation
     */
    close(): Promise<void>;
    /**
     * Gets database initialization status - follows explicit return types
     * @returns True if database is initialized
     */
    isReady(): boolean;
    /**
     * Gets database statistics - for monitoring
     * @returns Database statistics object
     */
    getStats(): {
        documents: number;
        sections: number;
        content: number;
    };
}
//# sourceMappingURL=MockDatabaseManager.d.ts.map