import path from "path";
import fs from "fs-extra";
import chalk from "chalk";

export async function listResources() {
  console.log(chalk.blue("📋 Listing all resources...\n"));

  try {
    // Check if we're in a project directory
    const currentDir = process.cwd();
    const packageJsonPath = path.join(currentDir, "package.json");
    const srcPath = path.join(currentDir, "src");
    const resourcesPath = path.join(srcPath, "resources");

    if (!(await fs.pathExists(packageJsonPath))) {
      console.error(
        chalk.red(
          "❌ No package.json found. Make sure you're in a project directory."
        )
      );
      process.exit(1);
    }

    if (!(await fs.pathExists(srcPath))) {
      console.error(
        chalk.red(
          "❌ No src directory found. Make sure you're in a faster-express project."
        )
      );
      process.exit(1);
    }

    if (!(await fs.pathExists(resourcesPath))) {
      console.log(
        chalk.yellow(
          '📭 No resources directory found. Use "faster-express add <resource-name>" to create your first resource.'
        )
      );
      return;
    }

    // Read all directories in resources folder
    const entries = await fs.readdir(resourcesPath, { withFileTypes: true });
    const resourceDirs = entries
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name);

    if (resourceDirs.length === 0) {
      console.log(
        chalk.yellow(
          '📭 No resources found. Use "faster-express add <resource-name>" to create your first resource.'
        )
      );
      return;
    }

    console.log(chalk.bold(`Found ${resourceDirs.length} resource(s):\n`));

    for (const resourceName of resourceDirs) {
      const resourcePath = path.join(resourcesPath, resourceName);
      const files = await fs.readdir(resourcePath);

      console.log(chalk.cyan(`📁 ${resourceName}`));
      console.log(chalk.gray(`   └── Path: src/resources/${resourceName}/`));
      console.log(chalk.gray(`   └── Files: ${files.join(", ")}`));
      console.log(chalk.gray(`   └── Endpoint: /api/${resourceName}s`));
      console.log();
    }

    console.log(chalk.bold("Commands:"));
    console.log(
      chalk.cyan("  faster-express add <resource>    # Add a new resource")
    );
    console.log(
      chalk.cyan("  faster-express remove <resource> # Remove a resource")
    );
  } catch (error: any) {
    console.error(chalk.red("❌ Error listing resources:"), error.message);
    process.exit(1);
  }
}
