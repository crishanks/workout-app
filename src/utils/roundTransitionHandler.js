/**
 * Round Transition Handler
 * 
 * Handles edge cases during round transitions including:
 * - Round completion and data archival
 * - New round start without affecting historical data
 * - Round start date changes and boundary recalculation
 * - Data integrity validation across round boundaries
 */

import { 
  validateHealthDataInRound, 
  validateWorkoutsInRound,
  filterDataByRound,
  consistencyLogger 
} from './dataConsistencyValidator';
import { getRoundDateRange } from './roundDateUtils';

/**
 * Validate that historical round data is isolated from new round
 * @param {Object} historicalRound - Previous round data
 * @param {Object} newRound - New round data
 * @param {Array} allWorkouts - All workout sessions
 * @param {Array} allHealthData - All health data
 * @returns {Object} Validation result with any conflicts
 */
export function validateRoundDataIsolation(historicalRound, newRound, allWorkouts, allHealthData) {
  const conflicts = [];
  const warnings = [];

  if (!historicalRound || !newRound) {
    return {
      isValid: true,
      conflicts: [],
      warnings: ['Missing round data for isolation validation']
    };
  }

  // Check for date overlap
  const historicalEnd = new Date(historicalRound.endDate || historicalRound.startDate);
  const newStart = new Date(newRound.startDate);

  if (newStart <= historicalEnd) {
    conflicts.push({
      type: 'date_overlap',
      message: `New round starts (${newStart.toISOString()}) before historical round ends (${historicalEnd.toISOString()})`,
      historicalRound: historicalRound.round,
      newRound: newRound.round
    });
  }

  // Validate workouts don't cross boundaries
  if (allWorkouts && allWorkouts.length > 0) {
    const historicalWorkouts = allWorkouts.filter(w => w.round === historicalRound.round);
    const newRoundWorkouts = allWorkouts.filter(w => w.round === newRound.round);

    historicalWorkouts.forEach(workout => {
      const workoutDate = new Date(workout.date);
      if (workoutDate >= newStart) {
        conflicts.push({
          type: 'workout_boundary_violation',
          message: `Workout from round ${historicalRound.round} has date ${workout.date} that falls in new round`,
          workout
        });
      }
    });

    newRoundWorkouts.forEach(workout => {
      const workoutDate = new Date(workout.date);
      if (workoutDate <= historicalEnd) {
        conflicts.push({
          type: 'workout_boundary_violation',
          message: `Workout from round ${newRound.round} has date ${workout.date} that falls in historical round`,
          workout
        });
      }
    });
  }

  // Validate health data boundaries
  if (allHealthData && allHealthData.length > 0) {
    const { startDate: histStart, endDate: histEnd } = getRoundDateRange(historicalRound.startDate);
    const { startDate: newStartDate } = getRoundDateRange(newRound.startDate);

    const historicalHealthData = filterDataByRound(
      allHealthData,
      histStart.toISOString(),
      historicalRound.endDate || histEnd.toISOString()
    );

    const newRoundHealthData = filterDataByRound(
      allHealthData,
      newStartDate.toISOString(),
      null
    );

    if (historicalHealthData.excluded.length > 0) {
      warnings.push(`${historicalHealthData.excluded.length} health data entries from historical round fall outside expected boundaries`);
    }

    if (newRoundHealthData.excluded.length > 0) {
      warnings.push(`${newRoundHealthData.excluded.length} health data entries from new round fall outside expected boundaries`);
    }
  }

  const isValid = conflicts.length === 0;

  if (!isValid) {
    consistencyLogger.error('Round data isolation validation failed', {
      historicalRound: historicalRound.round,
      newRound: newRound.round,
      conflicts
    });
  }

  if (warnings.length > 0) {
    consistencyLogger.warn('Round data isolation warnings', {
      historicalRound: historicalRound.round,
      newRound: newRound.round,
      warnings
    });
  }

  return {
    isValid,
    conflicts,
    warnings
  };
}

/**
 * Archive round data when completing a round
 * @param {Object} roundData - Round data to archive
 * @param {Array} workouts - Workouts from this round
 * @param {Array} healthData - Health data from this round
 * @returns {Object} Archive summary
 */
