import path from 'path';
import fs from 'fs-extra';
import { ProjectConfig, ResourceConfig } from '../types';

export async function generateResourceFiles(config: ProjectConfig, projectPath: string): Promise<void> {
  const srcPath = path.join(projectPath, 'src');

  // Generate utils/registerResources file
  await generateRegisterResourcesUtil(config, srcPath);

  // Generate middleware files
  await generateMiddlewareFiles(config, srcPath);

  // Generate initial user resource as example
  const userResourceConfig: ResourceConfig = {
    name: 'user',
    generateTests: config.testing,
    withAuth: false,
    boilerplateLevel: config.boilerplateLevel,
    includeValidation: config.includeValidation
  };
  
  await generateResource(config, userResourceConfig, srcPath);
}

export async function generateResource(
  projectConfig: ProjectConfig,
  resourceConfig: ResourceConfig,
  basePath: string
): Promise<void> {
  const resourcePath = path.join(basePath, 'resources', resourceConfig.name);
  await fs.ensureDir(resourcePath);

  const isTypeScript = projectConfig.language === 'ts';
  const ext = isTypeScript ? '.ts' : '.js';

  // Generate resource files
  await fs.writeFile(
    path.join(resourcePath, `controller${ext}`),
    generateControllerContent(projectConfig, resourceConfig)
  );

  await fs.writeFile(
    path.join(resourcePath, `service${ext}`),
    generateServiceContent(projectConfig, resourceConfig)
  );

  await fs.writeFile(
    path.join(resourcePath, `routes${ext}`),
    generateRoutesContent(projectConfig, resourceConfig)
  );

  await fs.writeFile(
    path.join(resourcePath, `validation${ext}`),
    generateValidationContent(projectConfig, resourceConfig)
  );

  await fs.writeFile(
    path.join(resourcePath, `index${ext}`),
    generateIndexContent(projectConfig, resourceConfig)
  );

  // Generate model if database is enabled
  if (projectConfig.database && projectConfig.database !== 'none') {
    await fs.writeFile(
      path.join(resourcePath, `model${ext}`),
      generateModelContent(projectConfig, resourceConfig)
    );
  }

  // Generate test file if testing is enabled
  if (resourceConfig.generateTests && projectConfig.testing) {
    await fs.writeFile(
      path.join(resourcePath, `${resourceConfig.name}.test${ext}`),
      generateTestContent(projectConfig, resourceConfig)
    );
  }
}

async function generateRegisterResourcesUtil(config: ProjectConfig, srcPath: string): Promise<void> {
  const isTypeScript = config.language === 'ts';
  const ext = isTypeScript ? '.ts' : '.js';
  const utilsPath = path.join(srcPath, 'utils');
  
  // Ensure utils directory exists
  await fs.ensureDir(utilsPath);
  
  let content = '';
  
  if (isTypeScript) {
    content = `import { Application } from 'express';
import fs from 'fs';
import path from 'path';

export function registerResources(app: Application): void {
  const resourcesPath = path.join(__dirname, '../resources');
  
  if (!fs.existsSync(resourcesPath)) {
    console.warn('Resources directory not found');
    return;
  }

  const resourceDirs = fs.readdirSync(resourcesPath, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

  for (const resourceName of resourceDirs) {
    try {
      const resourceIndex = require(path.join(resourcesPath, resourceName, 'index'));
      if (resourceIndex.default && typeof resourceIndex.default === 'function') {
        resourceIndex.default(app);
        console.log(\`✅ Registered \${resourceName} resource\`);
      } else {
        console.warn(\`⚠️  \${resourceName} resource does not export a default function\`);
      }
    } catch (error) {
      console.error(\`❌ Failed to register \${resourceName} resource:\`, error);
    }
  }
}`;
  } else {
    content = `const fs = require('fs');
const path = require('path');

function registerResources(app) {
  const resourcesPath = path.join(__dirname, '../resources');
  
  if (!fs.existsSync(resourcesPath)) {
    console.warn('Resources directory not found');
    return;
  }

  const resourceDirs = fs.readdirSync(resourcesPath, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

  for (const resourceName of resourceDirs) {
    try {
      const resourceIndex = require(path.join(resourcesPath, resourceName, 'index'));
      if (typeof resourceIndex === 'function') {
        resourceIndex(app);
        console.log(\`✅ Registered \${resourceName} resource\`);
      } else {
        console.warn(\`⚠️  \${resourceName} resource does not export a function\`);
      }
    } catch (error) {
      console.error(\`❌ Failed to register \${resourceName} resource:\`, error);
    }
  }
}

module.exports = { registerResources };`;
  }

  return fs.writeFile(path.join(utilsPath, `registerResources${ext}`), content);
}

