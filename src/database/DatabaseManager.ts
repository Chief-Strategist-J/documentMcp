import pgPromise from 'pg-promise';
import { v4 as uuidv4 } from 'uuid';
import { DocumentConfig, Section } from '../types';

interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
}

export class DatabaseManager {
  private readonly db: pgPromise.IDatabase<{}>;
  private readonly isConnected: boolean = false;

  constructor(connectionString: string) {
    if (!connectionString || typeof connectionString !== 'string' || connectionString.trim().length === 0) {
      throw new Error('Database connection string must be a non-empty string');
    }

    const pgp = pgPromise({
      error(error: any, event: any): void {
        if (process.env['NODE_ENV'] === 'development') {
          console.error('Database error:', error);
        }
      }
    });

    try {
      this.db = pgp(connectionString);
    } catch (error) {
      throw new Error(`Failed to initialize database connection: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async initializeDatabase(): Promise<void> {
    await this.createDocumentsTable();
    await this.createSectionsTable();
    await this.createSectionContentTable();
  }

  private async createDocumentsTable(): Promise<void> {
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

  private async createSectionsTable(): Promise<void> {
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

  private async createSectionContentTable(): Promise<void> {
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

  async createDocument(documentConfig: Omit<DocumentConfig, 'id' | 'createdAt' | 'updatedAt'>): Promise<DocumentConfig> {
    const id = uuidv4();
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

  async getDocument(id: string): Promise<DocumentConfig | null> {
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
    } catch (error) {
      return null;
    }
  }

  async updateDocument(id: string, updates: Partial<Omit<DocumentConfig, 'id' | 'createdAt'>>): Promise<DocumentConfig | null> {
    const setClause: string[] = [];
    const values: any[] = [];
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
    } catch (error) {
      return null;
    }
  }

  async listDocuments(limit: number = 100, offset: number = 0): Promise<DocumentConfig[]> {
    const query = `
      SELECT id, name, type, layout_schema, created_at, updated_at
      FROM documents
      ORDER BY created_at DESC
      LIMIT $1 OFFSET $2;
    `;
    
    const results = await this.db.manyOrNone(query, [limit, offset]);
    
    return results.map((result: any) => ({
      id: result.id,
      name: result.name,
      type: result.type,
      layoutSchema: result.layout_schema,
      createdAt: result.created_at,
      updatedAt: result.updated_at
    }));
  }

  async deleteDocument(id: string): Promise<boolean> {
    const query = 'DELETE FROM documents WHERE id = $1 RETURNING id;';
    const result = await this.db.oneOrNone(query, [id]);
    return result !== null;
  }

  async createSection(section: Omit<Section, 'id' | 'createdAt'>): Promise<Section> {
    const id = uuidv4();
    
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

  async getDocumentSections(documentId: string): Promise<Section[]> {
    const query = `
      SELECT id, document_id, section_type, section_order, content_schema, styling_schema, created_at
      FROM sections
      WHERE document_id = $1
      ORDER BY section_order;
    `;
    
    const results = await this.db.manyOrNone(query, [documentId]);
    
    return results.map((result: any) => ({
      id: result.id,
      documentId: result.document_id,
      sectionType: result.section_type,
      sectionOrder: result.section_order,
      contentSchema: result.content_schema,
      stylingSchema: result.styling_schema,
      createdAt: result.created_at
    }));
  }

  async updateSection(id: string, updates: Partial<Omit<Section, 'id' | 'documentId' | 'createdAt'>>): Promise<Section | null> {
    const setClause: string[] = [];
    const values: any[] = [];
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
    } catch (error) {
      return null;
    }
  }

  async getSection(id: string): Promise<Section | null> {
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
    } catch (error) {
      return null;
    }
  }

  async deleteSection(id: string): Promise<boolean> {
    const query = 'DELETE FROM sections WHERE id = $1 RETURNING id;';
    const result = await this.db.oneOrNone(query, [id]);
    return result !== null;
  }

  async updateSectionData(id: string, data: unknown[]): Promise<Section | null> {
    if (!this.db) {
      throw new Error('Database connection not initialized');
    }

    try {
      const section = await this.getSection(id);
      if (!section) {
        return null;
      }

      const updatedSection = await this.updateSection(id, {
        ...section,
        data
      });

      return updatedSection;
    } catch (error) {
      throw new Error(`Failed to update section data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async duplicateDocument(id: string, newName?: string): Promise<DocumentConfig | null> {
    if (!this.db) {
      throw new Error('Database connection not initialized');
    }

    try {
      const originalDocument = await this.getDocument(id);
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
          sectionType: section.sectionType,
          sectionOrder: section.sectionOrder,
          contentSchema: section.contentSchema,
          stylingSchema: section.stylingSchema
        });
      }

      return newDocument;
    } catch (error) {
      throw new Error(`Failed to duplicate document: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async duplicateSection(id: string, newDocumentId?: string): Promise<Section | null> {
    if (!this.db) {
      throw new Error('Database connection not initialized');
    }

    try {
      const originalSection = await this.getSection(id);
      if (!originalSection) {
        return null;
      }

      const targetDocumentId = newDocumentId || originalSection.documentId;

      const maxOrder = await this.db.oneOrNone(
        'SELECT MAX(section_order) as max_order FROM sections WHERE document_id = $1',
        [targetDocumentId]
      );

      const newSectionOrder = (maxOrder?.max_order || 0) + 1;

      const newSection = await this.createSection({
        documentId: targetDocumentId,
        sectionType: originalSection.sectionType,
        sectionOrder: newSectionOrder,
        contentSchema: originalSection.contentSchema,
        stylingSchema: originalSection.stylingSchema
      });

      if ((originalSection as any).data) {
        await this.updateSectionData(newSection.id, (originalSection as any).data);
      }

      return newSection;
    } catch (error) {
      throw new Error(`Failed to duplicate section: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async reorderSections(documentId: string, sectionOrders: Array<{ id: string; order: number }>): Promise<Section[]> {
    if (!this.db) {
      throw new Error('Database connection not initialized');
    }

    try {
      await this.db.tx(async (t) => {
        for (const { id, order } of sectionOrders) {
          await t.none(
            'UPDATE sections SET section_order = $1 WHERE id = $2 AND document_id = $3',
            [order, id, documentId]
          );
        }
      });

      return await this.getDocumentSections(documentId);
    } catch (error) {
      throw new Error(`Failed to reorder sections: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async bulkCreateSections(documentId: string, sections: Array<Omit<Section, 'id' | 'createdAt' | 'documentId'>>): Promise<Section[]> {
    if (!this.db) {
      throw new Error('Database connection not initialized');
    }

    try {
      const createdSections: Section[] = [];

      await this.db.tx(async (t) => {
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
      });

      return createdSections;
    } catch (error) {
      throw new Error(`Failed to bulk create sections: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async searchDocuments(query: string, limit: number = 100, offset: number = 0): Promise<DocumentConfig[]> {
    if (!this.db) {
      throw new Error('Database connection not initialized');
    }

    try {
      const searchQuery = `
        SELECT id, name, type, layout_schema, created_at, updated_at
        FROM documents
        WHERE name ILIKE $1 OR type ILIKE $1
        ORDER BY name
        LIMIT $2 OFFSET $3
      `;

      const documents = await this.db.manyOrNone(searchQuery, [`%${query}%`, limit, offset]);

      return documents.map((doc: any) => ({
        id: doc.id,
        name: doc.name,
        type: doc.type,
        layoutSchema: doc.layout_schema,
        createdAt: doc.created_at,
        updatedAt: doc.updated_at
      }));
    } catch (error) {
      throw new Error(`Failed to search documents: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

}