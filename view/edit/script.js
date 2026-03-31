let teachers = {};
let courses = [];

document.addEventListener("DOMContentLoaded", () => {
  Promise.all([
    fetch("/teachers").then((res) => res.json()),
    fetch("/courses").then((res) => res.json()),
  ])
    .then(([teacherData, courseData]) => {
      const excludedSubjectCodes = courseData
        .flatMap((semester) => semester.subjects)
        .filter((subject) => /seminar|project|research/i.test(subject.name))
        .map((subject) => subject.code);

      teachers = Object.values(teacherData).map((teacher) => ({
        ...teacher,
        subjects_array: (teacher.subjects_array || []).filter(
          (code) => !excludedSubjectCodes.includes(code)
        ),
      }));

      courses = courseData.map((semester) => ({
        ...semester,
        subjects: semester.subjects.filter(
          (subject) => !excludedSubjectCodes.includes(subject.code)
        ),
      }));

      renderTeachersForm(teachers, courses);
    })
    .catch((error) => {
      console.error(error);
    });
});

function renderTeachersForm(teachers, courses) {
  const form = document.forms["preferences"];
  form.innerHTML = "";

  teachers.forEach((teacher, index) => {
    teacher.subjects_array = teacher.subjects_array || [];

    const detailsAttrs = {
      name: "teacher",
      ...(index === 0 && { open: true }),
    };

    const teacherArticle = createElement("article", {}, [
      createElement("details", detailsAttrs, [
        createElement(
          "summary",
          {},
          `${teacher.salutation} ${teacher.fullName}`
        ),

        // inside collapsible details
        renderSubjects(teacher, courses),
        renderAvailability(teacher),
      ]),
    ]);

    form.appendChild(teacherArticle);
  });
}

// Example data from backend:
//
// teachers = {
//   "1": {
//     "teacherID": 1,
//     "salutation": "Dr.",
//     "fullName": "Arjun Singh Saud",
//     "subjects_array": ["CSC529", "CSC637", "CSC644"],
//     "availability_json": {
//       Sunday: [{ start: "10:30", end: "12:00" }, { start: "13:30", end: "15:30" }],
//       Monday: [{ start: "11:00", end: "13:00" }, { start: "15:00", end: "17:00" }],
//     }
//   },
//   ...
// }
//
// courses = [
//   {
//     semester: 1,
//     subjects: [
//       {
//         code: "CSC538",
//         name: "Advanced Operating Systems",
//         type: "compulsory",
//       },
//       {
//         code: "CSC539",
//         name: "Object Oriented Software Engineering",
//         type: "compulsory",
//       },
//       {
//         code: "CSC540",
//         name: "Algorithms and Complexity",
//         type: "compulsory",
//       },
//       {
//         code: "CSC542",
//         name: "Seminar I",
//         type: "compulsory",
//       },
//       {
//         code: "CSC543",
//         name: "Neural Network",
//         type: "compulsory",
//       },
//       {
//         code: "CSC544",
//         name: "Parallel and Distributed Computing",
//         type: "compulsory",
//       },
//       {
//         code: "CSC545",
//         name: "Algorithmic Mathematics",
//         type: "elective",
//       },
//       {
//         code: "CSC546",
//         name: "Advance Computer Architecture",
//         type: "elective",
//       },
//     ],
//   },
//  ...
// ];
