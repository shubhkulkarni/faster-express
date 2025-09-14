import path from 'path';
import fs from 'fs-extra';
import chalk from 'chalk';

export async function removeResource(resourceName: string) {
  console.log(chalk.yellow(`🗑️  Removing ${resourceName} resource...\n`));

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

    // Check if resource exists
    const resourcePath = path.join(srcPath, 'resources', resourceName);
    if (!await fs.pathExists(resourcePath)) {
      console.error(chalk.red(`❌ Resource ${resourceName} does not exist!`));
      process.exit(1);
    }

    // Remove the resource directory
    await fs.remove(resourcePath);

    console.log(chalk.green(`\n✅ Resource ${resourceName} removed successfully!\n`));
    console.log(chalk.bold('Removed files:'));
    console.log(chalk.cyan(`  src/resources/${resourceName}/ (entire directory)`));
    console.log();
    console.log(chalk.yellow('Note: Make sure to remove any imports or references to this resource in your code.'));

  } catch (error: any) {
    console.error(chalk.red('❌ Error removing resource:'), error.message);
    process.exit(1);
  }
}
