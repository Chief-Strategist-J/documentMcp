# 📚 Examples and Tutorials

## Overview

This guide provides practical examples and step-by-step tutorials for using the Document Management SDK. Each example demonstrates real-world use cases and best practices for document creation, manipulation, and generation.

## 🚀 Quick Start Examples

### Basic Document Creation

```typescript
import { DocumentClient } from '../src/sdk/DocumentClient';

// Initialize the client
const client = new DocumentClient('http://localhost:3000');

async function createSimpleDocument() {
  try {
    // Create a basic document
    const document = await client.createDocument({
      name: 'My First Document',
      type: 'word',
      layoutSchema: {
        schemaId: 'basic-layout',
        tableName: 'Main Content',
        dimensions: {
          minRows: 1,
          maxRows: 50,
          defaultRows: 5,
          columnCount: 3
        },
        pageSetup: {
          pageSize: 'A4',
          orientation: 'portrait',
          margins: { top: 72, right: 72, bottom: 72, left: 72 }
        }
      }
    });

    console.log('Document created:', document.data);
    return document.data;
  } catch (error) {
    console.error('Failed to create document:', error);
  }
}
```

### Adding Sections to Document

```typescript
async function addSectionsToDocument(documentId: string) {
  try {
    // Add a header section
    const header = await client.createSection({
      documentId,
      sectionType: 'header',
      sectionOrder: 1,
      contentSchema: {
        schemaId: 'company-header',
        type: 'header',
        content: [{
          contentType: 'text',
          text: 'ACME Corporation',
          formatting: {
            bold: true,
            fontSize: 16,
            alignment: 'center',
            color: '#2c3e50'
          }
        }]
      }
    });

    // Add a table section
    const table = await client.createSection({
      documentId,
      sectionType: 'table',
      sectionOrder: 2,
      contentSchema: {
        schemaId: 'sales-table',
        columns: [
          {
            id: 'product',
            name: 'Product',
            type: 'string',
            required: true,
            editable: true,
            sortable: true,
            width: 150
          },
          {
            id: 'quantity',
            name: 'Quantity',
            type: 'number',
            required: true,
            editable: true,
            sortable: true,
            width: 100,
            format: { kind: 'text', precision: 0 }
          },
          {
            id: 'price',
            name: 'Price',
            type: 'number',
            required: true,
            editable: true,
            sortable: true,
            width: 100,
            format: { kind: 'currency', currencyCode: 'USD', precision: 2 }
          }
        ],
        rows: {
          allowAdd: true,
          allowDelete: true,
          showRowNumbers: true
        }
      }
    });

    // Add a footer section
    const footer = await client.createSection({
      documentId,
      sectionType: 'footer',
      sectionOrder: 3,
      contentSchema: {
        schemaId: 'page-footer',
        type: 'footer',
        content: [{
          contentType: 'pageNumber',
          format: 'Page {0}',
          formatting: {
            fontSize: 10,
            alignment: 'center'
          }
        }]
      }
    });

    return { header, table, footer };
  } catch (error) {
    console.error('Failed to add sections:', error);
  }
}
```

## 📊 Real-World Examples

### Example 1: Sales Report Generator

