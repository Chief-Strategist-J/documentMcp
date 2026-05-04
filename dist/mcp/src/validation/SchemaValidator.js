"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SchemaValidator = void 0;
const ajv_1 = __importDefault(require("ajv"));
/**
 * Centralized schema validation utility
 * Follows DRY principles - single source of truth for validation
 */
class SchemaValidator {
    constructor() {
        this.ajv = new ajv_1.default({ allErrors: true });
    }
    /**
     * Validates document layout schema
     * @param schema - Document layout schema to validate
     * @returns Validation result
     */
    validateDocumentLayout(schema) {
        const schemaDefinition = {
            type: 'object',
            required: ['schemaId'],
            properties: {
                schemaId: { type: 'string' },
                schemaVersion: { type: 'string', default: '1.0.0' },
                tableName: { type: 'string', default: '' },
                dimensions: {
                    type: 'object',
                    properties: {
                        minRows: { type: 'integer', minimum: 0, default: 0 },
                        maxRows: { type: 'integer', minimum: 1, default: 1000 },
                        defaultRows: { type: 'integer', minimum: 0, default: 0 },
                        columnCount: { type: 'integer', minimum: 0 }
                    }
                }
            }
        };
        const validate = this.ajv.compile(schemaDefinition);
        const result = validate(schema);
        return result;
    }
    /**
     * Validates section content schema
     * @param schema - Section content schema to validate
     * @returns Validation result
     */
    validateSectionContent(schema) {
        const schemaDefinition = {
            type: 'object',
            required: ['schemaId', 'columns'],
            properties: {
                schemaId: { type: 'string' },
                columns: {
                    type: 'array',
                    minItems: 1,
                    items: {
                        type: 'object',
                        required: ['id', 'name', 'type'],
                        properties: {
                            id: { type: 'string' },
                            name: { type: 'string' },
                            type: { type: 'string', enum: ['string', 'number', 'boolean', 'date', 'enum'] },
                            required: { type: 'boolean', default: false },
                            editable: { type: 'boolean', default: true },
                            sortable: { type: 'boolean', default: true },
                            filterable: { type: 'boolean', default: true },
                            width: { type: 'integer', minimum: 40, default: 120 },
                            options: { type: 'array', items: { type: 'string' }, default: [] },
                            format: {
                                type: 'object',
                                properties: {
                                    kind: {
                                        type: 'string',
                                        enum: ['text', 'currency', 'percentage', 'date'],
                                        default: 'text'
                                    },
                                    currencyCode: { type: 'string', default: 'USD' },
                                    precision: { type: 'integer', minimum: 0, maximum: 10, default: 2 }
                                }
                            }
                        }
                    }
                },
                rows: {
                    type: 'object',
                    properties: {
                        rowIdStrategy: { type: 'string', enum: ['auto', 'manual'], default: 'auto' },
                        allowAdd: { type: 'boolean', default: true },
                        allowDelete: { type: 'boolean', default: true },
                        allowReorder: { type: 'boolean', default: false },
                        showRowNumbers: { type: 'boolean', default: false }
                    }
                },
                validationSchema: { type: 'object', default: {} },
                behaviorSchema: {
                    type: 'object',
                    properties: {
                        sorting: {
                            type: 'object',
                            properties: {
                                enabled: { type: 'boolean', default: true },
                                multiColumn: { type: 'boolean', default: false }
                            }
                        },
                        filtering: {
                            type: 'object',
                            properties: {
                                enabled: { type: 'boolean', default: true }
                            }
                        },
                        pagination: {
                            type: 'object',
                            properties: {
                                enabled: { type: 'boolean', default: true },
                                pageSize: { type: 'integer', default: 10 }
                            }
                        },
                        editing: {
                            type: 'object',
                            properties: {
                                enabled: { type: 'boolean', default: true },
                                mode: { type: 'string', enum: ['cell', 'row'], default: 'cell' }
                            }
                        }
                    }
                }
            }
        };
        const validate = this.ajv.compile(schemaDefinition);
        return validate(schema);
    }
    /**
     * Validates styling schema
     * @param schema - Styling schema to validate
     * @returns Validation result
     */
    validateStyling(schema) {
        const schemaDefinition = {
            type: 'object',
            properties: {
                table: {
                    type: 'object',
                    properties: {
                        backgroundColor: { type: 'string', default: '#ffffff' },
                        borderColor: { type: 'string', default: '#d9d9d9' },
                        borderWidth: { type: 'integer', default: 1 },
                        borderRadius: { type: 'integer', default: 4 },
                        fontFamily: { type: 'string', default: 'Arial' },
                        fontSize: { type: 'integer', default: 14 },
                        textColor: { type: 'string', default: '#000000' }
                    }
                },
                header: {
                    type: 'object',
                    properties: {
                        backgroundColor: { type: 'string', default: '#f5f5f5' },
                        textColor: { type: 'string', default: '#000000' },
                        fontWeight: { type: 'integer', default: 600 },
                        fontSize: { type: 'integer', default: 14 },
                        height: { type: 'integer', default: 40 }
                    }
                },
                row: {
                    type: 'object',
                    properties: {
                        height: { type: 'integer', default: 36 },
                        backgroundColor: { type: 'string', default: '#ffffff' },
                        alternateBackgroundColor: { type: 'string', default: '#fafafa' },
                        hoverBackgroundColor: { type: 'string', default: '#eeeeee' },
                        selectedBackgroundColor: { type: 'string', default: '#dddddd' }
                    }
                },
                cell: {
                    type: 'object',
                    properties: {
                        paddingX: { type: 'integer', default: 8 },
                        paddingY: { type: 'integer', default: 6 },
                        borderColor: { type: 'string', default: '#e0e0e0' },
                        borderWidth: { type: 'integer', default: 1 },
                        textAlign: { type: 'string', enum: ['left', 'center', 'right'], default: 'left' }
                    }
                },
                columnOverrides: { type: 'object', default: {} }
            }
        };
        const validate = this.ajv.compile(schemaDefinition);
        return validate(schema);
    }
    /**
     * Gets validation errors for a schema
     * @param schema - Schema to validate
     * @param schemaType - Type of schema being validated
     * @returns Array of validation errors
     */
    getValidationErrors(schema, schemaType) {
        let isValid;
        switch (schemaType) {
            case 'document':
                isValid = this.validateDocumentLayout(schema);
                break;
            case 'section':
                isValid = this.validateSectionContent(schema);
                break;
            case 'styling':
                isValid = this.validateStyling(schema);
                break;
            default:
                return ['Unknown schema type'];
        }
        if (isValid) {
            return [];
        }
        return this.ajv.errors?.map(error => error.message || 'Validation error') || [];
    }
}
exports.SchemaValidator = SchemaValidator;
