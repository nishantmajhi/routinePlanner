const path = require("path");
const express = require("express");

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, "view")));

const routePaths = [
  "./routes/addTeacher",
  "./routes/editTeachers",
  "./routes/generate",
  "./routes/getAllCoursesData",
  "./routes/getAllTeachersData",
  "./routes/preferences",
  "./routes/routine",
  "./routes/teacherCRUD",
];

routePaths.forEach((routePath) => {
  const route = require(routePath);
  app.use("/", route);
});

module.exports = app;
