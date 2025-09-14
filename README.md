# faster-express

> A production-ready CLI for scaffolding resource-based Express applications with interactive prompts

[![npm version](https://badge.fury.io/js/faster-express.svg)](https://badge.fury.io/js/faster-express)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

🚀 **Smart Interactive Mode** - Progressive configuration with "configure more?" workflow  
⚡ **Lightweight Option** - Minimal setup with `--light` flag for quick prototyping  
🎛️ **Flexible Boilerplate** - Choose between minimal, signatures-only, or full implementation  
📦 **Multiple package managers** - Support for npm, yarn, and pnpm  
🗄️ **Database support** - MongoDB, PostgreSQL with popular ORMs  
🔐 **Authentication ready** - JWT and Passport.js integration  
🧪 **Testing included** - Jest and Supertest setup with optional validation  
🐳 **Docker support** - Complete containerization setup  
📝 **Code quality** - ESLint and Prettier configuration  
⚡ **Resource-based** - Nest.js-like modular architecture  
🎯 **Smart Defaults** - Sensible defaults with option to customize everything  

## Installation

```bash
# Install globally
npm install -g faster-express

# Or use directly with npx
npx faster-express create my-api
```

## Quick Start

### Interactive Mode (Recommended)

```bash
# Create a new project with smart interactive prompts
faster-express create my-api

# Create a lightweight project (minimal setup)
faster-express create my-api --light

# Add a new resource with interactive configuration
cd my-api
faster-express add user
```

The interactive mode now features:
- **Progressive disclosure**: Answer basic questions first, then choose "configure more?" for advanced options
- **Smart defaults**: Sensible choices that work for most projects
- **Lightweight mode**: Minimal setup for quick prototyping
- **Flexible boilerplate**: Choose how much code to generate (minimal/signatures/full)

### Non-Interactive Mode

```bash
# Create project with all flags
faster-express create my-api \\
  --lang ts \\
  --pkg-manager npm \\
  --with-db \\
  --db postgres \\
  --orm prisma \\
  --with-auth \\
  --auth jwt \\
  --with-jest \\
  --with-docker \\
  --with-eslint \\
  --with-prettier

# Add resource without prompts
faster-express add post --no-tests
```

## Commands

### `create <project-name> [options]`

Create a new Express project with your preferred configuration.

**New Enhanced Options:**
- `--light` - Create a lightweight project with minimal dependencies
- `--boilerplate <level>` - Boilerplate level: `minimal`, `signatures`, or `full`. Default: `full`
- `--no-validation` - Skip input validation setup
- `--interactive` - Force interactive mode even with flags

**Core Options:**
- `--lang <language>` - Language: `ts` (TypeScript) or `js` (JavaScript). Default: `ts`
- `--pkg-manager <manager>` - Package manager: `npm`, `yarn`, or `pnpm`. Default: `npm`
- `--style <style>` - Project style: `resource` (Nest-like) or `layered`. Default: `resource`
- `--with-db` - Include database support
- `--db <database>` - Database type: `mongodb` or `postgres`
- `--orm <orm>` - ORM/ODM: `mongoose`, `prisma`, `sequelize`, or `typeorm`
- `--with-auth` - Include authentication
- `--auth <type>` - Auth type: `jwt` or `passport`
- `--with-jest` - Include Jest testing framework
- `--no-tests` - Disable test file generation
- `--with-eslint` - Include ESLint configuration
- `--with-prettier` - Include Prettier configuration
- `--with-docker` - Include Docker configuration
- `--no-git` - Skip Git initialization

**Examples:**

```bash
# Interactive mode (recommended)
faster-express create my-api

# Lightweight project for quick prototyping
faster-express create my-api --light

# Minimal boilerplate (just signatures)
faster-express create my-api --boilerplate signatures

# TypeScript with PostgreSQL and Prisma
faster-express create my-api --lang ts --with-db --db postgres --orm prisma

# JavaScript with MongoDB and Mongoose
faster-express create my-api --lang js --with-db --db mongodb --orm mongoose

# Full-featured setup
faster-express create my-api \\
  --lang ts \\
  --with-db --db postgres --orm prisma \\
  --with-auth --auth jwt \\
  --with-jest \\
  --with-docker \\
  --with-eslint \\
  --with-prettier

# Lightweight with specific database
faster-express create my-api --light --with-db --db mongodb
```

### `add <resource-name> [options]`

Add a new resource to an existing project with enhanced interactive configuration.

**Enhanced Options:**
- `--boilerplate <level>` - Boilerplate level: `minimal`, `signatures`, or `full`
- `--no-validation` - Skip validation setup for this resource
- `--endpoints <list>` - Custom endpoints (comma-separated): e.g., "activate,deactivate"
- `--fields <list>` - Resource fields (comma-separated): e.g., "name:string,email:string"

**Core Options:**
- `--no-tests` - Skip test file generation
- `--with-auth` - Include authentication middleware

**Examples:**

```bash
# Interactive mode (recommended) - includes progressive configuration
faster-express add user

# Minimal boilerplate with custom endpoints
faster-express add post --boilerplate minimal --endpoints "publish,unpublish,archive"

# Skip tests and validation
faster-express add temp --no-tests --no-validation

# Include auth middleware with specific fields
faster-express add admin --with-auth --fields "username:string,role:string,permissions:array"

# Full configuration with custom endpoints
faster-express add product \\
  --boilerplate full \\
  --endpoints "activate,deactivate,bulk-update" \\
  --fields "name:string,price:number,category:string"
```

The interactive resource creation now includes:
- **Smart field detection**: Automatically suggests common fields for resource types
- **Custom endpoints**: Add specialized endpoints beyond CRUD
- **Validation options**: Choose whether to include input validation
- **Progressive configuration**: Basic setup first, then "configure more?" for advanced options

### `remove <resource-name>`

Remove a resource from the project.

**Examples:**

```bash
# Remove a resource
faster-express remove user
```

### `list`

List all resources in the current project.

**Examples:**

```bash
# List all resources
faster-express list
```

## Enhanced Interactive Workflow

### Smart Progressive Configuration

The CLI now features an intelligent workflow that asks basic questions first, then offers advanced configuration:

```bash
faster-express create my-api
```

**Step 1: Basic Setup**
- Project language (TypeScript/JavaScript)
- Package manager (npm/yarn/pnpm)
- Include database? (yes/no)

**Step 2: Configure More?**
- The CLI asks if you want to configure additional options
- If yes, you get advanced options for databases, authentication, testing, etc.
- If no, sensible defaults are used

### Lightweight Mode

Perfect for quick prototyping and learning:

```bash
faster-express create my-api --light
```

**Lightweight mode includes:**
- Minimal dependencies
- Basic Express setup
- Essential middleware only
- Optional database connection
- Simplified project structure

### Boilerplate Levels

Choose how much code to generate:

- **`minimal`**: Just interfaces and basic structure
- **`signatures`**: Method signatures with comments, no implementation
- **`full`**: Complete implementation with error handling and best practices

```bash
# Generate only method signatures for learning
faster-express create my-api --boilerplate signatures

# Full implementation for production
faster-express create my-api --boilerplate full
```

## Project Structure

### Resource-Based Structure (Default)

```
my-api/
├── src/
│   ├── app.ts                 # Express app configuration
│   ├── server.ts              # Server entry point
│   ├── middleware/            # Global middleware
│   │   ├── errorHandler.ts
│   │   └── auth.ts           # (if auth enabled)
│   ├── utils/
│   │   └── registerResources.ts
│   ├── types/                 # Type definitions
│   └── resources/             # Resource modules
│       └── user/              # Example resource
│           ├── controller.ts  # Route handlers
│           ├── service.ts     # Business logic
│           ├── routes.ts      # Route definitions
│           ├── validation.ts  # Input validation
│           ├── model.ts       # Data model (if DB enabled)
│           ├── index.ts       # Resource registration
│           └── user.test.ts   # Tests (if enabled)
├── tests/                     # Additional test files
├── prisma/                    # Prisma schema (if using Prisma)
├── docker-compose.yml         # (if Docker enabled)
├── Dockerfile                 # (if Docker enabled)
├── .env                       # Environment variables
├── .env.example              # Environment template
├── package.json
└── tsconfig.json             # (if TypeScript)
```

## Generated Files

### Resource Files

Each resource generates these files:

- **`controller.ts`** - HTTP route handlers with proper error handling
- **`service.ts`** - Business logic layer with CRUD operations
- **`routes.ts`** - Express route definitions with validation
- **`validation.ts`** - Input validation using express-validator
- **`model.ts`** - Database model (if database enabled)
- **`index.ts`** - Resource registration for auto-loading
- **`{resource}.test.ts`** - Complete test suite (if testing enabled)

### Configuration Files

Depending on your choices, these config files are generated:

- **`tsconfig.json`** - TypeScript configuration
- **`jest.config.json`** - Jest testing configuration
- **`.eslintrc.json`** - ESLint configuration
- **`.prettierrc`** - Prettier formatting rules
- **`Dockerfile`** - Docker container setup
- **`docker-compose.yml`** - Multi-service Docker setup
- **`prisma/schema.prisma`** - Prisma database schema

## Database Support

### MongoDB with Mongoose

```bash
faster-express create my-api --with-db --db mongodb --orm mongoose
```

Generates:
- Mongoose connection setup
- Schema-based models
- Built-in validation

### PostgreSQL with Prisma

```bash
faster-express create my-api --with-db --db postgres --orm prisma
```

Generates:
- Prisma schema file
- Type-safe database client
- Migration support

### PostgreSQL with Sequelize

```bash
faster-express create my-api --with-db --db postgres --orm sequelize
```

Generates:
- Sequelize models
- Migration support
- Connection pooling

### PostgreSQL with TypeORM

```bash
faster-express create my-api --with-db --db postgres --orm typeorm
```

Generates:
- TypeORM entities
- Decorator-based models
- Advanced query capabilities

## Authentication

### JWT Authentication

```bash
faster-express create my-api --with-auth --auth jwt
```

Generates:
- JWT middleware
- Token generation utilities
- Protected route examples

### Passport.js Authentication

```bash
faster-express create my-api --with-auth --auth passport
```

Generates:
- Passport configuration
- Local strategy setup
- Session management

## Testing

```bash
faster-express create my-api --with-jest
```

Generates:
- Jest configuration
- Supertest integration
- Complete test suites for each resource
- Coverage reporting setup

## Docker Support

```bash
faster-express create my-api --with-docker
```

Generates:
- Multi-stage Dockerfile
- docker-compose.yml with services
- Database containers (if database enabled)
- Production-ready configuration

## Development Workflow

### 1. Create Project

```bash
# Interactive creation
faster-express create my-blog

# Follow prompts to configure your project
? Which language would you like to use? TypeScript
? Which package manager would you like to use? npm
? Which database would you like to use? PostgreSQL
? Which ORM would you like to use? prisma
? Which authentication method would you like? JWT
? Would you like to enable Jest testing? Yes
? Would you like to enable Docker configuration? Yes
```

### 2. Start Development

```bash
cd my-blog
npm run dev
```

### 3. Add Resources

```bash
# Add a posts resource
faster-express add post

# Add an admin resource with auth
faster-express add admin --with-auth

# Add a category resource without tests
faster-express add category --no-tests
```

### 4. Manage Resources

```bash
# List all resources
faster-express list

# Remove a resource
faster-express remove admin
```

## API Examples

### Generated REST Endpoints

Each resource automatically gets these endpoints:

```
GET    /api/users      # Get all users
GET    /api/users/:id  # Get user by ID
POST   /api/users      # Create new user
PUT    /api/users/:id  # Update user
DELETE /api/users/:id  # Delete user
```

### Example API Usage

```bash
# Create a user
curl -X POST http://localhost:3000/api/users \\
  -H "Content-Type: application/json" \\
  -d '{"name": "John Doe", "email": "john@example.com"}'

# Get all users
curl http://localhost:3000/api/users

# Get user by ID
curl http://localhost:3000/api/users/1
```

## Environment Variables

The generated `.env` file includes:

```env
# Basic configuration
NODE_ENV=development
PORT=3000
CORS_ORIGIN=http://localhost:3000

# Database (if enabled)
DATABASE_URL=postgresql://username:password@localhost:5432/myapp
# or
MONGODB_URI=mongodb://localhost:27017/myapp

# JWT (if enabled)
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# Session (if Passport enabled)
SESSION_SECRET=your-super-secret-session-key
```

## Package Scripts

Generated `package.json` includes these scripts:

```json
{
  "scripts": {
    "build": "tsc",                    // TypeScript compilation
    "start": "node dist/server.js",   // Production start
    "dev": "ts-node src/server.ts",   // Development with hot reload
    "test": "jest",                    // Run tests
    "test:watch": "jest --watch",      // Watch mode testing
    "test:coverage": "jest --coverage", // Coverage report
    "lint": "eslint src/**/*.ts",      // Code linting
    "lint:fix": "eslint src/**/*.ts --fix", // Auto-fix linting
    "format": "prettier --write src/**/*.ts", // Code formatting
    "db:generate": "prisma generate",  // Generate Prisma client
    "db:migrate": "prisma migrate dev" // Run database migrations
  }
}
```

## Quick Reference

### Common Commands

```bash
# Quick start (interactive)
faster-express create my-api

# Lightweight project
faster-express create my-api --light

# Add resource with custom endpoints
faster-express add user --endpoints "activate,deactivate"

# Minimal boilerplate
faster-express create my-api --boilerplate minimal

# Full featured setup
faster-express create my-api --with-db --db postgres --orm prisma --with-auth --with-jest
```

### CLI Flags Quick Reference

| Flag | Description | Options | Default |
|------|-------------|---------|---------|
| `--light` | Lightweight project | - | `false` |
| `--boilerplate` | Code generation level | `minimal`, `signatures`, `full` | `full` |
| `--no-validation` | Skip validation setup | - | `false` |
| `--lang` | Project language | `ts`, `js` | `ts` |
| `--pkg-manager` | Package manager | `npm`, `yarn`, `pnpm` | `npm` |
| `--db` | Database type | `mongodb`, `postgres` | - |
| `--orm` | ORM/ODM | `mongoose`, `prisma`, `sequelize`, `typeorm` | - |
| `--auth` | Authentication | `jwt`, `passport` | - |
| `--with-jest` | Include testing | - | `false` |
| `--with-docker` | Include Docker | - | `false` |
| `--no-git` | Skip Git init | - | `false` |

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

- 📖 [Documentation](https://github.com/yourusername/faster-express#readme)
- 🐛 [Issue Tracker](https://github.com/yourusername/faster-express/issues)
- 💬 [Discussions](https://github.com/yourusername/faster-express/discussions)

---

⚡ **Happy coding with faster-express!** ⚡