function generateMiddlewareFiles(config: ProjectConfig, srcPath: string): Promise<void[]> {
  const isTypeScript = config.language === 'ts';
  const ext = isTypeScript ? '.ts' : '.js';
  const middlewarePath = path.join(srcPath, 'middleware');

  const promises: Promise<void>[] = [];

  // Ensure middleware directory exists first
  promises.push(fs.ensureDir(middlewarePath));

  // Error handler middleware
  let errorHandlerContent = '';
  if (isTypeScript) {
    errorHandlerContent = `import { Request, Response, NextFunction } from 'express';

interface CustomError extends Error {
  statusCode?: number;
  status?: string;
  isOperational?: boolean;
}

export const errorHandler = (
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values((err as any).errors).map((val: any) => val.message).join(', ');
  }

  // Mongoose duplicate key error
  if ((err as any).code === 11000) {
    statusCode = 400;
    message = 'Duplicate field value entered';
  }

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};`;
  } else {
    errorHandlerContent = `const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors).map(val => val.message).join(', ');
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    statusCode = 400;
    message = 'Duplicate field value entered';
  }

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = { errorHandler };`;
  }

  promises.push(fs.writeFile(path.join(middlewarePath, `errorHandler${ext}`), errorHandlerContent));

  // Auth middleware if auth is enabled
  if (config.auth && config.auth !== 'none') {
    let authMiddlewareContent = '';
    
    if (config.auth === 'jwt') {
      if (isTypeScript) {
        authMiddlewareContent = `import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface AuthRequest extends Request {
  user?: any;
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: 'Access token required' });
    return;
  }

  jwt.verify(token, process.env.JWT_SECRET!, (err: any, user: any) => {
    if (err) {
      res.status(403).json({ error: 'Invalid or expired token' });
      return;
    }
    req.user = user;
    next();
  });
};`;
      } else {
        authMiddlewareContent = `const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

module.exports = { authenticateToken };`;
      }
    }

    promises.push(fs.writeFile(path.join(middlewarePath, `auth${ext}`), authMiddlewareContent));
  }

  return Promise.all(promises);
}

