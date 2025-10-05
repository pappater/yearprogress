import { getAuthConfig } from "../config/auth-config.js";

/**
 * Auth Manager - Handles GitHub authentication and user management
 */
export class AuthManager {
  constructor() {
    this.githubUser = null;
    this.githubToken = null;
    this.config = getAuthConfig();
    this.backendUrl = this.getBackendUrl();

    // DOM elements
    this.loginBtn = document.getElementById("login-github");
    this.logoutBtn = document.getElementById("logout-github");
    this.userInfo = document.getElementById("user-info");

    this.init();
  }

  /**
   * Initialize authentication manager
   */
  init() {
    this.restoreAuthFromStorage();
    this.bindEvents();
    this.handleOAuthCallback();
    this.updateUI();
  }

  /**
   * Get backend URL based on environment
   * @returns {string} Backend URL
   */
  getBackendUrl() {
    return this.config.backendUrl;
  }

  /**
   * Get redirect URI based on environment
   * @returns {string} Redirect URI
   */
  getRedirectUri() {
    return this.config.redirectUri;
  }

  /**
   * Bind event listeners
   */
  bindEvents() {
    this.loginBtn?.addEventListener("click", () => this.initiateGitHubLogin());
    this.logoutBtn?.addEventListener("click", () => this.logout());
  }

  /**
   * Restore authentication from localStorage
   */
  restoreAuthFromStorage() {
    this.githubToken = localStorage.getItem("githubToken");
    const userStr = localStorage.getItem("githubUser");

    if (this.githubToken && userStr) {
      try {
        this.githubUser = JSON.parse(userStr);
        console.log("Restored GitHub authentication:", this.githubUser.login);
      } catch (error) {
        console.error("Failed to parse stored user data:", error);
        this.clearAuthFromStorage();
      }
    }
  }

  /**
   * Persist authentication to localStorage
   * @param {string} token - GitHub access token
   * @param {Object} user - GitHub user object
   */
  persistAuthToStorage(token, user) {
    localStorage.setItem("githubToken", token);
    localStorage.setItem("githubUser", JSON.stringify(user));
    this.githubToken = token;
    this.githubUser = user;
  }

  /**
   * Clear authentication from localStorage
   */
  clearAuthFromStorage() {
    localStorage.removeItem("githubToken");
    localStorage.removeItem("githubUser");
    this.githubToken = null;
    this.githubUser = null;

    // Clear gist ID if it exists
    localStorage.removeItem("gistId");
  }

