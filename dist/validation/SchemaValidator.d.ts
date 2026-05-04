import { DocumentLayoutSchema, SectionContentSchema, StylingSchema } from '../types';
/**
 * Centralized schema validation utility
 * Follows DRY principles - single source of truth for validation
 */
export declare class SchemaValidator {
    private ajv;
    constructor();
    /**
     * Validates document layout schema
     * @param schema - Document layout schema to validate
     * @returns Validation result
     */
    validateDocumentLayout(schema: DocumentLayoutSchema): boolean;
    /**
     * Validates section content schema
     * @param schema - Section content schema to validate
     * @returns Validation result
     */
    validateSectionContent(schema: SectionContentSchema): boolean;
    /**
     * Validates styling schema
     * @param schema - Styling schema to validate
     * @returns Validation result
     */
    validateStyling(schema: StylingSchema): boolean;
    /**
     * Gets validation errors for a schema
     * @param schema - Schema to validate
     * @param schemaType - Type of schema being validated
     * @returns Array of validation errors
     */
    getValidationErrors(schema: any, schemaType: 'document' | 'section' | 'styling'): string[];
}
//# sourceMappingURL=SchemaValidator.d.ts.map