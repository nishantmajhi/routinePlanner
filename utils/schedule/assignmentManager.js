/**
 * Functions for managing assignment creation and ordering
 */

/**
 * Shuffles an array using Fisher-Yates algorithm
 * @param {Array} array - Array to shuffle
 * @returns {Array} Shuffled copy of the array
 */
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Creates all assignments for sections and subjects based on periods per subject
 * Groups assignments by section-subject and shuffles the groups for better distribution
 * @param {Object} periods - Object mapping sections to their subjects
 * @param {number} periodsPerSubject - Number of periods each subject should have per week
 * @returns {Array<Object>} Array of assignment objects with section and subject
 */
function getAllAssignments(periods, periodsPerSubject, logger) {
  const assignments = [];

  // Create individual assignments
  for (const [section, subjects] of Object.entries(periods)) {
    for (const subject of subjects) {
      for (let i = 0; i < periodsPerSubject; i++) {
        assignments.push({ section, subject });
      }
    }
  }

  logger.addLog(`\nInitial assignments: ${JSON.stringify(assignments)}`);

  // Group assignments by section-subject combination
  const groupedAssignments = {};
  for (const assignment of assignments) {
    const key = `${assignment.section}-${assignment.subject}`;
    if (!groupedAssignments[key]) {
      groupedAssignments[key] = [];
    }
    groupedAssignments[key].push(assignment);
  }

  // Shuffle the group keys for better distribution
  const groupKeys = Object.keys(groupedAssignments);
  logger.addLog(`Group keys BEFORE shuffle: ${JSON.stringify(groupKeys)}`);

  const shuffledGroupKeys = shuffleArray(groupKeys);
  logger.addLog(
    `Group keys AFTER shuffle: ${JSON.stringify(shuffledGroupKeys)}`
  );

  // Flatten the shuffled groups into final assignment list
  const finalAssignments = [];
  for (const groupKey of shuffledGroupKeys) {
    finalAssignments.push(...groupedAssignments[groupKey]);
  }
  logger.addLog(`Final assignments: ${JSON.stringify(finalAssignments)}`);

  return finalAssignments;
}

module.exports = {
  getAllAssignments,
  shuffleArray,
};
