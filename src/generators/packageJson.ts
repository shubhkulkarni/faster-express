import path from "path";
import fs from "fs-extra";
import { ProjectConfig } from "../types";
import { getDatabaseDependencies, getAuthDependencies } from "./project";

export async function generatePackageJson(
  config: ProjectConfig,
  projectPath: string
): Promise<void> {
  const packageJson = {
    name: config.name,
    version: "1.0.0",
    description: "",
    main: config.language === "ts" ? "dist/server.js" : "src/server.js",
    scripts: generateScripts(config),
    keywords: [],
    author: "",
    license: "ISC",
    dependencies: await generateDependencies(config),
    devDependencies:
      config.language === "ts" ? await generateDevDependencies(config) : {},
  };

  await fs.writeJson(path.join(projectPath, "package.json"), packageJson, {
    spaces: 2,
  });
}

function generateScripts(config: ProjectConfig): Record<string, string> {
  const scripts: Record<string, string> = {};

  if (config.language === "ts") {
    scripts.build = "tsc";
    scripts.start = "node dist/server.js";
    scripts.dev = "ts-node src/server.ts";
    scripts["dev:watch"] = "ts-node --transpile-only src/server.ts";
  } else {
    scripts.start = "node src/server.js";
    scripts.dev = "nodemon src/server.js";
  }

  if (config.testing) {
    scripts.test = "jest";
    scripts["test:watch"] = "jest --watch";
    scripts["test:coverage"] = "jest --coverage";
  }

  if (config.eslint) {
    scripts.lint =
      config.language === "ts" ? "eslint src/**/*.ts" : "eslint src/**/*.js";
    scripts["lint:fix"] =
      config.language === "ts"
        ? "eslint src/**/*.ts --fix"
        : "eslint src/**/*.js --fix";
  }

  if (config.prettier) {
    scripts.format =
      config.language === "ts"
        ? "prettier --write src/**/*.ts"
        : "prettier --write src/**/*.js";
  }

  if (config.orm === "prisma") {
    scripts["db:generate"] = "prisma generate";
    scripts["db:push"] = "prisma db push";
    scripts["db:migrate"] = "prisma migrate dev";
    scripts["db:studio"] = "prisma studio";
  }

  return scripts;
}

async function generateDependencies(
  config: ProjectConfig
): Promise<Record<string, string>> {
  const deps: Record<string, string> = {
    express: "^4.18.2",
    cors: "^2.8.5",
    helmet: "^7.0.0",
    "express-rate-limit": "^6.10.0",
  };

  // Add validation
  deps["express-validator"] = "^7.0.1";

  // Database dependencies
  const dbDeps = getDatabaseDependencies(config.database, config.orm);
  dbDeps.dependencies.forEach((dep) => {
    deps[dep] = "latest";
  });

  // Auth dependencies
  const authDeps = getAuthDependencies(config.auth);
  authDeps.dependencies.forEach((dep) => {
    deps[dep] = "latest";
  });

  // Swagger dependencies
  if (config.swagger.enabled) {
    deps["swagger-ui-express"] = "^5.0.0";
    deps["swagger-jsdoc"] = "^6.2.8";
    deps["yamljs"] = "^0.3.0";
  }

  // Environment variables
  deps.dotenv = "^16.3.1";

  return deps;
}

async function generateDevDependencies(
  config: ProjectConfig
): Promise<Record<string, string>> {
  const devDeps: Record<string, string> = {};

  if (config.language === "ts") {
    devDeps.typescript = "^5.1.6";
    devDeps["ts-node"] = "^10.9.1";
    devDeps["@types/node"] = "^20.5.0";
    devDeps["@types/express"] = "^4.17.17";
    devDeps["@types/cors"] = "^2.8.13";

    // Swagger TypeScript types
    if (config.swagger.enabled) {
      devDeps["@types/swagger-ui-express"] = "^4.1.3";
      devDeps["@types/swagger-jsdoc"] = "^6.0.1";
      devDeps["@types/yamljs"] = "^0.2.31";
    }
  } else {
    devDeps.nodemon = "^3.0.1";
  }

  if (config.testing) {
    if (config.language === "ts") {
      devDeps.jest = "^29.6.2";
      devDeps["@types/jest"] = "^29.5.4";
      devDeps["ts-jest"] = "^29.1.1";
    } else {
      devDeps.jest = "^29.6.2";
    }
    devDeps.supertest = "^6.3.3";
    devDeps["@types/supertest"] = "^2.0.12";
  }

  if (config.eslint) {
    devDeps.eslint = "^8.47.0";
    if (config.language === "ts") {
      devDeps["@typescript-eslint/eslint-plugin"] = "^6.4.0";
      devDeps["@typescript-eslint/parser"] = "^6.4.0";
    }
  }

  if (config.prettier) {
    devDeps.prettier = "^3.0.2";
    if (config.eslint) {
      devDeps["eslint-config-prettier"] = "^9.0.0";
      devDeps["eslint-plugin-prettier"] = "^5.0.0";
    }
  }

  // Database dev dependencies
  const dbDeps = getDatabaseDependencies(config.database, config.orm);
  dbDeps.devDependencies.forEach((dep) => {
    devDeps[dep] = "latest";
  });

  // Auth dev dependencies
  const authDeps = getAuthDependencies(config.auth);
  authDeps.devDependencies.forEach((dep) => {
    devDeps[dep] = "latest";
  });

  return devDeps;
}
