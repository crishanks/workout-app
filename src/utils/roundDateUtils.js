/**
 * Round Date Utilities
 * 
 * Provides date boundary calculations for 12-week training rounds.
 * All functions handle timezone considerations and edge cases.
 */

/**
 * Get the date boundaries for a specific week within a round
 * @param {string} roundStartDate - ISO date string of round start (YYYY-MM-DD)
 * @param {number} weekNumber - Week number (1-12)
 * @returns {{ startDate: Date, endDate: Date }} Week boundaries
 * @throws {Error} If weekNumber is not between 1 and 12
 */
export function getRoundWeekBoundaries(roundStartDate, weekNumber) {
  if (weekNumber < 1 || weekNumber > 12) {
    throw new Error('Week number must be between 1 and 12');
  }

  const startDate = new Date(roundStartDate);
  
  // Calculate the start of the specified week
  const weekStartDate = new Date(startDate);
  weekStartDate.setDate(startDate.getDate() + (weekNumber - 1) * 7);
  
  // Calculate the end of the specified week (6 days later, end of day)
  const weekEndDate = new Date(weekStartDate);
  weekEndDate.setDate(weekStartDate.getDate() + 6);
  weekEndDate.setHours(23, 59, 59, 999);
  
  return {
    startDate: weekStartDate,
    endDate: weekEndDate
  };
}

/**
 * Get the full date range for a round (12 weeks = 84 days)
 * @param {string} roundStartDate - ISO date string of round start (YYYY-MM-DD)
 * @returns {{ startDate: Date, endDate: Date }} Round boundaries
 */
export function getRoundDateRange(roundStartDate) {
  const startDate = new Date(roundStartDate);
  
  // 12 weeks = 84 days, end date is 83 days after start (inclusive)
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 83);
  endDate.setHours(23, 59, 59, 999);
  
  return {
    startDate,
    endDate
  };
}

/**
 * Determine which week number a date falls into within a round
 * @param {string} roundStartDate - ISO date string of round start (YYYY-MM-DD)
 * @param {string|Date} date - Date to check
 * @returns {number|null} Week number (1-12) or null if outside round
 */
export function getWeekNumberFromDate(roundStartDate, date) {
  const startDate = new Date(roundStartDate);
  const checkDate = new Date(date);
  
  // Normalize to start of day for comparison
  startDate.setHours(0, 0, 0, 0);
  checkDate.setHours(0, 0, 0, 0);
  
  // Calculate days difference
  const diffTime = checkDate - startDate;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  // Check if date is before round start
  if (diffDays < 0) {
    return null;
  }
  
  // Calculate week number (1-indexed)
  const weekNumber = Math.floor(diffDays / 7) + 1;
  
  // Check if date is after round end (week 12)
  if (weekNumber > 12) {
    return null;
  }
  
  return weekNumber;
}

/**
 * Check if a date falls within a round's boundaries
 * @param {string|Date} date - Date to check
 * @param {string} roundStartDate - ISO date string of round start (YYYY-MM-DD)
 * @param {string} [roundEndDate] - ISO date string of round end (optional, defaults to 12 weeks)
 * @returns {boolean} True if date is within round boundaries
 */
export function isDateInRound(date, roundStartDate, roundEndDate) {
  const checkDate = new Date(date);
  const startDate = new Date(roundStartDate);
  
  // Normalize to start of day for comparison
  checkDate.setHours(0, 0, 0, 0);
  startDate.setHours(0, 0, 0, 0);
  
  // If no end date provided, calculate 12-week end date
  let endDate;
  if (roundEndDate) {
    endDate = new Date(roundEndDate);
  } else {
    endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 83); // 12 weeks = 84 days (0-83)
  }
  endDate.setHours(23, 59, 59, 999);
  
  return checkDate >= startDate && checkDate <= endDate;
}

/**
 * Get all week boundaries for a round
 * @param {string} roundStartDate - ISO date string of round start (YYYY-MM-DD)
 * @returns {Array<{ week: number, startDate: Date, endDate: Date }>} Array of 12 weeks with boundaries
 */
export function getAllRoundWeeks(roundStartDate) {
  const weeks = [];
  
  for (let weekNumber = 1; weekNumber <= 12; weekNumber++) {
    const boundaries = getRoundWeekBoundaries(roundStartDate, weekNumber);
    weeks.push({
      week: weekNumber,
      startDate: boundaries.startDate,
      endDate: boundaries.endDate
    });
  }
  
  return weeks;
}
