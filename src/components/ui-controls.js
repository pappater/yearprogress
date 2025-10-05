/**
 * UI Controls - Manages UI interactions and controls
 */
export class UIControls {
  constructor(progressTracker) {
    this.progressTracker = progressTracker;
    this.hamburgerBtn = document.getElementById("hamburger-menu-btn");
    this.hamburgerDropdown = document.getElementById("hamburger-menu-dropdown");
    this.copyProgressBtn = document.getElementById("copy-progress");
    this.shareImageBtn = document.getElementById("share-image");
    this.downloadImageBtn = document.getElementById("download-image");

    this.init();
  }

  /**
   * Initialize UI controls
   */
  init() {
    this.bindEvents();
    this.setupDropdown();
  }

  /**
   * Bind event listeners
   */
  bindEvents() {
    // Hamburger menu
    this.hamburgerBtn?.addEventListener("click", (e) => {
      e.stopPropagation();
      this.toggleDropdown();
    });

    // Close dropdown when clicking outside
    document.addEventListener("click", (e) => {
      if (
        !this.hamburgerDropdown?.contains(e.target) &&
        !this.hamburgerBtn?.contains(e.target)
      ) {
        this.closeDropdown();
      }
    });

    // Menu actions
    this.copyProgressBtn?.addEventListener("click", () => {
      this.copyProgress();
      this.closeDropdown();
    });

    this.shareImageBtn?.addEventListener("click", () => {
      this.shareAsImage();
      this.closeDropdown();
    });

    this.downloadImageBtn?.addEventListener("click", () => {
      this.downloadImage();
      this.closeDropdown();
    });

    // Keyboard navigation
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        this.closeDropdown();
      }
    });
  }

  /**
   * Setup dropdown functionality
   */
  setupDropdown() {
    if (!this.hamburgerDropdown) return;

    // Add ARIA attributes
    this.hamburgerBtn?.setAttribute("aria-haspopup", "true");
    this.hamburgerBtn?.setAttribute("aria-expanded", "false");
    this.hamburgerDropdown.setAttribute("role", "menu");

    // Add keyboard navigation to dropdown items
    const dropdownItems =
      this.hamburgerDropdown.querySelectorAll(".dropdown-item");
    dropdownItems.forEach((item, index) => {
      item.setAttribute("role", "menuitem");
      item.setAttribute("tabindex", "-1");

      item.addEventListener("keydown", (e) => {
        this.handleDropdownKeydown(e, dropdownItems, index);
      });
    });
  }

  /**
   * Handle keyboard navigation in dropdown
   * @param {KeyboardEvent} e - Keyboard event
   * @param {NodeList} items - Dropdown items
   * @param {number} currentIndex - Current item index
   */
  handleDropdownKeydown(e, items, currentIndex) {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        const nextIndex = (currentIndex + 1) % items.length;
        items[nextIndex].focus();
        break;
      case "ArrowUp":
        e.preventDefault();
        const prevIndex = (currentIndex - 1 + items.length) % items.length;
        items[prevIndex].focus();
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        items[currentIndex].click();
        break;
      case "Escape":
        e.preventDefault();
        this.closeDropdown();
        this.hamburgerBtn?.focus();
        break;
    }
  }

  /**
   * Toggle dropdown menu
   */
  toggleDropdown() {
    if (!this.hamburgerDropdown) return;

    const isOpen = this.hamburgerDropdown.classList.contains("show");
    if (isOpen) {
      this.closeDropdown();
    } else {
      this.openDropdown();
    }
  }

  /**
   * Open dropdown menu
   */
  openDropdown() {
    if (!this.hamburgerDropdown) return;

    this.hamburgerDropdown.classList.add("show");
    this.hamburgerBtn?.setAttribute("aria-expanded", "true");

    // Focus first item
    const firstItem = this.hamburgerDropdown.querySelector(".dropdown-item");
    if (firstItem) {
      setTimeout(() => firstItem.focus(), 100);
    }
  }

  /**
   * Close dropdown menu
   */
  closeDropdown() {
    if (!this.hamburgerDropdown) return;

    this.hamburgerDropdown.classList.remove("show");
    this.hamburgerBtn?.setAttribute("aria-expanded", "false");
  }

  /**
   * Copy progress to clipboard
   */
  async copyProgress() {
    try {
      const progressData = this.progressTracker.getProgressData();
      const text = this.formatProgressForSharing(progressData);

      await navigator.clipboard.writeText(text);
      this.showNotification("Progress copied to clipboard!", "success");
    } catch (error) {
      console.error("Failed to copy progress:", error);
      this.showNotification("Failed to copy progress", "error");
    }
  }

  /**
   * Share as image
   */
  async shareAsImage() {
    if (!navigator.share) {
      this.downloadImage();
      return;
    }

    try {
      const canvas = await this.captureContainer();
      const blob = await this.canvasToBlob(canvas);

      const file = new File([blob], "yearify-progress.png", {
        type: "image/png",
      });

      await navigator.share({
        title: "My Year Progress - Yearify",
        text: "Check out my progress tracking with Yearify!",
        files: [file],
      });
    } catch (error) {
      console.error("Failed to share image:", error);
      this.showNotification("Failed to share image", "error");
      this.downloadImage(); // Fallback to download
    }
  }

  /**
   * Download image
   */
  async downloadImage() {
    try {
      this.showNotification("Generating image...", "info");

      const canvas = await this.captureContainer();
      const link = document.createElement("a");
      link.download = `yearify-progress-${
        new Date().toISOString().split("T")[0]
      }.png`;
      link.href = canvas.toDataURL();
      link.click();

      this.showNotification("Image downloaded!", "success");
    } catch (error) {
      console.error("Failed to download image:", error);
      this.showNotification("Failed to download image", "error");
    }
  }

  /**
   * Capture container as canvas
   * @returns {Promise<HTMLCanvasElement>} Canvas element
   */
  async captureContainer() {
    const container = document.querySelector(".container");
    if (!container) {
      throw new Error("Container not found");
    }

    // Temporarily hide user bar and header actions for cleaner image
    const userBar = document.getElementById("user-bar");
    const headerActions = document.querySelector(".header-actions");

    const userBarDisplay = userBar?.style.display;
    const headerActionsDisplay = headerActions?.style.display;

    if (userBar) userBar.style.display = "none";
    if (headerActions) headerActions.style.display = "none";

    try {
      const canvas = await html2canvas(container, {
        backgroundColor: null,
        scale: 2,
        logging: false,
        useCORS: true,
      });

      return canvas;
    } finally {
      // Restore visibility
      if (userBar) userBar.style.display = userBarDisplay || "";
      if (headerActions)
        headerActions.style.display = headerActionsDisplay || "";
    }
  }

  /**
   * Convert canvas to blob
   * @param {HTMLCanvasElement} canvas - Canvas element
   * @returns {Promise<Blob>} Canvas as blob
   */
  canvasToBlob(canvas) {
    return new Promise((resolve) => {
      canvas.toBlob(resolve, "image/png", 1.0);
    });
  }

  /**
   * Format progress data for sharing
   * @param {Object} progressData - Progress data
   * @returns {string} Formatted text
   */
  formatProgressForSharing(progressData) {
    const date = new Date().toLocaleDateString();
    return `🗓️ My Progress Update - ${date}

📅 Year: ${progressData.year.percentage.toFixed(1)}%
🗓️ Month: ${progressData.month.percentage.toFixed(1)}%
📆 Week: ${progressData.week.percentage.toFixed(1)}%
⏰ Day: ${progressData.day.percentage.toFixed(1)}%

Track your progress at: https://your-domain.com
#Yearify #ProgressTracking #ProductivityTools`;
  }

  /**
   * Show notification
   * @param {string} message - Notification message
   * @param {string} type - Notification type (success, error, info)
   */
  showNotification(message, type = "info") {
    // Create notification element
    const notification = document.createElement("div");
    notification.className = `notification notification-${type}`;
    notification.textContent = message;

    // Add styles
    Object.assign(notification.style, {
      position: "fixed",
      top: "20px",
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

    // Set background color based on type
    const colors = {
      success: "#28a745",
      error: "#dc3545",
      info: "#17a2b8",
    };
    notification.style.backgroundColor = colors[type] || colors.info;

    // Add to document
    document.body.appendChild(notification);

    // Animate in
    setTimeout(() => {
      notification.style.opacity = "1";
      notification.style.transform = "translateY(0)";
    }, 100);

    // Remove after 3 seconds
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
}
