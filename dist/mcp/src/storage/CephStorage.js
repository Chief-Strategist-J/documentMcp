"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CephStorage = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const uuid_1 = require("uuid");
/**
 * Ceph object storage implementation using S3-compatible API
 * Follows DRY principles - centralized storage logic
 * Follows strict null handling and typecasting rules
 */
class CephStorage {
    constructor(config) {
        // Validate inputs - follows strict validation rules
        if (!config || typeof config !== 'object') {
            throw new Error('CephStorage config must be a valid object');
        }
        if (!config.endpoint || typeof config.endpoint !== 'string') {
            throw new Error('Ceph endpoint must be a non-empty string');
        }
        if (!config.accessKeyId || typeof config.accessKeyId !== 'string') {
            throw new Error('Ceph accessKeyId must be a non-empty string');
        }
        if (!config.secretAccessKey || typeof config.secretAccessKey !== 'string') {
            throw new Error('Ceph secretAccessKey must be a non-empty string');
        }
        this.bucketName = config.bucketName || 'document-management';
        this.s3Client = new client_s3_1.S3Client({
            endpoint: config.endpoint,
            region: config.region || 'us-east-1',
            credentials: {
                accessKeyId: config.accessKeyId,
                secretAccessKey: config.secretAccessKey,
            },
            forcePathStyle: true, // Required for Ceph RGW
        });
    }
    /**
     * Initializes Ceph storage (creates bucket if needed)
     * @returns Promise that resolves when storage is ready
     */
    async initialize() {
        try {
            // Note: Bucket creation would require additional permissions
            // For demo purposes, we assume bucket exists
            console.log('Ceph storage initialized successfully');
        }
        catch (error) {
            throw new Error(`Failed to initialize Ceph storage: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Saves a document to Ceph storage
     * @param documentId - Document ID
     * @param format - Document format (word/pdf)
     * @param buffer - Document buffer
     * @returns Object key
     */
    async saveDocument(documentId, format, buffer) {
        // Validate inputs - follows strict validation rules
        if (!documentId || typeof documentId !== 'string') {
            throw new Error('Document ID must be a non-empty string');
        }
        if (!format || typeof format !== 'string') {
            throw new Error('Format must be a non-empty string');
        }
        if (!['word', 'pdf'].includes(format)) {
            throw new Error('Format must be either "word" or "pdf"');
        }
        if (!buffer || !(buffer instanceof Buffer)) {
            throw new Error('Document buffer must be a valid Buffer');
        }
        try {
            // Generate unique object key
            const key = `documents/${documentId}/${(0, uuid_1.v4)()}.${format === 'word' ? 'docx' : 'pdf'}`;
            const command = new client_s3_1.PutObjectCommand({
                Bucket: this.bucketName,
                Key: key,
                Body: buffer,
                ContentType: format === 'word'
                    ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
                    : 'application/pdf',
                Metadata: {
                    documentId,
                    format,
                    createdAt: new Date().toISOString(),
                },
            });
            await this.s3Client.send(command);
            return key;
        }
        catch (error) {
            throw new Error(`Failed to save document to Ceph: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Gets a document from Ceph storage
     * @param documentId - Document ID
     * @param format - Document format
     * @returns Document buffer or null if not found
     */
    async getDocument(documentId, format) {
        // Validate inputs
        if (!documentId || typeof documentId !== 'string') {
            throw new Error('Document ID must be a non-empty string');
        }
        if (!format || typeof format !== 'string') {
            throw new Error('Format must be a non-empty string');
        }
        try {
            // List objects for this document to find the latest one
            const listCommand = new client_s3_1.ListObjectsCommand({
                Bucket: this.bucketName,
                Prefix: `documents/${documentId}/`,
            });
            const listResponse = await this.s3Client.send(listCommand);
            const objects = listResponse.Contents || [];
            // Filter by format and get the most recent
            const extension = format === 'word' ? 'docx' : 'pdf';
            const matchingObjects = objects
                .filter(obj => obj.Key?.endsWith(`.${extension}`))
                .sort((a, b) => (b.LastModified?.getTime() || 0) - (a.LastModified?.getTime() || 0));
            if (matchingObjects.length === 0 || !matchingObjects[0].Key) {
                return null;
            }
            const getCommand = new client_s3_1.GetObjectCommand({
                Bucket: this.bucketName,
                Key: matchingObjects[0].Key,
            });
            const getResponse = await this.s3Client.send(getCommand);
            if (getResponse.Body) {
                // Convert stream to buffer
                const chunks = [];
                const stream = getResponse.Body;
                for await (const chunk of stream) {
                    chunks.push(chunk);
                }
                return Buffer.concat(chunks);
            }
            return null;
        }
        catch (error) {
            throw new Error(`Failed to get document from Ceph: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Deletes a document from Ceph storage
     * @param documentId - Document ID
     * @param format - Document format
     * @returns True if document was deleted
     */
    async deleteDocument(documentId, format) {
        // Validate inputs
        if (!documentId || typeof documentId !== 'string') {
            throw new Error('Document ID must be a non-empty string');
        }
        if (!format || typeof format !== 'string') {
            throw new Error('Format must be a non-empty string');
        }
        try {
            // List objects for this document
            const listCommand = new client_s3_1.ListObjectsCommand({
                Bucket: this.bucketName,
                Prefix: `documents/${documentId}/`,
            });
            const listResponse = await this.s3Client.send(listCommand);
            const objects = listResponse.Contents || [];
            // Filter by format
            const extension = format === 'word' ? 'docx' : 'pdf';
            const matchingObjects = objects.filter(obj => obj.Key?.endsWith(`.${extension}`));
            let deletedCount = 0;
            for (const obj of matchingObjects) {
                if (obj.Key) {
                    const deleteCommand = new client_s3_1.DeleteObjectCommand({
                        Bucket: this.bucketName,
                        Key: obj.Key,
                    });
                    await this.s3Client.send(deleteCommand);
                    deletedCount++;
                }
            }
            return deletedCount > 0;
        }
        catch (error) {
            throw new Error(`Failed to delete document from Ceph: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Lists all stored documents
     * @returns Array of document metadata
     */
    async listDocuments() {
        try {
            const listCommand = new client_s3_1.ListObjectsCommand({
                Bucket: this.bucketName,
                Prefix: 'documents/',
            });
            const listResponse = await this.s3Client.send(listCommand);
            const objects = listResponse.Contents || [];
            const documents = objects
                .filter(obj => obj.Key && !obj.Key.endsWith('/'))
                .map(obj => {
                const key = obj.Key;
                const parts = key.split('/');
                const documentId = parts[1];
                const filename = parts[2];
                const format = filename.endsWith('.docx') ? 'word' : 'pdf';
                return {
                    documentId,
                    format,
                    key,
                    createdAt: obj.LastModified?.toISOString() || new Date().toISOString(),
                };
            });
            return documents;
        }
        catch (error) {
            throw new Error(`Failed to list documents from Ceph: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Gets storage statistics
     * @returns Storage statistics object
     */
    async getStats() {
        try {
            const documents = await this.listDocuments();
            let totalSize = 0;
            const formatCounts = { word: 0, pdf: 0 };
            for (const doc of documents) {
                // Get object size by listing individual objects
                const listCommand = new client_s3_1.ListObjectsCommand({
                    Bucket: this.bucketName,
                    Prefix: `documents/${doc.documentId}/`,
                });
                const listResponse = await this.s3Client.send(listCommand);
                const objects = listResponse.Contents || [];
                objects.forEach(obj => {
                    if (obj.Size) {
                        totalSize += obj.Size;
                    }
                });
                formatCounts[doc.format]++;
            }
            return {
                totalDocuments: documents.length,
                totalSize,
                formatCounts
            };
        }
        catch (error) {
            throw new Error(`Failed to get Ceph storage stats: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
}
exports.CephStorage = CephStorage;
