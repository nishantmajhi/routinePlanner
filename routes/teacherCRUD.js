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

/**
 * 1. ADD teacher
 * POST /teacher/add
 */
router.post("/teacher/add", (req, res) => {
  const {
    salutation = null,
    name,
    subjects_array = null,
    availability_json = null,
  } = req.body;

  if (!name) {
    return res.status(400).json({ error: "name is required" });
  }

  const db = getDBConnection();

  try {
    const sql = `INSERT INTO teachers (salutation, name, subjects_array, availability_json) VALUES (?, ?, ?, ?)`;
    const stmt = db.prepare(sql);
    const info = stmt.run(
      salutation,
      name,
      subjects_array ? JSON.stringify(subjects_array) : null,
      availability_json ? JSON.stringify(availability_json) : null
    );

    res.json({ success: true, teacherID: info.lastInsertRowid });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    db.close();
  }
});

/**
 * 2. GET teacher by ID
 * GET /teacher/get/:teacherID
 */
router.get("/teacher/get/:teacherID", (req, res) => {
  const { teacherID } = req.params;
  const db = getDBConnection();

  try {
    const row = db
      .prepare("SELECT * FROM teachers WHERE id = ?")
      .get(teacherID);

    if (!row) {
      return res.status(404).json({ error: "Teacher not found" });
    }

    res.json({
      teacherID: row.id,
      salutation: row.salutation,
      fullName: row.name,
      subjects_array: row.subjects_array
        ? JSON.parse(row.subjects_array)
        : null,
      availability_json: row.availability_json
        ? JSON.parse(row.availability_json)
        : null,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    db.close();
  }
});

/**
 * 3. UPDATE teacher
 * PUT /teacher/update
 */
router.put("/teacher/update", (req, res) => {
  const { teacherID, salutation, name, subjects_array, availability_json } =
    req.body;

  if (!teacherID) {
    return res.status(400).json({ error: "teacherID is required" });
  }

  const updates = [];
  const params = [];

  if (salutation !== undefined) {
    updates.push("salutation = ?");
    params.push(salutation);
  }
  if (name !== undefined) {
    updates.push("name = ?");
    params.push(name);
  }
  if (subjects_array !== undefined) {
    updates.push("subjects_array = ?");
    params.push(subjects_array ? JSON.stringify(subjects_array) : null);
  }
  if (availability_json !== undefined) {
    updates.push("availability_json = ?");
    params.push(availability_json ? JSON.stringify(availability_json) : null);
  }

  if (updates.length === 0) {
    return res.status(400).json({ error: "No fields provided to update" });
  }

  params.push(teacherID);

  const db = getDBConnection();

  try {
    const sql = `UPDATE teachers SET ${updates.join(", ")} WHERE id = ?`;
    const stmt = db.prepare(sql);
    const info = stmt.run(...params);

    if (info.changes === 0) {
      return res.status(404).json({ error: "Teacher not found" });
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    db.close();
  }
});

/**
 * 4. REMOVE teacher
 * DELETE /teacher/remove/:teacherID
 */
router.delete("/teacher/remove/:teacherID", (req, res) => {
  const { teacherID } = req.params;
  const db = getDBConnection();

  try {
    const stmt = db.prepare("DELETE FROM teachers WHERE id = ?");
    const info = stmt.run(teacherID);

    if (info.changes === 0) {
      return res.status(404).json({ error: "Teacher not found" });
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    db.close();
  }
});

module.exports = router;
