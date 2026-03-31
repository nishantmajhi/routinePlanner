const path = require("path");
const express = require("express");
const router = express.Router();

router.get("/addTeacher", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "view", "add", "index.html"));
});

module.exports = router;
