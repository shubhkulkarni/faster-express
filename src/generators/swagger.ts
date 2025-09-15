import fs from "fs-extra";
import path from "path";
import { ProjectConfig } from "../types";

export async function generateSwaggerConfig(
  config: ProjectConfig,
  projectPath: string
): Promise<void> {
  if (!config.swagger.enabled) return;

  const srcPath = path.join(projectPath, "src");
  const docsPath = path.join(srcPath, "docs");

  // Ensure docs directory exists
  await fs.ensureDir(docsPath);

  // Generate swagger configuration file
  await generateSwaggerSetup(config, srcPath);

  // Generate swagger.json spec file
  await generateSwaggerSpec(config, docsPath);

  // Generate swagger utility functions
  await generateSwaggerUtils(config, path.join(srcPath, "utils"));

  // Generate swagger middleware
  await generateSwaggerMiddleware(config, path.join(srcPath, "middleware"));
}

async function generateSwaggerSetup(
  config: ProjectConfig,
  srcPath: string
): Promise<void> {
  const isTypeScript = config.language === "ts";
  const ext = isTypeScript ? "ts" : "js";

  const swaggerSetupContent = `${isTypeScript ? "import express from 'express';\nimport swaggerUi from 'swagger-ui-express';\nimport swaggerJSDoc from 'swagger-jsdoc';\nimport YAML from 'yamljs';\nimport path from 'path';\n\n" : "const express = require('express');\nconst swaggerUi = require('swagger-ui-express');\nconst swaggerJSDoc = require('swagger-jsdoc');\nconst YAML = require('yamljs');\nconst path = require('path');\n\n"}interface SwaggerOptions {
  title?: string;
  theme?: string;
  customCss?: string;
}

export class SwaggerSetup {
  private app: express.Application;
  private spec: any;
  private options: SwaggerOptions;

  constructor(app: express.Application, options: SwaggerOptions = {}) {
    this.app = app;
    this.options = {
      title: '${config.swagger.title}',
      theme: '${config.swagger.theme}',
      ...options
    };
    this.loadSpec();
  }

  private loadSpec(): void {
    try {
      // Use swagger-jsdoc to generate spec from JSDoc comments
      const options = {
        definition: this.getBasicSpec(),
        apis: [
          path.join(__dirname, './resources/**/*.${ext}'),
          path.join(__dirname, './app.${ext}'),
        ],
      };

      this.spec = swaggerJSDoc(options);
      
      // Also try to load additional specs from files if they exist
      const yamlPath = path.join(__dirname, './docs/swagger.yaml');
      const jsonPath = path.join(__dirname, './docs/swagger.json');
      
      if (require('fs').existsSync(yamlPath)) {
        const fileSpec = YAML.load(yamlPath);
        this.spec = this.mergeSpecs(this.spec, fileSpec);
      } else if (require('fs').existsSync(jsonPath)) {
        const fileSpec = require(jsonPath);
        this.spec = this.mergeSpecs(this.spec, fileSpec);
      }
    } catch (error) {
      console.error('Error loading Swagger spec:', error);
      console.warn('Falling back to basic spec. Make sure swagger-jsdoc is installed.');
      this.spec = this.getBasicSpec();
    }
  }

  private mergeSpecs(generated: any, fileSpec: any): any {
    return {
      ...generated,
      paths: { ...generated.paths, ...fileSpec.paths },
      components: {
        ...generated.components,
        schemas: { ...generated.components?.schemas, ...fileSpec.components?.schemas },
        securitySchemes: { ...generated.components?.securitySchemes, ...fileSpec.components?.securitySchemes }
      }
    };
  }

  private getBasicSpec(): any {
    return {
      openapi: '3.0.0',
      info: {
        title: this.options.title || '${config.swagger.title}',
        description: '${config.swagger.description}',
        version: '${config.swagger.version}',
      },
      servers: [
        {
          url: 'http://localhost:3000',
          description: 'Development server'
        }
      ],
      paths: {},
      components: {
        schemas: {},
        securitySchemes: {}
      }
    };
  }

  private getSwaggerUiOptions(): any {
    const options: any = {
      customSiteTitle: this.options.title,
      swaggerOptions: {
        docExpansion: 'none',
        filter: true,
        showRequestHeaders: true,
      }
    };

    // Apply theme-specific customizations
    if (this.options.theme === 'dark') {
      options.customCss = \`
        .swagger-ui .topbar { display: none; }
        .swagger-ui { background-color: #1a1a1a; }
        .swagger-ui .scheme-container { background-color: #2d2d2d; }
        .swagger-ui .info { background-color: #2d2d2d; }
        .swagger-ui .info .title { color: #fff; }
      \`;
    } else if (this.options.theme === 'material') {
      options.customCss = \`
        .swagger-ui .topbar { background-color: #1976d2; }
        .swagger-ui .btn.authorize { background-color: #1976d2; border-color: #1976d2; }
        .swagger-ui .btn.execute { background-color: #4caf50; border-color: #4caf50; }
      \`;
    }

    return options;
  }

  public setup(): void {
    const swaggerUiOptions = this.getSwaggerUiOptions();
    
    // Serve swagger documentation
    this.app.use('${config.swagger.path}', swaggerUi.serve);
    this.app.get('${config.swagger.path}', swaggerUi.setup(this.spec, swaggerUiOptions));
    
    // Serve raw spec as JSON
    this.app.get('${config.swagger.path}/json', (req, res) => {
      res.json(this.spec);
    });
    
    console.log(\`📚 API Documentation available at: http://localhost:3000${config.swagger.path}\`);
  }

  public updateSpec(newSpec: any): void {
    this.spec = { ...this.spec, ...newSpec };
  }

  public getSpec(): any {
    return this.spec;
  }
}

${isTypeScript ? "export default SwaggerSetup;" : "module.exports = SwaggerSetup;"}
`;

  await fs.writeFile(path.join(srcPath, `swagger.${ext}`), swaggerSetupContent);
}

