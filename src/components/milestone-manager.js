/**
 * Milestone Manager - Handles milestone creation and management
 */
export class MilestoneManager {
  constructor() {
    this.milestones = this.loadMilestones();
    this.addModal = document.getElementById("add-milestone-modal");
    this.addForm = document.getElementById("add-milestone-form");
    this.panel = document.getElementById("milestone-panel-overlay");
    this.panelContent = document.getElementById("milestone-panel-content");

    // Form elements
    this.dateInput = document.getElementById("modal-milestone-date");
    this.timeInput = document.getElementById("modal-milestone-time");
    this.labelInput = document.getElementById("modal-milestone-label");
    this.colorInput = document.getElementById("modal-milestone-color");
    this.iconInput = document.getElementById("modal-milestone-icon");

    // Control buttons
    this.showModalBtn = document.getElementById("show-add-milestone-modal");
    this.cancelModalBtn = document.getElementById("cancel-add-milestone");
    this.openPanelBtn = document.getElementById("open-milestone-panel");
    this.closePanelBtn = document.getElementById("close-milestone-panel");

    this.init();
  }

  /**
   * Initialize milestone manager
   */
  init() {
    this.bindEvents();
    this.setupEmojiSuggestions();
    this.updateMilestoneDisplay();
  }

  /**
   * Bind event listeners
   */
  bindEvents() {
    // Modal controls
    this.showModalBtn?.addEventListener("click", () => this.showAddModal());
    this.cancelModalBtn?.addEventListener("click", () => this.hideAddModal());
    this.addForm?.addEventListener("submit", (e) => this.handleAddMilestone(e));

    // Panel controls
    this.openPanelBtn?.addEventListener("click", () => this.showPanel());
    this.closePanelBtn?.addEventListener("click", () => this.hidePanel());

    // Close modals on overlay click
    this.addModal?.addEventListener("click", (e) => {
      if (e.target === this.addModal) this.hideAddModal();
    });

    this.panel?.addEventListener("click", (e) => {
      if (e.target === this.panel) this.hidePanel();
    });

    // Keyboard shortcuts
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        this.hideAddModal();
        this.hidePanel();
      }
    });
  }

  /**
   * Setup emoji suggestions
   */
  setupEmojiSuggestions() {
    const suggestions = document.querySelectorAll(".emoji-suggestion");
    suggestions.forEach((suggestion) => {
      suggestion.addEventListener("click", () => {
        if (this.iconInput) {
          this.iconInput.value = suggestion.textContent;
        }
      });
    });
  }

  /**
   * Show add milestone modal
   */
  showAddModal() {
    if (!this.addModal) return;

    this.resetForm();
    this.addModal.classList.add("show");
    this.dateInput?.focus();

    // Set default date to today
    if (this.dateInput && !this.dateInput.value) {
      this.dateInput.value = new Date().toISOString().split("T")[0];
    }
  }

  /**
   * Hide add milestone modal
   */
  hideAddModal() {
    if (!this.addModal) return;
    this.addModal.classList.remove("show");
  }

  /**
   * Show milestone panel
   */
  showPanel() {
    if (!this.panel) return;
    this.panel.classList.add("show");
    this.updatePanelContent();
  }

  /**
   * Hide milestone panel
   */
  hidePanel() {
    if (!this.panel) return;
    this.panel.classList.remove("show");
  }

  /**
   * Handle add milestone form submission
   * @param {Event} e - Form submit event
   */
  handleAddMilestone(e) {
    e.preventDefault();

    const formData = {
      date: this.dateInput?.value,
      time: this.timeInput?.value || "00:00",
      label: this.labelInput?.value || "",
      color: this.colorInput?.value || "#00cec9",
      icon: this.iconInput?.value || "🎯",
    };

    if (!formData.date) {
      this.showError("Please select a date");
      return;
    }

    const milestone = this.createMilestone(formData);
    this.milestones.push(milestone);
    this.saveMilestones();
    this.updateMilestoneDisplay();
    this.hideAddModal();

    this.showSuccess("Milestone added successfully!");
  }

  /**
   * Create milestone object
   * @param {Object} formData - Form data
   * @returns {Object} Milestone object
   */
  createMilestone(formData) {
    const dateTime = new Date(`${formData.date}T${formData.time}`);

    return {
      id: Date.now().toString(),
      dateTime: dateTime.toISOString(),
      label: formData.label,
      color: formData.color,
      icon: formData.icon,
      created: new Date().toISOString(),
    };
  }

  /**
   * Delete milestone
   * @param {string} id - Milestone ID
   */
  deleteMilestone(id) {
    this.milestones = this.milestones.filter((m) => m.id !== id);
    this.saveMilestones();
    this.updateMilestoneDisplay();
  }

  /**
   * Update milestone display in progress sections
   */
  updateMilestoneDisplay() {
    const types = ["year", "month", "week", "day"];

    types.forEach((type) => {
      const infoElement = document.getElementById(`milestone-info-${type}`);
      if (infoElement) {
        const milestones = this.getMilestonesForType(type);
        infoElement.innerHTML = this.formatMilestonesHtml(milestones);
      }
    });

    this.updatePanelContent();
  }

  /**
   * Get milestones for specific time period
   * @param {string} type - Time period type
   * @returns {Array} Filtered milestones
   */
  getMilestonesForType(type) {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    return this.milestones
      .filter((milestone) => {
        const milestoneDate = new Date(milestone.dateTime);

        switch (type) {
          case "year":
            return milestoneDate.getFullYear() === currentYear;
          case "month":
            return (
              milestoneDate.getFullYear() === currentYear &&
              milestoneDate.getMonth() === currentMonth
            );
          case "week":
            const weekStart = this.getWeekStart(now);
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekStart.getDate() + 6);
            return milestoneDate >= weekStart && milestoneDate <= weekEnd;
          case "day":
            return milestoneDate.toDateString() === now.toDateString();
          default:
            return false;
        }
      })
      .sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime));
  }

  /**
   * Get start of current week (Monday)
   * @param {Date} date - Reference date
   * @returns {Date} Week start date
   */
  getWeekStart(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  /**
   * Format milestones as HTML
   * @param {Array} milestones - Milestones to format
   * @returns {string} HTML string
   */
  formatMilestonesHtml(milestones) {
    if (milestones.length === 0) {
      return '<span class="no-milestones">No milestones</span>';
    }

    return milestones
      .map((milestone) => {
        const date = new Date(milestone.dateTime);
        const isPast = date < new Date();
        const dateStr = date.toLocaleDateString();
        const timeStr = date.toLocaleTimeString(undefined, {
          hour: "2-digit",
          minute: "2-digit",
        });

        return `
        <span class="milestone ${isPast ? "past" : "future"}" 
              style="color: ${milestone.color};">
          ${milestone.icon} ${milestone.label || "Milestone"} 
          <small>(${dateStr} ${timeStr})</small>
        </span>
      `;
      })
      .join("");
  }

  /**
   * Update panel content
   */
  updatePanelContent() {
    if (!this.panelContent) return;

    if (this.milestones.length === 0) {
      this.panelContent.innerHTML = `
        <div class="empty-state">
          <p>No milestones created yet.</p>
          <p>Click the + button to add your first milestone!</p>
        </div>
      `;
      return;
    }

    const sortedMilestones = [...this.milestones].sort(
      (a, b) => new Date(a.dateTime) - new Date(b.dateTime)
    );

    this.panelContent.innerHTML = `
      <div class="milestone-list">
        ${sortedMilestones
          .map((milestone) => this.renderMilestoneItem(milestone))
          .join("")}
      </div>
    `;

    // Bind delete buttons
    this.panelContent.querySelectorAll(".delete-milestone").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const id = e.target.dataset.id;
        if (confirm("Are you sure you want to delete this milestone?")) {
          this.deleteMilestone(id);
        }
      });
    });
  }

  /**
   * Render milestone item for panel
   * @param {Object} milestone - Milestone object
   * @returns {string} HTML string
   */
  renderMilestoneItem(milestone) {
    const date = new Date(milestone.dateTime);
    const isPast = date < new Date();
    const dateStr = date.toLocaleDateString();
    const timeStr = date.toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
    });

    return `
      <div class="milestone-item ${isPast ? "past" : "future"}">
        <div class="milestone-header">
          <span class="milestone-icon" style="color: ${milestone.color};">
            ${milestone.icon}
          </span>
          <span class="milestone-label">
            ${milestone.label || "Milestone"}
          </span>
          <button class="delete-milestone" data-id="${
            milestone.id
          }" title="Delete milestone">
            ×
          </button>
        </div>
        <div class="milestone-datetime">
          ${dateStr} at ${timeStr}
        </div>
        <div class="milestone-status ${isPast ? "completed" : "upcoming"}">
          ${isPast ? "✓ Completed" : "⏳ Upcoming"}
        </div>
      </div>
    `;
  }

  /**
   * Reset form fields
   */
  resetForm() {
    if (this.addForm) {
      this.addForm.reset();
      if (this.colorInput) this.colorInput.value = "#00cec9";
    }
  }

  /**
   * Load milestones from localStorage
   * @returns {Array} Milestones array
   */
  loadMilestones() {
    try {
      const stored = localStorage.getItem("yearify-milestones");
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error("Failed to load milestones:", error);
      return [];
    }
  }

  /**
   * Save milestones to localStorage
   */
  saveMilestones() {
    try {
      localStorage.setItem(
        "yearify-milestones",
        JSON.stringify(this.milestones)
      );
    } catch (error) {
      console.error("Failed to save milestones:", error);
    }
  }

  /**
   * Show success message
   * @param {string} message - Success message
   */
  showSuccess(message) {
    // This should be connected to a notification system
    console.log("Success:", message);
  }

  /**
   * Show error message
   * @param {string} message - Error message
   */
  showError(message) {
    // This should be connected to a notification system
    console.error("Error:", message);
  }
}
