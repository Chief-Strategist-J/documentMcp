/**
 * Document storage interface - follows coupling taxonomy (Type coupling)
 */
interface IDocumentStorage {
    saveDocument(documentId: string, format: string, buffer: Buffer): Promise<string>;
    getDocumentPath(documentId: string, format: string): Promise<string | null>;
    deleteDocument(documentId: string, format: string): Promise<boolean>;
    listDocuments(): Promise<Array<{
        documentId: string;
        format: string;
        filePath: string;
        createdAt: string;
    }>>;
}
/**
 * File system document storage implementation
 * Follows DRY principles - centralized storage logic
 * Follows strict null handling and typecasting rules
 */
export declare class DocumentStorage implements IDocumentStorage {
    private readonly storageDir;
    private readonly metadataFile;
    constructor(storageDir?: string);
    /**
     * Initializes storage directory
     * @returns Promise that resolves when directory is ready
     */
    initialize(): Promise<void>;
    /**
     * Saves a document to storage
     * @param documentId - Document ID
     * @param format - Document format (word/pdf)
     * @param buffer - Document buffer
     * @returns File path of saved document
     */
    saveDocument(documentId: string, format: string, buffer: Buffer): Promise<string>;
    /**
     * Gets document file path
     * @param documentId - Document ID
     * @param format - Document format
     * @returns File path or null if not found
     */
    getDocumentPath(documentId: string, format: string): Promise<string | null>;
    /**
     * Deletes a document from storage
     * @param documentId - Document ID
     * @param format - Document format
     * @returns True if document was deleted
     */
    deleteDocument(documentId: string, format: string): Promise<boolean>;
    /**
     * Lists all stored documents
     * @returns Array of document metadata
     */
    listDocuments(): Promise<Array<{
        documentId: string;
        format: string;
        filePath: string;
        createdAt: string;
    }>>;
    /**
     * Gets storage statistics
     * @returns Storage statistics object
     */
    getStats(): Promise<{
        totalDocuments: number;
        totalSize: number;
        formatCounts: {
            word: number;
            pdf: number;
        };
    }>;
    /**
     * Loads metadata from file
     * @returns Metadata object
     */
    private loadMetadata;
    /**
     * Updates metadata with new document
     * @param documentId - Document ID
     * @param format - Document format
     * @param filePath - File path
     */
    private updateMetadata;
    /**
     * Checks if file exists
     * @param filePath - File path
     * @returns True if file exists
     */
    private fileExists;
}
export {};
//# sourceMappingURL=DocumentStorage.d.ts.map