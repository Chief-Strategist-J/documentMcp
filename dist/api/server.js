"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentServer = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const DatabaseManager_1 = require("../database/DatabaseManager");
const MockDatabaseManager_1 = require("../database/MockDatabaseManager");
const SchemaValidator_1 = require("../validation/SchemaValidator");
const DocumentController_1 = require("./DocumentController");
// FIX: import at top instead of require() at runtime - avoids silent failures
const APIDocumentGenerator_1 = require("../generators/APIDocumentGenerator");
const DocumentStorage_1 = require("../storage/DocumentStorage");
class DocumentServer {
    constructor(databaseUrl) {
        if (!databaseUrl || typeof databaseUrl !== 'string') {
            throw new Error('Database URL must be a non-empty string');
        }
        this.app = (0, express_1.default)();
        if (databaseUrl.startsWith('mock://')) {
            console.log('🔧 Using mock database for testing');
            this.databaseManager = new MockDatabaseManager_1.MockDatabaseManager();
        }
        else {
            console.log('🗄️  Using PostgreSQL database');
            this.databaseManager = new DatabaseManager_1.DatabaseManager(databaseUrl);
        }
        this.apiGenerator = new APIDocumentGenerator_1.APIDocumentGenerator();
        this.documentController = new DocumentController_1.DocumentController(this.databaseManager, new SchemaValidator_1.SchemaValidator());
        this.setupMiddleware();
        this.setupRoutes();
        this.setupErrorHandling();
    }
    setupMiddleware() {
        this.app.use((0, cors_1.default)({
            origin: process.env['CORS_ORIGIN'] || '*',
            methods: ['GET', 'POST', 'PUT', 'DELETE'],
            allowedHeaders: ['Content-Type', 'Authorization']
        }));
        this.app.use(express_1.default.json({ limit: '10mb' }));
        this.app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
        this.app.use((req, _res, next) => {
            console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
            next();
        });
    }
    setupRoutes() {
        this.app.get('/api/health', (req, res) => this.documentController.getHealthStatus(req, res));
        // Documents
        this.app.post('/api/documents', (req, res) => this.documentController.createDocument(req, res));
        this.app.get('/api/documents', (req, res) => this.documentController.listDocuments(req, res));
        this.app.get('/api/documents/:id', (req, res) => this.documentController.getDocument(req, res));
        this.app.put('/api/documents/:id', (req, res) => this.documentController.updateDocument(req, res));
        this.app.delete('/api/documents/:id', (req, res) => this.documentController.deleteDocument(req, res));
        // Sections
        this.app.post('/api/sections', (req, res) => this.documentController.createSection(req, res));
        this.app.get('/api/documents/:documentId/sections', (req, res) => this.documentController.getDocumentSections(req, res));
        this.app.put('/api/sections/:id', (req, res) => this.documentController.updateSection(req, res));
        this.app.delete('/api/sections/:id', (req, res) => this.documentController.deleteSection(req, res));
        // Section data
        this.app.post('/api/sections/:sectionId/data', (req, res) => this.documentController.addSectionData(req, res));
        this.app.get('/api/sections/:sectionId/data', (req, res) => this.documentController.getSectionData(req, res));
        // Validation
        this.app.post('/api/validation/validate', (req, res) => this.documentController.validateSchema(req, res));
        // ── GENERATE ─────────────────────────────────────────────────────────────
        this.app.post('/api/documents/:id/generate', async (req, res) => {
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
                // FIX: sections now include .data rows because getDocumentSections
                // returns the full section record (including the data column)
                const sections = await this.databaseManager.getDocumentSections(id);
                // DEBUG: Log section data to verify content_schema
                console.log('🔍 DEBUG: Sections data for document generation:', {
                    documentId: id,
                    sectionsCount: sections.length,
                    firstSection: sections[0] ? {
                        id: sections[0].id,
                        hasContentSchema: !!sections[0].content_schema,
                        schemaId: sections[0].content_schema?.schemaId,
                        sectionType: sections[0].section_type
                    } : null
                });
                // Generate document buffer using shared instance (not require())
                const generatedDocument = await this.apiGenerator.generateAPIDocument(document, sections, format, options);
                // Save to storage
                let storageInfo;
                if (this.documentController.cephStorage) {
                    const key = await this.documentController.cephStorage.saveDocument(id, format, generatedDocument);
                    storageInfo = { key, storageType: 'ceph' };
                }
                else {
                    // FIX: reuse a single DocumentStorage instance instead of new per request
                    const documentStorage = new DocumentStorage_1.DocumentStorage();
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
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    error: error instanceof Error ? error.message : 'Unknown error occurred'
                });
            }
        });
        // Download & storage
        this.app.get('/api/documents/:id/download', (req, res) => this.documentController.downloadDocument(req, res));
        this.app.get('/api/generated-documents', (req, res) => this.documentController.listGeneratedDocuments(req, res));
        this.app.get('/api/storage/stats', (req, res) => this.documentController.getStorageStats(req, res));
        this.app.delete('/api/generated-documents/:filename', (req, res) => this.documentController.deleteGeneratedDocument(req, res));
    }
    setupErrorHandling() {
        this.app.use((err, _req, res, _next) => {
            console.error('Unhandled error:', err);
            res.status(500).json({ success: false, error: 'Internal server error' });
        });
        process.on('unhandledRejection', (reason, promise) => {
            console.error('Unhandled Rejection at:', promise, 'reason:', reason);
        });
        process.on('uncaughtException', (err) => {
            console.error('Uncaught Exception:', err);
            process.exit(1);
        });
        // 404 — must be last
        this.app.use((_req, res) => {
            res.status(404).json({ success: false, error: 'Route not found' });
        });
    }
    async start(port = 3000) {
        await this.databaseManager.initializeDatabase();
        console.log('Database initialized successfully');
        await new Promise((resolve, reject) => {
            this.app.listen(port, () => {
                console.log(`Document Management API running on port ${port}`);
                console.log(`Health check: http://localhost:${port}/api/health`);
                resolve();
            }).on('error', reject);
        });
    }
    async stop() {
        await this.databaseManager.close();
        console.log('Server stopped successfully');
    }
    getApp() {
        return this.app;
    }
}
exports.DocumentServer = DocumentServer;
//# sourceMappingURL=server.js.map