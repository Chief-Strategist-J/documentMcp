# 📚 cURL Examples and Tutorials

## Overview

This guide provides practical examples and step-by-step tutorials for using the Document Management SDK API using pure cURL commands. Each example demonstrates real-world use cases and best practices for document creation, manipulation, and generation through HTTP requests.

## 🚀 Quick Start with cURL

### Basic Setup

```bash
# Set API base URL
API_BASE="http://localhost:3000"

# Set API key (if required)
API_KEY="your-api-key"

# Common headers
HEADERS="-H 'Content-Type: application/json' -H 'Accept: application/json'"
if [ ! -z "$API_KEY" ]; then
  HEADERS="$HEADERS -H 'X-API-Key: $API_KEY'"
fi
```

### Basic Document Creation

```bash
# Create a basic document
curl -X POST "$API_BASE/api/documents" \
  $HEADERS \
  -d '{
    "name": "My First Document",
    "type": "word",
    "layoutSchema": {
      "schemaId": "basic-layout",
      "tableName": "Main Content",
      "dimensions": {
        "minRows": 1,
        "maxRows": 50,
        "defaultRows": 5,
        "columnCount": 3
      },
      "pageSetup": {
        "pageSize": "A4",
        "orientation": "portrait",
        "margins": { "top": 72, "right": 72, "bottom": 72, "left": 72 }
      }
    }
  }'
```

### Adding Sections to Document

```bash
# Add a header section (replace DOCUMENT_ID with actual ID)
curl -X POST "$API_BASE/api/sections" \
  $HEADERS \
  -d '{
    "documentId": "DOCUMENT_ID",
    "sectionType": "header",
    "sectionOrder": 1,
    "contentSchema": {
      "schemaId": "company-header",
      "type": "header",
      "content": [{
        "contentType": "text",
        "text": "ACME Corporation",
        "formatting": {
          "bold": true,
          "fontSize": 16,
          "alignment": "center",
          "color": "#2c3e50"
        }
      }]
    }
  }'

# Add a table section
curl -X POST "$API_BASE/api/sections" \
  $HEADERS \
  -d '{
    "documentId": "DOCUMENT_ID",
    "sectionType": "table",
    "sectionOrder": 2,
    "contentSchema": {
      "schemaId": "sales-table",
      "columns": [
        {
          "id": "product",
          "name": "Product",
          "type": "string",
          "required": true,
          "editable": true,
          "sortable": true,
          "width": 150
        },
        {
          "id": "quantity",
          "name": "Quantity",
          "type": "number",
          "required": true,
          "editable": true,
          "sortable": true,
          "width": 100
        },
        {
          "id": "price",
          "name": "Price",
          "type": "number",
          "required": true,
          "editable": true,
          "sortable": true,
          "width": 100,
          "format": { "kind": "currency", "currencyCode": "USD", "precision": 2 }
        }
      ],
      "rows": {
        "allowAdd": true,
        "allowDelete": true,
        "showRowNumbers": true
      }
    }
  }'

# Add a footer section
curl -X POST "$API_BASE/api/sections" \
  $HEADERS \
  -d '{
    "documentId": "DOCUMENT_ID",
    "sectionType": "footer",
    "sectionOrder": 3,
    "contentSchema": {
      "schemaId": "page-footer",
      "type": "footer",
      "content": [{
        "contentType": "pageNumber",
        "format": "Page {0}",
        "formatting": {
          "fontSize": 10,
          "alignment": "center"
        }
      }]
    }
  }'
```

## 📊 Real-World Examples

### Example 1: Sales Report Generator

```bash
#!/bin/bash
# sales-report-generator.sh

API_BASE="http://localhost:3000"
HEADERS="-H 'Content-Type: application/json' -H 'Accept: application/json'"

# Step 1: Create document
echo "Creating sales report document..."
DOCUMENT_RESPONSE=$(curl -s -X POST "$API_BASE/api/documents" \
  $HEADERS \
  -d '{
    "name": "Sales Report - January 2024",
    "type": "pdf",
    "layoutSchema": {
      "schemaId": "sales-report-layout",
      "tableName": "Monthly Sales Data",
      "dimensions": { "minRows": 1, "maxRows": 100, "defaultRows": 3, "columnCount": 6 },
      "pageSetup": {
        "pageSize": "A4",
        "orientation": "landscape",
        "margins": { "top": 50, "right": 50, "bottom": 50, "left": 50 }
      }
    }
  }')

DOCUMENT_ID=$(echo "$DOCUMENT_RESPONSE" | jq -r '.data.id')
echo "Document created with ID: $DOCUMENT_ID"

# Step 2: Add title header
echo "Adding title header..."
curl -s -X POST "$API_BASE/api/sections" \
  $HEADERS \
  -d "{
    \"documentId\": \"$DOCUMENT_ID\",
    \"sectionType\": \"header\",
    \"sectionOrder\": 1,
    \"contentSchema\": {
      \"schemaId\": \"report-header\",
      \"type\": \"header\",
      \"content\": [
        {
          \"contentType\": \"text\",
          \"text\": \"Monthly Sales Report\",
          \"formatting\": { \"bold\": true, \"fontSize\": 20, \"alignment\": \"center\" }
        },
        {
          \"contentType\": \"text\",
          \"text\": \"January 2024\",
          \"formatting\": { \"fontSize\": 14, \"alignment\": \"center\" }
        }
      ]
    }
  }"

# Step 3: Add sales chart
echo "Adding sales chart..."
curl -s -X POST "$API_BASE/api/sections" \
  $HEADERS \
  -d "{
    \"documentId\": \"$DOCUMENT_ID\",
    \"sectionType\": \"chart\",
    \"sectionOrder\": 2,
    \"contentSchema\": {
      \"schemaId\": \"sales-chart\",
      \"chartType\": \"bar\",
      \"title\": \"Sales by Product\",
      \"data\": {
        \"datasets\": [{
          \"label\": \"Sales ($)\",
          \"data\": [44999.55, 3598.80, 5999.25],
          \"backgroundColor\": \"#3498db\",
          \"borderColor\": \"#2980b9\"
        }],
        \"labels\": [\"Laptop\", \"Mouse\", \"Keyboard\"]
      },
      \"position\": { \"x\": 100, \"y\": 150, \"width\": 600, \"height\": 300 }
    }
  }"

# Step 4: Add detailed table
echo "Adding detailed table..."
TABLE_RESPONSE=$(curl -s -X POST "$API_BASE/api/sections" \
  $HEADERS \
  -d "{
    \"documentId\": \"$DOCUMENT_ID\",
    \"sectionType\": \"table\",
    \"sectionOrder\": 3,
    \"contentSchema\": {
      \"schemaId\": \"sales-detail-table\",
      \"columns\": [
        { \"id\": \"product\", \"name\": \"Product\", \"type\": \"string\", \"width\": 200 },
        { \"id\": \"quantity\", \"name\": \"Quantity\", \"type\": \"number\", \"width\": 100 },
        { \"id\": \"unitPrice\", \"name\": \"Unit Price\", \"type\": \"number\", \"width\": 100 },
        { \"id\": \"total\", \"name\": \"Total\", \"type\": \"number\", \"width\": 100 },
        { \"id\": \"region\", \"name\": \"Region\", \"type\": \"string\", \"width\": 100 }
      ],
      \"rows\": { \"allowAdd\": false, \"allowDelete\": false, \"showRowNumbers\": true }
    }
  }")

TABLE_ID=$(echo "$TABLE_RESPONSE" | jq -r '.data.id')

# Step 5: Add table data
echo "Adding table data..."
curl -s -X PUT "$API_BASE/api/sections/$TABLE_ID/data" \
  $HEADERS \
  -d '{
    "data": [
      { "product": "Laptop", "quantity": 45, "unitPrice": 999.99, "total": 44999.55, "region": "North" },
      { "product": "Mouse", "quantity": 120, "unitPrice": 29.99, "total": 3598.80, "region": "South" },
      { "product": "Keyboard", "quantity": 75, "unitPrice": 79.99, "total": 5999.25, "region": "East" }
    ]
  }'

# Step 6: Generate PDF
echo "Generating PDF..."
GENERATE_RESPONSE=$(curl -s -X POST "$API_BASE/api/documents/$DOCUMENT_ID/generate" \
  $HEADERS \
  -d '{"format": "pdf"}')

FILENAME=$(echo "$GENERATE_RESPONSE" | jq -r '.data.filename')
echo "Report generated: $FILENAME"

echo "Sales report generation completed!"
echo "Document ID: $DOCUMENT_ID"
echo "Filename: $FILENAME"
```

