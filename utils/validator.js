/**
 * Validate the routine generation request from frontend
 * @param {Object} requestBody - The request body from frontend
 * @returns {string|null} Error message if validation fails, null if valid
 */
function validateRoutineRequest(requestBody) {
  const {
    days,
    start_time,
    break_start,
    break_end,
    end_time,
    periods,
    period_duration,
    periods_per_subject,
  } = requestBody;

  // Check required fields
  if (!days || !Array.isArray(days) || days.length === 0) {
    return "Days must be a non-empty array";
  }

  if (!start_time || !isValidTimeFormat(start_time)) {
    return "Start time must be in HH:MM format";
  }

  if (!break_start || !isValidTimeFormat(break_start)) {
    return "Break start time must be in HH:MM format";
  }

  if (!break_end || !isValidTimeFormat(break_end)) {
    return "Break end time must be in HH:MM format";
  }

  if (!end_time || !isValidTimeFormat(end_time)) {
    return "End time must be in HH:MM format";
  }

  if (!periods || Array.isArray(periods) || periods.length === 0) {
    return "periods must be a non-empty array";
  }

  // Validate numeric fields
  const duration = Number(period_duration);
  const perSubject = Number(periods_per_subject);

  if (isNaN(duration) || duration <= 0) {
    return "Period duration must be a positive number";
  }

  if (isNaN(perSubject) || perSubject <= 0) {
    return "Periods per subject must be a positive number";
  }

  // Validate day names
  const validDays = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  for (const day of days) {
    if (!validDays.includes(day)) {
      return `Invalid day: ${day}. Must be one of: ${validDays.join(", ")}`;
    }
  }

  return null; // All validations passed
}

/**
 * Validate time sequence (start < break_start < break_end < end)
 * @param {string} start_time - Start time
 * @param {string} break_start - Break start time
 * @param {string} break_end - Break end time
 * @param {string} end_time - End time
 * @returns {string|null} Error message if validation fails, null if valid
 */
function validateTimeSequence(start_time, break_start, break_end, end_time) {
  const startMinutes = parseTime(start_time);
  const breakStartMinutes = parseTime(break_start);
  const breakEndMinutes = parseTime(break_end);
  const endMinutes = parseTime(end_time);

  if (startMinutes >= breakStartMinutes) {
    return "Start time must be before break start time";
  }

  if (breakStartMinutes >= breakEndMinutes) {
    return "Break start time must be before break end time";
  }

  if (breakEndMinutes >= endMinutes) {
    return "Break end time must be before end time";
  }

  // Check if there's enough time for at least one period before break
  if (breakStartMinutes - startMinutes < 30) {
    return "There should be at least 30 minutes between start time and break";
  }

  // Check if there's enough time for at least one period after break
  if (endMinutes - breakEndMinutes < 30) {
    return "There should be at least 30 minutes between break end and end time";
  }

  return null;
}

/**
 * Parse time string (HH:MM) to minutes since midnight
 * @param {string} timeString - Time in format "HH:MM"
 * @returns {number} Minutes since midnight
 */
function parseTime(timeString) {
  const [hours, minutes] = timeString.split(":").map(Number);
  return hours * 60 + minutes;
}

/**
 * Check if time string is in valid HH:MM format
 * @param {string} timeString - Time string to validate
 * @returns {boolean} True if valid format, false otherwise
 */
function isValidTimeFormat(timeString) {
  if (typeof timeString !== "string") return false;

  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(timeString);
}

/**
 * Validate if the schedule is feasible given the constraints
 * @param {Object} params - Schedule parameters
 * @returns {string|null} Error message if not feasible, null if feasible
 */
function validateScheduleFeasibility(params) {
  const {
    days,
    start_time,
    break_start,
    break_end,
    end_time,
    period_duration,
    sections,
    periods_per_subject,
    subjects,
  } = params;

  // Calculate available time slots per day
  const startMinutes = parseTime(start_time);
  const breakStartMinutes = parseTime(break_start);
  const breakEndMinutes = parseTime(break_end);
  const endMinutes = parseTime(end_time);

  const timeBeforeBreak = breakStartMinutes - startMinutes;
  const timeAfterBreak = endMinutes - breakEndMinutes;
  const totalAvailableTime = timeBeforeBreak + timeAfterBreak;

  const periodsPerDay = Math.floor(totalAvailableTime / period_duration);
  const totalPeriodsAvailable = periodsPerDay * days.length;
  const totalPeriodsRequired = subjects.length * periods_per_subject;

  if (totalPeriodsRequired > totalPeriodsAvailable) {
    return `Schedule not feasible: Need ${totalPeriodsRequired} periods but only ${totalPeriodsAvailable} slots available (${periodsPerDay} periods/day × ${days.length} days)`;
  }

  return null;
}

module.exports = {
  validateRoutineRequest,
  validateTimeSequence,
  validateScheduleFeasibility,
  isValidTimeFormat,
};
