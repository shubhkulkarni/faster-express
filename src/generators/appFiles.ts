import path from "path";
import fs from "fs-extra";
import { ProjectConfig } from "../types";

export async function generateAppFiles(
  config: ProjectConfig,
  projectPath: string
): Promise<void> {
  const srcPath = path.join(projectPath, "src");
  await fs.ensureDir(srcPath);

  // Generate app file
  const appContent = generateAppContent(config);
  const appFile = config.language === "ts" ? "app.ts" : "app.js";
  await fs.writeFile(path.join(srcPath, appFile), appContent);

  // Generate server file
  const serverContent = generateServerContent(config);
  const serverFile = config.language === "ts" ? "server.ts" : "server.js";
  await fs.writeFile(path.join(srcPath, serverFile), serverContent);

  // Generate environment file
  const envContent = generateEnvContent(config);
  await fs.writeFile(path.join(projectPath, ".env"), envContent);

  // Generate env example
  const envExampleContent = generateEnvExampleContent(config);
  await fs.writeFile(path.join(projectPath, ".env.example"), envExampleContent);
}

function generateAppContent(config: ProjectConfig): string {
  const isTypeScript = config.language === "ts";

  let imports = "";
  let middleware = "";
  let routes = "";

  if (isTypeScript) {
    imports = `import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { errorHandler } from './middleware/errorHandler';`;

    if (config.swagger.enabled) {
      imports += `
import { SwaggerSetup } from './swagger';`;
    }
  } else {
    imports = `const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { errorHandler } = require('./middleware/errorHandler');`;

    if (config.swagger.enabled) {
      imports += `
const { SwaggerSetup } = require('./swagger');`;
    }
  }

  if (config.style === "resource") {
    if (isTypeScript) {
      imports += `
import { registerResources } from './utils/registerResources';`;
    } else {
      imports += `
const { registerResources } = require('./utils/registerResources');`;
    }
  }

  // Rate limiting middleware
  middleware = `
// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

app.use(limiter);
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));`;

  if (config.style === "resource") {
    routes = `
// Auto-register all resources
registerResources(app);`;
  } else {
    routes = `
// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to ${config.name} API' });
});`;
  }

  const appFunction = `
const app = express();
${middleware}${
    config.swagger.enabled
      ? `

// Setup Swagger documentation
const swaggerSetup = new SwaggerSetup(app);
swaggerSetup.setup();`
      : ""
  }
${routes}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()${
      config.swagger.enabled
        ? `,
    documentation: '${config.swagger.path}'`
        : ""
    }
  });
});

// Error handling middleware (should be last)
app.use(errorHandler);

export default app;`;

  return `${imports}
${appFunction}`;
}

function generateServerContent(config: ProjectConfig): string {
  const isTypeScript = config.language === "ts";

  let imports = "";
  let dbConnection = "";

  if (isTypeScript) {
    imports = `import app from './app';
import dotenv from 'dotenv';`;
  } else {
    imports = `const app = require('./app');
const dotenv = require('dotenv');`;
  }

  // Database connection
  if (config.database && config.orm) {
    if (config.orm === "mongoose") {
      if (isTypeScript) {
        imports += `
import mongoose from 'mongoose';`;
      } else {
        imports += `
const mongoose = require('mongoose');`;
      }

      dbConnection = `
// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/${config.name}')
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.error('MongoDB connection error:', error));`;
    } else if (config.orm === "prisma") {
      if (isTypeScript) {
        imports += `
import { PrismaClient } from '@prisma/client';`;
      } else {
        imports += `
const { PrismaClient } = require('@prisma/client');`;
      }

      dbConnection = `
// Database connection
const prisma = new PrismaClient();

// Test database connection
prisma.$connect()
  .then(() => console.log('Connected to database via Prisma'))
  .catch((error) => console.error('Database connection error:', error));`;
    }
  }

  return `${imports}

dotenv.config();
${dbConnection}

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(\`🚀 Server is running on port \${PORT}\`);
  console.log(\`📚 API Documentation: http://localhost:\${PORT}/health\`);
});`;
}

function generateEnvContent(config: ProjectConfig): string {
  let content = `# Environment Configuration
NODE_ENV=development
PORT=3000

# CORS
CORS_ORIGIN=http://localhost:3000`;

  if (config.database) {
    if (config.database === "mongodb") {
      content += `

# MongoDB
MONGODB_URI=mongodb://localhost:27017/${config.name}`;
    } else if (config.database === "postgres") {
      content += `

# PostgreSQL
DATABASE_URL=postgresql://username:password@localhost:5432/${config.name}`;
    }
  }

  if (config.auth === "jwt") {
    content += `

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d`;
  }

  if (config.auth === "passport") {
    content += `

# Session
SESSION_SECRET=your-super-secret-session-key`;
  }

  return content;
}

function generateEnvExampleContent(config: ProjectConfig): string {
  let content = `# Environment Configuration
NODE_ENV=development
PORT=3000

# CORS
CORS_ORIGIN=http://localhost:3000`;

  if (config.database) {
    if (config.database === "mongodb") {
      content += `

# MongoDB
MONGODB_URI=mongodb://localhost:27017/your-database-name`;
    } else if (config.database === "postgres") {
      content += `

# PostgreSQL
DATABASE_URL=postgresql://username:password@localhost:5432/your-database-name`;
    }
  }

  if (config.auth === "jwt") {
    content += `

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d`;
  }

  if (config.auth === "passport") {
    content += `

# Session
SESSION_SECRET=your-super-secret-session-key`;
  }

  return content;
}
