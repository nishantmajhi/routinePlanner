const Loader = require("../model/Loader");
const Logger = require("../utils/Logger");
const {
  generateTimeSlots,
  initializeRoutine,
  getAllAssignments,
  assignTeacherToSlot,
  removeTeacherFromSlot,
  validateRoutine,
  isSubjectAlreadyScheduledToday,
  formatRoutineWithTimeSlots,
  getLockedTeacher,
  lockTeacherToSectionSubject,
  unlockTeacherFromSectionSubject,
  isFirstAssignmentForSectionSubject,
  findAvailableTeacherWithSectionConstraint,
  isTeacherAvailableAtSlot,
} = require("../utils/schedule");

class RoutinePlanner {
  constructor({
    days,
    start_time,
    break_start,
    break_end,
    end_time,
    periods,
    period_duration,
    periods_per_subject,
  }) {
    this.days = days;
    this.startTime = start_time;
    this.breakStart = break_start;
    this.breakEnd = break_end;
    this.endTime = end_time;
    this.periods = periods; // { "1A": ["CSC101", "MTH102"], "1B": ["CSC101", "MTH102"], "2A": ["CSC201", "MTH202"], and so on};
    this.periodDuration = period_duration;
    this.periodsPerSubject = periods_per_subject; // In a week
    this.loader = new Loader();
    this.teachers = {};
    this.routine = {};
    this.timeSlots = [];
    this.backtrackingSteps = 0;
    this.sectionSubjectTeachers = {};
    this.teacherSectionSubjects = {};
    this.logger = new Logger();
    this.timestamp = new Date(Date.now() + 5.75 * 60 * 60 * 1000)
      .toISOString()
      .replace(/[:]/g, "-")
      .replace("T", "_")
      .slice(0, 19);
  }

  async generate() {
    try {
      this.logger.addLog("Starting routine generation...");
      this.logger.addLog("this.days = " + JSON.stringify(this.days));
      this.logger.addLog("this.startTime = " + this.startTime);
      this.logger.addLog("this.breakStart = " + this.breakStart);
      this.logger.addLog("this.breakEnd = " + this.breakEnd);
      this.logger.addLog("this.endTime = " + this.endTime);
      this.logger.addLog("this.periods = " + JSON.stringify(this.periods));
      this.logger.addLog("this.periodDuration = " + this.periodDuration);
      this.logger.addLog("this.periodsPerSubject = " + this.periodsPerSubject);

      this.teachers = await this.loader.loadTeachers();
      this.logger.addLog(
        `\nLoaded ${Object.keys(this.teachers).length} teachers`
      );
      this.logger.addLog(`this.teachers = ${JSON.stringify(this.teachers)}`);

      this.timeSlots = generateTimeSlots(
        this.startTime,
        this.breakStart,
        this.breakEnd,
        this.endTime,
        this.periodDuration
      );
      this.logger.addLog(
        `Generated ${this.timeSlots.length} time slots per day`
      );
      this.logger.addLog(`this.timeSlots = ${JSON.stringify(this.timeSlots)}`);

      const sections = Object.keys(this.periods);
      this.routine = initializeRoutine(this.days, this.timeSlots, sections);

      const assignments = getAllAssignments(
        this.periods,
        this.periodsPerSubject,
        this.logger
      );
      this.logger.addLog(`Total assignments to make: ${assignments.length}`);

      const schedule = this.backtrackSchedule(assignments, 0);
      if (!schedule) {
        this.logger.addLog(
          "\nFailed to generate complete routine - no valid solution found"
        );

        this.logger.saveLogToFile(`routine_${this.timestamp}.log`);
        return false;
      }

      this.logger.addLog(
        `\nRoutine generation completed successfully in ${this.backtrackingSteps} steps`
      );
      this.logger.addLog(`Generated routine = ${JSON.stringify(this.routine)}`);

      const formattedRoutine = formatRoutineWithTimeSlots(
        this.routine,
        this.timeSlots
      );
      this.logger.addLog(
        `Formatted routine = ${JSON.stringify(formattedRoutine)}\n`
      );

      this.logger.saveLogToFile(`routine_${this.timestamp}.log`);
      return formattedRoutine;
    } catch (error) {
      this.logger.addLog(`\nError during routine generation: ${error.message}`);
      this.logger.saveLogToFile(`routine_${this.timestamp}.log`);

      throw error;
    }
  }