```typescript
// examples/sales-report-generator.ts
import { DocumentClient } from '../src/sdk/DocumentClient';

class SalesReportGenerator {
  private client: DocumentClient;

  constructor(apiUrl: string, apiKey?: string) {
    this.client = new DocumentClient(apiUrl, apiKey);
  }

  async generateMonthlyReport(month: string, year: number, salesData: any[]) {
    try {
      // Create document
      const document = await this.client.createDocument({
        name: `Sales Report - ${month} ${year}`,
        type: 'pdf',
        layoutSchema: {
          schemaId: 'sales-report-layout',
          tableName: 'Monthly Sales Data',
          dimensions: { minRows: 1, maxRows: 100, defaultRows: salesData.length, columnCount: 6 },
          pageSetup: {
            pageSize: 'A4',
            orientation: 'landscape',
            margins: { top: 50, right: 50, bottom: 50, left: 50 }
          }
        }
      });

      // Add title header
      await this.client.createSection({
        documentId: document.data.id,
        sectionType: 'header',
        sectionOrder: 1,
        contentSchema: {
          schemaId: 'report-header',
          type: 'header',
          content: [
            {
              contentType: 'text',
              text: `Monthly Sales Report`,
              formatting: { bold: true, fontSize: 20, alignment: 'center' }
            },
            {
              contentType: 'text',
              text: `${month} ${year}`,
              formatting: { fontSize: 14, alignment: 'center' }
            }
          ]
        }
      });

      // Add sales chart
      await this.client.createSection({
        documentId: document.data.id,
        sectionType: 'chart',
        sectionOrder: 2,
        contentSchema: {
          schemaId: 'sales-chart',
          chartType: 'bar',
          title: 'Sales by Product',
          data: {
            datasets: [{
              label: 'Sales ($)',
              data: salesData.map(item => item.total),
              backgroundColor: '#3498db',
              borderColor: '#2980b9'
            }],
            labels: salesData.map(item => item.product)
          },
          position: { x: 100, y: 150, width: 600, height: 300 }
        }
      });

      // Add detailed table
      await this.client.createSection({
        documentId: document.data.id,
        sectionType: 'table',
        sectionOrder: 3,
        contentSchema: {
          schemaId: 'sales-detail-table',
          columns: [
            { id: 'product', name: 'Product', type: 'string', width: 200 },
            { id: 'quantity', name: 'Quantity', type: 'number', width: 100 },
            { id: 'unitPrice', name: 'Unit Price', type: 'number', width: 100 },
            { id: 'total', name: 'Total', type: 'number', width: 100 },
            { id: 'region', name: 'Region', type: 'string', width: 100 }
          ],
          rows: { allowAdd: false, allowDelete: false, showRowNumbers: true }
        }
      });

      // Add table data
      const tableSection = await this.client.getDocumentSections(document.data.id);
      const tableId = tableSection.data.find(s => s.sectionType === 'table')?.id;
      
      if (tableId) {
        await this.client.updateSectionData(tableId, {
          data: salesData.map(item => ({
            product: item.product,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.total,
            region: item.region
          }))
        });
      }

      // Generate PDF
      const generated = await this.client.generateDocument(document.data.id, 'pdf');
      
      return {
        documentId: document.data.id,
        downloadUrl: generated.data.path,
        filename: generated.data.filename
      };
    } catch (error) {
      console.error('Failed to generate sales report:', error);
      throw error;
    }
  }
}

// Usage example
const generator = new SalesReportGenerator('http://localhost:3000');

const salesData = [
  { product: 'Laptop', quantity: 45, unitPrice: 999.99, total: 44999.55, region: 'North' },
  { product: 'Mouse', quantity: 120, unitPrice: 29.99, total: 3598.80, region: 'South' },
  { product: 'Keyboard', quantity: 75, unitPrice: 79.99, total: 5999.25, region: 'East' }
];

generator.generateMonthlyReport('January', 2024, salesData)
  .then(result => console.log('Report generated:', result))
  .catch(error => console.error('Error:', error));
```

### Example 2: Invoice Generator