function generateControllerContent(projectConfig: ProjectConfig, resourceConfig: ResourceConfig): string {
  const isTypeScript = projectConfig.language === 'ts';
  const resourceName = resourceConfig.name;
  const ResourceName = resourceName.charAt(0).toUpperCase() + resourceName.slice(1);

  if (isTypeScript) {
    return `import { Request, Response, NextFunction } from 'express';
import { ${ResourceName}Service } from './service';

export class ${ResourceName}Controller {
  private ${resourceName}Service: ${ResourceName}Service;

  constructor() {
    this.${resourceName}Service = new ${ResourceName}Service();
  }

  public getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const ${resourceName}s = await this.${resourceName}Service.findAll();
      res.json({
        success: true,
        data: ${resourceName}s
      });
    } catch (error) {
      next(error);
    }
  };

  public getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const ${resourceName} = await this.${resourceName}Service.findById(id);
      
      if (!${resourceName}) {
        res.status(404).json({
          success: false,
          error: '${ResourceName} not found'
        });
        return;
      }

      res.json({
        success: true,
        data: ${resourceName}
      });
    } catch (error) {
      next(error);
    }
  };

  public create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const ${resourceName} = await this.${resourceName}Service.create(req.body);
      res.status(201).json({
        success: true,
        data: ${resourceName}
      });
    } catch (error) {
      next(error);
    }
  };

  public update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const ${resourceName} = await this.${resourceName}Service.update(id, req.body);
      
      if (!${resourceName}) {
        res.status(404).json({
          success: false,
          error: '${ResourceName} not found'
        });
        return;
      }

      res.json({
        success: true,
        data: ${resourceName}
      });
    } catch (error) {
      next(error);
    }
  };

  public delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const deleted = await this.${resourceName}Service.delete(id);
      
      if (!deleted) {
        res.status(404).json({
          success: false,
          error: '${ResourceName} not found'
        });
        return;
      }

      res.json({
        success: true,
        message: '${ResourceName} deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  };
}`;
  } else {
    return `const { ${ResourceName}Service } = require('./service');

class ${ResourceName}Controller {
  constructor() {
    this.${resourceName}Service = new ${ResourceName}Service();
  }

  getAll = async (req, res, next) => {
    try {
      const ${resourceName}s = await this.${resourceName}Service.findAll();
      res.json({
        success: true,
        data: ${resourceName}s
      });
    } catch (error) {
      next(error);
    }
  };

  getById = async (req, res, next) => {
    try {
      const { id } = req.params;
      const ${resourceName} = await this.${resourceName}Service.findById(id);
      
      if (!${resourceName}) {
        return res.status(404).json({
          success: false,
          error: '${ResourceName} not found'
        });
      }

      res.json({
        success: true,
        data: ${resourceName}
      });
    } catch (error) {
      next(error);
    }
  };

  create = async (req, res, next) => {
    try {
      const ${resourceName} = await this.${resourceName}Service.create(req.body);
      res.status(201).json({
        success: true,
        data: ${resourceName}
      });
    } catch (error) {
      next(error);
    }
  };

  update = async (req, res, next) => {
    try {
      const { id } = req.params;
      const ${resourceName} = await this.${resourceName}Service.update(id, req.body);
      
      if (!${resourceName}) {
        return res.status(404).json({
          success: false,
          error: '${ResourceName} not found'
        });
      }

      res.json({
        success: true,
        data: ${resourceName}
      });
    } catch (error) {
      next(error);
    }
  };

  delete = async (req, res, next) => {
    try {
      const { id } = req.params;
      const deleted = await this.${resourceName}Service.delete(id);
      
      if (!deleted) {
        return res.status(404).json({
          success: false,
          error: '${ResourceName} not found'
        });
      }

      res.json({
        success: true,
        message: '${ResourceName} deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  };
}

module.exports = { ${ResourceName}Controller };`;
  }
}

