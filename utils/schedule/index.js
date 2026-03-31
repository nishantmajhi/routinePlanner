/**
 * Barrel export file for schedule utilities
 * This file re-exports all functions from individual modules,
 * maintaining backward compatibility while providing better organization
 */

// Time utilities
const { timeToMinutes, minutesToTime } = require("./timeUtils");

// Slot generation
const { generateTimeSlots, initializeRoutine } = require("./slotGenerator");

// Assignment management
const { getAllAssignments, shuffleArray } = require("./assignmentManager");

// Schedule constraints
const {
  isSubjectAlreadyScheduledToday,
  validateRoutine,
} = require("./scheduleConstraints");

// Teacher management
const {
  findAvailableTeacher,
  findAvailableTeacherWithSectionConstraint,
  getTeacherCurrentWorkload,
  isTeacherAvailable,
  isTeacherAvailableAtSlot,
  teacherAlreadyTeachesInSection,
} = require("./teacherManager");

// Slot management
const { assignTeacherToSlot, removeTeacherFromSlot } = require("./slotManager");

// Teacher locking
const {
  getLockedTeacher,
  lockTeacherToSectionSubject,
  unlockTeacherFromSectionSubject,
  isFirstAssignmentForSectionSubject,
} = require("./teacherLocking");

// Routine formatting
const { formatRoutineWithTimeSlots } = require("./routineFormatter");

// Re-export everything for backward compatibility
module.exports = {
  // Time utilities
  timeToMinutes,
  minutesToTime,

  // Slot generation
  generateTimeSlots,
  initializeRoutine,

  // Assignment management
  getAllAssignments,
  shuffleArray,

  // Schedule constraints
  isSubjectAlreadyScheduledToday,
  validateRoutine,

  // Teacher management
  findAvailableTeacher,
  findAvailableTeacherWithSectionConstraint,
  getTeacherCurrentWorkload,
  isTeacherAvailableAtSlot,
  teacherAlreadyTeachesInSection,

  // Slot management
  assignTeacherToSlot,
  removeTeacherFromSlot,

  // Teacher locking
  getLockedTeacher,
  lockTeacherToSectionSubject,
  unlockTeacherFromSectionSubject,
  isFirstAssignmentForSectionSubject,

  // Routine formatting
  formatRoutineWithTimeSlots,
};
