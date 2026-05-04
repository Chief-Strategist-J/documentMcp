import { Section } from '../types';
/**
 * Professional document generator with rich content and UI/UX perspective
 * Based on the doc.js reference for professional document styling
 * Follows DRY principles - centralized document generation logic
 * Follows strict null handling and typecasting rules
 */
export declare class ProfessionalDocumentGenerator {
    private readonly COLORS;
    /**
     * Border helper - follows DRY principles
     */
    private border;
    private borders;
    /**
     * Cell helper - creates styled table cells
     * @param text - Cell text content
     * @param width - Cell width
     * @param options - Styling options
     * @returns Formatted TableCell
     */
    private cell;
    /**
     * Header row helper - creates styled table headers
     * @param cols - Array of [text, width] pairs
     * @returns Formatted TableRow
     */
    private headerRow;
    /**
     * Data row helper - creates styled data rows
     * @param no - Row number
     * @param name - Name field
     * @param answers - Answers field
     * @param library - Library field
     * @param reportName - Report name field
     * @param why - Why field
     * @param how - How field
     * @param domain - Domain field
     * @param rowIdx - Row index for alternating colors
     * @returns Formatted TableRow
     */
    private dataRow;
    /**
     * Section heading row helper - creates section dividers
     * @param label - Section label text
     * @param color - Background color
     * @returns Formatted TableRow
     */
    private sectionRow;
    /**
     * Sample analysis data - follows DRY principles
     */
    private readonly SCIENCE_ANALYSES;
    private readonly ENGINEERING_ANALYSES;
    private readonly BUSINESS_ANALYSES;
    /**
     * Generates a professional document with rich content
     * @param document - Document configuration
     * @param sections - Document sections
     * @param format - Output format (word/pdf)
     * @param options - Generation options
     * @returns Generated document buffer
     */
    generateProfessionalDocument(document: any, sections: Section[], format: string, options?: any): Promise<Buffer>;
    /**
     * Generates document content with professional styling
     * @param document - Document configuration
     * @param sections - Document sections
     * @returns Array of document content elements
     */
    private generateDocumentContent;
    /**
     * Generates professional analysis tables
     * @returns Array of table elements
     */
    private generateAnalysisTables;
    /**
     * Generates HTML content for PDF conversion
     * @param document - Document configuration
     * @param sections - Document sections
     * @param options - Generation options
     * @returns HTML string
     */
    private generateHtmlContent;
    /**
     * Generates PDF from HTML using Puppeteer
     * @param html - HTML content
     * @param options - Generation options
     * @returns PDF buffer
     */
    private generatePdfFromHtml;
}
//# sourceMappingURL=ProfessionalDocumentGenerator.d.ts.map