  /**
   * Initiate GitHub OAuth login
   */
  initiateGitHubLogin() {
    const clientId = this.config.clientId;
    // Use specific redirect URIs that match your GitHub OAuth app configuration
    const redirectUri = this.getRedirectUri();
    const scope = "gist"; // Required for creating/updating gists
    const state = this.generateRandomState();

    // Store state for validation
    sessionStorage.setItem("oauth_state", state);

    const authUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&scope=${scope}&state=${state}`;

    // Debug logging
    console.log("GitHub OAuth Login:");
    console.log("Client ID:", clientId);
    console.log("Redirect URI:", redirectUri);
    console.log("Current URL:", window.location.href);
    console.log("Auth URL:", authUrl);

    window.location.href = authUrl;
  }

  /**
   * Generate random state for OAuth security
   * @returns {string} Random state string
   */
  generateRandomState() {
    return (
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15)
    );
  }

  /**
   * Handle OAuth callback
   */
  async handleOAuthCallback() {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");
    const state = urlParams.get("state");
    const error = urlParams.get("error");

    if (error) {
      console.error("OAuth error:", error);
      this.showNotification("GitHub login failed: " + error, "error");
      return;
    }

    if (code && state) {
      // Validate state
      const storedState = sessionStorage.getItem("oauth_state");
      if (state !== storedState) {
        console.error("OAuth state mismatch");
        this.showNotification(
          "Login failed: Security validation error",
          "error"
        );
        return;
      }

      try {
        await this.exchangeCodeForToken(code);

        // Clean up URL
        const cleanUrl =
          window.location.protocol +
          "//" +
          window.location.host +
          window.location.pathname;
        window.history.replaceState({}, document.title, cleanUrl);

        // Clean up session storage
        sessionStorage.removeItem("oauth_state");

        this.showNotification("Successfully logged in to GitHub!", "success");
        this.updateUI();
      } catch (error) {
        console.error("OAuth token exchange failed:", error);
        this.showNotification("Login failed: " + error.message, "error");
      }
    }
  }

  /**
   * Exchange authorization code for access token
   * @param {string} code - Authorization code
   */
  async exchangeCodeForToken(code) {
    // Try primary backend (local or production)
    try {
      const response = await fetch(`${this.backendUrl}/auth/github/callback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });

      if (response.ok) {
        const data = await response.json();
        await this.handleSuccessfulAuth(data.access_token);
        return;
      }
    } catch (error) {
      console.warn(`Primary backend (${this.backendUrl}) failed:`, error);
    }

    // If local backend failed and we're running locally, try production backend
    if (this.backendUrl.includes("localhost")) {
      try {
        console.log("Falling back to production backend...");
        const response = await fetch(
          `https://yearprogress-4s7k.onrender.com/auth/github/callback`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          await this.handleSuccessfulAuth(data.access_token);
          return;
        }
      } catch (error) {
        console.warn("Production backend also failed:", error);
      }
    }

    throw new Error("All backend authentication methods failed");
  }

  /**
   * Client-side token exchange (fallback method)
   * @param {string} code - Authorization code
   */
  async clientSideTokenExchange(code) {
    // Note: This is less secure and should only be used for development/demo
    // In production, always use a backend server for token exchange
    const clientId = this.config.clientId;
    const clientSecret = "your-client-secret"; // This should be on the backend!

    const response = await fetch(
      "https://github.com/login/oauth/access_token",
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          client_id: clientId,
          client_secret: clientSecret,
          code: code,
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to exchange code for token");
    }

    const data = await response.json();
    if (data.error) {
      throw new Error(data.error_description || data.error);
    }

    await this.handleSuccessfulAuth(data.access_token);
  }

  /**
   * Handle successful authentication
   * @param {string} token - Access token
   */
  async handleSuccessfulAuth(token) {
    const user = await this.fetchGitHubUser(token);
    this.persistAuthToStorage(token, user);
    this.updateUI();
  }

  /**
   * Fetch GitHub user information
   * @param {string} token - Access token
   * @returns {Promise<Object>} User object
   */
  async fetchGitHubUser(token) {
    const response = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github.v3+json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch user information");
    }

    return await response.json();
  }

  /**
   * Logout user
   */
  logout() {
    this.clearAuthFromStorage();
    this.updateUI();
    this.showNotification("Logged out successfully", "info");
  }

  /**
   * Update UI based on authentication state
   */
  updateUI() {
    if (this.githubUser) {
      // User is logged in
      if (this.userInfo) {
        this.userInfo.textContent = `Logged in as ${this.githubUser.login}`;
        this.userInfo.style.display = "";
      }
      if (this.loginBtn) this.loginBtn.style.display = "none";
      if (this.logoutBtn) this.logoutBtn.style.display = "";
    } else {
      // User is not logged in
      if (this.userInfo) {
        this.userInfo.textContent = "";
        this.userInfo.style.display = "none";
      }
      if (this.loginBtn) this.loginBtn.style.display = "";
      if (this.logoutBtn) this.logoutBtn.style.display = "none";
    }
  }

  /**
   * Get current user
   * @returns {Object|null} Current GitHub user
   */
  getCurrentUser() {
    return this.githubUser;
  }

  /**
   * Get current token
   * @returns {string|null} Current access token
   */
  getCurrentToken() {
    return this.githubToken;
  }

  /**
   * Check if user is authenticated
   * @returns {boolean} True if authenticated
   */
  isAuthenticated() {
    return !!(this.githubToken && this.githubUser);
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

    // Remove after 5 seconds
    setTimeout(() => {
      notification.style.opacity = "0";
      notification.style.transform = "translateY(-20px)";
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 5000);
  }
}
