const { spawn } = require("node:child_process");

runCommand("npm", ["run", "start:dev"]);

let isInterrupted = false;

// Function to stop Docker services or any other services
function stopServices() {
  return new Promise((resolve, reject) => {
    const stopProcess = runCommand("npm", ["run", "services:stop"]);

    stopProcess.on("exit", (code) => {
      if (code === 0) {
        console.log("\n🟢 Services stopped successfully.");
        resolve();
      } else {
        console.error(`\n❌ Failed to stop services. Exit code: ${code}`);
        reject(new Error(`Service stop process failed with code ${code}`));
      }
    });

    stopProcess.on("error", (err) => {
      console.error(`\n❌ Error stopping services: ${err.message}`);
      reject(err);
    });
  });
}

// Handle termination signals
function handleTermination() {
  if (isInterrupted) return; // Prevent multiple invocations
  isInterrupted = true;

  console.log("\n🔴 Process interrupted. Stopping services...");

  stopServices()
    .then(() => {
      console.log("\n🟢 Process terminated gracefully. Have a good rest!");
      process.exit(0); // Successful exit
    })
    .catch((err) => {
      console.error(`\n❌ Error during shutdown: ${err.message}`);
      process.exit(1); // Exit with failure code
    });
}

// Set up listeners for termination signals
process.on("SIGINT", handleTermination); // Handle Ctrl+C
process.on("SIGTERM", handleTermination); // Handle `kill` command
process.on("SIGHUP", handleTermination); // Handle terminal close

// Ensure any uncaught exceptions also trigger the cleanup
process.on("uncaughtException", (err) => {
  console.error(`\n❌ Uncaught exception: ${err.message}`);
  handleTermination();
});

// Function to spawn commands and inherit stdout/stderr
function runCommand(command, args) {
  return spawn(command, args, { stdio: "inherit", shell: true });
}

console.log("Development server running. Press Ctrl+C to stop.");
