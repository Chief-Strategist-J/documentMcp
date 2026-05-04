"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfessionalDocumentGenerator = void 0;
const docx_1 = require("docx");
/**
 * Professional document generator with rich content and UI/UX perspective
 * Based on the doc.js reference for professional document styling
 * Follows DRY principles - centralized document generation logic
 * Follows strict null handling and typecasting rules
 */
class ProfessionalDocumentGenerator {
    constructor() {
        this.COLORS = {
            science: '1F5C99', // deep blue
            engineering: '1A6B3C', // deep green
            business: '7B3F00', // deep brown/orange
            headerBg: '1F3864', // dark navy for column headers
            headerText: 'FFFFFF',
            scienceBg: 'D6E4F7',
            engBg: 'D6F0E0',
            bizBg: 'FAE5CC',
            altRow: 'F7F9FC',
            white: 'FFFFFF',
            border: 'CCCCCC',
        };
        /**
         * Border helper - follows DRY principles
         */
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
        /**
         * Sample analysis data - follows DRY principles
         */
        this.SCIENCE_ANALYSES = [
            ["Descriptive Statistics", "What is the summary of the data?", "pandas, numpy", "Descriptive Summary Report", "Every analysis starts with knowing what the data looks like", "Gives mean, median, std, min, max — instant data snapshot"],
            ["Frequency Distribution", "How often does each value occur?", "pandas, matplotlib", "Frequency Table Report", "Identifies most common values before deeper analysis", "Shows which categories or ranges dominate the dataset"],
            ["Histogram Analysis", "What is the shape of the data?", "matplotlib, seaborn", "Data Shape Report", "Visualizes spread and skew of measurements", "Reveals if data is normal, skewed, or bimodal"],
            ["Box Plot Analysis", "Where are the outliers?", "seaborn, matplotlib", "Outlier Detection Report", "Quickly flags extreme values per variable or group", "Five-number summary shown visually; outliers plotted as dots"],
            ["Cross-tabulation", "How do two categorical variables relate?", "pandas", "Cross-Tab Report", "Standard in survey and experimental data comparison", "Counts occurrences at each intersection of two categories"],
            ["Data Profiling", "What is the quality of the dataset?", "pandas-profiling, ydata-profiling", "Data Quality Report", "Catches missing values and errors before any analysis", "Auto-generates completeness, uniqueness, and correlation stats"],
        ];
        this.ENGINEERING_ANALYSES = [
            ["Load Profile Analysis", "What are the usage patterns over time?", "pandas, matplotlib", "Load Pattern Report", "Systems must be designed to handle peak and average loads", "Shows hourly, daily, weekly load distributions"],
            ["Capacity Utilization Analysis", "How much of system capacity is being used?", "pandas", "Capacity Report", "Over/under-utilization signals scaling needs", "Percent utilized vs available across time or components"],
            ["Throughput Analysis", "How many units does the system process per unit time?", "pandas, numpy", "Throughput Report", "Throughput determines if system meets demand requirements", "Measures items processed per second, minute, or hour"],
            ["Latency Distribution Analysis", "What is the distribution of response times?", "pandas, numpy", "Latency Report", "P50 hides tail latency problems that affect users", "Percentile report: P50, P90, P95, P99, P99.9"],
            ["Error Rate Analysis", "What fraction of operations result in errors?", "pandas", "Error Rate Report", "Error rates determine system reliability", "Breaks down errors by type, endpoint, and time window"],
            ["Uptime / Availability Analysis", "What fraction of time is the system operational?", "pandas", "SLA Compliance Report", "Availability is a contractual and operational requirement", "Calculates uptime percent and downtime events"],
        ];
        this.BUSINESS_ANALYSES = [
            ["Revenue Trend Analysis", "How has revenue changed over time?", "pandas, matplotlib", "Revenue Trend Report", "Revenue trends indicate business health and growth", "Shows month-over-month and year-over-year revenue changes"],
            ["Customer Segmentation", "Which customer groups are most valuable?", "scikit-learn, pandas", "Customer Segments Report", "Targeted marketing requires understanding customer groups", "Clusters customers by behavior, demographics, and value"],
            ["Market Basket Analysis", "Which products are frequently bought together?", "mlxtend, pandas", "Association Rules Report", "Product bundling increases average order value", "Finds frequent itemsets and generates association rules"],
            ["Churn Prediction", "Which customers are likely to leave?", "scikit-learn, xgboost", "Churn Risk Report", "Customer retention is more cost-effective than acquisition", "Predicts churn probability and identifies risk factors"],
            ["Sales Forecasting", "What will future sales look like?", "prophet, statsmodels", "Sales Forecast Report", "Sales forecasts guide inventory and staffing decisions", "Time series forecasting with trend and seasonality"],
            ["Profit Margin Analysis", "What are the most profitable products/services?", "pandas, numpy", "Profitability Report", "Focus on high-margin products maximizes profitability", "Calculates contribution margins and break-even points"],
        ];
    }
    /**
     * Cell helper - creates styled table cells
     * @param text - Cell text content
     * @param width - Cell width
     * @param options - Styling options
     * @returns Formatted TableCell
     */
    cell(text, width, options = {}) {
        const { bold = false, bg = this.COLORS.white, color = '000000', size = 18, italic = false, center = false } = options;
        return new docx_1.TableCell({
            width: { size: width, type: docx_1.WidthType.DXA },
            borders: this.borders(),
            shading: { fill: bg, type: docx_1.ShadingType.CLEAR },
            margins: { top: 60, bottom: 60, left: 100, right: 100 },
            verticalAlign: docx_1.VerticalAlign.TOP,
            children: [new docx_1.Paragraph({
                    alignment: center ? docx_1.AlignmentType.CENTER : docx_1.AlignmentType.LEFT,
                    children: [new docx_1.TextRun({
                            text,
                            bold,
                            color,
                            size,
                            italics: italic,
                            font: 'Arial'
                        })]
                })]
        });
    }
    /**
     * Header row helper - creates styled table headers
     * @param cols - Array of [text, width] pairs
     * @returns Formatted TableRow
     */
    headerRow(cols) {
        return new docx_1.TableRow({
            tableHeader: true,
            children: cols.map(([text, width]) => new docx_1.TableCell({
                width: { size: width, type: docx_1.WidthType.DXA },
                borders: this.borders(this.COLORS.headerBg),
                shading: { fill: this.COLORS.headerBg, type: docx_1.ShadingType.CLEAR },
                margins: { top: 80, bottom: 80, left: 100, right: 100 },
                verticalAlign: docx_1.VerticalAlign.CENTER,
                children: [new docx_1.Paragraph({
                        alignment: docx_1.AlignmentType.CENTER,
                        children: [new docx_1.TextRun({
                                text,
                                bold: true,
                                color: this.COLORS.headerText,
                                size: 18,
                                font: 'Arial'
                            })]
                    })]
            }))
        });
    }
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
    dataRow(no, name, answers, library, reportName, why, how, domain, rowIdx) {
        const bg = rowIdx % 2 === 0 ? this.COLORS.white : this.COLORS.altRow;
        const domainColor = domain === 'Scientific/Research' ? this.COLORS.scienceBg :
            domain === 'Engineering/Systems' ? this.COLORS.engBg : this.COLORS.bizBg;
        const domainText = domain === 'Scientific/Research' ? this.COLORS.science :
            domain === 'Engineering/Systems' ? this.COLORS.engineering : this.COLORS.business;
        return new docx_1.TableRow({
            children: [
                this.cell(String(no), 480, { bold: true, bg, center: true }),
                this.cell(name, 1440, { bold: true, bg, color: domainText }),
                this.cell(answers, 1200, { bg }),
                this.cell(library, 1080, { bg, italic: true, size: 16 }),
                this.cell(reportName, 1320, { bg, bold: true }),
                this.cell(why, 1920, { bg }),
                this.cell(how, 1920, { bg }),
            ]
        });
    }
    /**
     * Section heading row helper - creates section dividers
     * @param label - Section label text
     * @param color - Background color
     * @returns Formatted TableRow
     */
    sectionRow(label, color) {
        return new docx_1.TableRow({
            children: [
                new docx_1.TableCell({
                    columnSpan: 7,
                    width: { size: 9360, type: docx_1.WidthType.DXA },
                    borders: this.borders(color),
                    shading: { fill: color, type: docx_1.ShadingType.CLEAR },
                    margins: { top: 80, bottom: 80, left: 120, right: 120 },
                    children: [new docx_1.Paragraph({
                            children: [new docx_1.TextRun({
                                    text: label,
                                    bold: true,
                                    color: this.COLORS.headerText,
                                    size: 22,
                                    font: 'Arial'
                                })]
                        })]
                })
            ]
        });
    }
    /**
     * Generates a professional document with rich content
     * @param document - Document configuration
     * @param sections - Document sections
     * @param format - Output format (word/pdf)
     * @param options - Generation options
     * @returns Generated document buffer
     */
    async generateProfessionalDocument(document, sections, format, options) {
        try {
            // Validate inputs - follows strict validation rules
            if (!document || typeof document !== 'object') {
                throw new Error('Document must be a valid object');
            }
            if (!format || typeof format !== 'string') {
                throw new Error('Format must be a non-empty string');
            }
            if (!['word', 'pdf'].includes(format)) {
                throw new Error('Format must be either "word" or "pdf"');
            }
            // Create professional document with rich content
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
                                                text: document.name || 'Professional Document',
                                                bold: true,
                                                size: 24,
                                                color: this.COLORS.headerBg,
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
                        children: this.generateDocumentContent(document, sections)
                    }]
            });
            if (format === 'word') {
                return await docx_1.Packer.toBuffer(doc);
            }
            else {
                // For PDF, generate HTML first then convert
                const html = this.generateHtmlContent(document, sections, options);
                return await this.generatePdfFromHtml(html, options);
            }
        }
        catch (error) {
            throw new Error(`Failed to generate professional document: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Generates document content with professional styling
     * @param document - Document configuration
     * @param sections - Document sections
     * @returns Array of document content elements
     */
    generateDocumentContent(document, sections) {
        const content = [];
        // Document title
        content.push(new docx_1.Paragraph({
            alignment: docx_1.AlignmentType.CENTER,
            spacing: { before: 400, after: 400 },
            children: [
                new docx_1.TextRun({
                    text: document.name || 'Professional Document',
                    bold: true,
                    size: 32,
                    color: this.COLORS.headerBg,
                })
            ]
        }));
        // Document metadata
        content.push(new docx_1.Paragraph({
            spacing: { after: 300 },
            children: [
                new docx_1.TextRun({
                    text: `Generated on: ${new Date().toLocaleDateString()}`,
                    size: 20,
                    color: '666666',
                })
            ]
        }));
        // Executive summary
        content.push(new docx_1.Paragraph({
            heading: docx_1.HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 },
            children: [
                new docx_1.TextRun({
                    text: 'Executive Summary',
                    bold: true,
                    size: 28,
                    color: this.COLORS.headerBg,
                })
            ]
        }));
        content.push(new docx_1.Paragraph({
            spacing: { after: 400 },
            children: [
                new docx_1.TextRun({
                    text: 'This comprehensive document provides detailed analysis and insights across multiple domains including Scientific/Research, Engineering/Systems, and Business/Operations. The following sections present systematic approaches to data analysis, system optimization, and business intelligence.',
                    size: 22,
                })
            ]
        }));
        // Analysis tables by domain
        content.push(...this.generateAnalysisTables());
        // Section content
        if (sections && sections.length > 0) {
            content.push(new docx_1.Paragraph({
                heading: docx_1.HeadingLevel.HEADING_1,
                spacing: { before: 600, after: 200 },
                children: [
                    new docx_1.TextRun({
                        text: 'Detailed Analysis',
                        bold: true,
                        size: 28,
                        color: this.COLORS.headerBg,
                    })
                ]
            }));
            sections.forEach((section, index) => {
                content.push(new docx_1.Paragraph({
                    heading: docx_1.HeadingLevel.HEADING_2,
                    spacing: { before: 400, after: 200 },
                    children: [
                        new docx_1.TextRun({
                            text: section.sectionType || `Section ${index + 1}`,
                            bold: true,
                            size: 24,
                        })
                    ]
                }));
                if (section.contentSchema) {
                    content.push(new docx_1.Paragraph({
                        spacing: { after: 300 },
                        children: [
                            new docx_1.TextRun({
                                text: `Schema: ${section.contentSchema.schemaId || 'Unknown'}`,
                                size: 20,
                                italics: true,
                                color: '666666',
                            })
                        ]
                    }));
                }
            });
        }
        return content;
    }
    /**
     * Generates professional analysis tables
     * @returns Array of table elements
     */
    generateAnalysisTables() {
        const content = [];
        // Scientific/Research Section
        content.push(new docx_1.Paragraph({
            heading: docx_1.HeadingLevel.HEADING_1,
            spacing: { before: 600, after: 200 },
            children: [
                new docx_1.TextRun({
                    text: 'Scientific/Research Analyses',
                    bold: true,
                    size: 28,
                    color: this.COLORS.science,
                })
            ]
        }));
        content.push(new docx_1.Table({
            width: { size: 100, type: docx_1.WidthType.PERCENTAGE },
            rows: [
                this.headerRow([['No.', 480], ['Analysis Name', 1440], ['Answers Question', 1200], ['Libraries/Tools', 1080], ['Report Name', 1320], ['Why Important', 1920], ['How It Works', 1920]]),
                this.sectionRow('L4 – Foundational Analyses', this.COLORS.science),
                ...this.SCIENCE_ANALYSES.map((analysis, idx) => this.dataRow(idx + 1, analysis[0], analysis[1], analysis[2], analysis[3], analysis[4], analysis[5], 'Scientific/Research', idx))
            ]
        }));
        // Engineering/Systems Section
        content.push(new docx_1.Paragraph({
            heading: docx_1.HeadingLevel.HEADING_1,
            spacing: { before: 600, after: 200 },
            children: [
                new docx_1.TextRun({
                    text: 'Engineering/Systems Analyses',
                    bold: true,
                    size: 28,
                    color: this.COLORS.engineering,
                })
            ]
        }));
        content.push(new docx_1.Table({
            width: { size: 100, type: docx_1.WidthType.PERCENTAGE },
            rows: [
                this.headerRow([['No.', 480], ['Analysis Name', 1440], ['Answers Question', 1200], ['Libraries/Tools', 1080], ['Report Name', 1320], ['Why Important', 1920], ['How It Works', 1920]]),
                this.sectionRow('L4 – Foundational Analyses', this.COLORS.engineering),
                ...this.ENGINEERING_ANALYSES.map((analysis, idx) => this.dataRow(idx + 1, analysis[0], analysis[1], analysis[2], analysis[3], analysis[4], analysis[5], 'Engineering/Systems', idx))
            ]
        }));
        // Business/Operations Section
        content.push(new docx_1.Paragraph({
            heading: docx_1.HeadingLevel.HEADING_1,
            spacing: { before: 600, after: 200 },
            children: [
                new docx_1.TextRun({
                    text: 'Business/Operations Analyses',
                    bold: true,
                    size: 28,
                    color: this.COLORS.business,
                })
            ]
        }));
        content.push(new docx_1.Table({
            width: { size: 100, type: docx_1.WidthType.PERCENTAGE },
            rows: [
                this.headerRow([['No.', 480], ['Analysis Name', 1440], ['Answers Question', 1200], ['Libraries/Tools', 1080], ['Report Name', 1320], ['Why Important', 1920], ['How It Works', 1920]]),
                this.sectionRow('L4 – Foundational Analyses', this.COLORS.business),
                ...this.BUSINESS_ANALYSES.map((analysis, idx) => this.dataRow(idx + 1, analysis[0], analysis[1], analysis[2], analysis[3], analysis[4], analysis[5], 'Business/Operations', idx))
            ]
        }));
        return content;
    }
    /**
     * Generates HTML content for PDF conversion
     * @param document - Document configuration
     * @param sections - Document sections
     * @param options - Generation options
     * @returns HTML string
     */
    generateHtmlContent(document, sections, options) {
        // This would generate professional HTML with proper styling
        // For now, return basic HTML structure
        return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${document.name || 'Professional Document'}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; }
          h1 { color: ${this.COLORS.headerBg}; text-align: center; }
          h2 { color: ${this.COLORS.science}; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th { background-color: ${this.COLORS.headerBg}; color: white; padding: 10px; text-align: center; }
          td { border: 1px solid ${this.COLORS.border}; padding: 8px; }
          .science { background-color: ${this.COLORS.scienceBg}; }
          .engineering { background-color: ${this.COLORS.engBg}; }
          .business { background-color: ${this.COLORS.bizBg}; }
        </style>
      </head>
      <body>
        <h1>${document.name || 'Professional Document'}</h1>
        <p>Generated on: ${new Date().toLocaleDateString()}</p>
        <h2>Executive Summary</h2>
        <p>This comprehensive document provides detailed analysis and insights across multiple domains.</p>
        <h2>Analysis Results</h2>
        <p>Professional document content would be rendered here with proper styling and formatting.</p>
      </body>
      </html>
    `;
    }
    /**
     * Generates PDF from HTML using Puppeteer
     * @param html - HTML content
     * @param options - Generation options
     * @returns PDF buffer
     */
    async generatePdfFromHtml(html, options) {
        try {
            // Import puppeteer dynamically to avoid issues in environments without it
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
exports.ProfessionalDocumentGenerator = ProfessionalDocumentGenerator;
//# sourceMappingURL=ProfessionalDocumentGenerator.js.map