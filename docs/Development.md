# 🛠️ Development Guide

## Overview

This guide covers setting up the development environment, understanding the codebase architecture, coding standards, testing procedures, and contribution guidelines for the Document Management SDK.

## 🚀 Quick Setup

### Prerequisites

- **Node.js**: v18.0.0 or higher
- **npm**: v8.0.0 or higher
- **PostgreSQL**: v15.0 or higher
- **Docker**: v20.0.0 or higher (optional)
- **Git**: v2.30.0 or higher

### Environment Setup

1. **Clone the repository**
```bash
git clone https://github.com/your-org/document-management-sdk.git
cd document-management-sdk
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Set up database**
```bash
# Using Docker (recommended)
docker-compose up -d postgres

# Or install PostgreSQL locally and create database
createdb document_management
psql -d document_management -f scripts/init-db.sql
```

5. **Build the project**
```bash
npm run build
```

6. **Run development server**
```bash
npm run dev
```

The API will be available at `http://localhost:3000`

## 🏗️ Architecture Overview

### Project Structure

```
document-management-sdk/
├── src/                          # Source code
│   ├── types/                    # TypeScript type definitions
│   │   └── index.ts             # Main type exports
│   ├── sdk/                      # Client SDK
│   │   └── DocumentClient.ts    # Main SDK client
│   ├── api/                      # REST API
│   │   ├── DocumentController.ts # Document operations
│   │   └── server.ts            # Express server setup
│   ├── database/                 # Database layer
│   │   ├── DatabaseManager.ts   # PostgreSQL manager
│   │   └── MockDatabaseManager.ts # Mock for testing
│   ├── generators/               # Document generation
│   │   └── APIDocumentGenerator.ts # API doc generator
│   └── validation/               # Schema validation
│       └── SchemaValidator.ts    # JSON schema validator
├── schemas/                      # JSON schemas
│   ├── document-layout.json       # Document layout schema
│   ├── sections/                 # Section type schemas
│   └── styling/                   # Styling schemas
├── tests/                        # Test files
│   ├── unit/                     # Unit tests
│   ├── integration/              # Integration tests
│   └── e2e/                      # End-to-end tests
├── docs/                         # Documentation
├── scripts/                      # Build and utility scripts
├── examples/                     # Usage examples
└── dist/                         # Compiled output
```

### Core Components

#### 1. Types Layer (`src/types/`)
Defines all TypeScript interfaces and types used throughout the application.

```typescript
// Document types
interface DocumentConfig {
  id: string;
  name: string;
  type: 'word' | 'pdf';
  layoutSchema: DocumentLayoutSchema;
  createdAt: string;
  updatedAt: string;
}

// Section types
interface Section {
  id: string;
  documentId: string;
  sectionType: SectionType;
  sectionOrder: number;
  contentSchema: SectionContentSchema;
  stylingSchema: SectionStylingSchema;
  createdAt: string;
}
```

#### 2. Database Layer (`src/database/`)
Handles all database operations with PostgreSQL and provides mock implementations for testing.

```typescript
interface IDatabaseManager {
  // Document operations
  createDocument(config: Omit<DocumentConfig, 'id' | 'createdAt' | 'updatedAt'>): Promise<DocumentConfig>;
  getDocument(id: string): Promise<DocumentConfig | null>;
  updateDocument(id: string, updates: Partial<DocumentConfig>): Promise<DocumentConfig>;
  deleteDocument(id: string): Promise<boolean>;
  
  // Section operations
  createSection(section: Omit<Section, 'id' | 'createdAt'>): Promise<Section>;
  getDocumentSections(documentId: string): Promise<Section[]>;
  // ... more methods
}
```

#### 3. API Layer (`src/api/`)
Express.js REST API with controllers and middleware.

```typescript
class DocumentController {
  constructor(
    private databaseManager: IDatabaseManager,
    private validator: SchemaValidator
  ) {}

  async createDocument(req: Request, res: Response): Promise<void> {
    // Request validation
    // Database operation
    // Response formatting
  }
}
```