### Example 2: Invoice Generator

```bash
#!/bin/bash
# invoice-generator.sh

API_BASE="http://localhost:3000"
HEADERS="-H 'Content-Type: application/json' -H 'Accept: application/json'"

# Invoice data (you can modify this)
INVOICE_DATA='{
  "invoiceNumber": "INV-2024-001",
  "customerName": "John Doe Company",
  "customerAddress": "123 Business St.\\nSuite 100\\nBusiness City, BC 12345",
  "items": [
    { "description": "Web Development Services", "quantity": 40, "unitPrice": 150, "total": 6000 },
    { "description": "Website Hosting (1 year)", "quantity": 1, "unitPrice": 500, "total": 500 },
    { "description": "Domain Registration", "quantity": 1, "unitPrice": 25, "total": 25 }
  ],
  "subtotal": 6525,
  "tax": 652.50,
  "total": 7177.50,
  "dueDate": "2024-02-15"
}'

# Step 1: Create invoice document
echo "Creating invoice document..."
DOCUMENT_RESPONSE=$(curl -s -X POST "$API_BASE/api/documents" \
  $HEADERS \
  -d "{
    \"name\": \"Invoice-$(echo $INVOICE_DATA | jq -r '.invoiceNumber')\",
    \"type\": \"word\",
    \"layoutSchema\": {
      \"schemaId\": \"invoice-layout\",
      \"tableName\": \"Invoice Details\",
      \"dimensions\": { \"minRows\": 1, \"maxRows\": 50, \"defaultRows\": 3, \"columnCount\": 4 },
      \"pageSetup\": { \"pageSize\": \"A4\", \"orientation\": \"portrait\", \"margins\": { \"top\": 72, \"right\": 72, \"bottom\": 72, \"left\": 72 } }
    }
  }")

DOCUMENT_ID=$(echo "$DOCUMENT_RESPONSE" | jq -r '.data.id')
echo "Invoice created with ID: $DOCUMENT_ID"

# Step 2: Add company header
echo "Adding company header..."
curl -s -X POST "$API_BASE/api/sections" \
  $HEADERS \
  -d "{
    \"documentId\": \"$DOCUMENT_ID\",
    \"sectionType\": \"header\",
    \"sectionOrder\": 1,
    \"contentSchema\": {
      \"schemaId\": \"invoice-header\",
      \"type\": \"header\",
      \"content\": [
        {
          \"contentType\": \"text\",
          \"text\": \"INVOICE\",
          \"formatting\": { \"bold\": true, \"fontSize\": 24, \"alignment\": \"right\" }
        },
        {
          \"contentType\": \"text\",
          \"text\": \"Invoice #: $(echo $INVOICE_DATA | jq -r '.invoiceNumber')\",
          \"formatting\": { \"fontSize\": 12, \"alignment\": \"right\" }
        },
        {
          \"contentType\": \"text\",
          \"text\": \"Date: $(date +%Y-%m-%d)\",
          \"formatting\": { \"fontSize\": 12, \"alignment\": \"right\" }
        },
        {
          \"contentType\": \"text\",
          \"text\": \"Due Date: $(echo $INVOICE_DATA | jq -r '.dueDate')\",
          \"formatting\": { \"fontSize\": 12, \"alignment\": \"right\" }
        }
      ]
    }
  }"

# Step 3: Add customer information
echo "Adding customer information..."
curl -s -X POST "$API_BASE/api/sections" \
  $HEADERS \
  -d "{
    \"documentId\": \"$DOCUMENT_ID\",
    \"sectionType\": \"paragraph\",
    \"sectionOrder\": 2,
    \"contentSchema\": {
      \"schemaId\": \"customer-info\",
      \"content\": \"Bill To:\\n$(echo $INVOICE_DATA | jq -r '.customerName')\\n$(echo $INVOICE_DATA | jq -r '.customerAddress')\",
      \"formatting\": { \"fontSize\": 12, \"lineSpacing\": 1.5 }
    }
  }"

# Step 4: Add items table
echo "Adding items table..."
TABLE_RESPONSE=$(curl -s -X POST "$API_BASE/api/sections" \
  $HEADERS \
  -d "{
    \"documentId\": \"$DOCUMENT_ID\",
    \"sectionType\": \"table\",
    \"sectionOrder\": 3,
    \"contentSchema\": {
      \"schemaId\": \"invoice-items\",
      \"columns\": [
        { \"id\": \"description\", \"name\": \"Description\", \"type\": \"string\", \"width\": 300 },
        { \"id\": \"quantity\", \"name\": \"Qty\", \"type\": \"number\", \"width\": 80 },
        { \"id\": \"unitPrice\", \"name\": \"Unit Price\", \"type\": \"number\", \"width\": 100 },
        { \"id\": \"total\", \"name\": \"Total\", \"type\": \"number\", \"width\": 100 }
      ],
      \"rows\": { \"allowAdd\": false, \"allowDelete\": false }
    }
  }")

TABLE_ID=$(echo "$TABLE_RESPONSE" | jq -r '.data.id')

# Step 5: Add items data
echo "Adding items data..."
curl -s -X PUT "$API_BASE/api/sections/$TABLE_ID/data" \
  $HEADERS \
  -d "{
    \"data\": $(echo $INVOICE_DATA | jq '.items')
  }"

# Step 6: Add totals section
echo "Adding totals section..."
curl -s -X POST "$API_BASE/api/sections" \
  $HEADERS \
  -d "{
    \"documentId\": \"$DOCUMENT_ID\",
    \"sectionType\": \"paragraph\",
    \"sectionOrder\": 4,
    \"contentSchema\": {
      \"schemaId\": \"invoice-totals\",
      \"content\": \"Subtotal: $$(echo $INVOICE_DATA | jq -r '.subtotal')\\nTax: $$(echo $INVOICE_DATA | jq -r '.tax')\\nTotal: $$(echo $INVOICE_DATA | jq -r '.total')\",
      \"formatting\": { 
        \"fontSize\": 12, 
        \"alignment\": \"right\",
        \"bold\": true,
        \"paragraphSpacing\": 6
      }
    }
  }"

# Step 7: Generate Word document
echo "Generating Word document..."
GENERATE_RESPONSE=$(curl -s -X POST "$API_BASE/api/documents/$DOCUMENT_ID/generate" \
  $HEADERS \
  -d '{"format": "word"}')

FILENAME=$(echo "$GENERATE_RESPONSE" | jq -r '.data.filename')
echo "Invoice generated: $FILENAME"

echo "Invoice generation completed!"
echo "Document ID: $DOCUMENT_ID"
echo "Filename: $FILENAME"
echo "Invoice Number: $(echo $INVOICE_DATA | jq -r '.invoiceNumber')"
```

