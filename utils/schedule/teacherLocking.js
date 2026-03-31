/**
 * Functions for managing teacher locking to specific section-subject combinations
 * This ensures that once a teacher is assigned to teach a subject in a section,
 * they continue teaching that subject for all periods in that section.
 */

/**
 * Gets the locked teacher for a specific section-subject combination
 * @param {Object} sectionSubjectTeachers - Mapping of section-subject to teacher
 * @param {string} section - Section name
 * @param {string} subject - Subject name
 * @returns {string|null} Teacher name if locked, null otherwise
 */
function getLockedTeacher(sectionSubjectTeachers, section, subject) {
  const key = `${section}-${subject}`;
  return sectionSubjectTeachers[key] || null;
}

/**
 * Locks a teacher to a specific section-subject combination
 * @param {Object} sectionSubjectTeachers - Mapping of section-subject to teacher
 * @param {Object} teacherSectionSubjects - Mapping of teacher to their assigned sections/subjects
 * @param {Object} logger - Logger instance for logging the operation
 * @param {string} section - Section name
 * @param {string} subject - Subject name
 * @param {string} teacherName - Name of the teacher to lock
 */
function lockTeacherToSectionSubject(
  sectionSubjectTeachers,
  teacherSectionSubjects,
  logger,
  section,
  subject,
  teacherName
) {
  const key = `${section}-${subject}`;
  sectionSubjectTeachers[key] = teacherName;

  // Initialize teacher's section mapping if it doesn't exist
  if (!teacherSectionSubjects[teacherName]) {
    teacherSectionSubjects[teacherName] = {};
  }
  if (!teacherSectionSubjects[teacherName][section]) {
    teacherSectionSubjects[teacherName][section] = new Set();
  }
  teacherSectionSubjects[teacherName][section].add(subject);

  logger.addLog(`Locked teacher ${teacherName} to ${section}-${subject}`);
}

/**
 * Unlocks a teacher from a specific section-subject combination
 * @param {Object} sectionSubjectTeachers - Mapping of section-subject to teacher
 * @param {Object} teacherSectionSubjects - Mapping of teacher to their assigned sections/subjects
 * @param {Object} logger - Logger instance for logging the operation
 * @param {string} section - Section name
 * @param {string} subject - Subject name
 */
function unlockTeacherFromSectionSubject(
  sectionSubjectTeachers,
  teacherSectionSubjects,
  logger,
  section,
  subject
) {
  const key = `${section}-${subject}`;
  const teacherName = sectionSubjectTeachers[key];

  if (teacherName) {
    // Remove from teacher's section mapping
    if (
      teacherSectionSubjects[teacherName] &&
      teacherSectionSubjects[teacherName][section]
    ) {
      teacherSectionSubjects[teacherName][section].delete(subject);

      // Clean up empty entries
      if (teacherSectionSubjects[teacherName][section].size === 0) {
        delete teacherSectionSubjects[teacherName][section];
      }
      if (Object.keys(teacherSectionSubjects[teacherName]).length === 0) {
        delete teacherSectionSubjects[teacherName];
      }
    }

    logger.addLog(`Unlocked teacher ${teacherName} from ${section}-${subject}`);
    delete sectionSubjectTeachers[key];
  }
}

/**
 * Checks if a teacher already teaches any subject in a given section
 * @param {Object} teacherSectionSubjects - Mapping of teacher to their assigned sections/subjects
 * @param {string} teacherName - Name of the teacher
 * @param {string} section - Section name
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

/**
 * Checks if this is the first assignment for a specific section-subject combination
 * @param {Object} routine - Current routine structure
 * @param {Array<string>} days - Array of day names
 * @param {Array<Object>} timeSlots - Array of time slot objects
 * @param {string} section - Section name
 * @param {string} subject - Subject name
 * @returns {boolean} True if this is the first assignment for this section-subject
 */
function isFirstAssignmentForSectionSubject(
  routine,
  days,
  timeSlots,
  section,
  subject
) {
  let count = 0;
  for (const day of days) {
    for (let slotIndex = 0; slotIndex < timeSlots.length; slotIndex++) {
      const assignment = routine[day][slotIndex][section];
      if (assignment && assignment.subject === subject) {
        count++;
      }
    }
  }
  return count === 0;
}

module.exports = {
  getLockedTeacher,
  lockTeacherToSectionSubject,
  unlockTeacherFromSectionSubject,
  teacherAlreadyTeachesInSection,
  isFirstAssignmentForSectionSubject,
};