```typescript
// examples/invoice-generator.ts
import { DocumentClient } from '../src/sdk/DocumentClient';

interface InvoiceData {
  invoiceNumber: string;
  customerName: string;
  customerAddress: string;
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  subtotal: number;
  tax: number;
  total: number;
  dueDate: string;
}

class InvoiceGenerator {
  private client: DocumentClient;

  constructor(apiUrl: string, apiKey?: string) {
    this.client = new DocumentClient(apiUrl, apiKey);
  }

  async generateInvoice(invoiceData: InvoiceData) {
    try {
      // Create invoice document
      const document = await this.client.createDocument({
        name: `Invoice-${invoiceData.invoiceNumber}`,
        type: 'word',
        layoutSchema: {
          schemaId: 'invoice-layout',
          tableName: 'Invoice Details',
          dimensions: { minRows: 1, maxRows: 50, defaultRows: invoiceData.items.length, columnCount: 4 },
          pageSetup: { pageSize: 'A4', orientation: 'portrait', margins: { top: 72, right: 72, bottom: 72, left: 72 } }
        }
      });

      // Add company header
      await this.client.createSection({
        documentId: document.data.id,
        sectionType: 'header',
        sectionOrder: 1,
        contentSchema: {
          schemaId: 'invoice-header',
          type: 'header',
          content: [
            {
              contentType: 'text',
              text: 'INVOICE',
              formatting: { bold: true, fontSize: 24, alignment: 'right' }
            },
            {
              contentType: 'text',
              text: `Invoice #: ${invoiceData.invoiceNumber}`,
              formatting: { fontSize: 12, alignment: 'right' }
            },
            {
              contentType: 'text',
              text: `Date: ${new Date().toLocaleDateString()}`,
              formatting: { fontSize: 12, alignment: 'right' }
            },
            {
              contentType: 'text',
              text: `Due Date: ${invoiceData.dueDate}`,
              formatting: { fontSize: 12, alignment: 'right' }
            }
          ]
        }
      });

      // Add customer information
      await this.client.createSection({
        documentId: document.data.id,
        sectionType: 'paragraph',
        sectionOrder: 2,
        contentSchema: {
          schemaId: 'customer-info',
          content: `Bill To:\n${invoiceData.customerName}\n${invoiceData.customerAddress}`,
          formatting: { fontSize: 12, lineSpacing: 1.5 }
        }
      });

      // Add items table
      const tableSection = await this.client.createSection({
        documentId: document.data.id,
        sectionType: 'table',
        sectionOrder: 3,
        contentSchema: {
          schemaId: 'invoice-items',
          columns: [
            { id: 'description', name: 'Description', type: 'string', width: 300 },
            { id: 'quantity', name: 'Qty', type: 'number', width: 80 },
            { id: 'unitPrice', name: 'Unit Price', type: 'number', width: 100 },
            { id: 'total', name: 'Total', type: 'number', width: 100 }
          ],
          rows: { allowAdd: false, allowDelete: false }
        }
      });

      // Add items data
      await this.client.updateSectionData(tableSection.data.id, {
        data: invoiceData.items
      });

      // Add totals section
      await this.client.createSection({
        documentId: document.data.id,
        sectionType: 'paragraph',
        sectionOrder: 4,
        contentSchema: {
          schemaId: 'invoice-totals',
          content: `Subtotal: $${invoiceData.subtotal.toFixed(2)}\nTax: $${invoiceData.tax.toFixed(2)}\nTotal: $${invoiceData.total.toFixed(2)}`,
          formatting: { 
            fontSize: 12, 
            alignment: 'right',
            bold: true,
            paragraphSpacing: 6
          }
        }
      });

      // Generate Word document
      const generated = await this.client.generateDocument(document.data.id, 'word');
      
      return {
        documentId: document.data.id,
        filename: generated.data.filename,
        downloadUrl: generated.data.path
      };
    } catch (error) {
      console.error('Failed to generate invoice:', error);
      throw error;
    }
  }
}

// Usage example
const invoiceGenerator = new InvoiceGenerator('http://localhost:3000');

const invoiceData: InvoiceData = {
  invoiceNumber: 'INV-2024-001',
  customerName: 'John Doe Company',
  customerAddress: '123 Business St.\nSuite 100\nBusiness City, BC 12345',
  items: [
    { description: 'Web Development Services', quantity: 40, unitPrice: 150, total: 6000 },
    { description: 'Website Hosting (1 year)', quantity: 1, unitPrice: 500, total: 500 },
    { description: 'Domain Registration', quantity: 1, unitPrice: 25, total: 25 }
  ],
  subtotal: 6525,
  tax: 652.50,
  total: 7177.50,
  dueDate: '2024-02-15'
};

invoiceGenerator.generateInvoice(invoiceData)
  .then(result => console.log('Invoice generated:', result))
  .catch(error => console.error('Error:', error));
```

### Example 3: Dashboard Report Generator

```typescript
// examples/dashboard-generator.ts
import { DocumentClient } from '../src/sdk/DocumentClient';

interface DashboardData {
  title: string;
  period: string;
  metrics: {
    totalRevenue: number;
    totalUsers: number;
    conversionRate: number;
    avgOrderValue: number;
  };
  chartData: {
    revenue: number[];
    users: number[];
    labels: string[];
  };
}

class DashboardReportGenerator {
  private client: DocumentClient;

  constructor(apiUrl: string, apiKey?: string) {
    this.client = new DocumentClient(apiUrl, apiKey);
  }

