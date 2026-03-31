/**
 * Functions for generating time slots and initializing routine structures
 */

const { timeToMinutes, minutesToTime } = require("./timeUtils");

/**
 * Generates time slots for the day, excluding break periods
 * @param {string} startTime - Start time of the day (HH:MM)
 * @param {string} breakStart - Break start time (HH:MM)
 * @param {string} breakEnd - Break end time (HH:MM)
 * @param {string} endTime - End time of the day (HH:MM)
 * @param {number} periodDuration - Duration of each period in minutes
 * @returns {Array<Object>} Array of time slots with start and end times
 */
function generateTimeSlots(
  startTime,
  breakStart,
  breakEnd,
  endTime,
  periodDuration
) {
  const slots = [];
  let currentTime = timeToMinutes(startTime);
  const breakStartMin = timeToMinutes(breakStart);
  const breakEndMin = timeToMinutes(breakEnd);
  const endTimeMin = timeToMinutes(endTime);

  while (currentTime < endTimeMin) {
    if (currentTime >= breakStartMin && currentTime < breakEndMin) {
      currentTime = breakEndMin;
      continue;
    }

    const slotEnd = currentTime + periodDuration;
    if (slotEnd > breakStartMin && currentTime < breakStartMin) {
      currentTime = breakEndMin;
      continue;
    }

    if (slotEnd > endTimeMin) {
      break;
    }

    slots.push({
      start: minutesToTime(currentTime),
      end: minutesToTime(slotEnd),
    });

    currentTime = slotEnd;
  }

  return slots;
}

/**
 * Initializes an empty routine structure for all days and sections
 * @param {Array<string>} days - Array of day names
 * @param {Array<Object>} timeSlots - Array of time slot objects
 * @param {Array<string>} sections - Array of section names
 * @returns {Object} Initialized routine object
 */
function initializeRoutine(days, timeSlots, sections) {
  const routine = {};

  for (const day of days) {
    routine[day] = [];
    for (let i = 0; i < timeSlots.length; i++) {
      const slot = {};
      for (const section of sections) {
        slot[section] = null;
      }
      routine[day].push(slot);
    }
  }

  return routine;
}

module.exports = {
  generateTimeSlots,
  initializeRoutine,
};
