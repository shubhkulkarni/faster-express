import inquirer from 'inquirer';
import { ProjectConfig, CreateOptions } from '../types';

interface QuestionType {
  type: string;
  name: string;
  message: string;
  choices?: any[] | ((answers: any) => string[]);
  default?: any;
  when?: (answers: any) => boolean;
}

export async function promptProjectConfig(
  projectName: string,
  options: CreateOptions
): Promise<ProjectConfig> {
  // Check for light mode first
  const lightMode = await promptLightMode(options);
  
  if (lightMode) {
    return createLightConfig(projectName, options);
  }

  // Ask if user wants to configure more options
  const configureMore = await promptConfigureMore();
  
  if (!configureMore) {
    return createDefaultConfig(projectName, options);
  }

  // Full interactive configuration
  return await promptFullConfiguration(projectName, options);
}

async function promptLightMode(options: CreateOptions): Promise<boolean> {
  if (options.light !== undefined) {
    return options.light;
  }

  const answer = await inquirer.prompt([{
    type: 'confirm',
    name: 'light',
    message: '🚀 Do you want to create a lightweight minimal project?',
    default: false
  }]);

  return answer.light;
}

async function promptConfigureMore(): Promise<boolean> {
  const answer = await inquirer.prompt([{
    type: 'confirm',
    name: 'configureMore',
    message: '⚙️  Do you want to configure additional options (database, auth, testing, etc.)?',
    default: true
  }]);

  return answer.configureMore;
}

function createLightConfig(projectName: string, options: CreateOptions): ProjectConfig {
  return {
    name: projectName,
    language: options.lang as 'ts' | 'js' || 'ts',
    packageManager: options.pkgManager as 'npm' | 'yarn' | 'pnpm' || 'npm',
    style: 'resource',
    database: undefined,
    orm: undefined,
    auth: undefined,
    testing: false,
    eslint: false,
    prettier: false,
    docker: false,
    git: options.git !== false,
    light: true,
    boilerplateLevel: 'minimal',
    includeValidation: false
  };
}

function createDefaultConfig(projectName: string, options: CreateOptions): ProjectConfig {
  return {
    name: projectName,
    language: options.lang as 'ts' | 'js' || 'ts',
    packageManager: options.pkgManager as 'npm' | 'yarn' | 'pnpm' || 'npm',
    style: options.style as 'resource' | 'layered' || 'resource',
    database: undefined,
    orm: undefined,
    auth: undefined,
    testing: false,
    eslint: false,
    prettier: false,
    docker: false,
    git: options.git !== false,
    light: false,
    boilerplateLevel: options.boilerplate as 'minimal' | 'full' | 'signatures' || 'full',
    includeValidation: options.validation !== false
  };
}

async function promptFullConfiguration(projectName: string, options: CreateOptions): Promise<ProjectConfig> {
  const questions: QuestionType[] = [];

  // Language
  if (!options.lang) {
    questions.push({
      type: 'list',
      name: 'language',
      message: 'Which language would you like to use?',
      choices: [
        { name: 'TypeScript', value: 'ts' },
        { name: 'JavaScript', value: 'js' }
      ],
      default: 'ts'
    });
  }

  // Package Manager
  if (!options.pkgManager) {
    questions.push({
      type: 'list',
      name: 'packageManager',
      message: 'Which package manager would you like to use?',
      choices: ['npm', 'yarn', 'pnpm'],
      default: 'npm'
    });
  }

  // Project Style
  if (!options.style) {
    questions.push({
      type: 'list',
      name: 'style',
      message: 'Which project style would you prefer?',
      choices: [
        { name: 'Resource-based (Nest-like modules)', value: 'resource' },
        { name: 'Layered architecture', value: 'layered' }
      ],
      default: 'resource'
    });
  }

  // Boilerplate level
  if (!options.boilerplate) {
    questions.push({
      type: 'list',
      name: 'boilerplateLevel',
      message: 'How much boilerplate code would you like?',
      choices: [
        { name: 'Full - Complete implementation with all features', value: 'full' },
        { name: 'Signatures - Method signatures only, implement yourself', value: 'signatures' },
        { name: 'Minimal - Basic structure only', value: 'minimal' }
      ],
      default: 'full'
    });
  }

  // Validation
  if (options.validation === undefined) {
    questions.push({
      type: 'confirm',
      name: 'includeValidation',
      message: 'Include input validation (express-validator)?',
      default: true
    });
  }

  // Database
  if (options.withDb === undefined) {
    questions.push({
      type: 'list',
      name: 'database',
      message: 'Which database would you like to use?',
      choices: [
        { name: 'None', value: 'none' },
        { name: 'MongoDB', value: 'mongodb' },
        { name: 'PostgreSQL', value: 'postgres' }
      ],
      default: 'none'
    });
  }

  // ORM/ODM selection
  questions.push({
    type: 'list',
    name: 'orm',
    message: 'Which ORM/ODM would you like to use?',
    choices: (answers: any) => {
      const db = options.db || answers.database;
      if (db === 'mongodb') {
        return ['mongoose', 'prisma'];
      } else if (db === 'postgres') {
        return ['prisma', 'sequelize', 'typeorm'];
      }
      return [];
    },
    when: (answers: any) => {
      const db = options.db || answers.database;
      return db !== 'none' && !options.orm;
    }
  });

  // Authentication
  if (options.withAuth === undefined) {
    questions.push({
      type: 'list',
      name: 'auth',
      message: 'Which authentication method would you like?',
      choices: [
        { name: 'None', value: 'none' },
        { name: 'JWT', value: 'jwt' },
        { name: 'Passport', value: 'passport' }
      ],
      default: 'none'
    });
  }

  // Testing
  if (options.withJest === undefined && options.tests !== false) {
    questions.push({
      type: 'confirm',
      name: 'testing',
      message: 'Would you like to enable Jest testing?',
      default: true
    });
  }

  // ESLint
  if (options.withEslint === undefined) {
    questions.push({
      type: 'confirm',
      name: 'eslint',
      message: 'Would you like to enable ESLint?',
      default: true
    });
  }

  // Prettier
  if (options.withPrettier === undefined) {
    questions.push({
      type: 'confirm',
      name: 'prettier',
      message: 'Would you like to enable Prettier?',
      default: true
    });
  }

  // Docker
  if (options.withDocker === undefined) {
    questions.push({
      type: 'confirm',
      name: 'docker',
      message: 'Would you like to include Docker configuration?',
      default: false
    });
  }

  // Git
  if (options.git !== false) {
    questions.push({
      type: 'confirm',
      name: 'git',
      message: 'Would you like to initialize a Git repository?',
      default: true
    });
  }

  const answers = await inquirer.prompt(questions);

  // Process database configuration
  let database: 'mongodb' | 'postgres' | 'none' | undefined;
  if (options.withDb) {
    database = (options.db as 'mongodb' | 'postgres') || 'mongodb';
  } else {
    database = answers.database === 'none' ? undefined : answers.database;
  }

  // Process auth configuration  
  let auth: 'jwt' | 'passport' | 'none' | undefined;
  if (options.withAuth) {
    auth = (options.auth as 'jwt' | 'passport') || 'jwt';
  } else {
    auth = answers.auth === 'none' ? undefined : answers.auth;
  }

  return {
    name: projectName,
    language: options.lang as 'ts' | 'js' || answers.language || 'ts',
    packageManager: options.pkgManager as 'npm' | 'yarn' | 'pnpm' || answers.packageManager || 'npm',
    style: options.style as 'resource' | 'layered' || answers.style || 'resource',
    database,
    orm: options.orm as 'mongoose' | 'prisma' | 'sequelize' | 'typeorm' || answers.orm,
    auth,
    testing: options.tests === false ? false : (options.withJest || answers.testing || false),
    eslint: options.withEslint || answers.eslint || false,
    prettier: options.withPrettier || answers.prettier || false,
    docker: options.withDocker || answers.docker || false,
    git: options.git !== false ? (answers.git !== false) : false,
    light: false,
    boilerplateLevel: options.boilerplate as 'minimal' | 'full' | 'signatures' || answers.boilerplateLevel || 'full',
    includeValidation: options.validation !== false ? (answers.includeValidation !== false) : false
  };
}

