import { Request, Response } from 'express';
import { DatabaseManager } from '../database/DatabaseManager';
import { DocumentStorage } from '../storage/DocumentStorage';
import { CephStorage } from '../storage/CephStorage';
import { SchemaValidator } from '../validation/SchemaValidator';
import {
  CreateDocumentRequest,
  UpdateDocumentRequest,
  CreateSectionRequest,
  UpdateSectionRequest,
  AddSectionDataRequest,
  UpdateSectionDataRequest,
  ApiResponse
} from '../types';

export class DocumentController {
  private documentStorage: DocumentStorage;
  cephStorage: CephStorage | null = null;

  constructor(
    private databaseManager: DatabaseManager,
    private schemaValidator: SchemaValidator
  ) {
    this.documentStorage = new DocumentStorage();
    this.documentStorage.initialize().catch(() => {});

    
    const cephConfig = {
      endpoint: process.env['CEPH_ENDPOINT'] || 'http://localhost:8080',
      accessKeyId: process.env['CEPH_ACCESS_KEY'] || 'admin',
      secretAccessKey: process.env['CEPH_SECRET_KEY'] || 'admin123',
      region: process.env['CEPH_REGION'] || 'us-east-1',
      bucketName: process.env['CEPH_BUCKET'] || 'document-management'
    };

    if (process.env['USE_CEPH_STORAGE'] === 'true') {
      try {
        this.cephStorage = new CephStorage(cephConfig);
        this.cephStorage.initialize().catch(() => {
          this.cephStorage = null;
        });
      } catch (error) {
        this.cephStorage = null;
      }
    }
  }

  async createDocument(req: Request, res: Response): Promise<void> {
    try {
      const request: CreateDocumentRequest = req.body;

      if (!request.name || !request.type) {
        res.status(400).json({ success: false, error: 'Name and type are required' } as ApiResponse<never>);
        return;
      }

      if (!['word', 'pdf'].includes(request.type)) {
        res.status(400).json({ success: false, error: 'Type must be either "word" or "pdf"' } as ApiResponse<never>);
        return;
      }

      if (request.layoutSchema) {
        const isValid = this.schemaValidator.validateDocumentLayout(request.layoutSchema);
        if (!isValid) {
          const errors = this.schemaValidator.getValidationErrors(request.layoutSchema, 'document');
          res.status(400).json({ success: false, error: 'Invalid layout schema', details: errors });
          return;
        }
      }

      const document = await this.databaseManager.createDocument({
        name: request.name,
        type: request.type,
        layoutSchema: request.layoutSchema || {
          schemaId: 'default',
          schemaVersion: '1.0.0',
          tableName: '',
          dimensions: { minRows: 0, maxRows: 1000, defaultRows: 0, columnCount: 0 }
        }
      });

      res.status(201).json({ success: true, data: document } as ApiResponse<any>);
    } catch (error) {
      res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' } as ApiResponse<any>);
    }
  }

