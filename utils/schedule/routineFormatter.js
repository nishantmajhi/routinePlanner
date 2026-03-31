/**
 * Functions for formatting routine output and display
 */

/**
 * Formats the routine with time slots for final output
 * Converts the internal routine structure to a more readable format
 * @param {Object} routine - The completed routine structure
 * @param {Array<Object>} timeSlots - Array of time slot objects
 * @returns {Object} Formatted routine with time slots and class assignments
 */
function formatRoutineWithTimeSlots(routine, timeSlots) {
  const formattedRoutine = {};

  for (const [day, slots] of Object.entries(routine)) {
    formattedRoutine[day] = [];

    for (let slotIndex = 0; slotIndex < slots.length; slotIndex++) {
      const slot = slots[slotIndex];
      const timeSlot = timeSlots[slotIndex];

      const formattedSlot = {
        timeSlot: {
          start: timeSlot.start,
          end: timeSlot.end,
        },
        classes: {},
      };

      for (const [section, assignment] of Object.entries(slot)) {
        if (assignment && assignment.subject && assignment.teacher) {
          formattedSlot.classes[section] = {
            subject: assignment.subject,
            teacher: assignment.teacher,
          };
        } else {
          formattedSlot.classes[section] = null;
        }
      }

      formattedRoutine[day].push(formattedSlot);
    }
  }

  return formattedRoutine;
}

module.exports = {
  formatRoutineWithTimeSlots,
};