export function archiveRoundData(roundData, workouts, healthData) {
  if (!roundData) {
    consistencyLogger.error('Cannot archive round data - no round data provided');
    return {
      success: false,
      error: 'No round data to archive'
    };
  }

  const { startDate, endDate } = getRoundDateRange(roundData.startDate);
  const actualEndDate = roundData.endDate || endDate.toISOString();

  // Filter data to this round
  const roundWorkouts = filterDataByRound(
    workouts || [],
    startDate.toISOString(),
    actualEndDate
  );

  const roundHealthData = filterDataByRound(
    healthData || [],
    startDate.toISOString(),
    actualEndDate
  );

  // Validate all data is within boundaries
  const workoutValidation = validateWorkoutsInRound(
    roundWorkouts.filtered,
    startDate.toISOString(),
    actualEndDate
  );

  const healthValidation = validateHealthDataInRound(
    roundHealthData.filtered,
    startDate.toISOString(),
    actualEndDate
  );

  const archive = {
    round: roundData.round,
    startDate: roundData.startDate,
    endDate: actualEndDate,
    isActive: false,
    workouts: {
      total: roundWorkouts.filtered.length,
      excluded: roundWorkouts.excluded.length,
      validation: workoutValidation
    },
    healthData: {
      total: roundHealthData.filtered.length,
      excluded: roundHealthData.excluded.length,
      validation: healthValidation
    },
    archivedAt: new Date().toISOString()
  };

  consistencyLogger.info('Round data archived', archive);

  return {
    success: true,
    archive
  };
}

/**
 * Handle round start date change and recalculate all boundaries
 * @param {string} oldStartDate - Previous start date
 * @param {string} newStartDate - New start date
 * @param {Array} workouts - All workouts for this round
 * @param {Array} healthData - All health data
 * @returns {Object} Recalculation result with affected data
 */
export function handleRoundStartDateChange(oldStartDate, newStartDate, workouts, healthData) {
  if (!oldStartDate || !newStartDate) {
    return {
      success: false,
      error: 'Missing start date for recalculation'
    };
  }

  const oldBoundaries = getRoundDateRange(oldStartDate);
  const newBoundaries = getRoundDateRange(newStartDate);

  consistencyLogger.info('Recalculating round boundaries', {
    oldStartDate,
    newStartDate,
    oldBoundaries: {
      start: oldBoundaries.startDate.toISOString(),
      end: oldBoundaries.endDate.toISOString()
    },
    newBoundaries: {
      start: newBoundaries.startDate.toISOString(),
      end: newBoundaries.endDate.toISOString()
    }
  });

  // Filter data with new boundaries
  const affectedWorkouts = filterDataByRound(
    workouts || [],
    newBoundaries.startDate.toISOString(),
    newBoundaries.endDate.toISOString()
  );

  const affectedHealthData = filterDataByRound(
    healthData || [],
    newBoundaries.startDate.toISOString(),
    newBoundaries.endDate.toISOString()
  );

  // Identify data that was in old boundaries but not in new
  const oldRoundData = filterDataByRound(
    workouts || [],
    oldBoundaries.startDate.toISOString(),
    oldBoundaries.endDate.toISOString()
  );

  const workoutsNowExcluded = oldRoundData.filtered.filter(
    w => !affectedWorkouts.filtered.find(aw => aw.id === w.id)
  );

  const workoutsNowIncluded = affectedWorkouts.filtered.filter(
    w => !oldRoundData.filtered.find(ow => ow.id === w.id)
  );

  const result = {
    success: true,
    oldBoundaries: {
      start: oldBoundaries.startDate.toISOString(),
      end: oldBoundaries.endDate.toISOString()
    },
    newBoundaries: {
      start: newBoundaries.startDate.toISOString(),
      end: newBoundaries.endDate.toISOString()
    },
    affectedData: {
      workouts: {
        total: affectedWorkouts.filtered.length,
        excluded: affectedWorkouts.excluded.length,
        nowExcluded: workoutsNowExcluded.length,
        nowIncluded: workoutsNowIncluded.length
      },
      healthData: {
        total: affectedHealthData.filtered.length,
        excluded: affectedHealthData.excluded.length
      }
    },
    warnings: []
  };

  if (workoutsNowExcluded.length > 0) {
    result.warnings.push(`${workoutsNowExcluded.length} workouts are now outside the round boundaries`);
  }

  if (workoutsNowIncluded.length > 0) {
    result.warnings.push(`${workoutsNowIncluded.length} workouts are now included in the round boundaries`);
  }

  if (affectedWorkouts.excluded.length > 0) {
    result.warnings.push(`${affectedWorkouts.excluded.length} workouts fall outside the new round boundaries`);
  }

  consistencyLogger.info('Round start date change processed', result);

  return result;
}

