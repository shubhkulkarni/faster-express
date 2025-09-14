import path from 'path';
import fs from 'fs-extra';
import { ProjectConfig, DatabaseDependencies } from '../types';
import { generatePackageJson } from './packageJson';
import { generateAppFiles } from './appFiles';
import { generateResourceFiles } from './resourceFiles';
import { generateConfigFiles } from './configFiles';

export async function generateProject(config: ProjectConfig, projectPath: string): Promise<void> {
  // Generate package.json
  await generatePackageJson(config, projectPath);

  // Generate app files (app.ts/js, server.ts/js)
  await generateAppFiles(config, projectPath);

  // Generate initial resource structure
  if (config.style === 'resource') {
    await generateResourceFiles(config, projectPath);
  }

  // Generate configuration files
  await generateConfigFiles(config, projectPath);

  // Create basic directory structure
  await createDirectoryStructure(config, projectPath);
}

async function createDirectoryStructure(config: ProjectConfig, projectPath: string): Promise<void> {
  const srcPath = path.join(projectPath, 'src');
  
  // Basic directories
  await fs.ensureDir(path.join(srcPath, 'middleware'));
  await fs.ensureDir(path.join(srcPath, 'utils'));
  await fs.ensureDir(path.join(srcPath, 'types'));

  if (config.style === 'resource') {
    await fs.ensureDir(path.join(srcPath, 'resources'));
  } else {
    await fs.ensureDir(path.join(srcPath, 'controllers'));
    await fs.ensureDir(path.join(srcPath, 'services'));
    await fs.ensureDir(path.join(srcPath, 'routes'));
  }

  if (config.database) {
    await fs.ensureDir(path.join(srcPath, 'models'));
    if (config.orm === 'prisma') {
      await fs.ensureDir(path.join(projectPath, 'prisma'));
    }
  }

  if (config.testing) {
    await fs.ensureDir(path.join(projectPath, 'tests'));
  }
}

export function getDatabaseDependencies(database?: string, orm?: string): DatabaseDependencies {
  const deps: DatabaseDependencies = {
    dependencies: [],
    devDependencies: []
  };

  if (!database || database === 'none') {
    return deps;
  }

  switch (orm) {
    case 'mongoose':
      deps.dependencies.push('mongoose');
      deps.devDependencies.push('@types/mongoose');
      break;
    case 'prisma':
      deps.dependencies.push('@prisma/client');
      deps.devDependencies.push('prisma');
      break;
    case 'sequelize':
      deps.dependencies.push('sequelize');
      deps.devDependencies.push('@types/sequelize');
      if (database === 'postgres') {
        deps.dependencies.push('pg');
        deps.devDependencies.push('@types/pg');
      }
      break;
    case 'typeorm':
      deps.dependencies.push('typeorm', 'reflect-metadata');
      if (database === 'postgres') {
        deps.dependencies.push('pg');
        deps.devDependencies.push('@types/pg');
      } else if (database === 'mongodb') {
        deps.dependencies.push('mongodb');
      }
      break;
  }

  return deps;
}

export function getAuthDependencies(auth?: string): DatabaseDependencies {
  const deps: DatabaseDependencies = {
    dependencies: [],
    devDependencies: []
  };

  if (!auth || auth === 'none') {
    return deps;
  }

  switch (auth) {
    case 'jwt':
      deps.dependencies.push('jsonwebtoken', 'bcryptjs');
      deps.devDependencies.push('@types/jsonwebtoken', '@types/bcryptjs');
      break;
    case 'passport':
      deps.dependencies.push('passport', 'passport-local', 'express-session');
      deps.devDependencies.push('@types/passport', '@types/passport-local', '@types/express-session');
      break;
  }

  return deps;
}