#### 4. SDK Layer (`src/sdk/`)
Client library for consuming the API.

```typescript
class DocumentClient {
  constructor(
    private baseUrl: string,
    private apiKey?: string
  ) {}

  async createDocument(config: CreateDocumentRequest): Promise<ApiResponse<DocumentConfig>> {
    // HTTP request handling
    // Error handling
    // Response parsing
  }
}
```

#### 5. Validation Layer (`src/validation/`)
JSON schema validation utilities.

```typescript
class SchemaValidator {
  validate(schema: any, data: any): ValidationResult {
    // Schema validation logic
  }
}
```

## 📝 Coding Standards

### TypeScript Configuration

The project uses strict TypeScript configuration:

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "noImplicitReturns": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

### Code Style Guidelines

#### 1. Function Parameters
- Maximum 3 parameters per function
- Use objects for multiple parameters
- Follow DRY principle

```typescript
// ❌ Bad - Too many parameters
function createUser(name: string, email: string, age: number, address: string, phone: string) { }

// ✅ Good - Use parameter object
function createUser(config: {
  name: string;
  email: string;
  age: number;
  address: string;
  phone: string;
}) { }
```

#### 2. Naming Conventions
- **PascalCase** for classes, interfaces, types
- **camelCase** for variables, functions, methods
- **UPPER_SNAKE_CASE** for constants
- **kebab-case** for file names

```typescript
interface DocumentConfig { }
class DocumentManager { }
const API_BASE_URL = 'https://api.example.com';
function createDocument() { }
```

#### 3. Error Handling
- Use proper error types
- Include meaningful error messages
- Handle async errors properly

```typescript
// ✅ Good error handling
try {
  const result = await databaseManager.createDocument(config);
  return result;
} catch (error) {
  if (error instanceof DatabaseError) {
    throw new ApiError('Database operation failed', error.message);
  }
  throw error;
}
```

#### 4. Async/Await
- Prefer async/await over Promise chains
- Handle errors properly
- Use proper return types

```typescript
// ✅ Good async/await usage
async function createDocument(config: DocumentConfig): Promise<Document> {
  try {
    const document = await database.createDocument(config);
    const sections = await this.createDefaultSections(document.id);
    return { ...document, sections };
  } catch (error) {
    throw new Error(`Failed to create document: ${error.message}`);
  }
}
```

### Coupling Guidelines

Follow the coupling taxonomy principles:

1. **No Coupling**: Independent components
2. **Data Coupling**: Share primitive data only
3. **Stamp Coupling**: Share data structure
4. **Control Coupling**: Share control flags
5. **Common Coupling**: Share global data
6. **Content Coupling**: Share internal implementation (avoid)

```typescript
// ✅ Good - Data coupling
function calculateTotal(items: { price: number; quantity: number }[]): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

// ❌ Bad - Content coupling
function processData(data: any) {
  // Directly accessing internal properties
  data.internalMethod();
  return data.privateProperty;
}
```

## 🧪 Testing

### Test Structure

```
tests/
├── unit/                     # Unit tests
│   ├── DocumentController.test.ts
│   ├── DatabaseManager.test.ts
│   ├── SchemaValidator.test.ts
│   └── NewMethods.test.ts
├── integration/              # Integration tests
│   ├── DocumentAPI.test.ts
│   └── APITestWithoutDB.test.ts
└── e2e/                     # End-to-end tests
    └── DocumentWorkflow.test.ts
```

### Testing Framework

- **Jest**: Test runner and assertion library
- **Supertest**: HTTP assertion testing
- **Mock implementations**: For database and external services

### Writing Tests

#### 1. Unit Tests

```typescript
describe('DocumentManager', () => {
  let documentManager: DocumentManager;
  let mockDatabase: jest.Mocked<IDatabaseManager>;

  beforeEach(() => {
    mockDatabase = createMockDatabase();
    documentManager = new DocumentManager(mockDatabase);
  });

  it('should create document successfully', async () => {
    const config = {
      name: 'Test Document',
      type: 'word' as const,
      layoutSchema: testLayoutSchema
    };

    mockDatabase.createDocument.mockResolvedValue(testDocument);

    const result = await documentManager.createDocument(config);

    expect(result).toEqual(testDocument);
    expect(mockDatabase.createDocument).toHaveBeenCalledWith(config);
  });
});
```

