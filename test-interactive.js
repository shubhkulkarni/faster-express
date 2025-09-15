const { spawn } = require("child_process");

// Test the interactive CLI
const child = spawn(
  "node",
  ["../dist/index.js", "create", "test-interactive"],
  {
    cwd: process.cwd() + "/test-output",
    stdio: ["pipe", "inherit", "inherit"],
  }
);

// Simulate user input for interactive prompts
setTimeout(() => {
  child.stdin.write("n\n"); // Don't configure more (use defaults)
}, 1000);

child.on("close", (code) => {
  console.log(`\nCLI process exited with code ${code}`);
  process.exit(code);
});

child.on("error", (err) => {
  console.error("Error:", err);
  process.exit(1);
});
