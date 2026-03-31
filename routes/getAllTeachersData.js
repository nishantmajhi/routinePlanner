const path = require("path");
const express = require("express");
const router = express.Router();

const Database = require("better-sqlite3");

function getDBConnection() {
  const databasePath = path.resolve(
    __dirname,
    "..",
    "database",
    "campus.sqlite3"
  );
  return new Database(databasePath);
}

router.get("/teachers", (req, res) => {
  const db = getDBConnection();

  try {
    const teachers = {};
    const rows = db.prepare("SELECT * FROM teachers").all();

    rows.forEach(
      ({ id, salutation, name, subjects_array, availability_json }) => {
        if (!teachers[id]) {
          teachers[id] = {
            teacherID: id,
            salutation: salutation,
            fullName: name,
            subjects_array: subjects_array ? JSON.parse(subjects_array) : null,
            availability_json: availability_json
              ? JSON.parse(availability_json)
              : null,
          };
        }
      }
    );

    res.json(teachers);
  } catch (err) {
    console.error("Error fetching teachers:", err);
    res.status(500).json({ error: err.message });
  } finally {
    db.close();
  }
});

module.exports = router;