### Example 3: Dashboard Report Generator

```bash
#!/bin/bash
# dashboard-generator.sh

API_BASE="http://localhost:3000"
HEADERS="-H 'Content-Type: application/json' -H 'Accept: application/json'"

# Dashboard data
DASHBOARD_DATA='{
  "title": "Monthly Dashboard Report",
  "period": "January 2024",
  "metrics": {
    "totalRevenue": 125000,
    "totalUsers": 2500,
    "conversionRate": 0.032,
    "avgOrderValue": 50
  },
  "chartData": {
    "revenue": [10000, 12000, 11000, 13000, 15000, 14000, 16000, 18000, 17000, 19000, 21000, 20000],
    "users": [200, 220, 215, 235, 250, 245, 265, 280, 275, 295, 310, 300],
    "labels": ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5", "Week 6", "Week 7", "Week 8", "Week 9", "Week 10", "Week 11", "Week 12"]
  }
}'

# Step 1: Create dashboard document
echo "Creating dashboard document..."
DOCUMENT_RESPONSE=$(curl -s -X POST "$API_BASE/api/documents" \
  $HEADERS \
  -d "{
    \"name\": \"$(echo $DASHBOARD_DATA | jq -r '.title') - $(echo $DASHBOARD_DATA | jq -r '.period')\",
    \"type\": \"pdf\",
    \"layoutSchema\": {
      \"schemaId\": \"dashboard-layout\",
      \"tableName\": \"Dashboard Metrics\",
      \"dimensions\": { \"minRows\": 1, \"maxRows\": 100, \"defaultRows\": 20, \"columnCount\": 2 },
      \"pageSetup\": { \"pageSize\": \"A4\", \"orientation\": \"portrait\", \"margins\": { \"top\": 50, \"right\": 50, \"bottom\": 50, \"left\": 50 } }
    }
  }")

DOCUMENT_ID=$(echo "$DOCUMENT_RESPONSE" | jq -r '.data.id')
echo "Dashboard created with ID: $DOCUMENT_ID"

# Step 2: Add title header
echo "Adding title header..."
curl -s -X POST "$API_BASE/api/sections" \
  $HEADERS \
  -d "{
    \"documentId\": \"$DOCUMENT_ID\",
    \"sectionType\": \"header\",
    \"sectionOrder\": 1,
    \"contentSchema\": {
      \"schemaId\": \"dashboard-header\",
      \"type\": \"header\",
      \"content\": [
        {
          \"contentType\": \"text\",
          \"text\": \"$(echo $DASHBOARD_DATA | jq -r '.title')\",
          \"formatting\": { \"bold\": true, \"fontSize\": 18, \"alignment\": \"center\" }
        },
        {
          \"contentType\": \"text\",
          \"text\": \"Period: $(echo $DASHBOARD_DATA | jq -r '.period')\",
          \"formatting\": { \"fontSize\": 14, \"alignment\": \"center\" }
        }
      ]
    }
  }"

# Step 3: Add metrics summary
echo "Adding metrics summary..."
curl -s -X POST "$API_BASE/api/sections" \
  $HEADERS \
  -d "{
    \"documentId\": \"$DOCUMENT_ID\",
    \"sectionType\": \"paragraph\",
    \"sectionOrder\": 2,
    \"contentSchema\": {
      \"schemaId\": \"metrics-summary\",
      \"content\": \"Key Metrics:\\n• Total Revenue: $$(echo $DASHBOARD_DATA | jq -r '.metrics.totalRevenue')\\n• Total Users: $(echo $DASHBOARD_DATA | jq -r '.metrics.totalUsers')\\n• Conversion Rate: $(echo $DASHBOARD_DATA | jq -r '.metrics.conversionRate * 100 | . * round / 1')%\\n• Avg Order Value: $$(echo $DASHBOARD_DATA | jq -r '.metrics.avgOrderValue')\",
      \"formatting\": { \"fontSize\": 12, \"bold\": true }
    }
  }"

# Step 4: Add revenue chart
echo "Adding revenue chart..."
curl -s -X POST "$API_BASE/api/sections" \
  $HEADERS \
  -d "{
    \"documentId\": \"$DOCUMENT_ID\",
    \"sectionType\": \"chart\",
    \"sectionOrder\": 3,
    \"contentSchema\": {
      \"schemaId\": \"revenue-chart\",
      \"chartType\": \"line\",
      \"title\": \"Revenue Trend\",
      \"data\": {
        \"datasets\": [{
          \"label\": \"Revenue ($)\",
          \"data\": $(echo $DASHBOARD_DATA | jq '.chartData.revenue'),
          \"backgroundColor\": \"rgba(52, 152, 219, 0.2)\",
          \"borderColor\": \"rgb(52, 152, 219)\",
          \"tension\": 0.1
        }],
        \"labels\": $(echo $DASHBOARD_DATA | jq '.chartData.labels')
      },
      \"position\": { \"x\": 50, \"y\": 200, \"width\": 500, \"height\": 250 }
    }
  }"

# Step 5: Add user growth chart
echo "Adding user growth chart..."
curl -s -X POST "$API_BASE/api/sections" \
  $HEADERS \
  -d "{
    \"documentId\": \"$DOCUMENT_ID\",
    \"sectionType\": \"chart\",
    \"sectionOrder\": 4,
    \"contentSchema\": {
      \"schemaId\": \"users-chart\",
      \"chartType\": \"bar\",
      \"title\": \"User Growth\",
      \"data\": {
        \"datasets\": [{
          \"label\": \"Users\",
          \"data\": $(echo $DASHBOARD_DATA | jq '.chartData.users'),
          \"backgroundColor\": \"rgba(46, 204, 113, 0.8)\"
        }],
        \"labels\": $(echo $DASHBOARD_DATA | jq '.chartData.labels')
      },
      \"position\": { \"x\": 50, \"y\": 500, \"width\": 500, \"height\": 250 }
    }
  }"

# Step 6: Generate PDF
echo "Generating PDF..."
GENERATE_RESPONSE=$(curl -s -X POST "$API_BASE/api/documents/$DOCUMENT_ID/generate" \
  $HEADERS \
  -d '{"format": "pdf"}')

FILENAME=$(echo "$GENERATE_RESPONSE" | jq -r '.data.filename')
echo "Dashboard report generated: $FILENAME"

echo "Dashboard report generation completed!"
echo "Document ID: $DOCUMENT_ID"
echo "Filename: $FILENAME"
```