  backtrackSchedule(assignments, index) {
    // Start the backtracking algorithm
    this.backtrackingSteps++;

    // Base case: all assignments have been made
    if (index >= assignments.length) {
      const validRoutine = validateRoutine(
        this.routine,
        this.periods,
        this.periodsPerSubject
      );
      return validRoutine;
    }

    const assignment = assignments[index];
    const { section, subject } = assignment;

    this.logger.addLog(
      `\n[Step ${this.backtrackingSteps}] Attempting assignment ${index + 1}/${
        assignments.length
      }: ${section}-${subject}`
    );

    // Check if we have a locked teacher for this section-subject combination
    const lockedTeacher = getLockedTeacher(
      this.sectionSubjectTeachers,
      section,
      subject
    );
    const isFirstAssignment = isFirstAssignmentForSectionSubject(
      this.routine,
      this.days,
      this.timeSlots,
      section,
      subject
    );

    if (lockedTeacher) {
      this.logger.addLog(`  >> Locked teacher: ${lockedTeacher}`);
    } else {
      this.logger.addLog(`  >> No locked teacher, will search for available`);
    }

    // Try to assign this subject to each available slot
    for (const day of this.days) {
      for (let slotIndex = 0; slotIndex < this.timeSlots.length; slotIndex++) {
        const timeSlot = this.timeSlots[slotIndex];

        // Skip if slot is already occupied for this section
        if (this.routine[day][slotIndex][section]) {
          continue;
        }

        // CONSTRAINT: Check if this subject is already scheduled today for this section
        if (
          isSubjectAlreadyScheduledToday(this.routine, day, section, subject)
        ) {
          continue;
        }

        let teacher;

        if (lockedTeacher) {
          // Use the locked teacher if available at this time
          const teacherObj = Object.values(this.teachers).find(
            (t) => t.name === lockedTeacher
          );
          if (
            teacherObj &&
            isTeacherAvailableAtSlot(
              teacherObj,
              day,
              timeSlot,
              this.routine,
              slotIndex
            )
          ) {
            teacher = teacherObj;
          } else {
            // Locked teacher not available, try next slot
            continue;
          }
        } else {
          // No locked teacher, find any available teacher
          teacher = findAvailableTeacherWithSectionConstraint(
            this.teachers,
            this.teacherSectionSubjects,
            this.routine,
            subject,
            section,
            day,
            timeSlot,
            slotIndex,
            this.logger
          );
        }

        if (teacher) {
          this.logger.addLog(
            `  >> Trying ${day} ${timeSlot.start}-${timeSlot.end} with ${teacher.name}`
          );

          // Make the assignment
          assignTeacherToSlot(
            this.routine,
            day,
            slotIndex,
            section,
            subject,
            teacher
          );

          // Lock the teacher if this is the first assignment for this section-subject
          const shouldLock = isFirstAssignment && !lockedTeacher;
          if (shouldLock) {
            lockTeacherToSectionSubject(
              this.sectionSubjectTeachers,
              this.teacherSectionSubjects,
              this.logger,
              section,
              subject,
              teacher.name
            );
          }

          // Recursively try to complete the remaining assignments
          if (this.backtrackSchedule(assignments, index + 1)) {
            return true;
          }

          this.logger.addLog(
            `  >> BACKTRACK: Removing ${teacher.name} from ${day} ${timeSlot.start}-${timeSlot.end} for ${section}-${subject}`
          );

          // Backtrack: remove the assignment
          removeTeacherFromSlot(this.routine, day, slotIndex, section);

          // Unlock the teacher if we locked them in this attempt
          if (shouldLock) {
            unlockTeacherFromSectionSubject(
              this.sectionSubjectTeachers,
              this.teacherSectionSubjects,
              this.logger,
              section,
              subject
            );
          }
        }
      }
    }

    this.logger.addLog(
      `  >> FAILED: No valid slot found for ${section}-${subject}`
    );

    return false;
  }
}

module.exports = RoutinePlanner;
