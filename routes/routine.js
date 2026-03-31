const path = require("path");
const express = require("express");
const router = express.Router();

const Database = require("better-sqlite3");
const fs = require("fs");

router.get("/routine", async (req, res) => {
  try {
    const latestRoutineID = getLatestRoutineID();
    if (!latestRoutineID) {
      return res.status(404).json({ error: "No routines found." });
    }

    const routine = loadRoutineById(latestRoutineID);
    if (!routine) {
      return res.status(404).json({ error: "Routine not found." });
    }

    const html = await buildRoutineHTML(latestRoutineID, routine);
    res.type("html").send(html);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error." });
  }
});

router.get("/routine/:id", async (req, res) => {
  try {
    const routine = loadRoutineById(req.params.id);
    if (!routine) {
      return res.status(404).json({ error: "Routine not found." });
    }

    const html = await buildRoutineHTML(req.params.id, routine);
    res.type("html").send(html);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error." });
  }
});

async function buildRoutineHTML(id, routineData) {
  const htmlPath = path.join(__dirname, "..", "view", "routine", "index.html");
  let html;

  try {
    html = await fs.promises.readFile(htmlPath, "utf-8");
  } catch (err) {
    console.error("Error reading HTML file:", err);
    return null;
  }

  html = html.replace(/{{ID}}/g, id);

  if (!html.includes("</html>")) {
    console.warn(
      "Warning: </html> tag not found in HTML. Script may not be injected."
    );
  }
  const routineScript = `<script>const routine = ${JSON.stringify(
    routineData
  )};</script>\n`;
  html = html.replace(/<\/html>/, `${routineScript}</html>`);

  return html;
}

function getLatestRoutineID() {
  const dbPath = path.resolve(__dirname, "..", "database", "routine.sqlite3");
  const db = new Database(dbPath, { readonly: true });

  try {
    const query = `SELECT id FROM routine ORDER BY id DESC LIMIT 1`;
    const row = db.prepare(query).get();
    return row ? row.id : null;
  } catch (err) {
    console.error("Error getting latest routine ID:", err);
    return null;
  } finally {
    db.close();
  }
}

function loadRoutineById(id) {
  const dbPath = path.resolve(__dirname, "..", "database", "routine.sqlite3");
  const db = new Database(dbPath, { readonly: true });

  try {
    const query = `SELECT json FROM routine WHERE id = ?`;
    const row = db.prepare(query).get(id);
    return row ? JSON.parse(row.json) : null;
  } catch (err) {
    console.error("Error loading routine by ID:", err);
    return null;
  } finally {
    db.close();
  }
}

module.exports = router;