## 🎓 Step-by-Step Tutorials

### Tutorial 1: Creating Your First Document

#### Step 1: Create the Document

```bash
#!/bin/bash
# tutorial-1-step-1.sh

API_BASE="http://localhost:3000"
HEADERS="-H 'Content-Type: application/json' -H 'Accept: application/json'"

# Create document
echo "Creating document..."
RESPONSE=$(curl -s -X POST "$API_BASE/api/documents" \
  $HEADERS \
  -d '{
    "name": "My First Document",
    "type": "word",
    "layoutSchema": {
      "schemaId": "simple-layout",
      "tableName": "Content",
      "dimensions": {
        "minRows": 1,
        "maxRows": 10,
        "defaultRows": 3,
        "columnCount": 2
      },
      "pageSetup": {
        "pageSize": "A4",
        "orientation": "portrait",
        "margins": { "top": 72, "right": 72, "bottom": 72, "left": 72 }
      }
    }
  }')

# Extract document ID
DOCUMENT_ID=$(echo "$RESPONSE" | jq -r '.data.id')
echo "Document created with ID: $DOCUMENT_ID"

# Save document ID for next steps
echo "$DOCUMENT_ID" > /tmp/document_id.txt
```

#### Step 2: Add Content

```bash
#!/bin/bash
# tutorial-1-step-2.sh

API_BASE="http://localhost:3000"
HEADERS="-H 'Content-Type: application/json' -H 'Accept: application/json'"
DOCUMENT_ID=$(cat /tmp/document_id.txt)

# Add title paragraph
echo "Adding title paragraph..."
curl -s -X POST "$API_BASE/api/sections" \
  $HEADERS \
  -d "{
    \"documentId\": \"$DOCUMENT_ID\",
    \"sectionType\": \"paragraph\",
    \"sectionOrder\": 1,
    \"contentSchema\": {
      \"schemaId\": \"title-paragraph\",
      \"content\": \"My Document Title\",
      \"formatting\": {
        \"bold\": true,
        \"fontSize\": 18,
        \"alignment\": \"center\",
        \"color\": \"#2c3e50\"
      }
    }
  }"

# Add table
echo "Adding table..."
TABLE_RESPONSE=$(curl -s -X POST "$API_BASE/api/sections" \
  $HEADERS \
  -d "{
    \"documentId\": \"$DOCUMENT_ID\",
    \"sectionType\": \"table\",
    \"sectionOrder\": 2,
    \"contentSchema\": {
      \"schemaId\": \"simple-table\",
      \"columns\": [
        { \"id\": \"name\", \"name\": \"Name\", \"type\": \"string\", \"width\": 150 },
        { \"id\": \"value\", \"name\": \"Value\", \"type\": \"number\", \"width\": 100 }
      ],
      \"rows\": { \"allowAdd\": true, \"allowDelete\": true }
    }
  }")

TABLE_ID=$(echo "$TABLE_RESPONSE" | jq -r '.data.id')
echo "Table created with ID: $TABLE_ID"

# Add data to table
echo "Adding table data..."
curl -s -X PUT "$API_BASE/api/sections/$TABLE_ID/data" \
  $HEADERS \
  -d '{
    "data": [
      { "name": "Item 1", "value": 100 },
      { "name": "Item 2", "value": 200 },
      { "name": "Item 3", "value": 300 }
    ]
  }'

echo "Content added successfully!"
```

#### Step 3: Generate the Document

