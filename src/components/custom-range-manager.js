/**
 * Custom Range Manager - Handles custom date range functionality and storage
 */
import {
  findOrCreateMilestoneGist,
  loadMilestonesFromGist,
  saveMilestonesToGist,
} from "../../gist.js";

export class CustomRangeManager {
  constructor(progressTracker = null, authManager = null) {
    this.progressTracker = progressTracker;
    this.authManager = authManager;
    this.currentRange = null;

    // DOM elements
    this.startInput = document.getElementById("custom-start");
    this.endInput = document.getElementById("custom-end");
    this.clearBtn = document.getElementById("clear-custom-range");
    this.presetBtns = document.querySelectorAll(".preset-btn");

    // Note: init() is now called explicitly from the main app
  }

  /**
   * Initialize custom range manager
   */
  async init() {
    this.bindEvents();
    await this.loadCustomRange();
    this.updatePresetHighlights();
    
    // Ensure progress tracker is updated after initialization
    if (this.progressTracker && this.currentRange) {
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        this.progressTracker.updateCustomProgress();
      }, 100);
    }
  }

  /**
   * Bind event listeners
   */
  bindEvents() {
    // Date input changes
    this.startInput?.addEventListener("change", () => this.handleRangeChange());
    this.endInput?.addEventListener("change", () => this.handleRangeChange());

    // Clear button
    this.clearBtn?.addEventListener("click", () => this.clearRange());

    // Preset buttons
    this.presetBtns.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const preset = e.target.dataset.preset;
        this.applyPreset(preset);
      });
    });
  }

  /**
   * Handle range change
   */
  async handleRangeChange() {
    const startDate = this.startInput?.value;
    const endDate = this.endInput?.value;

    if (startDate && endDate) {
      this.currentRange = { startDate, endDate };
      await this.saveCustomRange();

      // Update progress tracker if available
      if (this.progressTracker) {
        this.progressTracker.updateCustomProgress();
      }
    }

    this.updatePresetHighlights();
  }

  /**
   * Clear custom range
   */
  async clearRange() {
    if (this.startInput) this.startInput.value = "";
    if (this.endInput) this.endInput.value = "";

    this.currentRange = null;
    await this.saveCustomRange();

    // Update progress tracker
    if (this.progressTracker) {
      this.progressTracker.updateCustomProgress();
    }

    this.updatePresetHighlights();
    this.showNotification("Custom range cleared", "info");
  }

  /**
   * Apply preset date range
   */
  async applyPreset(preset) {
    const now = new Date();
    let startDate, endDate;

    switch (preset) {
      case "this-quarter":
        const quarter = Math.floor(now.getMonth() / 3);
        startDate = new Date(now.getFullYear(), quarter * 3, 1);
        endDate = new Date(now.getFullYear(), quarter * 3 + 3, 0);
        break;

      case "this-semester":
        const semester = now.getMonth() < 6 ? 0 : 1;
        startDate = new Date(now.getFullYear(), semester * 6, 1);
        endDate = new Date(now.getFullYear(), semester * 6 + 6, 0);
        break;

      case "last-30-days":
        endDate = new Date(now);
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 30);
        break;

      case "next-30-days":
        startDate = new Date(now);
        endDate = new Date(now);
        endDate.setDate(endDate.getDate() + 30);
        break;

      case "this-year-remaining":
        startDate = new Date(now);
        endDate = new Date(now.getFullYear(), 11, 31);
        break;

      default:
        return;
    }

    // Format dates for input
    const startStr = startDate.toISOString().split("T")[0];
    const endStr = endDate.toISOString().split("T")[0];

    if (this.startInput) this.startInput.value = startStr;
    if (this.endInput) this.endInput.value = endStr;

    this.currentRange = { startDate: startStr, endDate: endStr, preset };
    await this.saveCustomRange();

    // Update progress tracker
    if (this.progressTracker) {
      this.progressTracker.updateCustomProgress();
    }

    this.updatePresetHighlights();
    this.showNotification(
      `Applied preset: ${this.getPresetLabel(preset)}`,
      "success"
    );
  }

  /**
   * Get preset label
   */
  getPresetLabel(preset) {
    const labels = {
      "this-quarter": "This Quarter",
      "this-semester": "This Semester",
      "last-30-days": "Last 30 Days",
      "next-30-days": "Next 30 Days",
      "this-year-remaining": "Year Remaining",
    };
    return labels[preset] || preset;
  }

  /**
   * Update preset button highlights
   */
  updatePresetHighlights() {
    this.presetBtns.forEach((btn) => {
      const preset = btn.dataset.preset;
      const isActive = this.currentRange?.preset === preset;
      btn.classList.toggle("active", isActive);
    });
  }

  /**
   * Load custom range from storage
   */
  async loadCustomRange() {
    try {
      let settings = null;

      if (this.authManager && this.authManager.isAuthenticated()) {
        // Load from GitHub Gist
        settings = await this.loadFromGist();
      } else {
        // Load from localStorage
        settings = this.loadFromLocalStorage();
      }

      if (settings && settings.customRange) {
        const { startDate, endDate, preset } = settings.customRange;

        if (this.startInput && startDate) this.startInput.value = startDate;
        if (this.endInput && endDate) this.endInput.value = endDate;

        this.currentRange = { startDate, endDate, preset };
        
        // Update progress tracker after loading saved range
        if (this.progressTracker) {
          this.progressTracker.updateCustomProgress();
        }
      }
    } catch (error) {
      console.error("Failed to load custom range:", error);
    }
  }

  /**
   * Save custom range to storage
   */
  async saveCustomRange() {
    try {
      const settings = {
        customRange: this.currentRange,
        lastUpdated: new Date().toISOString(),
      };

      if (this.authManager && this.authManager.isAuthenticated()) {
        // Save to GitHub Gist
        await this.saveToGist(settings);
      } else {
        // Save to localStorage
        this.saveToLocalStorage(settings);
      }
    } catch (error) {
      console.error("Failed to save custom range:", error);
      // Fallback to localStorage
      try {
        this.saveToLocalStorage({ customRange: this.currentRange });
      } catch (fallbackError) {
        console.error("Fallback save also failed:", fallbackError);
      }
    }
  }

  /**
   * Load from GitHub Gist
   */
  async loadFromGist() {
    const token = this.authManager.getCurrentToken();
    const gistId = await findOrCreateMilestoneGist(token);

    const response = await fetch(`https://api.github.com/gists/${gistId}`, {
      headers: { Authorization: `token ${token}` },
    });

    if (!response.ok) throw new Error("Failed to load from Gist");

    const gist = await response.json();
    const settingsFile = gist.files["yearprogress-settings.json"];

    if (settingsFile && settingsFile.content) {
      return JSON.parse(settingsFile.content);
    }

    return null;
  }

  /**
   * Save to GitHub Gist
   */
  async saveToGist(settings) {
    const token = this.authManager.getCurrentToken();
    const gistId = await findOrCreateMilestoneGist(token);

    // Get existing gist to preserve other files
    const getResponse = await fetch(`https://api.github.com/gists/${gistId}`, {
      headers: { Authorization: `token ${token}` },
    });

    if (!getResponse.ok) throw new Error("Failed to get existing Gist");

    const existingGist = await getResponse.json();
    const files = { ...existingGist.files };

    // Update settings file
    files["yearprogress-settings.json"] = {
      content: JSON.stringify(settings, null, 2),
    };

    const response = await fetch(`https://api.github.com/gists/${gistId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `token ${token}`,
      },
      body: JSON.stringify({ files }),
    });

    if (!response.ok) throw new Error("Failed to save to Gist");
  }

  /**
   * Load from localStorage
   */
  loadFromLocalStorage() {
    try {
      const stored = localStorage.getItem("yearify-settings");
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error("Failed to load from localStorage:", error);
      return null;
    }
  }

  /**
   * Save to localStorage
   */
  saveToLocalStorage(settings) {
    try {
      localStorage.setItem("yearify-settings", JSON.stringify(settings));
    } catch (error) {
      console.error("Failed to save to localStorage:", error);
    }
  }

  /**
   * Sync settings when auth state changes
   */
  async syncSettings() {
    if (this.authManager && this.authManager.isAuthenticated()) {
      try {
        // Check if we have local settings to migrate
        const localSettings = this.loadFromLocalStorage();
        if (localSettings && localSettings.customRange) {
          // Merge local settings with Gist settings
          const gistSettings = await this.loadFromGist();
          const mergedSettings = {
            ...gistSettings,
            customRange: localSettings.customRange, // Prefer local for custom range
            lastUpdated: new Date().toISOString(),
          };

          await this.saveToGist(mergedSettings);
          localStorage.removeItem("yearify-settings");
          this.showNotification("Settings synced successfully!", "success");
        } else {
          // Just load from Gist
          await this.loadCustomRange();
        }
      } catch (error) {
        console.error("Failed to sync settings:", error);
      }
    }
  }

  /**
   * Show notification
   */
  showNotification(message, type = "info") {
    const notification = document.createElement("div");
    notification.className = `notification notification-${type}`;
    notification.textContent = message;

    Object.assign(notification.style, {
      position: "fixed",
      top: "70px",
      right: "20px",
      padding: "12px 20px",
      borderRadius: "8px",
      color: "white",
      fontWeight: "500",
      zIndex: "10002",
      opacity: "0",
      transform: "translateY(-20px)",
      transition: "all 0.3s ease",
      maxWidth: "300px",
      wordWrap: "break-word",
    });

    const colors = {
      success: "#28a745",
      error: "#dc3545",
      info: "#17a2b8",
    };
    notification.style.backgroundColor = colors[type] || colors.info;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.opacity = "1";
      notification.style.transform = "translateY(0)";
    }, 100);

    setTimeout(() => {
      notification.style.opacity = "0";
      notification.style.transform = "translateY(-20px)";
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 3000);
  }

  /**
   * Get current range
   */
  getCurrentRange() {
    return this.currentRange;
  }

  /**
   * Set auth manager reference
   */
  setAuthManager(authManager) {
    this.authManager = authManager;
  }
}
