const path = require("path");
const express = require("express");
const router = express.Router();

router.get("/preferences", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "view", "preferences" ,"index.html"));
});

module.exports = router;
