export type Language = 'ts' | 'js';
export type PackageManager = 'npm' | 'yarn' | 'pnpm';
export type ProjectStyle = 'resource' | 'layered';
export type Database = 'mongodb' | 'postgres' | 'none';
export type ORM = 'mongoose' | 'prisma' | 'sequelize' | 'typeorm';
export type Auth = 'jwt' | 'passport' | 'none';
export type BoilerplateLevel = 'minimal' | 'full' | 'signatures';

export interface ProjectConfig {
  name: string;
  language: Language;
  packageManager: PackageManager;
  style: ProjectStyle;
  database?: Database;
  orm?: ORM;
  auth?: Auth;
  testing: boolean;
  eslint: boolean;
  prettier: boolean;
  docker: boolean;
  git: boolean;
  light: boolean;
  boilerplateLevel: BoilerplateLevel;
  includeValidation: boolean;
}

export interface ResourceConfig {
  name: string;
  generateTests: boolean;
  withAuth: boolean;
  boilerplateLevel: BoilerplateLevel;
  includeValidation: boolean;
  customEndpoints?: string[];
}

export interface CreateOptions {
  lang?: string;
  pkgManager?: string;
  style?: string;
  withDb?: boolean;
  db?: string;
  orm?: string;
  withAuth?: boolean;
  auth?: string;
  withJest?: boolean;
  tests?: boolean;
  withEslint?: boolean;
  withPrettier?: boolean;
  withDocker?: boolean;
  git?: boolean;
  light?: boolean;
  boilerplate?: string;
  validation?: boolean;
}

export interface AddOptions {
  tests?: boolean;
  withAuth?: boolean;
  boilerplate?: string;
  validation?: boolean;
  endpoints?: string[];
}

export interface DatabaseDependencies {
  dependencies: string[];
  devDependencies: string[];
}

export interface TemplateContext {
  projectName: string;
  language: string;
  hasDatabase: boolean;
  database?: string;
  orm?: string;
  hasAuth: boolean;
  auth?: string;
  hasTesting: boolean;
  hasDocker: boolean;
  packageManager: string;
}
