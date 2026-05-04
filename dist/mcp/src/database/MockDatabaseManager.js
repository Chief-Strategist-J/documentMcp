"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockDatabaseManager = void 0;
const uuid_1 = require("uuid");
/**
 * Mock database manager for testing without PostgreSQL
 * Follows DRY principles - centralized database operations
 * Follows strict null handling and typecasting rules
 * Follows coupling taxonomy (Name/Type coupling only)
 */
class MockDatabaseManager {
    constructor(connectionString) {
        this.documents = new Map();
        this.sections = new Map();
        this.sectionContent = new Map();
        this.isInitialized = false;
        // Mock database doesn't need connection string but validates input
        if (connectionString !== undefined && typeof connectionString !== 'string') {
            throw new Error('Connection string must be undefined or a string');
        }
    }
    /**
     * Initializes mock database tables - follows single source of truth principle
     */
    async initializeDatabase() {
        // Mock initialization - no actual database operations
        this.isInitialized = true;
    }
    /**
     * Creates a document - follows strict null handling and validation
     * @param document - Document configuration
     * @returns Created document
     */
    async createDocument(document) {
        // Validate inputs - follows strict null handling rules
        if (!document) {
            throw new Error('Document cannot be null or undefined');
        }
        if (!document.name || typeof document.name !== 'string') {
            throw new Error('Document name must be a non-empty string');
        }
        if (!document.type || !['word', 'pdf'].includes(document.type)) {
            throw new Error('Document type must be either "word" or "pdf"');
        }
        const id = (0, uuid_1.v4)();
        const now = new Date().toISOString();
        const createdDocument = {
            id,
            name: document.name,
            type: document.type,
            layoutSchema: document.layoutSchema || {
                schemaId: 'default',
                schemaVersion: '1.0.0',
                tableName: 'Default Table',
                dimensions: {
                    minRows: 1,
                    maxRows: 100,
                    defaultRows: 10,
                    columnCount: 3
                }
            },
            created_at: now,
            updated_at: now
        };
        this.documents.set(id, createdDocument);
        return createdDocument;
    }
    /**
     * Gets a document by ID - follows strict null checks
     * @param id - Document ID
     * @returns Document or null if not found
     */
    async getDocument(id) {
        // Validate input - follows null handling rules
        if (!id || typeof id !== 'string') {
            throw new Error('Document ID must be a non-empty string');
        }
        const document = this.documents.get(id);
        return document || null;
    }
    /**
     * Updates a document - follows typecasting rules
     * @param id - Document ID
     * @param updates - Document updates
     * @returns Updated document or null
     */
    async updateDocument(id, updates) {
        // Validate inputs
        if (!id || typeof id !== 'string') {
            throw new Error('Document ID must be a non-empty string');
        }
        if (!updates || typeof updates !== 'object') {
            throw new Error('Updates must be a valid object');
        }
        const existingDocument = this.documents.get(id);
        if (!existingDocument) {
            return null;
        }
        // Apply updates with validation
        const updatedDocument = {
            ...existingDocument,
            ...updates,
            id,
            updated_at: new Date().toISOString()
        };
        this.documents.set(id, updatedDocument);
        return updatedDocument;
    }
    /**
     * Lists documents with pagination - follows boundary condition handling
     * @param limit - Maximum number of documents to return
     * @param offset - Number of documents to skip
     * @returns Array of documents
     */
    async listDocuments(limit, offset) {
        // Validate inputs - follows boundary condition rules
        if (typeof limit !== 'number' || limit < 0 || limit > 1000) {
            throw new Error('Limit must be a number between 0 and 1000');
        }
        if (typeof offset !== 'number' || offset < 0) {
            throw new Error('Offset must be a non-negative number');
        }
        const allDocuments = Array.from(this.documents.values());
        const startIndex = Math.min(offset, allDocuments.length);
        const endIndex = Math.min(startIndex + limit, allDocuments.length);
        return allDocuments.slice(startIndex, endIndex);
    }
    /**
     * Deletes a document - follows proper error handling
     * @param id - Document ID
     * @returns True if document was deleted
     */
    async deleteDocument(id) {
        // Validate input
        if (!id || typeof id !== 'string') {
            throw new Error('Document ID must be a non-empty string');
        }
        const deleted = this.documents.delete(id);
        // Clean up related sections
        if (deleted) {
            for (const [sectionId, section] of this.sections) {
                if (section.document_id === id) {
                    this.sections.delete(sectionId);
                    this.sectionContent.delete(sectionId);
                }
            }
        }
        return deleted;
    }
    /**
     * Creates a section - follows strict validation
     * @param section - Section data
     * @returns Created section
     */
    async createSection(section) {
        // Validate inputs
        if (!section) {
            throw new Error('Section cannot be null or undefined');
        }
        if (!section.documentId || typeof section.documentId !== 'string') {
            throw new Error('Document ID must be a non-empty string');
        }
        if (!section.sectionType || typeof section.sectionType !== 'string') {
            throw new Error('Section type must be a non-empty string');
        }
        const id = (0, uuid_1.v4)();
        const now = new Date().toISOString();
        const createdSection = {
            id,
            document_id: section.documentId,
            section_type: section.sectionType,
            section_order: typeof section.sectionOrder === 'number' ? section.sectionOrder : 1,
            content_schema: section.contentSchema || {},
            styling_schema: section.stylingSchema || {},
            created_at: now,
            updated_at: now
        };
        this.sections.set(id, createdSection);
        return createdSection;
    }
    /**
     * Gets sections for a document - follows list handling rules
     * @param documentId - Document ID
     * @returns Array of sections
     */
    async getDocumentSections(documentId) {
        // Validate input
        if (!documentId || typeof documentId !== 'string') {
            throw new Error('Document ID must be a non-empty string');
        }
        const allSections = Array.from(this.sections.values());
        const documentSections = allSections.filter(section => section.document_id === documentId);
        // Sort by section order
        return documentSections.sort((a, b) => a.section_order - b.section_order);
    }
    /**
     * Updates a section - follows typecasting and validation rules
     * @param id - Section ID
     * @param updates - Section updates
     * @returns Updated section or null
     */
    async updateSection(id, updates) {
        // Validate inputs
        if (!id || typeof id !== 'string') {
            throw new Error('Section ID must be a non-empty string');
        }
        if (!updates || typeof updates !== 'object') {
            throw new Error('Updates must be a valid object');
        }
        const existingSection = this.sections.get(id);
        if (!existingSection) {
            return null;
        }
        // Apply updates with validation
        const updatedSection = {
            ...existingSection,
            ...updates,
            id,
            updated_at: new Date().toISOString()
        };
        this.sections.set(id, updatedSection);
        return updatedSection;
    }
    /**
     * Deletes a section - follows proper cleanup
     * @param id - Section ID
     * @returns True if section was deleted
     */
    async deleteSection(id) {
        // Validate input
        if (!id || typeof id !== 'string') {
            throw new Error('Section ID must be a non-empty string');
        }
        const deleted = this.sections.delete(id);
        // Clean up related content
        if (deleted) {
            this.sectionContent.delete(id);
        }
        return deleted;
    }
    /**
     * Gets a section by ID - follows null handling
     * @param id - Section ID
     * @returns Section or null if not found
     */
    async getSection(id) {
        // Validate input
        if (!id || typeof id !== 'string') {
            throw new Error('Section ID must be a non-empty string');
        }
        const section = this.sections.get(id);
        return section || null;
    }
    /**
     * Updates section data separately from other section properties
     * @param id - Section ID
     * @param data - Array of data objects
     * @returns Updated section or null if not found
     */
    async updateSectionData(id, data) {
        // Validate input
        if (!id || typeof id !== 'string') {
            throw new Error('Section ID must be a non-empty string');
        }
        if (!data || !Array.isArray(data)) {
            throw new Error('Data must be a non-empty array');
        }
        // First check if section exists
        const section = this.sections.get(id);
        if (!section) {
            return null;
        }
        // Update the section with data
        const updatedSection = {
            ...section,
            data
        };
        this.sections.set(id, updatedSection);
        return updatedSection;
    }
    async duplicateDocument(id, newName) {
        if (!id || typeof id !== 'string') {
            throw new Error('Document ID must be a non-empty string');
        }
        const originalDocument = this.documents.get(id);
        if (!originalDocument) {
            return null;
        }
        const originalSections = await this.getDocumentSections(id);
        const newDocument = await this.createDocument({
            name: newName || `${originalDocument.name} (Copy)`,
            type: originalDocument.type,
            layoutSchema: originalDocument.layoutSchema
        });
        for (const section of originalSections) {
            await this.createSection({
                documentId: newDocument.id,
                sectionType: section.section_type,
                sectionOrder: section.section_order,
                contentSchema: section.content_schema,
                stylingSchema: section.styling_schema
            });
        }
        return newDocument;
    }
    async duplicateSection(id, newDocumentId) {
        if (!id || typeof id !== 'string') {
            throw new Error('Section ID must be a non-empty string');
        }
        const originalSection = this.sections.get(id);
        if (!originalSection) {
            return null;
        }
        const targetDocumentId = newDocumentId || originalSection.document_id;
        const documentSections = await this.getDocumentSections(targetDocumentId);
        const maxOrder = Math.max(...documentSections.map(s => s.section_order), 0);
        const newSectionOrder = maxOrder + 1;
        const newSection = await this.createSection({
            documentId: targetDocumentId,
            sectionType: originalSection.section_type,
            sectionOrder: newSectionOrder,
            contentSchema: originalSection.content_schema,
            stylingSchema: originalSection.styling_schema
        });
        if (originalSection.data) {
            await this.updateSectionData(newSection.id, originalSection.data);
        }
        return newSection;
    }
    async reorderSections(documentId, sectionOrders) {
        if (!documentId || typeof documentId !== 'string') {
            throw new Error('Document ID must be a non-empty string');
        }
        if (!sectionOrders || !Array.isArray(sectionOrders)) {
            throw new Error('Section orders must be a valid array');
        }
        for (const { id, order } of sectionOrders) {
            const section = this.sections.get(id);
            if (section && section.document_id === documentId) {
                section.section_order = order;
                section.updated_at = new Date().toISOString();
            }
        }
        return await this.getDocumentSections(documentId);
    }
    async bulkCreateSections(documentId, sections) {
        if (!documentId || typeof documentId !== 'string') {
            throw new Error('Document ID must be a non-empty string');
        }
        if (!sections || !Array.isArray(sections)) {
            throw new Error('Sections must be a valid array');
        }
        const createdSections = [];
        for (let index = 0; index < sections.length; index++) {
            const sectionConfig = sections[index];
            const section = await this.createSection({
                documentId,
                sectionType: sectionConfig.sectionType,
                sectionOrder: sectionConfig.sectionOrder || index + 1,
                contentSchema: sectionConfig.contentSchema,
                stylingSchema: sectionConfig.stylingSchema
            });
            createdSections.push(section);
        }
        return createdSections;
    }
    async searchDocuments(query, limit = 100, offset = 0) {
        if (!query || typeof query !== 'string') {
            throw new Error('Search query must be a non-empty string');
        }
        if (typeof limit !== 'number' || limit < 0 || limit > 1000) {
            throw new Error('Limit must be a number between 0 and 1000');
        }
        if (typeof offset !== 'number' || offset < 0) {
            throw new Error('Offset must be a non-negative number');
        }
        const allDocuments = Array.from(this.documents.values());
        const filteredDocuments = allDocuments.filter(doc => doc.name.toLowerCase().includes(query.toLowerCase()) ||
            doc.type.toLowerCase().includes(query.toLowerCase()));
        const startIndex = Math.min(offset, filteredDocuments.length);
        const endIndex = Math.min(startIndex + limit, filteredDocuments.length);
        return filteredDocuments.slice(startIndex, endIndex);
    }
    /**
     * Gets database initialization status - follows explicit return types
     * @returns True if database is initialized
     */
    isReady() {
        return this.isInitialized;
    }
    /**
     * Gets database statistics - for monitoring
     * @returns Database statistics object
     */
    getStats() {
        return {
            documents: this.documents.size,
            sections: this.sections.size,
            content: this.sectionContent.size
        };
    }
}
exports.MockDatabaseManager = MockDatabaseManager;
