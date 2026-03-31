const fs = require("fs");
const path = require("path");

class Logger {
  constructor() {
    this.logBuffer = [];
    this.timestamp = new Date(Date.now() + 5.75 * 60 * 60 * 1000)
      .toISOString()
      .replace(/[:]/g, "-")
      .replace("T", "_")
      .slice(0, 19);
  }

  addLog(message) {
    this.logBuffer.push(message);
  }

  saveLogToFile(fileName = this.timestamp) {
    const logDir = path.join(__dirname, "..", "logs");
    const logFile = path.join(logDir, fileName);

    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }

    fs.writeFileSync(logFile, this.logBuffer.join("\n"), "utf8");
  }
}

module.exports = Logger;
