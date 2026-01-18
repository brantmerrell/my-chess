#!/usr/bin/env node
/**
 * General-purpose browser console debugger
 * Captures browser console output to terminal with color coding
 *
 * Usage:
 *   node debug-console.js [url] [options]
 *
 * Examples:
 *   node debug-console.js                          # Default: http://localhost:3000
 *   node debug-console.js http://localhost:5173    # Custom URL
 *   node debug-console.js --filter="DRAG"          # Only show logs containing "DRAG"
 *   node debug-console.js --no-color               # Disable color output
 *   node debug-console.js --headless               # Run headless (no visible browser)
 *
 * Options:
 *   --filter=PATTERN   Only show logs matching pattern (case-insensitive)
 *   --exclude=PATTERN  Hide logs matching pattern
 *   --no-color         Disable colored output
 *   --headless         Run browser in headless mode
 *   --help             Show this help message
 */

const puppeteer = require("puppeteer");

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  url: "http://localhost:3000",
  filter: null,
  exclude: null,
  color: true,
  headless: false,
};

for (const arg of args) {
  if (arg === "--help") {
    console.log(`
Browser Console Debugger

Usage: node debug-console.js [url] [options]

Options:
  --filter=PATTERN   Only show logs matching pattern (case-insensitive)
  --exclude=PATTERN  Hide logs matching pattern
  --no-color         Disable colored output
  --headless         Run browser in headless mode
  --help             Show this help message

Examples:
  node debug-console.js
  node debug-console.js http://localhost:5173
  node debug-console.js --filter="error"
  node debug-console.js --exclude="warning" --filter="API"
`);
    process.exit(0);
  } else if (arg.startsWith("--filter=")) {
    options.filter = arg.slice(9);
  } else if (arg.startsWith("--exclude=")) {
    options.exclude = arg.slice(10);
  } else if (arg === "--no-color") {
    options.color = false;
  } else if (arg === "--headless") {
    options.headless = true;
  } else if (arg.startsWith("http")) {
    options.url = arg;
  }
}

// ANSI color codes
const colors = {
  reset: options.color ? "\x1b[0m" : "",
  red: options.color ? "\x1b[31m" : "",
  green: options.color ? "\x1b[32m" : "",
  yellow: options.color ? "\x1b[33m" : "",
  blue: options.color ? "\x1b[34m" : "",
  magenta: options.color ? "\x1b[35m" : "",
  cyan: options.color ? "\x1b[36m" : "",
  gray: options.color ? "\x1b[90m" : "",
};

function colorize(text, type) {
  // Color based on content patterns
  if (text.includes("error") || text.includes("Error") || type === "error") {
    return `${colors.red}${text}${colors.reset}`;
  }
  if (text.includes("warn") || text.includes("Warning") || type === "warning") {
    return `${colors.yellow}${text}${colors.reset}`;
  }
  if (text.includes("[DRAG")) {
    return `${colors.cyan}${text}${colors.reset}`;
  }
  if (text.includes("[SIM")) {
    return `${colors.magenta}${text}${colors.reset}`;
  }
  if (text.includes("[EFFECT") || text.includes("[RENDER")) {
    return `${colors.green}${text}${colors.reset}`;
  }
  if (text.includes("[API") || text.includes("[FETCH")) {
    return `${colors.blue}${text}${colors.reset}`;
  }
  if (type === "debug") {
    return `${colors.gray}${text}${colors.reset}`;
  }
  return text;
}

function shouldShow(text) {
  if (options.filter) {
    const pattern = new RegExp(options.filter, "i");
    if (!pattern.test(text)) return false;
  }
  if (options.exclude) {
    const pattern = new RegExp(options.exclude, "i");
    if (pattern.test(text)) return false;
  }
  return true;
}

async function main() {
  console.log(`Launching browser${options.headless ? " (headless)" : ""}...`);

  const browser = await puppeteer.launch({
    headless: options.headless,
    devtools: false,
    args: ["--window-size=1200,900"],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 900 });

  // Pipe browser console to terminal
  page.on("console", async (msg) => {
    const type = msg.type();

    // Extract actual values from JSHandle objects
    const args = await Promise.all(
      msg.args().map(async (arg) => {
        try {
          return await arg.jsonValue();
        } catch {
          return arg.toString();
        }
      })
    );

    const text = args
      .map((a) => (typeof a === "object" ? JSON.stringify(a) : a))
      .join(" ");

    if (shouldShow(text)) {
      console.log(colorize(text, type));
    }
  });

  page.on("pageerror", (err) => {
    if (shouldShow(err.message)) {
      console.log(`${colors.red}Page error: ${err.message}${colors.reset}`);
    }
  });

  page.on("requestfailed", (request) => {
    const text = `Request failed: ${request.url()}`;
    if (shouldShow(text)) {
      console.log(`${colors.red}${text}${colors.reset}`);
    }
  });

  console.log(`Navigating to ${options.url}...`);
  if (options.filter) console.log(`Filter: ${options.filter}`);
  if (options.exclude) console.log(`Exclude: ${options.exclude}`);

  try {
    await page.goto(options.url, { waitUntil: "networkidle2", timeout: 30000 });
    console.log("Page loaded. Interact with the page to see console output.");
    console.log("Press Ctrl+C to exit.\n");
    console.log("─".repeat(50) + "\n");
  } catch (err) {
    console.error(`${colors.red}Failed to load page.${colors.reset}`);
    console.error("Is your dev server running? Start it with: npm start");
    await browser.close();
    process.exit(1);
  }

  // Keep running until user exits
  process.on("SIGINT", async () => {
    console.log("\nClosing browser...");
    await browser.close();
    process.exit(0);
  });

  // Keep the script alive
  await new Promise(() => {});
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
