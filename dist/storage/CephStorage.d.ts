/**
 * Ceph object storage interface - follows coupling taxonomy (Type coupling)
 */
interface ICephStorage {
    saveDocument(documentId: string, format: string, buffer: Buffer): Promise<string>;
    getDocument(documentId: string, format: string): Promise<Buffer | null>;
    deleteDocument(documentId: string, format: string): Promise<boolean>;
    listDocuments(): Promise<Array<{
        documentId: string;
        format: string;
        key: string;
        createdAt: string;
    }>>;
}
/**
 * Ceph object storage implementation using S3-compatible API
 * Follows DRY principles - centralized storage logic
 * Follows strict null handling and typecasting rules
 */
export declare class CephStorage implements ICephStorage {
    private readonly s3Client;
    private readonly bucketName;
    constructor(config: {
        endpoint: string;
        accessKeyId: string;
        secretAccessKey: string;
        region?: string;
        bucketName?: string;
    });
    /**
     * Initializes Ceph storage (creates bucket if needed)
     * @returns Promise that resolves when storage is ready
     */
    initialize(): Promise<void>;
    /**
     * Saves a document to Ceph storage
     * @param documentId - Document ID
     * @param format - Document format (word/pdf)
     * @param buffer - Document buffer
     * @returns Object key
     */
    saveDocument(documentId: string, format: string, buffer: Buffer): Promise<string>;
    /**
     * Gets a document from Ceph storage
     * @param documentId - Document ID
     * @param format - Document format
     * @returns Document buffer or null if not found
     */
    getDocument(documentId: string, format: string): Promise<Buffer | null>;
    /**
     * Deletes a document from Ceph storage
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
        key: string;
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
}
export {};
//# sourceMappingURL=CephStorage.d.ts.map