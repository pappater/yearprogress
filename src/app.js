/**
 * Yearify App - Main application entry point
 */
import { ThemeManager } from "./components/theme-manager.js";
import { ProgressTracker } from "./components/progress-tracker.js";
import { MilestoneManager } from "./components/milestone-manager.js";
import { UIControls } from "./components/ui-controls.js";
import { AuthManager } from "./components/auth-manager.js";
import { getDailyQuote } from "./data/quotes.js";

class YearifyApp {
  constructor() {
    this.loader = document.getElementById("loader-overlay");
    this.quoteElement = document.getElementById("daily-quote");

    this.init();
  }

  /**
   * Initialize application
   */
  async init() {
    try {
      this.showLoader();

      // Initialize core components
      this.themeManager = new ThemeManager();
      this.progressTracker = new ProgressTracker();
      this.authManager = new AuthManager();
      this.milestoneManager = new MilestoneManager(this.authManager);
      this.uiControls = new UIControls(this.progressTracker);

      // Setup auth state change listener for milestone sync
      this.setupAuthStateListener();

      // Setup additional features
      this.setupDailyQuote();
      this.setupErrorHandling();
      this.setupPerformanceMonitoring();

      // Hide loader
      this.hideLoader();

      console.log("Yearify app initialized successfully");
    } catch (error) {
      console.error("Failed to initialize Yearify app:", error);
      this.showError("Failed to initialize application");
    }
  }

  /**
   * Setup daily quote display
   */
  setupDailyQuote() {
    if (this.quoteElement) {
      const quote = getDailyQuote();
      this.quoteElement.textContent = quote;

      // Update quote daily
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(now.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);

      const msUntilTomorrow = tomorrow.getTime() - now.getTime();
      setTimeout(() => {
        this.quoteElement.textContent = getDailyQuote();
        // Set up daily interval
        setInterval(() => {
          this.quoteElement.textContent = getDailyQuote();
        }, 24 * 60 * 60 * 1000);
      }, msUntilTomorrow);
    }
  }

  /**
   * Setup global error handling
   */
  setupErrorHandling() {
    window.addEventListener("error", (event) => {
      console.error("Global error:", event.error);
      this.logError("Global Error", event.error);
    });

    window.addEventListener("unhandledrejection", (event) => {
      console.error("Unhandled promise rejection:", event.reason);
      this.logError("Unhandled Promise Rejection", event.reason);
    });
  }

  /**
   * Setup performance monitoring
   */
  setupPerformanceMonitoring() {
    if ("performance" in window) {
      window.addEventListener("load", () => {
        setTimeout(() => {
          const perfData = performance.getEntriesByType("navigation")[0];
          if (perfData) {
            console.log(
              `Page load time: ${
                perfData.loadEventEnd - perfData.loadEventStart
              }ms`
            );
          }
        }, 0);
      });
    }
  }

  /**
   * Show loading overlay
   */
  showLoader() {
    if (this.loader) {
      this.loader.style.display = "flex";
    }
  }

  /**
   * Hide loading overlay
   */
  hideLoader() {
    if (this.loader) {
      setTimeout(() => {
        this.loader.style.display = "none";
      }, 500); // Small delay for smooth transition
    }
  }

  /**
   * Show error message
   * @param {string} message - Error message
   */
  showError(message) {
    const errorDiv = document.createElement("div");
    errorDiv.className = "error-message";
    errorDiv.textContent = message;
    errorDiv.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: #ff7675;
      color: white;
      padding: 1rem 2rem;
      border-radius: 8px;
      z-index: 10003;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    `;

    document.body.appendChild(errorDiv);

    setTimeout(() => {
      if (errorDiv.parentNode) {
        errorDiv.parentNode.removeChild(errorDiv);
      }
    }, 5000);
  }

  /**
   * Setup authentication state change listener
   */
  setupAuthStateListener() {
    // Listen for successful login/logout to sync milestones
    const originalPersistAuth = this.authManager.persistAuthToStorage.bind(this.authManager);
    const originalClearAuth = this.authManager.clearAuthFromStorage.bind(this.authManager);

    this.authManager.persistAuthToStorage = (token, user) => {
      originalPersistAuth(token, user);
      // Sync milestones after login
      setTimeout(() => {
        this.milestoneManager.syncMilestones();
      }, 500);
    };

    this.authManager.clearAuthFromStorage = () => {
      originalClearAuth();
      // Reload milestones from localStorage after logout
      setTimeout(() => {
        this.milestoneManager.loadMilestones().then(() => {
          this.milestoneManager.updateMilestoneDisplay();
        });
      }, 100);
    };
  }

  /**
   * Log error for debugging
   * @param {string} type - Error type
   * @param {Error} error - Error object
   */
  logError(type, error) {
    const errorInfo = {
      type,
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    // In a real app, this would send to an error tracking service
    console.group(`🚨 ${type}`);
    console.error("Error Info:", errorInfo);
    console.groupEnd();
  }

  /**
   * Get app instance (for debugging)
   * @returns {YearifyApp} App instance
   */
  static getInstance() {
    return window.yearifyApp;
  }
}

// Initialize app when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  window.yearifyApp = new YearifyApp();
});

// Service Worker registration (if available)
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("./sw.js")
      .then((registration) => {
        console.log("SW registered: ", registration);
      })
      .catch((registrationError) => {
        console.log("SW registration failed: ", registrationError);
      });
  });
}

// Export for testing
export default YearifyApp;