function generateServiceContent(projectConfig: ProjectConfig, resourceConfig: ResourceConfig): string {
  const isTypeScript = projectConfig.language === 'ts';
  const resourceName = resourceConfig.name;
  const ResourceName = resourceName.charAt(0).toUpperCase() + resourceName.slice(1);

  let modelImport = '';
  let serviceContent = '';

  if (projectConfig.database && projectConfig.database !== 'none') {
    if (isTypeScript) {
      modelImport = `import { ${ResourceName}Model } from './model';`;
      serviceContent = `export class ${ResourceName}Service {
  async findAll(): Promise<any[]> {
    return await ${ResourceName}Model.find();
  }

  async findById(id: string): Promise<any | null> {
    return await ${ResourceName}Model.findById(id);
  }

  async create(data: any): Promise<any> {
    return await ${ResourceName}Model.create(data);
  }

  async update(id: string, data: any): Promise<any | null> {
    return await ${ResourceName}Model.findByIdAndUpdate(id, data, { new: true });
  }

  async delete(id: string): Promise<boolean> {
    const result = await ${ResourceName}Model.findByIdAndDelete(id);
    return !!result;
  }
}`;
    } else {
      modelImport = `const { ${ResourceName}Model } = require('./model');`;
      serviceContent = `class ${ResourceName}Service {
  async findAll() {
    return await ${ResourceName}Model.find();
  }

  async findById(id) {
    return await ${ResourceName}Model.findById(id);
  }

  async create(data) {
    return await ${ResourceName}Model.create(data);
  }

  async update(id, data) {
    return await ${ResourceName}Model.findByIdAndUpdate(id, data, { new: true });
  }

  async delete(id) {
    const result = await ${ResourceName}Model.findByIdAndDelete(id);
    return !!result;
  }
}

module.exports = { ${ResourceName}Service };`;
    }
  } else {
    // In-memory service for demo purposes
    if (isTypeScript) {
      serviceContent = `export class ${ResourceName}Service {
  private ${resourceName}s: any[] = [];
  private nextId = 1;

  async findAll(): Promise<any[]> {
    return this.${resourceName}s;
  }

  async findById(id: string): Promise<any | null> {
    return this.${resourceName}s.find(item => item.id === parseInt(id)) || null;
  }

  async create(data: any): Promise<any> {
    const new${ResourceName} = { id: this.nextId++, ...data, createdAt: new Date() };
    this.${resourceName}s.push(new${ResourceName});
    return new${ResourceName};
  }

  async update(id: string, data: any): Promise<any | null> {
    const index = this.${resourceName}s.findIndex(item => item.id === parseInt(id));
    if (index === -1) return null;
    
    this.${resourceName}s[index] = { ...this.${resourceName}s[index], ...data, updatedAt: new Date() };
    return this.${resourceName}s[index];
  }

  async delete(id: string): Promise<boolean> {
    const index = this.${resourceName}s.findIndex(item => item.id === parseInt(id));
    if (index === -1) return false;
    
    this.${resourceName}s.splice(index, 1);
    return true;
  }
}`;
    } else {
      serviceContent = `class ${ResourceName}Service {
  constructor() {
    this.${resourceName}s = [];
    this.nextId = 1;
  }

  async findAll() {
    return this.${resourceName}s;
  }

  async findById(id) {
    return this.${resourceName}s.find(item => item.id === parseInt(id)) || null;
  }

  async create(data) {
    const new${ResourceName} = { id: this.nextId++, ...data, createdAt: new Date() };
    this.${resourceName}s.push(new${ResourceName});
    return new${ResourceName};
  }

  async update(id, data) {
    const index = this.${resourceName}s.findIndex(item => item.id === parseInt(id));
    if (index === -1) return null;
    
    this.${resourceName}s[index] = { ...this.${resourceName}s[index], ...data, updatedAt: new Date() };
    return this.${resourceName}s[index];
  }

  async delete(id) {
    const index = this.${resourceName}s.findIndex(item => item.id === parseInt(id));
    if (index === -1) return false;
    
    this.${resourceName}s.splice(index, 1);
    return true;
  }
}

module.exports = { ${ResourceName}Service };`;
    }
  }

  return `${modelImport}

${serviceContent}`;
}

function generateRoutesContent(projectConfig: ProjectConfig, resourceConfig: ResourceConfig): string {
  const isTypeScript = projectConfig.language === 'ts';
  const resourceName = resourceConfig.name;
  const ResourceName = resourceName.charAt(0).toUpperCase() + resourceName.slice(1);

  let authImport = '';
  let authMiddleware = '';
  
  if (resourceConfig.withAuth && projectConfig.auth && projectConfig.auth !== 'none') {
    if (isTypeScript) {
      authImport = `import { authenticateToken } from '../../middleware/auth';`;
      authMiddleware = ', authenticateToken';
    } else {
      authImport = `const { authenticateToken } = require('../../middleware/auth');`;
      authMiddleware = ', authenticateToken';
    }
  }

  if (isTypeScript) {
    return `import { Router } from 'express';
import { ${ResourceName}Controller } from './controller';
import { validate${ResourceName} } from './validation';${authImport}

const router = Router();
const ${resourceName}Controller = new ${ResourceName}Controller();

router.get('/', ${resourceName}Controller.getAll);
router.get('/:id', ${resourceName}Controller.getById);
router.post('/', validate${ResourceName}${authMiddleware}, ${resourceName}Controller.create);
router.put('/:id', validate${ResourceName}${authMiddleware}, ${resourceName}Controller.update);
router.delete('/:id'${authMiddleware}, ${resourceName}Controller.delete);

export default router;`;
  } else {
    return `const { Router } = require('express');
const { ${ResourceName}Controller } = require('./controller');
const { validate${ResourceName} } = require('./validation');${authImport}

const router = Router();
const ${resourceName}Controller = new ${ResourceName}Controller();

router.get('/', ${resourceName}Controller.getAll);
router.get('/:id', ${resourceName}Controller.getById);
router.post('/', validate${ResourceName}${authMiddleware}, ${resourceName}Controller.create);
router.put('/:id', validate${ResourceName}${authMiddleware}, ${resourceName}Controller.update);
router.delete('/:id'${authMiddleware}, ${resourceName}Controller.delete);

module.exports = router;`;
  }
}

