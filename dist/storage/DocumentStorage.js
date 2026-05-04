"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentStorage = void 0;
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const uuid_1 = require("uuid");
/**
 * File system document storage implementation
 * Follows DRY principles - centralized storage logic
 * Follows strict null handling and typecasting rules
 */
class DocumentStorage {
    constructor(storageDir = './generated-documents') {
        // Validate input - follows null handling rules
        if (!storageDir || typeof storageDir !== 'string') {
            throw new Error('Storage directory must be a non-empty string');
        }
        this.storageDir = path_1.default.resolve(storageDir);
        this.metadataFile = path_1.default.join(this.storageDir, 'metadata.json');
    }
    /**
     * Initializes storage directory
     * @returns Promise that resolves when directory is ready
     */
    async initialize() {
        try {
            // Create storage directory if it doesn't exist
            await promises_1.default.mkdir(this.storageDir, { recursive: true });
            // Initialize metadata file if it doesn't exist
            try {
                await promises_1.default.access(this.metadataFile);
            }
            catch {
                await promises_1.default.writeFile(this.metadataFile, JSON.stringify({ documents: [] }));
            }
        }
        catch (error) {
            throw new Error(`Failed to initialize storage: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Saves a document to storage
     * @param documentId - Document ID
     * @param format - Document format (word/pdf)
     * @param buffer - Document buffer
     * @returns File path of saved document
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
            // Generate unique filename
            const filename = `${documentId}_${(0, uuid_1.v4)()}.${format === 'word' ? 'docx' : 'pdf'}`;
            const filePath = path_1.default.join(this.storageDir, filename);
            // Save document file
            await promises_1.default.writeFile(filePath, buffer);
            // Update metadata
            await this.updateMetadata(documentId, format, filePath);
            return filePath;
        }
        catch (error) {
            throw new Error(`Failed to save document: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Gets document file path
     * @param documentId - Document ID
     * @param format - Document format
     * @returns File path or null if not found
     */
    async getDocumentPath(documentId, format) {
        // Validate inputs
        if (!documentId || typeof documentId !== 'string') {
            throw new Error('Document ID must be a non-empty string');
        }
        if (!format || typeof format !== 'string') {
            throw new Error('Format must be a non-empty string');
        }
        try {
            const metadata = await this.loadMetadata();
            const document = metadata.documents.find((doc) => doc.documentId === documentId && doc.format === format);
            if (document && await this.fileExists(document.filePath)) {
                return document.filePath;
            }
            return null;
        }
        catch (error) {
            throw new Error(`Failed to get document path: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Deletes a document from storage
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
            const metadata = await this.loadMetadata();
            const documentIndex = metadata.documents.findIndex((doc) => doc.documentId === documentId && doc.format === format);
            if (documentIndex === -1) {
                return false;
            }
            const document = metadata.documents[documentIndex];
            // Delete file if it exists
            if (await this.fileExists(document.filePath)) {
                await promises_1.default.unlink(document.filePath);
            }
            // Update metadata
            metadata.documents.splice(documentIndex, 1);
            await promises_1.default.writeFile(this.metadataFile, JSON.stringify(metadata));
            return true;
        }
        catch (error) {
            throw new Error(`Failed to delete document: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Lists all stored documents
     * @returns Array of document metadata
     */
    async listDocuments() {
        try {
            const metadata = await this.loadMetadata();
            // Filter out documents that no longer exist on disk
            const existingDocuments = [];
            for (const doc of metadata.documents) {
                if (await this.fileExists(doc.filePath)) {
                    existingDocuments.push(doc);
                }
            }
            // Update metadata to remove non-existent files
            if (existingDocuments.length !== metadata.documents.length) {
                metadata.documents = existingDocuments;
                await promises_1.default.writeFile(this.metadataFile, JSON.stringify(metadata));
            }
            return existingDocuments;
        }
        catch (error) {
            throw new Error(`Failed to list documents: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
                if (await this.fileExists(doc.filePath)) {
                    const stats = await promises_1.default.stat(doc.filePath);
                    totalSize += stats.size;
                    formatCounts[doc.format]++;
                }
            }
            return {
                totalDocuments: documents.length,
                totalSize,
                formatCounts
            };
        }
        catch (error) {
            throw new Error(`Failed to get storage stats: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Loads metadata from file
     * @returns Metadata object
     */
    async loadMetadata() {
        try {
            const data = await promises_1.default.readFile(this.metadataFile, 'utf8');
            return JSON.parse(data);
        }
        catch (error) {
            return { documents: [] };
        }
    }
    /**
     * Updates metadata with new document
     * @param documentId - Document ID
     * @param format - Document format
     * @param filePath - File path
     */
    async updateMetadata(documentId, format, filePath) {
        try {
            const metadata = await this.loadMetadata();
            // Add new document metadata
            metadata.documents.push({
                documentId,
                format,
                filePath,
                createdAt: new Date().toISOString()
            });
            await promises_1.default.writeFile(this.metadataFile, JSON.stringify(metadata));
        }
        catch (error) {
            throw new Error(`Failed to update metadata: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Checks if file exists
     * @param filePath - File path
     * @returns True if file exists
     */
    async fileExists(filePath) {
        try {
            await promises_1.default.access(filePath);
            return true;
        }
        catch {
            return false;
        }
    }
}
exports.DocumentStorage = DocumentStorage;
//# sourceMappingURL=DocumentStorage.js.map