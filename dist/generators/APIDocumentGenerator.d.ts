import { Section } from '../types';
/**
 * Pure API-based document generator using real data from sections
 * Follows DRY principles - centralized API data generation logic
 */
export declare class APIDocumentGenerator {
    private readonly COLORS;
    private border;
    private borders;
    private cell;
    private headerRow;
    private dataRow;
    generateAPIDocument(document: any, sections: Section[], format: string, options?: any): Promise<Buffer>;
    private generateAPIContent;
    private generateSectionAPIContent;
    /**
     * FIX: Properly reads data stored on the section object.
     * The addSectionData controller stores rows as section.data (any[]).
     */
    private getRealSectionData;
    private calculateColumnWidth;
    private generateAPIHtmlContent;
    private generatePdfFromHtml;
}
//# sourceMappingURL=APIDocumentGenerator.d.ts.map