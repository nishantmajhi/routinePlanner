# backtrackSchedule Function - Line by Line Explanation

The `backtrackSchedule` function is a recursive backtracking algorithm that assigns teachers to time slots for different sections and subjects with teacher locking constraints. Here's what happens at each step:

## Function Signature

```javascript
backtrackSchedule(assignments, index);
```

- `assignments`: Array of all subject-section pairs that need to be scheduled
- `index`: Current position in the assignments array (which assignment we're trying to place)

## Line-by-Line Breakdown

### Step 1: Increment Counter

```javascript
this.backtrackingSteps++;
```

**What it does**: Tracks how many recursive calls have been made for debugging/logging purposes.

### Step 2: Base Case - Success Condition

```javascript
if (index >= assignments.length) {
  const validRoutine = validateRoutine(
    this.routine,
    this.periods,
    this.periodsPerSubject
  );
  return validRoutine;
}
```

**What it does**:

- Checks if we've successfully placed all assignments
- If `index` equals or exceeds the total number of assignments, we've completed the schedule
- Validates the entire routine to ensure it meets all constraints
- Returns `true` if valid, `false` if validation fails

### Step 3: Get Current Assignment and Check Teacher Locking

```javascript
const assignment = assignments[index];
const { section, subject } = assignment;

// Check if we have a locked teacher for this section-subject combination
const lockedTeacher = getLockedTeacher(this.sectionSubjectTeachers, section, subject);
const isFirstAssignment = isFirstAssignmentForSectionSubject(
  this.routine, 
  this.days, 
  this.timeSlots, 
  section, 
  subject
);
```

**What it does**:

- Retrieves the current assignment we're trying to place
- Extracts the section (e.g., "1A", "2B") and subject (e.g., "CSC101", "MTH102")
- **NEW**: Checks if there's already a teacher locked to this section-subject combination
- **NEW**: Determines if this is the first time we're scheduling this subject for this section

### Step 4: Try All Possible Days

```javascript
for (const day of this.days) {
```

**What it does**:

- Iterates through each day of the week (e.g., Monday, Tuesday, etc.)
- Tries to place the current assignment on each day

### Step 5: Try All Time Slots in Each Day

```javascript
for (let slotIndex = 0; slotIndex < this.timeSlots.length; slotIndex++) {
    const timeSlot = this.timeSlots[slotIndex];
```

**What it does**:

- Iterates through each time slot in the current day
- Gets the actual time slot object (contains start/end times)

### Step 6: Check if Slot is Already Occupied

```javascript
if (this.routine[day][slotIndex][section]) {
    continue;
}
```

**What it does**:

- Checks if this specific section already has something scheduled at this time slot
- If occupied, skips to the next time slot
- Prevents double-booking a section

### Step 7: Apply Subject Distribution Constraint

```javascript
if (isSubjectAlreadyScheduledToday(this.routine, day, section, subject)) {
    continue;
}
```

**What it does**:

- Ensures no section has the same subject twice in one day
- Promotes better distribution of subjects throughout the week
- If subject already scheduled today for this section, tries next slot

### Step 8: Find Available Teacher with Locking Logic

```javascript
let teacher;

if (lockedTeacher) {
  // Use the locked teacher if available at this time
  const teacherObj = Object.values(this.teachers).find(t => t.name === lockedTeacher);
  if (teacherObj && isTeacherAvailableAtSlot(teacherObj, day, timeSlot, this.routine, slotIndex)) {
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
    slotIndex
  );
}
```

**What it does**:

- **NEW LOGIC**: Implements teacher locking system
- **If teacher is locked** (already assigned to this section-subject):
  - Finds the locked teacher object
  - Checks if locked teacher is available at this time slot
  - If not available, skips this slot (ensures consistency)
- **If no locked teacher**:
  - Uses `findAvailableTeacherWithSectionConstraint` instead of basic `findAvailableTeacher`
  - This function ensures teachers don't teach multiple subjects in the same section
  - Promotes better teacher-section relationships

### Step 9: Make Assignment if Teacher Found

```javascript
if (teacher) {
    // Make the assignment
    assignTeacherToSlot(
        this.routine,
        day,
        slotIndex,
        section,
        subject,
        teacher
    );
```

**What it does**:

- If a suitable teacher was found, makes the assignment
- Updates the routine data structure with this assignment
- Records: day, time, section, subject, and teacher

### Step 10: Lock Teacher if First Assignment

```javascript
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
```

**What it does**:

- **NEW FEATURE**: Teacher locking mechanism
- If this is the first time scheduling this subject for this section AND no teacher is already locked:
  - Locks the assigned teacher to this section-subject combination
  - Updates both tracking data structures:
    - `sectionSubjectTeachers`: Maps section-subject → teacher
    - `teacherSectionSubjects`: Maps teacher → sections/subjects they teach
  - Logs the locking action for debugging

### Step 11: Recursive Call - Try to Complete Remaining Assignments

```javascript
if (this.backtrackSchedule(assignments, index + 1)) {
    return true;
}
```

**What it does**:

- Makes a recursive call with the next assignment (`index + 1`)
- If the recursive call returns `true`, it means all remaining assignments were successfully placed
- Propagates the success back up the call stack

### Step 12: Backtrack - Undo Assignment and Unlocking

```javascript
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
```

**What it does**:

- If the recursive call returned `false` (couldn't complete remaining assignments), we backtrack
- Removes the assignment we just made
- **NEW**: If we locked a teacher in this attempt, unlocks them
- Clears this slot for this section
- Continues to try the next possible placement

### Step 13: End of Loops - No Valid Placement Found

```javascript
}  // End of slotIndex loop
}  // End of day loop
return false;
```

**What it does**:

- If we've tried all days and all time slots without finding a valid placement
- Returns `false` to indicate this assignment couldn't be placed
- Triggers backtracking in the previous recursive call

## Example Flow of Algorithm

```
Assignment 0: Section 1A, Subject CSC101 (First time)
├─ Try Monday 9:00 AM → Teacher Smith found → Assign
│  ├─ LOCK: Teacher Smith to 1A-CSC101
│  ├─ Assignment 1: Section 1A, Subject CSC101 (Second period)
│  │  ├─ LOCKED TEACHER: Must use Smith
│  │  ├─ Try Monday 10:00 AM → Smith not available → Skip
│  │  ├─ Try Tuesday 9:00 AM → Smith available → Assign → Continue...
│  │  └─ If Assignment 1 fails → Backtrack
│  └─ UNLOCK: Teacher Smith from 1A-CSC101
├─ Try Monday 10:00 AM → Try again with different teacher...
└─ Continue until solution found or all options exhausted
```
