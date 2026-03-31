const fs = require("fs");
const path = require("path");
const Database = require("better-sqlite3");

class Subjects {
  constructor() {
    this.db = new Database(resolveDatabasePath("campus.sqlite3"));
    console.log("🌱 Initializing teachers' assigned subjects...");
  }

  seedSubjects(subjectsResolver) {
    try {
      const rows = this.db
        .prepare(
          `SELECT id, salutation, name, subjects_array, availability_json FROM teachers`
        )
        .all();

      console.log(
        `📋 Found ${rows.length} teachers. Updating subjects_array...`
      );

      const updateStmt = this.db.prepare(
        `UPDATE teachers SET subjects_array = ? WHERE id = ?`
      );

      rows.forEach((teacher) => {
        const subjects = subjectsResolver(teacher);
        if (!subjects) {
          console.warn(
            `⚠️ No subjects mapping found for teacher ID ${teacher.id}`
          );
          return;
        }

        try {
          updateStmt.run(JSON.stringify(subjects), teacher.id);
          console.log(
            `✅ Updated subjects_array for ${teacher.name} (ID: ${teacher.id})`
          );
        } catch (err) {
          console.error(
            `❌ Failed to update teacher ID ${teacher.id}:`,
            err.message
          );
        }
      });

      console.log("🎉 Subject seeding completed!");
    } catch (err) {
      console.error("❌ Failed to get teachers data:", err.message);
    } finally {
      this.db.close();
    }
  }

  seedAllSubjects() {
    this.seedSubjects(() => allSubjects());
  }

  seedCompulsorySubjects() {
    this.seedSubjects(() => compulsorySubjects());
  }

  seedCustomSubjects() {
    const teacherSubjects = customTeacherSubjectMap();
    this.seedSubjects((teacher) => teacherSubjects[teacher.id]);
  }
}

function resolveDatabasePath(...segments) {
  return path.resolve(__dirname, "..", "..", "database", ...segments);
}

function allSubjects() {
  const filePath = resolveDatabasePath("courses.json");
  const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));

  const subjects = [];
  data.forEach((semester) => {
    semester.subjects.forEach((subject) => {
      subjects.push(subject.code);
    });
  });

  return subjects;
}

function compulsorySubjects() {
  const filePath = resolveDatabasePath("courses.json");
  const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));

  const compulsory = [];
  data.forEach((semester) => {
    semester.subjects.forEach((subject) => {
      if (
        subject.type === "compulsory" &&
        !/seminar/i.test(subject.name) &&
        !/project/i.test(subject.name) &&
        !/research/i.test(subject.name)
      ) {
        compulsory.push(subject.code);
      }
    });
  });

  return compulsory;
}

function customTeacherSubjectMap() {
  return {
    1: [
      "CSC543",
      "CSC561",
      "CSC665",
      "CSC667",
      "CSC668",
      "CSC669",
      "CSC545",
      "CSC546",
      "CSC625",
    ],
    2: [
      "CSC623",
      "CSC665",
      "CSC667",
      "CSC668",
      "CSC669",
      "CSC545",
      "CSC546",
      "CSC625",
    ],
    3: [
      "CSC544",
      "CSC558",
      "CSC665",
      "CSC667",
      "CSC668",
      "CSC669",
      "CSC545",
      "CSC546",
      "CSC625",
    ],
    4: [
      "CSC538",
      "CSC563",
      "CSC665",
      "CSC667",
      "CSC668",
      "CSC669",
      "CSC545",
      "CSC546",
      "CSC625",
    ],
    5: [
      "CSC564",
      "CSC619",
      "CSC665",
      "CSC667",
      "CSC668",
      "CSC669",
      "CSC545",
      "CSC546",
      "CSC625",
    ],
    6: ["CSC624", "CSC665", "CSC667", "CSC668", "CSC669", "CSC545", "CSC546"],
    7: [
      "CSC562",
      "CSC621",
      "CSC665",
      "CSC667",
      "CSC668",
      "CSC669",
      "CSC545",
      "CSC546",
      "CSC625",
    ],
    8: [
      "CSC559",
      "CSC618",
      "CSC665",
      "CSC667",
      "CSC668",
      "CSC669",
      "CSC545",
      "CSC546",
      "CSC625",
    ],
    9: [
      "CSC540",
      "CSC665",
      "CSC667",
      "CSC668",
      "CSC669",
      "CSC545",
      "CSC546",
      "CSC625",
    ],
    10: [
      "CSC539",
      "CSC665",
      "CSC667",
      "CSC668",
      "CSC669",
      "CSC545",
      "CSC546",
      "CSC625",
    ],
  };
}

module.exports = Subjects;
