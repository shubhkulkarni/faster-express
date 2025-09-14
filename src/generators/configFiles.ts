import path from 'path';
import fs from 'fs-extra';
import { ProjectConfig } from '../types';

export async function generateConfigFiles(config: ProjectConfig, projectPath: string): Promise<void> {
  const promises: Promise<void>[] = [];

  // TypeScript configuration
  if (config.language === 'ts') {
    promises.push(generateTsConfig(projectPath));
  }

  // Jest configuration
  if (config.testing) {
    promises.push(generateJestConfig(config, projectPath));
  }

  // ESLint configuration
  if (config.eslint) {
    promises.push(generateEslintConfig(config, projectPath));
  }

  // Prettier configuration
  if (config.prettier) {
    promises.push(generatePrettierConfig(projectPath));
  }

  // Docker configuration
  if (config.docker) {
    promises.push(generateDockerFiles(config, projectPath));
  }

  // Prisma schema
  if (config.orm === 'prisma') {
    promises.push(generatePrismaSchema(config, projectPath));
  }

  // .gitignore
  promises.push(generateGitignore(projectPath));

  await Promise.all(promises);
}

async function generateTsConfig(projectPath: string): Promise<void> {
  const tsConfig = {
    compilerOptions: {
      target: 'ES2020',
      module: 'commonjs',
      lib: ['ES2020'],
      outDir: './dist',
      rootDir: './src',
      strict: true,
      esModuleInterop: true,
      skipLibCheck: true,
      forceConsistentCasingInFileNames: true,
      declaration: true,
      declarationMap: true,
      sourceMap: true,
      removeComments: true,
      resolveJsonModule: true,
      types: ['node', 'jest'],
      moduleResolution: 'node',
      allowSyntheticDefaultImports: true,
      experimentalDecorators: true,
      emitDecoratorMetadata: true
    },
    include: ['src/**/*'],
    exclude: ['node_modules', 'dist', '**/*.test.ts']
  };

  await fs.writeJson(path.join(projectPath, 'tsconfig.json'), tsConfig, { spaces: 2 });
}

async function generateJestConfig(config: ProjectConfig, projectPath: string): Promise<void> {
  let jestConfig: any = {
    testEnvironment: 'node',
    collectCoverageFrom: [
      'src/**/*.{js,ts}',
      '!src/**/*.test.{js,ts}',
      '!src/**/*.spec.{js,ts}'
    ],
    coverageDirectory: 'coverage',
    coverageReporters: ['text', 'lcov', 'html'],
    testMatch: [
      '**/__tests__/**/*.(js|ts)',
      '**/*.(test|spec).(js|ts)'
    ]
  };

  if (config.language === 'ts') {
    jestConfig.preset = 'ts-jest';
    jestConfig.transform = {
      '^.+\\.ts$': 'ts-jest'
    };
    jestConfig.moduleFileExtensions = ['ts', 'js', 'json'];
  }

  await fs.writeJson(path.join(projectPath, 'jest.config.json'), jestConfig, { spaces: 2 });
}

async function generateEslintConfig(config: ProjectConfig, projectPath: string): Promise<void> {
  let eslintConfig: any = {
    env: {
      node: true,
      es2021: true
    },
    extends: ['eslint:recommended'],
    parserOptions: {
      ecmaVersion: 12,
      sourceType: 'module'
    },
    rules: {
      'no-console': 'warn',
      'no-unused-vars': 'error',
      'prefer-const': 'error'
    }
  };

  if (config.language === 'ts') {
    eslintConfig.parser = '@typescript-eslint/parser';
    eslintConfig.extends.push('@typescript-eslint/recommended');
    eslintConfig.plugins = ['@typescript-eslint'];
    eslintConfig.rules['@typescript-eslint/no-unused-vars'] = 'error';
    eslintConfig.rules['@typescript-eslint/explicit-function-return-type'] = 'warn';
  }

  if (config.prettier) {
    eslintConfig.extends.push('prettier');
    eslintConfig.plugins = eslintConfig.plugins || [];
    eslintConfig.plugins.push('prettier');
    eslintConfig.rules['prettier/prettier'] = 'error';
  }

  if (config.testing) {
    eslintConfig.env.jest = true;
  }

  await fs.writeJson(path.join(projectPath, '.eslintrc.json'), eslintConfig, { spaces: 2 });
}

