#!/usr/bin/env node

import { scaffoldProject } from "../lib/scaffolder";
import path from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";
import fs from "fs";
import readline from "readline";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SCRIPT_DIR = path.dirname(__dirname);
const BASE_DIR = path.dirname(SCRIPT_DIR);

const args = process.argv.slice(2);
const projectName = args[0];

if (!projectName) {
  console.log("Usage: scaffold-project <project-name>");
  console.log("Example: scaffold-project salem-crm");
  console.log("");
  console.log("This will create the following structure:");
  console.log("  /app/");
  console.log("  /docs/ (with subfolders)");
  console.log("  /config/");
  console.log("  /scripts/");
  console.log(
    "  /extras/ (ideas, research, screenshots, content, brand, product, portfolio)"
  );
  process.exit(1);
}

async function promptYesNo(question: string): Promise<boolean> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(question + " (y/n) ", (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === "y");
    });
  });
}

async function main() {
  console.log(`Creating project: ${projectName}`);
  console.log(`Location: ${BASE_DIR}/${projectName}`);
  console.log("");

  // Scaffold the project
  const result = await scaffoldProject({
    projectName,
    baseDir: BASE_DIR,
  });

  if (!result.success) {
    console.error(`❌ Error: ${result.message}`);
    process.exit(1);
  }

  console.log(`✓ Folders and files created`);

  // Ask about git initialization
  const initGit = await promptYesNo("Initialize git repository?");

  if (initGit) {
    try {
      process.chdir(result.projectPath);
      execSync("git init", { stdio: "inherit" });
      execSync("git add .", { stdio: "inherit" });
      execSync('git commit -m "Initial project scaffold" --no-verify', {
        stdio: "inherit",
      });
      console.log("✓ Git repository initialized");
      process.chdir(BASE_DIR);
    } catch (error) {
      console.error("❌ Failed to initialize git repository");
      process.exit(1);
    }
  }

  console.log("");
  console.log("✅ Project scaffolded successfully!");
  console.log("");
  console.log(`Location: ${result.projectPath}`);
  console.log("");
  console.log("Next steps:");
  console.log(`  1. cd ${result.projectPath}`);
  console.log("  2. Create docs/setup/README.md with project-specific setup instructions");
  console.log("  3. Update the root README.md with project details");
  console.log("  4. Start building in /app/");
  console.log("");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