  async getDocument(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      if (!id) { res.status(400).json({ success: false, error: 'Document ID is required' }); return; }

      const document = await this.databaseManager.getDocument(id);
      if (!document) { res.status(404).json({ success: false, error: 'Document not found' }); return; }

      res.json({ success: true, data: document } as ApiResponse<any>);
    } catch (error) {
      res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' } as ApiResponse<any>);
    }
  }

  async updateDocument(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const request: UpdateDocumentRequest = req.body;
      if (!id) { res.status(400).json({ success: false, error: 'Document ID is required' }); return; }

      if (request.layoutSchema) {
        const isValid = this.schemaValidator.validateDocumentLayout(request.layoutSchema);
        if (!isValid) {
          const errors = this.schemaValidator.getValidationErrors(request.layoutSchema, 'document');
          res.status(400).json({ success: false, error: 'Invalid layout schema', details: errors });
          return;
        }
      }

      const document = await this.databaseManager.updateDocument(id, request);
      if (!document) { res.status(404).json({ success: false, error: 'Document not found' }); return; }

      res.json({ success: true, data: document } as ApiResponse<any>);
    } catch (error) {
      res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' } as ApiResponse<any>);
    }
  }

  async listDocuments(req: Request, res: Response): Promise<void> {
    try {
      const limit = parseInt(req.query['limit'] as string) || 100;
      const offset = parseInt(req.query['offset'] as string) || 0;

      if (limit < 1 || limit > 1000) { res.status(400).json({ success: false, error: 'Limit must be between 1 and 1000' }); return; }
      if (offset < 0) { res.status(400).json({ success: false, error: 'Offset must be non-negative' }); return; }

      const documents = await this.databaseManager.listDocuments(limit, offset);
      res.json({ success: true, data: documents } as ApiResponse<any>);
    } catch (error) {
      res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' } as ApiResponse<any>);
    }
  }

  async deleteDocument(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      if (!id) { res.status(400).json({ success: false, error: 'Document ID is required' }); return; }

      const deleted = await this.databaseManager.deleteDocument(id);
      if (!deleted) { res.status(404).json({ success: false, error: 'Document not found' }); return; }

      res.json({ success: true, message: 'Document deleted successfully' } as ApiResponse<any>);
    } catch (error) {
      res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' } as ApiResponse<any>);
    }
  }

  async createSection(req: Request, res: Response): Promise<void> {
    try {
      const request: CreateSectionRequest = req.body;

      if (!request.documentId || !request.sectionType) {
        res.status(400).json({ success: false, error: 'Document ID and section type are required' });
        return;
      }

      const validSectionTypes = ['table', 'paragraph', 'header', 'footer', 'image', 'chart'];
      if (!validSectionTypes.includes(request.sectionType)) {
        res.status(400).json({ success: false, error: 'Invalid section type' });
        return;
      }

      const isValid = this.schemaValidator.validateSectionContent(request.contentSchema);
      if (!isValid) {
        const errors = this.schemaValidator.getValidationErrors(request.contentSchema, 'section');
        res.status(400).json({ success: false, error: 'Invalid content schema', details: errors } as ApiResponse<never>);
        return;
      }

      const isStylingValid = this.schemaValidator.validateStyling(request.stylingSchema);
      if (!isStylingValid) {
        const errors = this.schemaValidator.getValidationErrors(request.stylingSchema, 'styling');
        res.status(400).json({ success: false, error: 'Invalid styling schema', details: errors });
        return;
      }

      const section = await this.databaseManager.createSection({
        documentId: request.documentId,
        sectionType: request.sectionType,
        sectionOrder: request.sectionOrder,
        contentSchema: request.contentSchema,
        stylingSchema: request.stylingSchema
      });

      res.status(201).json({ success: true, data: section } as ApiResponse<any>);
    } catch (error) {
      res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' } as ApiResponse<any>);
    }
  }

  async getDocumentSections(req: Request, res: Response): Promise<void> {
    try {
      const { documentId } = req.params;
      if (!documentId) { res.status(400).json({ success: false, error: 'Document ID is required' }); return; }

      const sections = await this.databaseManager.getDocumentSections(documentId);
      res.json({ success: true, data: sections } as ApiResponse<any>);
    } catch (error) {
      res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' } as ApiResponse<any>);
    }
  }

  async updateSection(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const request: UpdateSectionRequest = req.body;
      if (!id) { res.status(400).json({ success: false, error: 'Section ID is required' }); return; }

      if (request.contentSchema) {
        const isValid = this.schemaValidator.validateSectionContent(request.contentSchema);
        if (!isValid) {
          const errors = this.schemaValidator.getValidationErrors(request.contentSchema, 'section');
          res.status(400).json({ success: false, error: 'Invalid content schema', details: errors });
          return;
        }
      }

      if (request.stylingSchema) {
        const isValid = this.schemaValidator.validateStyling(request.stylingSchema);
        if (!isValid) {
          const errors = this.schemaValidator.getValidationErrors(request.stylingSchema, 'styling');
          res.status(400).json({ success: false, error: 'Invalid styling schema', details: errors });
          return;
        }
      }

      const section = await this.databaseManager.updateSection(id, request);
      if (!section) { res.status(404).json({ success: false, error: 'Section not found' }); return; }

      res.json({ success: true, data: section } as ApiResponse<any>);
    } catch (error) {
      res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' } as ApiResponse<any>);
    }
  }

  async deleteSection(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      if (!id) { res.status(400).json({ success: false, error: 'Section ID is required' }); return; }

      const deleted = await this.databaseManager.deleteSection(id);
      if (!deleted) { res.status(404).json({ success: false, error: 'Section not found' }); return; }

      res.json({ success: true, message: 'Section deleted successfully' } as ApiResponse<any>);
    } catch (error) {
      res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' } as ApiResponse<any>);
    }
  }

  async validateSchema(req: Request, res: Response): Promise<void> {
    try {
      const { schema, schemaType } = req.body;
      if (!schema || !schemaType) {
        res.status(400).json({ success: false, error: 'Schema and schema type are required' });
        return;
      }

      let isValid = false;
      let errors: string[] = [];

      switch (schemaType) {
        case 'document':
          isValid = this.schemaValidator.validateDocumentLayout(schema);
          if (!isValid) errors = this.schemaValidator.getValidationErrors(schema, 'document');
          break;
        case 'section':
          isValid = this.schemaValidator.validateSectionContent(schema);
          if (!isValid) errors = this.schemaValidator.getValidationErrors(schema, 'section');
          break;
        case 'styling':
          isValid = this.schemaValidator.validateStyling(schema);
          if (!isValid) errors = this.schemaValidator.getValidationErrors(schema, 'styling');
          break;
        default:
          res.status(400).json({ success: false, error: 'Invalid schema type. Must be document, section, or styling' });
          return;
      }

      res.json({ success: true, data: { valid: isValid, errors: isValid ? undefined : errors } } as ApiResponse<any>);
    } catch (error) {
      res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' } as ApiResponse<any>);
    }
  }

  async getHealthStatus(_req: Request, res: Response): Promise<void> {
    res.json({ success: true, data: { status: 'healthy', timestamp: new Date().toISOString() } } as ApiResponse<any>);
  }

  async downloadDocument(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { format } = req.query;

      if (!id || typeof id !== 'string') {
        res.status(400).json({ success: false, error: 'Document ID is required' });
        return;
      }
      if (!format || typeof format !== 'string' || !['word', 'pdf'].includes(format)) {
        res.status(400).json({ success: false, error: 'Format must be either "word" or "pdf"' });
        return;
      }

      const filePath = await this.documentStorage.getDocumentPath(id, format);
      if (!filePath) {
        res.status(404).json({ success: false, error: 'Document not found' });
        return;
      }

      const contentType = format === 'word'
        ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        : 'application/pdf';
      const fileExtension = format === 'word' ? 'docx' : 'pdf';

      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `attachment; filename="document_${id}.${fileExtension}"`);

      const fs = require('fs');
      res.sendFile(filePath, (error: Error) => {
        if (error) {
          if (!res.headersSent) {
            res.status(500).json({ success: false, error: 'Failed to download document' });
          }
        }
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' } as ApiResponse<any>);
    }
  }

  async listGeneratedDocuments(_req: Request, res: Response): Promise<void> {
    try {
      const documents = await this.documentStorage.listDocuments();
      res.json({
        success: true,
        data: {
          documents: documents.map(doc => ({
            documentId: doc.documentId,
            format: doc.format,
            createdAt: doc.createdAt,
            downloadUrl: `/api/documents/${doc.documentId}/download?format=${doc.format}`
          }))
        }
      } as ApiResponse<any>);
    } catch (error) {
      res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' } as ApiResponse<any>);
    }
  }

  async getStorageStats(_req: Request, res: Response): Promise<void> {
    try {
      const stats = await this.documentStorage.getStats();
      res.json({
        success: true,
        data: {
          totalDocuments: stats.totalDocuments,
          totalSize: stats.totalSize,
          totalSizeHuman: this.formatBytes(stats.totalSize),
          formatCounts: stats.formatCounts
        }
      } as ApiResponse<any>);
    } catch (error) {
      res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' } as ApiResponse<any>);
    }
  }

  async deleteGeneratedDocument(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { format } = req.query;

      if (!id || typeof id !== 'string') { res.status(400).json({ success: false, error: 'Document ID is required' }); return; }
      if (!format || typeof format !== 'string' || !['word', 'pdf'].includes(format)) {
        res.status(400).json({ success: false, error: 'Format must be either "word" or "pdf"' });
        return;
      }

      const deleted = await this.documentStorage.deleteDocument(id, format);
      if (!deleted) { res.status(404).json({ success: false, error: 'Document not found' }); return; }

      res.json({ success: true, message: 'Document deleted successfully' } as ApiResponse<any>);
    } catch (error) {
      res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' } as ApiResponse<any>);
    }
  }

  async addSectionData(req: Request, res: Response): Promise<void> {
    try {
      const request: AddSectionDataRequest = req.body;

      if (!request || typeof request !== 'object') {
        res.status(400).json({ success: false, error: 'Request body is required' } as ApiResponse<any>);
        return;
      }
      if (!request.sectionId || typeof request.sectionId !== 'string') {
        res.status(400).json({ success: false, error: 'Section ID is required' } as ApiResponse<any>);
        return;
      }
      if (!request.data || !Array.isArray(request.data)) {
        res.status(400).json({ success: false, error: 'Data array is required' } as ApiResponse<any>);
        return;
      }

      const section = await this.databaseManager.getSection(request.sectionId);
      if (!section) {
        res.status(404).json({ success: false, error: 'Section not found' } as ApiResponse<any>);
        return;
      }

      const updatedSection = await this.databaseManager.updateSectionData(
        request.sectionId,
        request.data
      );

      res.json({
        success: true,
        data: {
          sectionId: request.sectionId,
          dataCount: request.data.length,
          section: updatedSection
        }
      } as ApiResponse<any>);
    } catch (error) {
      res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' } as ApiResponse<any>);
    }
  }

  async getSectionData(req: Request, res: Response): Promise<void> {
    try {
      const { sectionId } = req.params;

      if (!sectionId || typeof sectionId !== 'string') {
        res.status(400).json({ success: false, error: 'Section ID is required' } as ApiResponse<any>);
        return;
      }

      const section = await this.databaseManager.getSection(sectionId);
      if (!section) {
        res.status(404).json({ success: false, error: 'Section not found' } as ApiResponse<any>);
        return;
      }

      const data: unknown[] = Array.isArray(section.data) ? section.data : [];

      res.json({
        success: true,
        data: {
          sectionId,
          data,
          dataCount: data.length
        }
      } as ApiResponse<any>);
    } catch (error) {
      res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' } as ApiResponse<any>);
    }
  }

  async duplicateDocument(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { newName } = req.body;

      if (!id) {
        res.status(400).json({ success: false, error: 'Document ID is required' } as ApiResponse<never>);
        return;
      }

      const duplicatedDocument = await this.databaseManager.duplicateDocument(id, newName);
      if (!duplicatedDocument) {
        res.status(404).json({ success: false, error: 'Document not found' } as ApiResponse<never>);
        return;
      }

      res.status(201).json({ success: true, data: duplicatedDocument } as ApiResponse<any>);
    } catch (error) {
      res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' } as ApiResponse<any>);
    }
  }

  async duplicateSection(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { newDocumentId } = req.body;

      if (!id) {
        res.status(400).json({ success: false, error: 'Section ID is required' } as ApiResponse<never>);
        return;
      }

      const duplicatedSection = await this.databaseManager.duplicateSection(id, newDocumentId);
      if (!duplicatedSection) {
        res.status(404).json({ success: false, error: 'Section not found' } as ApiResponse<never>);
        return;
      }

      res.status(201).json({ success: true, data: duplicatedSection } as ApiResponse<any>);
    } catch (error) {
      res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' } as ApiResponse<any>);
    }
  }

  async reorderSections(req: Request, res: Response): Promise<void> {
    try {
      const { documentId } = req.params;
      const { sectionOrders } = req.body;

      if (!documentId) {
        res.status(400).json({ success: false, error: 'Document ID is required' } as ApiResponse<never>);
        return;
      }

      if (!sectionOrders || !Array.isArray(sectionOrders)) {
        res.status(400).json({ success: false, error: 'Section orders array is required' } as ApiResponse<never>);
        return;
      }

      const reorderedSections = await this.databaseManager.reorderSections(documentId, sectionOrders);
      res.json({ success: true, data: reorderedSections } as ApiResponse<any>);
    } catch (error) {
      res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' } as ApiResponse<any>);
    }
  }

  async updateSectionData(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { data } = req.body;

      if (!id) {
        res.status(400).json({ success: false, error: 'Section ID is required' } as ApiResponse<never>);
        return;
      }

      if (!data || !Array.isArray(data)) {
        res.status(400).json({ success: false, error: 'Data array is required' } as ApiResponse<never>);
        return;
      }

      const updatedSection = await this.databaseManager.updateSectionData(id, data);
      if (!updatedSection) {
        res.status(404).json({ success: false, error: 'Section not found' } as ApiResponse<never>);
        return;
      }

      res.json({ success: true, data: updatedSection } as ApiResponse<any>);
    } catch (error) {
      res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' } as ApiResponse<any>);
    }
  }

  async bulkCreateSections(req: Request, res: Response): Promise<void> {
    try {
      const { documentId } = req.params;
      const { sections } = req.body;

      if (!documentId) {
        res.status(400).json({ success: false, error: 'Document ID is required' } as ApiResponse<never>);
        return;
      }

      if (!sections || !Array.isArray(sections)) {
        res.status(400).json({ success: false, error: 'Sections array is required' } as ApiResponse<never>);
        return;
      }

      const createdSections = await this.databaseManager.bulkCreateSections(documentId, sections);
      res.status(201).json({ success: true, data: createdSections } as ApiResponse<any>);
    } catch (error) {
      res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' } as ApiResponse<any>);
    }
  }

  async searchDocuments(req: Request, res: Response): Promise<void> {
    try {
      const { query } = req.query;
      const limit = parseInt(req.query['limit'] as string) || 100;
      const offset = parseInt(req.query['offset'] as string) || 0;

      if (!query || typeof query !== 'string') {
        res.status(400).json({ success: false, error: 'Search query is required' } as ApiResponse<never>);
        return;
      }

      if (limit < 1 || limit > 1000) {
        res.status(400).json({ success: false, error: 'Limit must be between 1 and 1000' } as ApiResponse<never>);
        return;
      }

      if (offset < 0) {
        res.status(400).json({ success: false, error: 'Offset must be non-negative' } as ApiResponse<never>);
        return;
      }

      const documents = await this.databaseManager.searchDocuments(query, limit, offset);
      res.json({ success: true, data: documents } as ApiResponse<any>);
    } catch (error) {
      res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' } as ApiResponse<any>);
    }
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}