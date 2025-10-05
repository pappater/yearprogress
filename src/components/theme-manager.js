/**
 * Theme Manager - Handles dark/light theme switching
 */
export class ThemeManager {
  constructor() {
    this.themeToggle = document.getElementById("theme-toggle");
    this.themeIcon = document.getElementById("theme-icon");
    this.themeTooltip = document.getElementById("theme-tooltip");
    this.currentTheme = this.getStoredTheme() || this.getSystemTheme();

    this.init();
  }

  /**
   * Initialize theme manager
   */
  init() {
    this.applyTheme(this.currentTheme);
    this.bindEvents();
    this.initTooltips();
  }

  /**
   * Bind event listeners
   */
  bindEvents() {
    this.themeToggle?.addEventListener("click", () => this.toggleTheme());

    // Listen for system theme changes
    if (window.matchMedia) {
      window
        .matchMedia("(prefers-color-scheme: dark)")
        .addEventListener("change", (e) => {
          if (!this.getStoredTheme()) {
            this.applyTheme(e.matches ? "dark" : "light");
          }
        });
    }
  }

  /**
   * Toggle between dark and light themes
   */
  toggleTheme() {
    this.currentTheme = this.currentTheme === "dark" ? "light" : "dark";
    this.applyTheme(this.currentTheme);
    this.storeTheme(this.currentTheme);
  }

  /**
   * Apply theme to document
   * @param {string} theme - 'dark' or 'light'
   */
  applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    this.updateIcon(theme);
    this.updateTooltip(theme);
    this.currentTheme = theme;

    // Dispatch theme change event
    window.dispatchEvent(
      new CustomEvent("themechange", {
        detail: { theme },
      })
    );
  }

  /**
   * Update theme toggle icon
   * @param {string} theme - Current theme
   */
  updateIcon(theme) {
    if (!this.themeIcon) return;

    const sunIcon = `
      <circle cx="12" cy="12" r="5"></circle>
      <line x1="12" y1="1" x2="12" y2="3"></line>
      <line x1="12" y1="21" x2="12" y2="23"></line>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
      <line x1="1" y1="12" x2="3" y2="12"></line>
      <line x1="21" y1="12" x2="23" y2="12"></line>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
    `;

    const moonIcon = `
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
    `;

    this.themeIcon.innerHTML = theme === "dark" ? sunIcon : moonIcon;
  }

  /**
   * Update tooltip text
   * @param {string} theme - Current theme
   */
  updateTooltip(theme) {
    if (!this.themeTooltip) return;
    this.themeTooltip.textContent =
      theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode";
  }

  /**
   * Initialize tooltip functionality
   */
  initTooltips() {
    document.querySelectorAll(".tooltip").forEach((tooltip) => {
      const parent = tooltip.parentElement;
      if (!parent) return;

      parent.addEventListener("mouseenter", () => {
        tooltip.style.visibility = "visible";
        tooltip.style.opacity = "1";
      });

      parent.addEventListener("mouseleave", () => {
        tooltip.style.visibility = "hidden";
        tooltip.style.opacity = "0";
      });
    });
  }

  /**
   * Get stored theme from localStorage
   * @returns {string|null} Stored theme or null
   */
  getStoredTheme() {
    try {
      return localStorage.getItem("yearify-theme");
    } catch (e) {
      console.warn("Could not access localStorage for theme:", e);
      return null;
    }
  }

  /**
   * Store theme in localStorage
   * @param {string} theme - Theme to store
   */
  storeTheme(theme) {
    try {
      localStorage.setItem("yearify-theme", theme);
    } catch (e) {
      console.warn("Could not store theme in localStorage:", e);
    }
  }

  /**
   * Get system theme preference
   * @returns {string} 'dark' or 'light'
   */
  getSystemTheme() {
    if (
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    ) {
      return "dark";
    }
    return "light";
  }

  /**
   * Get current theme
   * @returns {string} Current theme
   */
  getCurrentTheme() {
    return this.currentTheme;
  }
}
