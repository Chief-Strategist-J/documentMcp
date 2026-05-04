import {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  HeadingLevel, AlignmentType, WidthType, BorderStyle, ShadingType,
  PageNumber, Header, Footer, VerticalAlign
} from 'docx';
import { Section } from '../types';

export class APIDocumentGenerator {
  private readonly COLORS = {
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

  private border = (color: string = this.COLORS.border) => ({
    style: BorderStyle.SINGLE,
    size: 1,
    color
  });

  private borders = (color: string = this.COLORS.border) => ({
    top: this.border(color),
    bottom: this.border(color),
    left: this.border(color),
    right: this.border(color)
  });

  private cell(
    text: string,
    width: number,
    options: {
      bold?: boolean;
      bg?: string;
      color?: string;
      size?: number;
      italic?: boolean;
      center?: boolean;
      header?: boolean;
    } = {}
  ): TableCell {
    const {
      bold = false,
      bg = this.COLORS.white,
      color = this.COLORS.text,
      size = 20,
      italic = false,
      center = false,
      header = false
    } = options;

    return new TableCell({
      width: { size: width, type: WidthType.DXA },
      borders: this.borders(),
      shading: { fill: bg, type: ShadingType.CLEAR },
      margins: { top: header ? 80 : 60, bottom: header ? 80 : 60, left: 100, right: 100 },
      verticalAlign: VerticalAlign.CENTER,
      children: [new Paragraph({
        alignment: center ? AlignmentType.CENTER : AlignmentType.LEFT,
        spacing: { before: 0, after: 0 },
        children: [new TextRun({
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

  private headerRow(columns: Array<{ name: string; width: number }>): TableRow {
    return new TableRow({
      tableHeader: true,
      children: columns.map(col => new TableCell({
        width: { size: col.width, type: WidthType.DXA },
        borders: this.borders(this.COLORS.headerBg),
        shading: { fill: this.COLORS.headerBg, type: ShadingType.CLEAR },
        margins: { top: 80, bottom: 80, left: 100, right: 100 },
        verticalAlign: VerticalAlign.CENTER,
        children: [new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 0, after: 0 },
          children: [new TextRun({
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

  private dataRow(
    data: Record<string, unknown>,
    columns: Array<{ name: string; key: string; width: number; type: string }>,
    rowIdx: number
  ): TableRow {
    const bg = rowIdx % 2 === 0 ? this.COLORS.white : this.COLORS.altRow;

    return new TableRow({
      children: columns.map(col => {
        const value = data[col.key];
        let stringValue = '';

        if (value === null || value === undefined) {
          stringValue = '';
        } else if (col.type === 'boolean') {
          stringValue = value ? 'Yes' : 'No';
        } else if (col.type === 'number') {
          stringValue = typeof value === 'number' ? value.toString() : String(value);
        } else if (col.type === 'date') {
          stringValue = value instanceof Date ? value.toLocaleDateString() : String(value);
        } else {
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

  async generateAPIDocument(
    document: any,
    sections: Section[],
    format: string,
    options?: any
  ): Promise<Buffer> {
    if (!document || typeof document !== 'object') {
      throw new Error('Document must be a valid object');
    }
    if (!format || typeof format !== 'string') {
      throw new Error('Format must be a non-empty string');
    }
    if (!['word', 'pdf'].includes(format)) {
      throw new Error('Format must be either "word" or "pdf"');
    }

    const doc = new Document({
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
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
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
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: `Page `,
                    children: [PageNumber.CURRENT],
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
      return await Packer.toBuffer(doc);
    } else {
      const html = this.generateAPIHtmlContent(document, sections, options);
      return await this.generatePdfFromHtml(html, options);
    }
  }

  private generateAPIContent(document: any, sections: Section[]): any[] {
    const content: any[] = [];

    content.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 400, after: 300 },
        children: [
          new TextRun({
            text: document.name || 'Untitled Document',
            bold: true,
            size: 32,
            color: this.COLORS.primary,
          })
        ]
      })
    );

    content.push(
      new Paragraph({
        spacing: { after: 200 },
        children: [
          new TextRun({
            text: `Generated on: ${new Date().toLocaleDateString()}`,
            size: 20,
            color: this.COLORS.muted,
          })
        ]
      })
    );

    if (document.type) {
      content.push(
        new Paragraph({
          spacing: { after: 400 },
          children: [
            new TextRun({
              text: `Document Type: ${document.type.toUpperCase()}`,
              bold: true,
              size: 22,
              color: this.COLORS.secondary,
            })
          ]
        })
      );
    }

    const totalRows = sections.reduce((acc, s) => acc + this.getRealSectionData(s).length, 0);

    content.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 600, after: 200 },
        children: [
          new TextRun({
            text: 'Document Summary',
            bold: true,
            size: 28,
            color: this.COLORS.primary,
          })
        ]
      })
    );

    content.push(
      new Paragraph({
        spacing: { after: 400 },
        children: [
          new TextRun({
            text: `This document contains ${sections.length} section${sections.length !== 1 ? 's' : ''} with ${totalRows} total data row${totalRows !== 1 ? 's' : ''}.`,
            size: 22,
          })
        ]
      })
    );

    if (sections && sections.length > 0) {
      sections.forEach((section, index) => {
        content.push(...this.generateSectionAPIContent(section, index + 1));
      });
    } else {
      content.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 400, after: 200 },
          children: [
            new TextRun({
              text: 'No Sections Available',
              bold: true,
              size: 24,
              color: this.COLORS.warning,
            })
          ]
        })
      );
      content.push(
        new Paragraph({
          spacing: { after: 400 },
          children: [
            new TextRun({
              text: 'This document was created without any sections. Add sections and data through the API to generate content.',
              size: 20,
              color: this.COLORS.muted,
            })
          ]
        })
      );
    }

    return content;
  }

  private generateSectionAPIContent(section: Section, sectionNumber: number): any[] {
    const content: any[] = [];

    content.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 600, after: 200 },
        children: [
          new TextRun({
            text: `Section ${sectionNumber}: ${(section as any).content_schema?.schemaId || section.sectionType || 'Data Table'}`,
            bold: true,
            size: 28,
            color: this.COLORS.primary,
          })
        ]
      })
    );

    if ((section as any).content_schema) {
      content.push(
        new Paragraph({
          spacing: { after: 200 },
          children: [
            new TextRun({
              text: `Schema: ${(section as any).content_schema.schemaId || 'Unknown'}`,
              size: 20,
              italics: true,
              color: this.COLORS.muted,
            })
          ]
        })
      );
    }

    if ((section as any).content_schema?.columns) {
      const columns = (section as any).content_schema.columns;
      const tableColumns = columns.map((col: any) => ({
        name: col.name || col.id,
        key: col.id,
        width: this.calculateColumnWidth(col.width),
        type: col.type
      }));

      content.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 400, after: 200 },
          children: [
            new TextRun({
              text: 'Data Table',
              bold: true,
              size: 24,
            })
          ]
        })
      );

      const tableRows = [this.headerRow(tableColumns)];

      const realData = this.getRealSectionData(section);
      if (realData.length > 0) {
        realData.forEach((row, index) => {
          tableRows.push(this.dataRow(row, tableColumns, index));
        });
      } else {
        tableRows.push(new TableRow({
          children: [new TableCell({
            columnSpan: tableColumns.length,
            width: { size: 10000, type: WidthType.DXA },
            borders: this.borders(),
            shading: { fill: this.COLORS.altRow, type: ShadingType.CLEAR },
            margins: { top: 80, bottom: 80, left: 120, right: 120 },
            children: [new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({
                text: 'No data available. Add data via POST /api/sections/{id}/data',
                color: this.COLORS.muted,
                size: 18,
                italics: true
              })]
            })]
          })]
        }));
      }

      content.push(
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: tableRows
        })
      );
    }

    return content;
  }

  private getRealSectionData(section: Section): Record<string, unknown>[] {
    if (Array.isArray((section as any).data) && (section as any).data.length > 0) {
      return (section as any).data as Record<string, unknown>[];
    }

    if (Array.isArray((section.contentSchema as any)?.rows?.data)) {
      return (section.contentSchema as any).rows.data as Record<string, unknown>[];
    }

    return [];
  }

  private calculateColumnWidth(widthConfig: any): number {
    if (typeof widthConfig === 'number') {
      return widthConfig * 10;
    }
    return 1500;
  }

  private generateAPIHtmlContent(document: any, sections: Section[], options?: any): string {
    const sectionsHtml = sections.map(section => {
      const rows = this.getRealSectionData(section);
      const columns: any[] = section.contentSchema?.columns || [];

      const theadCells = columns.map(c => `<th>${c.name || c.id}</th>`).join('');
      const tbodyRows = rows.length > 0
        ? rows.map((row, i) =>
            `<tr class="${i % 2 === 1 ? 'alt' : ''}">
              ${columns.map(c => `<td>${row[c.id] ?? ''}</td>`).join('')}
            </tr>`
          ).join('')
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

  private async generatePdfFromHtml(html: string, options?: any): Promise<Buffer> {
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
    } catch (error) {
      throw new Error(`Failed to generate PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}