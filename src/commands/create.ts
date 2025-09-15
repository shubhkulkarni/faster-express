import path from "path";
import fs from "fs-extra";
import chalk from "chalk";
import ora from "ora";
import execa from "execa";
import { promptProjectConfig } from "../utils/prompts";
import { generateProject } from "../generators/project";
import { CreateOptions } from "../types";

export async function createProject(
  projectName: string,
  options: CreateOptions
) {
  console.log(chalk.blue(`🚀 Creating ${projectName} with faster-express\n`));

  try {
    // Get project configuration
    const config = await promptProjectConfig(projectName, options);

    // Check if directory already exists
    const projectPath = path.join(process.cwd(), projectName);
    if (await fs.pathExists(projectPath)) {
      console.error(chalk.red(`❌ Directory ${projectName} already exists!`));
      process.exit(1);
    }

    // Create project directory
    await fs.ensureDir(projectPath);
    process.chdir(projectPath);

    // Generate project files
    const spinner = ora("Generating project files...").start();
    await generateProject(config, projectPath);
    spinner.succeed("Project files generated");

    // Install dependencies
    const installSpinner = ora(
      `Installing dependencies with ${config.packageManager}...`
    ).start();
    try {
      await execa(config.packageManager, ["install"], { stdio: "pipe" });
      installSpinner.succeed("Dependencies installed");
    } catch (error) {
      installSpinner.fail("Failed to install dependencies");
      console.log(
        chalk.yellow("You can install dependencies manually later with:")
      );
      console.log(
        chalk.cyan(`cd ${projectName} && ${config.packageManager} install`)
      );
    }

    // Initialize Git repository
    if (config.git) {
      const gitSpinner = ora("Initializing Git repository...").start();
      try {
        await execa("git", ["init"], { stdio: "pipe" });
        await execa("git", ["add", "."], { stdio: "pipe" });
        await execa("git", ["commit", "-m", "Initial commit"], {
          stdio: "pipe",
        });
        gitSpinner.succeed("Git repository initialized");
      } catch (error) {
        gitSpinner.fail("Failed to initialize Git repository");
      }
    }

    // Success message
    console.log(chalk.green("\n✅ Project created successfully!\n"));
    console.log(chalk.bold("Next steps:"));
    console.log(chalk.cyan(`  cd ${projectName}`));
    console.log(chalk.cyan(`  ${config.packageManager} run dev`));
    console.log();
    console.log(chalk.bold("Available commands:"));
    console.log(
      chalk.cyan("  faster-express add <resource>    # Add a new resource")
    );
    console.log(
      chalk.cyan("  faster-express list              # List all resources")
    );
    console.log(
      chalk.cyan("  faster-express remove <resource> # Remove a resource")
    );
  } catch (error: any) {
    console.error(chalk.red("❌ Error creating project:"), error.message);
    process.exit(1);
  }
}
