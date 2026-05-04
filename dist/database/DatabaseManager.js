"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseManager = void 0;
const pg_promise_1 = __importDefault(require("pg-promise"));
const uuid_1 = require("uuid");
/**
 * Database manager for document and section storage
 * Follows DRY principles - centralized database operations
 * Follows strict null handling and typecasting rules
 */
class DatabaseManager {
    constructor(connectionString) {
        this.isConnected = false;
        // Validate input before processing - strict null handling
        if (!connectionString || typeof connectionString !== 'string' || connectionString.trim().length === 0) {
            throw new Error('Database connection string must be a non-empty string');
        }
        const pgp = (0, pg_promise_1.default)({
            // Error handling - centralized per DRY rules
            error(error, event) {
                if (process.env['NODE_ENV'] === 'development') {
                    console.error('Database error:', error);
                }
            }
        });
        try {
            this.db = pgp(connectionString);
        }
        catch (error) {
            throw new Error(`Failed to initialize database connection: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Initializes database tables
     * Single source of truth for database schema
     */
    async initializeDatabase() {
        await this.createDocumentsTable();
        await this.createSectionsTable();
        await this.createSectionContentTable();
    }
    /**
     * Creates documents table
     */
    async createDocumentsTable() {
        const query = `
      CREATE TABLE IF NOT EXISTS documents (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        type VARCHAR(10) NOT NULL CHECK (type IN ('word', 'pdf')),
        layout_schema JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE INDEX IF NOT EXISTS idx_documents_type ON documents(type);
      CREATE INDEX IF NOT EXISTS idx_documents_created_at ON documents(created_at);
    `;
        await this.db.none(query);
    }
    /**
     * Creates sections table
     */
    async createSectionsTable() {
        const query = `
      CREATE TABLE IF NOT EXISTS sections (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
        section_type VARCHAR(20) NOT NULL CHECK (section_type IN ('table', 'paragraph', 'header', 'footer', 'image', 'chart')),
        section_order INTEGER NOT NULL,
        content_schema JSONB NOT NULL,
        styling_schema JSONB NOT NULL,
        data JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE INDEX IF NOT EXISTS idx_sections_document_id ON sections(document_id);
      CREATE INDEX IF NOT EXISTS idx_sections_type ON sections(section_type);
      CREATE INDEX IF NOT EXISTS idx_sections_order ON sections(document_id, section_order);
    `;
        await this.db.none(query);
    }
    /**
     * Creates section content table
     */
    async createSectionContentTable() {
        const query = `
      CREATE TABLE IF NOT EXISTS section_content (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        section_id UUID NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
        content_type VARCHAR(50) NOT NULL,
        content_data JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE INDEX IF NOT EXISTS idx_section_content_section_id ON section_content(section_id);
      CREATE INDEX IF NOT EXISTS idx_section_content_type ON section_content(content_type);
    `;
        await this.db.none(query);
    }
    /**
     * Creates a new document
     * @param documentConfig - Document configuration
     * @returns Created document
     */
    async createDocument(documentConfig) {
        const id = (0, uuid_1.v4)();
        const now = new Date();
        const query = `
      INSERT INTO documents (id, name, type, layout_schema, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, name, type, layout_schema, created_at, updated_at;
    `;
        const result = await this.db.one(query, [
            id,
            documentConfig.name,
            documentConfig.type,
            JSON.stringify(documentConfig.layoutSchema),
            now,
            now
        ]);
        return {
            id: result.id,
            name: result.name,
            type: result.type,
            layoutSchema: result.layout_schema,
            createdAt: result.created_at,
            updatedAt: result.updated_at
        };
    }
    /**
     * Gets a document by ID
     * @param id - Document ID
     * @returns Document or null if not found
     */
    async getDocument(id) {
        const query = `
      SELECT id, name, type, layout_schema, created_at, updated_at
      FROM documents
      WHERE id = $1;
    `;
        try {
            const result = await this.db.one(query, [id]);
            return {
                id: result.id,
                name: result.name,
                type: result.type,
                layoutSchema: result.layout_schema,
                createdAt: result.created_at,
                updatedAt: result.updated_at
            };
        }
        catch (error) {
            return null;
        }
    }
    /**
     * Updates a document
     * @param id - Document ID
     * @param updates - Document updates
     * @returns Updated document or null if not found
     */
    async updateDocument(id, updates) {
        const setClause = [];
        const values = [];
        let paramIndex = 1;
        if (updates.name !== undefined) {
            setClause.push(`name = $${paramIndex++}`);
            values.push(updates.name);
        }
        if (updates.type !== undefined) {
            setClause.push(`type = $${paramIndex++}`);
            values.push(updates.type);
        }
        if (updates.layoutSchema !== undefined) {
            setClause.push(`layout_schema = $${paramIndex++}`);
            values.push(JSON.stringify(updates.layoutSchema));
        }
        if (setClause.length === 0) {
            return this.getDocument(id);
        }
        setClause.push(`updated_at = $${paramIndex++}`);
        values.push(new Date());
        values.push(id);
        const query = `
      UPDATE documents
      SET ${setClause.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING id, name, type, layout_schema, created_at, updated_at;
    `;
        try {
            const result = await this.db.one(query, values);
            return {
                id: result.id,
                name: result.name,
                type: result.type,
                layoutSchema: result.layout_schema,
                createdAt: result.created_at,
                updatedAt: result.updated_at
            };
        }
        catch (error) {
            return null;
        }
    }
    /**
     * Lists all documents
     * @param limit - Maximum number of documents to return
     * @param offset - Offset for pagination
     * @returns Array of documents
     */
    async listDocuments(limit = 100, offset = 0) {
        const query = `
      SELECT id, name, type, layout_schema, created_at, updated_at
      FROM documents
      ORDER BY created_at DESC
      LIMIT $1 OFFSET $2;
    `;
        const results = await this.db.manyOrNone(query, [limit, offset]);
        return results.map((result) => ({
            id: result.id,
            name: result.name,
            type: result.type,
            layoutSchema: result.layout_schema,
            createdAt: result.created_at,
            updatedAt: result.updated_at
        }));
    }
    /**
     * Deletes a document
     * @param id - Document ID
     * @returns True if document was deleted, false if not found
     */
    async deleteDocument(id) {
        const query = 'DELETE FROM documents WHERE id = $1 RETURNING id;';
        const result = await this.db.oneOrNone(query, [id]);
        return result !== null;
    }
    /**
     * Creates a new section
     * @param section - Section configuration
     * @returns Created section
     */
    async createSection(section) {
        const id = (0, uuid_1.v4)();
        const query = `
      INSERT INTO sections (id, document_id, section_type, section_order, content_schema, styling_schema, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, document_id, section_type, section_order, content_schema, styling_schema, created_at;
    `;
        const result = await this.db.one(query, [
            id,
            section.documentId,
            section.sectionType,
            section.sectionOrder,
            JSON.stringify(section.contentSchema),
            JSON.stringify(section.stylingSchema),
            new Date()
        ]);
        return {
            id: result.id,
            documentId: result.document_id,
            sectionType: result.section_type,
            sectionOrder: result.section_order,
            contentSchema: result.content_schema,
            stylingSchema: result.styling_schema,
            createdAt: result.created_at
        };
    }
    /**
     * Gets sections for a document
     * @param documentId - Document ID
     * @returns Array of sections
     */
    async getDocumentSections(documentId) {
        const query = `
      SELECT id, document_id, section_type, section_order, content_schema, styling_schema, created_at
      FROM sections
      WHERE document_id = $1
      ORDER BY section_order;
    `;
        const results = await this.db.manyOrNone(query, [documentId]);
        return results.map((result) => ({
            id: result.id,
            documentId: result.document_id,
            sectionType: result.section_type,
            sectionOrder: result.section_order,
            contentSchema: result.content_schema,
            stylingSchema: result.styling_schema,
            createdAt: result.created_at
        }));
    }
    /**
     * Updates a section
     * @param id - Section ID
     * @param updates - Section updates
     * @returns Updated section or null if not found
     */
    async updateSection(id, updates) {
        const setClause = [];
        const values = [];
        let paramIndex = 1;
        if (updates.sectionType !== undefined) {
            setClause.push(`section_type = $${paramIndex++}`);
            values.push(updates.sectionType);
        }
        if (updates.sectionOrder !== undefined) {
            setClause.push(`section_order = $${paramIndex++}`);
            values.push(updates.sectionOrder);
        }
        if (updates.contentSchema !== undefined) {
            setClause.push(`content_schema = $${paramIndex++}`);
            values.push(JSON.stringify(updates.contentSchema));
        }
        if (updates.stylingSchema !== undefined) {
            setClause.push(`styling_schema = $${paramIndex++}`);
            values.push(JSON.stringify(updates.stylingSchema));
        }
        if (updates.data !== undefined) {
            setClause.push(`data = $${paramIndex++}`);
            values.push(JSON.stringify(updates.data));
        }
        if (setClause.length === 0) {
            return this.getSection(id);
        }
        values.push(id);
        const query = `
      UPDATE sections
      SET ${setClause.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING id, document_id, section_type, section_order, content_schema, styling_schema, created_at;
    `;
        try {
            const result = await this.db.one(query, values);
            return {
                id: result.id,
                documentId: result.document_id,
                sectionType: result.section_type,
                sectionOrder: result.section_order,
                contentSchema: result.content_schema,
                stylingSchema: result.styling_schema,
                createdAt: result.created_at
            };
        }
        catch (error) {
            return null;
        }
    }
    /**
     * Gets a section by ID
     * @param id - Section ID
     * @returns Section or null if not found
     */
    async getSection(id) {
        const query = `
      SELECT id, document_id, section_type, section_order, content_schema, styling_schema, created_at
      FROM sections
      WHERE id = $1;
    `;
        try {
            const result = await this.db.one(query, [id]);
            return {
                id: result.id,
                documentId: result.document_id,
                sectionType: result.section_type,
                sectionOrder: result.section_order,
                contentSchema: result.content_schema,
                stylingSchema: result.styling_schema,
                createdAt: result.created_at
            };
        }
        catch (error) {
            return null;
        }
    }
    /**
     * Deletes a section
     * @param id - Section ID
     * @returns True if section was deleted, false if not found
     */
    async deleteSection(id) {
        const query = 'DELETE FROM sections WHERE id = $1 RETURNING id;';
        const result = await this.db.oneOrNone(query, [id]);
        return result !== null;
    }
    /**
     * Clears all database tables - for testing purposes
     * Follows strict null handling and validation rules
     */
    async clearDatabase() {
        if (!this.db) {
            throw new Error('Database connection not initialized');
        }
        try {
            // Clear in proper order to respect foreign key constraints
            await this.db.none('DELETE FROM section_content;');
            await this.db.none('DELETE FROM sections;');
            await this.db.none('DELETE FROM documents;');
        }
        catch (error) {
            throw new Error(`Failed to clear database: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Updates section data separately from other section properties
     * @param id - Section ID
     * @param data - Array of data objects
     * @returns Updated section or null if not found
     */
    async updateSectionData(id, data) {
        if (!this.db) {
            throw new Error('Database connection not initialized');
        }
        try {
            // First check if section exists
            const section = await this.getSection(id);
            if (!section) {
                return null;
            }
            // Update the section with data
            const updatedSection = await this.updateSection(id, {
                ...section,
                data
            });
            return updatedSection;
        }
        catch (error) {
            throw new Error(`Failed to update section data: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Closes database connection
     */
    async close() {
        // pg-promise doesn't have a direct close method
        // Connection pool will be cleaned up when process exits
    }
}
exports.DatabaseManager = DatabaseManager;
//# sourceMappingURL=DatabaseManager.js.map