require("dotenv").config();
const app = require("./app");
const PORT = process.env.PORT || 3645;

process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("SIGINT received, shutting down gracefully");
  process.exit(0);
});

app.listen(PORT, () => {
  console.log(`🚀 Routine Planner Server running!`);
  console.log(`🌐 Visit: http://localhost:${PORT}`);
});