#### 2. Integration Tests

```typescript
describe('Document API Integration', () => {
  let app: Express;
  let database: DatabaseManager;

  beforeAll(async () => {
    database = new DatabaseManager();
    await database.initialize();
    app = createApp(database);
  });

  it('should create document via API', async () => {
    const response = await request(app)
      .post('/api/documents')
      .send({
        name: 'Test Document',
        type: 'word',
        layoutSchema: testLayoutSchema
      })
      .expect(201);

    expect(response.body.success).toBe(true);
    expect(response.body.data.name).toBe('Test Document');
  });
});
```

#### 3. Mock Implementations

```typescript
class MockDatabaseManager implements IDatabaseManager {
  private documents = new Map<string, DocumentConfig>();
  private sections = new Map<string, Section>();

  async createDocument(config: Omit<DocumentConfig, 'id' | 'createdAt' | 'updatedAt'>): Promise<DocumentConfig> {
    const document = {
      id: uuidv4(),
      ...config,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.documents.set(document.id, document);
    return document;
  }

  // ... other methods
}
```

### Running Tests

```bash
# Run all tests
npm test

# Run unit tests only
npm run test:unit

# Run integration tests only
npm run test:integration

# Run e2e tests only
npm run test:e2e

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test -- DocumentController.test.ts

# Run tests in watch mode
npm test -- --watch
```

### Coverage Requirements

- **Minimum coverage**: 80%
- **Unit test coverage**: 90%
- **Integration test coverage**: 70%
- **Critical paths**: 100%

## 🔄 Development Workflow

### 1. Feature Development

```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes
# ... write code

# Run tests
npm test

# Run linting
npm run lint

# Build project
npm run build

# Commit changes
git add .
git commit -m "feat: add new feature"

# Push branch
git push origin feature/new-feature
```

### 2. Code Review Process

1. **Self-review** before creating PR
2. **Automated checks** (tests, linting, build)
3. **Peer review** by team member
4. **Approval** and merge

### 3. Release Process

```bash
# Update version
npm version patch|minor|major

# Build for production
npm run build

# Run full test suite
npm test

# Create release tag
git tag v1.0.0
git push origin v1.0.0
```

## 🔧 Development Tools

### VS Code Extensions (Recommended)

- **TypeScript Importer**: Auto import TypeScript modules
- **ESLint**: Code linting and formatting
- **Prettier**: Code formatting
- **Jest**: Test runner integration
- **GitLens**: Git history and blame
- **Thunder Client**: API testing

### Useful Scripts

```bash
# Development server with hot reload
npm run dev

# Build and watch for changes
npm run build:watch

# Clean build artifacts
npm run clean

# Generate API documentation
npm run docs:generate

# Run database migrations
npm run db:migrate

# Seed database with test data
npm run db:seed

# Lint and fix code
npm run lint:fix

# Format code with Prettier
npm run format
```

## 🐛 Debugging

