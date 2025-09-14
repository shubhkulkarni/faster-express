import path from 'path';
import fs from 'fs-extra';
import chalk from 'chalk';
import { promptResourceConfig } from '../utils/prompts';
import { generateResource } from '../generators/resourceFiles';
import { AddOptions, BoilerplateLevel } from '../types';

export async function addResource(resourceName: string, options: AddOptions) {
  console.log(chalk.blue(`🔄 Adding ${resourceName} resource...\n`));

  try {
    // Check if we're in a project directory
    const currentDir = process.cwd();
    const packageJsonPath = path.join(currentDir, 'package.json');
    const srcPath = path.join(currentDir, 'src');

    if (!await fs.pathExists(packageJsonPath)) {
      console.error(chalk.red('❌ No package.json found. Make sure you\'re in a project directory.'));
      process.exit(1);
    }

    if (!await fs.pathExists(srcPath)) {
      console.error(chalk.red('❌ No src directory found. Make sure you\'re in a faster-express project.'));
      process.exit(1);
    }

    // Check if resource already exists
    const resourcePath = path.join(srcPath, 'resources', resourceName);
    if (await fs.pathExists(resourcePath)) {
      console.error(chalk.red(`❌ Resource ${resourceName} already exists!`));
      process.exit(1);
    }

    // Read project configuration from package.json and tsconfig
    const packageJson = await fs.readJson(packageJsonPath);
    const hasTsConfig = await fs.pathExists(path.join(currentDir, 'tsconfig.json'));
    const hasJest = packageJson.devDependencies?.jest || packageJson.dependencies?.jest;

    const projectConfig = {
      name: packageJson.name,
      language: hasTsConfig ? 'ts' as const : 'js' as const,
      packageManager: 'npm' as const,
      style: 'resource' as const,
      database: detectDatabase(packageJson),
      orm: detectORM(packageJson),
      auth: detectAuth(packageJson),
      testing: !!hasJest,
      eslint: false,
      prettier: false,
      docker: false,
      git: false,
      light: false,
      boilerplateLevel: 'full' as BoilerplateLevel,
      includeValidation: true
    };

    // Get resource configuration
    const resourceConfig = await promptResourceConfig(resourceName, {
      tests: options.tests,
      withAuth: options.withAuth
    });

    // Generate resource files
    await generateResource(projectConfig, resourceConfig, srcPath);

    console.log(chalk.green(`\n✅ Resource ${resourceName} added successfully!\n`));
    console.log(chalk.bold('Files created:'));
    console.log(chalk.cyan(`  src/resources/${resourceName}/controller.${projectConfig.language}`));
    console.log(chalk.cyan(`  src/resources/${resourceName}/service.${projectConfig.language}`));
    console.log(chalk.cyan(`  src/resources/${resourceName}/routes.${projectConfig.language}`));
    console.log(chalk.cyan(`  src/resources/${resourceName}/validation.${projectConfig.language}`));
    console.log(chalk.cyan(`  src/resources/${resourceName}/index.${projectConfig.language}`));

    if (projectConfig.database && projectConfig.database !== 'none') {
      console.log(chalk.cyan(`  src/resources/${resourceName}/model.${projectConfig.language}`));
    }

    if (resourceConfig.generateTests) {
      console.log(chalk.cyan(`  src/resources/${resourceName}/${resourceName}.test.${projectConfig.language}`));
    }

    console.log();
    console.log(chalk.bold('Next steps:'));
    console.log(chalk.cyan(`  Your ${resourceName} API is available at /api/${resourceName}s`));
    console.log(chalk.cyan(`  Customize the model, validation, and business logic as needed`));

  } catch (error: any) {
    console.error(chalk.red('❌ Error adding resource:'), error.message);
    process.exit(1);
  }
}

function detectDatabase(packageJson: any): 'mongodb' | 'postgres' | 'none' | undefined {
  const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
  
  if (deps.mongoose) return 'mongodb';
  if (deps.pg || deps['@prisma/client']) return 'postgres';
  
  return 'none';
}

function detectORM(packageJson: any): 'mongoose' | 'prisma' | 'sequelize' | 'typeorm' | undefined {
  const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
  
  if (deps.mongoose) return 'mongoose';
  if (deps['@prisma/client'] || deps.prisma) return 'prisma';
  if (deps.sequelize) return 'sequelize';
  if (deps.typeorm) return 'typeorm';
  
  return undefined;
}

function detectAuth(packageJson: any): 'jwt' | 'passport' | 'none' | undefined {
  const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
  
  if (deps.jsonwebtoken) return 'jwt';
  if (deps.passport) return 'passport';
  
  return 'none';
}
