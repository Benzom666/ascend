/**
 * Starts sibling secret-time-next-api and this Next app together.
 * No extra npm packages — uses child_process only.
 */
const { spawn } = require("child_process");
const path = require("path");

const webRoot = path.join(__dirname, "..");
const apiRoot = path.join(webRoot, "..", "secret-time-next-api");

function start(label, command, args, cwd) {
  const child = spawn(command, args, {
    cwd,
    stdio: "inherit",
    shell: true,
    env: { ...process.env },
  });
  child.on("error", (err) => {
    console.error(`[${label}]`, err);
    process.exit(1);
  });
  return child;
}

const api = start("api", "npm", ["start"], apiRoot);
const web = start("web", "npm", ["run", "dev"], webRoot);

function shutdown() {
  try {
    api.kill("SIGTERM");
  } catch (_) {}
  try {
    web.kill("SIGTERM");
  } catch (_) {}
}

["SIGINT", "SIGTERM"].forEach((sig) => {
  process.on(sig, () => {
    shutdown();
    process.exit(0);
  });
});

web.on("exit", (code) => {
  shutdown();
  process.exit(code ?? 0);
});

api.on("exit", (code, signal) => {
  if (signal) return;
  if (code !== 0 && code != null) {
    console.error("[dev-stack] API exited with code", code);
    shutdown();
    process.exit(code);
  }
});
