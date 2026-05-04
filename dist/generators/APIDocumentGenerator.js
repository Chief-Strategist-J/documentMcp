"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.APIDocumentGenerator = void 0;
const docx_1 = require("docx");
/**
 * Pure API-based document generator using real data from sections
 * Follows DRY principles - centralized API data generation logic
 */
class APIDocumentGenerator {
    constructor() {
        this.COLORS = {
            primary: '1F3864',
            secondary: '1F5C99',
            accent: '1A6B3C',
            warning: '7B3F00',
            headerBg: '1F3864',
            headerText: 'FFFFFF',
            tableBg: 'F7F9FC',
            altRow: 'F0F4F8',
            white: 'FFFFFF',
            border: 'D1D5DB',
            text: '374151',
            muted: '6B7280',
        };
        this.border = (color = this.COLORS.border) => ({
            style: docx_1.BorderStyle.SINGLE,
            size: 1,
            color
        });
        this.borders = (color = this.COLORS.border) => ({
            top: this.border(color),
            bottom: this.border(color),
            left: this.border(color),
            right: this.border(color)
        });
    }
    cell(text, width, options = {}) {
        const { bold = false, bg = this.COLORS.white, color = this.COLORS.text, size = 20, italic = false, center = false, header = false } = options;
        return new docx_1.TableCell({
            width: { size: width, type: docx_1.WidthType.DXA },
            borders: this.borders(),
            shading: { fill: bg, type: docx_1.ShadingType.CLEAR },
            margins: { top: header ? 80 : 60, bottom: header ? 80 : 60, left: 100, right: 100 },
            verticalAlign: docx_1.VerticalAlign.CENTER,
            children: [new docx_1.Paragraph({
                    alignment: center ? docx_1.AlignmentType.CENTER : docx_1.AlignmentType.LEFT,
                    spacing: { before: 0, after: 0 },
                    children: [new docx_1.TextRun({
                            text: text || '',
                            bold,
                            color,
                            size,
                            italics: italic,
                            font: 'Arial'
                        })]
                })]
        });
    }
    headerRow(columns) {
        return new docx_1.TableRow({
            tableHeader: true,
            children: columns.map(col => new docx_1.TableCell({
                width: { size: col.width, type: docx_1.WidthType.DXA },
                borders: this.borders(this.COLORS.headerBg),
                shading: { fill: this.COLORS.headerBg, type: docx_1.ShadingType.CLEAR },
                margins: { top: 80, bottom: 80, left: 100, right: 100 },
                verticalAlign: docx_1.VerticalAlign.CENTER,
                children: [new docx_1.Paragraph({
                        alignment: docx_1.AlignmentType.CENTER,
                        spacing: { before: 0, after: 0 },
                        children: [new docx_1.TextRun({
                                text: col.name,
                                bold: true,
                                color: this.COLORS.headerText,
                                size: 20,
                                font: 'Arial'
                            })]
                    })]
            }))
        });
    }
    dataRow(data, columns, rowIdx) {
        const bg = rowIdx % 2 === 0 ? this.COLORS.white : this.COLORS.altRow;
        return new docx_1.TableRow({
            children: columns.map(col => {
                const value = data[col.key];
                let stringValue = '';
                if (value === null || value === undefined) {
                    stringValue = '';
                }
                else if (col.type === 'boolean') {
                    stringValue = value ? 'Yes' : 'No';
                }
                else if (col.type === 'number') {
                    stringValue = typeof value === 'number' ? value.toString() : String(value);
                }
                else if (col.type === 'date') {
                    stringValue = value instanceof Date ? value.toLocaleDateString() : String(value);
                }
                else {
                    stringValue = String(value);
                }
                return this.cell(stringValue, col.width, {
                    bg,
                    color: this.COLORS.text,
                    size: 18
                });
            })
        });
    }
    async generateAPIDocument(document, sections, format, options) {
        if (!document || typeof document !== 'object') {
            throw new Error('Document must be a valid object');
        }
        if (!format || typeof format !== 'string') {
            throw new Error('Format must be a non-empty string');
        }
        if (!['word', 'pdf'].includes(format)) {
            throw new Error('Format must be either "word" or "pdf"');
        }
        const doc = new docx_1.Document({
            sections: [{
                    properties: {
                        page: {
                            size: {
                                orientation: options?.orientation === 'landscape' ? 'landscape' : 'portrait',
                                width: options?.pageSize === 'A4' ? 11906 : 12240,
                                height: options?.pageSize === 'A4' ? 16838 : 15840,
                            },
                            margin: {
                                top: options?.margins?.top || 1440,
                                right: options?.margins?.right || 1440,
                                bottom: options?.margins?.bottom || 1440,
                                left: options?.margins?.left || 1440,
                            },
                        },
                    },
                    headers: {
                        default: new docx_1.Header({
                            children: [
                                new docx_1.Paragraph({
                                    alignment: docx_1.AlignmentType.CENTER,
                                    children: [
                                        new docx_1.TextRun({
                                            text: document.name || 'API Document',
                                            bold: true,
                                            size: 24,
                                            color: this.COLORS.primary,
                                        })
                                    ]
                                })
                            ]
                        })
                    },
                    footers: {
                        default: new docx_1.Footer({
                            children: [
                                new docx_1.Paragraph({
                                    alignment: docx_1.AlignmentType.CENTER,
                                    children: [
                                        new docx_1.TextRun({
                                            text: `Page `,
                                            children: [docx_1.PageNumber.CURRENT],
                                        })
                                    ]
                                })
                            ]
                        })
                    },
                    children: this.generateAPIContent(document, sections)
                }]
        });
        if (format === 'word') {
            return await docx_1.Packer.toBuffer(doc);
        }
        else {
            const html = this.generateAPIHtmlContent(document, sections, options);
            return await this.generatePdfFromHtml(html, options);
        }
    }
    generateAPIContent(document, sections) {
        const content = [];
        // Document title — uses actual document.name
        content.push(new docx_1.Paragraph({
            alignment: docx_1.AlignmentType.CENTER,
            spacing: { before: 400, after: 300 },
            children: [
                new docx_1.TextRun({
                    text: document.name || 'Untitled Document',
                    bold: true,
                    size: 32,
                    color: this.COLORS.primary,
                })
            ]
        }));
        // Metadata row
        content.push(new docx_1.Paragraph({
            spacing: { after: 200 },
            children: [
                new docx_1.TextRun({
                    text: `Generated on: ${new Date().toLocaleDateString()}`,
                    size: 20,
                    color: this.COLORS.muted,
                })
            ]
        }));
        if (document.type) {
            content.push(new docx_1.Paragraph({
                spacing: { after: 400 },
                children: [
                    new docx_1.TextRun({
                        text: `Document Type: ${document.type.toUpperCase()}`,
                        bold: true,
                        size: 22,
                        color: this.COLORS.secondary,
                    })
                ]
            }));
        }
        // Summary — now accurately reflects section + row counts
        const totalRows = sections.reduce((acc, s) => acc + this.getRealSectionData(s).length, 0);
        content.push(new docx_1.Paragraph({
            heading: docx_1.HeadingLevel.HEADING_1,
            spacing: { before: 600, after: 200 },
            children: [
                new docx_1.TextRun({
                    text: 'Document Summary',
                    bold: true,
                    size: 28,
                    color: this.COLORS.primary,
                })
            ]
        }));
        content.push(new docx_1.Paragraph({
            spacing: { after: 400 },
            children: [
                new docx_1.TextRun({
                    text: `This document contains ${sections.length} section${sections.length !== 1 ? 's' : ''} with ${totalRows} total data row${totalRows !== 1 ? 's' : ''}.`,
                    size: 22,
                })
            ]
        }));
        // Render each section
        if (sections && sections.length > 0) {
            sections.forEach((section, index) => {
                content.push(...this.generateSectionAPIContent(section, index + 1));
            });
        }
        else {
            content.push(new docx_1.Paragraph({
                heading: docx_1.HeadingLevel.HEADING_2,
                spacing: { before: 400, after: 200 },
                children: [
                    new docx_1.TextRun({
                        text: 'No Sections Available',
                        bold: true,
                        size: 24,
                        color: this.COLORS.warning,
                    })
                ]
            }));
            content.push(new docx_1.Paragraph({
                spacing: { after: 400 },
                children: [
                    new docx_1.TextRun({
                        text: 'This document was created without any sections. Add sections and data through the API to generate content.',
                        size: 20,
                        color: this.COLORS.muted,
                    })
                ]
            }));
        }
        return content;
    }
    generateSectionAPIContent(section, sectionNumber) {
        const content = [];
        content.push(new docx_1.Paragraph({
            heading: docx_1.HeadingLevel.HEADING_1,
            spacing: { before: 600, after: 200 },
            children: [
                new docx_1.TextRun({
                    text: `Section ${sectionNumber}: ${section.content_schema?.schemaId || section.sectionType || 'Data Table'}`,
                    bold: true,
                    size: 28,
                    color: this.COLORS.primary,
                })
            ]
        }));
        if (section.content_schema) {
            content.push(new docx_1.Paragraph({
                spacing: { after: 200 },
                children: [
                    new docx_1.TextRun({
                        text: `Schema: ${section.content_schema.schemaId || 'Unknown'}`,
                        size: 20,
                        italics: true,
                        color: this.COLORS.muted,
                    })
                ]
            }));
        }
        if (section.content_schema?.columns) {
            const columns = section.content_schema.columns;
            const tableColumns = columns.map((col) => ({
                name: col.name || col.id,
                key: col.id,
                width: this.calculateColumnWidth(col.width),
                type: col.type
            }));
            content.push(new docx_1.Paragraph({
                heading: docx_1.HeadingLevel.HEADING_2,
                spacing: { before: 400, after: 200 },
                children: [
                    new docx_1.TextRun({
                        text: 'Data Table',
                        bold: true,
                        size: 24,
                    })
                ]
            }));
            const tableRows = [this.headerRow(tableColumns)];
            // FIX: getRealSectionData now correctly reads section.data
            const realData = this.getRealSectionData(section);
            console.log(`🔍 APIDocumentGenerator: Section data retrieved:`, {
                sectionId: section.id,
                hasData: Array.isArray(section.data),
                dataLength: section.data?.length || 0,
                realDataLength: realData.length,
                realDataSample: realData.slice(0, 2)
            });
            if (realData.length > 0) {
                realData.forEach((row, index) => {
                    tableRows.push(this.dataRow(row, tableColumns, index));
                });
            }
            else {
                tableRows.push(new docx_1.TableRow({
                    children: [new docx_1.TableCell({
                            columnSpan: tableColumns.length,
                            width: { size: 10000, type: docx_1.WidthType.DXA },
                            borders: this.borders(),
                            shading: { fill: this.COLORS.altRow, type: docx_1.ShadingType.CLEAR },
                            margins: { top: 80, bottom: 80, left: 120, right: 120 },
                            children: [new docx_1.Paragraph({
                                    alignment: docx_1.AlignmentType.CENTER,
                                    children: [new docx_1.TextRun({
                                            text: 'No data available. Add data via POST /api/sections/{id}/data',
                                            color: this.COLORS.muted,
                                            size: 18,
                                            italics: true
                                        })]
                                })]
                        })]
                }));
            }
            content.push(new docx_1.Table({
                width: { size: 100, type: docx_1.WidthType.PERCENTAGE },
                rows: tableRows
            }));
        }
        return content;
    }
    /**
     * FIX: Properly reads data stored on the section object.
     * The addSectionData controller stores rows as section.data (any[]).
     */
    getRealSectionData(section) {
        // Primary: data array stored directly on the section (set by addSectionData)
        if (Array.isArray(section.data) && section.data.length > 0) {
            return section.data;
        }
        // Fallback: rows embedded inside the contentSchema itself
        if (Array.isArray(section.contentSchema?.rows?.data)) {
            return section.contentSchema.rows.data;
        }
        return [];
    }
    calculateColumnWidth(widthConfig) {
        if (typeof widthConfig === 'number') {
            return widthConfig * 10;
        }
        return 1500;
    }
    generateAPIHtmlContent(document, sections, options) {
        const sectionsHtml = sections.map(section => {
            const rows = this.getRealSectionData(section);
            const columns = section.contentSchema?.columns || [];
            const theadCells = columns.map(c => `<th>${c.name || c.id}</th>`).join('');
            const tbodyRows = rows.length > 0
                ? rows.map((row, i) => `<tr class="${i % 2 === 1 ? 'alt' : ''}">
              ${columns.map(c => `<td>${row[c.id] ?? ''}</td>`).join('')}
            </tr>`).join('')
                : `<tr><td colspan="${columns.length}" style="text-align:center;color:#6B7280;font-style:italic">No data available</td></tr>`;
            return `
        <h2>Section ${sections.indexOf(section) + 1}: ${section.sectionType}</h2>
        <p style="color:#6B7280;font-style:italic;margin-bottom:12px">Schema: ${section.contentSchema?.schemaId || 'Unknown'}</p>
        ${columns.length > 0 ? `
          <table>
            <thead><tr>${theadCells}</tr></thead>
            <tbody>${tbodyRows}</tbody>
          </table>
        ` : '<p>No schema columns defined.</p>'}
      `;
        }).join('');
        return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${document.name || 'API Document'}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; color: #374151; }
          h1 { color: #1F3864; text-align: center; }
          h2 { color: #1F5C99; margin-top: 32px; }
          table { width: 100%; border-collapse: collapse; margin: 16px 0; }
          th { background-color: #1F3864; color: white; padding: 10px; text-align: center; }
          td { border: 1px solid #D1D5DB; padding: 8px; }
          .alt { background-color: #F0F4F8; }
        </style>
      </head>
      <body>
        <h1>${document.name || 'API Document'}</h1>
        <p>Generated on: ${new Date().toLocaleDateString()}</p>
        <h2>Document Summary</h2>
        <p>Contains ${sections.length} section(s).</p>
        ${sectionsHtml}
      </body>
      </html>
    `;
    }
    async generatePdfFromHtml(html, options) {
        try {
            const puppeteer = require('puppeteer');
            const browser = await puppeteer.launch({
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });
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
            return pdfBuffer;
        }
        catch (error) {
            throw new Error(`Failed to generate PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
}
exports.APIDocumentGenerator = APIDocumentGenerator;
//# sourceMappingURL=APIDocumentGenerator.js.map