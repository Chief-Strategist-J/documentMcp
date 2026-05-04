import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

/**
 * Document storage interface - follows coupling taxonomy (Type coupling)
 */
interface IDocumentStorage {
  saveDocument(documentId: string, format: string, buffer: Buffer): Promise<string>;
  getDocumentPath(documentId: string, format: string): Promise<string | null>;
  deleteDocument(documentId: string, format: string): Promise<boolean>;
  listDocuments(): Promise<Array<{documentId: string, format: string, filePath: string, createdAt: string}>>;
}

/**
 * File system document storage implementation
 * Follows DRY principles - centralized storage logic
 * Follows strict null handling and typecasting rules
 */
export class DocumentStorage implements IDocumentStorage {
  private readonly storageDir: string;
  private readonly metadataFile: string;

  constructor(storageDir: string = './generated-documents') {
    // Validate input - follows null handling rules
    if (!storageDir || typeof storageDir !== 'string') {
      throw new Error('Storage directory must be a non-empty string');
    }

    this.storageDir = path.resolve(storageDir);
    this.metadataFile = path.join(this.storageDir, 'metadata.json');
  }

  /**
   * Initializes storage directory
   * @returns Promise that resolves when directory is ready
   */
  async initialize(): Promise<void> {
    try {
      // Create storage directory if it doesn't exist
      await fs.mkdir(this.storageDir, { recursive: true });
      
      // Initialize metadata file if it doesn't exist
      try {
        await fs.access(this.metadataFile);
      } catch {
        await fs.writeFile(this.metadataFile, JSON.stringify({ documents: [] }));
      }
    } catch (error) {
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
  async saveDocument(documentId: string, format: string, buffer: Buffer): Promise<string> {
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
      const filename = `${documentId}_${uuidv4()}.${format === 'word' ? 'docx' : 'pdf'}`;
      const filePath = path.join(this.storageDir, filename);

      // Save document file
      await fs.writeFile(filePath, buffer);

      // Update metadata
      await this.updateMetadata(documentId, format, filePath);

      return filePath;
    } catch (error) {
      throw new Error(`Failed to save document: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Gets document file path
   * @param documentId - Document ID
   * @param format - Document format
   * @returns File path or null if not found
   */
  async getDocumentPath(documentId: string, format: string): Promise<string | null> {
    // Validate inputs
    if (!documentId || typeof documentId !== 'string') {
      throw new Error('Document ID must be a non-empty string');
    }
    if (!format || typeof format !== 'string') {
      throw new Error('Format must be a non-empty string');
    }

    try {
      const metadata = await this.loadMetadata();
      const document = metadata.documents.find((doc: any) => 
        doc.documentId === documentId && doc.format === format
      );

      if (document && await this.fileExists(document.filePath)) {
        return document.filePath;
      }

      return null;
    } catch (error) {
      throw new Error(`Failed to get document path: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Deletes a document from storage
   * @param documentId - Document ID
   * @param format - Document format
   * @returns True if document was deleted
   */
  async deleteDocument(documentId: string, format: string): Promise<boolean> {
    // Validate inputs
    if (!documentId || typeof documentId !== 'string') {
      throw new Error('Document ID must be a non-empty string');
    }
    if (!format || typeof format !== 'string') {
      throw new Error('Format must be a non-empty string');
    }

    try {
      const metadata = await this.loadMetadata();
      const documentIndex = metadata.documents.findIndex((doc: any) => 
        doc.documentId === documentId && doc.format === format
      );

      if (documentIndex === -1) {
        return false;
      }

      const document = metadata.documents[documentIndex];

      // Delete file if it exists
      if (await this.fileExists(document.filePath)) {
        await fs.unlink(document.filePath);
      }

      // Update metadata
      metadata.documents.splice(documentIndex, 1);
      await fs.writeFile(this.metadataFile, JSON.stringify(metadata));

      return true;
    } catch (error) {
      throw new Error(`Failed to delete document: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Lists all stored documents
   * @returns Array of document metadata
   */
  async listDocuments(): Promise<Array<{documentId: string, format: string, filePath: string, createdAt: string}>> {
    try {
      const metadata = await this.loadMetadata();
      
      // Filter out documents that no longer exist on disk
      const existingDocuments: any[] = [];
      for (const doc of metadata.documents) {
        if (await this.fileExists(doc.filePath)) {
          existingDocuments.push(doc);
        }
      }

      // Update metadata to remove non-existent files
      if (existingDocuments.length !== metadata.documents.length) {
        metadata.documents = existingDocuments;
        await fs.writeFile(this.metadataFile, JSON.stringify(metadata));
      }

      return existingDocuments;
    } catch (error) {
      throw new Error(`Failed to list documents: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Gets storage statistics
   * @returns Storage statistics object
   */
  async getStats(): Promise<{ totalDocuments: number; totalSize: number; formatCounts: {word: number; pdf: number} }> {
    try {
      const documents = await this.listDocuments();
      let totalSize = 0;
      const formatCounts = { word: 0, pdf: 0 };

      for (const doc of documents) {
        if (await this.fileExists(doc.filePath)) {
          const stats = await fs.stat(doc.filePath);
          totalSize += stats.size;
          formatCounts[doc.format as keyof typeof formatCounts]++;
        }
      }

      return {
        totalDocuments: documents.length,
        totalSize,
        formatCounts
      };
    } catch (error) {
      throw new Error(`Failed to get storage stats: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Loads metadata from file
   * @returns Metadata object
   */
  private async loadMetadata(): Promise<any> {
    try {
      const data = await fs.readFile(this.metadataFile, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      return { documents: [] };
    }
  }

  /**
   * Updates metadata with new document
   * @param documentId - Document ID
   * @param format - Document format
   * @param filePath - File path
   */
  private async updateMetadata(documentId: string, format: string, filePath: string): Promise<void> {
    try {
      const metadata = await this.loadMetadata();
      
      // Add new document metadata
      metadata.documents.push({
        documentId,
        format,
        filePath,
        createdAt: new Date().toISOString()
      });

      await fs.writeFile(this.metadataFile, JSON.stringify(metadata));
    } catch (error) {
      throw new Error(`Failed to update metadata: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Checks if file exists
   * @param filePath - File path
   * @returns True if file exists
   */
  private async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }
}