  async generateDashboardReport(data: DashboardData) {
    try {
      // Create dashboard document
      const document = await this.client.createDocument({
        name: `${data.title} - ${data.period}`,
        type: 'pdf',
        layoutSchema: {
          schemaId: 'dashboard-layout',
          tableName: 'Dashboard Metrics',
          dimensions: { minRows: 1, maxRows: 100, defaultRows: 20, columnCount: 2 },
          pageSetup: { pageSize: 'A4', orientation: 'portrait', margins: { top: 50, right: 50, bottom: 50, left: 50 } }
        }
      });

      // Add title header
      await this.client.createSection({
        documentId: document.data.id,
        sectionType: 'header',
        sectionOrder: 1,
        contentSchema: {
          schemaId: 'dashboard-header',
          type: 'header',
          content: [
            {
              contentType: 'text',
              text: data.title,
              formatting: { bold: true, fontSize: 18, alignment: 'center' }
            },
            {
              contentType: 'text',
              text: `Period: ${data.period}`,
              formatting: { fontSize: 14, alignment: 'center' }
            }
          ]
        }
      });

      // Add metrics summary
      await this.client.createSection({
        documentId: document.data.id,
        sectionType: 'paragraph',
        sectionOrder: 2,
        contentSchema: {
          schemaId: 'metrics-summary',
          content: `Key Metrics:\n• Total Revenue: $${data.metrics.totalRevenue.toLocaleString()}\n• Total Users: ${data.metrics.totalUsers.toLocaleString()}\n• Conversion Rate: ${(data.metrics.conversionRate * 100).toFixed(2)}%\n• Avg Order Value: $${data.metrics.avgOrderValue.toFixed(2)}`,
          formatting: { fontSize: 12, bold: true }
        }
      });

      // Add revenue chart
      await this.client.createSection({
        documentId: document.data.id,
        sectionType: 'chart',
        sectionOrder: 3,
        contentSchema: {
          schemaId: 'revenue-chart',
          chartType: 'line',
          title: 'Revenue Trend',
          data: {
            datasets: [{
              label: 'Revenue ($)',
              data: data.chartData.revenue,
              backgroundColor: 'rgba(52, 152, 219, 0.2)',
              borderColor: 'rgb(52, 152, 219)',
              tension: 0.1
            }],
            labels: data.chartData.labels
          },
          position: { x: 50, y: 200, width: 500, height: 250 }
        }
      });

      // Add user growth chart
      await this.client.createSection({
        documentId: document.data.id,
        sectionType: 'chart',
        sectionOrder: 4,
        contentSchema: {
          schemaId: 'users-chart',
          chartType: 'bar',
          title: 'User Growth',
          data: {
            datasets: [{
              label: 'Users',
              data: data.chartData.users,
              backgroundColor: 'rgba(46, 204, 113, 0.8)'
            }],
            labels: data.chartData.labels
          },
          position: { x: 50, y: 500, width: 500, height: 250 }
        }
      });

      // Generate PDF
      const generated = await this.client.generateDocument(document.data.id, 'pdf');
      
      return {
        documentId: document.data.id,
        filename: generated.data.filename,
        downloadUrl: generated.data.path
      };
    } catch (error) {
      console.error('Failed to generate dashboard report:', error);
      throw error;
    }
  }
}

// Usage example
const dashboardGenerator = new DashboardReportGenerator('http://localhost:3000');

const dashboardData: DashboardData = {
  title: 'Monthly Dashboard Report',
  period: 'January 2024',
  metrics: {
    totalRevenue: 125000,
    totalUsers: 2500,
    conversionRate: 0.032,
    avgOrderValue: 50
  },
  chartData: {
    revenue: [10000, 12000, 11000, 13000, 15000, 14000, 16000, 18000, 17000, 19000, 21000, 20000],
    users: [200, 220, 215, 235, 250, 245, 265, 280, 275, 295, 310, 300],
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7', 'Week 8', 'Week 9', 'Week 10', 'Week 11', 'Week 12']
  }
};

dashboardGenerator.generateDashboardReport(dashboardData)
  .then(result => console.log('Dashboard report generated:', result))
  .catch(error => console.error('Error:', error));
```

## 🎓 Step-by-Step Tutorials

### Tutorial 1: Creating Your First Document

#### Step 1: Set Up the Client

```typescript
import { DocumentClient } from '../src/sdk/DocumentClient';

// Initialize with API URL
const client = new DocumentClient('http://localhost:3000');

