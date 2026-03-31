const path = require("path");
const express = require("express");
const router = express.Router();

const fs = require("fs");

router.get("/courses", (req, res) => {
  const filePath = path.join(__dirname, "..", "database", "courses.json");

  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      console.error("Error reading courses.json:", err);
      return res.status(500).json({ error: "Failed to load courses" });
    }

    try {
      const courses = JSON.parse(data);
      res.json(courses);
    } catch (parseError) {
      console.error("Error parsing courses.json:", parseError);
      res.status(500).json({ error: "Invalid JSON format in courses file" });
    }
  });
});

module.exports = router;
