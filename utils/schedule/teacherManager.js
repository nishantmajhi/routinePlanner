/**
 * Functions for managing teacher availability, workload, and assignments
 */

const { timeToMinutes } = require("./timeUtils");

/**
 * Calculates the current workload (number of assigned periods) for a teacher
 * @param {Object} teacher - Teacher object
 * @param {Object} routine - Current routine structure
 * @returns {number} Number of periods currently assigned to the teacher
 */
function getTeacherCurrentWorkload(teacher, routine) {
  let workload = 0;

  for (const day of Object.keys(routine)) {
    for (const slot of routine[day]) {
      for (const assignment of Object.values(slot)) {
        if (assignment && assignment.teacher === teacher.name) {
          workload++;
        }
      }
    }
  }

  return workload;
}

/**
 * Checks if a teacher is available for a specific time slot
 * @param {Object} teacher - Teacher object with availability
 * @param {string} day - Day to check
 * @param {Object} timeSlot - Time slot object with start and end times
 * @param {Object} routine - Current routine structure
 * @param {number} slotIndex - Index of the time slot
 * @returns {boolean} True if teacher is available
 */
function isTeacherAvailableAtSlot(teacher, day, timeSlot, routine, slotIndex) {
  // Check if teacher works on this day
  if (!teacher.availability[day]) {
    return false;
  }

  const slotStart = timeToMinutes(timeSlot.start);
  const slotEnd = timeToMinutes(timeSlot.end);

  // Check if the slot falls within teacher's available hours
  let withinAvailableHours = false;
  for (const availableSlot of teacher.availability[day]) {
    const availStart = timeToMinutes(availableSlot.start);
    const availEnd = timeToMinutes(availableSlot.end);

    if (slotStart >= availStart && slotEnd <= availEnd) {
      withinAvailableHours = true;
      break;
    }
  }

  if (!withinAvailableHours) {
    return false;
  }

  // Check if teacher is already assigned to another section in this slot
  for (const section of Object.keys(routine[day][slotIndex])) {
    const assignment = routine[day][slotIndex][section];
    if (assignment && assignment.teacher === teacher.name) {
      return false;
    }
  }

  return true;
}

/**
 * Finds an available teacher for a subject, prioritizing those with lower workloads
 * @param {Object} teachers - Object containing all teachers
 * @param {string} subject - Subject to teach
 * @param {string} day - Day of the assignment
 * @param {Object} timeSlot - Time slot object
 * @param {Object} routine - Current routine structure
 * @param {number} slotIndex - Index of the time slot
 * @returns {Object|null} Available teacher object or null if none found
 */
function findAvailableTeacher(
  teachers,
  subject,
  day,
  timeSlot,
  routine,
  slotIndex
) {
  const availableTeachers = [];

  // Find all teachers who can teach this subject and are available
  for (const teacher of Object.values(teachers)) {
    if (!teacher.subjects.includes(subject)) {
      continue;
    }

    if (!isTeacherAvailableAtSlot(teacher, day, timeSlot, routine, slotIndex)) {
      continue;
    }

    availableTeachers.push(teacher);
  }

  // Sort by workload (ascending - prefer teachers with less work)
  availableTeachers.sort((a, b) => {
    const workloadA = getTeacherCurrentWorkload(a, routine);
    const workloadB = getTeacherCurrentWorkload(b, routine);
    return workloadA - workloadB;
  });

  // Select from top 3 candidates randomly for some variety
  if (availableTeachers.length > 0) {
    const selectionPool = availableTeachers.slice(
      0,
      Math.min(3, availableTeachers.length)
    );
    const randomIndex = Math.floor(Math.random() * selectionPool.length);
    return selectionPool[randomIndex];
  }

  return null;
}

/**
 * Finds an available teacher with section constraint (teacher can only teach one subject per section)
 * @param {Object} teachers - Object containing all teachers
 * @param {Object} teacherSectionSubjects - Mapping of teachers to their assigned section-subjects
 * @param {Object} routine - Current routine structure
 * @param {string} subject - Subject to teach
 * @param {string} section - Section to teach
 * @param {string} day - Day of the assignment
 * @param {Object} timeSlot - Time slot object
 * @param {number} slotIndex - Index of the time slot
 * @returns {Object|null} Available teacher object or null if none found
 */
function findAvailableTeacherWithSectionConstraint(
  teachers,
  teacherSectionSubjects,
  routine,
  subject,
  section,
  day,
  timeSlot,
  slotIndex,
  logger
) {
  const availableTeachers = [];

  for (const teacher of Object.values(teachers)) {
    if (!teacher.subjects.includes(subject)) {
      continue;
    }

    // Check if teacher already teaches another subject in this section
    if (
      teacherAlreadyTeachesInSection(
        teacherSectionSubjects,
        teacher.name,
        section
      )
    ) {
      continue;
    }

    if (!isTeacherAvailableAtSlot(teacher, day, timeSlot, routine, slotIndex)) {
      continue;
    }

    availableTeachers.push(teacher);
  }

  if (logger) {
    logger.addLog(
      `    >> Found ${
        availableTeachers.length
      } available teachers for ${section}-${subject} on ${day} ${
        timeSlot.start
      }: [${availableTeachers.map((t) => t.name).join(", ")}]`
    );
  }

  // Sort by workload
  availableTeachers.sort((a, b) => {
    const workloadA = getTeacherCurrentWorkload(a, routine);
    const workloadB = getTeacherCurrentWorkload(b, routine);
    return workloadA - workloadB;
  });

  if (logger && availableTeachers.length > 0) {
    const workloadInfo = availableTeachers
      .map((t) => `${t.name}(${getTeacherCurrentWorkload(t, routine)})`)
      .join(", ");
    logger.addLog(`    >> After workload sort: [${workloadInfo}]`);
  }

  // Select from top candidates
  if (availableTeachers.length > 0) {
    const selectionPool = availableTeachers.slice(
      0,
      Math.min(3, availableTeachers.length)
    );
    const randomIndex = Math.floor(Math.random() * selectionPool.length);

    if (logger) {
      logger.addLog(
        `    >> Selection pool (top ${selectionPool.length}): [${selectionPool
          .map((t) => t.name)
          .join(", ")}]`
      );
      logger.addLog(
        `    >> Random index: ${randomIndex}, Selected: ${selectionPool[randomIndex].name}`
      );
    }

    return selectionPool[randomIndex];
  }

  if (logger) {
    logger.addLog(`    >> No available teachers found`);
  }

  return null;
}

/**
 * Helper function to check if teacher already teaches in a section
 * @param {Object} teacherSectionSubjects - Mapping of teachers to sections
 * @param {string} teacherName - Name of the teacher
 * @param {string} section - Section to check
 * @returns {boolean} True if teacher already teaches in this section
 */
function teacherAlreadyTeachesInSection(
  teacherSectionSubjects,
  teacherName,
  section
) {
  return (
    teacherSectionSubjects[teacherName] &&
    teacherSectionSubjects[teacherName][section] &&
    teacherSectionSubjects[teacherName][section].size > 0
  );
}

module.exports = {
  getTeacherCurrentWorkload,
  isTeacherAvailableAtSlot,
  findAvailableTeacher,
  findAvailableTeacherWithSectionConstraint,
  teacherAlreadyTeachesInSection,
};
