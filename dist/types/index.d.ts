/**
 * Core type definitions for document management SDK
 * Following strict coupling and DRY principles
 */
export type DocumentType = 'word' | 'pdf';
export type SectionType = 'table' | 'paragraph' | 'header' | 'footer' | 'image' | 'chart';
export interface DocumentConfig {
    id: string;
    name: string;
    type: DocumentType;
    layoutSchema: DocumentLayoutSchema;
    createdAt: Date;
    updatedAt: Date;
}
export interface DocumentLayoutSchema {
    schemaId: string;
    schemaVersion: string;
    tableName: string;
    dimensions: {
        minRows: number;
        maxRows: number;
        defaultRows: number;
        columnCount: number;
    };
}
export interface Section {
    id: string;
    documentId: string;
    sectionType: SectionType;
    sectionOrder: number;
    contentSchema: SectionContentSchema;
    stylingSchema: StylingSchema;
    data?: any[];
    createdAt: Date;
}
export interface SectionContentSchema {
    schemaId: string;
    columns: ColumnDefinition[];
    rows: RowConfig;
    validationSchema: ValidationSchema;
    behaviorSchema: BehaviorSchema;
}
export interface ColumnDefinition {
    id: string;
    name: string;
    type: 'string' | 'number' | 'boolean' | 'date' | 'enum';
    required: boolean;
    editable: boolean;
    sortable: boolean;
    filterable: boolean;
    width: number;
    options: string[];
    format: FormatConfig;
}
export interface FormatConfig {
    kind: 'text' | 'currency' | 'percentage' | 'date';
    currencyCode?: string;
    precision: number;
}
export interface RowConfig {
    rowIdStrategy: 'auto' | 'manual';
    allowAdd: boolean;
    allowDelete: boolean;
    allowReorder: boolean;
    showRowNumbers: boolean;
}
export interface ValidationSchema {
    [key: string]: {
        minLength?: number;
        maxLength?: number;
        pattern?: string;
        min?: number;
        max?: number;
        allowedValues?: string[];
    };
}
export interface BehaviorSchema {
    sorting: {
        enabled: boolean;
        multiColumn: boolean;
    };
    filtering: {
        enabled: boolean;
    };
    pagination: {
        enabled: boolean;
        pageSize: number;
    };
    editing: {
        enabled: boolean;
        mode: 'cell' | 'row';
    };
}
export interface StylingSchema {
    table: TableStyle;
    header: HeaderStyle;
    row: RowStyle;
    cell: CellStyle;
    columnOverrides: {
        [key: string]: ColumnStyleOverride;
    };
}
export interface TableStyle {
    backgroundColor: string;
    borderColor: string;
    borderWidth: number;
    borderRadius: number;
    fontFamily: string;
    fontSize: number;
    textColor: string;
}
export interface HeaderStyle {
    backgroundColor: string;
    textColor: string;
    fontWeight: number;
    fontSize: number;
    height: number;
}
export interface RowStyle {
    height: number;
    backgroundColor: string;
    alternateBackgroundColor: string;
    hoverBackgroundColor: string;
    selectedBackgroundColor: string;
}
export interface CellStyle {
    paddingX: number;
    paddingY: number;
    borderColor: string;
    borderWidth: number;
    textAlign: 'left' | 'center' | 'right';
}
export interface ColumnStyleOverride {
    textAlign?: 'left' | 'center' | 'right';
}
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}
export interface CreateDocumentRequest {
    name: string;
    type: DocumentType;
    layoutSchema: DocumentLayoutSchema;
}
export interface UpdateDocumentRequest {
    name?: string;
    layoutSchema?: DocumentLayoutSchema;
}
export interface CreateSectionRequest {
    documentId: string;
    sectionType: SectionType;
    sectionOrder: number;
    contentSchema: SectionContentSchema;
    stylingSchema: StylingSchema;
}
export interface UpdateSectionRequest {
    sectionOrder?: number;
    contentSchema?: SectionContentSchema;
    stylingSchema?: StylingSchema;
}
export interface GenerateDocumentRequest {
    format: DocumentType;
    outputPath?: string;
}
export interface AddSectionDataRequest {
    sectionId: string;
    data: any[];
}
export interface UpdateSectionDataRequest {
    sectionId: string;
    rowIndex: number;
    data: any;
}
export interface DocumentGenerationOptions {
    includeHeaders: boolean;
    includeFooters: boolean;
    pageSize: 'A4' | 'Letter' | 'Legal';
    orientation: 'portrait' | 'landscape';
    margins: {
        top: number;
        right: number;
        bottom: number;
        left: number;
    };
}
//# sourceMappingURL=index.d.ts.map