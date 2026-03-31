const path = require("path");
const Database = require("better-sqlite3");

class Teacher {
  constructor() {
    this.db = new Database(
      path.resolve(__dirname, "..", "database", "campus.sqlite3")
    );

    console.log("🌱 Initializing teachers database...");
    this.initializeTable();
  }

  initializeTable() {
    try {
      this.db.exec(`CREATE TABLE IF NOT EXISTS teachers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        salutation TEXT,
        name TEXT,
        subjects_array TEXT,
        availability_json TEXT
      )`);

      console.log("✅ Teachers table created successfully.");
      this.populateTeachers();
    } catch (err) {
      console.error("❌ Failed to create teachers table:", err.message);
    }
  }

  populateTeachers() {
    const teachers = [
      { salutation: "Dr.", name: "Arjun Singh Saud" },
      { salutation: "Mr.", name: "Bal Krishna Subedi" },
      { salutation: "Mr.", name: "Bikash Balami" },
      { salutation: "Dr.", name: "Binod Kumar Adhikari" },
      { salutation: "Dr.", name: "Dhiraj Kedar Pandey" },
      { salutation: "Dr.", name: "Dhundi Raj Pathak" },
      { salutation: "Mr.", name: "Jagdish Bhatta" },
      { salutation: "Assoc. Prof. Mr.", name: "Nawaraj Paudel" },
      { salutation: "Mr.", name: "Sarbin Sayami" },
      { salutation: "Prof. Dr.", name: "Subarna Shakya" },
    ];

    try {
      const insertStmt = this.db.prepare(
        "INSERT OR REPLACE INTO teachers (salutation, name) VALUES (?, ?)"
      );

      teachers.forEach((teacher) => {
        try {
          insertStmt.run(teacher.salutation, teacher.name);
          console.log(`✅ Inserted teacher ${teacher.name}`);
        } catch (err) {
          console.error(`❌ Error inserting ${teacher.name}: ${err.message}`);
        }
      });

      const result = this.db
        .prepare("SELECT COUNT(*) AS count FROM teachers")
        .get();
      console.log(`📋 Total teachers inserted: ${result.count}`);
      console.log("🎉 Teacher population completed!");
    } catch (err) {
      console.error("❌ Error during population:", err.message);
    } finally {
      this.db.close();
    }
  }
}

(function () {
  new Teacher();
})();
