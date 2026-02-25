# Round Transition Handling Guide

This guide explains how round transitions are handled in the application, including edge cases and data integrity validation.

## Overview

Round transitions occur when:
1. A round completes (after 84 days / 12 weeks)
2. A user starts a new round
3. A user changes the round start date
4. A user restarts a round

The round transition handler ensures data integrity across these transitions and prevents data corruption or loss.

## Key Features

### 1. Round Completion and Data Archival

When a round completes:
- The round's end date is automatically set to exactly 84 days after the start date
- All workout and health data is validated to ensure it falls within the round boundaries
- The round is marked as inactive (`isActive: false`)
- Data is archived with metadata for historical reference

**Implementation:**
```javascript
const { archiveCurrentRound } = useRoundData();

// Archive round data before ending
const archiveResult = archiveCurrentRound(workoutHistory, healthData);
if (archiveResult.success) {
  console.log('Round archived:', archiveResult.archive);
}
```

### 2. Round Data Isolation

When starting a new round:
- The new round's start date must not overlap with any historical round's date range
- Workouts and health data are automatically filtered by round boundaries
- Historical round data remains unchanged and isolated

**Validation:**
```javascript
const { validateDataIsolation } = useRoundData();

const validation = validateDataIsolation(
  historicalRound,
  newRound,
  allWorkouts,
  allHealthData
);

if (!validation.isValid) {
  console.error('Round isolation issues:', validation.conflicts);
}
```

### 3. Round Start Date Changes

When a user changes the round start date:
- All week boundaries are automatically recalculated
- Data is re-filtered to match the new boundaries
- Warnings are shown if workouts fall outside the new boundaries
- UI components automatically update to reflect the new boundaries

**Implementation:**
```javascript
const { handleStartDateChange } = useRoundData();

const result = handleStartDateChange(
  newStartDate,
  workoutHistory,
  healthData
);

if (result.warnings.length > 0) {
  console.warn('Date change warnings:', result.warnings);
}
```

### 4. Data Integrity Validation

Comprehensive validation across all rounds:
- Detects overlapping rounds
- Identifies orphaned workouts (workouts not in any round)
- Finds workout round number mismatches
- Validates health data boundaries

**Usage:**
```javascript
import { validateDataIntegrityAcrossRounds } from './roundTransitionHandler';

const integrity = validateDataIntegrityAcrossRounds(
  allRounds,
  allWorkouts,
  allHealthData
);

if (!integrity.isValid) {
  console.error('Data integrity issues:', integrity.issues);
}
```

## UI Indicators

### Transition States

The app shows loading indicators during round transitions:

```javascript
const [isTransitioning, setIsTransitioning] = useState(false);

// Show transition indicator
if (isTransitioning) {
  return <div>Processing round transition...</div>;
}
```

### Date Change Warnings

When changing the round start date, users see warnings if data will be affected:

```javascript
// In Header component
{dateChangeWarning && (
  <div className="date-modal-warning">
    ⚠️ {dateChangeWarning}
  </div>
)}
```

## Edge Cases Handled

### 1. Round Overlap Prevention

**Problem:** New round starts before previous round ends
**Solution:** Validation detects overlap and prevents data corruption

```javascript
// Detected: Round 2 starts on 2024-03-20
// But Round 1 ends on 2024-03-25
// Result: Conflict detected, user notified
```

### 2. Orphaned Workouts

**Problem:** Workouts exist outside any round boundaries
**Solution:** Identified and logged, can be reassigned to correct round

```javascript
// Workout on 2024-05-01 doesn't fall in any round
// Result: Marked as orphaned, shown separately in UI
```

### 3. Week Boundary Recalculation

**Problem:** Changing start date invalidates existing week numbers
**Solution:** All boundaries recalculated, data re-filtered automatically

```javascript
// Old start: 2024-01-01, Week 1: Jan 1-7
// New start: 2024-01-08, Week 1: Jan 8-14
// Result: All week boundaries updated, UI refreshes
```

### 4. Historical Data Preservation

**Problem:** Starting new round might affect historical data
**Solution:** Data isolation ensures historical rounds remain unchanged

```javascript
// Round 1 data: Jan 1 - Mar 25
// Round 2 starts: Mar 26
// Result: Round 1 data frozen, Round 2 data separate
```

## Logging and Debugging

All round transitions are logged for debugging:

```javascript
// Round start
console.log('[RoundManager] Starting new round', {
  round: 2,
  startDate: '2024-03-26T00:00:00.000Z',
  previousRound: 1
});

// Round end
console.log('[RoundManager] Ending round', {
  round: 1,
  startDate: '2024-01-01T00:00:00.000Z',
  endDate: '2024-03-25T23:59:59.999Z',
  daysElapsed: 84
});

// Date change
console.log('[RoundManager] Updating round start date', {
  round: 1,
  oldStartDate: '2024-01-01T00:00:00.000Z',
  newStartDate: '2024-01-08T00:00:00.000Z',
  willRecalculateBoundaries: true
});
```

## Testing

Comprehensive tests cover all edge cases:

```bash
npm test roundTransitionHandler.test.js
```

Test coverage includes:
- Round data isolation validation
- Data archival
- Start date change handling
- Data integrity across rounds
- Orphaned data detection
- Overlapping round detection

## Best Practices

1. **Always archive before ending a round**
   ```javascript
   archiveCurrentRound(workouts, healthData);
   endRound();
   ```

2. **Validate data isolation when starting new rounds**
   ```javascript
   const validation = validateDataIsolation(oldRound, newRound, workouts, healthData);
   if (!validation.isValid) {
     // Handle conflicts
   }
   ```

3. **Show UI indicators during transitions**
   ```javascript
   setIsTransitioning(true);
   // Perform transition
   setTimeout(() => setIsTransitioning(false), 500);
   ```

4. **Log all round operations for debugging**
   ```javascript
   console.log('[Component] Round operation', { details });
   ```

## Troubleshooting

### Issue: Workouts showing in wrong round

**Cause:** Round start date changed after workouts were logged
**Solution:** Use `handleStartDateChange` to recalculate boundaries

### Issue: Data missing after round transition

**Cause:** Data not properly archived before ending round
**Solution:** Always call `archiveCurrentRound` before `endRound`

### Issue: Overlapping round dates

**Cause:** New round started before previous round ended
**Solution:** Use `validateDataIsolation` to detect and prevent overlaps

## API Reference

### `archiveRoundData(roundData, workouts, healthData)`
Archives round data with validation.

**Returns:** `{ success: boolean, archive?: Object, error?: string }`

### `validateRoundDataIsolation(historicalRound, newRound, workouts, healthData)`
Validates that rounds don't overlap and data is properly isolated.

**Returns:** `{ isValid: boolean, conflicts: Array, warnings: Array }`

### `handleRoundStartDateChange(oldStartDate, newStartDate, workouts, healthData)`
Handles start date changes and recalculates boundaries.

**Returns:** `{ success: boolean, oldBoundaries: Object, newBoundaries: Object, affectedData: Object, warnings: Array }`

### `validateDataIntegrityAcrossRounds(rounds, workouts, healthData)`
Comprehensive validation across all rounds.

**Returns:** `{ isValid: boolean, issues: Array, summary: Object }`

## Related Files

- `src/utils/roundTransitionHandler.js` - Core transition logic
- `src/hooks/useRoundData.js` - Round data hook with transition methods
- `src/hooks/useRoundManager.js` - Round state management
- `src/App.jsx` - Main app with transition handling
- `src/components/Header/Header.jsx` - Date change UI
