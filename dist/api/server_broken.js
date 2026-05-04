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
const DocumentGenerator_1 = require("../generators/DocumentGenerator");
/**
 * Express server setup for document management API
 * Follows DRY principles - centralized server configuration
 * Follows strict null handling and typecasting rules
 */
class DocumentServer {
    constructor(databaseUrl) {
        // Validate input - follows null handling rules
        if (!databaseUrl || typeof databaseUrl !== 'string') {
            throw new Error('Database URL must be a non-empty string');
        }
        this.app = (0, express_1.default)();
        // Choose database manager based on connection string - follows DRY principles
        if (databaseUrl.startsWith('mock://')) {
            console.log('🔧 Using mock database for testing');
            this.databaseManager = new MockDatabaseManager_1.MockDatabaseManager();
        }
        else {
            console.log('🗄️  Using PostgreSQL database');
            this.databaseManager = new DatabaseManager_1.DatabaseManager(databaseUrl);
        }
        const schemaValidator = new SchemaValidator_1.SchemaValidator();
        this.documentController = new DocumentController_1.DocumentController(this.databaseManager, schemaValidator);
        this.documentGenerator = new DocumentGenerator_1.DocumentGenerator();
        this.setupMiddleware();
        this.setupRoutes();
        this.setupErrorHandling();
    }
    /**
     * Sets up express middleware
     */
    setupMiddleware() {
        // CORS middleware
        this.app.use((0, cors_1.default)({
            origin: process.env['CORS_ORIGIN'] || '*',
            methods: ['GET', 'POST', 'PUT', 'DELETE'],
            allowedHeaders: ['Content-Type', 'Authorization']
        }));
        // JSON parsing middleware
        this.app.use(express_1.default.json({ limit: '10mb' }));
        // URL parsing middleware
        this.app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
        // Request logging middleware
        this.app.use((req, res, next) => {
            console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
            next();
        });
    }
    /**
     * Sets up API routes
     */
    setupRoutes() {
        // Health check endpoint
        this.app.get('/api/health', (req, res) => this.documentController.getHealthStatus(req, res));
        // Document download routes
        this.app.get('/api/documents/:id/download', (req, res) => this.documentController.downloadDocument(req, res));
        this.app.get('/api/generated-documents', (req, res) => this.documentController.listGeneratedDocuments(req, res));
        this.app.get('/api/storage/stats', (req, res) => this.documentController.getStorageStats(req, res));
        this.app.delete('/api/generated-documents/:id', (req, res) => this.documentController.deleteGeneratedDocument(req, res));
        // Document routes
        this.app.post('/api/documents', (req, res) => this.documentController.createDocument(req, res));
        this.app.get('/api/documents', (req, res) => this.documentController.listDocuments(req, res));
        this.app.get('/api/documents/:id', (req, res) => this.documentController.getDocument(req, res));
        this.app.put('/api/documents/:id', (req, res) => this.documentController.updateDocument(req, res));
        this.app.delete('/api/documents/:id', (req, res) => this.documentController.deleteDocument(req, res));
        // Section routes
        this.app.post('/api/sections', (req, res) => this.documentController.createSection(req, res));
        this.app.get('/api/documents/:documentId/sections', (req, res) => this.documentController.getDocumentSections(req, res));
        // Note: getSection endpoint to be implemented
        this.app.put('/api/sections/:id', (req, res) => this.documentController.updateSection(req, res));
        this.app.delete('/api/sections/:id', (req, res) => this.documentController.deleteSection(req, res));
        // Validation routes
        this.app.post('/api/validation/validate', (req, res) => this.documentController.validateSchema(req, res));
        // Document generation routes
        this.app.post('/api/documents/:id/generate', async (req, res) => {
            try {
                const { id } = req.params;
                const { format, options } = req.body;
                if (!id) {
                    res.status(400).json({
                        success: false,
                        error: 'Document ID is required'
                    });
                    return;
                }
                if (!format || !['word', 'pdf'].includes(format)) {
                    res.status(400).json({
                        success: false,
                        error: 'Format must be either "word" or "pdf"'
                    });
                    return;
                }
                const document = await this.databaseManager.getDocument(id);
                if (!document) {
                    res.status(404).json({
                        success: false,
                        error: 'Document not found'
                    });
                    return;
                }
                const sections = await this.databaseManager.getDocumentSections(id);
                // Use API-based document generator with real data
                const APIDocumentGenerator = require('../generators/APIDocumentGenerator').APIDocumentGenerator;
                const apiGenerator = new APIDocumentGenerator();
                const generatedDocument = await apiGenerator.generateAPIDocument(document, sections, format, options);
                // Save to appropriate storage backend
                let storageInfo;
                if (this.documentController['cephStorage']) {
                    // Use Ceph storage
                    const CephStorage = require('../storage/CephStorage').CephStorage;
                    const cephStorage = new CephStorage({
                        endpoint: process.env['CEPH_ENDPOINT'] || 'http://localhost:8080',
                        accessKeyId: process.env['CEPH_ACCESS_KEY'] || 'admin',
                        secretAccessKey: process.env['CEPH_SECRET_KEY'] || 'admin123',
                        bucketName: process.env['CEPH_BUCKET'] || 'document-management'
                    });
                    await cephStorage.initialize();
                    const key = await cephStorage.saveDocument(id, format, generatedDocument);
                    storageInfo = { key, storageType: 'ceph' };
                }
                else {
                    // Use local file storage
                    const DocumentStorage = require('../storage/DocumentStorage').DocumentStorage;
                    const documentStorage = new DocumentStorage();
                    await documentStorage.initialize();
                    const filePath = await documentStorage.saveDocument(id, format, generatedDocument);
                    storageInfo = { filePath, storageType: 'local' };
                }
                // Return success response with file info
                res.json({
                    success: true,
                    data: {
                        documentId: id,
                        format: format,
                        ...storageInfo,
                        downloadUrl: `/api/documents/${id}/download?format=${format}`,
                        generatedAt: new Date().toISOString(),
                        generator: 'api-based',
                        content: 'pure-api-document',
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
        // Schema template routes
        this.app.get('/api/schemas/templates/:type', (req, res) => {
            this.documentController.getSchemaTemplate(req, res);
            'header';
            'schemas/sections/header-footer-schema.json',
                'footer';
            'schemas/sections/header-footer-schema.json',
                'image';
            'schemas/sections/image-schema.json',
                'chart';
            'schemas/sections/chart-schema.json',
                'word-styling';
            'schemas/styling/word-styling.json',
                'pdf-styling';
            'schemas/styling/pdf-styling.json';
        });
        const schemaFile = schemaFiles[type];
        if (!schemaFile) {
            res.status(404).json({
                success: false,
                error: 'Schema template not found'
            });
            return;
        }
        const schemaPath = path.join(__dirname, '../../..', schemaFile);
        const schemaData = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
        res.json({
            success: true,
            data: schemaData
        });
    }
    catch(error) {
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error occurred'
        });
    }
}
exports.DocumentServer = DocumentServer;
;
// 404 handler
this.app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Route not found'
    });
});
setupErrorHandling();
void {
    // Global error handler
    this: .app.use((err, req, res, next) => {
        console.error('Unhandled error:', err);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }),
    // Handle unhandled promise rejections
    process, : .on('unhandledRejection', (reason, promise) => {
        console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    }),
    // Handle uncaught exceptions
    process, : .on('uncaughtException', (err) => {
        console.error('Uncaught Exception:', err);
        process.exit(1);
    })
};
/**
 * Starts the server
 * @param port - Port to listen on
 * @returns Promise that resolves when server is ready
 */
async;
start(port, number = 3000);
Promise < void  > {
    try: {
        // Initialize database
        await, this: .databaseManager.initializeDatabase(),
        console, : .log('Database initialized successfully'),
        // Start server
        this: .app.listen(port, () => {
            console.log(`Document Management API server running on port ${port}`);
            console.log(`Health check available at: http://localhost:${port}/api/health`);
        })
    }, catch(error) {
        console.error('Failed to start server:', error);
        throw error;
    }
};
/**
 * Stops the server and closes database connections
 */
async;
stop();
Promise < void  > {
    try: {
        await, this: .databaseManager.close(),
        console, : .log('Server stopped successfully')
    }, catch(error) {
        console.error('Error stopping server:', error);
        throw error;
    }
};
/**
 * Gets the Express app instance (for testing)
 * @returns Express app instance
 */
getApp();
express_1.default.Application;
{
    return this.app;
}
//# sourceMappingURL=server_broken.js.map