async function generatePrettierConfig(projectPath: string): Promise<void> {
  const prettierConfig = {
    semi: true,
    trailingComma: 'es5',
    singleQuote: true,
    printWidth: 80,
    tabWidth: 2,
    useTabs: false
  };

  await fs.writeJson(path.join(projectPath, '.prettierrc'), prettierConfig, { spaces: 2 });

  // Create .prettierignore
  const prettierIgnore = `node_modules/
dist/
coverage/
*.log
.env
.env.local
.env.production
`;

  await fs.writeFile(path.join(projectPath, '.prettierignore'), prettierIgnore);
}

async function generateDockerFiles(config: ProjectConfig, projectPath: string): Promise<void> {
  // Dockerfile
  let dockerfile = '';
  
  if (config.language === 'ts') {
    dockerfile = `# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:18-alpine AS production

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy built application
COPY --from=builder /app/dist ./dist

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Change ownership of the app directory
RUN chown -R nextjs:nodejs /app
USER nextjs

EXPOSE 3000

CMD ["node", "dist/server.js"]`;
  } else {
    dockerfile = `FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY . .

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Change ownership of the app directory
RUN chown -R nextjs:nodejs /app
USER nextjs

EXPOSE 3000

CMD ["node", "src/server.js"]`;
  }

  await fs.writeFile(path.join(projectPath, 'Dockerfile'), dockerfile);

  // docker-compose.yml
  let dockerCompose = `version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    volumes:
      - .:/app
      - /app/node_modules
    depends_on:`;

  if (config.database === 'mongodb') {
    dockerCompose += `
      - mongodb

  mongodb:
    image: mongo:6
    ports:
      - "27017:27017"
    environment:
      MONGO_INITDB_DATABASE: ${config.name}
    volumes:
      - mongodb_data:/data/db

volumes:
  mongodb_data:`;
  } else if (config.database === 'postgres') {
    dockerCompose += `
      - postgres

  postgres:
    image: postgres:15
    ports:
      - "5432:5432"
    environment:
      POSTGRES_DB: ${config.name}
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:`;
  } else {
    dockerCompose += `
      - redis

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"`;
  }

  await fs.writeFile(path.join(projectPath, 'docker-compose.yml'), dockerCompose);

  // .dockerignore
  const dockerignore = `node_modules
npm-debug.log
Dockerfile
.dockerignore
.git
.gitignore
README.md
.env
.nyc_output
coverage
.nyc_output
.vscode
.idea
`;

  await fs.writeFile(path.join(projectPath, '.dockerignore'), dockerignore);
}

async function generatePrismaSchema(config: ProjectConfig, projectPath: string): Promise<void> {
  const prismaPath = path.join(projectPath, 'prisma');
  await fs.ensureDir(prismaPath);

  let schema = `// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
}

datasource db {`;

  if (config.database === 'postgres') {
    schema += `
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        Int      @id @default(autoincrement())
  name      String
  email     String?  @unique
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}`;
  } else if (config.database === 'mongodb') {
    schema += `
  provider = "mongodb"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  name      String
  email     String?  @unique
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}`;
  }

  await fs.writeFile(path.join(prismaPath, 'schema.prisma'), schema);
}

async function generateGitignore(projectPath: string): Promise<void> {
  const gitignore = `# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/
*.lcov

# nyc test coverage
.nyc_output

# node-waf configuration
.lock-wscript

# Compiled binary addons
build/Release

# Dependency directories
node_modules/
jspm_packages/

# TypeScript cache
*.tsbuildinfo

# Optional npm cache directory
.npm

# Optional eslint cache
.eslintcache

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# dotenv environment variables file
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# parcel-bundler cache (https://parceljs.org/)
.cache
.parcel-cache

# next.js build output
.next

# nuxt.js build output
.nuxt

# vuepress build output
.vuepress/dist

# Serverless directories
.serverless

# FuseBox cache
.fusebox/

# DynamoDB Local files
.dynamodb/

# TernJS port file
.tern-port

# Stores VSCode versions used for testing VSCode extensions
.vscode-test

# Distribution files
dist/

# IDE files
.vscode/
.idea/
*.swp
*.swo
*~

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# Logs
logs
*.log

# Database
*.sqlite
*.db

# Prisma
prisma/migrations/
`;

  await fs.writeFile(path.join(projectPath, '.gitignore'), gitignore);
}
