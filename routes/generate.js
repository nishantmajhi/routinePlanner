const path = require("path");
const express = require("express");
const router = express.Router();
const rateLimit = require("express-rate-limit");

const Database = require("better-sqlite3");
const RoutinePlanner = require("../controller/RoutinePlanner");

const {
  validateRoutineRequest,
  validateTimeSequence,
  validateScheduleFeasibility,
} = require("../utils/validator");

const generateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 5,
  message: { error: "Too many requests. Please try again later." },
});

router.post("/generate", generateLimiter, async (req, res) => {
  try {
    const {
      days,
      start_time,
      break_start,
      break_end,
      end_time,
      periods,
      period_duration,
      periods_per_subject,
    } = req.body;

    const validationError = validateRoutineRequest(req.body);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    const timeError = validateTimeSequence(
      start_time,
      break_start,
      break_end,
      end_time
    );
    if (timeError) {
      return res.status(400).json({ error: timeError });
    }

    const feasibilityError = validateScheduleFeasibility(req.body);
    if (feasibilityError) {
      return res.status(400).json({ error: feasibilityError });
    }

    const planner = new RoutinePlanner({
      days,
      start_time,
      break_start,
      break_end,
      end_time,
      periods,
      period_duration: Number(period_duration),
      periods_per_subject: Number(periods_per_subject),
    });

    console.log("Generating schedule...");
    const routine = await planner.generate();

    if (!routine) {
      return res.status(500).json({
        error:
          "Could not generate a valid schedule with the given constraints. Please try reducing periods per subject or increasing available time slots.",
      });
    }

    console.log("Schedule generated successfully");

    const saved = saveRoutine(routine);
    if (!saved) {
      return res.status(500).json({
        error: "Internal database error occured while saving the routine.",
      });
    }

    res.json({ id: saved.id });
  } catch (err) {
    console.error("Error in generate route:", err);
    res.status(500).json({
      error: "Internal server error occurred while generating the schedule.",
    });
  }
});

function saveRoutine(routine) {
  const dbPath = path.resolve(__dirname, "../database/routine.sqlite3");
  const db = new Database(dbPath);

  try {
    db.exec(`CREATE TABLE IF NOT EXISTS routine (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      json TEXT
    )`);

    const insert = db.prepare(`INSERT INTO routine (json) VALUES (?)`);
    const info = insert.run(JSON.stringify(routine));

    return { id: info.lastInsertRowid };
  } catch (err) {
    console.error("Error saving routine:", err);
    return null;
  } finally {
    db.close();
  }
}

module.exports = router;