// Optional: Add API key for authentication
const secureClient = new DocumentClient('http://localhost:3000', 'your-api-key');
```

#### Step 2: Create a Document

```typescript
async function createFirstDocument() {
  const document = await client.createDocument({
    name: 'My First Document',
    type: 'word',
    layoutSchema: {
      schemaId: 'simple-layout',
      tableName: 'Content',
      dimensions: {
        minRows: 1,
        maxRows: 10,
        defaultRows: 3,
        columnCount: 2
      },
      pageSetup: {
        pageSize: 'A4',
        orientation: 'portrait',
        margins: { top: 72, right: 72, bottom: 72, left: 72 }
      }
    }
  });

  console.log('Document created with ID:', document.data.id);
  return document.data.id;
}
```

#### Step 3: Add Content

```typescript
async function addContent(documentId: string) {
  // Add a title paragraph
  const titleSection = await client.createSection({
    documentId,
    sectionType: 'paragraph',
    sectionOrder: 1,
    contentSchema: {
      schemaId: 'title-paragraph',
      content: 'My Document Title',
      formatting: {
        bold: true,
        fontSize: 18,
        alignment: 'center',
        color: '#2c3e50'
      }
    }
  });

  // Add a simple table
  const tableSection = await client.createSection({
    documentId,
    sectionType: 'table',
    sectionOrder: 2,
    contentSchema: {
      schemaId: 'simple-table',
      columns: [
        { id: 'name', name: 'Name', type: 'string', width: 150 },
        { id: 'value', name: 'Value', type: 'number', width: 100 }
      ],
      rows: { allowAdd: true, allowDelete: true }
    }
  });

  // Add data to the table
  await client.updateSectionData(tableSection.data.id, {
    data: [
      { name: 'Item 1', value: 100 },
      { name: 'Item 2', value: 200 },
      { name: 'Item 3', value: 300 }
    ]
  });

  return { titleSection, tableSection };
}
```

#### Step 4: Generate the Document

```typescript
async function generateDocument(documentId: string) {
  const generated = await client.generateDocument(documentId, 'word');
  
  console.log('Document generated:', generated.data.filename);
  
  // Download the document (in a browser environment)
  window.open(`http://localhost:3000/api/documents/${documentId}/download?format=word`);
  
  return generated.data;
}
```

#### Step 5: Put It All Together

```typescript
async function completeWorkflow() {
  try {
    // Step 1: Create document
    const documentId = await createFirstDocument();
    
    // Step 2: Add content
    await addContent(documentId);
    
    // Step 3: Generate document
    const result = await generateDocument(documentId);
    
    console.log('Workflow completed successfully!');
    return result;
  } catch (error) {
    console.error('Workflow failed:', error);
  }
}

