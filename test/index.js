const { execSync } = require("child_process");
const path = require("path");

(async () => {
  const inquirer = (await import("inquirer")).default;

  try {
    console.log("🔄 Running Teachers.js...\n");
    const teachersPath = path.resolve(__dirname, "Teachers.js");
    execSync(`node "${teachersPath}"`, { stdio: "inherit" });
    console.log("\n✅ Teachers initialized.\n");

    console.log("🔄 Running Availability.js...\n");
    const availabilityPath = path.resolve(__dirname, "Availability.js");
    execSync(`node "${availabilityPath}"`, { stdio: "inherit" });
    console.log("\n✅ Availability initialized.\n");

    const { choice } = await inquirer.prompt([
      {
        type: "list",
        name: "choice",
        message: "Select which subject file to execute:",
        choices: [
          { name: "All Subjects", value: "allSubjects" },
          { name: "Compulsory Subjects", value: "compulsorySubjects" },
          { name: "Custom Subjects", value: "customSubjects" },
        ],
      },
    ]);

    const scriptPath = path.resolve(__dirname, `${choice}.js`);
    console.log(`\n🚀 Running ${choice}.js...\n`);
    execSync(`node "${scriptPath}"`, { stdio: "inherit" });

    console.log("\n🎉 Operation completed successfully!");
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
})();