function generateValidationContent(projectConfig: ProjectConfig, resourceConfig: ResourceConfig): string {
  const isTypeScript = projectConfig.language === 'ts';
  const resourceName = resourceConfig.name;
  const ResourceName = resourceName.charAt(0).toUpperCase() + resourceName.slice(1);

  if (isTypeScript) {
    return `import { body, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

export const validate${ResourceName} = [
  body('name')
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  
  body('email')
    .optional()
    .isEmail()
    .withMessage('Please provide a valid email'),

  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }
    next();
  }
];`;
  } else {
    return `const { body, validationResult } = require('express-validator');

const validate${ResourceName} = [
  body('name')
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  
  body('email')
    .optional()
    .isEmail()
    .withMessage('Please provide a valid email'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }
    next();
  }
];

module.exports = { validate${ResourceName} };`;
  }
}

function generateIndexContent(projectConfig: ProjectConfig, resourceConfig: ResourceConfig): string {
  const isTypeScript = projectConfig.language === 'ts';
  const resourceName = resourceConfig.name;

  if (isTypeScript) {
    return `import { Application } from 'express';
import ${resourceName}Routes from './routes';

export default function register${resourceName.charAt(0).toUpperCase() + resourceName.slice(1)}Routes(app: Application): void {
  app.use('/api/${resourceName}s', ${resourceName}Routes);
}`;
  } else {
    return `const ${resourceName}Routes = require('./routes');

function register${resourceName.charAt(0).toUpperCase() + resourceName.slice(1)}Routes(app) {
  app.use('/api/${resourceName}s', ${resourceName}Routes);
}

module.exports = register${resourceName.charAt(0).toUpperCase() + resourceName.slice(1)}Routes;`;
  }
}

function generateModelContent(projectConfig: ProjectConfig, resourceConfig: ResourceConfig): string {
  const isTypeScript = projectConfig.language === 'ts';
  const resourceName = resourceConfig.name;
  const ResourceName = resourceName.charAt(0).toUpperCase() + resourceName.slice(1);

  if (projectConfig.orm === 'mongoose') {
    if (isTypeScript) {
      return `import { Schema, model, Document } from 'mongoose';

interface I${ResourceName} extends Document {
  name: string;
  email?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ${resourceName}Schema = new Schema<I${ResourceName}>({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  email: {
    type: String,
    unique: true,
    lowercase: true,
    match: [/^\\S+@\\S+\\.\\S+$/, 'Please provide a valid email']
  }
}, {
  timestamps: true
});

export const ${ResourceName}Model = model<I${ResourceName}>('${ResourceName}', ${resourceName}Schema);`;
    } else {
      return `const { Schema, model } = require('mongoose');

const ${resourceName}Schema = new Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  email: {
    type: String,
    unique: true,
    lowercase: true,
    match: [/^\\S+@\\S+\\.\\S+$/, 'Please provide a valid email']
  }
}, {
  timestamps: true
});

const ${ResourceName}Model = model('${ResourceName}', ${resourceName}Schema);

module.exports = { ${ResourceName}Model };`;
    }
  } else if (projectConfig.orm === 'prisma') {
    // For Prisma, we'll generate a schema file instead
    return `// Prisma model - Add this to your schema.prisma file:
/*
model ${ResourceName} {
  id        Int      @id @default(autoincrement())
  name      String
  email     String?  @unique
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
*/

// This is a placeholder - Prisma models are defined in schema.prisma
export const ${ResourceName}Model = null;`;
  }

  return '';
}