async function generateSwaggerSpec(
  config: ProjectConfig,
  docsPath: string
): Promise<void> {
  const swaggerSpec = {
    openapi: "3.0.0",
    info: {
      title: config.swagger.title,
      description: config.swagger.description,
      version: config.swagger.version,
      contact: {
        name: "API Support",
        email: "support@example.com",
      },
      license: {
        name: "MIT",
        url: "https://opensource.org/licenses/MIT",
      },
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Development server",
      },
      {
        url: "https://api.example.com",
        description: "Production server",
      },
    ],
    paths: {
      "/health": {
        get: {
          tags: ["Health"],
          summary: "Health check endpoint",
          description: "Returns the health status of the API",
          responses: {
            "200": {
              description: "API is healthy",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      status: { type: "string", example: "ok" },
                      timestamp: { type: "string", format: "date-time" },
                      uptime: { type: "number", example: 12345 },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    components: {
      schemas: {
        Error: {
          type: "object",
          required: ["message"],
          properties: {
            message: {
              type: "string",
              description: "Error message",
            },
            code: {
              type: "string",
              description: "Error code",
            },
            details: {
              type: "string",
              description: "Additional error details",
            },
          },
        },
        SuccessResponse: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: true,
            },
            data: {
              type: "object",
              description: "Response data",
            },
          },
        },
      },
      responses: {
        Success: {
          description: "Successful operation",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/SuccessResponse" },
            },
          },
        },
        BadRequest: {
          description: "Bad request",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" },
            },
          },
        },
        Unauthorized: {
          description: "Unauthorized",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" },
            },
          },
        },
        Forbidden: {
          description: "Forbidden",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" },
            },
          },
        },
        NotFound: {
          description: "Resource not found",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" },
            },
          },
        },
        InternalServerError: {
          description: "Internal server error",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" },
            },
          },
        },
      },
      securitySchemes: {},
    },
  };

  // Add authentication schemes if auth is enabled
  if (config.auth && config.auth !== "none") {
    if (config.auth === "jwt") {
      (swaggerSpec.components.securitySchemes as any).bearerAuth = {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "JWT Authorization header using the Bearer scheme",
      };
    }
  }

  // Write both JSON and YAML versions
  await fs.writeFile(
    path.join(docsPath, "swagger.json"),
    JSON.stringify(swaggerSpec, null, 2)
  );

  // Generate YAML version for easier editing
  const yamlContent = `openapi: 3.0.0
info:
  title: ${config.swagger.title}
  description: ${config.swagger.description}
  version: ${config.swagger.version}
  contact:
    name: API Support
    email: support@example.com
  license:
    name: MIT
    url: https://opensource.org/licenses/MIT

servers:
  - url: http://localhost:3000
    description: Development server
  - url: https://api.example.com
    description: Production server

paths:
  /health:
    get:
      tags: [Health]
      summary: Health check endpoint
      description: Returns the health status of the API
      responses:
        '200':
          description: API is healthy
          content:
            application/json:
              schema:
                type: object
                properties:
                  status:
                    type: string
                    example: ok
                  timestamp:
                    type: string
                    format: date-time
                  uptime:
                    type: number
                    example: 12345

components:
  schemas:
    Error:
      type: object
      required: [message]
      properties:
        message:
          type: string
          description: Error message
        code:
          type: string
          description: Error code
        details:
          type: object
          description: Additional error details
    
    SuccessResponse:
      type: object
      properties:
        success:
          type: boolean
          example: true
        message:
          type: string
          example: Operation completed successfully
        data:
          type: object
          description: Response data

  responses:
    BadRequest:
      description: Bad request
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Error'
    Unauthorized:
      description: Unauthorized  
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Error'
    Forbidden:
      description: Forbidden
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Error'
    NotFound:
      description: Resource not found
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Error'
    InternalServerError:
      description: Internal server error
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Error'
${
  config.auth && config.auth !== "none"
    ? `
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
      description: JWT Authorization header using the Bearer scheme`
    : ""
}
`;

  await fs.writeFile(path.join(docsPath, "swagger.yaml"), yamlContent);
}

