#!/usr/bin/env node

import { program } from "commander";
import chalk from "chalk";
import { createProject } from "./commands/create";
import { addResource } from "./commands/add";
import { removeResource } from "./commands/remove";
import { listResources } from "./commands/list";

// Import package.json properly
const packageJson = require("../package.json");

program
  .name("faster-express")
  .description(
    "A production-ready CLI for scaffolding resource-based Express applications"
  )
  .version(packageJson.version);

// Create command
program
  .command("create <project-name>")
  .description("Create a new Express project")
  .option("--lang <language>", "Language (ts|js)", "ts")
  .option("--pkg-manager <manager>", "Package manager (npm|yarn|pnpm)", "npm")
  .option("--style <style>", "Project style (resource|layered)", "resource")
  .option("--with-db", "Include database support")
  .option("--db <database>", "Database type (mongodb|postgres)")
  .option("--orm <orm>", "ORM/ODM (mongoose|prisma|sequelize|typeorm)")
  .option("--with-auth", "Include authentication")
  .option("--auth <type>", "Auth type (jwt|passport)")
  .option("--with-jest", "Include Jest testing")
  .option("--no-tests", "Disable test file generation")
  .option("--with-eslint", "Include ESLint")
  .option("--with-prettier", "Include Prettier")
  .option("--with-docker", "Include Docker configuration")
  .option("--no-git", "Skip Git initialization")
  .option("--light", "Create a lightweight minimal project")
  .option(
    "--boilerplate <level>",
    "Boilerplate level (minimal|full|signatures)",
    "full"
  )
  .option("--no-validation", "Skip input validation generation")
  .option("--with-swagger", "Include Swagger API documentation")
  .option("--swagger-title <title>", "API documentation title")
  .option("--swagger-path <path>", "Documentation path", "/docs")
  .action(createProject);

// Add resource command
program
  .command("add <resource-name>")
  .description("Add a new resource to the project")
  .option("--no-tests", "Skip test file generation")
  .option("--with-auth", "Include auth middleware")
  .option(
    "--boilerplate <level>",
    "Boilerplate level (minimal|full|signatures)",
    "full"
  )
  .option("--no-validation", "Skip input validation generation")
  .option("--endpoints <endpoints>", "Custom endpoints (comma-separated)")
  .action(addResource);

// Remove resource command
program
  .command("remove <resource-name>")
  .description("Remove a resource from the project")
  .action(removeResource);

// List resources command
program
  .command("list")
  .description("List all resources in the project")
  .action(listResources);

// Error handling
program.configureOutput({
  writeErr: (str: string) => process.stderr.write(chalk.red(str)),
});

program.exitOverride();

try {
  program.parse(process.argv);
} catch (err: any) {
  if (err.code !== "commander.version" && err.code !== "commander.help") {
    console.error(chalk.red("Error:"), err.message);
    process.exit(1);
  }
}