// Run the complete workflow
completeWorkflow();
```

### Tutorial 2: Advanced Document with Multiple Sections

#### Step 1: Create Document with Custom Layout

```typescript
async function createAdvancedDocument() {
  const document = await client.createDocument({
    name: 'Advanced Report',
    type: 'pdf',
    layoutSchema: {
      schemaId: 'advanced-layout',
      tableName: 'Report Data',
      dimensions: { minRows: 1, maxRows: 100, defaultRows: 20, columnCount: 5 },
      pageSetup: {
        pageSize: 'A4',
        orientation: 'landscape',
        margins: { top: 50, right: 50, bottom: 50, left: 50 }
      },
      sections: [
        { sectionType: 'header', order: 0, repeatOnPages: true },
        { sectionType: 'chart', order: 1, repeatOnPages: false },
        { sectionType: 'table', order: 2, repeatOnPages: false },
        { sectionType: 'footer', order: 3, repeatOnPages: true }
      ]
    }
  });

  return document.data.id;
}
```

#### Step 2: Add Header with Logo and Company Info

```typescript
async function addAdvancedHeader(documentId: string) {
  const header = await client.createSection({
    documentId,
    sectionType: 'header',
    sectionOrder: 1,
    contentSchema: {
      schemaId: 'company-header',
      type: 'header',
      content: [
        {
          contentType: 'image',
          imagePath: '/path/to/logo.png',
          position: { x: 50, y: 10, width: 100, height: 50 }
        },
        {
          contentType: 'text',
          text: 'ACME Corporation',
          position: { x: 200, y: 20, width: 300, height: 30 },
          formatting: { bold: true, fontSize: 16, color: '#2c3e50' }
        },
        {
          contentType: 'text',
          text: '123 Business Street, Suite 100, Business City, BC 12345',
          position: { x: 200, y: 45, width: 400, height: 20 },
          formatting: { fontSize: 10, color: '#7f8c8d' }
        },
        {
          contentType: 'pageNumber',
          format: 'Page {0}',
          position: { x: 700, y: 30, width: 100, height: 20 },
          formatting: { fontSize: 10, alignment: 'right' }
        }
      ],
      layout: {
        height: 60,
        border: { enabled: true, color: '#bdc3c7', width: 1, position: 'bottom' }
      }
    }
  });

  return header;
}
```

#### Step 3: Add Interactive Chart

```typescript
async function addInteractiveChart(documentId: string) {
  const chart = await client.createSection({
    documentId,
    sectionType: 'chart',
    sectionOrder: 2,
    contentSchema: {
      schemaId: 'interactive-chart',
      chartType: 'bar',
      title: 'Quarterly Performance',
      subtitle: 'Revenue and Profit Comparison',
      data: {
        datasets: [
          {
            label: 'Revenue ($M)',
            data: [12, 19, 15, 25],
            backgroundColor: '#3498db',
            borderColor: '#2980b9',
            borderWidth: 2
          },
          {
            label: 'Profit ($M)',
            data: [3, 5, 2, 8],
            backgroundColor: '#2ecc71',
            borderColor: '#27ae60',
            borderWidth: 2
          }
        ],
        labels: ['Q1', 'Q2', 'Q3', 'Q4']
      },
      position: { x: 100, y: 100, width: 600, height: 300 },
      axes: {
        xAxis: { enabled: true, title: 'Quarter', gridLines: true },
        yAxis: { enabled: true, title: 'Amount ($M)', gridLines: true }
      },
      legend: { enabled: true, position: 'top' },
      interactivity: { hover: true, click: true, tooltip: true }
    }
  });

  return chart;
}
```

#### Step 4: Add Detailed Data Table

```typescript
async function addDetailedTable(documentId: string) {
  const table = await client.createSection({
    documentId,
    sectionType: 'table',
    sectionOrder: 3,
    contentSchema: {
      schemaId: 'detailed-table',
      columns: [
        {
          id: 'product',
          name: 'Product',
          type: 'string',
          required: true,
          editable: true,
          sortable: true,
          filterable: true,
          width: 200
        },
        {
          id: 'category',
          name: 'Category',
          type: 'enum',
          required: true,
          editable: true,
          sortable: true,
          filterable: true,
          width: 120,
          options: ['Electronics', 'Clothing', 'Books', 'Home', 'Sports']
        },
        {
          id: 'units',
          name: 'Units Sold',
          type: 'number',
          required: true,
          editable: true,
          sortable: true,
          width: 100,
          format: { kind: 'text', precision: 0 }
        },
        {
          id: 'revenue',
          name: 'Revenue',
          type: 'number',
          required: true,
          editable: true,
          sortable: true,
          width: 120,
          format: { kind: 'currency', currencyCode: 'USD', precision: 2 }
        },
        {
          id: 'margin',
          name: 'Margin %',
          type: 'number',
          required: true,
          editable: true,
          sortable: true,
          width: 100,
          format: { kind: 'percentage', precision: 1 }
        }
      ],
      rows: {
        allowAdd: true,
        allowDelete: true,
        allowReorder: true,
        showRowNumbers: true
      },
      validationSchema: {
        product: { minLength: 2, maxLength: 50 },
        units: { min: 0 },
        revenue: { min: 0 },
        margin: { min: 0, max: 100 }
      },
      behaviorSchema: {
        sorting: { enabled: true, multiColumn: true },
        filtering: { enabled: true },
        pagination: { enabled: true, pageSize: 15 },
        editing: { enabled: true, mode: 'cell' }
      }
    }
  });

  // Add sample data
  await client.updateSectionData(table.data.id, {
    data: [
      { product: 'Laptop Pro', category: 'Electronics', units: 150, revenue: 149850, margin: 15.5 },
      { product: 'Winter Jacket', category: 'Clothing', units: 300, revenue: 29970, margin: 42.3 },
      { product: 'Programming Guide', category: 'Books', units: 500, revenue: 14950, margin: 65.8 }
    ]
  });

  return table;
}
```

#### Step 5: Add Footer with Contact Information

```typescript
async function addAdvancedFooter(documentId: string) {
  const footer = await client.createSection({
    documentId,
    sectionType: 'footer',
    sectionOrder: 4,
    contentSchema: {
      schemaId: 'contact-footer',
      type: 'footer',
      content: [
        {
          contentType: 'text',
          text: 'Contact: info@acme.com | Phone: (555) 123-4567 | Web: www.acme.com',
          formatting: { fontSize: 9, alignment: 'center', color: '#7f8c8d' }
        },
        {
          contentType: 'date',
          format: 'Generated on {0}',
          formatting: { fontSize: 9, alignment: 'center', color: '#95a5a6' }
        }
      ],
      layout: {
        height: 40,
        border: { enabled: true, color: '#bdc3c7', width: 1, position: 'top' }
      }
    }
  });

  return footer;
}
```

### Tutorial 3: Bulk Operations and Advanced Features

#### Step 1: Bulk Create Sections

```typescript
async function bulkCreateSections(documentId: string) {
  const sections = [
    {
      sectionType: 'paragraph' as const,
      sectionOrder: 1,
      contentSchema: {
        schemaId: 'intro-paragraph',
        content: 'This is an introduction paragraph created in bulk.',
        formatting: { fontSize: 12, alignment: 'justify' }
      }
    },
    {
      sectionType: 'image' as const,
      sectionOrder: 2,
      contentSchema: {
        schemaId: 'intro-image',
        imagePath: '/path/to/image.jpg',
        altText: 'Introduction Image',
        position: { x: 200, y: 100, width: 400, height: 200 }
      }
    },
    {
      sectionType: 'paragraph' as const,
      sectionOrder: 3,
      contentSchema: {
        schemaId: 'conclusion-paragraph',
        content: 'This is a conclusion paragraph created in bulk.',
        formatting: { fontSize: 12, alignment: 'justify' }
      }
    }
  ];

  const result = await client.bulkCreateSections(documentId, { sections });
  console.log('Bulk created sections:', result.data);
  return result.data;
}
```

#### Step 2: Duplicate Document

```typescript
async function duplicateExistingDocument(documentId: string) {
  const duplicated = await client.duplicateDocument(documentId, 'Copy of Document');
  console.log('Document duplicated:', duplicated.data);
  return duplicated.data;
}
```

#### Step 3: Search Documents

```typescript
async function searchDocuments() {
  // Search by name
  const searchResults = await client.searchDocuments('report', 10, 0);
  console.log('Search results:', searchResults.data);

  // Search with pagination
  const paginatedResults = await client.searchDocuments('invoice', 5, 0);
  console.log('First page:', paginatedResults.data);

  return searchResults.data;
}
```

#### Step 4: Reorder Sections

```typescript
async function reorderSections(documentId: string) {
  const sections = await client.getDocumentSections(documentId);
  
  // Reorder sections (move paragraph to position 1)
  const sectionOrders = sections.data.map((section, index) => ({
    id: section.id,
    order: section.sectionType === 'paragraph' ? 1 : index + 2
  }));

  const result = await client.reorderSections(documentId, { sectionOrders });
  console.log('Sections reordered:', result);
  return result;
}
```

## 🔧 Utility Examples

### Error Handling

```typescript
async function robustDocumentCreation() {
  try {
    const document = await client.createDocument({
      name: 'Robust Document',
      type: 'word',
      layoutSchema: { /* ... */ }
    });

    return document;
  } catch (error) {
    if (error.response?.status === 400) {
      console.error('Validation error:', error.response.data.error);
    } else if (error.response?.status === 401) {
      console.error('Authentication error:', 'Invalid API key');
    } else if (error.response?.status === 500) {
      console.error('Server error:', 'Please try again later');
    } else {
      console.error('Unknown error:', error.message);
    }
    
    throw error;
  }
}
```

### Retry Logic

```typescript
async function createDocumentWithRetry(config: any, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await client.createDocument(config);
    } catch (error) {
      if (attempt === maxRetries) {
        throw error;
      }
      
      console.log(`Attempt ${attempt} failed, retrying in ${attempt * 1000}ms...`);
      await new Promise(resolve => setTimeout(resolve, attempt * 1000));
    }
  }
}
```

### Batch Processing

```typescript
async function processMultipleDocuments(documents: any[]) {
  const results = [];
  const batchSize = 5;

  for (let i = 0; i < documents.length; i += batchSize) {
    const batch = documents.slice(i, i + batchSize);
    
    try {
      const batchPromises = batch.map(doc => 
        client.createDocument(doc).catch(error => ({ error, doc }))
      );
      
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
      
      console.log(`Processed batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(documents.length / batchSize)}`);
    } catch (error) {
      console.error('Batch processing error:', error);
    }
  }

  return results;
}
```

## 🧪 Testing Examples

### Unit Test Example

```typescript
// tests/examples/DocumentGenerator.test.ts
import { DocumentClient } from '../../src/sdk/DocumentClient';