```bash
#!/bin/bash
# tutorial-1-step-3.sh

API_BASE="http://localhost:3000"
HEADERS="-H 'Content-Type: application/json' -H 'Accept: application/json'"
DOCUMENT_ID=$(cat /tmp/document_id.txt)

echo "Generating Word document..."
RESPONSE=$(curl -s -X POST "$API_BASE/api/documents/$DOCUMENT_ID/generate" \
  $HEADERS \
  -d '{"format": "word"}')

FILENAME=$(echo "$RESPONSE" | jq -r '.data.filename')
echo "Document generated: $FILENAME"

# Download the document
echo "Downloading document..."
curl -s "$API_BASE/api/documents/$DOCUMENT_ID/download?format=word" \
  -o "$FILENAME"

echo "Document downloaded as: $FILENAME"

# Clean up
rm /tmp/document_id.txt
```

### Tutorial 2: Advanced Document with Multiple Sections

#### Step 1: Create Document with Custom Layout

```bash
#!/bin/bash
# tutorial-2-step-1.sh

API_BASE="http://localhost:3000"
HEADERS="-H 'Content-Type: application/json' -H 'Accept: application/json'"

echo "Creating advanced document..."
RESPONSE=$(curl -s -X POST "$API_BASE/api/documents" \
  $HEADERS \
  -d '{
    "name": "Advanced Report",
    "type": "pdf",
    "layoutSchema": {
      "schemaId": "advanced-layout",
      "tableName": "Report Data",
      "dimensions": { "minRows": 1, "maxRows": 100, "defaultRows": 20, "columnCount": 5 },
      "pageSetup": {
        "pageSize": "A4",
        "orientation": "landscape",
        "margins": { "top": 50, "right": 50, "bottom": 50, "left": 50 }
      },
      "sections": [
        { "sectionType": "header", "order": 0, "repeatOnPages": true },
        { "sectionType": "chart", "order": 1, "repeatOnPages": false },
        { "sectionType": "table", "order": 2, "repeatOnPages": false },
        { "sectionType": "footer", "order": 3, "repeatOnPages": true }
      ]
    }
  }")

DOCUMENT_ID=$(echo "$RESPONSE" | jq -r '.data.id')
echo "Advanced document created with ID: $DOCUMENT_ID"
echo "$DOCUMENT_ID" > /tmp/advanced_document_id.txt
```

#### Step 2: Add Header with Logo and Company Info

```bash
#!/bin/bash
# tutorial-2-step-2.sh

API_BASE="http://localhost:3000"
HEADERS="-H 'Content-Type: application/json' -H 'Accept: application/json'"
DOCUMENT_ID=$(cat /tmp/advanced_document_id.txt)

echo "Adding advanced header..."
curl -s -X POST "$API_BASE/api/sections" \
  $HEADERS \
  -d "{
    \"documentId\": \"$DOCUMENT_ID\",
    \"sectionType\": \"header\",
    \"sectionOrder\": 1,
    \"contentSchema\": {
      \"schemaId\": \"company-header\",
      \"type\": \"header\",
      \"content\": [
        {
          \"contentType\": \"image\",
          \"imagePath\": \"/path/to/logo.png\",
          \"position\": { \"x\": 50, \"y\": 10, \"width\": 100, \"height\": 50 }
        },
        {
          \"contentType\": \"text\",
          \"text\": \"ACME Corporation\",
          \"position\": { \"x\": 200, \"y\": 20, \"width\": 300, \"height\": 30 },
          \"formatting\": { \"bold\": true, \"fontSize\": 16, \"color\": \"#2c3e50\" }
        },
        {
          \"contentType\": \"text\",
          \"text\": \"123 Business Street, Suite 100, Business City, BC 12345\",
          \"position\": { \"x\": 200, \"y\": 45, \"width\": 400, \"height\": 20 },
          \"formatting\": { \"fontSize\": 10, \"color\": \"#7f8c8d\" }
        },
        {
          \"contentType\": \"pageNumber\",
          \"format\": \"Page {0}\",
          \"position\": { \"x\": 700, \"y\": 30, \"width\": 100, \"height\": 20 },
          \"formatting\": { \"fontSize\": 10, \"alignment\": \"right\" }
        }
      ],
      \"layout\": {
        \"height\": 60,
        \"border\": { \"enabled\": true, \"color\": \"#bdc3c7\", \"width\": 1, \"position\": \"bottom\" }
      }
    }
  }"

echo "Advanced header added!"
```

#### Step 3: Add Interactive Chart

```bash
#!/bin/bash
# tutorial-2-step-3.sh

API_BASE="http://localhost:3000"
HEADERS="-H 'Content-Type: application/json' -H 'Accept: application/json'"
DOCUMENT_ID=$(cat /tmp/advanced_document_id.txt)

echo "Adding interactive chart..."
curl -s -X POST "$API_BASE/api/sections" \
  $HEADERS \
  -d "{
    \"documentId\": \"$DOCUMENT_ID\",
    \"sectionType\": \"chart\",
    \"sectionOrder\": 2,
    \"contentSchema\": {
      \"schemaId\": \"interactive-chart\",
      \"chartType\": \"bar\",
      \"title\": \"Quarterly Performance\",
      \"subtitle\": \"Revenue and Profit Comparison\",
      \"data\": {
        \"datasets\": [
          {
            \"label\": \"Revenue ($M)\",
            \"data\": [12, 19, 15, 25],
            \"backgroundColor\": \"#3498db\",
            \"borderColor\": \"#2980b9\",
            \"borderWidth\": 2
          },
          {
            \"label\": \"Profit ($M)\",
            \"data\": [3, 5, 2, 8],
            \"backgroundColor\": \"#2ecc71\",
            \"borderColor\": \"#27ae60\",
            \"borderWidth\": 2
          }
        ],
        \"labels\": [\"Q1\", \"Q2\", \"Q3\", \"Q4\"]
      },
      \"position\": { \"x\": 100, \"y\": 100, \"width\": 600, \"height\": 300 },
      \"axes\": {
        \"xAxis\": { \"enabled\": true, \"title\": \"Quarter\", \"gridLines\": true },
        \"yAxis\": { \"enabled\": true, \"title\": \"Amount ($M)\", \"gridLines\": true }
      },
      \"legend\": { \"enabled\": true, \"position\": \"top\" },
      \"interactivity\": { \"hover\": true, \"click\": true, \"tooltip\": true }
    }
  }"

echo "Interactive chart added!"
```

#### Step 4: Add Detailed Data Table