function generateTestContent(projectConfig: ProjectConfig, resourceConfig: ResourceConfig): string {
  const isTypeScript = projectConfig.language === 'ts';
  const resourceName = resourceConfig.name;
  const ResourceName = resourceName.charAt(0).toUpperCase() + resourceName.slice(1);

  if (isTypeScript) {
    return `import request from 'supertest';
import app from '../../app';

describe('${ResourceName} API', () => {
  let ${resourceName}Id: string;

  describe('POST /api/${resourceName}s', () => {
    it('should create a new ${resourceName}', async () => {
      const ${resourceName}Data = {
        name: 'Test ${ResourceName}',
        email: 'test@example.com'
      };

      const response = await request(app)
        .post('/api/${resourceName}s')
        .send(${resourceName}Data)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.name).toBe(${resourceName}Data.name);
      
      ${resourceName}Id = response.body.data.id;
    });

    it('should return validation error for invalid data', async () => {
      const response = await request(app)
        .post('/api/${resourceName}s')
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
    });
  });

  describe('GET /api/${resourceName}s', () => {
    it('should get all ${resourceName}s', async () => {
      const response = await request(app)
        .get('/api/${resourceName}s')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('GET /api/${resourceName}s/:id', () => {
    it('should get a ${resourceName} by id', async () => {
      const response = await request(app)
        .get(\`/api/${resourceName}s/\${${resourceName}Id}\`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id', ${resourceName}Id);
    });

    it('should return 404 for non-existent ${resourceName}', async () => {
      const response = await request(app)
        .get('/api/${resourceName}s/999999')
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/${resourceName}s/:id', () => {
    it('should update a ${resourceName}', async () => {
      const updateData = {
        name: 'Updated ${ResourceName}'
      };

      const response = await request(app)
        .put(\`/api/${resourceName}s/\${${resourceName}Id}\`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(updateData.name);
    });
  });

  describe('DELETE /api/${resourceName}s/:id', () => {
    it('should delete a ${resourceName}', async () => {
      const response = await request(app)
        .delete(\`/api/${resourceName}s/\${${resourceName}Id}\`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should return 404 when trying to delete non-existent ${resourceName}', async () => {
      const response = await request(app)
        .delete('/api/${resourceName}s/999999')
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });
});`;
  } else {
    return `const request = require('supertest');
const app = require('../../app');

describe('${ResourceName} API', () => {
  let ${resourceName}Id;

  describe('POST /api/${resourceName}s', () => {
    it('should create a new ${resourceName}', async () => {
      const ${resourceName}Data = {
        name: 'Test ${ResourceName}',
        email: 'test@example.com'
      };

      const response = await request(app)
        .post('/api/${resourceName}s')
        .send(${resourceName}Data)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.name).toBe(${resourceName}Data.name);
      
      ${resourceName}Id = response.body.data.id;
    });

    it('should return validation error for invalid data', async () => {
      const response = await request(app)
        .post('/api/${resourceName}s')
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
    });
  });

  describe('GET /api/${resourceName}s', () => {
    it('should get all ${resourceName}s', async () => {
      const response = await request(app)
        .get('/api/${resourceName}s')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('GET /api/${resourceName}s/:id', () => {
    it('should get a ${resourceName} by id', async () => {
      const response = await request(app)
        .get(\`/api/${resourceName}s/\${${resourceName}Id}\`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id', ${resourceName}Id);
    });

    it('should return 404 for non-existent ${resourceName}', async () => {
      const response = await request(app)
        .get('/api/${resourceName}s/999999')
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/${resourceName}s/:id', () => {
    it('should update a ${resourceName}', async () => {
      const updateData = {
        name: 'Updated ${ResourceName}'
      };

      const response = await request(app)
        .put(\`/api/${resourceName}s/\${${resourceName}Id}\`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(updateData.name);
    });
  });

  describe('DELETE /api/${resourceName}s/:id', () => {
    it('should delete a ${resourceName}', async () => {
      const response = await request(app)
        .delete(\`/api/${resourceName}s/\${${resourceName}Id}\`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should return 404 when trying to delete non-existent ${resourceName}', async () => {
      const response = await request(app)
        .delete('/api/${resourceName}s/999999')
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });
});`;
  }
}