async function generateSwaggerUtils(
  config: ProjectConfig,
  utilsPath: string
): Promise<void> {
  const isTypeScript = config.language === "ts";
  const ext = isTypeScript ? "ts" : "js";

  await fs.ensureDir(utilsPath);

  const swaggerUtilsContent = `${isTypeScript ? "/**\n * Swagger API Documentation Utilities\n * \n * This file contains helper functions and decorators to make API documentation easier.\n * Use these utilities to automatically generate and maintain your API documentation.\n */\n\n" : ""}${isTypeScript ? "import { Request, Response, NextFunction } from 'express';\n\n" : "const express = require('express');\n\n"}// Swagger documentation helpers
export const SwaggerHelpers = {
  /**
   * Generate OpenAPI schema for a model
   */
  generateSchema(model${isTypeScript ? ": any" : ""}, options${isTypeScript ? ": any" : ""} = {}) {
    const schema${isTypeScript ? ": any" : ""} = {
      type: 'object',
      properties: {},
      required: [],
      ...options
    };

    if (typeof model === 'object' && model !== null) {
      Object.keys(model).forEach(key => {
        const value = model[key];
        const type = typeof value;
        
        schema.properties[key] = this.getPropertySchema(value, type);
        
        if (options.required && options.required.includes(key)) {
          schema.required.push(key);
        }
      });
    }

    return schema;
  },

  /**
   * Get property schema based on value and type
   */
  getPropertySchema(value${isTypeScript ? ": any" : ""}, type${isTypeScript ? ": string" : ""}) {
    switch (type) {
      case 'string':
        return {
          type: 'string',
          example: value
        };
      case 'number':
        return {
          type: 'number',
          example: value
        };
      case 'boolean':
        return {
          type: 'boolean',
          example: value
        };
      case 'object':
        if (Array.isArray(value)) {
          return {
            type: 'array',
            items: value.length > 0 ? this.getPropertySchema(value[0], typeof value[0]) : { type: 'string' }
          };
        }
        return {
          type: 'object',
          properties: this.generateSchema(value).properties
        };
      default:
        return {
          type: 'string',
          example: String(value)
        };
    }
  },

  /**
   * Generate response schema
   */
  responseSchema(data${isTypeScript ? ": any" : ""}, message${isTypeScript ? ": string" : ""} = 'Success') {
    return {
      type: 'object',
      properties: {
        success: {
          type: 'boolean',
          example: true
        },
        message: {
          type: 'string',
          example: message
        },
        data: this.generateSchema(data)
      }
    };
  },

  /**
   * Generate error response schema
   */
  errorSchema(message${isTypeScript ? ": string" : ""} = 'Error occurred', code${isTypeScript ? ": string" : ""} = 'ERROR') {
    return {
      type: 'object',
      properties: {
        success: {
          type: 'boolean',
          example: false
        },
        message: {
          type: 'string',
          example: message
        },
        code: {
          type: 'string',
          example: code
        },
        details: {
          type: 'object',
          description: 'Additional error details'
        }
      }
    };
  }
};

/**
 * Middleware to add OpenAPI documentation to routes
 */
export function apiDoc(documentation${isTypeScript ? ": any" : ""}) {
  return function(target${isTypeScript ? ": any" : ""}, propertyKey${isTypeScript ? ": string" : ""}, descriptor${isTypeScript ? ": PropertyDescriptor" : ""}) {
    // Store documentation metadata on the method
    if (!target._apiDocs) {
      target._apiDocs = {};
    }
    target._apiDocs[propertyKey] = documentation;
    
    return descriptor;
  };
}

/**
 * Route documentation decorator
 */
export function swaggerRoute(config${isTypeScript ? ": any" : ""}) {
  return function(req${isTypeScript ? ": Request" : ""}, res${isTypeScript ? ": Response" : ""}, next${isTypeScript ? ": NextFunction" : ""}) {
    // Add swagger metadata to request
    req._swaggerConfig = config;
    next();
  };
}

/**
 * Generate documentation for CRUD operations
 */
export function generateCRUDDocs(resourceName${isTypeScript ? ": string" : ""}, schema${isTypeScript ? ": any" : ""}) {
  const capitalizedName = resourceName.charAt(0).toUpperCase() + resourceName.slice(1);
  
  return {
    // GET all
    list: {
      tags: [capitalizedName],
      summary: \`Get all \${resourceName}s\`,
      description: \`Retrieve a list of all \${resourceName}s\`,
      responses: {
        '200': {
          description: 'Successful response',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  data: {
                    type: 'array',
                    items: schema
                  },
                  total: { type: 'number', example: 10 },
                  page: { type: 'number', example: 1 },
                  limit: { type: 'number', example: 10 }
                }
              }
            }
          }
        },
        '500': { $ref: '#/components/responses/InternalServerError' }
      }
    },

    // GET by ID
    getById: {
      tags: [capitalizedName],
      summary: \`Get \${resourceName} by ID\`,
      description: \`Retrieve a specific \${resourceName} by its ID\`,
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          schema: { type: 'string' },
          description: \`The \${resourceName} ID\`
        }
      ],
      responses: {
        '200': {
          description: 'Successful response',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  data: schema
                }
              }
            }
          }
        },
        '404': { $ref: '#/components/responses/NotFound' },
        '500': { $ref: '#/components/responses/InternalServerError' }
      }
    },

    // POST create
    create: {
      tags: [capitalizedName],
      summary: \`Create new \${resourceName}\`,
      description: \`Create a new \${resourceName}\`,
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: schema
          }
        }
      },
      responses: {
        '201': {
          description: 'Created successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: \`\${capitalizedName} created successfully\` },
                  data: schema
                }
              }
            }
          }
        },
        '400': { $ref: '#/components/responses/BadRequest' },
        '500': { $ref: '#/components/responses/InternalServerError' }
      }
    },

    // PUT update
    update: {
      tags: [capitalizedName],
      summary: \`Update \${resourceName}\`,
      description: \`Update an existing \${resourceName}\`,
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          schema: { type: 'string' },
          description: \`The \${resourceName} ID\`
        }
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: schema
          }
        }
      },
      responses: {
        '200': {
          description: 'Updated successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: \`\${capitalizedName} updated successfully\` },
                  data: schema
                }
              }
            }
          }
        },
        '400': { $ref: '#/components/responses/BadRequest' },
        '404': { $ref: '#/components/responses/NotFound' },
        '500': { $ref: '#/components/responses/InternalServerError' }
      }
    },

    // DELETE
    delete: {
      tags: [capitalizedName],
      summary: \`Delete \${resourceName}\`,
      description: \`Delete a \${resourceName} by ID\`,
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          schema: { type: 'string' },
          description: \`The \${resourceName} ID\`
        }
      ],
      responses: {
        '200': {
          description: 'Deleted successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: \`\${capitalizedName} deleted successfully\` }
                }
              }
            }
          }
        },
        '404': { $ref: '#/components/responses/NotFound' },
        '500': { $ref: '#/components/responses/InternalServerError' }
      }
    }
  };
}

${isTypeScript ? "export default SwaggerHelpers;" : "module.exports = { SwaggerHelpers, apiDoc, swaggerRoute, generateCRUDDocs };"}
`;

  await fs.writeFile(
    path.join(utilsPath, `swagger.${ext}`),
    swaggerUtilsContent
  );
}

