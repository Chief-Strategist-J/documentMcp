import { DocumentConfig, Section, DocumentType } from '../types';
/**
 * Document generator for Word and PDF formats
 * Follows DRY principles - centralized document generation logic
 */
export declare class DocumentGenerator {
    /**
     * Generates document in specified format
     * @param document - Document configuration
     * @param sections - Document sections
     * @param type - Document type (word/pdf)
     * @param options - Generation options
     * @returns Generated document buffer
     */
    generateDocument(document: DocumentConfig, sections: Section[], type: DocumentType, options?: any): Promise<Buffer>;
    /**
     * Generates Word document
     * @param document - Document configuration
     * @param sections - Document sections
     * @param options - Generation options
     * @returns Word document buffer
     */
    private generateWordDocument;
    /**
     * Generates PDF document
     * @param document - Document configuration
     * @param sections - Document sections
     * @param options - Generation options
     * @returns PDF document buffer
     */
    private generatePdfDocument;
    /**
     * Creates Word document sections
     * @param document - Document configuration
     * @param sections - Document sections
     * @param options - Generation options
     * @returns Word document sections
     */
    private createWordSections;
    /**
     * Creates Word headers
     * @param sections - Header sections
     * @returns Word headers
     */
    private createWordHeaders;
    /**
     * Creates Word footers
     * @param sections - Footer sections
     * @returns Word footers
     */
    private createWordFooters;
    /**
     * Creates Word content from sections
     * @param sections - Content sections
     * @returns Word content elements
     */
    private createWordContent;
    /**
     * Creates Word table from section
     * @param section - Table section
     * @returns Word table elements
     */
    private createWordTable;
    /**
     * Creates Word paragraph from section
     * @param section - Paragraph section
     * @returns Word paragraph
     */
    private createWordParagraph;
    /**
     * Creates Word image placeholder from section
     * @param section - Image section
     * @returns Word paragraph with image placeholder
     */
    private createWordImage;
    /**
     * Creates Word chart placeholder from section
     * @param section - Chart section
     * @returns Word paragraph with chart placeholder
     */
    private createWordChart;
    /**
     * Generates HTML content for PDF generation
     * @param document - Document configuration
     * @param sections - Document sections
     * @param options - Generation options
     * @returns HTML string
     */
    private generateHtmlContent;
    /**
     * Generates HTML table from section data
     * @param section - Table section
     * @returns HTML table string
     */
    private generateHtmlTable;
    /**
     * Generates HTML paragraph from section data
     * @param section - Paragraph section
     * @returns HTML paragraph string
     */
    private generateHtmlParagraph;
}
//# sourceMappingURL=DocumentGenerator.d.ts.map