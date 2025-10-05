/**
 * Progress Tracker - Manages progress calculations and display
 */
import {
  getCurrentDateInfo,
  calculateProgress,
  formatProgressText,
  parseDate,
  validateDateRange,
} from "../utils/date-utils.js";

export class ProgressTracker {
  constructor() {
    this.dateInfo = getCurrentDateInfo();
    this.customStartInput = document.getElementById("custom-start");
    this.customEndInput = document.getElementById("custom-end");
    this.dateInfoElement = document.getElementById("date-info");
    this.customRangeManager = null;

    this.init();
  }

  /**
   * Initialize progress tracker
   */
  init() {
    this.bindEvents();
    this.updateAllProgress();
    this.updateDateInfo();

    // Update every minute
    setInterval(() => {
      this.dateInfo = getCurrentDateInfo();
      this.updateAllProgress();
      this.updateDateInfo();
    }, 60000);
  }

  /**
   * Bind event listeners
   */
  bindEvents() {
    this.customStartInput?.addEventListener("change", () =>
      this.updateCustomProgress()
    );
    this.customEndInput?.addEventListener("change", () =>
      this.updateCustomProgress()
    );
  }

  /**
   * Update all progress bars
   */
  updateAllProgress() {
    this.updateYearProgress();
    this.updateMonthProgress();
    this.updateWeekProgress();
    this.updateDayProgress();
    this.updateCustomProgress();
  }

  /**
   * Update year progress
   */
  updateYearProgress() {
    const { year } = this.dateInfo;
    const progress = calculateProgress(year.start, year.end, this.dateInfo.now);
    const text = formatProgressText(
      progress,
      year.start,
      year.end,
      this.dateInfo.now
    );

    this.updateProgressBar("year", progress);
    this.updateProgressText("year", text);
  }

  /**
   * Update month progress
   */
  updateMonthProgress() {
    const { month } = this.dateInfo;
    const progress = calculateProgress(
      month.start,
      month.end,
      this.dateInfo.now
    );
    const text = formatProgressText(
      progress,
      month.start,
      month.end,
      this.dateInfo.now
    );

    this.updateProgressBar("month", progress);
    this.updateProgressText("month", text);
  }

  /**
   * Update week progress
   */
  updateWeekProgress() {
    const { week } = this.dateInfo;
    const progress = calculateProgress(week.start, week.end, this.dateInfo.now);
    const text = formatProgressText(
      progress,
      week.start,
      week.end,
      this.dateInfo.now
    );

    this.updateProgressBar("week", progress);
    this.updateProgressText("week", text);
  }

  /**
   * Update day progress
   */
  updateDayProgress() {
    const { day } = this.dateInfo;
    const progress = calculateProgress(day.start, day.end, this.dateInfo.now);
    const hours = this.dateInfo.now.getHours();
    const minutes = this.dateInfo.now.getMinutes();
    const totalMinutes = hours * 60 + minutes;
    const text = `${progress.toFixed(
      1
    )}% complete (${hours}h ${minutes}m elapsed)`;

    this.updateProgressBar("day", progress);
    this.updateProgressText("day", text);
  }

  /**
   * Update custom range progress
   */
  updateCustomProgress() {
    const startDate = parseDate(this.customStartInput?.value);
    const endDate = parseDate(this.customEndInput?.value);

    if (!startDate || !endDate) {
      this.updateProgressBar("custom", 0);
      this.updateProgressText("custom", "Please select start and end dates");
      return;
    }

    const validation = validateDateRange(startDate, endDate);
    if (!validation.isValid) {
      this.updateProgressBar("custom", 0);
      this.updateProgressText("custom", validation.errors.join(", "));
      return;
    }

    const progress = calculateProgress(startDate, endDate, this.dateInfo.now);
    const text = formatProgressText(
      progress,
      startDate,
      endDate,
      this.dateInfo.now
    );

    this.updateProgressBar("custom", progress);
    this.updateProgressText("custom", text);
  }

  /**
   * Update progress bar width
   * @param {string} type - Progress type (year, month, week, day, custom)
   * @param {number} percentage - Progress percentage
   */
  updateProgressBar(type, percentage) {
    const progressBar = document.getElementById(`progress-bar-${type}`);
    if (progressBar) {
      progressBar.style.width = `${Math.max(0, Math.min(100, percentage))}%`;

      // Add completion animation if 100%
      if (percentage >= 100) {
        progressBar.classList.add("completed");
      } else {
        progressBar.classList.remove("completed");
      }
    }
  }

  /**
   * Update progress text
   * @param {string} type - Progress type
   * @param {string} text - Progress text
   */
  updateProgressText(type, text) {
    const progressText = document.getElementById(`progress-text-${type}`);
    if (progressText) {
      progressText.textContent = text;
    }
  }

  /**
   * Update date information display
   */
  updateDateInfo() {
    if (this.dateInfoElement) {
      const { day, date, month, year } = this.dateInfo;
      this.dateInfoElement.textContent = `${day}, ${date} ${month} ${year}`;
    }
  }

  /**
   * Get progress data for sharing
   * @returns {Object} Progress data
   */
  getProgressData() {
    const { year, month, week, day } = this.dateInfo;

    return {
      year: {
        percentage: calculateProgress(year.start, year.end, this.dateInfo.now),
        text: formatProgressText(
          calculateProgress(year.start, year.end, this.dateInfo.now),
          year.start,
          year.end,
          this.dateInfo.now
        ),
      },
      month: {
        percentage: calculateProgress(
          month.start,
          month.end,
          this.dateInfo.now
        ),
        text: formatProgressText(
          calculateProgress(month.start, month.end, this.dateInfo.now),
          month.start,
          month.end,
          this.dateInfo.now
        ),
      },
      week: {
        percentage: calculateProgress(week.start, week.end, this.dateInfo.now),
        text: formatProgressText(
          calculateProgress(week.start, week.end, this.dateInfo.now),
          week.start,
          week.end,
          this.dateInfo.now
        ),
      },
      day: {
        percentage: calculateProgress(day.start, day.end, this.dateInfo.now),
        text: formatProgressText(
          calculateProgress(day.start, day.end, this.dateInfo.now),
          day.start,
          day.end,
          this.dateInfo.now
        ),
      },
      timestamp: this.dateInfo.now.toISOString(),
    };
  }

  /**
   * Set custom date range
   * @param {string} startDate - Start date string
   * @param {string} endDate - End date string
   */
  setCustomRange(startDate, endDate) {
    if (this.customStartInput) {
      this.customStartInput.value = startDate;
    }
    if (this.customEndInput) {
      this.customEndInput.value = endDate;
    }
    this.updateCustomProgress();
  }

  /**
   * Set custom range manager reference
   * @param {CustomRangeManager} customRangeManager - Reference to custom range manager
   */
  setCustomRangeManager(customRangeManager) {
    this.customRangeManager = customRangeManager;
  }
}