async function generateSwaggerMiddleware(
  config: ProjectConfig,
  middlewarePath: string
): Promise<void> {
  const isTypeScript = config.language === "ts";
  const ext = isTypeScript ? "ts" : "js";

  await fs.ensureDir(middlewarePath);

  const swaggerMiddlewareContent = `${isTypeScript ? "import { Request, Response, NextFunction } from 'express';\nimport fs from 'fs';\nimport path from 'path';\n\n" : "const fs = require('fs');\nconst path = require('path');\n\n"}/**
 * Middleware to automatically update Swagger documentation
 */
${isTypeScript ? "interface SwaggerRequest extends Request {\n  _swaggerConfig?: any;\n}\n\n" : ""}export function swaggerLogger(req${isTypeScript ? ": SwaggerRequest" : ""}, res${isTypeScript ? ": Response" : ""}, next${isTypeScript ? ": NextFunction" : ""}) {
  // Log API usage for documentation purposes
  const startTime = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const logEntry = {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration,
      timestamp: new Date().toISOString(),
      userAgent: req.get('User-Agent'),
      ip: req.ip
    };
    
    // You can extend this to automatically update API documentation
    // based on actual usage patterns
    if (process.env.NODE_ENV === 'development') {
      console.log(\`[\${req.method}] \${req.originalUrl} - \${res.statusCode} (\${duration}ms)\`);
    }
  });
  
  next();
}

/**
 * Middleware to validate against Swagger schema
 */
export function validateSwaggerSchema(schemaName${isTypeScript ? ": string" : ""}) {
  return function(req${isTypeScript ? ": Request" : ""}, res${isTypeScript ? ": Response" : ""}, next${isTypeScript ? ": NextFunction" : ""}) {
    // Load swagger spec and validate request against schema
    try {
      const specPath = path.join(__dirname, '../docs/swagger.json');
      if (fs.existsSync(specPath)) {
        const spec = JSON.parse(fs.readFileSync(specPath, 'utf8'));
        const schema = spec.components?.schemas?.[schemaName];
        
        if (schema && req.body) {
          // Basic validation - you can extend this with a proper JSON schema validator
          const isValid = validateObject(req.body, schema);
          if (!isValid) {
            return res.status(400).json({
              success: false,
              message: 'Request body does not match expected schema',
              schema: schemaName
            });
          }
        }
      }
    } catch (error) {
      console.warn('Swagger schema validation error:', error);
    }
    
    next();
  };
}

/**
 * Basic object validation against schema
 */
function validateObject(obj${isTypeScript ? ": any" : ""}, schema${isTypeScript ? ": any" : ""}): boolean {
  if (!schema || !obj) return true;
  
  // Check required properties
  if (schema.required) {
    for (const prop of schema.required) {
      if (!(prop in obj)) {
        return false;
      }
    }
  }
  
  // Check property types
  if (schema.properties) {
    for (const [key, value] of Object.entries(obj)) {
      const propSchema = schema.properties[key];
      if (propSchema && !validateProperty(value, propSchema)) {
        return false;
      }
    }
  }
  
  return true;
}

/**
 * Validate individual property against schema
 */
function validateProperty(value${isTypeScript ? ": any" : ""}, schema${isTypeScript ? ": any" : ""}): boolean {
  if (!schema) return true;
  
  const type = typeof value;
  
  switch (schema.type) {
    case 'string':
      return type === 'string';
    case 'number':
      return type === 'number';
    case 'boolean':
      return type === 'boolean';
    case 'array':
      return Array.isArray(value);
    case 'object':
      return type === 'object' && value !== null && !Array.isArray(value);
    default:
      return true;
  }
}

/**
 * Middleware to add CORS headers for Swagger UI
 */
export function swaggerCors(req${isTypeScript ? ": Request" : ""}, res${isTypeScript ? ": Response" : ""}, next${isTypeScript ? ": NextFunction" : ""}) {
  // Allow Swagger UI to access the API
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
}

${isTypeScript ? "export default { swaggerLogger, validateSwaggerSchema, swaggerCors };" : "module.exports = { swaggerLogger, validateSwaggerSchema, swaggerCors };"}
`;

  await fs.writeFile(
    path.join(middlewarePath, `swagger.${ext}`),
    swaggerMiddlewareContent
  );
}
