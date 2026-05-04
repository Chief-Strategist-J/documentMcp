import { Section } from '../types';
/**
 * Fully dynamic document generator based on actual API data
 * Follows DRY principles - centralized dynamic generation logic
 * Follows strict null handling and typecasting rules
 */
export declare class DynamicDocumentGenerator {
    private readonly COLORS;
    /**
     * Border helper - follows DRY principles
     */
    private border;
    private borders;
    /**
     * Cell helper - creates styled table cells dynamically
     * @param text - Cell text content
     * @param width - Cell width
     * @param options - Styling options
     * @returns Formatted TableCell
     */
    private cell;
    /**
     * Header row helper - creates styled table headers dynamically
     * @param columns - Array of column definitions
     * @returns Formatted TableRow
     */
    private headerRow;
    /**
     * Data row helper - creates styled data rows dynamically
     * @param data - Row data object
     * @param columns - Column definitions
     * @param rowIdx - Row index for alternating colors
     * @returns Formatted TableRow
     */
    private dataRow;
    /**
     * Generates a fully dynamic document based on actual API data
     * @param document - Document configuration from API
     * @param sections - Sections from API
     * @param format - Output format (word/pdf)
     * @param options - Generation options
     * @returns Generated document buffer
     */
    generateDynamicDocument(document: any, sections: Section[], format: string, options?: any): Promise<Buffer>;
    /**
     * Generates dynamic document content based on actual API data
     * @param document - Document configuration
     * @param sections - Sections from API
     * @returns Array of document content elements
     */
    private generateDynamicContent;
    /**
     * Generates content for a specific section based on its schema
     * @param section - Section data
     * @param sectionNumber - Section number for ordering
     * @returns Array of content elements
     */
    private generateSectionContent;
    /**
     * Calculates column width based on configuration
     * @param widthConfig - Width configuration from column
     * @returns Calculated width in DXA units
     */
    private calculateColumnWidth;
    /**
     * Generates sample data for a section based on its schema
     * @param section - Section configuration
     * @returns Array of sample data objects
     */
    private generateSampleDataForSection;
    /**
     * Formats styling information for display
     * @param stylingSchema - Styling configuration
     * @returns Formatted string
     */
    private formatStylingInfo;
    /**
     * Generates HTML content for PDF conversion
     * @param document - Document configuration
     * @param sections - Sections from API
     * @param options - Generation options
     * @returns HTML string
     */
    private generateDynamicHtmlContent;
    /**
     * Generates PDF from HTML using Puppeteer
     * @param html - HTML content
     * @param options - Generation options
     * @returns PDF buffer
     */
    private generatePdfFromHtml;
}
//# sourceMappingURL=DynamicDocumentGenerator.d.ts.map