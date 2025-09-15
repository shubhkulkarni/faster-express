# Swagger Documentation Guide for faster-express

This guide explains how to effectively use Swagger/OpenAPI documentation with projects created by faster-express.

## Table of Contents

- [Getting Started](#getting-started)
- [Swagger Utilities](#swagger-utilities)
- [Documenting Endpoints](#documenting-endpoints)
- [Schemas and Components](#schemas-and-components)
- [Authentication Documentation](#authentication-documentation)
- [Error Handling](#error-handling)
- [Advanced Features](#advanced-features)

## Getting Started

### Enable Swagger in New Projects

```bash
# Basic Swagger setup
faster-express create my-api --with-swagger

# Customized Swagger setup
faster-express create my-api \
  --with-swagger \
  --swagger-title "My Amazing API" \
  --swagger-path "/docs" \
  --swagger-theme material
```

### Interactive Setup

```bash
faster-express create my-api
# When prompted:
? Would you like to include API documentation? Yes
? What should be the API documentation title? My API
? What path should serve the API documentation? /api-docs
? Which Swagger UI theme would you prefer? Material - Modern and clean
? Generate example request/response schemas in documentation? Yes
```

## Swagger Utilities

The generated `src/utils/swagger.ts` provides powerful utilities for consistent API documentation:

### createApiResponse

Creates standardized success response documentation:

```typescript
import { createApiResponse } from "../utils/swagger";

const userResponse = createApiResponse("User retrieved successfully", {
  id: "string",
  name: "string",
  email: "string",
  createdAt: "string",
  updatedAt: "string",
});

// Use in your Swagger comments:
/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     responses:
 *       200:
 *         $ref: '#/components/responses/UserResponse'
 */
```

### createApiError

Creates standardized error response documentation:

```typescript
import { createApiError } from "../utils/swagger";

const notFoundError = createApiError(404, "User not found", "USER_NOT_FOUND");
const validationError = createApiError(
  400,
  "Validation failed",
  "VALIDATION_ERROR"
);

// Use in your Swagger comments:
/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     responses:
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
```

### createApiSchema

Creates reusable schema definitions:

```typescript
import { createApiSchema } from "../utils/swagger";

const createUserSchema = createApiSchema({
  name: { type: "string", required: true, minLength: 2, maxLength: 50 },
  email: { type: "string", required: true, format: "email" },
  age: { type: "integer", minimum: 18, maximum: 120 },
  role: { type: "string", enum: ["user", "admin"], default: "user" },
});

// Reference in your endpoints:
/**
 * @swagger
 * /api/users:
 *   post:
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateUser'
 */
```

## Documenting Endpoints

### Basic Endpoint Documentation

```typescript
/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users
 *     description: Retrieve a paginated list of all users
 *     tags: [Users]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of users per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search users by name or email
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
export const getAllUsers = async (req: Request, res: Response) => {
  // Implementation
};
```

### POST Endpoint with Request Body

```typescript
/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Create a new user
 *     description: Create a new user account with validation
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateUser'
 *           examples:
 *             user:
 *               summary: Example user
 *               value:
 *                 name: "John Doe"
 *                 email: "john@example.com"
 *                 age: 30
 *                 role: "user"
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User created successfully"
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       409:
 *         description: User already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export const createUser = async (req: Request, res: Response) => {
  // Implementation
};
```

### Custom Endpoint with Multiple Response Types

```typescript
/**
 * @swagger
 * /api/users/{id}/activate:
 *   patch:
 *     summary: Activate user account
 *     description: Activate a previously deactivated user account
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *       - in: header
 *         name: Authorization
 *         required: true
 *         schema:
 *           type: string
 *         description: Bearer token
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *                 description: Reason for activation
 *                 example: "Account verified"
 *     responses:
 *       200:
 *         description: User activated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User activated successfully"
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       409:
 *         description: User already active
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *     security:
 *       - bearerAuth: []
 */
export const activateUser = async (req: Request, res: Response) => {
  // Implementation
};
```

## Schemas and Components

### Defining Reusable Schemas

Add schemas to your `src/docs/swagger.json` or let the utilities generate them:

```typescript
// In your controller or utils
import { addComponentSchema } from "../utils/swagger";

// Define a user schema
addComponentSchema("User", {
  type: "object",
  properties: {
    id: {
      type: "string",
      description: "Unique user identifier",
      example: "64a7b8c9d1e2f3g4h5i6j7k8",
    },
    name: {
      type: "string",
      description: "User full name",
      example: "John Doe",
    },
    email: {
      type: "string",
      format: "email",
      description: "User email address",
      example: "john@example.com",
    },
    role: {
      type: "string",
      enum: ["user", "admin", "moderator"],
      description: "User role",
      example: "user",
    },
    isActive: {
      type: "boolean",
      description: "Whether the user account is active",
      example: true,
    },
    createdAt: {
      type: "string",
      format: "date-time",
      description: "Account creation timestamp",
      example: "2023-01-15T10:30:00Z",
    },
    updatedAt: {
      type: "string",
      format: "date-time",
      description: "Last update timestamp",
      example: "2023-01-20T14:45:00Z",
    },
  },
  required: [
    "id",
    "name",
    "email",
    "role",
    "isActive",
    "createdAt",
    "updatedAt",
  ],
});

// Define pagination schema
addComponentSchema("Pagination", {
  type: "object",
  properties: {
    page: {
      type: "integer",
      description: "Current page number",
      example: 1,
    },
    limit: {
      type: "integer",
      description: "Items per page",
      example: 10,
    },
    total: {
      type: "integer",
      description: "Total number of items",
      example: 150,
    },
    pages: {
      type: "integer",
      description: "Total number of pages",
      example: 15,
    },
  },
  required: ["page", "limit", "total", "pages"],
});
```

## Authentication Documentation

### JWT Bearer Authentication

```typescript
// Add to your main Swagger setup
import { addSecurityScheme } from "../utils/swagger";

addSecurityScheme("bearerAuth", {
  type: "http",
  scheme: "bearer",
  bearerFormat: "JWT",
  description: "JWT Authorization header using the Bearer scheme",
});

// Use in protected endpoints
/**
 * @swagger
 * /api/users/profile:
 *   get:
 *     summary: Get current user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
```

### API Key Authentication

```typescript
addSecurityScheme("apiKey", {
  type: "apiKey",
  in: "header",
  name: "X-API-Key",
  description: "API key for authentication",
});

/**
 * @swagger
 * /api/admin/stats:
 *   get:
 *     summary: Get admin statistics
 *     tags: [Admin]
 *     security:
 *       - apiKey: []
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 */
```

## Error Handling

### Standard Error Responses

```typescript
import { createStandardErrorResponses } from "../utils/swagger";

// Add standard error responses to your Swagger setup
createStandardErrorResponses();

// This creates:
// - BadRequest (400)
// - Unauthorized (401)
// - Forbidden (403)
// - NotFound (404)
// - ValidationError (422)
// - InternalServerError (500)
```

### Custom Error Responses

```typescript
import { addComponentResponse } from "../utils/swagger";

addComponentResponse("RateLimitExceeded", {
  description: "Rate limit exceeded",
  content: {
    "application/json": {
      schema: {
        type: "object",
        properties: {
          error: {
            type: "string",
            example: "Rate limit exceeded",
          },
          retryAfter: {
            type: "integer",
            description: "Seconds to wait before retry",
            example: 60,
          },
        },
      },
    },
  },
});
```

## Advanced Features

### File Upload Documentation

```typescript
/**
 * @swagger
 * /api/users/{id}/avatar:
 *   post:
 *     summary: Upload user avatar
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               avatar:
 *                 type: string
 *                 format: binary
 *                 description: Avatar image file
 *     responses:
 *       200:
 *         description: Avatar uploaded successfully
 */
```

### Webhooks Documentation

```typescript
/**
 * @swagger
 * /webhooks/user-created:
 *   post:
 *     summary: User created webhook
 *     description: Called when a new user is created
 *     tags: [Webhooks]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               event:
 *                 type: string
 *                 example: "user.created"
 *               data:
 *                 $ref: '#/components/schemas/User'
 *               timestamp:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Webhook received successfully
 */
```

### Multiple Content Types

```typescript
/**
 * @swagger
 * /api/users/export:
 *   get:
 *     summary: Export users
 *     tags: [Users]
 *     parameters:
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [json, csv, xml]
 *           default: json
 *     responses:
 *       200:
 *         description: Users exported successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *           text/csv:
 *             schema:
 *               type: string
 *           application/xml:
 *             schema:
 *               type: string
 */
```

## Best Practices

1. **Consistent Tagging**: Use meaningful tags to group related endpoints
2. **Detailed Descriptions**: Provide clear, helpful descriptions for all endpoints
3. **Example Values**: Include realistic example values in schemas
4. **Error Documentation**: Document all possible error responses
5. **Schema Reuse**: Use components/schemas for reusable data structures
6. **Security Documentation**: Clearly document authentication requirements
7. **Parameter Validation**: Document validation rules and constraints
8. **Response Examples**: Provide example responses for better understanding

## Accessing Your Documentation

Once your server is running, visit:

- Default: `http://localhost:3000/api-docs`
- Custom path: `http://localhost:3000/your-custom-path`

The interactive documentation allows you to:

- Test endpoints directly
- See request/response examples
- Explore schema definitions
- Understand authentication requirements

Happy documenting! 🚀