describe('DocumentGenerator Examples', () => {
  let client: DocumentClient;
  let mockServer: any;

  beforeEach(() => {
    mockServer = setupMockServer();
    client = new DocumentClient('http://localhost:3000');
  });

  it('should create a complete invoice', async () => {
    const generator = new InvoiceGenerator(client.baseUrl);
    
    const invoiceData = {
      invoiceNumber: 'TEST-001',
      customerName: 'Test Customer',
      customerAddress: '123 Test St',
      items: [
        { description: 'Test Item', quantity: 1, unitPrice: 100, total: 100 }
      ],
      subtotal: 100,
      tax: 10,
      total: 110,
      dueDate: '2024-12-31'
    };

    const result = await generator.generateInvoice(invoiceData);
    
    expect(result).toHaveProperty('documentId');
    expect(result).toHaveProperty('filename');
    expect(result.filename).toContain('INV-TEST-001');
  });
});
```

### Integration Test Example

```typescript
// tests/integration/DocumentWorkflow.test.ts
import request from 'supertest';
import { app } from '../../src/api/server';

describe('Document Workflow Integration', () => {
  it('should complete full document workflow', async () => {
    // Create document
    const createResponse = await request(app)
      .post('/api/documents')
      .send({
        name: 'Integration Test Document',
        type: 'word',
        layoutSchema: {
          schemaId: 'test-layout',
          tableName: 'Test Table',
          dimensions: { minRows: 1, maxRows: 10, defaultRows: 5, columnCount: 2 }
        }
      })
      .expect(201);

    const documentId = createResponse.body.data.id;

    // Add section
    await request(app)
      .post('/api/sections')
      .send({
        documentId,
        sectionType: 'paragraph',
        sectionOrder: 1,
        contentSchema: {
          schemaId: 'test-paragraph',
          content: 'Test paragraph content'
        }
      })
      .expect(201);

    // Generate document
    const generateResponse = await request(app)
      .post(`/api/documents/${documentId}/generate`)
      .send({ format: 'word' })
      .expect(200);

    expect(generateResponse.body.data).toHaveProperty('filename');
    expect(generateResponse.body.data.filename).toMatch(/\.docx$/);
  });
});
```

## 📚 Best Practices

### 1. Error Handling

```typescript
// Always handle errors gracefully
try {
  const result = await client.createDocument(config);
  return result;
} catch (error) {
  // Log error details
  console.error('Document creation failed:', {
    error: error.message,
    config,
    timestamp: new Date().toISOString()
  });
  
  // Return consistent error response
  return {
    success: false,
    error: error.message,
    timestamp: new Date().toISOString()
  };
}
```

### 2. Resource Management

```typescript
// Clean up resources properly
class DocumentManager {
  private client: DocumentClient;

