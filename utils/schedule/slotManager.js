/**
 * Functions for managing slot assignments and removals in the routine
 */

/**
 * Assigns a teacher to a specific slot in the routine
 * @param {Object} routine - The routine structure to modify
 * @param {string} day - Day of the assignment
 * @param {number} slotIndex - Index of the time slot
 * @param {string} section - Section to assign
 * @param {string} subject - Subject to assign
 * @param {Object} teacher - Teacher object to assign
 */
function assignTeacherToSlot(
  routine,
  day,
  slotIndex,
  section,
  subject,
  teacher
) {
  routine[day][slotIndex][section] = {
    subject: subject,
    teacher: teacher.name,
  };
}

/**
 * Removes a teacher assignment from a specific slot in the routine
 * @param {Object} routine - The routine structure to modify
 * @param {string} day - Day of the assignment to remove
 * @param {number} slotIndex - Index of the time slot
 * @param {string} section - Section to clear
 */
function removeTeacherFromSlot(routine, day, slotIndex, section) {
  routine[day][slotIndex][section] = null;
}

module.exports = {
  assignTeacherToSlot,
  removeTeacherFromSlot,
};