```bash
#!/bin/bash
# tutorial-2-step-4.sh

API_BASE="http://localhost:3000"
HEADERS="-H 'Content-Type: application/json' -H 'Accept: application/json'"
DOCUMENT_ID=$(cat /tmp/advanced_document_id.txt)

echo "Adding detailed table..."
TABLE_RESPONSE=$(curl -s -X POST "$API_BASE/api/sections" \
  $HEADERS \
  -d "{
    \"documentId\": \"$DOCUMENT_ID\",
    \"sectionType\": \"table\",
    \"sectionOrder\": 3,
    \"contentSchema\": {
      \"schemaId\": \"detailed-table\",
      \"columns\": [
        {
          \"id\": \"product\",
          \"name\": \"Product\",
          \"type\": \"string\",
          \"required\": true,
          \"editable\": true,
          \"sortable\": true,
          \"filterable\": true,
          \"width\": 200
        },
        {
          \"id\": \"category\",
          \"name\": \"Category\",
          \"type\": \"enum\",
          \"required\": true,
          \"editable\": true,
          \"sortable\": true,
          \"filterable\": true,
          \"width\": 120,
          \"options\": [\"Electronics\", \"Clothing\", \"Books\", \"Home\", \"Sports\"]
        },
        {
          \"id\": \"units\",
          \"name\": \"Units Sold\",
          \"type\": \"number\",
          \"required\": true,
          \"editable\": true,
          \"sortable\": true,
          \"width\": 100,
          \"format\": { \"kind\": \"text\", \"precision\": 0 }
        },
        {
          \"id\": \"revenue\",
          \"name\": \"Revenue\",
          \"type\": \"number\",
          \"required\": true,
          \"editable\": true,
          \"sortable\": true,
          \"width\": 120,
          \"format\": { \"kind\": \"currency\", \"currencyCode\": \"USD\", \"precision\": 2 }
        },
        {
          \"id\": \"margin\",
          \"name\": \"Margin %\",
          \"type\": \"number\",
          \"required\": true,
          \"editable\": true,
          \"sortable\": true,
          \"width\": 100,
          \"format\": { \"kind\": \"percentage\", \"precision\": 1 }
        }
      ],
      \"rows\": {
        \"allowAdd\": true,
        \"allowDelete\": true,
        \"allowReorder\": true,
        \"showRowNumbers\": true
      },
      \"validationSchema\": {
        \"product\": { \"minLength\": 2, \"maxLength\": 50 },
        \"units\": { \"min\": 0 },
        \"revenue\": { \"min\": 0 },
        \"margin\": { \"min\": 0, \"max\": 100 }
      },
      \"behaviorSchema\": {
        \"sorting\": { \"enabled\": true, \"multiColumn\": true },
        \"filtering\": { \"enabled\": true },
        \"pagination\": { \"enabled\": true, \"pageSize\": 15 },
        \"editing\": { \"enabled\": true, \"mode\": \"cell\" }
      }
    }
  }")

TABLE_ID=$(echo "$TABLE_RESPONSE" | jq -r '.data.id')

# Add sample data
echo "Adding sample data to table..."
curl -s -X PUT "$API_BASE/api/sections/$TABLE_ID/data" \
  $HEADERS \
  -d '{
    "data": [
      { "product": "Laptop Pro", "category": "Electronics", "units": 150, "revenue": 149850, "margin": 15.5 },
      { "product": "Winter Jacket", "category": "Clothing", "units": 300, "revenue": 29970, "margin": 42.3 },
      { "product": "Programming Guide", "category": "Books", "units": 500, "revenue": 14950, "margin": 65.8 }
    ]
  }'

echo "Detailed table added with data!"
```

#### Step 5: Add Footer with Contact Information

```bash
#!/bin/bash
# tutorial-2-step-5.sh

API_BASE="http://localhost:3000"
HEADERS="-H 'Content-Type: application/json' -H 'Accept: application/json'"
DOCUMENT_ID=$(cat /tmp/advanced_document_id.txt)

echo "Adding advanced footer..."
curl -s -X POST "$API_BASE/api/sections" \
  $HEADERS \
  -d "{
    \"documentId\": \"$DOCUMENT_ID\",
    \"sectionType\": \"footer\",
    \"sectionOrder\": 4,
    \"contentSchema\": {
      \"schemaId\": \"contact-footer\",
      \"type\": \"footer\",
      \"content\": [
        {
          \"contentType\": \"text\",
          \"text\": \"Contact: info@acme.com | Phone: (555) 123-4567 | Web: www.acme.com\",
          \"formatting\": { \"fontSize\": 9, \"alignment\": \"center\", \"color\": \"#7f8c8d\" }
        },
        {
          \"contentType\": \"date\",
          \"format\": \"Generated on {0}\",
          \"formatting\": { \"fontSize\": 9, \"alignment\": \"center\", \"color\": \"#95a5a6\" }
        }
      ],
      \"layout\": {
        \"height\": 40,
        \"border\": { \"enabled\": true, \"color\": \"#bdc3c7\", \"width\": 1, \"position\": \"top\" }
      }
    }
  }"

echo "Advanced footer added!"
```

#### Step 6: Generate PDF Document

```bash
#!/bin/bash
# tutorial-2-step-6.sh

API_BASE="http://localhost:3000"
HEADERS="-H 'Content-Type: application/json' -H 'Accept: application/json'"
DOCUMENT_ID=$(cat /tmp/advanced_document_id.txt)

echo "Generating PDF document..."
RESPONSE=$(curl -s -X POST "$API_BASE/api/documents/$DOCUMENT_ID/generate" \
  $HEADERS \
  -d '{"format": "pdf"}')

FILENAME=$(echo "$RESPONSE" | jq -r '.data.filename')
echo "PDF generated: $FILENAME"

# Download the document
curl -s "$API_BASE/api/documents/$DOCUMENT_ID/download?format=pdf" \
  -o "$FILENAME"

echo "PDF downloaded as: $FILENAME"

# Clean up
rm /tmp/advanced_document_id.txt

echo "Advanced document workflow completed!"
```

## 🔧 Utility Examples

### Error Handling