### Debug Configuration

Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug Server",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/src/api/server.ts",
      "outFiles": ["${workspaceFolder}/dist/**/*.js"],
      "runtimeArgs": ["-r", "ts-node/register"],
      "env": {
        "NODE_ENV": "development"
      }
    },
    {
      "name": "Debug Tests",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/node_modules/.bin/jest",
      "args": ["--runInBand", "--no-cache"],
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen"
    }
  ]
}
```

### Common Debugging Scenarios

#### 1. Database Connection Issues

```typescript
// Add logging to database manager
async connect(): Promise<void> {
  try {
    console.log('Connecting to database...');
    await this.pool.connect();
    console.log('Database connected successfully');
  } catch (error) {
    console.error('Database connection failed:', error);
    throw error;
  }
}
```

#### 2. API Request Debugging

```typescript
// Add request logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`, {
    body: req.body,
    query: req.query,
    params: req.params
  });
  next();
});
```

#### 3. Schema Validation Debugging

```typescript
// Add detailed validation logging
function validateSchema(schema: any, data: any): ValidationResult {
  console.log('Validating data:', JSON.stringify(data, null, 2));
  console.log('Against schema:', JSON.stringify(schema, null, 2));
  
  const result = performValidation(schema, data);
  console.log('Validation result:', result);
  
  return result;
}
```

## 📚 Learning Resources

### TypeScript Resources
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [TypeScript Deep Dive](https://basarat.gitbook.io/typescript/)
- [Effective TypeScript](https://effectivetypescript.com/)

### Node.js Resources
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [Express.js Guide](https://expressjs.com/en/guide/)

### Testing Resources
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Testing Best Practices](https://kentcdodds.com/blog/the-testing-trophy-and-testing-classifications)

### Database Resources
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Node.js PostgreSQL Best Practices](https://node-postgres.com/features/)

## 🤝 Contributing Guidelines

### Before Contributing

1. **Read the documentation** thoroughly
2. **Set up development environment** locally
3. **Run existing tests** to ensure everything works
4. **Understand the codebase architecture**

### Making Changes

1. **Create issue** describing the change (if applicable)
2. **Create feature branch** from main
3. **Write code** following coding standards
4. **Write tests** for new functionality
5. **Update documentation** if needed
6. **Run full test suite**
7. **Submit pull request** with detailed description

### Pull Request Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing completed

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] All tests pass
- [ ] Build succeeds
```

### Code Review Guidelines

#### For Reviewers

1. **Check functionality** - Does it work as expected?
2. **Check code quality** - Follows coding standards?
3. **Check tests** - Adequate test coverage?
4. **Check documentation** - Is it updated?
5. **Check performance** - Any performance implications?

#### For Authors

1. **Respond to feedback** promptly
2. **Make requested changes** or explain reasoning
3. **Update tests** based on feedback
4. **Keep PR updated** with latest changes
5. **Be open to suggestions** and improvements

## 🚀 Performance Guidelines

### Database Performance

1. **Use connection pooling** for database connections
2. **Optimize queries** with proper indexes
3. **Use transactions** for multi-step operations
4. **Implement caching** for frequently accessed data

### API Performance

1. **Implement rate limiting** to prevent abuse
2. **Use compression** for large responses
3. **Optimize JSON serialization**
4. **Implement proper error handling** to avoid leaks

### Memory Management

1. **Avoid memory leaks** in long-running processes
2. **Use streams** for large file operations
3. **Clean up resources** properly
4. **Monitor memory usage** in production

## 🔒 Security Guidelines

### Input Validation

1. **Validate all inputs** using schemas
2. **Sanitize user inputs** to prevent injection
3. **Use parameterized queries** for database operations
4. **Implement proper authentication** and authorization

### Data Protection

1. **Hash sensitive data** (passwords, tokens)
2. **Use HTTPS** in production
3. **Implement proper CORS** configuration
4. **Secure environment variables** and secrets

### Error Handling

1. **Don't expose sensitive information** in error messages
2. **Log errors securely** without exposing data
3. **Implement proper error boundaries**
4. **Monitor for security issues**

## 📈 Monitoring and Logging

### Logging Guidelines

1. **Use structured logging** with consistent format
2. **Include correlation IDs** for request tracing
3. **Log at appropriate levels** (error, warn, info, debug)
4. **Avoid logging sensitive data**

### Performance Monitoring

1. **Monitor response times** for API endpoints
2. **Track database query performance**
3. **Monitor memory and CPU usage**
4. **Set up alerts** for critical issues

### Health Checks

1. **Implement health check endpoints**
2. **Monitor database connectivity**
3. **Check external service dependencies**
4. **Monitor overall system health**

This development guide provides comprehensive information for contributing to the Document Management SDK. For additional information, see the [API Documentation](./API.md) and [Schema Documentation](./Schemas.md).
