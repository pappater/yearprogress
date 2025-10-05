/**
 * Date Utilities - Helper functions for date calculations
 */

/**
 * Get current date information
 * @returns {Object} Date information object
 */
export function getCurrentDateInfo() {
  const now = new Date();
  const year = now.getFullYear();
  const startOfYear = new Date(year, 0, 1);
  const endOfYear = new Date(year, 11, 31, 23, 59, 59, 999);

  const month = now.getMonth();
  const startOfMonth = new Date(year, month, 1);
  const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59, 999);

  // Week calculation (Monday as start of week)
  const startOfWeek = new Date(now);
  const dayOfWeek = now.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  startOfWeek.setDate(now.getDate() + mondayOffset);
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(now);
  endOfDay.setHours(23, 59, 59, 999);

  return {
    now,
    year: {
      start: startOfYear,
      end: endOfYear,
      current: year,
    },
    month: {
      start: startOfMonth,
      end: endOfMonth,
      current: month + 1,
    },
    week: {
      start: startOfWeek,
      end: endOfWeek,
    },
    day: {
      start: startOfDay,
      end: endOfDay,
    },
  };
}

/**
 * Calculate progress percentage between two dates
 * @param {Date} start - Start date
 * @param {Date} end - End date
 * @param {Date} current - Current date
 * @returns {number} Progress percentage (0-100)
 */
export function calculateProgress(start, end, current = new Date()) {
  if (current < start) return 0;
  if (current > end) return 100;

  const total = end.getTime() - start.getTime();
  const elapsed = current.getTime() - start.getTime();

  return Math.min(100, Math.max(0, (elapsed / total) * 100));
}

/**
 * Format progress text
 * @param {number} percentage - Progress percentage
 * @param {Date} start - Start date
 * @param {Date} end - End date
 * @param {Date} current - Current date
 * @returns {string} Formatted progress text
 */
export function formatProgressText(
  percentage,
  start,
  end,
  current = new Date()
) {
  const total = Math.ceil(
    (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
  );
  const elapsed = Math.floor(
    (current.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
  );
  const remaining = Math.max(0, total - elapsed);

  return `${percentage.toFixed(
    1
  )}% complete (${elapsed}/${total} days, ${remaining} remaining)`;
}

/**
 * Format date for display
 * @param {Date} date - Date to format
 * @param {Object} options - Formatting options
 * @returns {string} Formatted date string
 */
export function formatDate(date, options = {}) {
  const defaultOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
    ...options,
  };

  return date.toLocaleDateString(undefined, defaultOptions);
}

/**
 * Format time for display
 * @param {Date} date - Date to format
 * @param {Object} options - Formatting options
 * @returns {string} Formatted time string
 */
export function formatTime(date, options = {}) {
  const defaultOptions = {
    hour: "2-digit",
    minute: "2-digit",
    ...options,
  };

  return date.toLocaleTimeString(undefined, defaultOptions);
}

/**
 * Get relative time string
 * @param {Date} date - Target date
 * @param {Date} reference - Reference date (default: now)
 * @returns {string} Relative time string
 */
export function getRelativeTime(date, reference = new Date()) {
  const diffMs = date.getTime() - reference.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  if (diffDays === -1) return "Yesterday";
  if (diffDays > 0) return `In ${diffDays} days`;
  return `${Math.abs(diffDays)} days ago`;
}

/**
 * Parse date string to Date object
 * @param {string} dateString - Date string to parse
 * @returns {Date|null} Parsed date or null if invalid
 */
export function parseDate(dateString) {
  if (!dateString) return null;

  const date = new Date(dateString);
  return isNaN(date.getTime()) ? null : date;
}

/**
 * Check if a date is valid
 * @param {Date} date - Date to validate
 * @returns {boolean} True if valid date
 */
export function isValidDate(date) {
  return date instanceof Date && !isNaN(date.getTime());
}

/**
 * Get days in month
 * @param {number} year - Year
 * @param {number} month - Month (0-11)
 * @returns {number} Number of days in month
 */
export function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

/**
 * Get week number of year
 * @param {Date} date - Date to get week number for
 * @returns {number} Week number (1-53)
 */
export function getWeekNumber(date) {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
}

/**
 * Create date range validation
 * @param {Date} start - Start date
 * @param {Date} end - End date
 * @returns {Object} Validation result
 */
export function validateDateRange(start, end) {
  const errors = [];

  if (!isValidDate(start)) {
    errors.push("Start date is invalid");
  }

  if (!isValidDate(end)) {
    errors.push("End date is invalid");
  }

  if (isValidDate(start) && isValidDate(end) && start >= end) {
    errors.push("End date must be after start date");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