/**
 * Validate data integrity across round boundaries
 * @param {Array} rounds - All rounds
 * @param {Array} workouts - All workouts
 * @param {Array} healthData - All health data
 * @returns {Object} Comprehensive integrity check result
 */
export function validateDataIntegrityAcrossRounds(rounds, workouts, healthData) {
  const issues = [];
  const summary = {
    totalRounds: rounds?.length || 0,
    totalWorkouts: workouts?.length || 0,
    totalHealthData: healthData?.length || 0,
    orphanedWorkouts: 0,
    orphanedHealthData: 0,
    overlappingRounds: 0
  };

  if (!rounds || rounds.length === 0) {
    return {
      isValid: true,
      issues: [],
      summary,
      message: 'No rounds to validate'
    };
  }

  // Check for overlapping rounds
  for (let i = 0; i < rounds.length - 1; i++) {
    const currentRound = rounds[i];
    const nextRound = rounds[i + 1];

    if (!currentRound.endDate) continue;

    const currentEnd = new Date(currentRound.endDate);
    const nextStart = new Date(nextRound.startDate);

    if (nextStart <= currentEnd) {
      summary.overlappingRounds++;
      issues.push({
        type: 'overlapping_rounds',
        severity: 'error',
        message: `Round ${currentRound.round} ends after Round ${nextRound.round} starts`,
        rounds: [currentRound.round, nextRound.round]
      });
    }
  }

  // Check for orphaned workouts (workouts not in any round)
  if (workouts && workouts.length > 0) {
    workouts.forEach(workout => {
      const workoutDate = new Date(workout.date);
      let foundInRound = false;

      for (const round of rounds) {
        const { startDate, endDate } = getRoundDateRange(round.startDate);
        const roundEnd = round.endDate ? new Date(round.endDate) : endDate;

        if (workoutDate >= startDate && workoutDate <= roundEnd) {
          foundInRound = true;
          
          // Verify the workout's round number matches
          if (workout.round !== round.round) {
            issues.push({
              type: 'workout_round_mismatch',
              severity: 'warning',
              message: `Workout on ${workout.date} has round ${workout.round} but date falls in round ${round.round}`,
              workout
            });
          }
          break;
        }
      }

      if (!foundInRound) {
        summary.orphanedWorkouts++;
        issues.push({
          type: 'orphaned_workout',
          severity: 'warning',
          message: `Workout on ${workout.date} does not fall within any round boundaries`,
          workout
        });
      }
    });
  }

  // Check for orphaned health data
  if (healthData && healthData.length > 0) {
    healthData.forEach(entry => {
      const entryDate = new Date(entry.date);
      let foundInRound = false;

      for (const round of rounds) {
        const { startDate, endDate } = getRoundDateRange(round.startDate);
        const roundEnd = round.endDate ? new Date(round.endDate) : endDate;

        if (entryDate >= startDate && entryDate <= roundEnd) {
          foundInRound = true;
          break;
        }
      }

      if (!foundInRound) {
        summary.orphanedHealthData++;
      }
    });

    if (summary.orphanedHealthData > 0) {
      issues.push({
        type: 'orphaned_health_data',
        severity: 'info',
        message: `${summary.orphanedHealthData} health data entries do not fall within any round boundaries`,
        count: summary.orphanedHealthData
      });
    }
  }

  const isValid = issues.filter(i => i.severity === 'error').length === 0;

  if (!isValid) {
    consistencyLogger.error('Data integrity validation failed', { issues, summary });
  } else if (issues.length > 0) {
    consistencyLogger.warn('Data integrity warnings found', { issues, summary });
  } else {
    consistencyLogger.info('Data integrity validation passed', { summary });
  }

  return {
    isValid,
    issues,
    summary
  };
}

export default {
  validateRoundDataIsolation,
  archiveRoundData,
  handleRoundStartDateChange,
  validateDataIntegrityAcrossRounds
};