export async function promptResourceConfig(
  resourceName: string,
  options: { tests?: boolean; withAuth?: boolean; boilerplate?: string; validation?: boolean; endpoints?: string[] }
): Promise<{ name: string; generateTests: boolean; withAuth: boolean; boilerplateLevel: 'minimal' | 'full' | 'signatures'; includeValidation: boolean; customEndpoints?: string[] }> {
  const questions: QuestionType[] = [];

  // Ask if they want to configure more options
  questions.push({
    type: 'confirm',
    name: 'configureOptions',
    message: '⚙️  Do you want to configure additional options for this resource?',
    default: false
  });

  // Boilerplate level
  questions.push({
    type: 'list',
    name: 'boilerplateLevel',
    message: 'How much boilerplate code would you like for this resource?',
    choices: [
      { name: 'Full - Complete CRUD implementation', value: 'full' },
      { name: 'Signatures - Method signatures only', value: 'signatures' },
      { name: 'Minimal - Basic structure only', value: 'minimal' }
    ],
    default: 'full',
    when: (answers: any) => answers.configureOptions && !options.boilerplate
  });

  // Validation
  questions.push({
    type: 'confirm',
    name: 'includeValidation',
    message: 'Include input validation for this resource?',
    default: true,
    when: (answers: any) => answers.configureOptions && options.validation === undefined
  });

  // Custom endpoints
  questions.push({
    type: 'input',
    name: 'customEndpoints',
    message: 'Custom endpoints (comma-separated, e.g., "activate,deactivate,bulk-update")?',
    when: (answers: any) => answers.configureOptions && !options.endpoints
  });

  // Tests
  questions.push({
    type: 'confirm',
    name: 'generateTests',
    message: 'Generate test files for this resource?',
    default: true,
    when: (answers: any) => answers.configureOptions && options.tests === undefined
  });

  // Auth
  questions.push({
    type: 'confirm',
    name: 'withAuth',
    message: 'Include authentication middleware?',
    default: false,
    when: (answers: any) => answers.configureOptions && options.withAuth === undefined
  });

  const answers = await inquirer.prompt(questions);

  // Process custom endpoints if provided
  const processedEndpoints = answers.customEndpoints ? 
    answers.customEndpoints.split(',').map((s: string) => s.trim()).filter((s: string) => s) : 
    (options.endpoints || []);

  return {
    name: resourceName,
    generateTests: options.tests !== false ? (answers.generateTests !== false) : false,
    withAuth: options.withAuth || answers.withAuth || false,
    boilerplateLevel: options.boilerplate as 'minimal' | 'full' | 'signatures' || answers.boilerplateLevel || 'full',
    includeValidation: options.validation !== false ? (answers.includeValidation !== false) : true,
    customEndpoints: processedEndpoints
  };
}
