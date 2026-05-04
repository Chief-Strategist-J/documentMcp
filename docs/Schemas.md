# 📋 Schema Documentation

## Overview

The Document Management SDK uses JSON Schema to define and validate document structures, section types, and styling. All schemas follow the JSON Schema Draft 2020-12 specification and provide comprehensive validation rules.

## 🏗️ Schema Structure

```
schemas/
├── document-layout.json          # Document layout and page setup
├── sections/
│   ├── chart-schema.json         # Chart section definition
│   ├── header-footer-schema.json # Header/footer section definition
│   ├── image-schema.json         # Image section definition
│   ├── paragraph-schema.json     # Paragraph section definition
│   └── table-schema.json         # Table section definition
└── styling/
    ├── pdf-styling.json          # PDF-specific styling
    └── word-styling.json         # Word-specific styling
```

## 📄 Document Layout Schema

### File: `schemas/document-layout.json`

Defines the overall document structure, page setup, and section organization.

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "Document Layout Schema",
  "type": "object",
  "required": ["schemaId", "tableName"],
  "properties": {
    "schemaId": {
      "type": "string",
      "description": "Unique identifier for the document layout schema"
    },
    "schemaVersion": {
      "type": "string",
      "default": "1.0.0",
      "description": "Version of the schema definition"
    },
    "tableName": {
      "type": "string",
      "default": "",
      "description": "Name of the document table"
    },
    "dimensions": {
      "type": "object",
      "properties": {
        "minRows": {
          "type": "integer",
          "minimum": 0,
          "default": 0,
          "description": "Minimum number of rows allowed"
        },
        "maxRows": {
          "type": "integer",
          "minimum": 1,
          "default": 1000,
          "description": "Maximum number of rows allowed"
        },
        "defaultRows": {
          "type": "integer",
          "minimum": 0,
          "default": 0,
          "description": "Default number of rows to create"
        },
        "columnCount": {
          "type": "integer",
          "minimum": 0,
          "description": "Number of columns in the document"
        }
      }
    },
    "pageSetup": {
      "type": "object",
      "properties": {
        "pageSize": {
          "type": "string",
          "enum": ["A4", "Letter", "Legal"],
          "default": "A4",
          "description": "Page size for the document"
        },
        "orientation": {
          "type": "string",
          "enum": ["portrait", "landscape"],
          "default": "portrait",
          "description": "Page orientation"
        },
        "margins": {
          "type": "object",
          "properties": {
            "top": {
              "type": "number",
              "default": 72,
              "description": "Top margin in points"
            },
            "right": {
              "type": "number",
              "default": 72,
              "description": "Right margin in points"
            },
            "bottom": {
              "type": "number",
              "default": 72,
              "description": "Bottom margin in points"
            },
            "left": {
              "type": "number",
              "default": 72,
              "description": "Left margin in points"
            }
          }
        }
      }
    },
    "sections": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "sectionType": {
            "type": "string",
            "enum": ["header", "footer", "table", "paragraph", "image", "chart"],
            "description": "Type of section"
          },
          "order": {
            "type": "integer",
            "minimum": 0,
            "description": "Order of the section in the document"
          },
          "repeatOnPages": {
            "type": "boolean",
            "default": false,
            "description": "Whether this section repeats on each page"
          }
        }
      }
    }
  }
}
```

### Usage Example

```json
{
  "schemaId": "report-layout-001",
  "tableName": "Sales Report",
  "dimensions": {
    "minRows": 1,
    "maxRows": 100,
    "defaultRows": 10,
    "columnCount": 5
  },
  "pageSetup": {
    "pageSize": "A4",
    "orientation": "portrait",
    "margins": {
      "top": 72,
      "right": 72,
      "bottom": 72,
      "left": 72
    }
  },
  "sections": [
    {
      "sectionType": "header",
      "order": 0,
      "repeatOnPages": true
    },
    {
      "sectionType": "table",
      "order": 1,
      "repeatOnPages": false
    },
    {
      "sectionType": "footer",
      "order": 2,
      "repeatOnPages": true
    }
  ]
}
```

## 📊 Section Schemas

### Chart Schema

### File: `schemas/sections/chart-schema.json`

Defines chart sections with 11 chart types, data structure, styling, axes, legend, animation, and interactivity.

#### Chart Types Supported
- `bar` - Bar charts
- `column` - Column charts
- `line` - Line charts
- `pie` - Pie charts
- `scatter` - Scatter plots
- `area` - Area charts
- `bubble` - Bubble charts
- `radar` - Radar charts
- `polar` - Polar charts
- `stock` - Stock charts
- `surface` - Surface charts

#### Key Properties

```json
{
  "schemaId": "chart-001",
  "chartType": "bar",
  "title": "Sales Chart",
  "subtitle": "Monthly Sales Data",
  "data": {
    "datasets": [
      {
        "label": "Sales",
        "data": [100, 200, 150],
        "backgroundColor": ["#FF0000", "#00FF00", "#0000FF"],
        "borderColor": ["#FF0000", "#00FF00", "#0000FF"],
        "borderWidth": 1
      }
    ],
    "labels": ["Jan", "Feb", "Mar"]
  },
  "position": {
    "x": 100,
    "y": 100,
    "width": 400,
    "height": 300,
    "alignment": "center"
  },
  "axes": {
    "xAxis": {
      "enabled": true,
      "title": "Months",
      "gridLines": true,
      "tickLabels": true
    },
    "yAxis": {
      "enabled": true,
      "title": "Sales ($)",
      "gridLines": true,
      "tickLabels": true
    }
  },
  "legend": {
    "enabled": true,
    "position": "bottom",
    "backgroundColor": "#ffffff",
    "textColor": "#000000",
    "fontSize": 12
  },
  "styling": {
    "backgroundColor": "#ffffff",
    "colorScheme": "default",
    "customColors": []
  },
  "animation": {
    "enabled": true,
    "duration": 1000,
    "easing": "easeInOut"
  },
  "interactivity": {
    "hover": true,
    "click": true,
    "tooltip": true,
    "zoom": false,
    "pan": false
  }
}
```

### Header/Footer Schema

### File: `schemas/sections/header-footer-schema.json`

Defines header and footer sections with content types, layout, repeat behavior, and background.

#### Content Types
- `text` - Text content
- `image` - Image content
- `pageNumber` - Page number
- `date` - Current date
- `table` - Table content

#### Key Properties

```json
{
  "schemaId": "header-001",
  "type": "header",
  "content": [
    {
      "contentType": "text",
      "text": "Company Name",
      "position": {
        "x": 50,
        "y": 10,
        "width": 200,
        "height": 20
      },
      "formatting": {
        "bold": true,
        "fontSize": 14,
        "fontFamily": "Arial",
        "color": "#000000",
        "alignment": "center"
      }
    },
    {
      "contentType": "pageNumber",
      "format": "Page {0}",
      "position": {
        "x": 500,
        "y": 10,
        "width": 100,
        "height": 20
      },
      "formatting": {
        "fontSize": 10,
        "alignment": "right"
      }
    }
  ],
  "layout": {
    "height": 48,
    "margins": {
      "top": 12,
      "right": 12,
      "bottom": 12,
      "left": 12
    },
    "border": {
      "enabled": true,
      "color": "#000000",
      "width": 1,
      "position": "bottom"
    }
  },
  "repeatBehavior": {
    "repeatOnPages": "all",
    "differentFirstPage": false,
    "differentOddEvenPages": false,
    "customPages": []
  },
  "background": {
    "color": "#f5f5f5",
    "transparency": 0
  }
}
```

### Image Schema

### File: `schemas/sections/image-schema.json`

Defines image sections with positioning, sizing, cropping, effects, shadows, and captions.

#### Key Properties

```json
{
  "schemaId": "image-001",
  "imagePath": "/path/to/image.png",
  "imageData": "base64-encoded-image-data",
  "altText": "Sample Image",
  "position": {
    "x": 100,
    "y": 100,
    "width": 200,
    "height": 150,
    "alignment": "center",
    "textWrap": "inline"
  },
  "sizing": {
    "scale": 1.0,
    "maintainAspectRatio": true,
    "fitMode": "fit",
    "maxWidth": 400,
    "maxHeight": 300
  },
  "cropping": {
    "enabled": false,
    "x": 0,
    "y": 0,
    "width": 100,
    "height": 100
  },
  "border": {
    "enabled": true,
    "color": "#000000",
    "width": 1,
    "style": "solid",
    "radius": 0
  },
  "effects": {
    "opacity": 1.0,
    "brightness": 1.0,
    "contrast": 1.0,
    "saturation": 1.0,
    "grayscale": false,
    "sepia": false,
    "blur": 0
  },
  "shadow": {
    "enabled": false,
    "color": "#808080",
    "offsetX": 2,
    "offsetY": 2,
    "blur": 4,
    "opacity": 0.5
  },
  "caption": {
    "text": "Image Caption",
    "position": "bottom",
    "formatting": {
      "fontSize": 10,
      "fontFamily": "Arial",
      "color": "#000000",
      "alignment": "center"
    }
  }
}
```

### Paragraph Schema

### File: `schemas/sections/paragraph-schema.json`

Defines paragraph sections with text content, formatting, positioning, margins, borders, and validation.

#### Key Properties

```json
{
  "schemaId": "paragraph-001",
  "content": "This is a sample paragraph text.",
  "formatting": {
    "bold": false,
    "italic": false,
    "underline": false,
    "fontSize": 12,
    "fontFamily": "Arial",
    "color": "#000000",
    "alignment": "left",
    "lineSpacing": 1.5,
    "paragraphSpacing": 6
  },
  "position": {
    "x": 50,
    "y": 100,
    "width": 400,
    "height": 50
  },
  "margins": {
    "top": 10,
    "right": 10,
    "bottom": 10,
    "left": 10
  },
  "border": {
    "enabled": false,
    "color": "#000000",
    "width": 1,
    "style": "solid"
  },
  "background": {
    "color": "#ffffff",
    "transparency": 0
  },
  "validation": {
    "minLength": 1,
    "maxLength": 1000,
    "pattern": "^[a-zA-Z0-9\\s]+$",
    "required": true
  }
}
```

### Table Schema

### File: `schemas/sections/table-schema.json`

Defines table sections with columns, rows, validation, behavior, and comprehensive table features.

#### Column Types
- `string` - Text columns
- `number` - Numeric columns
- `boolean` - Boolean columns
- `date` - Date columns
- `enum` - Enumeration columns

#### Key Properties

```json
{
  "schemaId": "table-001",
  "tableName": "Sales Data",
  "dimensions": {
    "minRows": 1,
    "maxRows": 100,
    "defaultRows": 10,
    "columnCount": 3
  },
  "columns": [
    {
      "id": "product",
      "name": "Product",
      "type": "string",
      "required": true,
      "editable": true,
      "sortable": true,
      "filterable": true,
      "width": 120,
      "options": [],
      "format": {
        "kind": "text"
      }
    },
    {
      "id": "price",
      "name": "Price",
      "type": "number",
      "required": true,
      "editable": true,
      "sortable": true,
      "filterable": true,
      "width": 100,
      "format": {
        "kind": "currency",
        "currencyCode": "USD",
        "precision": 2
      }
    },
    {
      "id": "category",
      "name": "Category",
      "type": "enum",
      "required": false,
      "editable": true,
      "sortable": true,
      "filterable": true,
      "width": 100,
      "options": ["Electronics", "Clothing", "Books"],
      "format": {
        "kind": "text"
      }
    }
  ],
  "rows": {
    "rowIdStrategy": "auto",
    "allowAdd": true,
    "allowDelete": true,
    "allowReorder": false,
    "showRowNumbers": false
  },
  "validationSchema": {
    "product": {
      "minLength": 1,
      "maxLength": 50,
      "pattern": "^[a-zA-Z0-9\\s]+$"
    },
    "price": {
      "min": 0,
      "max": 10000
    }
  },
  "behaviorSchema": {
    "sorting": {
      "enabled": true,
      "multiColumn": false
    },
    "filtering": {
      "enabled": true
    },
    "pagination": {
      "enabled": true,
      "pageSize": 10
    },
    "editing": {
      "enabled": true,
      "mode": "cell"
    }
  }
}
```

## 🎨 Styling Schemas

### PDF Styling Schema

### File: `schemas/styling/pdf-styling.json`

Defines PDF-specific styling including document, page, header, footer, table, and paragraph styles.

#### Key Properties

```json
{
  "document": {
    "backgroundColor": "#ffffff",
    "borderColor": "#d9d9d9",
    "borderWidth": 1,
    "fontFamily": "Arial",
    "fontSize": 12,
    "textColor": "#000000",
    "lineSpacing": 1.2,
    "paragraphSpacing": 6
  },
  "page": {
    "size": "A4",
    "orientation": "portrait",
    "margins": {
      "top": 72,
      "right": 72,
      "bottom": 72,
      "left": 72
    },
    "bleed": {
      "enabled": false,
      "size": 9
    }
  },
  "header": {
    "backgroundColor": "#f5f5f5",
    "textColor": "#000000",
    "fontWeight": "bold",
    "fontSize": 10,
    "height": 36,
    "padding": {
      "top": 6,
      "right": 12,
      "bottom": 6,
      "left": 12
    },
    "border": {
      "enabled": true,
      "color": "#000000",
      "width": 0.5,
      "position": "bottom"
    }
  },
  "footer": {
    "backgroundColor": "#f5f5f5",
    "textColor": "#000000",
    "fontWeight": "normal",
    "fontSize": 9,
    "height": 36,
    "border": {
      "enabled": true,
      "position": "top"
    }
  },
  "table": {
    "backgroundColor": "#ffffff",
    "borderColor": "#000000",
    "borderWidth": 0.5,
    "fontFamily": "Arial",
    "fontSize": 10,
    "textColor": "#000000",
    "cellPadding": {
      "top": 4,
      "right": 6,
      "bottom": 4,
      "left": 6
    }
  },
  "tableHeader": {
    "backgroundColor": "#e8e8e8",
    "textColor": "#000000",
    "fontWeight": "bold",
    "fontSize": 10,
    "height": 24,
    "repeatOnEveryPage": true
  },
  "tableRow": {
    "height": 20,
    "backgroundColor": "#ffffff",
    "alternateBackgroundColor": "#f8f8f8"
  },
  "tableCell": {
    "paddingX": 6,
    "paddingY": 4,
    "borderColor": "#000000",
    "borderWidth": 0.5,
    "textAlign": "left",
    "verticalAlign": "middle"
  },
  "paragraph": {
    "backgroundColor": "#ffffff",
    "textColor": "#000000",
    "fontSize": 12,
    "fontWeight": "normal",
    "alignment": "left",
    "lineSpacing": 1.2,
    "paragraphSpacing": 6,
    "indentation": {
      "left": 0,
      "right": 0,
      "firstLine": 0
    }
  },
  "columnOverrides": {
    "price": {
      "textAlign": "right",
      "fontWeight": "bold"
    }
  },
  "pdfSpecific": {
    "compression": "flate",
    "optimizeFor": "print",
    "embedFonts": true,
    "subsetFonts": true,
    "metadata": {
      "title": "Document Title",
      "author": "Author Name",
      "subject": "Document Subject",
      "keywords": "document, pdf, report",
      "creator": "Document Management SDK",
      "producer": "Document Management SDK"
    },
    "security": {
      "userPassword": "",
      "ownerPassword": "",
      "permissions": {
        "print": true,
        "copy": true,
        "modify": true,
        "annotate": true
      }
    }
  }
}
```

### Word Styling Schema

### File: `schemas/styling/word-styling.json`

Defines Word-specific styling with similar structure to PDF but Word-specific optimizations.

#### Key Properties

```json
{
  "document": {
    "backgroundColor": "#ffffff",
    "borderColor": "#d9d9d9",
    "borderWidth": 1,
    "borderRadius": 4,
    "fontFamily": "Arial",
    "fontSize": 14,
    "textColor": "#000000",
    "lineSpacing": 1.0,
    "paragraphSpacing": 0
  },
  "header": {
    "backgroundColor": "#f5f5f5",
    "textColor": "#000000",
    "fontWeight": 600,
    "fontSize": 14,
    "height": 40,
    "border": {
      "enabled": false,
      "color": "#000000",
      "width": 1,
      "style": "solid"
    }
  },
  "footer": {
    "backgroundColor": "#f5f5f5",
    "textColor": "#000000",
    "fontWeight": 400,
    "fontSize": 10,
    "height": 40
  },
  "table": {
    "backgroundColor": "#ffffff",
    "borderColor": "#d9d9d9",
    "borderWidth": 1,
    "borderRadius": 4,
    "fontFamily": "Arial",
    "fontSize": 12,
    "textColor": "#000000",
    "cellPadding": {
      "top": 4,
      "right": 4,
      "bottom": 4,
      "left": 4
    }
  },
  "tableHeader": {
    "backgroundColor": "#f5f5f5",
    "textColor": "#000000",
    "fontWeight": 600,
    "fontSize": 12,
    "height": 30,
    "border": {
      "bottom": {
        "enabled": true,
        "color": "#000000",
        "width": 2
      }
    }
  },
  "tableRow": {
    "height": 24,
    "backgroundColor": "#ffffff",
    "alternateBackgroundColor": "#fafafa",
    "hoverBackgroundColor": "#eeeeee",
    "selectedBackgroundColor": "#dddddd"
  },
  "tableCell": {
    "paddingX": 8,
    "paddingY": 4,
    "borderColor": "#e0e0e0",
    "borderWidth": 1,
    "textAlign": "left",
    "verticalAlign": "middle"
  },
  "paragraph": {
    "backgroundColor": "#ffffff",
    "textColor": "#000000",
    "fontSize": 12,
    "fontWeight": 400,
    "fontStyle": "normal",
    "textDecoration": "none",
    "alignment": "left",
    "lineSpacing": 1.0,
    "paragraphSpacing": 0,
    "indentation": {
      "left": 0,
      "right": 0,
      "firstLine": 0
    }
  },
  "columnOverrides": {
    "price": {
      "textAlign": "right",
      "fontWeight": 600
    }
  }
}
```

## ✅ Schema Validation

### Validation Rules

All schemas include comprehensive validation rules:

- **Required Fields**: Ensures essential data is present
- **Type Validation**: Validates data types (string, number, boolean, array, object)
- **Enum Validation**: Restricts values to predefined sets
- **Pattern Validation**: Validates string patterns using regex
- **Range Validation**: Validates numeric ranges and string/array lengths
- **Format Validation**: Validates specific formats (colors, dates, etc.)

### Validation Examples

#### Valid Chart Schema
```json
{
  "schemaId": "chart-001",
  "chartType": "bar",
  "data": {
    "datasets": [{
      "label": "Sales",
      "data": [100, 200, 150]
    }],
    "labels": ["Jan", "Feb", "Mar"]
  }
}
```

#### Invalid Chart Schema
```json
{
  "schemaId": "chart-001",
  "chartType": "invalid-type",  // ❌ Invalid enum value
  "data": {
    "datasets": [],             // ❌ minItems: 1 required
    "labels": ["Jan", "Feb", "Mar"]
  }
}
```

### Validation Errors

```json
{
  "valid": false,
  "errors": [
    "chartType should be one of: bar, column, line, pie, scatter, area, bubble, radar, polar, stock, surface, got invalid-type",
    "data.datasets should have at least 1 items, got 0"
  ]
}
```

## 🧪 Schema Testing

The schemas are thoroughly tested with the `SchemaValidation.test.ts` test suite:

```bash
# Run schema validation tests
npm test -- tests/unit/SchemaValidation.test.ts
```

### Test Coverage

- ✅ **Valid Data Tests**: All schemas with complete valid data
- ✅ **Invalid Data Tests**: Missing required fields, wrong types, invalid values
- ✅ **Edge Case Tests**: Boundary values, empty arrays, null values
- ✅ **Schema Integrity Tests**: JSON syntax validation, schema version validation

## 🔧 Custom Schemas

### Creating Custom Schemas

1. **Follow JSON Schema Draft 2020-12 specification**
2. **Include proper `$schema` reference**
3. **Define clear `title` and `description`**
4. **Specify `required` fields**
5. **Add comprehensive validation rules**
6. **Include default values where appropriate**

### Custom Schema Example

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "Custom Section Schema",
  "type": "object",
  "required": ["schemaId", "customField"],
  "properties": {
    "schemaId": {
      "type": "string",
      "description": "Unique identifier"
    },
    "customField": {
      "type": "string",
      "minLength": 1,
      "maxLength": 100,
      "pattern": "^[a-zA-Z0-9\\s]+$",
      "description": "Custom field with validation"
    }
  }
}
```

