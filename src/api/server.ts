import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { DatabaseManager } from '../database/DatabaseManager';
import { MockDatabaseManager } from '../database/MockDatabaseManager';
import { SchemaValidator } from '../validation/SchemaValidator';
import { DocumentController } from './DocumentController';
import { APIDocumentGenerator } from '../generators/APIDocumentGenerator';
import { DocumentStorage } from '../storage/DocumentStorage';
import { CephStorage } from '../storage/CephStorage';

interface IDatabaseManager {
  initializeDatabase(): Promise<void>;
  createDocument(document: any): Promise<any>;
  getDocument(id: string): Promise<any>;
  updateDocument(id: string, updates: any): Promise<any>;
  deleteDocument(id: string): Promise<boolean>;
  listDocuments(limit: number, offset: number): Promise<any[]>;
  duplicateDocument(id: string, newName?: string): Promise<any>;
  searchDocuments(query: string, limit?: number, offset?: number): Promise<any[]>;
  createSection(section: any): Promise<any>;
  getDocumentSections(documentId: string): Promise<any[]>;
  updateSection(id: string, updates: any): Promise<any>;
  deleteSection(id: string): Promise<boolean>;
  getSection(id: string): Promise<any>;
  updateSectionData(id: string, data: unknown[]): Promise<any>;
  duplicateSection(id: string, newDocumentId?: string): Promise<any>;
  reorderSections(documentId: string, sectionOrders: Array<{ id: string; order: number }>): Promise<any[]>;
  bulkCreateSections(documentId: string, sections: Array<any>): Promise<any[]>;
}

export class DocumentServer {
  private app: express.Application;
  private databaseManager: IDatabaseManager;
  private documentController: DocumentController;
  private apiGenerator: APIDocumentGenerator;

  constructor(databaseUrl: string) {
    if (!databaseUrl || typeof databaseUrl !== 'string') {
      throw new Error('Database URL must be a non-empty string');
    }

    this.app = express();

    if (databaseUrl.startsWith('mock://')) {
      this.databaseManager = new MockDatabaseManager();
    } else {
      this.databaseManager = new DatabaseManager(databaseUrl);
    }

    this.apiGenerator = new APIDocumentGenerator();
    this.documentController = new DocumentController(
      this.databaseManager as any,
      new SchemaValidator()
    );

    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  private setupMiddleware(): void {
    this.app.use(cors({
      origin: process.env['CORS_ORIGIN'] || '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      allowedHeaders: ['Content-Type', 'Authorization']
    }));
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));
    this.app.use((req: Request, _res: Response, next: NextFunction) => {
      console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
      next();
    });
  }

  private setupRoutes(): void {
    this.app.get('/api/health', (req, res) => this.documentController.getHealthStatus(req, res));

    this.app.post('/api/documents', (req, res) => this.documentController.createDocument(req, res));
    this.app.get('/api/documents', (req, res) => this.documentController.listDocuments(req, res));
    this.app.get('/api/documents/:id', (req, res) => this.documentController.getDocument(req, res));
    this.app.put('/api/documents/:id', (req, res) => this.documentController.updateDocument(req, res));
    this.app.delete('/api/documents/:id', (req, res) => this.documentController.deleteDocument(req, res));

    this.app.post('/api/sections', (req, res) => this.documentController.createSection(req, res));
    this.app.get('/api/documents/:documentId/sections', (req, res) => this.documentController.getDocumentSections(req, res));
    this.app.put('/api/sections/:id', (req, res) => this.documentController.updateSection(req, res));
    this.app.delete('/api/sections/:id', (req, res) => this.documentController.deleteSection(req, res));

    this.app.post('/api/sections/:sectionId/data', (req, res) => this.documentController.addSectionData(req, res));
    this.app.get('/api/sections/:sectionId/data', (req, res) => this.documentController.getSectionData(req, res));

    this.app.post('/api/validation/validate', (req, res) => this.documentController.validateSchema(req, res));

    this.app.post('/api/documents/:id/generate', async (req: Request, res: Response) => {
      try {
        const { id } = req.params;
        const { format, options } = req.body;

        if (!id) {
          res.status(400).json({ success: false, error: 'Document ID is required' });
          return;
        }
        if (!format || !['word', 'pdf'].includes(format)) {
          res.status(400).json({ success: false, error: 'Format must be either "word" or "pdf"' });
          return;
        }

        const document = await this.databaseManager.getDocument(id);
        if (!document) {
          res.status(404).json({ success: false, error: 'Document not found' });
          return;
        }

        const sections = await this.databaseManager.getDocumentSections(id);
        
    
        const generatedDocument = await this.apiGenerator.generateAPIDocument(
          document,
          sections,
          format,
          options
        );

        let storageInfo: { filePath?: string; key?: string; storageType: string };

        if (this.documentController.cephStorage) {
          const key = await this.documentController.cephStorage.saveDocument(id, format, generatedDocument);
          storageInfo = { key, storageType: 'ceph' };
        } else {
          const documentStorage = new DocumentStorage();
          await documentStorage.initialize();
          const filePath = await documentStorage.saveDocument(id, format, generatedDocument);
          storageInfo = { filePath, storageType: 'local' };
        }

        res.json({
          success: true,
          data: {
            documentId: id,
            format,
            ...storageInfo,
            downloadUrl: `/api/documents/${id}/download?format=${format}`,
            generatedAt: new Date().toISOString(),
            generator: 'api-based',
            content: 'dynamic-api-document',
            sectionsCount: sections.length
          }
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error occurred'
        });
      }
    });

    this.app.post('/api/documents/:id/duplicate', (req, res) => this.documentController.duplicateDocument(req, res));
    this.app.post('/api/sections/:id/duplicate', (req, res) => this.documentController.duplicateSection(req, res));
    this.app.put('/api/documents/:documentId/sections/reorder', (req, res) => this.documentController.reorderSections(req, res));
    this.app.put('/api/sections/:id/data', (req, res) => this.documentController.updateSectionData(req, res));
    this.app.post('/api/documents/:documentId/sections/bulk', (req, res) => this.documentController.bulkCreateSections(req, res));
    this.app.get('/api/documents/search', (req, res) => this.documentController.searchDocuments(req, res));

    this.app.get('/api/documents/:id/download', (req, res) => this.documentController.downloadDocument(req, res));
    this.app.get('/api/generated-documents', (req, res) => this.documentController.listGeneratedDocuments(req, res));
    this.app.get('/api/storage/stats', (req, res) => this.documentController.getStorageStats(req, res));
    this.app.delete('/api/generated-documents/:filename', (req, res) => this.documentController.deleteGeneratedDocument(req, res));
  }

  private setupErrorHandling(): void {
    this.app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
      console.error('Unhandled error:', err);
      res.status(500).json({ success: false, error: 'Internal server error' });
    });

    process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
      console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    });

    process.on('uncaughtException', (err: Error) => {
      console.error('Uncaught Exception:', err);
      process.exit(1);
    });

    this.app.use((_req: Request, res: Response) => {
      res.status(404).json({ success: false, error: 'Route not found' });
    });
  }

  async start(port: number = 3000): Promise<void> {
    await this.databaseManager.initializeDatabase();
    await new Promise<void>((resolve, reject) => {
      this.app.listen(port, () => {
        resolve();
      }).on('error', reject);
    });
  }

  async stop(): Promise<void> {
  }

  getApp(): express.Application {
    return this.app;
  }
}