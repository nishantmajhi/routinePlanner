const path = require("path");
const Database = require("better-sqlite3");

class Availability {
  constructor() {
    this.fullTimeAvailability = {
      Sunday: [
        { start: "10:30", end: "13:30" },
        { start: "14:00", end: "17:00" },
      ],
      Monday: [
        { start: "10:30", end: "13:30" },
        { start: "14:00", end: "17:00" },
      ],
      Tuesday: [
        { start: "10:30", end: "13:30" },
        { start: "14:00", end: "17:00" },
      ],
      Wednesday: [
        { start: "10:30", end: "13:30" },
        { start: "14:00", end: "17:00" },
      ],
      Thursday: [
        { start: "10:30", end: "13:30" },
        { start: "14:00", end: "17:00" },
      ],
      Friday: [
        { start: "10:30", end: "13:30" },
        { start: "14:00", end: "17:00" },
      ],
    };

    this.db = new Database(
      path.resolve(__dirname, "..", "database", "campus.sqlite3")
    );

    console.log("🌱 Initializing teachers availability...");
    this.seedTimeSlots();
  }

  seedTimeSlots() {
    try {
      const rows = this.db
        .prepare(
          `SELECT id, salutation, name, subjects_array, availability_json FROM teachers`
        )
        .all();

      console.log(
        `📋 Found ${rows.length} teachers. Updating availability_json...`
      );

      const availability = JSON.stringify(this.fullTimeAvailability);
      const updateStmt = this.db.prepare(
        `UPDATE teachers SET availability_json = ? WHERE id = ?`
      );

      rows.forEach((teacher) => {
        try {
          updateStmt.run(availability, teacher.id);
          console.log(
            `✅ Updated availability_json for ${teacher.name} (ID: ${teacher.id})`
          );
        } catch (err) {
          console.error(
            `❌ Failed to update teacher ID ${teacher.id}:`,
            err.message
          );
        }
      });

      console.log("🎉 Availability seeding completed!");
    } catch (err) {
      console.error("❌ Failed to get teachers data:", err.message);
    } finally {
      this.db.close();
    }
  }
}

(function () {
  new Availability();
})();