```bash
#!/bin/bash
# robust-document-creation.sh

API_BASE="http://localhost:3000"
HEADERS="-H 'Content-Type: application/json' -H 'Accept: application/json'"

# Function to handle API responses
handle_response() {
  local response=$1
  local operation=$2
  
  if [ $? -ne 0 ]; then
    echo "Error: Failed to $operation"
    return 1
  fi
  
  local success=$(echo "$response" | jq -r '.success // false')
  
  if [ "$success" = "false" ]; then
    local error=$(echo "$response" | jq -r '.error // "Unknown error"')
    echo "Error: $operation failed - $error"
    return 1
  fi
  
  echo "Success: $operation completed"
  return 0
}

# Create document with error handling
echo "Creating document with error handling..."
RESPONSE=$(curl -s -X POST "$API_BASE/api/documents" \
  $HEADERS \
  -d '{
    "name": "Robust Document",
    "type": "word",
    "layoutSchema": { "schemaId": "test-layout", "tableName": "Test" }
  }')

if handle_response "$RESPONSE" "create document"; then
  DOCUMENT_ID=$(echo "$RESPONSE" | jq -r '.data.id')
  echo "Document ID: $DOCUMENT_ID"
else
  exit 1
fi
```

### Retry Logic

```bash
#!/bin/bash
# retry-logic.sh

API_BASE="http://localhost:3000"
HEADERS="-H 'Content-Type: application/json' -H 'Accept: application/json'"

# Function to retry API calls
retry_api_call() {
  local method=$1
  local url=$2
  local data=$3
  local max_retries=${4:-3}
  local retry_delay=${5:-1}
  
  for attempt in $(seq 1 $max_retries); do
    echo "Attempt $attempt of $max_retries..."
    
    case $method in
      "POST")
        RESPONSE=$(curl -s -X POST "$url" $HEADERS -d "$data")
        ;;
      "GET")
        RESPONSE=$(curl -s -X GET "$url" $HEADERS)
        ;;
      "PUT")
        RESPONSE=$(curl -s -X PUT "$url" $HEADERS -d "$data")
        ;;
      *)
        echo "Unsupported method: $method"
        return 1
        ;;
    esac
    
    if [ $? -eq 0 ]; then
      local success=$(echo "$RESPONSE" | jq -r '.success // false')
      if [ "$success" = "true" ]; then
        echo "API call successful on attempt $attempt"
        return 0
      fi
    fi
    
    if [ $attempt -lt $max_retries ]; then
      echo "Attempt $attempt failed, retrying in ${retry_delay}s..."
      sleep $retry_delay
      retry_delay=$((retry_delay * 2))
    fi
  done
  
  echo "All $max_retries attempts failed"
  return 1
}

# Usage example
echo "Creating document with retry logic..."
retry_api_call "POST" "$API_BASE/api/documents" '{
  "name": "Retry Document",
  "type": "word",
  "layoutSchema": { "schemaId": "retry-layout", "tableName": "Retry Test" }
}'

if [ $? -eq 0 ]; then
  DOCUMENT_ID=$(echo "$RESPONSE" | jq -r '.data.id')
  echo "Document created with ID: $DOCUMENT_ID"
else
  echo "Failed to create document after retries"
fi
```

### Batch Processing

```bash
#!/bin/bash
# batch-processing.sh

API_BASE="http://localhost:3000"
HEADERS="-H 'Content-Type: application/json' -H 'Accept: application/json'"

# Function to create multiple documents
create_multiple_documents() {
  local documents=(
    '{"name": "Document 1", "type": "word", "layoutSchema": {"schemaId": "batch-layout-1", "tableName": "Batch 1"}}'
    '{"name": "Document 2", "type": "pdf", "layoutSchema": {"schemaId": "batch-layout-2", "tableName": "Batch 2"}}'
    '{"name": "Document 3", "type": "word", "layoutSchema": {"schemaId": "batch-layout-3", "tableName": "Batch 3"}}'
  )
  
  local batch_size=${1:-2}
  local total=${#documents[@]}
  
  echo "Creating $total documents in batches of $batch_size..."
  
  for ((i=0; i<total; i+=batch_size)); do
    local batch_end=$((i + batch_size))
    if [ $batch_end -gt $total ]; then
      batch_end=$total
    fi
    
    echo "Processing batch $((i/batch_size + 1)) (items $((i+1)) to $batch_end)..."
    
    for ((j=i; j<batch_end; j++)); do
      echo "Creating document $((j+1))..."
      
      RESPONSE=$(curl -s -X POST "$API_BASE/api/documents" \
        $HEADERS \
        -d "${documents[$j]}")
      
      if [ $? -eq 0 ]; then
        local success=$(echo "$RESPONSE" | jq -r '.success // false')
        if [ "$success" = "true" ]; then
          local doc_id=$(echo "$RESPONSE" | jq -r '.data.id')
          echo "  ✓ Document created: $doc_id"
        else
          local error=$(echo "$RESPONSE" | jq -r '.error // "Unknown error"')
          echo "  ✗ Failed: $error"
        fi
      else
        echo "  ✗ Failed: Network error"
      fi
    done
    
    echo "Batch $((i/batch_size + 1)) completed"
    sleep 1
  done
  
  echo "Batch processing completed!"
}

# Run batch processing
create_multiple_documents 2
```

### Search and Filter Examples

```bash
#!/bin/bash
# search-and-filter.sh

API_BASE="http://localhost:3000"
HEADERS="-H 'Content-Type: application/json' -H 'Accept: application/json'"

# Search documents by name
echo "Searching documents by name 'report'..."
curl -s -X GET "$API_BASE/api/documents/search?query=report&limit=10&offset=0" \
  $HEADERS | jq '.'

# Search documents by type
echo "Searching documents by type 'pdf'..."
curl -s -X GET "$API_BASE/api/documents/search?query=pdf&limit=5&offset=0" \
  $HEADERS | jq '.'

# List all documents with pagination
echo "Listing all documents (first 5)..."
curl -s -X GET "$API_BASE/api/documents?limit=5&offset=0" \
  $HEADERS | jq '.'

# Get document sections
DOCUMENT_ID="your-document-id-here"
echo "Getting sections for document: $DOCUMENT_ID"
curl -s -X GET "$API_BASE/api/documents/$DOCUMENT_ID/sections" \
  $HEADERS | jq '.'
```

### Bulk Operations

