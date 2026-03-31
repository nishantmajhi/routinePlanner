const path = require("path");
const Database = require("better-sqlite3");

class Loader {
  constructor() {
    this.dbPath = path.resolve(__dirname, "..", "database", "campus.sqlite3");
  }

  loadTeachers() {
    const db = new Database(this.dbPath, { readonly: true });
    
    try {
      const teachers = {};
      const rows = db.prepare("SELECT * FROM teachers").all();

      rows.forEach(
        ({ id, salutation, name, subjects_array, availability_json }) => {
          teachers[id] = {
            id,
            salutation,
            name,
            subjects: subjects_array ? JSON.parse(subjects_array) : null,
            availability: availability_json
              ? JSON.parse(availability_json)
              : null,
          };
        }
      );

      return teachers;
    } finally {
      db.close();
    }
  }
}

module.exports = Loader;