## 📚 Schema Best Practices

### Design Principles

1. **Consistency**: Use consistent naming conventions across schemas
2. **Validation**: Include comprehensive validation rules
3. **Documentation**: Provide clear descriptions for all properties
4. **Versioning**: Use semantic versioning for schema updates
5. **Backward Compatibility**: Maintain backward compatibility when possible

### Naming Conventions

- **camelCase** for property names
- **Descriptive names** that clearly indicate purpose
- **Consistent terminology** across all schemas
- **Schema IDs** should follow pattern: `{type}-{identifier}`

### Validation Guidelines

- **Required fields** should be truly essential
- **Default values** should be sensible
- **Ranges** should be reasonable (e.g., font sizes 6-72)
- **Patterns** should be specific and well-tested
- **Enums** should include all valid options

## 🔄 Schema Evolution

### Version Management

- **Major version**: Breaking changes
- **Minor version**: New features, backward compatible
- **Patch version**: Bug fixes, documentation updates

### Migration Strategy

1. **Maintain old schema versions** for compatibility
2. **Provide migration utilities** for schema updates
3. **Document breaking changes** thoroughly
4. **Test migration paths** with comprehensive tests

## 📖 Additional Resources

- [JSON Schema Draft 2020-12 Specification](https://json-schema.org/specification)
- [JSON Schema Validation](https://json-schema.org/understanding-json-schema/reference/validation)
- [Schema Best Practices Guide](https://json-schema.org/understanding-json-schema/best-practices)

## 🤝 Contributing to Schemas

1. **Review existing schemas** for patterns
2. **Follow naming conventions**
3. **Add comprehensive validation**
4. **Write tests** for new schemas
5. **Update documentation**
6. **Submit pull request** with detailed description

For more information about schema development and validation, see the [API Documentation](./API.md) and [Development Guide](./Development.md).