```bash
#!/bin/bash
# bulk-operations.sh

API_BASE="http://localhost:3000"
HEADERS="-H 'Content-Type: application/json' -H 'Accept: application/json'"
DOCUMENT_ID="your-document-id-here"

# Bulk create sections
echo "Bulk creating sections..."
curl -s -X POST "$API_BASE/api/documents/$DOCUMENT_ID/sections/bulk" \
  $HEADERS \
  -d '{
    "sections": [
      {
        "sectionType": "paragraph",
        "sectionOrder": 1,
        "contentSchema": {
          "schemaId": "intro-paragraph",
          "content": "Introduction paragraph created in bulk",
          "formatting": { "fontSize": 12, "alignment": "justify" }
        }
      },
      {
        "sectionType": "paragraph",
        "sectionOrder": 2,
        "contentSchema": {
          "schemaId": "conclusion-paragraph",
          "content": "Conclusion paragraph created in bulk",
          "formatting": { "fontSize": 12, "alignment": "justify" }
        }
      }
    ]
  }'

# Reorder sections
echo "Reordering sections..."
curl -s -X PUT "$API_BASE/api/documents/$DOCUMENT_ID/sections/reorder" \
  $HEADERS \
  -d '{
    "sectionOrders": [
      {"id": "section-id-1", "order": 1},
      {"id": "section-id-2", "order": 2},
      {"id": "section-id-3", "order": 3}
    ]
  }'

# Duplicate document
echo "Duplicating document..."
curl -s -X POST "$API_BASE/api/documents/$DOCUMENT_ID/duplicate" \
  $HEADERS \
  -d '{"newName": "Copy of Document"}'
```

## 🧪 Testing Examples

### Health Check

```bash
#!/bin/bash
# health-check.sh

API_BASE="http://localhost:3000"

echo "Checking API health..."
curl -s -X GET "$API_BASE/api/health" | jq '.'

# Check storage stats
echo "Checking storage statistics..."
curl -s -X GET "$API_BASE/api/storage/stats" | jq '.'

# List generated documents
echo "Listing generated documents..."
curl -s -X GET "$API_BASE/api/generated-documents" | jq '.'
```

### Validation Testing

```bash
#!/bin/bash
# validation-testing.sh

API_BASE="http://localhost:3000"
HEADERS="-H 'Content-Type: application/json' -H 'Accept: application/json''

# Test valid schema validation
echo "Testing valid schema validation..."
curl -s -X POST "$API_BASE/api/validation/validate" \
  $HEADERS \
  -d '{
    "schema": {
      "schemaId": "test-schema",
      "type": "object",
      "properties": {
        "name": { "type": "string" }
      }
    },
    "data": {
      "name": "Test"
    }
  }'

# Test invalid schema validation
echo "Testing invalid schema validation..."
curl -s -X POST "$API_BASE/api/validation/validate" \
  $HEADERS \
  -d '{
    "schema": {
      "schemaId": "test-schema",
      "type": "object",
      "properties": {
        "name": { "type": "string" }
      },
      "required": ["name"]
    },
    "data": {
      "invalidField": "test"
    }
  }'
```

### Performance Testing

```bash
#!/bin/bash
# performance-testing.sh

API_BASE="http://localhost:3000"
HEADERS="-H 'Content-Type: application/json' -H 'Accept: application/json'"

# Test document creation performance
echo "Testing document creation performance..."
START_TIME=$(date +%s%N)

for i in {1..10}; do
  curl -s -X POST "$API_BASE/api/documents" \
    $HEADERS \
    -d "{
      \"name\": \"Performance Test $i\",
      \"type\": \"word\",
      \"layoutSchema\": { \"schemaId\": \"perf-test\", \"tableName\": \"Test $i\" }
    }" > /dev/null
done

END_TIME=$(date +%s%N)
DURATION=$(( (END_TIME - START_TIME) / 1000000 ))
AVG_TIME=$(( DURATION / 10 ))

echo "Created 10 documents in ${DURATION}ms (avg: ${AVG_TIME}ms per document)"
```

## 📚 Best Practices

### 1. Environment Setup

```bash
#!/bin/bash
# environment-setup.sh

# Load environment variables
if [ -f .env ]; then
  export $(cat .env | grep -v '^#' | xargs)
fi

# Set defaults
API_BASE=${API_BASE:-"http://localhost:3000"}
API_KEY=${API_KEY:-""}

# Build headers
HEADERS="-H 'Content-Type: application/json' -H 'Accept: application/json'"
if [ ! -z "$API_KEY" ]; then
  HEADERS="$HEADERS -H 'X-API-Key: $API_KEY'"
fi

echo "Environment configured:"
echo "API_BASE: $API_BASE"
echo "API_KEY: ${API_KEY:+[SET]}"
```

### 2. Error Handling Wrapper

```bash
#!/bin/bash
# error-handler.sh

# Function to handle API errors
api_call() {
  local method=$1
  local endpoint=$2
  local data=$3
  local description=$4
  
  echo "API Call: $description"
  
  case $method in
    "POST")
      RESPONSE=$(curl -s -w "%{http_code}" -X POST "$API_BASE$endpoint" \
        $HEADERS -d "$data")
      ;;
    "GET")
      RESPONSE=$(curl -s -w "%{http_code}" -X GET "$API_BASE$endpoint" \
        $HEADERS)
      ;;
    "PUT")
      RESPONSE=$(curl -s -w "%{http_code}" -X PUT "$API_BASE$endpoint" \
        $HEADERS -d "$data")
      ;;
    "DELETE")
      RESPONSE=$(curl -s -w "%{http_code}" -X DELETE "$API_BASE$endpoint" \
        $HEADERS)
      ;;
    *)
      echo "Unsupported method: $method"
      return 1
      ;;
  esac
  
  local http_code=$(echo "$RESPONSE" | tail -c 3)
  local body=$(echo "$RESPONSE" | head -c -3)
  
  if [ "$http_code" -eq "200" ] || [ "$http_code" -eq "201" ]; then
    echo "✓ $description - Success"
    echo "$body" | jq .
    return 0
  else
    echo "✗ $description - Failed (HTTP $http_code)"
    echo "$body" | jq -r '.error // "Unknown error"' 2>/dev/null || echo "Unknown error"
    return 1
  fi
}
```

### 3. Logging

```bash
#!/bin/bash
# logging.sh

LOG_FILE="api-operations.log"

# Function to log operations
log_operation() {
  local operation=$1
  local status=$2
  local details=$3
  local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
  
  echo "[$timestamp] $operation: $status - $details" >> "$LOG_FILE"
}

# Usage example
log_operation "create_document" "success" "Document ID: abc-123"
log_operation "generate_document" "failed" "Document not found"
```

These cURL examples provide comprehensive coverage of all the Document Management SDK functionality using pure HTTP requests. For more information, see the [API Documentation](./API.md) and [Schema Documentation](./Schemas.md).
