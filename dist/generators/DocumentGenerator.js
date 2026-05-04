"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentGenerator = void 0;
const docx_1 = require("docx");
const puppeteer_1 = __importDefault(require("puppeteer"));
/**
 * Document generator for Word and PDF formats
 * Follows DRY principles - centralized document generation logic
 */
class DocumentGenerator {
    /**
     * Generates document in specified format
     * @param document - Document configuration
     * @param sections - Document sections
     * @param type - Document type (word/pdf)
     * @param options - Generation options
     * @returns Generated document buffer
     */
    async generateDocument(document, sections, type, options) {
        switch (type) {
            case 'word':
                return this.generateWordDocument(document, sections, options);
            case 'pdf':
                return this.generatePdfDocument(document, sections, options);
            default:
                throw new Error('Unsupported document type: ' + type);
        }
    }
    /**
     * Generates Word document
     * @param document - Document configuration
     * @param sections - Document sections
     * @param options - Generation options
     * @returns Word document buffer
     */
    async generateWordDocument(document, sections, options) {
        const doc = new docx_1.Document({
            sections: this.createWordSections(document, sections, options)
        });
        const buffer = await docx_1.Packer.toBuffer(doc);
        return buffer;
    }
    /**
     * Generates PDF document
     * @param document - Document configuration
     * @param sections - Document sections
     * @param options - Generation options
     * @returns PDF document buffer
     */
    async generatePdfDocument(document, sections, options) {
        const html = this.generateHtmlContent(document, sections, options);
        const browser = await puppeteer_1.default.launch({ headless: true });
        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: 'networkidle0' });
        const pdfBuffer = await page.pdf({
            format: options?.pageSize || 'A4',
            landscape: options?.orientation === 'landscape',
            margin: {
                top: (options?.margins?.top || 72) + 'px',
                right: (options?.margins?.right || 72) + 'px',
                bottom: (options?.margins?.bottom || 72) + 'px',
                left: (options?.margins?.left || 72) + 'px'
            },
            printBackground: true
        });
        await browser.close();
        return Buffer.from(pdfBuffer);
    }
    /**
     * Creates Word document sections
     * @param document - Document configuration
     * @param sections - Document sections
     * @param options - Generation options
     * @returns Word document sections
     */
    createWordSections(document, sections, options) {
        const sortedSections = sections.sort((a, b) => a.sectionOrder - b.sectionOrder);
        const wordSections = [];
        // Group sections by headers/footers and content
        const headerSections = sortedSections.filter(s => s.sectionType === 'header');
        const footerSections = sortedSections.filter(s => s.sectionType === 'footer');
        const contentSections = sortedSections.filter(s => s.sectionType !== 'header' && s.sectionType !== 'footer');
        // Create main section with headers and footers
        const mainSection = {
            properties: {
                page: {
                    margin: {
                        top: options?.margins?.top || 720,
                        right: options?.margins?.right || 720,
                        bottom: options?.margins?.bottom || 720,
                        left: options?.margins?.left || 720
                    },
                    size: options?.pageSize === 'A4' ? 8.5 * 1440 : 11 * 1440
                }
            },
            headers: this.createWordHeaders(headerSections),
            footers: this.createWordFooters(footerSections),
            children: this.createWordContent(contentSections)
        };
        wordSections.push(mainSection);
        return wordSections;
    }
    /**
     * Creates Word headers
     * @param sections - Header sections
     * @returns Word headers
     */
    createWordHeaders(sections) {
        const headers = [];
        for (const section of sections) {
            const header = new docx_1.Header({
                children: [
                    new docx_1.Paragraph({
                        children: [new docx_1.TextRun({ text: 'Header: ' + section.id, font: 'Arial', size: 10 })],
                        alignment: docx_1.AlignmentType.CENTER
                    })
                ]
            });
            headers.push(header);
        }
        return headers;
    }
    /**
     * Creates Word footers
     * @param sections - Footer sections
     * @returns Word footers
     */
    createWordFooters(sections) {
        const footers = [];
        for (const section of sections) {
            const footer = new docx_1.Footer({
                children: [
                    new docx_1.Paragraph({
                        children: [new docx_1.TextRun({ text: 'Footer: ' + section.id, font: 'Arial', size: 10 })],
                        alignment: docx_1.AlignmentType.CENTER
                    })
                ]
            });
            footers.push(footer);
        }
        return footers;
    }
    /**
     * Creates Word content from sections
     * @param sections - Content sections
     * @returns Word content elements
     */
    createWordContent(sections) {
        const content = [];
        for (const section of sections) {
            switch (section.sectionType) {
                case 'table':
                    content.push(...this.createWordTable(section));
                    break;
                case 'paragraph':
                    content.push(this.createWordParagraph(section));
                    break;
                case 'image':
                    content.push(this.createWordImage(section));
                    break;
                case 'chart':
                    content.push(this.createWordChart(section));
                    break;
                default:
                    content.push(new docx_1.Paragraph({
                        children: [new docx_1.TextRun({ text: 'Section: ' + section.sectionType })]
                    }));
            }
        }
        return content;
    }
    /**
     * Creates Word table from section
     * @param section - Table section
     * @returns Word table elements
     */
    createWordTable(section) {
        const columns = section.contentSchema.columns || [];
        const tableRows = [];
        // Header row
        const headerCells = columns.map(col => new docx_1.TableCell({
            children: [new docx_1.Paragraph({
                    children: [new docx_1.TextRun({ text: col.name, bold: true })]
                })],
            shading: { fill: 'F5F5F5' }
        }));
        tableRows.push(new docx_1.TableRow({ children: headerCells }));
        // Data rows (placeholder data)
        for (let i = 1; i <= 3; i++) {
            const dataCells = columns.map(col => new docx_1.TableCell({
                children: [new docx_1.Paragraph({
                        children: [new docx_1.TextRun({ text: 'Row ' + i + ', ' + col.name })]
                    })]
            }));
            tableRows.push(new docx_1.TableRow({ children: dataCells }));
        }
        return [
            new docx_1.Paragraph({ children: [new docx_1.TextRun({ text: 'Table: ' + section.id, bold: true })] }),
            new docx_1.Table({
                rows: tableRows,
                width: { size: 100, type: docx_1.WidthType.PERCENTAGE },
                borders: {
                    top: { style: docx_1.BorderStyle.SINGLE, size: 1 },
                    bottom: { style: docx_1.BorderStyle.SINGLE, size: 1 },
                    left: { style: docx_1.BorderStyle.SINGLE, size: 1 },
                    right: { style: docx_1.BorderStyle.SINGLE, size: 1 }
                }
            })
        ];
    }
    /**
     * Creates Word paragraph from section
     * @param section - Paragraph section
     * @returns Word paragraph
     */
    createWordParagraph(section) {
        const content = section.contentSchema.content || 'Default paragraph content';
        return new docx_1.Paragraph({
            children: [new docx_1.TextRun({ text: content })],
            spacing: { after: 200 }
        });
    }
    /**
     * Creates Word image placeholder from section
     * @param section - Image section
     * @returns Word paragraph with image placeholder
     */
    createWordImage(section) {
        return new docx_1.Paragraph({
            children: [new docx_1.TextRun({ text: '[Image: ' + section.id + ']', italics: true })],
            alignment: docx_1.AlignmentType.CENTER
        });
    }
    /**
     * Creates Word chart placeholder from section
     * @param section - Chart section
     * @returns Word paragraph with chart placeholder
     */
    createWordChart(section) {
        return new docx_1.Paragraph({
            children: [new docx_1.TextRun({ text: '[Chart: ' + section.id + ']', italics: true })],
            alignment: docx_1.AlignmentType.CENTER
        });
    }
    /**
     * Generates HTML content for PDF generation
     * @param document - Document configuration
     * @param sections - Document sections
     * @param options - Generation options
     * @returns HTML string
     */
    generateHtmlContent(document, sections, options) {
        const styling = options?.styling || {};
        let html = '<!DOCTYPE html><html><head><meta charset="utf-8"><title>' + document.name + '</title><style>';
        html += 'body { font-family: ' + (styling.document?.fontFamily || 'Arial') + '; ';
        html += 'font-size: ' + (styling.document?.fontSize || 12) + 'px; ';
        html += 'color: ' + (styling.document?.textColor || '#000000') + '; ';
        html += 'background-color: ' + (styling.document?.backgroundColor || '#ffffff') + '; ';
        html += 'margin: ' + (styling.page?.margins?.top || 72) + 'px ' + (styling.page?.margins?.right || 72) + 'px ' + (styling.page?.margins?.bottom || 72) + 'px ' + (styling.page?.margins?.left || 72) + 'px; ';
        html += 'line-height: ' + (styling.document?.lineSpacing || 1.2) + '; }';
        html += '.header { text-align: center; font-weight: bold; margin-bottom: 20px; background-color: ' + (styling.header?.backgroundColor || '#f5f5f5') + '; padding: 10px; }';
        html += '.footer { text-align: center; font-size: 10px; margin-top: 20px; background-color: ' + (styling.footer?.backgroundColor || '#f5f5f5') + '; padding: 10px; }';
        html += 'table { width: 100%; border-collapse: collapse; margin: 20px 0; }';
        html += 'th, td { border: 1px solid ' + (styling.table?.borderColor || '#000000') + '; padding: 8px; text-align: left; }';
        html += 'th { background-color: ' + (styling.tableHeader?.backgroundColor || '#f5f5f5') + '; font-weight: bold; }';
        html += '.paragraph { margin: 10px 0; text-align: ' + (styling.paragraph?.alignment || 'left') + '; }';
        html += '.image, .chart { text-align: center; margin: 20px 0; font-style: italic; color: #666; }';
        html += '</style></head><body>';
        // Add headers
        const headerSections = sections.filter(s => s.sectionType === 'header');
        if (headerSections.length > 0) {
            html += '<div class="header">';
            headerSections.forEach(section => {
                html += '<p>Header: ' + section.id + '</p>';
            });
            html += '</div>';
        }
        // Add main content
        const sortedSections = sections
            .filter(s => s.sectionType !== 'header' && s.sectionType !== 'footer')
            .sort((a, b) => a.sectionOrder - b.sectionOrder);
        for (const section of sortedSections) {
            switch (section.sectionType) {
                case 'table':
                    html += this.generateHtmlTable(section);
                    break;
                case 'paragraph':
                    html += this.generateHtmlParagraph(section);
                    break;
                case 'image':
                    html += '<div class="image">[Image: ' + section.id + ']</div>';
                    break;
                case 'chart':
                    html += '<div class="chart">[Chart: ' + section.id + ']</div>';
                    break;
                default:
                    html += '<p>Section: ' + section.sectionType + '</p>';
            }
        }
        // Add footers
        const footerSections = sections.filter(s => s.sectionType === 'footer');
        if (footerSections.length > 0) {
            html += '<div class="footer">';
            footerSections.forEach(section => {
                html += '<p>Footer: ' + section.id + '</p>';
            });
            html += '</div>';
        }
        html += '</body></html>';
        return html;
    }
    /**
     * Generates HTML table from section data
     * @param section - Table section
     * @returns HTML table string
     */
    generateHtmlTable(section) {
        const columns = section.contentSchema.columns || [];
        let html = '<table>';
        // Header row
        html += '<tr>';
        columns.forEach(col => {
            html += '<th>' + col.name + '</th>';
        });
        html += '</tr>';
        // Data rows (placeholder)
        for (let i = 1; i <= 3; i++) {
            html += '<tr>';
            columns.forEach(col => {
                html += '<td>Row ' + i + ', ' + col.name + '</td>';
            });
            html += '</tr>';
        }
        html += '</table>';
        return html;
    }
    /**
     * Generates HTML paragraph from section data
     * @param section - Paragraph section
     * @returns HTML paragraph string
     */
    generateHtmlParagraph(section) {
        const content = section.contentSchema.content || 'Default paragraph content';
        return '<div class="paragraph">' + content + '</div>';
    }
}
exports.DocumentGenerator = DocumentGenerator;
//# sourceMappingURL=DocumentGenerator.js.map