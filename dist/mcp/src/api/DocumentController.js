"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentController = void 0;
const DocumentStorage_1 = require("../storage/DocumentStorage");
const CephStorage_1 = require("../storage/CephStorage");
class DocumentController {
    constructor(databaseManager, schemaValidator) {
        this.databaseManager = databaseManager;
        this.schemaValidator = schemaValidator;
        this.cephStorage = null;
        this.documentStorage = new DocumentStorage_1.DocumentStorage();
        this.documentStorage.initialize().catch(() => { });
        const cephConfig = {
            endpoint: process.env['CEPH_ENDPOINT'] || 'http://localhost:8080',
            accessKeyId: process.env['CEPH_ACCESS_KEY'] || 'admin',
            secretAccessKey: process.env['CEPH_SECRET_KEY'] || 'admin123',
            region: process.env['CEPH_REGION'] || 'us-east-1',
            bucketName: process.env['CEPH_BUCKET'] || 'document-management'
        };
        if (process.env['USE_CEPH_STORAGE'] === 'true') {
            try {
                this.cephStorage = new CephStorage_1.CephStorage(cephConfig);
                this.cephStorage.initialize().catch(() => {
                    this.cephStorage = null;
                });
            }
            catch (error) {
                this.cephStorage = null;
            }
        }
    }
    async createDocument(req, res) {
        try {
            const request = req.body;
            if (!request.name || !request.type) {
                res.status(400).json({ success: false, error: 'Name and type are required' });
                return;
            }
            if (!['word', 'pdf'].includes(request.type)) {
                res.status(400).json({ success: false, error: 'Type must be either "word" or "pdf"' });
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
            res.status(201).json({ success: true, data: document });
        }
        catch (error) {
            res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
        }
    }
    async getDocument(req, res) {
        try {
            const { id } = req.params;
            if (!id) {
                res.status(400).json({ success: false, error: 'Document ID is required' });
                return;
            }
            const document = await this.databaseManager.getDocument(id);
            if (!document) {
                res.status(404).json({ success: false, error: 'Document not found' });
                return;
            }
            res.json({ success: true, data: document });
        }
        catch (error) {
            res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
        }
    }
    async updateDocument(req, res) {
        try {
            const { id } = req.params;
            const request = req.body;
            if (!id) {
                res.status(400).json({ success: false, error: 'Document ID is required' });
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
            const document = await this.databaseManager.updateDocument(id, request);
            if (!document) {
                res.status(404).json({ success: false, error: 'Document not found' });
                return;
            }
            res.json({ success: true, data: document });
        }
        catch (error) {
            res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
        }
    }
    async listDocuments(req, res) {
        try {
            const limit = parseInt(req.query['limit']) || 100;
            const offset = parseInt(req.query['offset']) || 0;
            if (limit < 1 || limit > 1000) {
                res.status(400).json({ success: false, error: 'Limit must be between 1 and 1000' });
                return;
            }
            if (offset < 0) {
                res.status(400).json({ success: false, error: 'Offset must be non-negative' });
                return;
            }
            const documents = await this.databaseManager.listDocuments(limit, offset);
            res.json({ success: true, data: documents });
        }
        catch (error) {
            res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
        }
    }
    async deleteDocument(req, res) {
        try {
            const { id } = req.params;
            if (!id) {
                res.status(400).json({ success: false, error: 'Document ID is required' });
                return;
            }
            const deleted = await this.databaseManager.deleteDocument(id);
            if (!deleted) {
                res.status(404).json({ success: false, error: 'Document not found' });
                return;
            }
            res.json({ success: true, message: 'Document deleted successfully' });
        }
        catch (error) {
            res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
        }
    }
    async createSection(req, res) {
        try {
            const request = req.body;
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
                res.status(400).json({ success: false, error: 'Invalid content schema', details: errors });
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
            res.status(201).json({ success: true, data: section });
        }
        catch (error) {
            res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
        }
    }
    async getDocumentSections(req, res) {
        try {
            const { documentId } = req.params;
            if (!documentId) {
                res.status(400).json({ success: false, error: 'Document ID is required' });
                return;
            }
            const sections = await this.databaseManager.getDocumentSections(documentId);
            res.json({ success: true, data: sections });
        }
        catch (error) {
            res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
        }
    }
    async updateSection(req, res) {
        try {
            const { id } = req.params;
            const request = req.body;
            if (!id) {
                res.status(400).json({ success: false, error: 'Section ID is required' });
                return;
            }
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
            if (!section) {
                res.status(404).json({ success: false, error: 'Section not found' });
                return;
            }
            res.json({ success: true, data: section });
        }
        catch (error) {
            res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
        }
    }
    async deleteSection(req, res) {
        try {
            const { id } = req.params;
            if (!id) {
                res.status(400).json({ success: false, error: 'Section ID is required' });
                return;
            }
            const deleted = await this.databaseManager.deleteSection(id);
            if (!deleted) {
                res.status(404).json({ success: false, error: 'Section not found' });
                return;
            }
            res.json({ success: true, message: 'Section deleted successfully' });
        }
        catch (error) {
            res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
        }
    }
    async validateSchema(req, res) {
        try {
            const { schema, schemaType } = req.body;
            if (!schema || !schemaType) {
                res.status(400).json({ success: false, error: 'Schema and schema type are required' });
                return;
            }
            let isValid = false;
            let errors = [];
            switch (schemaType) {
                case 'document':
                    isValid = this.schemaValidator.validateDocumentLayout(schema);
                    if (!isValid)
                        errors = this.schemaValidator.getValidationErrors(schema, 'document');
                    break;
                case 'section':
                    isValid = this.schemaValidator.validateSectionContent(schema);
                    if (!isValid)
                        errors = this.schemaValidator.getValidationErrors(schema, 'section');
                    break;
                case 'styling':
                    isValid = this.schemaValidator.validateStyling(schema);
                    if (!isValid)
                        errors = this.schemaValidator.getValidationErrors(schema, 'styling');
                    break;
                default:
                    res.status(400).json({ success: false, error: 'Invalid schema type. Must be document, section, or styling' });
                    return;
            }
            res.json({ success: true, data: { valid: isValid, errors: isValid ? undefined : errors } });
        }
        catch (error) {
            res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
        }
    }
    async getHealthStatus(_req, res) {
        res.json({ success: true, data: { status: 'healthy', timestamp: new Date().toISOString() } });
    }
    async downloadDocument(req, res) {
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
            res.sendFile(filePath, (error) => {
                if (error) {
                    if (!res.headersSent) {
                        res.status(500).json({ success: false, error: 'Failed to download document' });
                    }
                }
            });
        }
        catch (error) {
            res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
        }
    }
    async listGeneratedDocuments(_req, res) {
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
            });
        }
        catch (error) {
            res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
        }
    }
    async getStorageStats(_req, res) {
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
            });
        }
        catch (error) {
            res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
        }
    }
    async deleteGeneratedDocument(req, res) {
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
            const deleted = await this.documentStorage.deleteDocument(id, format);
            if (!deleted) {
                res.status(404).json({ success: false, error: 'Document not found' });
                return;
            }
            res.json({ success: true, message: 'Document deleted successfully' });
        }
        catch (error) {
            res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
        }
    }
    async addSectionData(req, res) {
        try {
            const request = req.body;
            if (!request || typeof request !== 'object') {
                res.status(400).json({ success: false, error: 'Request body is required' });
                return;
            }
            if (!request.sectionId || typeof request.sectionId !== 'string') {
                res.status(400).json({ success: false, error: 'Section ID is required' });
                return;
            }
            if (!request.data || !Array.isArray(request.data)) {
                res.status(400).json({ success: false, error: 'Data array is required' });
                return;
            }
            const section = await this.databaseManager.getSection(request.sectionId);
            if (!section) {
                res.status(404).json({ success: false, error: 'Section not found' });
                return;
            }
            const updatedSection = await this.databaseManager.updateSectionData(request.sectionId, request.data);
            res.json({
                success: true,
                data: {
                    sectionId: request.sectionId,
                    dataCount: request.data.length,
                    section: updatedSection
                }
            });
        }
        catch (error) {
            res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
        }
    }
    async getSectionData(req, res) {
        try {
            const { sectionId } = req.params;
            if (!sectionId || typeof sectionId !== 'string') {
                res.status(400).json({ success: false, error: 'Section ID is required' });
                return;
            }
            const section = await this.databaseManager.getSection(sectionId);
            if (!section) {
                res.status(404).json({ success: false, error: 'Section not found' });
                return;
            }
            const data = Array.isArray(section.data) ? section.data : [];
            res.json({
                success: true,
                data: {
                    sectionId,
                    data,
                    dataCount: data.length
                }
            });
        }
        catch (error) {
            res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
        }
    }
    async duplicateDocument(req, res) {
        try {
            const { id } = req.params;
            const { newName } = req.body;
            if (!id) {
                res.status(400).json({ success: false, error: 'Document ID is required' });
                return;
            }
            const duplicatedDocument = await this.databaseManager.duplicateDocument(id, newName);
            if (!duplicatedDocument) {
                res.status(404).json({ success: false, error: 'Document not found' });
                return;
            }
            res.status(201).json({ success: true, data: duplicatedDocument });
        }
        catch (error) {
            res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
        }
    }
    async duplicateSection(req, res) {
        try {
            const { id } = req.params;
            const { newDocumentId } = req.body;
            if (!id) {
                res.status(400).json({ success: false, error: 'Section ID is required' });
                return;
            }
            const duplicatedSection = await this.databaseManager.duplicateSection(id, newDocumentId);
            if (!duplicatedSection) {
                res.status(404).json({ success: false, error: 'Section not found' });
                return;
            }
            res.status(201).json({ success: true, data: duplicatedSection });
        }
        catch (error) {
            res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
        }
    }
    async reorderSections(req, res) {
        try {
            const { documentId } = req.params;
            const { sectionOrders } = req.body;
            if (!documentId) {
                res.status(400).json({ success: false, error: 'Document ID is required' });
                return;
            }
            if (!sectionOrders || !Array.isArray(sectionOrders)) {
                res.status(400).json({ success: false, error: 'Section orders array is required' });
                return;
            }
            const reorderedSections = await this.databaseManager.reorderSections(documentId, sectionOrders);
            res.json({ success: true, data: reorderedSections });
        }
        catch (error) {
            res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
        }
    }
    async updateSectionData(req, res) {
        try {
            const { id } = req.params;
            const { data } = req.body;
            if (!id) {
                res.status(400).json({ success: false, error: 'Section ID is required' });
                return;
            }
            if (!data || !Array.isArray(data)) {
                res.status(400).json({ success: false, error: 'Data array is required' });
                return;
            }
            const updatedSection = await this.databaseManager.updateSectionData(id, data);
            if (!updatedSection) {
                res.status(404).json({ success: false, error: 'Section not found' });
                return;
            }
            res.json({ success: true, data: updatedSection });
        }
        catch (error) {
            res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
        }
    }
    async bulkCreateSections(req, res) {
        try {
            const { documentId } = req.params;
            const { sections } = req.body;
            if (!documentId) {
                res.status(400).json({ success: false, error: 'Document ID is required' });
                return;
            }
            if (!sections || !Array.isArray(sections)) {
                res.status(400).json({ success: false, error: 'Sections array is required' });
                return;
            }
            const createdSections = await this.databaseManager.bulkCreateSections(documentId, sections);
            res.status(201).json({ success: true, data: createdSections });
        }
        catch (error) {
            res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
        }
    }
    async searchDocuments(req, res) {
        try {
            const { query } = req.query;
            const limit = parseInt(req.query['limit']) || 100;
            const offset = parseInt(req.query['offset']) || 0;
            if (!query || typeof query !== 'string') {
                res.status(400).json({ success: false, error: 'Search query is required' });
                return;
            }
            if (limit < 1 || limit > 1000) {
                res.status(400).json({ success: false, error: 'Limit must be between 1 and 1000' });
                return;
            }
            if (offset < 0) {
                res.status(400).json({ success: false, error: 'Offset must be non-negative' });
                return;
            }
            const documents = await this.databaseManager.searchDocuments(query, limit, offset);
            res.json({ success: true, data: documents });
        }
        catch (error) {
            res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
        }
    }
    formatBytes(bytes) {
        if (bytes === 0)
            return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}
exports.DocumentController = DocumentController;
