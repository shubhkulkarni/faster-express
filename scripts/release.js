#!/usr/bin/env node

const { execSync } = require("child_process");
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

async function main() {
  console.log("🚀 faster-express Release Helper\n");

  // Check if we're on main/master branch
  try {
    const branch = execSync("git rev-parse --abbrev-ref HEAD", {
      encoding: "utf8",
    }).trim();
    if (branch !== "main" && branch !== "master") {
      console.log(
        `❌ You're on branch '${branch}'. Please switch to main/master branch first.`
      );
      process.exit(1);
    }
    console.log(`✅ On ${branch} branch`);
  } catch (error) {
    console.log("❌ Error checking git branch:", error.message);
    process.exit(1);
  }

  // Check if working directory is clean
  try {
    const status = execSync("git status --porcelain", { encoding: "utf8" });
    if (status.trim()) {
      console.log(
        "❌ Working directory is not clean. Please commit or stash your changes."
      );
      process.exit(1);
    }
    console.log("✅ Working directory is clean");
  } catch (error) {
    console.log("❌ Error checking git status:", error.message);
    process.exit(1);
  }

  // Pull latest changes
  try {
    execSync("git pull origin", { stdio: "inherit" });
    console.log("✅ Pulled latest changes");
  } catch (error) {
    console.log("❌ Error pulling changes:", error.message);
    process.exit(1);
  }

  const versionType = await askQuestion(
    "Select version bump type (patch/minor/major): "
  );

  if (!["patch", "minor", "major"].includes(versionType)) {
    console.log("❌ Invalid version type. Use patch, minor, or major.");
    process.exit(1);
  }

  const publish = await askQuestion(
    "Publish to NPM after version bump? (y/N): "
  );
  const shouldPublish =
    publish.toLowerCase() === "y" || publish.toLowerCase() === "yes";

  console.log(`\n📦 Bumping ${versionType} version...`);

  try {
    // Run tests
    console.log("🧪 Running tests...");
    execSync("npm test", { stdio: "inherit" });

    // Build
    console.log("🔨 Building project...");
    execSync("npm run build", { stdio: "inherit" });

    // Bump version
    execSync(`npm version ${versionType}`, { stdio: "inherit" });

    const newVersion = require("./package.json").version;
    console.log(`✅ Version bumped to ${newVersion}`);

    // Push changes
    console.log("📤 Pushing changes...");
    execSync("git push origin", { stdio: "inherit" });
    execSync(`git push origin v${newVersion}`, { stdio: "inherit" });

    if (shouldPublish) {
      console.log("📦 Publishing to NPM...");
      execSync("npm publish", { stdio: "inherit" });
      console.log("✅ Published to NPM!");
      console.log(`\n🎉 Release v${newVersion} complete!`);
      console.log(
        `📦 Install with: npm install -g faster-express@${newVersion}`
      );
    } else {
      console.log(`\n✅ Version v${newVersion} pushed to GitHub!`);
      console.log("💡 To publish to NPM, run: npm publish");
    }
  } catch (error) {
    console.log("❌ Error during release process:", error.message);
    process.exit(1);
  }

  rl.close();
}

main().catch(console.error);
