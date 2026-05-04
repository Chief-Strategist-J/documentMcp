import { Request, Response } from 'express';
import { DatabaseManager } from '../database/DatabaseManager';
import { CephStorage } from '../storage/CephStorage';
import { SchemaValidator } from '../validation/SchemaValidator';
/**
 * Document controller for REST API endpoints
 */
export declare class DocumentController {
    private databaseManager;
    private schemaValidator;
    private documentStorage;
    cephStorage: CephStorage | null;
    constructor(databaseManager: DatabaseManager, schemaValidator: SchemaValidator);
    createDocument(req: Request, res: Response): Promise<void>;
    getDocument(req: Request, res: Response): Promise<void>;
    updateDocument(req: Request, res: Response): Promise<void>;
    listDocuments(req: Request, res: Response): Promise<void>;
    deleteDocument(req: Request, res: Response): Promise<void>;
    createSection(req: Request, res: Response): Promise<void>;
    getDocumentSections(req: Request, res: Response): Promise<void>;
    updateSection(req: Request, res: Response): Promise<void>;
    deleteSection(req: Request, res: Response): Promise<void>;
    validateSchema(req: Request, res: Response): Promise<void>;
    getHealthStatus(_req: Request, res: Response): Promise<void>;
    downloadDocument(req: Request, res: Response): Promise<void>;
    listGeneratedDocuments(_req: Request, res: Response): Promise<void>;
    getStorageStats(_req: Request, res: Response): Promise<void>;
    deleteGeneratedDocument(req: Request, res: Response): Promise<void>;
    /**
     * FIX: addSectionData now uses a dedicated DB field for row data instead of
     * spreading it into UpdateSectionRequest (which doesn't have a `data` field).
     * We store it under a separate `data` column via updateSectionData().
     */
    addSectionData(req: Request, res: Response): Promise<void>;
    getSectionData(req: Request, res: Response): Promise<void>;
    private formatBytes;
}
//# sourceMappingURL=DocumentController.d.ts.map