  constructor(apiUrl: string) {
    this.client = new DocumentClient(apiUrl);
  }

  async generateReport(data: ReportData): Promise<GeneratedDocument> {
    let documentId: string | null = null;
    
    try {
      // Create document
      const document = await this.client.createDocument(data.documentConfig);
      documentId = document.data.id;

      // Add sections
      await this.addSections(documentId, data.sections);

      // Generate document
      const generated = await this.client.generateDocument(documentId, data.format);
      
      return generated.data;
    } catch (error) {
      // Clean up on error
      if (documentId) {
        await this.client.deleteDocument(documentId).catch(console.error);
      }
      throw error;
    }
  }
}
```

### 3. Configuration Management

```typescript
// Use environment-specific configurations
const config = {
  development: {
    apiUrl: 'http://localhost:3000',
    timeout: 30000,
    retries: 3
  },
  production: {
    apiUrl: 'https://api.yourdomain.com',
    timeout: 10000,
    retries: 5
  }
};

const environment = process.env.NODE_ENV || 'development';
const currentConfig = config[environment];

const client = new DocumentClient(currentConfig.apiUrl);
```

### 4. Performance Optimization

```typescript
// Use caching for frequently accessed data
class CachedDocumentClient extends DocumentClient {
  private cache = new Map<string, any>();
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes

  async getDocument(id: string) {
    const cacheKey = `document:${id}`;
    const cached = this.cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }

    const result = await super.getDocument(id);
    
    this.cache.set(cacheKey, {
      data: result,
      timestamp: Date.now()
    });

    return result;
  }
}
```

These examples and tutorials provide comprehensive guidance for using the Document Management SDK in various scenarios. For more information, see the [API Documentation](./API.md) and [Schema Documentation](./Schemas.md).
