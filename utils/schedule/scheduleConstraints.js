/**
 * Functions for validating schedule constraints and rules
 */

/**
 * Checks if a subject is already scheduled for a section on a given day
 * @param {Object} routine - The current routine structure
 * @param {string} day - Day to check
 * @param {string} section - Section to check
 * @param {string} subject - Subject to check
 * @returns {boolean} True if subject is already scheduled that day
 */
function isSubjectAlreadyScheduledToday(routine, day, section, subject) {
  const daySchedule = routine[day];

  for (const slot of daySchedule) {
    const assignment = slot[section];
    if (assignment && assignment.subject === subject) {
      return true;
    }
  }

  return false;
}

/**
 * Validates the complete routine against all constraints
 * - Checks if each subject has the correct number of periods per week
 * - Ensures no subject appears more than once per day per section
 * @param {Object} routine - The complete routine to validate
 * @param {Object} periods - Object mapping sections to their subjects
 * @param {number} periodsPerSubject - Expected periods per subject per week
 * @returns {boolean} True if routine is valid
 */
function validateRoutine(routine, periods, periodsPerSubject) {
  const periodCounts = {};
  const dailySubjectCounts = {};

  // Initialize counters
  for (const [section, subjects] of Object.entries(periods)) {
    periodCounts[section] = {};
    dailySubjectCounts[section] = {};

    for (const subject of subjects) {
      periodCounts[section][subject] = 0;
    }
  }

  // Count assignments in the routine
  for (const [day, slots] of Object.entries(routine)) {
    for (const section of Object.keys(periods)) {
      dailySubjectCounts[section][day] = {};
    }

    for (const slot of slots) {
      for (const [section, assignment] of Object.entries(slot)) {
        if (assignment && assignment.subject) {
          if (
            periodCounts[section] &&
            periodCounts[section].hasOwnProperty(assignment.subject)
          ) {
            periodCounts[section][assignment.subject]++;

            if (!dailySubjectCounts[section][day][assignment.subject]) {
              dailySubjectCounts[section][day][assignment.subject] = 0;
            }
            dailySubjectCounts[section][day][assignment.subject]++;
          }
        }
      }
    }
  }

  // Validate weekly period counts
  for (const [section, subjects] of Object.entries(periods)) {
    for (const subject of subjects) {
      if (periodCounts[section][subject] !== periodsPerSubject) {
        console.log(
          `Validation failed: ${section}-${subject} has ${periodCounts[section][subject]} periods, expected ${periodsPerSubject}`
        );
        return false;
      }
    }
  }

  // Validate daily subject limits (max 1 per day per section)
  for (const [section, dayData] of Object.entries(dailySubjectCounts)) {
    for (const [day, subjectCounts] of Object.entries(dayData)) {
      for (const [subject, count] of Object.entries(subjectCounts)) {
        if (count > 1) {
          console.log(
            `Validation failed: ${section}-${subject} has ${count} classes on ${day}, maximum allowed is 1`
          );
          return false;
        }
      }
    }
  }

  return true;
}

module.exports = {
  isSubjectAlreadyScheduledToday,
  validateRoutine,
};
